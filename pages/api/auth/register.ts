import type { NextApiRequest, NextApiResponse } from "next";

import { hashPassword } from "@/lib/auth/password";
import {
  buildSessionCookie,
  createSessionToken,
  SESSION_TTL_MS,
} from "@/lib/auth/session";
import { createSession } from "@/lib/db/sessions";
import { createUser, findUserByIdentifier, toPublicUser } from "@/lib/db/users";
import { logError } from "@/lib/logger";
import { allowAuthAttempt, authClientKey } from "@/lib/auth/rateLimit";

interface RegisterBody {
  email?: unknown;
  username?: unknown;
  password?: unknown;
  displayName?: unknown;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as RegisterBody;
  const rawIdentifier =
    typeof body.username === "string" && body.username.trim()
      ? body.username.trim()
      : typeof body.email === "string" && body.email.trim()
        ? body.email.trim()
        : "";
  const identifier = rawIdentifier.toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const rawDisplayName =
    typeof body.displayName === "string" && body.displayName.trim()
      ? body.displayName.trim()
      : rawIdentifier;
  const displayName = rawDisplayName ? rawDisplayName.slice(0, 60) : null;

  if (!allowAuthAttempt(authClientKey(req, rawIdentifier))) {
    res.status(429).json({ error: "Too many attempts. Try again later." });
    return;
  }

  if (!rawIdentifier || rawIdentifier.length < 3) {
    res.status(400).json({ error: "Username or email must be at least 3 characters." });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters." });
    return;
  }

  if (findUserByIdentifier(identifier)) {
    res.status(409).json({ error: "An account with this username or email already exists." });
    return;
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = createUser(identifier, passwordHash, displayName);

    const token = createSessionToken();
    createSession(user.id, token, new Date(Date.now() + SESSION_TTL_MS).toISOString());

    res.setHeader("Set-Cookie", buildSessionCookie(token));
    res.status(201).json({ user: toPublicUser(user) });
  } catch (error) {
    logError("api/auth/register", error);
    res.status(500).json({ error: "Unable to create account." });
  }
}
