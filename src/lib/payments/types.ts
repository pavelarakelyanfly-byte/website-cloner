/** All amounts are integer kopecks (RUB). No bank-specific fields belong here. */
export interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
}

export interface PaymentReceipt {
  email: string;
  items: ReceiptItem[];
}

export interface InitPaymentInput {
  amount: number;
  orderId: string;
  receipt: PaymentReceipt;
}

export interface PaymentResult {
  paymentUrl: string;
  paymentId: string;
}

export interface PaymentWebhook {
  paymentId: string;
  orderId: string;
  amount: number;
  status: "succeeded" | "failed";
}

export interface WebhookResult extends PaymentWebhook {
  processedAt: string;
}

export interface PaymentProvider {
  initPayment(amount: number, orderId: string, receipt: PaymentReceipt): Promise<PaymentResult>;
  handleWebhook(payload: unknown): Promise<WebhookResult>;
}
