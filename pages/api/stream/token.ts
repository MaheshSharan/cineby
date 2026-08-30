import type { NextApiRequest, NextApiResponse } from "next";
import { generateResolveToken } from "@/lib/security/resolveToken";
import { slidingWindowLimit } from "@/lib/security/rateLimit";
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

  const perUserKey = `rl:token:user:${sessionId}`;
  const perIpKey = `rl:token:ip:${ipPrefix}`;

  const userLimit = await slidingWindowLimit(perUserKey, {
    windowSecs: 60,
    max: 20,
  });
  if (!userLimit.allowed) {
    return res.status(429).json({ error: "Too many token requests" });
  }

  const ipLimit = await slidingWindowLimit(perIpKey, {
    windowSecs: 3600,
    max: 200,
  });
  if (!ipLimit.allowed) {
    return res.status(429).json({ error: "Too many token requests from IP" });
  }

  const token = generateResolveToken(sessionId, ipPrefix, tmdbId);

  return res.status(200).json({ token });
}
