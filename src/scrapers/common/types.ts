export type ParsedBoot = {
  sourceUrl: string;
  canonicalName: string | null;
  brand: string | null;
  modelLine: string | null;
  variant: string | null;
  year: number | null;
  rawTitle: string | null;
  rawSpecs: Record<string, string> | null;
  description: string | null;
  imageUrl: string | null;
  lastMm: number | null;
  volumeClass: "LV" | "MV" | "HV" | null;
  flexIndex: number | null;
  heelHold: "narrow" | "medium" | "roomy" | null;
  instepHeight: "low" | "medium" | "high" | null;
  forefootShape: "tapered" | "neutral" | "roomy" | null;
};

export type CrawlMode = "discover" | "parse" | "ingest";

export type CrawlStats = {
  discovered: number;
  fetched: number;
  parsed: number;
  upserted: number;
  failed: number;
};

export type FetchResult = {
  url: string;
  status: number;
  ok: boolean;
  etag: string | null;
  text: string | null;
  error: string | null;
};
