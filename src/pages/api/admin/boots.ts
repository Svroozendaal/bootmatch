import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/db";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const boots = await prisma.boot.findMany({
    orderBy: { canonicalName: "asc" }
  });
  res.status(200).json({
    count: boots.length,
    boots: boots.map((b) => ({
      id: b.id,
      canonicalName: b.canonicalName,
      lastMm: b.lastMm,
      volumeClass: b.volumeClass,
      flexIndex: b.flexIndex
    }))
  });
}
