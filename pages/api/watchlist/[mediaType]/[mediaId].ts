import type { NextApiRequest, NextApiResponse } from "next";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { isInWatchlist, removeFromWatchlist } from "@/lib/db/watchlist";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getCurrentUser(req);

  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const mediaType = typeof req.query.mediaType === "string" ? req.query.mediaType : "";
  const mediaId = Number.parseInt(
    typeof req.query.mediaId === "string" ? req.query.mediaId : "",
    10
  );

  if ((mediaType !== "movie" && mediaType !== "tv") || !Number.isInteger(mediaId) || mediaId <= 0) {
    res.status(400).json({ error: "Invalid media identifier." });
    return;
  }

  if (req.method === "GET") {
    res.status(200).json({ inWatchlist: isInWatchlist(user.id, mediaType, mediaId, user.activeProfileId ?? undefined) });
    return;
  }

  if (req.method === "DELETE") {
    removeFromWatchlist(user.id, mediaType, mediaId, user.activeProfileId ?? undefined);
    res.status(200).json({ inWatchlist: false });
    return;
  }

  res.setHeader("Allow", "GET, DELETE");
  res.status(405).json({ error: "Method not allowed" });
}
