# Тестовая оплата

Страница `/checkout` использует общие `Header`, `Footer`, шрифт Oswald, цвета и кнопку `.pill`. Данные демонстрационного заказа находятся в `content/checkout.json` (поле `order`, импорт через `src/lib/payments/demo-order.ts`): 1 билет, 1500 рублей. В форме указывается email для тестового чека.

Поток: `/checkout` → `POST /api/payment/init` → `MockPaymentProvider.initPayment` → переход по `paymentUrl` на `/payment/success?mock=true&paymentId=mock_...`.

## Контракт провайдера

`src/lib/payments/types.ts` содержит интерфейс `PaymentProvider`:

```ts
initPayment(amount: number, orderId: string, receipt: PaymentReceipt): Promise<PaymentResult>;
handleWebhook(payload: unknown): Promise<WebhookResult>;
```

`amount` и `receipt.items[].price` передаются в целых копейках. `quantity` — положительное целое число. Чек содержит email и непустой массив позиций. Сервер проверяет типы, диапазон безопасного целого, email, номер заказа и совпадение общей суммы с суммой позиций. Неверный JSON и данные возвращают HTTP 400; ошибка провайдера — HTTP 500.

Пример запроса:

```json
{
  "amount": 150000,
  "orderId": "demo-order-1",
  "receipt": {
    "email": "test@example.com",
    "items": [{ "name": "Билет в театр", "price": 150000, "quantity": 1 }]
  }
}
```

Успешный ответ:

```json
{
  "paymentId": "mock_уникальный-идентификатор",
  "paymentUrl": "/payment/success?mock=true&paymentId=mock_уникальный-идентификатор"
}
```

## Эмуляция вебхука

`MockPaymentProvider` логирует входящие параметры на сервере и создаёт уникальный ID. Отложенная задача ждёт 2000 мс и вызывает `handleWebhook` с `status: "succeeded"`, `paymentId`, `orderId` и суммой. Обработчик проверяет payload, логирует результат и возвращает его с `processedAt`.

В API планировщик подключён через Next.js `after()`: ответ отправляется сразу, имитация вебхука выполняется после ответа. Вне Next.js класс можно использовать напрямую — задача запускается асинхронно без блокировки `initPayment`.

Это внутренний вызов обработчика, без исходящего HTTP-запроса или настоящего банковского уведомления. Входящие HTTP-уведомления принимает отдельная заглушка `POST /api/payment/webhook`: она логирует данные и отвечает `200 OK` с текстовым телом `OK`. Пока она не проверяет подпись и не изменяет статусы платежей. Постоянного хранилища заказов и платежей пока нет. Страница успеха демонстрационная и сама по себе не подтверждает статус платежа.

## Последующая замена

Единственная точка выбора провайдера — `src/lib/payments/index.ts`. Создайте реализацию того же интерфейса и замените привязку `paymentProvider`; форма и контракт API остаются прежними. Данные реального заказа и его сумму нужно будет получать из серверного хранилища вместо демонстрационных данных запроса. SDK T-Bank не установлен, сетевые вызовы к банку отсутствуют.

## Проверки

- `npm.cmd run check` — ESLint, TypeScript, производственная сборка.
- `node scripts/test-payments.mjs` — проверка суммы и чека, уникальных ID, быстрого ответа и успешного вебхука после двух секунд.
- `node scripts/verify-checkout.mjs` — проверка работающего сайта на `http://localhost:3000` через Chrome: десктоп и телефон, валидация email, состояние ожидания, ошибка API и повторная попытка, реальный переход на страницу успеха, HTTP 400/405 и основные существующие маршруты. Скрипт использует ранее подготовленный Playwright в `.tools/browser` рядом с проектом.

Снимки и отчёт браузерной проверки: `docs/research/payments/`.



## Адрес HTTP-вебхука на Vercel

После публикации версии с этим API-роутом откройте проект в Vercel → Settings → Domains и скопируйте основной production-домен. Добавьте к нему путь `/api/payment/webhook`:

```text
https://ваш-проект.vercel.app/api/payment/webhook
```

Это пример: реальный домен может отличаться. С пользовательским доменом путь остаётся тем же. Для постоянного адреса используйте production-домен, а не URL отдельного preview-деплоя. Адрес должен быть доступен банку без входа в Vercel.

Укажите полный HTTPS-адрес в настройках HTTP(S)-уведомлений терминала Т-Банка (`NotificationURL`). При последующей интеграции тот же адрес можно записать в `TBANK_WEBHOOK_URL`. Само добавление переменной пока не подключает банковский API.

Открытие адреса в браузере выполняет GET и вернёт 405: заглушка принимает только POST. Пример локальной проверки:

```powershell
Invoke-WebRequest -Uri 'http://localhost:3000/api/payment/webhook' -Method POST -ContentType 'application/json' -Body '{"OrderId":"test-1","Status":"CONFIRMED"}' -UseBasicParsing
```

Ожидается статус 200 и тело `OK`; данные появятся в серверной консоли. На этом этапе обработчик подтверждает получение запроса, но не подтверждает оплату заказа.

Справка: https://vercel.com/docs/domains/working-with-domains и https://developer.tbank.ru/eacq/intro/developer/notification
