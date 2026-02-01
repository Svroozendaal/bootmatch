import { generateSource } from "./generateSource";
import { generateTests } from "./generateTests";
import { inspectUrl } from "./inspect";
import { sanitizeSiteKey } from "./utils";

type Args = {
  _: string[];
  [key: string]: string | boolean | undefined;
};

function parseArgs(argv: string[]) {
  const args: Args = { _: [] };
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      args[key] = value ?? true;
    } else {
      args._.push(arg);
    }
  }
  return args;
}

function printHelp() {
  console.log(`BootMatch scraper onboarding

Commands:
  generate --siteKey=... --siteName="..." --baseDomain=https://... --method=sitemap|category_pagination|js_heavy [--categoryUrl=...] [--sitemapUrl=...] [--force]
  tests --siteKey=... [--force]
  inspect --url=https://... [--out=tests/fixtures/<siteKey>/sample.html]

Examples:
  npm run onboard:site -- generate --siteKey=testsite --siteName="Test Site" --baseDomain=https://example.com --method=category_pagination --categoryUrl=https://example.com/ski-boots
  npm run onboard:site -- tests --siteKey=testsite
  npm run onboard:site -- inspect --url=https://example.com/ski-boots
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = (args._[0] || "help").toLowerCase();

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "generate") {
    const siteKey = String(args.siteKey || "");
    const siteName = String(args.siteName || "");
    const baseDomain = String(args.baseDomain || "");
    const method = String(args.method || "") as
      | "sitemap"
      | "category_pagination"
      | "js_heavy";

    if (!siteKey || !siteName || !baseDomain || !method) {
      printHelp();
      throw new Error("Missing required arguments for generate.");
    }

    if (method === "sitemap" && !args.sitemapUrl) {
      throw new Error("Missing --sitemapUrl for sitemap discovery.");
    }
    if (method === "category_pagination" && !args.categoryUrl) {
      throw new Error("Missing --categoryUrl for category pagination discovery.");
    }

    const normalizedKey = sanitizeSiteKey(siteKey);
    if (normalizedKey !== siteKey) {
      console.log(`[onboard] Normalized siteKey to ${normalizedKey}`);
    }
    const result = generateSource({
      siteKey: normalizedKey,
      siteName,
      baseDomain,
      method,
      categoryUrl: args.categoryUrl ? String(args.categoryUrl) : undefined,
      sitemapUrl: args.sitemapUrl ? String(args.sitemapUrl) : undefined,
      force: Boolean(args.force)
    });

    console.log(`[onboard] Source created at ${result.sourceDir}`);
    if (result.registryResult.updated) {
      console.log("[onboard] Source registry updated.");
    }
    if (result.scriptsResult.patchPath) {
      console.log(
        `[onboard] Could not update package.json. See patch: ${result.scriptsResult.patchPath}`
      );
    } else if (result.scriptsResult.updated) {
      console.log("[onboard] Added crawl script to package.json.");
    }
    console.log("[onboard] Next steps: update selectors + add fixtures.");
    if (method === "js_heavy") {
      console.log(
        "[onboard] js_heavy selected. Plan to use a rendered source (e.g. Playwright) or a sitemap export."
      );
    }
    return;
  }

  if (command === "tests") {
    const siteKey = String(args.siteKey || "");
    if (!siteKey) {
      printHelp();
      throw new Error("Missing --siteKey for tests.");
    }
    const result = generateTests({
      siteKey,
      force: Boolean(args.force)
    });
    console.log(`[onboard] Fixtures + tests created for ${result.siteKey}`);
    return;
  }

  if (command === "inspect") {
    const url = String(args.url || "");
    if (!url) {
      printHelp();
      throw new Error("Missing --url for inspect.");
    }
    await inspectUrl(url, args.out ? String(args.out) : undefined);
    return;
  }

  printHelp();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
