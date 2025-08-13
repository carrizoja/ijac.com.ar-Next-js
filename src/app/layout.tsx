import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { NavbarIjac } from "./components/Navbarijac";
import { HamburgerMenu } from "./components/HamburgerMenu";
import Footer from "./components/Footer";
import WhatsApp from "./components/WhatsApp";
import { GoogleAnalytics } from "./components/GoogleAnalytics";
import { PerformanceMonitor } from "./components/PerformanceMonitor";

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
  description: "iJac IT Solutions ofrece soluciones informáticas profesionales a nivel global. Nuestra empresa se sitúa en Buenos Aires. Desarrollo web, sistemas empresariales, consultoría IT y soporte técnico especializado para hacer tu mundo más inteligente.",
  keywords: [
    "soluciones informáticas",
    "desarrollo web",
    "sistemas empresariales", 
    "consultoría IT",
    "soporte técnico",
    "Buenos Aires",
    "Argentina",
    "Asistencia remota",
    "ingeniería software",
    "desarrollo aplicaciones",
    "transformación digital",
    "Ciberseguridad",
    "Data Science"
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
        url: 'https://res.cloudinary.com/dovghglgj/image/upload/v1755013017/ijac/logo_ijac_neg_hnsnrp.png',
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
    images: ['https://res.cloudinary.com/dovghglgj/image/upload/v1755013017/ijac/logo_ijac_neg_hnsnrp.png'],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#1f2937" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <GoogleAnalytics />
        <PerformanceMonitor />
        <div className="hidden min-[700px]:block">
          <NavbarIjac />
        </div>
        <div className="block min-[700px]:hidden">
          <HamburgerMenu />
        </div>
        {children}
        <WhatsApp />
        <Footer />
      </body>
    </html>
  );
}