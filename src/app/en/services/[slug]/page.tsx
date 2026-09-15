import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { PrimaryButton } from "../../../components/ui/PrimaryButton";
import { getNavHref } from "@/i18n/routing";
import { getSeoAlternates } from "@/i18n/seo";
import { getServiceByLocaleSlug, getServiceSlugsForLocale } from "@/i18n/services/catalog";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getServiceSlugsForLocale("en").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceByLocaleSlug(slug, "en");

  if (!service) {
    return {
      title: "Service not found | iJac IT Solutions",
    };
  }

  const url = `https://ijac.com.ar/en/services/${service.slug}`;

  return {
    title: `${service.title} | iJac IT Solutions`,
    description: service.seoIntro,
    alternates: getSeoAlternates(`/services/${service.slugEs}`, "en"),
    openGraph: {
      title: service.title,
      description: service.seoIntro,
      url,
      siteName: "iJac IT Solutions",
      type: "article",
      images: [
        {
          url: service.src,
          alt: service.alt,
        },
      ],
    },
    twitter: {
      title: service.title,
      description: service.seoIntro,
      images: [service.src],
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceByLocaleSlug(slug, "en");

  if (!service) {
    notFound();
  }

  const contactHref = getNavHref("contact", "/contact", "en");

  const breadcrumbItems = [
    { name: "Home", href: "/en" },
    { name: "Services", href: "/en/services" },
    { name: service.title, href: `/en/services/${service.slug}` },
  ];

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.fullDescription,
    image: service.src,
    url: `https://ijac.com.ar/en/services/${service.slug}`,
    areaServed: "Buenos Aires, Argentina",
    provider: {
      "@type": "Organization",
      name: "iJac IT Solutions",
      url: "https://ijac.com.ar",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <main className="min-h-screen bg-background text-neutral-900 dark:bg-black dark:text-white">
        <section className="px-4 pt-28 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Breadcrumbs items={breadcrumbItems} locale="en" />

            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-white shadow-2xl dark:border-white/10 dark:from-neutral-900 dark:via-neutral-950 dark:to-black lg:grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative min-h-[320px] lg:min-h-[520px]">
                <Image
                  src={service.src}
                  alt={service.alt}
                  title={service.alt}
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
              </div>

              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12">
                <Link
                  href="/en/services"
                  className="mb-5 inline-flex w-fit items-center gap-2 text-sm text-emerald-300 transition hover:text-emerald-200"
                >
                  <span aria-hidden="true">←</span>
                  Back to services
                </Link>
                <p className="mb-4 inline-flex w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-sm text-emerald-200">
                  Specialized solution
                </p>
                <h1 className="text-4xl font-bold font-heading text-neutral-900 dark:text-white sm:text-5xl">
                  {service.title}
                </h1>
                <p className="mt-5 text-base leading-8 text-neutral-700 dark:text-neutral-300 sm:text-lg">
                  {service.seoIntro}
                </p>
                <p className="mt-6 text-sm leading-8 text-neutral-600 dark:text-neutral-400 sm:text-base">
                  {service.fullDescription}
                </p>

                <div className="mt-8 flex flex-col gap-4">
                  <PrimaryButton
                    text={service.ctaLabel}
                    href={contactHref}
                    colorVariant="green"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-18 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950/80 dark:shadow-xl sm:p-8">
              <h2 className="text-2xl font-bold font-heading text-neutral-900 dark:text-white sm:text-3xl">
                How we deliver this service
              </h2>
              <p className="mt-5 text-base leading-8 text-neutral-700 dark:text-neutral-300">
                {service.desc}
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950/80 dark:shadow-xl sm:p-8">
              <h2 className="text-2xl font-bold font-heading text-neutral-900 dark:text-white">
                What&apos;s included
              </h2>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-neutral-700 dark:text-neutral-300 sm:text-base">
                {service.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
