import type { Metadata } from "next";
import legal from "../../../content/legal.json";
import { LegalPage } from "@/components/sites/odinteatr/legal-page";

export const metadata: Metadata = { title: legal.pages.terms.title };

export default function Page() {
  return <LegalPage document="terms" />;
}
