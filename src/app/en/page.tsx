import type { Metadata } from "next";
import { getSeoAlternates } from "@/i18n/seo";
import { Hero } from "../components/Hero";
import { Services } from "../components/Services";
import { RemoteSupportBanner } from "../components/RemoteSupportBanner";
import { About } from "../components/About";
import Testimonials from "../components/Testimonials";
import { Contact } from "../components/Contact";
import { StructuredData } from "../components/StructuredData";

export const metadata: Metadata = {
  metadataBase: new URL("https://ijac.com.ar"),
  title: "Web Development and Technical Support in Buenos Aires | iJac IT Solutions",
  description:
    "iJac IT Solutions: Experts in web development, PC/Mac technical support, and cybersecurity in Almagro, Buenos Aires. Custom IT solutions for businesses. Contact us today!",
  alternates: getSeoAlternates("/", "en"),
  openGraph: {
    title: "iJac IT Solutions",
    description:
      "We engineer solutions for a smarter world. Web development, apps, web apps, and IT consulting worldwide.",
    url: "https://ijac.com.ar/en",
    images: ["https://ijac.com.ar/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "iJac IT Solutions",
    description:
      "We engineer solutions for a smarter world. Web development, enterprise systems, and IT consulting.",
    images: ["https://ijac.com.ar/opengraph-image.png"],
  },
};

export default function EnglishHomePage() {
  return (
    <>
      <StructuredData locale="en" />
      <section id="home"><Hero locale="en" /></section>
      <section id="services"><Services locale="en" /></section>
      <RemoteSupportBanner locale="en" />
      <section id="about"><About locale="en" /></section>
      <section id="testimonials"><Testimonials locale="en" /></section>
      <section id="contact"><Contact locale="en" /></section>
    </>
  );
}
