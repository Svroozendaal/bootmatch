import { describe, expect, it } from "vitest";
import { PRODUCT_URL_FILTER } from "../../src/scrapers/sources/evo/config";

describe("evo url filter", () => {
  it("accepts ski boot product urls", () => {
    expect(PRODUCT_URL_FILTER("https://www.evo.com/ski-boots/atomic-hawx-prime-100"))
      .toBe(true);
  });

  it("rejects non-boot urls", () => {
    expect(PRODUCT_URL_FILTER("https://www.evo.com/ski/skis"))
      .toBe(false);
  });
});
