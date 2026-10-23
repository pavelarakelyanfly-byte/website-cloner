import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import type { PaymentProvider, PaymentReceipt, PaymentResult, PaymentWebhook, WebhookResult } from "./types";
import { isInitPaymentInput, isPaymentWebhook } from "./validation";

type DeferredTask = () => Promise<void>;
type Defer = (task: DeferredTask) => void;

/** Local mock only. The deferred callback simulates delivery; no HTTP request is sent. */
export class MockPaymentProvider implements PaymentProvider {
  constructor(private readonly defer: Defer = task => {
    void task().catch(error => console.error("[payments:mock] webhook failed", error));
  }) {}

  async initPayment(amount: number, orderId: string, receipt: PaymentReceipt): Promise<PaymentResult> {
    if (!isInitPaymentInput({ amount, orderId, receipt })) throw new Error("Invalid payment input");
    console.info("[payments:mock] initPayment", JSON.stringify({ amount, orderId, receipt }));
    const paymentId = `mock_${randomUUID()}`;
    const payload: PaymentWebhook = { paymentId, orderId, amount, status: "succeeded" };
    this.defer(async () => {
      await delay(2000);
      await this.handleWebhook(payload);
    });
    return {
      paymentId,
      paymentUrl: `/payment/success?mock=true&paymentId=${encodeURIComponent(paymentId)}`,
    };
  }

  async handleWebhook(payload: unknown): Promise<WebhookResult> {
    if (!isPaymentWebhook(payload)) throw new Error("Invalid mock webhook payload");
    const result = { ...payload, processedAt: new Date().toISOString() };
    console.info("[payments:mock] handleWebhook", result);
    return result;
  }
}

