import { FocusCards } from "../components/ui/focus-cards";
import { services } from "../../data/services.js";

export function Services() {
  return <FocusCards cards={services} />;
}
