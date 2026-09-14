import type { Metadata } from "next";
import "../globals.css";
import SiteDocument, { siteViewport } from "../components/SiteDocument";

export const metadata: Metadata = {
  metadataBase: new URL("https://ijac.com.ar"),
};
export const viewport = siteViewport;

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument locale="en">{children}</SiteDocument>;
}
