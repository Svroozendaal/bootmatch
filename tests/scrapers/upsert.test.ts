import { describe, expect, it } from "vitest";
import { chooseBootMatch } from "../../src/scrapers/common/upsert";

describe("upsert helpers", () => {
  it("chooses existing boot when canonicalName matches", () => {
    const existing = [{ id: "1", canonicalName: "Atomic Hawx Prime 100" }];
    const match = chooseBootMatch("Atomic Hawx Prime 100", existing);
    expect(match?.id).toBe("1");
  });
});
