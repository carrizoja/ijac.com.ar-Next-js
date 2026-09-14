import { FocusCards } from "../components/ui/focus-cards";
import { PrimaryButton } from "./ui/PrimaryButton";
import { getFeaturedServices } from "../../data/services.js";
import { servicesContent, type FeaturedServiceSlug } from "@/i18n/home/services";
import { getNavHref, getServiceDetailHref, type Locale } from "@/i18n/routing";

export function Services({ locale = "es" }: { locale?: Locale }) {
  const content = servicesContent[locale];
  const featuredServices = getFeaturedServices().map((service) => ({
    ...service,
    ...(content.cards?.[service.slug as FeaturedServiceSlug] ?? {}),
    href: getServiceDetailHref(service.slug, locale),
  }));

  return (
    <div className="w-full">
      <h2 className="text-lg sm:text-lg lg:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-8 mt-4 text-center">
        {content.heading}
      </h2>
      <p className="mx-auto max-w-3xl px-4 text-center text-sm leading-7 text-gray-700 dark:text-neutral-300 sm:text-base">
        {content.summary}
      </p>
      <FocusCards cards={featuredServices} />
      <div className="mt-8 mb-8 flex justify-center">
        <PrimaryButton text={content.cta} href={getNavHref("services", "/services", locale)} />
      </div>
    </div>
  );
}
