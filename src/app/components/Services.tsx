import { FocusCards } from "../components/ui/focus-cards";
import { services } from "../../data/services.js";

export function Services() {
  return (
    <div className="w-full">
      <h2 className="text-lg sm:text-lg lg:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-8 mt-4 text-center">
        Nuestros Servicios de Tecnología
      </h2>
      <FocusCards cards={services} />
    </div>
  );
}
