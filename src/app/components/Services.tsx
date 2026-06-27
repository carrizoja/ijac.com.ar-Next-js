import { FocusCards } from "../components/ui/focus-cards";
import { PrimaryButton } from "./ui/PrimaryButton";
import { getFeaturedServices } from "../../data/services.js";

export function Services() {
  const featuredServices = getFeaturedServices();

  return (
    <div className="w-full">
      <h2 className="text-lg sm:text-lg lg:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-8 mt-4 text-center">
        Nuestros Servicios de Tecnología
      </h2>
      <p className="mx-auto max-w-3xl px-4 text-center text-sm leading-7 text-gray-700 dark:text-neutral-300 sm:text-base">
        Descubre nuestros servicios destacados y visita la pagina de servicios para explorar el catalogo completo, con mas soluciones, detalles y alternativas para tu necesidad.
      </p>
      <FocusCards cards={featuredServices} />
      <div className="mt-8 mb-8 flex justify-center">
        <PrimaryButton text="Ver todos los servicios" href="/services" />
      </div>
    </div>
  );
}
