import checkout from "../../../../content/checkout.json";
import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/sites/odinteatr/site";
export const metadata: Metadata = { title: checkout.successMetadataTitle };
export default function PaymentSuccessPage() {
    return <><Header route="payment"/><main className="checkout-page checkout-success wrap"><p className="checkout-kicker">{checkout.successKicker}</p><div className="checkout-success-mark" aria-hidden="true">✓</div><h1>{checkout.successTitle}</h1><p>{checkout.successDescription}</p><p className="checkout-hint">{checkout.successNote}</p><div className="checkout-success-actions"><Link className="pill" href="/plays">{checkout.successToPlays}</Link><Link href="/checkout">{checkout.successRetry}</Link></div></main><Footer /></>;
}
