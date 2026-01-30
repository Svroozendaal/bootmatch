import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { parseEvo } from "../../src/scrapers/sources/evo/parse";

const fixturePath = (name: string) =>
  path.join(process.cwd(), "tests", "fixtures", "evo", name);

describe("evo parser", () => {
  it("extracts last mm and flex from product1", async () => {
    const html = fs.readFileSync(fixturePath("product1.html"), "utf-8");
    const result = await parseEvo("https://www.evo.com/ski-boots/atomic-hawx-prime-100", html);
    expect(result.parsed?.lastMm).toBe(100);
    expect(result.parsed?.flexIndex).toBe(100);
  });

  it("extracts last mm and flex from product2", async () => {
    const html = fs.readFileSync(fixturePath("product2.html"), "utf-8");
    const result = await parseEvo("https://www.evo.com/ski-boots/salomon-s-pro-120", html);
    expect(result.parsed?.lastMm).toBe(98);
    expect(result.parsed?.flexIndex).toBe(120);
  });
});
