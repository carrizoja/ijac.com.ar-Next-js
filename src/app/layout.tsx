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
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "iJac IT Solutions | Buenos Aires",
    template: "%s | iJac IT Solutions"
  },
  description: "iJac IT Solutions ofrece soluciones informáticas profesionales a nivel global. Nuestra empresa se sitúa en Buenos Aires. Desarrollo web, Apps, sistemas empresariales, consultoría IT y soporte técnico especializado para hacer tu mundo más inteligente.",
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
        url: 'https://res.cloudinary.com/dovghglgj/image/upload/v1755013017/ijac/logo_ijac_pos.png',
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
    images: ['https://res.cloudinary.com/dovghglgj/image/upload/v1755013017/ijac/logo_ijac_pos.png'],
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
  verification: {
    google: 'your-google-verification-code', // Add your verification code
  },
  other: {
    'google-site-verification': 'your-google-verification-code', // Backup verification
    'msvalidate.01': 'your-bing-verification-code', // Bing verification
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
        <meta name="theme-color" content="#1f2937" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased overflow-x-hidden`}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8NYPRQK16F"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
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