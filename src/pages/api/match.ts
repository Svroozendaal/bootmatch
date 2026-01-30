import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/db";
import { matchBoots } from "../../lib/match";
import { BootDTO } from "../../types/boot";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const bootId = typeof req.query.bootId === "string" ? req.query.bootId : "";
  if (!bootId) {
    res.status(400).json({ error: "bootId required" });
    return;
  }

  const base = await prisma.boot.findUnique({
    where: { id: bootId }
  });

  if (!base) {
    res.status(404).json({ error: "boot not found" });
    return;
  }

  const boots = await prisma.boot.findMany({
    include: { offers: true }
  });

  const baseDto: BootDTO = {
    id: base.id,
    brand: base.brand,
    modelLine: base.modelLine,
    variant: base.variant,
    year: base.year,
    canonicalName: base.canonicalName,
    lastMm: base.lastMm,
    volumeClass: base.volumeClass,
    flexIndex: base.flexIndex,
    heelHold: base.heelHold,
    instepHeight: base.instepHeight,
    forefootShape: base.forefootShape,
    imageUrl: base.imageUrl
  };

  const bootDtos: BootDTO[] = boots.map((boot) => ({
    id: boot.id,
    brand: boot.brand,
    modelLine: boot.modelLine,
    variant: boot.variant,
    year: boot.year,
    canonicalName: boot.canonicalName,
    lastMm: boot.lastMm,
    volumeClass: boot.volumeClass,
    flexIndex: boot.flexIndex,
    heelHold: boot.heelHold,
    instepHeight: boot.instepHeight,
    forefootShape: boot.forefootShape,
    imageUrl: boot.imageUrl
  }));

  const matches = matchBoots(baseDto, bootDtos).map((match) => {
    const bootWithOffers = boots.find((b) => b.id === match.boot.id);
    const bestOffer = bootWithOffers?.offers
      ?.slice()
      .sort((a, b) => a.price - b.price)[0];

    return {
      ...match,
      bestOffer: bestOffer
        ? {
            price: bestOffer.price,
            currency: bestOffer.currency,
            retailer: bestOffer.retailer,
            url: bestOffer.url
          }
        : undefined
    };
  });

  res.status(200).json({ baseBoot: baseDto, matches });
}
