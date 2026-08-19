export function buildStreamProxyUrl(
  targetUrl: string,
  headers?: Record<string, string>
): string {
  const proxyBase =
    process.env.STREAM_PROXY_URL?.trim() ||
    process.env.NEXT_PUBLIC_STREAM_PROXY_URL?.trim();

  if (!proxyBase || !targetUrl) {
    return targetUrl;
  }

  const cleanBase = proxyBase.replace(/\/+$/, "");

  // Prevent double-proxying or proxying local blob/data schemes
  if (targetUrl.startsWith(cleanBase) || targetUrl.startsWith("blob:") || targetUrl.startsWith("data:")) {
    return targetUrl;
  }

  // Constructs standard Worker format: https://my-worker.workers.dev/?url=<encoded>&headers=<encoded_json>
  const params = new URLSearchParams({
    url: targetUrl,
  });

  if (headers && Object.keys(headers).length > 0) {
    params.set("headers", JSON.stringify(headers));
  }

  if (cleanBase.includes("?")) {
    return `${cleanBase}&${params.toString()}`;
  }

  return `${cleanBase}/?${params.toString()}`;
}

export function isStreamProxyConfigured(): boolean {
  return Boolean(
    process.env.STREAM_PROXY_URL?.trim() ||
    process.env.NEXT_PUBLIC_STREAM_PROXY_URL?.trim()
  );
}
