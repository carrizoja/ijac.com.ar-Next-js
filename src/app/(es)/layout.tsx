import "../globals.css";
import SiteDocument, {
  siteViewport,
  spanishMetadata,
} from "../components/SiteDocument";

export const metadata = spanishMetadata;
export const viewport = siteViewport;

export default function SpanishRootLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument locale="es">{children}</SiteDocument>;
}
