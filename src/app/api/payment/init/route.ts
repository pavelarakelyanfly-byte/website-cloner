import { paymentProvider } from "@/lib/payments";
import { isInitPaymentInput } from "@/lib/payments/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Некорректный JSON запроса." }, { status: 400 });
  }
  if (!isInitPaymentInput(payload)) {
    return Response.json({ error: "Проверьте сумму, номер заказа и данные чека. Сумма должна совпадать с итогом позиций." }, { status: 400 });
  }
  try {
    const payment = await paymentProvider.initPayment(payload.amount, payload.orderId, payload.receipt);
    return Response.json(payment, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[payments] init failed", error);
    return Response.json({ error: "Не удалось начать оплату. Попробуйте ещё раз." }, { status: 500 });
  }
}
