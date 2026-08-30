import { createHmac, timingSafeEqual } from "crypto";
import { getRedis } from "@/lib/redis";

interface TokenPayload {
  sessionId: string;
  ipPrefix: string;
  tmdbId: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.STREAM_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "STREAM_SECRET must be set in environment and at least 32 characters"
    );
  }

  return secret;
}

export function generateResolveToken(
  sessionId: string,
  ipPrefix: string,
  tmdbId: number,
): string {
  const secret = getSecret();
  const exp = Math.floor(Date.now() / 1000) + 30;

  const payload: TokenPayload = {
    sessionId,
    ipPrefix,
    tmdbId,
    exp,
  };

  const payloadStr = JSON.stringify(payload);
  const sig = createHmac("sha256", secret).update(payloadStr).digest("base64url");

  const encoded = Buffer.from(payloadStr).toString("base64url");
  return `${encoded}.${sig}`;
}

export async function consumeResolveToken(
  token: string,
  sessionId: string,
  ipPrefix: string,
  tmdbId: number,
): Promise<{ valid: boolean; reason?: string }> {
  const secret = getSecret();

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, reason: "malformed" };
  }

  const [encoded, sig] = parts;

  let payloadStr: string;
  try {
    payloadStr = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return { valid: false, reason: "invalid_encoding" };
  }

  const expectedSig = createHmac("sha256", secret)
    .update(payloadStr)
    .digest("base64url");

  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return { valid: false, reason: "invalid_signature" };
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(payloadStr) as TokenPayload;
  } catch {
    return { valid: false, reason: "invalid_payload" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (now > payload.exp) {
    return { valid: false, reason: "expired" };
  }

  if (
    payload.sessionId !== sessionId ||
    payload.ipPrefix !== ipPrefix ||
    payload.tmdbId !== tmdbId
  ) {
    return { valid: false, reason: "binding_mismatch" };
  }

  const redis = getRedis();
  const key = `used_token:${sig}`;
  const ttl = Math.max(35, payload.exp - now + 5);

  const wasNew = await redis.set(key, "1", "EX", ttl, "NX");
  if (!wasNew) {
    return { valid: false, reason: "already_used" };
  }

  return { valid: true };
}
