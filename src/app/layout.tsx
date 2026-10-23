import site from "../../content/site.json";
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = site.metadata;
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
