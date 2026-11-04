import { business, businessPostalAddress } from "../../data/business";
import { getServiceCopyForLocale } from "@/i18n/services/catalog";
import { getServiceSlugs } from "../../data/services";
import { structuredDataContent } from "@/i18n/structured-data";
import { getServiceDetailHref, type Locale } from "@/i18n/routing";

export function StructuredData({ locale = "es" }: { locale?: Locale }) {
  const copy = structuredDataContent[locale];
  const serviceOffers = getServiceSlugs()
    .map((slugEs) => getServiceCopyForLocale(slugEs, locale))
    .filter((service): service is NonNullable<typeof service> => Boolean(service))
    .map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.title,
        description: service.seoIntro,
        url: `https://ijac.com.ar${getServiceDetailHref(service.slugEs, locale)}`,
      },
    }));

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
    "address": businessPostalAddress,
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
    "additionalType": [
      "https://schema.org/ComputerStore",
      "https://schema.org/ProfessionalService"
    ],
    "name": "iJac IT Solutions",
    "description": copy.localBusinessDescription,
    "address": businessPostalAddress,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": business.geo.latitude,
      "longitude": business.geo.longitude
    },
    "areaServed": business.areasServed.map((area) => ({
      "@type": "Place",
      "name": area,
    })),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": copy.serviceType,
      "itemListElement": serviceOffers,
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
