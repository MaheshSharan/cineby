import { findValidSessionByToken } from "@/lib/db/sessions";
import type { User } from "@/lib/db/types";

import { getSessionToken, type CookieRequest } from "./session";

export function getCurrentUser(req: CookieRequest): User | null {
  const token = getSessionToken(req);

  if (!token) {
    return null;
  }

  const session = findValidSessionByToken(token);

  if (!session) {
    return null;
  }

  return {
    id: session.user_id,
    email: session.email,
    displayName: session.display_name,
    createdAt: session.user_created_at,
  };
}