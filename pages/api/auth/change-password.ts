import type { NextApiRequest, NextApiResponse } from "next";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { findUserById, updateUserPassword } from "@/lib/db/users";
import { logError } from "@/lib/logger";

interface ChangePasswordBody {
  currentPassword?: unknown;
  newPassword?: unknown;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    res.status(401).json({ error: "You must be logged in to change your password." });
    return;
  }

  const body = (req.body ?? {}) as ChangePasswordBody;
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Current password and new password are required." });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ error: "New password must be at least 8 characters." });
    return;
  }

  try {
    const userRow = findUserById(currentUser.id);
    if (!userRow) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const isValid = await verifyPassword(currentPassword, userRow.password_hash);
    if (!isValid) {
      res.status(400).json({ error: "Incorrect current password." });
      return;
    }

    const newPasswordHash = await hashPassword(newPassword);
    updateUserPassword(currentUser.id, newPasswordHash);

    res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    logError("api/auth/change-password", error);
    res.status(500).json({ error: "Unable to update password." });
  }
}
