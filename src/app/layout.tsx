import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { NavbarIjac } from "./components/Navbarijac";
import { HamburgerMenu } from "./components/HamburgerMenu";
import Footer from "./components/Footer";
import { AIChat } from "./components/AIChat";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { CookieConsent } from "./components/CookieConsent";
import { ClientRedirect } from "./components/ClientRedirect";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: "Desarrollo Web y Servicio Técnico en CABA | iJac IT Solutions",
    template: "%s | iJac IT Solutions"
  },
  description: "iJac IT Solutions: Expertos en desarrollo web, soporte técnico pc mac y ciberseguridad en Almagro, CABA. Soluciones informáticas a medida para empresas. ¡Contáctanos!",
  keywords: [
    "soluciones informáticas",
    "desarrollo web",
    "computación", 
    "consultoría IT",
    "soporte técnico almagro",
    "servicio técnico almagro",
    "pc",
    "mac",
    "apple",
    "capital federal",
    "almagro",
    "buenos aires",
    "argentina",
    "asistencia remota",
    "ingeniería software",
    "desarrollo aplicaciones",
    "apps",
    "ciberseguridad",
    "data science",
    "infraestructura red"
  ],
  authors: [{ name: "iJac IT Solutions" }],
  creator: "iJac IT Solutions",
  publisher: "iJac IT Solutions",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  metadataBase: new URL('https://ijac.com.ar'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "iJac IT Solutions",
    description: "Hacemos ingeniería para un mundo más inteligente. Desarrollo web, Apps, WebApps y consultoría IT a nivel global.",
    url: 'https://ijac.com.ar',
    siteName: 'iJac IT Solutions',
    images: [
      {
        url: 'https://res.cloudinary.com/dovghglgj/image/upload/f_auto,q_auto:best,w_1200,h_630/v1755013017/ijac/logo_ijac_pos.png',
        width: 1200,
        height: 630,
        alt: 'iJac IT Solutions',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "iJac IT Solutions",
    description: "Hacemos ingeniería para un mundo más inteligente. Desarrollo web, sistemas empresariales y consultoría IT.",
    images: ['https://res.cloudinary.com/dovghglgj/image/upload/f_auto,q_auto:best,w_1200,h_630/v1755013017/ijac/logo_ijac_pos.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preload" as="image" href="/ijac-logo.png" fetchPriority="high" />
        <meta name="theme-color" content="#1f2937" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased overflow-x-hidden`}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8NYPRQK16F"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8NYPRQK16F', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>
        <PerformanceMonitor />
        <ClientRedirect />
        <div className="min-h-screen overflow-x-hidden">
          <div className="hidden min-[700px]:block">
            <NavbarIjac />
          </div>
          <div className="block min-[700px]:hidden">
            <HamburgerMenu />
          </div>
          {children}
          <AIChat />
          <Footer />
        </div>
        <CookieConsent />
      </body>
    </html>
  );
}