import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from '../../.tools/browser/node_modules/playwright-core/index.mjs';
const base = process.env.CHECKOUT_BASE_URL ?? 'http://localhost:3000';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const output = 'docs/research/payments';
  await fs.mkdir(output, { recursive: true });
  const views = [];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const response = await page.goto(base + '/checkout', { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    const info = await page.evaluate(() => ({ width: innerWidth, contentWidth: document.documentElement.scrollWidth, fontLoaded: document.fonts.check('20px Oswald') }));
    assert.equal(info.contentWidth, width);
    assert.equal(info.fontLoaded, true);
    views.push(info);
    await page.screenshot({ path: output + '/checkout-' + width + '.png', fullPage: true });
  }
  let requests = 0;
  page.on('request', request => { if (request.url().endsWith('/api/payment/init')) requests++; });
  await page.getByRole('button', { name: 'Оплатить', exact: true }).click();
  assert.equal(requests, 0, 'Empty email must fail browser validation');
  await page.getByLabel('Электронная почта', { exact: true }).fill('checkout-test@example.com');
  let releaseError;
  const errorGate = new Promise(resolve => { releaseError = resolve; });
  await page.route('**/api/payment/init', async route => {
    await errorGate;
    await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Тестовая ошибка сервиса' }) });
  });
  await page.getByRole('button', { name: 'Оплатить', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Переходим к оплате…', exact: true }).isDisabled(), true);
  releaseError();
  await page.locator('.checkout-error').waitFor();
  assert.equal(await page.locator('.checkout-error').innerText(), 'Тестовая ошибка сервиса');
  assert.equal(await page.getByRole('button', { name: 'Оплатить', exact: true }).isEnabled(), true);
  await page.screenshot({ path: output + '/checkout-error-mobile.png', fullPage: true });
  await page.unroute('**/api/payment/init');
  await page.getByRole('button', { name: 'Оплатить', exact: true }).click();
  await page.waitForURL('**/payment/success?mock=true&paymentId=mock_*');
  assert.match(await page.locator('main').innerText(), /Деньги не списывались/);
  assert.equal(requests, 2);
  await page.screenshot({ path: output + '/success-mobile.png', fullPage: true });
  for (const body of ['{', JSON.stringify({ amount: -1, orderId: 'bad', receipt: {} }), JSON.stringify({ amount: 100, orderId: 'bad', receipt: { email: 'test@example.com', items: [{ name: 'Ticket', price: 200, quantity: 1 }] } })]) {
    const response = await page.request.post(base + '/api/payment/init', { data: body, headers: { 'Content-Type': 'application/json' } });
    assert.equal(response.status(), 400);
  }
  const started = Date.now();
  const valid = await page.request.post(base + '/api/payment/init', { data: { amount: 150000, orderId: 'api-smoke-test', receipt: { email: 'api-test@example.com', items: [{ name: 'Билет', price: 150000, quantity: 1 }] } } });
  assert.equal(valid.status(), 200);
  const result = await valid.json();
  assert.match(result.paymentId, /^mock_/);
  assert.match(result.paymentUrl, /^\/payment\/success\?mock=true/);
  const responseMs = Date.now() - started;
  assert.ok(responseMs < 1800, 'API should return before the delayed webhook');
  assert.equal((await page.request.get(base + '/api/payment/init')).status(), 405);
  for (const route of ['/', '/plays', '/contacts']) assert.equal((await page.request.get(base + route)).status(), 200);
  await new Promise(resolve => setTimeout(resolve, 2200));
  assert.deepEqual(errors, []);
  const report = { views, errors, responseMs, checks: ['native email validation', 'pending button disabled', 'API error and retry', 'successful redirect', 'invalid JSON and input: 400', 'receipt total mismatch: 400', 'valid API: 200', 'GET: 405', 'existing routes: 200'] };
  await fs.writeFile(output + '/verification.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally { await browser.close(); }



