import { tokenSimilarity } from "./fuzzy";
import { normalize } from "./normalize";
import { BootDTO } from "../types/boot";

export type BootAliasDTO = { alias: string };
export type BootWithAliases = BootDTO & { aliases: BootAliasDTO[] };

export type ResolveResult =
  | { status: "ok"; bootId: string; confidence: number }
  | {
      status: "ambiguous";
      confidence: number;
      alternatives: { bootId: string; label: string; score: number }[];
    }
  | { status: "not_found" };

export function resolveFromData(
  query: string,
  boots: BootWithAliases[]
): ResolveResult {
  const normalized = normalize(query);
  if (!normalized) return { status: "not_found" };

  for (const boot of boots) {
    if (normalize(boot.canonicalName) === normalized) {
      return { status: "ok", bootId: boot.id, confidence: 1 };
    }
    for (const a of boot.aliases || []) {
      if (normalize(a.alias) === normalized) {
        return { status: "ok", bootId: boot.id, confidence: 1 };
      }
    }
  }

  const scored = boots
    .map((boot) => {
      let best = tokenSimilarity(query, boot.canonicalName);
      for (const a of boot.aliases || []) {
        best = Math.max(best, tokenSimilarity(query, a.alias));
      }
      return { boot, score: best };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored[0];
  if (!top || top.score < 0.55) {
    return { status: "not_found" };
  }

  const alternatives = scored.slice(0, 3).map((item) => ({
    bootId: item.boot.id,
    label: item.boot.canonicalName,
    score: Math.round(item.score * 100) / 100
  }));

  return {
    status: "ambiguous",
    confidence: Math.round(top.score * 100) / 100,
    alternatives
  };
}
