import type { NextApiRequest, NextApiResponse } from "next";

import { hashPassword } from "@/lib/auth/password";
import {
  buildSessionCookie,
  createSessionToken,
  SESSION_TTL_MS,
} from "@/lib/auth/session";
import { createSession } from "@/lib/db/sessions";
import { findUserByIdentifier, toPublicUser, updateUserPassword } from "@/lib/db/users";
import { logError } from "@/lib/logger";

interface ResetPasswordBody {
  username?: unknown;
  email?: unknown;
  newPassword?: unknown;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as ResetPasswordBody;
  const rawIdentifier =
    typeof body.username === "string" && body.username.trim()
      ? body.username.trim()
      : typeof body.email === "string" && body.email.trim()
      ? body.email.trim()
      : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!rawIdentifier) {
    res.status(400).json({ error: "Username or email is required." });
    return;
  }

  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ error: "New password must be at least 8 characters." });
    return;
  }

  try {
    const user = findUserByIdentifier(rawIdentifier);
    if (!user) {
      res.status(404).json({ error: "Account not found with that username or email." });
      return;
    }

    const passwordHash = await hashPassword(newPassword);
    updateUserPassword(user.id, passwordHash);

    const token = createSessionToken();
    createSession(user.id, token, new Date(Date.now() + SESSION_TTL_MS).toISOString());

    res.setHeader("Set-Cookie", buildSessionCookie(token));
    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
      user: toPublicUser(user),
    });
  } catch (error) {
    logError("api/auth/reset-password", error);
    res.status(500).json({ error: "Unable to reset password." });
  }
}
