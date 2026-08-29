import type { NextApiRequest, NextApiResponse } from "next";
import { hashPassword } from "@/lib/auth/password";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { deleteProfile, findProfile, listProfiles, updateProfile } from "@/lib/db/profiles";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getCurrentUser(req);
  if (!user) { res.status(401).json({ error: "Authentication required" }); return; }
  const profileId = Number(req.query.id);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const profile = findProfile(user.id, profileId);
  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }
  if (req.method === "DELETE") {
    if (findProfileCount(user.id) <= 1) { res.status(409).json({ error: "The last profile cannot be deleted." }); return; }
    deleteProfile(user.id, profileId);
    res.status(204).end();
    return;
  }
  if (req.method === "PATCH") {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 40) : profile.name;
    const avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl : profile.avatar_url;
    if (!name || !/^\/avatar\/classic-(?:[1-9]|1\d|2\d|30)\.png$/.test(avatarUrl)) {
      res.status(400).json({ error: "Invalid profile data" });
      return;
    }
    const hasPinInput = typeof body.pin === "string";
    const pin = hasPinInput ? String(body.pin).trim() : "";
    if (hasPinInput && pin && !/^\d{4,8}$/.test(pin)) {
      res.status(400).json({ error: "PIN must be 4 to 8 digits." });
      return;
    }
    const updated = updateProfile(user.id, profileId, {
      name,
      avatarUrl,
      pinHash: hasPinInput ? (pin ? await hashPassword(pin) : null) : profile.pin_hash,
      movieGenres: Array.isArray(body.movieGenres) ? body.movieGenres.filter((item): item is string => typeof item === "string") : [],
      tvGenres: Array.isArray(body.tvGenres) ? body.tvGenres.filter((item): item is string => typeof item === "string") : [],
    });
    res.status(200).json({ profile: updated ? { id: updated.id, name: updated.name, avatarUrl: updated.avatar_url, hasPin: Boolean(updated.pin_hash) } : null });
    return;
  }
  res.setHeader("Allow", "PATCH, DELETE");
  res.status(405).json({ error: "Method not allowed" });
}

function findProfileCount(userId: number): number {
  return listProfiles(userId).length;
}
