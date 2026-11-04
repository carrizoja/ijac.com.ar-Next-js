import { describe, expect, it } from "vitest";

import { services } from "./services";

describe("service images", () => {
  it.each(services.map((service) => [service.slug, service.src]))(
    "serves %s through Cloudinary with automatic format, quality and a width cap",
    (_slug, src) => {
      expect(src).toMatch(
        /^https:\/\/res\.cloudinary\.com\/dovghglgj\/image\/upload\/f_auto,q_auto,c_limit,w_1600\/v\d+\//,
      );
    },
  );
});
