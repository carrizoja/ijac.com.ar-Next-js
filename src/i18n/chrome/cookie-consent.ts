import type { Locale } from "../routing";

interface CookieConsentContent {
  heading: string;
  /** Body text before the terms link. */
  bodyIntro: string;
  termsLabel: string;
  termsTitle: string;
  /** Text between the terms link and the privacy link. */
  bodyJoin: string;
  privacyLabel: string;
  privacyTitle: string;
  rejectLabel: string;
  acceptLabel: string;
}

/**
 * Both locales link to the Spanish legal pages: they have no English
 * counterpart, so the URLs live in the component, not here.
 */
export const cookieConsentContent: Record<Locale, CookieConsentContent> = {
  es: {
    heading: "🍪 Uso de Cookies",
    bodyIntro:
      "Este sitio web utiliza cookies propias y de terceros para mejorar su experiencia de navegación, " +
      "analizar el tráfico del sitio y personalizar el contenido. Al continuar navegando, acepta nuestros",
    termsLabel: "Términos y Condiciones",
    termsTitle: "Ver Términos y Condiciones",
    bodyJoin: "y nuestra",
    privacyLabel: "Política de Privacidad",
    privacyTitle: "Ver Política de Privacidad",
    rejectLabel: "Rechazar",
    acceptLabel: "Aceptar Cookies",
  },
  en: {
    heading: "🍪 Use of Cookies",
    bodyIntro:
      "This website uses its own and third-party cookies to improve your browsing experience, " +
      "analyze site traffic and personalize content. By continuing to browse, you accept our",
    termsLabel: "Terms and Conditions",
    termsTitle: "View Terms and Conditions",
    bodyJoin: "and our",
    privacyLabel: "Privacy Policy",
    privacyTitle: "View Privacy Policy",
    rejectLabel: "Reject",
    acceptLabel: "Accept Cookies",
  },
};
