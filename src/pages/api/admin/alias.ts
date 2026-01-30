import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST required" });
    return;
  }

  const { bootId, alias } = req.body as { bootId?: string; alias?: string };
  if (!bootId || !alias) {
    res.status(400).json({ error: "bootId and alias required" });
    return;
  }

  const boot = await prisma.boot.findUnique({ where: { id: bootId } });
  if (!boot) {
    res.status(404).json({ error: "boot not found" });
    return;
  }

  const saved = await prisma.bootAlias.upsert({
    where: { alias },
    update: { bootId },
    create: { alias, bootId }
  });

  res.status(200).json({ status: "ok", alias: saved.alias });
}
