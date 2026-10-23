"use client";
import checkout from "../../../../content/checkout.json";
import Link from "next/link";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { demoOrder, formatAmount } from "@/lib/payments/demo-order";
export function CheckoutForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const orderId = useRef<string | null>(null);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current)
      return;
    submitting.current = true;
    setPending(true);
    setError("");
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    orderId.current ??= `demo_${crypto.randomUUID()}`;
    try {
      const response = await fetch("/api/payment/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: demoOrder.amount,
          orderId: orderId.current,
          receipt: { email, items: demoOrder.items },
        }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(typeof result === "object" && result !== null && "error" in result && typeof result.error === "string" ? result.error : checkout.initError);
      }
      if (typeof result !== "object" || result === null || !("paymentUrl" in result) || typeof result.paymentUrl !== "string") {
        throw new Error(checkout.invalidResponse);
      }
      const url = new URL(result.paymentUrl, window.location.origin);
      if (url.protocol !== "https:" && url.origin !== window.location.origin) {
        throw new Error(checkout.invalidUrl);
      }
      window.location.assign(url.href);
    }
    catch (cause) {
      setError(cause instanceof Error && !(cause instanceof TypeError) ? cause.message : checkout.networkError);
      setPending(false);
      submitting.current = false;
    }
  }
  return (<div className="checkout-grid">
   <section className="checkout-order" aria-labelledby="order-heading">
    <p className="checkout-label">{checkout.orderLabel}</p>
    <h2 id="order-heading">{demoOrder.title}</h2>
    <p className="checkout-description">{demoOrder.description}</p>
    <dl className="checkout-total"><dt>{checkout.totalLabel}</dt><dd>{formatAmount(demoOrder.amount)}</dd></dl>
    <Link className="checkout-back" href="/plays">{checkout.backToPlays}</Link>
   </section>
   <form className="checkout-form" onSubmit={handleSubmit} aria-busy={pending}>
    <h2>{checkout.formTitle}</h2>
    <label htmlFor="receipt-email">{checkout.emailLabel}</label>
    <input id="receipt-email" name="email" type="email" autoComplete="email" placeholder={checkout.emailPlaceholder} required maxLength={254} disabled={pending} aria-describedby="email-note"/>
    <p id="email-note" className="checkout-hint">{checkout.emailHint}</p>
    <p className="checkout-demo">{checkout.demoNotice}</p>
    {error && <p className="checkout-error" role="alert">{error}</p>}
    <button className="pill" type="submit" disabled={pending}>{pending ? checkout.pendingButton : checkout.payButton}</button>
    <span className="sr-only" role="status">{pending ? checkout.pendingStatus : ""}</span>
   </form>
  </div>);
}
