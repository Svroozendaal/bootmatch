import { describe, expect, it } from "vitest";
import { normalize } from "../src/lib/normalize";

describe("normalize", () => {
  it("normalizes slashes and casing", () => {
    expect(normalize("Salomon S/Pro 100"))
      .toBe("salomon s pro 100");
  });

  it("normalizes gripwalk to gw", () => {
    expect(normalize("GripWalk"))
      .toBe("gw");
  });
});
