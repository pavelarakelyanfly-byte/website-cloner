import checkout from "../../../content/checkout.json";
import type { Metadata } from "next";
import { Header, Footer } from "@/components/sites/odinteatr/site";
import { CheckoutForm } from "@/components/sites/odinteatr/checkout-form";
export const metadata: Metadata = { title: checkout.metadataTitle };
export default function CheckoutPage() {
    return <><Header route="checkout"/><main className="checkout-page wrap"><p className="checkout-kicker">{checkout.kicker}</p><h1>{checkout.title}</h1><CheckoutForm /></main><Footer /></>;
}
