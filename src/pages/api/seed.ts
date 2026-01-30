import type { NextApiRequest, NextApiResponse } from "next";
import { seedDatabase } from "../../lib/seed";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST required" });
    return;
  }

  await seedDatabase();
  res.status(200).json({ status: "ok" });
}
