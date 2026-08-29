export function buildStreamProxyUrl(
  targetUrl: string,
  headers?: Record<string, string>
): string {
  if (!targetUrl) {
    return targetUrl;
  }

  const proxyBase =
    process.env.STREAM_PROXY_URL?.trim() ||
    process.env.NEXT_PUBLIC_STREAM_PROXY_URL?.trim() ||
    "/api/stream/proxy";

  const cleanBase = proxyBase.replace(/\/+$/, "");

  // Prevent double-proxying or proxying local blob/data schemes
  if (
    targetUrl.startsWith(cleanBase) ||
    targetUrl.startsWith("blob:") ||
    targetUrl.startsWith("data:")
  ) {
    return targetUrl;
  }

  const params = new URLSearchParams({ token: createProxyDescriptor(targetUrl, headers) });

  if (cleanBase.includes("?")) {
    return `${cleanBase}&${params.toString()}`;
  }

  if (cleanBase.startsWith("/")) {
    return `${cleanBase}?${params.toString()}`;
  }

  return `${cleanBase}/?${params.toString()}`;
}

export function isStreamProxyConfigured(): boolean {
  return true;
}
import { createProxyDescriptor } from "./signedProxy";
