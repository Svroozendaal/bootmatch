import { prisma } from "../lib/db";
import { CrawlMode, CrawlStats, ParsedBoot } from "./common/types";
import { fetchWithRetry } from "./common/fetch";
import { isAllowedByRobots } from "./common/robots";
import { upsertBootFromParsed } from "./common/upsert";
import { getSource } from "./sources";

export type CrawlOptions = {
  sourceName: string;
  mode: CrawlMode;
  limit: number;
  concurrency: number;
  dryRun: boolean;
  since?: Date | null;
};

type ParsedEnvelope = {
  parsed: ParsedBoot | null;
  rawTitle: string | null;
  rawSpecs: Record<string, string> | null;
};

async function withConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>
) {
  const queue = items.slice();
  const runners = Array.from({ length: Math.max(1, concurrency) }).map(async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) return;
      await worker(item);
    }
  });
  await Promise.all(runners);
}

export async function runCrawl(options: CrawlOptions) {
  const source = getSource(options.sourceName);
  const stats: CrawlStats = {
    discovered: 0,
    fetched: 0,
    parsed: 0,
    upserted: 0,
    failed: 0
  };

  const run = await prisma.crawlRun.create({
    data: {
      sourceName: options.sourceName,
      mode: options.mode,
      startedAt: new Date()
    }
  });

  try {
    if (options.mode === "discover") {
      const urls = await source.discover();
      const limited = urls.slice(0, options.limit);
      for (const url of limited) {
        await prisma.crawlUrl.upsert({
          where: { sourceName_url: { sourceName: options.sourceName, url } },
          update: { status: "discovered" },
          create: { sourceName: options.sourceName, url, status: "discovered" }
        });
        stats.discovered += 1;
      }
    }

    if (options.mode === "parse") {
      const sinceFilter = options.since
        ? {
            OR: [
              { lastFetchedAt: null },
              { lastFetchedAt: { lt: options.since } }
            ]
          }
        : {};
      const urls = await prisma.crawlUrl.findMany({
        where: {
          sourceName: options.sourceName,
          ...sinceFilter
        },
        orderBy: { createdAt: "asc" },
        take: options.limit
      });

      await withConcurrency(urls, options.concurrency, async (item) => {
        const allowed = await isAllowedByRobots(item.url);
        if (!allowed) {
          await prisma.crawlUrl.update({
            where: { id: item.id },
            data: {
              status: "failed",
              lastError: "Blocked by robots.txt",
              lastFetchedAt: new Date()
            }
          });
          stats.failed += 1;
          return;
        }

        const result = await fetchWithRetry(item.url, { minDelayMs: 1000, retries: 3 });
        stats.fetched += 1;

        if (!result.ok || !result.text) {
          await prisma.crawlUrl.update({
            where: { id: item.id },
            data: {
              status: "failed",
              lastError: result.error,
              httpStatus: result.status,
              etag: result.etag ?? undefined,
              lastFetchedAt: new Date()
            }
          });
          stats.failed += 1;
          return;
        }

        const envelope = await source.parse(item.url, result.text);
        if (envelope.parsed) {
          stats.parsed += 1;
        }

        const rawSpecsBlob = JSON.stringify({
          rawSpecs: envelope.rawSpecs,
          parsed: envelope.parsed
        });

        if (!options.dryRun) {
          await prisma.source.upsert({
            where: { sourceUrl: item.url },
            update: {
              rawTitle: envelope.rawTitle,
              rawSpecsBlob,
              lastSeenAt: new Date()
            },
            create: {
              sourceUrl: item.url,
              rawTitle: envelope.rawTitle,
              rawSpecsBlob,
              lastSeenAt: new Date()
            }
          });
        }

        await prisma.crawlUrl.update({
          where: { id: item.id },
          data: {
            status: "parsed",
            httpStatus: result.status,
            etag: result.etag ?? undefined,
            lastFetchedAt: new Date(),
            lastError: null
          }
        });
      });
    }

    if (options.mode === "ingest") {
      const sources = await prisma.source.findMany({
        orderBy: { lastSeenAt: "desc" },
        take: options.limit
      });

      for (const sourceItem of sources) {
        if (!sourceItem.rawSpecsBlob) continue;
        let parsed: ParsedBoot | null = null;
        try {
          const json = JSON.parse(sourceItem.rawSpecsBlob);
          parsed = json?.parsed ?? null;
        } catch {
          parsed = null;
        }
        if (!parsed) continue;

        if (options.dryRun) {
          stats.upserted += 1;
          continue;
        }

        const result = await upsertBootFromParsed(parsed);
        if (result.bootId) {
          await prisma.source.update({
            where: { id: sourceItem.id },
            data: { bootId: result.bootId }
          });
          stats.upserted += 1;
        }
      }
    }

    await prisma.crawlRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        discoveredCount: stats.discovered,
        fetchedCount: stats.fetched,
        parsedCount: stats.parsed,
        upsertedCount: stats.upserted,
        failedCount: stats.failed,
        log: options.dryRun ? "dry-run" : null
      }
    });

    return stats;
  } catch (error) {
    await prisma.crawlRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        failedCount: stats.failed + 1,
        log: (error as Error).message
      }
    });
    throw error;
  }
}
