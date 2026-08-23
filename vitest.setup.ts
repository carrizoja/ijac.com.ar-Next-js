import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

if (typeof window !== "undefined") {
  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 0;
  };
  window.cancelAnimationFrame = () => undefined;
  Element.prototype.scrollIntoView = () => undefined;
}
