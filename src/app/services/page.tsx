import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { services } from "../../data/services";

export const metadata: Metadata = {
  title: "Servicios IT, Desarrollo Web y Soporte Tecnico en CABA | iJac IT Solutions",
  description:
    "Conoce todos los servicios de iJac IT Solutions: soporte tecnico PC y Mac, desarrollo web, ciberseguridad, redes, UX UI, IA, branding y mas en Buenos Aires.",
  keywords: [
    "servicios IT Buenos Aires",
    "soporte tecnico PC y Mac CABA",
    "desarrollo web Buenos Aires",
    "ciberseguridad para empresas",
    "instalacion de redes wifi",
    "diseno UX UI",
    "inteligencia artificial para empresas",
    "marketing digital y branding",
  ],
  alternates: {
    canonical: "https://ijac.com.ar/services",
  },
  openGraph: {
    title: "Servicios de iJac IT Solutions",
    description:
      "Explora los servicios de tecnologia de iJac IT Solutions: soporte tecnico, desarrollo web, ciberseguridad, redes, UX UI, datos e IA.",
    url: "https://ijac.com.ar/services",
    siteName: "iJac IT Solutions",
    type: "website",
  },
  twitter: {
    title: "Servicios de iJac IT Solutions",
    description:
      "Descubre todos los servicios IT de iJac IT Solutions y encuentra la solucion adecuada para tu empresa o proyecto.",
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
      areaServed: "Buenos Aires, Argentina",
      provider: {
        "@type": "Organization",
        name: "iJac IT Solutions",
        url: "https://ijac.com.ar",
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

      <main className="min-h-screen bg-black text-white">
        <section className="px-4 pt-28 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black px-6 py-10 shadow-2xl sm:px-8 lg:px-12 lg:py-14">
              <p className="mb-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-sm text-emerald-200">
                Soluciones tecnológicas para empresas, profesionales y equipos
              </p>
              <h1 className="max-w-4xl text-4xl font-bold font-heading text-white sm:text-5xl lg:text-6xl">
                Servicios IT pensados para mejorar tu operación y tu presencia digital
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-300 sm:text-lg">
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
                className="grid overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/80 shadow-xl lg:grid-cols-[1.1fr_1.4fr]"
              >
                <div className="relative min-h-[280px] border-b border-white/10 lg:min-h-full lg:border-b-0 lg:border-r">
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
                      Servicio {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 className="text-2xl font-bold font-heading text-white sm:text-3xl">
                      <Link href={`/services/${service.slug}`} className="transition hover:text-emerald-200">
                        {service.title}
                      </Link>
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-200 sm:text-base">
                      {service.seoIntro}
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-6">
                    <p className="text-base leading-8 text-neutral-300">
                      {service.fullDescription}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-6">
                    <div>
                      <h3 className="text-lg font-semibold font-heading text-white">
                        Alcance del servicio
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-neutral-400 sm:text-base">
                        {service.desc}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold font-heading text-white">
                        Que incluye
                      </h3>
                      <ul className="mt-3 space-y-3 text-sm leading-7 text-neutral-300 sm:text-base">
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
                        text="Ver pagina del servicio"
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
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 p-8 sm:p-10 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-3xl font-bold font-heading text-white">
                Necesitas una solucion a medida?
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-8 text-neutral-300">
                Cuéntanos tu necesidad y te ayudamos a definir el servicio, alcance y enfoque tecnico mas conveniente para tu proyecto o empresa.
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              Hablar con iJac
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
