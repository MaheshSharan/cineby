import type { NextApiRequest, NextApiResponse } from "next";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { findUserById, toPublicUser, updateUserAvatar } from "@/lib/db/users";
import { logError } from "@/lib/logger";

const MAX_AVATAR_SIZE_BYTES = 3 * 1024 * 1024; // 3MB

interface AvatarBody {
  avatar?: unknown;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    res.status(401).json({ error: "You must be logged in to update your avatar." });
    return;
  }

  const body = (req.body ?? {}) as AvatarBody;
  const avatar = typeof body.avatar === "string" ? body.avatar.trim() : "";

  if (!avatar) {
    res.status(400).json({ error: "Avatar data is required." });
    return;
  }

  if (avatar.length > MAX_AVATAR_SIZE_BYTES) {
    res.status(400).json({ error: "Avatar file size must be less than 3MB." });
    return;
  }

  if (!avatar.startsWith("data:image/") && !avatar.startsWith("https://") && !avatar.startsWith("/")) {
    res.status(400).json({ error: "Invalid image format." });
    return;
  }

  try {
    updateUserAvatar(currentUser.id, avatar);
    const updatedUserRow = findUserById(currentUser.id);

    if (!updatedUserRow) {
      res.status(500).json({ error: "Failed to load updated user." });
      return;
    }

    res.status(200).json({
      success: true,
      user: toPublicUser(updatedUserRow),
    });
  } catch (error) {
    logError("api/auth/avatar", error);
    res.status(500).json({ error: "Unable to update avatar." });
  }
}
