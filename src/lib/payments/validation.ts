import type { InitPaymentInput, PaymentWebhook } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export function isInitPaymentInput(value: unknown): value is InitPaymentInput {
  if (!isRecord(value) || !isPositiveInteger(value.amount)) return false;
  if (typeof value.orderId !== "string" || !value.orderId.trim() || value.orderId.length > 100) return false;
  const receipt = value.receipt;
  if (!isRecord(receipt) || typeof receipt.email !== "string" || receipt.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receipt.email)) return false;
  if (!Array.isArray(receipt.items) || receipt.items.length === 0 || receipt.items.length > 100) return false;
  let total = 0;
  for (const item of receipt.items) {
    if (!isRecord(item) || typeof item.name !== "string" || !item.name.trim() || item.name.length > 200) return false;
    if (!isPositiveInteger(item.price) || !isPositiveInteger(item.quantity)) return false;
    total += item.price * item.quantity;
    if (!Number.isSafeInteger(total)) return false;
  }
  return total === value.amount;
}

export function isPaymentWebhook(value: unknown): value is PaymentWebhook {
  return isRecord(value)
    && typeof value.paymentId === "string" && value.paymentId.startsWith("mock_")
    && typeof value.orderId === "string" && value.orderId.trim().length > 0
    && isPositiveInteger(value.amount)
    && (value.status === "succeeded" || value.status === "failed");
}
