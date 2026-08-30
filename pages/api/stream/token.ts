import type { NextApiRequest, NextApiResponse } from "next";
import { generateResolveToken } from "@/lib/security/resolveToken";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ token: string } | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const tmdbId = Number.parseInt(String(req.query.tmdbId ?? ""), 10);
  if (!tmdbId || Number.isNaN(tmdbId)) {
    return res.status(400).json({ error: "Invalid tmdbId" });
  }

  const user = getCurrentUser(req);
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    ?? req.socket.remoteAddress
    ?? "0.0.0.0";
  const ipPrefix = ip.split(".").slice(0, 3).join(".");
  const sessionId = user?.id?.toString() ?? "anon";

  const token = generateResolveToken(sessionId, ipPrefix, tmdbId);

  return res.status(200).json({ token });
}
