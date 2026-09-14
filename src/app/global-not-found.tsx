import "./globals.css";
import NotFoundContent, { notFoundMetadata } from "./components/NotFoundContent";
import SiteDocument from "./components/SiteDocument";

export const metadata = notFoundMetadata;

export default function GlobalNotFound() {
  return (
    <SiteDocument locale="es">
      <NotFoundContent />
    </SiteDocument>
  );
}
