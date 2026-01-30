import "dotenv/config";
import { runCrawl } from "./runner";
import { CrawlMode } from "./common/types";
import { prisma } from "../lib/db";

function parseArgs() {
  const args = process.argv.slice(2);
  const options: Record<string, string | boolean> = {};

  for (const arg of args) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.replace(/^--/, "").split("=");
      options[key] = value ?? true;
    }
  }

  return options;
}

async function main() {
  const args = parseArgs();
  const source = (args.source as string) || "example";
  const mode = (args.mode as CrawlMode) || "discover";
  const limit = args.limit ? parseInt(String(args.limit), 10) : 50;
  const concurrency = args.concurrency ? parseInt(String(args.concurrency), 10) : 1;
  const dryRun = Boolean(args["dry-run"]);
  const since = args.since ? new Date(String(args.since)) : null;

  const stats = await runCrawl({
    sourceName: source,
    mode,
    limit,
    concurrency,
    dryRun,
    since
  });

  console.log(`[bootmatch] ${mode} complete`, stats);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
