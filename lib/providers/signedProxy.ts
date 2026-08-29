import { createHmac, timingSafeEqual } from "node:crypto";

interface Descriptor { url: string; headers: Record<string, string>; expiresAt: number; }

let devFallbackSecret: string | null = null;

function secret(): string {
  const value = process.env.STREAM_PROXY_SECRET?.trim();
  if (value) return value;
  if (!devFallbackSecret) {
    devFallbackSecret = "cineby_dev_stream_secret_default_fallback_key";
  }
  return devFallbackSecret;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createProxyDescriptor(url: string, headers: Record<string, string> = {}): string {
  const payload = Buffer.from(JSON.stringify({ url, headers, expiresAt: Date.now() + 5 * 60_000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readProxyDescriptor(token: string): Descriptor | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const value: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!value || typeof value !== "object") return null;
    const descriptor = value as Partial<Descriptor>;
    if (typeof descriptor.url !== "string" || typeof descriptor.expiresAt !== "number" || descriptor.expiresAt < Date.now()) return null;
    return { url: descriptor.url, headers: descriptor.headers ?? {}, expiresAt: descriptor.expiresAt };
  } catch { return null; }
}
