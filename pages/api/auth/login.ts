import type { NextApiRequest, NextApiResponse } from "next";

import { verifyPassword } from "@/lib/auth/password";
import {
  buildSessionCookie,
  createSessionToken,
  SESSION_TTL_MS,
} from "@/lib/auth/session";
import { createSession } from "@/lib/db/sessions";
import { ensureDefaultProfile } from "@/lib/db/profiles";
import { findUserByIdentifier, toPublicUser } from "@/lib/db/users";
import { logError } from "@/lib/logger";
import { allowAuthAttempt, authClientKey } from "@/lib/auth/rateLimit";

interface LoginBody {
  email?: unknown;
  username?: unknown;
  password?: unknown;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as LoginBody;
  const rawIdentifier =
    typeof body.username === "string" && body.username.trim()
      ? body.username.trim()
      : typeof body.email === "string" && body.email.trim()
      ? body.email.trim()
      : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!allowAuthAttempt(authClientKey(req, rawIdentifier))) {
    res.status(429).json({ error: "Too many attempts. Try again later." });
    return;
  }

  if (!rawIdentifier || !password) {
    res.status(400).json({ error: "Username/email and password are required." });
    return;
  }

  try {
    const user = findUserByIdentifier(rawIdentifier);

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      res.status(401).json({ error: "Invalid username/email or password." });
      return;
    }

    const token = createSessionToken();
    createSession(user.id, token, new Date(Date.now() + SESSION_TTL_MS).toISOString());

    // Fallback for users who abandoned onboarding: they must end up with at
    // least one profile, but never while the signup wizard is still in flight.
    ensureDefaultProfile(user.id, user.display_name ?? user.email.split("@")[0]);

    res.setHeader("Set-Cookie", buildSessionCookie(token));
    res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    logError("api/auth/login", error);
    res.status(500).json({ error: "Unable to log in." });
  }
}
