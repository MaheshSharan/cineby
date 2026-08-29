import type { NextApiRequest, NextApiResponse } from "next";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createProfile, listProfiles } from "@/lib/db/profiles";

const DEFAULT_AVATAR = "/avatar/classic-1.png";
const MAX_PROFILES = 5;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getCurrentUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.method === "GET") {
    const profiles = listProfiles(user.id);
    res.status(200).json({ profiles: profiles.map(toPublicProfile), activeProfileId: user.activeProfileId ?? profiles[0]?.id });
    return;
  }

  if (req.method === "POST") {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 40) : "";
    const avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl : DEFAULT_AVATAR;
    if (!name) {
      res.status(400).json({ error: "Profile name is required." });
      return;
    }
    if (!/^\/avatar\/classic-(?:[1-9]|1\d|2\d|30)\.png$/.test(avatarUrl)) {
      res.status(400).json({ error: "Invalid avatar." });
      return;
    }
    if (listProfiles(user.id).length >= MAX_PROFILES) {
      res.status(409).json({ error: "Maximum profile limit reached." });
      return;
    }
    const profile = createProfile(user.id, { name, avatarUrl });
    res.status(201).json({ profile: toPublicProfile(profile) });
    return;
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).json({ error: "Method not allowed" });
}

function toPublicProfile(profile: ReturnType<typeof createProfile>) {
  return {
    id: profile.id,
    name: profile.name,
    avatarUrl: profile.avatar_url,
    hasPin: Boolean(profile.pin_hash),
    movieGenres: parseGenres(profile.movie_genres),
    tvGenres: parseGenres(profile.tv_genres),
  };
}

function parseGenres(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : [];
  } catch {
    return [];
  }
}
