import type { Metadata } from "next";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { FAQ } from "../../components/FAQ";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { business } from "../../../data/business";
import { businessHoursDisplayEn } from "@/i18n/faq";
import { getSeoAlternates } from "@/i18n/seo";
import { getWhatsAppUrl } from "@/i18n/whatsapp";

export const metadata: Metadata = {
  title: "Contact iJac IT Solutions | IT Consulting & Support in Buenos Aires",
  description:
    "Contact iJac IT Solutions for professional IT consulting and support services in Buenos Aires, Argentina. Get expert assistance today.",
  keywords:
    "contact iJac, IT support Buenos Aires, technical consulting contact, IT services Argentina, business technology support",
  openGraph: {
    title: "Contact iJac IT Solutions | Expert IT Support",
    description:
      "Get in touch with iJac IT Solutions for professional IT consulting and support services in Buenos Aires.",
    url: "https://ijac.com.ar/en/contact",
    type: "website",
  },
  twitter: {
    title: "Contact iJac IT Solutions | IT Solutions Experts",
    description:
      "Get in touch with iJac IT Solutions for professional IT consulting and support services in Buenos Aires.",
  },
  alternates: getSeoAlternates("/contact", "en"),
};

const breadcrumbItems = [
  { name: "Home", href: "/en" },
  { name: "Contact", href: "/en/contact" },
];

export default function EnglishContactPage() {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "iJac IT Solutions",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": business.phoneDisplay,
        "contactType": "customer service",
        "email": business.email,
        "availableLanguage": ["Spanish", "English"],
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} locale="en" />

        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <h1 className="text-4xl font-bold mb-8 font-heading">Contact Us</h1>
          <p className="text-lg mb-8">Get in touch with our team</p>

          <FAQ locale="en" />
          <div className="max-w-md w-full space-y-4">
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4 font-heading">Contact Information</h2>
              <div className="space-y-2">
                <p><strong>Email:</strong> <a href={`mailto:${business.email}`} title="Send an email to iJAC" className="text-blue-600 hover:text-blue-800">{business.email}</a></p>
                <p><strong>Phone:</strong> <a href={`tel:${business.phoneHref}`} title="Call iJAC" className="text-blue-600 hover:text-blue-800">{business.phoneDisplay}</a></p>
                <p><strong>Address:</strong> Colombres 195, Almagro, Buenos Aires, Argentina</p>
              </div>
            </div>

            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4 font-heading">Business Hours</h2>
              <div className="space-y-1">
                <p>{businessHoursDisplayEn}</p>
              </div>
              <div className="mt-4">
                <PrimaryButton
                  text="WhatsApp"
                  href={getWhatsAppUrl("en")}
                  colorVariant="green"
                  className="justify-start"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
