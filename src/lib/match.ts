import { BootDTO } from "../types/boot";

export type MatchResult = {
  boot: BootDTO;
  score: number;
  reasons: string[];
};

function scoreLastMm(base?: number | null, other?: number | null) {
  if (!base || !other) return { score: 0.5, reason: null };
  const diff = Math.abs(base - other);
  if (diff <= 2) return { score: 1, reason: `Last within 2mm (${base} vs ${other})` };
  if (diff <= 4) return { score: 0.7, reason: `Last within 4mm (${base} vs ${other})` };
  if (diff <= 6) return { score: 0.4, reason: `Last within 6mm (${base} vs ${other})` };
  return { score: 0.1, reason: `Last differs (${base} vs ${other})` };
}

function scoreFlex(base?: number | null, other?: number | null) {
  if (!base || !other) return { score: 0.5, reason: null };
  const diff = Math.abs(base - other);
  if (diff <= 10) return { score: 1, reason: `Similar flex (${base} vs ${other})` };
  if (diff <= 20) return { score: 0.7, reason: `Close flex (${base} vs ${other})` };
  if (diff <= 30) return { score: 0.4, reason: `Flex somewhat different (${base} vs ${other})` };
  return { score: 0.1, reason: `Flex different (${base} vs ${other})` };
}

function scoreCategory(
  label: string,
  base?: string | null,
  other?: string | null
) {
  if (!base || !other) return { score: 0.5, reason: null };
  if (base === other) return { score: 1, reason: `Same ${label} (${base})` };
  return { score: 0.3, reason: null };
}

export function scoreBoots(base: BootDTO, candidate: BootDTO) {
  const reasons: string[] = [];

  const last = scoreLastMm(base.lastMm, candidate.lastMm);
  if (last.reason) reasons.push(last.reason);

  const volume = scoreCategory("volume class", base.volumeClass, candidate.volumeClass);
  if (volume.reason) reasons.push(volume.reason);

  const heel = scoreCategory("heel hold", base.heelHold, candidate.heelHold);
  if (heel.reason) reasons.push(heel.reason);
  const instep = scoreCategory("instep height", base.instepHeight, candidate.instepHeight);
  if (instep.reason) reasons.push(instep.reason);
  const forefoot = scoreCategory("forefoot shape", base.forefootShape, candidate.forefootShape);
  if (forefoot.reason) reasons.push(forefoot.reason);

  const flex = scoreFlex(base.flexIndex, candidate.flexIndex);
  if (flex.reason) reasons.push(flex.reason);

  const shapeScores = [heel.score, instep.score, forefoot.score];
  const shapeScore =
    shapeScores.reduce((sum, v) => sum + v, 0) / shapeScores.length;

  const total =
    last.score * 0.35 +
    volume.score * 0.25 +
    shapeScore * 0.3 +
    flex.score * 0.1;

  const score = Math.round(total * 100) / 10; // 0..10

  return { score, reasons };
}

export function matchBoots(base: BootDTO, boots: BootDTO[]): MatchResult[] {
  const withoutBase = boots.filter((b) => b.id !== base.id);

  let candidates = withoutBase;
  if (base.volumeClass) {
    const sameVolume = candidates.filter(
      (b) => b.volumeClass && b.volumeClass === base.volumeClass
    );
    if (sameVolume.length > 0) {
      candidates = sameVolume;
    }
  }

  const withinLast = candidates.filter((b) => {
    if (!base.lastMm || !b.lastMm) return true;
    return Math.abs(base.lastMm - b.lastMm) <= 4;
  });
  if (withinLast.length > 0) {
    candidates = withinLast;
  }

  const scored = candidates
    .map((candidate) => {
      const { score, reasons } = scoreBoots(base, candidate);
      return { boot: candidate, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return scored;
}
