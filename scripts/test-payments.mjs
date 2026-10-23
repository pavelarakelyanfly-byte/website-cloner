import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// Compile only the framework-independent provider into an isolated temp directory.
const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'theatre-payment-test-'));
try {
  for (const name of ['types', 'validation', 'mock-provider']) {
    const source = await fs.readFile('src/lib/payments/' + name + '.ts', 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
    await fs.writeFile(path.join(dir, name + '.mjs'), compiled.replace(/from "\.\/(types|validation)"/g, 'from "./$1.mjs"'));
  }
  const { MockPaymentProvider } = await import(pathToFileURL(path.join(dir, 'mock-provider.mjs')).href);
  const { isInitPaymentInput } = await import(pathToFileURL(path.join(dir, 'validation.mjs')).href);
  const receipt = { email: 'test@example.com', items: [{ name: 'Билет', price: 75000, quantity: 2 }] };
  const input = { amount: 150000, orderId: 'test-order-1', receipt };
  assert.equal(isInitPaymentInput(input), true);
  for (const invalid of [null, {}, { ...input, amount: -1 }, { ...input, amount: 1500.5 }, { ...input, amount: 1 }, { ...input, orderId: ' ' }, { ...input, receipt: { ...receipt, email: 'invalid' } }, { ...input, receipt: { ...receipt, items: [] } }, { ...input, receipt: { ...receipt, items: [{ name: 'Билет', price: 150000, quantity: 0 }] } }]) {
    assert.equal(isInitPaymentInput(invalid), false);
  }
  const jobs = [];
  const provider = new MockPaymentProvider(job => jobs.push(job));
  const received = [];
  const handleWebhook = provider.handleWebhook.bind(provider);
  provider.handleWebhook = async payload => { received.push(payload); return handleWebhook(payload); };
  const started = Date.now();
  const payment = await provider.initPayment(input.amount, input.orderId, input.receipt);
  assert.ok(Date.now() - started < 1000, 'initPayment must not wait for the webhook');
  assert.match(payment.paymentId, /^mock_/);
  assert.equal(new URL(payment.paymentUrl, 'http://localhost').pathname, '/payment/success');
  assert.equal(new URL(payment.paymentUrl, 'http://localhost').searchParams.get('mock'), 'true');
  assert.equal(received.length, 0);
  assert.equal(jobs.length, 1);
  const webhookStarted = Date.now();
  await jobs[0]();
  assert.ok(Date.now() - webhookStarted >= 1900, 'Webhook must wait about two seconds');
  assert.deepEqual(received[0], { paymentId: payment.paymentId, orderId: input.orderId, amount: input.amount, status: 'succeeded' });
  await assert.rejects(handleWebhook({ status: 'succeeded' }), /Invalid mock webhook/);
  await assert.rejects(provider.initPayment(1, input.orderId, receipt), /Invalid payment/);
  const second = await provider.initPayment(input.amount, input.orderId, input.receipt);
  assert.notEqual(second.paymentId, payment.paymentId);
  console.log('Payment provider checks passed: validation, unique IDs, nonblocking init, delayed successful webhook, invalid payloads.');
} finally {
  const target = path.resolve(dir);
  if (!target.startsWith(path.resolve(os.tmpdir()) + path.sep) || !path.basename(target).startsWith('theatre-payment-test-')) throw new Error('Unexpected temporary directory');
  await fs.rm(target, { recursive: true, force: true });
}
