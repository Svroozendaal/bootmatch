import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/db";
import { resolveFromData } from "../../lib/resolver";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const boots = await prisma.boot.findMany({
    include: { aliases: true }
  });

  const result = resolveFromData(q, boots);
  res.status(200).json(result);
}
