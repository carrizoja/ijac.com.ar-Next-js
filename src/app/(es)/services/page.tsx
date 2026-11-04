import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { SecondaryButton } from "../../components/ui/SecondaryButton";
import { services } from "../../../data/services";
import { businessPostalAddress } from "@/data/business";
import { getSeoAlternates } from "@/i18n/seo";
import { getServiceScopeItems } from "@/i18n/services/catalog";

export const metadata: Metadata = {
  title: "Servicios IT y PC Gamer en Almagro, CABA",
  description:
    "Conoce todos los servicios de iJac IT Solutions en Almagro, CABA: soporte técnico PC y Mac, armado de PC Gamer a medida, desarrollo web, ciberseguridad, redes WiFi, UX UI, IA y branding en Buenos Aires.",
  keywords: [
    "servicios IT Buenos Aires",
    "armado pc gamer en almagro",
    "armado de pc gamer caba",
    "soporte tecnico PC y Mac CABA",
    "soporte tecnico pc en almagro",
    "diseño web en almagro",
    "desarrollo web Buenos Aires",
    "ciberseguridad para empresas",
    "instalacion de redes wifi",
    "diseno UX UI",
    "inteligencia artificial para empresas",
    "marketing digital y branding",
  ],
  alternates: getSeoAlternates("/services", "es"),
  openGraph: {
    title: "Servicios de iJac IT Solutions en Almagro, CABA",
    description:
      "Explora los servicios de tecnología de iJac IT Solutions: soporte técnico, armado de PC Gamer, desarrollo web, ciberseguridad, redes, UX UI, datos e IA.",
    url: "https://ijac.com.ar/services",
    siteName: "iJac IT Solutions",
    type: "website",
  },
  twitter: {
    title: "Servicios de iJac IT Solutions en Almagro, CABA",
    description:
      "Descubre todos los servicios IT de iJac IT Solutions en Almagro y Buenos Aires: soporte técnico, armado de PC Gamer y desarrollo web.",
  },
};

const breadcrumbItems = [
  { name: "Home", href: "/" },
  { name: "Servicios", href: "/services" },
];

export default function ServicesPage() {
  const servicesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Servicios de iJac IT Solutions",
    itemListElement: services.map((service, index) => ({
      "@type": "Service",
      position: index + 1,
      name: service.title,
      description: service.fullDescription,
      areaServed: ["Almagro", "CABA", "Buenos Aires, Argentina"],
      provider: {
        "@type": "LocalBusiness",
        name: "iJac IT Solutions",
        url: "https://ijac.com.ar",
        address: businessPostalAddress,
      },
      image: service.src,
      url: `https://ijac.com.ar/services/${service.slug}`,
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
            <Breadcrumbs items={breadcrumbItems} />

            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-white shadow-2xl dark:border-white/10 dark:from-neutral-900 dark:via-neutral-950 dark:to-black px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
              <h1 className="max-w-4xl text-balance text-4xl font-bold font-heading text-neutral-900 dark:text-white sm:text-5xl lg:text-6xl">
                Servicios IT pensados para mejorar tu operación y tu presencia digital
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-neutral-700 dark:text-neutral-300 sm:text-lg">
                En iJac IT Solutions reunimos soporte técnico, desarrollo web, redes,
                ciberseguridad, diseño UX UI, analítica y branding para resolver
                necesidades reales con una sola mirada técnica. Explora cada servicio y
                descubre cómo podemos ayudarte según el momento de tu negocio.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <PrimaryButton
                  text="Solicitar asesoramiento"
                  href="/contact"
                  colorVariant="green"
                  className="justify-start"
                />
                <SecondaryButton text="Ver resumen en el inicio" href="/#servicios" />
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
                <div className="relative flex min-h-[280px] flex-col justify-end border-b border-neutral-200 dark:border-white/10 lg:min-h-full lg:border-b-0 lg:border-r">
                  <Image
                    src={service.src}
                    alt={service.alt}
                    title={service.alt}
                    fill
                    priority={index < 2}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                  <div className="relative p-6 pt-28 lg:pt-6">
                    <h2 className="text-balance text-2xl font-bold font-heading text-white sm:text-3xl">
                      <Link href={`/services/${service.slug}`} className="transition hover:text-emerald-200">
                        {service.title}
                      </Link>
                    </h2>
                    <p className="mt-3 max-w-xl text-pretty text-sm leading-7 text-neutral-200 sm:text-base">
                      {service.seoIntro}
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 lg:p-10">
                  <p className="max-w-prose text-pretty text-base leading-8 text-neutral-700 dark:text-neutral-300">
                    {service.fullDescription}
                  </p>

                  <div className="mt-6 grid gap-6">
                    <div>
                      <h3 className="text-lg font-semibold font-heading text-neutral-900 dark:text-white">
                        Alcance del servicio
                      </h3>
                      <ul className="mt-3 grid list-disc text-pretty gap-x-8 gap-y-1 pl-5 text-sm leading-7 text-neutral-600 marker:text-emerald-500 dark:text-neutral-400 sm:grid-cols-2 sm:text-base">
                        {getServiceScopeItems(service.desc, "es").map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold font-heading text-neutral-900 dark:text-white">
                        Qué incluye
                      </h3>
                      <ul className="mt-3 space-y-3 text-pretty text-sm leading-7 text-neutral-700 dark:text-neutral-300 sm:text-base">
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
                        text="Ver página del servicio"
                        href={`/services/${service.slug}`}
                        colorVariant="green"
                      />
                      <SecondaryButton text="Pedir asesoramiento" href="/contact" />
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
                ¿Necesitas una solución a medida?
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-8 text-neutral-700 dark:text-neutral-300">
                Cuéntanos tu necesidad y te ayudamos a definir el servicio, alcance y enfoque técnico más conveniente para tu proyecto o empresa.
              </p>
            </div>

            <PrimaryButton text="Hablar con iJac" href="/contact" colorVariant="green" />
          </div>
        </section>
      </main>
    </>
  );
}
