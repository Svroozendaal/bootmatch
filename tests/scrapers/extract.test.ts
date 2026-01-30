import { describe, expect, it } from "vitest";
import { extractFlexIndex, extractLastMm } from "../../src/scrapers/common/extract";

describe("extractors", () => {
  it("extracts last mm", () => {
    expect(extractLastMm("Last: 100 mm"))
      .toBe(100);
  });

  it("extracts flex index", () => {
    expect(extractFlexIndex("Flex 120"))
      .toBe(120);
  });
});
