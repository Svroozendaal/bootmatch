import { normalize } from "../../lib/normalize";
import { prisma } from "../../lib/db";
import { ParsedBoot } from "./types";

export function buildCanonicalName(parsed: ParsedBoot) {
  const parts = [parsed.brand, parsed.modelLine, parsed.variant, parsed.year]
    .filter(Boolean)
    .map(String);
  if (!parts.length) return null;
  return parts.join(" ").trim();
}

export function buildAliases(canonicalName: string) {
  const base = normalize(canonicalName);
  const noSpaces = base.replace(/\s+/g, "");
  const gw = base.replace(/gripwalk/g, "gw");
  return Array.from(new Set([base, noSpaces, gw])).filter(Boolean);
}

export function chooseBootMatch(
  canonicalName: string,
  existing: { id: string; canonicalName: string }[]
) {
  const target = normalize(canonicalName);
  return existing.find((boot) => normalize(boot.canonicalName) === target) || null;
}

export async function upsertBootFromParsed(parsed: ParsedBoot) {
  if (!parsed.canonicalName || !parsed.brand || !parsed.modelLine) {
    return { bootId: null, created: false };
  }

  const canonicalName = parsed.canonicalName;
  const existing = await prisma.boot.findMany({
    where: { canonicalName },
    select: { id: true, canonicalName: true }
  });

  let match = chooseBootMatch(canonicalName, existing);
  if (!match) {
    const aliases = buildAliases(canonicalName);
    const aliasMatch = await prisma.bootAlias.findFirst({
      where: { alias: { in: aliases } }
    });
    if (aliasMatch) {
      match = { id: aliasMatch.bootId, canonicalName };
    }
  }

  const data = {
    brand: parsed.brand,
    modelLine: parsed.modelLine,
    variant: parsed.variant,
    year: parsed.year,
    canonicalName,
    lastMm: parsed.lastMm,
    volumeClass: parsed.volumeClass,
    flexIndex: parsed.flexIndex,
    heelHold: parsed.heelHold,
    instepHeight: parsed.instepHeight,
    forefootShape: parsed.forefootShape,
    imageUrl: parsed.imageUrl
  };

  let bootId: string;

  if (match) {
    const updated = await prisma.boot.update({
      where: { id: match.id },
      data: Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== null && value !== undefined)
      )
    });
    bootId = updated.id;
  } else {
    const created = await prisma.boot.create({ data });
    bootId = created.id;
  }

  const aliases = buildAliases(canonicalName);
  for (const alias of aliases) {
    await prisma.bootAlias.upsert({
      where: { alias },
      update: { bootId },
      create: { alias, bootId }
    });
  }

  return { bootId, created: !match };
}
