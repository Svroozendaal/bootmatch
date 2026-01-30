import { describe, expect, it } from "vitest";
import { matchBoots } from "../src/lib/match";

const base = {
  id: "base",
  brand: "Brand",
  modelLine: "Base",
  variant: "100",
  year: 2023,
  canonicalName: "Base 100",
  lastMm: 100,
  volumeClass: "MV",
  flexIndex: 100,
  heelHold: "medium",
  instepHeight: "medium",
  forefootShape: "neutral",
  imageUrl: null
};

const close = {
  id: "close",
  brand: "Brand",
  modelLine: "Close",
  variant: "100",
  year: 2023,
  canonicalName: "Close 100",
  lastMm: 100,
  volumeClass: "MV",
  flexIndex: 100,
  heelHold: "medium",
  instepHeight: "medium",
  forefootShape: "neutral",
  imageUrl: null
};

const far = {
  id: "far",
  brand: "Brand",
  modelLine: "Far",
  variant: "100",
  year: 2023,
  canonicalName: "Far 100",
  lastMm: 104,
  volumeClass: "HV",
  flexIndex: 130,
  heelHold: "roomy",
  instepHeight: "high",
  forefootShape: "roomy",
  imageUrl: null
};

describe("match", () => {
  it("ranks closer boot higher", () => {
    const results = matchBoots(base, [close, far]);
    expect(results[0].boot.id).toBe("close");
  });
});
