import site from "../../content/site.json";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
export const metadata: Metadata = site.metadata;
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body style={{ "--site-background-image": `url("${site.media.background}")` } as CSSProperties}>{children}</body></html>;
}
