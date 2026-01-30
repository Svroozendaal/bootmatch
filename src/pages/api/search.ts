import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/db";
import { normalize } from "../../lib/normalize";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const nq = normalize(q);
  if (!nq) {
    res.status(200).json([]);
    return;
  }

  const boots = await prisma.boot.findMany({
    include: { aliases: true }
  });

  const matches: { bootId: string; label: string }[] = [];

  for (const boot of boots) {
    const hay = [boot.canonicalName, ...boot.aliases.map((a) => a.alias)];
    if (hay.some((h) => normalize(h).includes(nq))) {
      matches.push({ bootId: boot.id, label: boot.canonicalName });
    }
  }

  res.status(200).json(matches.slice(0, 10));
}
