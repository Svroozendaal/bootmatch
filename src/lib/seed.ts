import fs from "fs";
import path from "path";
import { prisma } from "./db";

export async function seedDatabase() {
  const dataPath = path.join(process.cwd(), "src", "data", "boots.seed.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const { boots } = JSON.parse(raw) as { boots: any[] };

  for (const boot of boots) {
    const saved = await prisma.boot.upsert({
      where: { canonicalName: boot.canonicalName },
      update: {
        brand: boot.brand,
        modelLine: boot.modelLine,
        variant: boot.variant ?? null,
        year: boot.year ?? null,
        lastMm: boot.lastMm ?? null,
        volumeClass: boot.volumeClass ?? null,
        flexIndex: boot.flexIndex ?? null,
        heelHold: boot.heelHold ?? null,
        instepHeight: boot.instepHeight ?? null,
        forefootShape: boot.forefootShape ?? null,
        imageUrl: boot.imageUrl ?? null
      },
      create: {
        brand: boot.brand,
        modelLine: boot.modelLine,
        variant: boot.variant ?? null,
        year: boot.year ?? null,
        canonicalName: boot.canonicalName,
        lastMm: boot.lastMm ?? null,
        volumeClass: boot.volumeClass ?? null,
        flexIndex: boot.flexIndex ?? null,
        heelHold: boot.heelHold ?? null,
        instepHeight: boot.instepHeight ?? null,
        forefootShape: boot.forefootShape ?? null,
        imageUrl: boot.imageUrl ?? null
      }
    });

    const aliases = boot.aliases || [];
    for (const alias of aliases) {
      await prisma.bootAlias.upsert({
        where: { alias },
        update: { bootId: saved.id },
        create: { alias, bootId: saved.id }
      });
    }

    const offers = boot.offers || [];
    for (const offer of offers) {
      const exists = await prisma.offer.findFirst({
        where: {
          bootId: saved.id,
          url: offer.url
        }
      });
      if (!exists) {
        await prisma.offer.create({
          data: {
            bootId: saved.id,
            retailer: offer.retailer,
            price: offer.price,
            currency: offer.currency || "EUR",
            url: offer.url,
            lastCheckedAt: offer.lastCheckedAt ? new Date(offer.lastCheckedAt) : null
          }
        });
      }
    }
  }
}
