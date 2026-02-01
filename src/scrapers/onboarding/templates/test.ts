export type TestTemplateOptions = {
  siteKey: string;
  pascalName: string;
};

export function testTemplate(options: TestTemplateOptions) {
  return `import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { parse${options.pascalName} } from "../src/scrapers/sources/${options.siteKey}/parse";

const fixturePath = (name: string) =>
  path.join(process.cwd(), "tests", "fixtures", "${options.siteKey}", name);

function isPlaceholder(html: string) {
  return html.includes("TODO: Replace with real HTML");
}

const html1 = fs.readFileSync(fixturePath("product1.html"), "utf-8");
const html2 = fs.readFileSync(fixturePath("product2.html"), "utf-8");
const hasRealFixtures = !isPlaceholder(html1) && !isPlaceholder(html2);

const run = hasRealFixtures ? it : it.skip;

describe("${options.siteKey} parser", () => {
  run("extracts last mm and flex from product1", async () => {
    const result = await parse${options.pascalName}("https://example.com/product-1", html1);
    // TODO: Update expected values to match your fixtures.
    expect(result.parsed?.lastMm).toBe(100);
    expect(result.parsed?.flexIndex).toBe(100);
  });

  run("extracts last mm and flex from product2", async () => {
    const result = await parse${options.pascalName}("https://example.com/product-2", html2);
    // TODO: Update expected values to match your fixtures.
    expect(result.parsed?.lastMm).toBe(98);
    expect(result.parsed?.flexIndex).toBe(120);
  });
});
`;
}
