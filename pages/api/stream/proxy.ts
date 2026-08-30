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

const UPSTREAM_TIMEOUT_MS = 30000;
const MAX_RESPONSE_SIZE_BYTES = 30 * 1024 * 1024;

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

  const defaultReferer = rawTargetUrl.includes("vidking")
    ? "https://www.vidking.net/"
    : rawTargetUrl.includes("vixsrc")
    ? "https://vixsrc.to"
    : "https://www.vidy.st/";
  const defaultOrigin = rawTargetUrl.includes("vidking")
    ? "https://www.vidking.net"
    : rawTargetUrl.includes("vixsrc")
    ? "https://vixsrc.to"
    : "https://www.vidy.st";

  const upstreamHeaders = new Headers();
  upstreamHeaders.set("User-Agent", customHeaders["User-Agent"] || DEFAULT_UA);
  upstreamHeaders.set("Referer", customHeaders["Referer"] || defaultReferer);
  upstreamHeaders.set("Origin", customHeaders["Origin"] || defaultOrigin);
  upstreamHeaders.set("Accept", "*/*");

  if (req.headers.range) {
    upstreamHeaders.set("Range", req.headers.range);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: upstreamHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Cache-Control", "no-store");

    const SAFE_RESPONSE_HEADERS = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "cache-control",
      "etag",
      "last-modified",
    ];

    for (const header of SAFE_RESPONSE_HEADERS) {
      const value = upstreamRes.headers.get(header);
      if (value) {
        res.setHeader(header, value);
      }
    }

    const contentType = upstreamRes.headers.get("content-type") || "";
    const isM3u8 =
      rawTargetUrl.includes(".m3u8") ||
      contentType.includes("mpegurl") ||
      contentType.includes("application/x-mpegURL");

    const urlPath = targetUrl.pathname;
    const isMaster = urlPath.endsWith("master.m3u8");
    const isVariantPlaylist = isM3u8 && !isMaster;

    if (isMaster) {
      console.log(`[Stream Proxy] 📺 Master ABR Playlist loaded: ${targetUrl.hostname}${urlPath}`);
    } else if (isVariantPlaylist) {
      const qualityMatch = urlPath.match(/s(\d+p)/i) || urlPath.match(/(2160p|1440p|1080p|720p|480p|360p)/i);
      const qualityTag = qualityMatch ? qualityMatch[1].toUpperCase() : "VARIANT";
      console.log(`[Stream Proxy] 🎯 Switched/Loaded Quality Stream: [${qualityTag}] -> ${targetUrl.hostname}${urlPath}`);
    } else if (rawTargetUrl.includes("subtitles") || rawTargetUrl.includes(".srt") || rawTargetUrl.includes(".vtt")) {
      console.log(`[Stream Proxy] 📝 Subtitle Track loaded: ${targetUrl.hostname}${urlPath}${targetUrl.search}`);
    }

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

    const isSrt =
      rawTargetUrl.includes(".srt") ||
      rawTargetUrl.includes("subtitles.vidy.st/download") ||
      rawTargetUrl.includes("subs.videasy.to/download") ||
      contentType.includes("x-subrip") ||
      contentType.includes("text/plain");

    if (isSrt) {
      let text = await upstreamRes.text();
      // Ensure WebVTT format for browser native HTML5 video <track>
      if (!text.trim().startsWith("WEBVTT")) {
        // Convert SRT commas in timestamps (00:01:20,000) to WebVTT dots (00:01:20.000)
        text = "WEBVTT\n\n" + text.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
      }
      res.setHeader("Content-Type", "text/vtt; charset=utf-8");
      res.status(upstreamRes.status).send(text);
      return;
    }

    // Binary / Video Segment Streaming
    res.status(upstreamRes.status);

    // Segments are immutable content behind unique signed URLs; allow the browser to
    // cache them so seeks back into already-watched territory don't re-hit upstream.
    if (!upstreamRes.headers.get("cache-control")) {
      res.setHeader("Cache-Control", "private, max-age=3600");
    }

    if (upstreamRes.body) {
      const reader = upstreamRes.body.getReader();
      let bytesStreamed = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        bytesStreamed += value.length;
        if (bytesStreamed > MAX_RESPONSE_SIZE_BYTES) {
          reader.cancel();
          res.end();
          return;
        }

        const canContinue = res.write(Buffer.from(value));
        if (!canContinue) {
          // Respect backpressure instead of buffering the whole segment in memory
          await new Promise<void>((resolve) => res.once("drain", resolve));
        }
      }
    }
    res.end();
    return;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      res.status(504).json({ error: "Upstream stream timeout" });
      return;
    }
    res.status(502).json({ error: "Upstream stream fetch failed" });
    return;
  }
}
