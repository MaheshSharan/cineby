import type { NextApiRequest, NextApiResponse } from "next";
import { createProxyDescriptor, readProxyDescriptor } from "@/lib/providers/signedProxy";

export const config = {
  api: {
    responseLimit: false,
    bodyParser: false,
  },
};

const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", ["GET", "HEAD"]);
    res.status(405).end();
    return;
  }

  const rawToken = typeof req.query.token === "string" ? req.query.token : "";
  const descriptor = rawToken ? readProxyDescriptor(rawToken) : null;
  if (!descriptor) {
    res.status(401).json({ error: "Missing or invalid stream descriptor" });
    return;
  }
  const rawTargetUrl = descriptor.url;
  const customHeaders = descriptor.headers;

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawTargetUrl);
  } catch {
    res.status(400).json({ error: "Invalid stream URL" });
    return;
  }

  if (targetUrl.protocol !== "https:" && targetUrl.protocol !== "http:") {
    res.status(400).json({ error: "Unsupported stream URL protocol" });
    return;
  }

  const allowedHosts = (process.env.STREAM_PROXY_ALLOWED_HOSTS ?? "").split(",").map((host) => host.trim()).filter(Boolean);
  if (allowedHosts.length > 0 && !allowedHosts.some((host) => targetUrl.hostname === host || targetUrl.hostname.endsWith(`.${host}`))) {
    res.status(403).json({ error: "Stream host is not allowed" });
    return;
  }
  if (["localhost", "127.0.0.1", "::1"].includes(targetUrl.hostname) || targetUrl.hostname.endsWith(".local")) {
    res.status(403).json({ error: "Private stream hosts are not allowed" });
    return;
  }

  const upstreamHeaders = new Headers();
  upstreamHeaders.set("User-Agent", customHeaders["User-Agent"] || DEFAULT_UA);
  upstreamHeaders.set("Referer", customHeaders["Referer"] || "https://www.vidking.net/");
  upstreamHeaders.set("Origin", customHeaders["Origin"] || "https://www.vidking.net");
  upstreamHeaders.set("Accept", "*/*");

  if (req.headers.range) {
    upstreamHeaders.set("Range", req.headers.range);
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: upstreamHeaders,
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Cache-Control", "no-store");

    const contentType = upstreamRes.headers.get("content-type") || "";
    const isM3u8 =
      rawTargetUrl.includes(".m3u8") ||
      contentType.includes("mpegurl") ||
      contentType.includes("application/x-mpegURL");

    if (isM3u8) {
      const text = await upstreamRes.text();
      const targetBase = rawTargetUrl.substring(0, rawTargetUrl.lastIndexOf("/") + 1);

      // Rewrite M3U8 lines so all child playlists, initialization segments, and media segments route through proxy
      const rewritten = text
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return line;

          // Rewrite #EXT-X-MAP:URI="url" tags (used by fMP4 / HLS v6)
          if (trimmed.startsWith("#EXT-X-MAP:")) {
            return trimmed.replace(/URI="([^"]+)"/, (_, uri) => {
              const abs = uri.startsWith("http://") || uri.startsWith("https://")
                ? uri
                : new URL(uri, targetBase).toString();
              return `URI="/api/stream/proxy?token=${encodeURIComponent(createProxyDescriptor(abs, customHeaders))}"`;
            });
          }

          if (trimmed.startsWith("#")) {
            return line;
          }

          const absoluteUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://")
            ? trimmed
            : new URL(trimmed, targetBase).toString();

          return `/api/stream/proxy?token=${encodeURIComponent(createProxyDescriptor(absoluteUrl, customHeaders))}`;
        })
        .join("\n");

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.status(upstreamRes.status).send(rewritten);
      return;
    }

    // Binary / Video Segment Streaming
    if (upstreamRes.headers.has("content-type")) {
      res.setHeader("Content-Type", upstreamRes.headers.get("content-type")!);
    }
    if (upstreamRes.headers.has("content-length")) {
      res.setHeader("Content-Length", upstreamRes.headers.get("content-length")!);
    }
    if (upstreamRes.headers.has("content-range")) {
      res.setHeader("Content-Range", upstreamRes.headers.get("content-range")!);
    }
    if (upstreamRes.headers.has("accept-ranges")) {
      res.setHeader("Accept-Ranges", upstreamRes.headers.get("accept-ranges")!);
    }

    res.status(upstreamRes.status);

    if (upstreamRes.body) {
      const reader = upstreamRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
    }
    res.end();
    return;
  } catch {
    res.status(502).json({ error: "Upstream stream fetch failed" });
    return;
  }
}
