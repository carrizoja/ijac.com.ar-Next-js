import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { SecondaryButton } from "../../components/ui/SecondaryButton";
import { getServiceCopyForLocale } from "@/i18n/services/catalog";
import { getNavHref } from "@/i18n/routing";
import { getSeoAlternates } from "@/i18n/seo";
import { getServiceSlugs } from "../../../data/services.js";

export const metadata: Metadata = {
  title: "IT Services, Web Development and Technical Support in Buenos Aires | iJac IT Solutions",
  description:
    "Discover every iJac IT Solutions service: PC and Mac technical support, web development, cybersecurity, networking, UX/UI, AI, branding, and more in Buenos Aires.",
  keywords: [
    "IT services Buenos Aires",
    "PC and Mac technical support",
    "web development Buenos Aires",
    "cybersecurity for businesses",
    "wifi network installation",
    "UX UI design",
    "artificial intelligence for businesses",
    "digital marketing and branding",
  ],
  alternates: getSeoAlternates("/services", "en"),
  openGraph: {
    title: "Services | iJac IT Solutions",
    description:
      "Explore iJac IT Solutions' technology services: technical support, web development, cybersecurity, networking, UX/UI, data, and AI.",
    url: "https://ijac.com.ar/en/services",
    siteName: "iJac IT Solutions",
    type: "website",
  },
  twitter: {
    title: "Services | iJac IT Solutions",
    description:
      "Discover every iJac IT Solutions service and find the right solution for your business or project.",
  },
};

const breadcrumbItems = [
  { name: "Home", href: "/en" },
  { name: "Services", href: "/en/services" },
];

const services = getServiceSlugs().map(
  (slugEs) => getServiceCopyForLocale(slugEs, "en")!,
);

const contactHref = getNavHref("contact", "/contact", "en");

export default function EnglishServicesPage() {
  const servicesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "iJac IT Solutions Services",
    itemListElement: services.map((service, index) => ({
      "@type": "Service",
      position: index + 1,
      name: service.title,
      description: service.fullDescription,
      areaServed: "Buenos Aires, Argentina",
      provider: {
        "@type": "Organization",
        name: "iJac IT Solutions",
        url: "https://ijac.com.ar",
      },
      image: service.src,
      url: `https://ijac.com.ar/en/services/${service.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />

      <main className="min-h-screen bg-background text-neutral-900 dark:bg-black dark:text-white">
        <section className="px-4 pt-28 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Breadcrumbs items={breadcrumbItems} locale="en" />

            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-white shadow-2xl dark:border-white/10 dark:from-neutral-900 dark:via-neutral-950 dark:to-black px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
              <p className="mb-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-sm text-emerald-700 dark:text-emerald-200">
                Technology solutions for businesses, professionals, and teams
              </p>
              <h1 className="max-w-4xl text-4xl font-bold font-heading text-neutral-900 dark:text-white sm:text-5xl lg:text-6xl">
                IT services built to improve your operations and your digital presence
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-700 dark:text-neutral-300 sm:text-lg">
                At iJac IT Solutions we bring together technical support, web development,
                networking, cybersecurity, UX/UI design, analytics, and branding to solve
                real needs with a single technical perspective. Explore each service and
                discover how we can help based on where your business is today.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <PrimaryButton
                  text="Request guidance"
                  href={contactHref}
                  colorVariant="green"
                  className="justify-start"
                />
                <SecondaryButton text="See the summary on the homepage" href="/en#services" />
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8">
            {services.map((service, index) => (
              <article
                key={service.slug}
                id={service.slug}
                className="grid overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-950/80 dark:shadow-none lg:grid-cols-[1.1fr_1.4fr]"
              >
                <div className="relative min-h-[280px] border-b border-neutral-200 dark:border-white/10 lg:min-h-full lg:border-b-0 lg:border-r">
                  <Image
                    src={service.src}
                    alt={service.alt}
                    title={service.alt}
                    fill
                    priority={index < 2}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="mb-3 text-sm uppercase tracking-[0.22em] text-emerald-300">
                      Service {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 className="text-2xl font-bold font-heading text-white sm:text-3xl">
                      <Link
                        href={`/en/services/${service.slug}`}
                        className="transition hover:text-emerald-200"
                      >
                        {service.title}
                      </Link>
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-200 sm:text-base">
                      {service.seoIntro}
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="rounded-2xl border border-neutral-200 dark:border-white/8 bg-neutral-50 dark:bg-white/[0.03] p-5 sm:p-6">
                    <p className="text-base leading-8 text-neutral-700 dark:text-neutral-300">
                      {service.fullDescription}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-6">
                    <div>
                      <h3 className="text-lg font-semibold font-heading text-neutral-900 dark:text-white">
                        Service scope
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-400 sm:text-base">
                        {service.desc}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold font-heading text-neutral-900 dark:text-white">
                        What&apos;s included
                      </h3>
                      <ul className="mt-3 space-y-3 text-sm leading-7 text-neutral-700 dark:text-neutral-300 sm:text-base">
                        {service.highlights.map((highlight) => (
                          <li key={highlight} className="flex gap-3">
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <PrimaryButton
                        text="View service page"
                        href={`/en/services/${service.slug}`}
                        colorVariant="green"
                      />
                      <SecondaryButton text="Request guidance" href={contactHref} />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 rounded-3xl border border-neutral-200 bg-gradient-to-r from-white via-neutral-50 to-neutral-100 dark:border-white/10 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 p-8 sm:p-10 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-3xl font-bold font-heading text-neutral-900 dark:text-white">
                Need a tailored solution?
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-8 text-neutral-700 dark:text-neutral-300">
                Tell us what you need and we&apos;ll help you define the service, scope,
                and technical approach that best fits your project or business.
              </p>
            </div>

            <Link
              href={contactHref}
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              Talk to iJac
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
