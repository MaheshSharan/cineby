import type { NextApiRequest, NextApiResponse } from "next";

import { hashPassword } from "@/lib/auth/password";
import {
  buildSessionCookie,
  createSessionToken,
  SESSION_TTL_MS,
} from "@/lib/auth/session";
import { createSession } from "@/lib/db/sessions";
import { createUser, findUserByEmail, toPublicUser } from "@/lib/db/users";
import { logError } from "@/lib/logger";

interface RegisterBody {
  email?: unknown;
  password?: unknown;
  displayName?: unknown;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as RegisterBody;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const rawDisplayName =
    typeof body.displayName === "string" ? body.displayName.trim() : "";
  const displayName = rawDisplayName ? rawDisplayName.slice(0, 60) : null;

  if (!EMAIL_PATTERN.test(email)) {
    res.status(400).json({ error: "Enter a valid email address." });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters." });
    return;
  }

  if (findUserByEmail(email)) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = createUser(email, passwordHash, displayName);

    const token = createSessionToken();
    createSession(user.id, token, new Date(Date.now() + SESSION_TTL_MS).toISOString());

    res.setHeader("Set-Cookie", buildSessionCookie(token));
    res.status(201).json({ user: toPublicUser(user) });
  } catch (error) {
    logError("api/auth/register", error);
    res.status(500).json({ error: "Unable to create account." });
  }
}