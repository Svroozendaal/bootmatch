import path from "path";
import { fixturesReadmeTemplate } from "./templates/fixturesReadme";
import { testTemplate } from "./templates/test";
import {
  ensureDir,
  sanitizeSiteKey,
  toPascalCase,
  writeFileSafe
} from "./utils";

export type GenerateTestsOptions = {
  siteKey: string;
  siteName?: string;
  force?: boolean;
};

const placeholderHtml = `<!-- TODO: Replace with real HTML from the target site -->
<html>
  <head>
    <title>Placeholder Product</title>
  </head>
  <body>
    <h1>Placeholder Ski Boot 100</h1>
    <p>Last: 100mm</p>
    <p>Flex: 100</p>
  </body>
</html>
`;

export function generateTests(options: GenerateTestsOptions) {
  const siteKey = sanitizeSiteKey(options.siteKey);
  const siteName = options.siteName ?? siteKey;
  const pascalName = toPascalCase(siteKey);

  const fixturesDir = path.join(
    process.cwd(),
    "tests",
    "fixtures",
    siteKey
  );
  ensureDir(fixturesDir);

  const results = [
    writeFileSafe(
      path.join(fixturesDir, "README.md"),
      fixturesReadmeTemplate({ siteKey, siteName }),
      options.force
    ),
    writeFileSafe(
      path.join(fixturesDir, "product1.html"),
      placeholderHtml,
      options.force
    ),
    writeFileSafe(
      path.join(fixturesDir, "product2.html"),
      placeholderHtml,
      options.force
    ),
    writeFileSafe(
      path.join(process.cwd(), "tests", `${siteKey}.parse.test.ts`),
      testTemplate({ siteKey, pascalName }),
      options.force
    )
  ];

  return { siteKey, results };
}
