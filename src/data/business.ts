export const business = {
  name: "iJac IT Solutions",
  email: "jose.carrizo@ijac.com.ar",
  phoneDisplay: "+54 11 3086-2409",
  phoneHref: "+541130862409",
  whatsappUrl:
    "https://wa.me/541130862409?text=Hola%20iJAC%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20sus%20servicios",
  location: "Almagro, Buenos Aires, Argentina",
  streetAddress: "Colombres 195, Almagro",
  addressLocality: "Buenos Aires",
  addressRegion: "CABA",
  postalCode: "C1177",
  addressCountry: "AR",
  geo: {
    latitude: "-34.6119",
    longitude: "-58.4206",
  },
  areasServed: [
    "Almagro",
    "Caballito",
    "Boedo",
    "Balvanera",
    "Villa Crespo",
    "Palermo",
    "Recoleta",
    "CABA",
    "Buenos Aires",
  ],
  hours: {
    display: "Lunes a viernes de 9:00 a 18:00",
    schema: "Mo-Fr 09:00-18:00",
  },
} as const;

/** schema.org PostalAddress shared by every JSON-LD block that names the business. */
export const businessPostalAddress = {
  "@type": "PostalAddress",
  streetAddress: business.streetAddress,
  addressLocality: business.addressLocality,
  addressRegion: business.addressRegion,
  postalCode: business.postalCode,
  addressCountry: business.addressCountry,
} as const;
