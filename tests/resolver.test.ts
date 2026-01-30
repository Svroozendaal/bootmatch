import { describe, expect, it } from "vitest";
import { resolveFromData } from "../src/lib/resolver";

const boots = [
  {
    id: "boot1",
    brand: "Salomon",
    modelLine: "S/Pro",
    variant: "100",
    year: 2023,
    canonicalName: "Salomon S/Pro 100",
    lastMm: 100,
    volumeClass: "MV",
    flexIndex: 100,
    heelHold: "medium",
    instepHeight: "medium",
    forefootShape: "neutral",
    imageUrl: null,
    aliases: [{ alias: "spro 100" }]
  }
];

describe("resolver", () => {
  it("resolves exact alias", () => {
    const result = resolveFromData("spro 100", boots);
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.bootId).toBe("boot1");
    }
  });
});
