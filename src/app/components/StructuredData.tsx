import { business } from "../../data/business";
import { structuredDataContent } from "@/i18n/structured-data";
import type { Locale } from "@/i18n/routing";

export function StructuredData({ locale = "es" }: { locale?: Locale }) {
  const copy = structuredDataContent[locale];
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "iJac IT Solutions",
    "description": copy.organizationDescription,
    "url": "https://ijac.com.ar",
    "logo": "https://res.cloudinary.com/dovghglgj/image/upload/v1755013017/ijac/logo_ijac_neg_hnsnrp.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": business.phoneDisplay,
      "contactType": "customer service",
      "areaServed": ["AR", "US", "ES", "BR"],
      "availableLanguage": ["Spanish", "English"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Almagro",
      "addressLocality": "Buenos Aires",
      "addressRegion": "CABA",
      "postalCode": "1177",
      "addressCountry": "AR"
    },
    "sameAs": [
      "https://www.facebook.com/ijacsolucionesinformaticas",
      "https://www.instagram.com/ijacsi/"
    ],
    "offers": {
      "@type": "Service",
      "serviceType": copy.serviceType,
      "description": copy.offerDescription
    }
  };

  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "iJac IT Solutions",
    "description": copy.localBusinessDescription,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Almagro",
      "addressLocality": "Buenos Aires",
      "addressRegion": "CABA",
      "postalCode": "1177",
      "addressCountry": "AR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-34.6037",
      "longitude": "-58.3816"
    },
    "telephone": business.phoneDisplay,
    "url": "https://ijac.com.ar",
    "priceRange": "$$",
    "openingHours": business.hours.schema,
    "image": "https://res.cloudinary.com/dovghglgj/image/upload/v1755013017/ijac/logo_ijac_neg_hnsnrp.png"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
      />
    </>
  );
}
