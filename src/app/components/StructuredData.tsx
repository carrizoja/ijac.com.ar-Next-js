export function StructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "iJac IT Solutions",
    "description": "Soluciones informáticas profesionales, desarrollo web y consultoría IT a nivel global con sede en Buenos Aires",
    "url": "https://ijac.com.ar",
    "logo": "https://res.cloudinary.com/dovghglgj/image/upload/v1755013017/ijac/logo_ijac_neg_hnsnrp.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+54 11 3086-2409",
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
      "serviceType": "Soluciones Informáticas",
      "description": "Desarrollo web, Apps, WebApps, sistemas empresariales, consultoría IT, soporte técnico pc mac, ciberseguridad y data science"
    }
  };

  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "iJac IT Solutions",
    "description": "Soluciones informáticas profesionales en Buenos Aires con alcance global",
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
    "telephone": "+54 11 3086-2409",
    "url": "https://ijac.com.ar",
    "priceRange": "$$",
    "openingHours": "Mo-Fr 09:00-18:00",
    "servesCuisine": "Technology Services",
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
