import { after } from "next/server";
import { MockPaymentProvider } from "./mock-provider";
import type { PaymentProvider } from "./types";

// Replace only this binding when a real provider is introduced.
// after() keeps the mock webhook task alive after the HTTP response is sent.
export const paymentProvider: PaymentProvider = new MockPaymentProvider(task => after(task));
export type { PaymentProvider, PaymentReceipt, PaymentResult, PaymentWebhook, InitPaymentInput } from "./types";
