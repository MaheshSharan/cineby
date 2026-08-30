import { DEFAULT_PROVIDER_TIMEOUT_MS, QUALITY_RANKS } from "./constants";
import { isCircuitOpen, recordFailure, recordSuccess } from "./circuitBreaker";
import { buildStreamProxyUrl } from "./proxy";
import { ALL_PROVIDERS } from "./sources";
import type { Provider, StreamRequest, StreamResponse, StreamSource, SubtitleTrack } from "./types";
import { logError } from "@/lib/logger";

function isProviderEnabled(provider: Provider): boolean {
  const envVar = `ENABLE_${provider.id.toUpperCase()}`;
  const val = process.env[envVar];
  // Enabled by default unless explicitly set to "false" or "0"
  if (val === "false" || val === "0") {
    return false;
  }
  return true;
}

async function fetchWithTimeout(
  provider: Provider,
  request: StreamRequest,
  timeoutMs: number
): Promise<StreamResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (request.signal) {
    request.signal.addEventListener("abort", () => controller.abort());
  }

  try {
    const res = await provider.fetch({
      ...request,
      signal: controller.signal,
    });
    await recordSuccess(provider.id);
    return res;
  } catch (error) {
    if (controller.signal.aborted || request.signal?.aborted) {
      return { sources: [], subtitles: [] };
    }
    await recordFailure(provider.id);
    logError(`Provider:${provider.id}`, error);
    return { sources: [], subtitles: [] };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function resolveAllStreams(
  request: StreamRequest,
  options?: { timeoutMs?: number; targetProviderId?: string }
): Promise<StreamResponse> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_PROVIDER_TIMEOUT_MS;

  const circuitChecks = await Promise.all(
    ALL_PROVIDERS.map(async (p) => ({
      provider: p,
      open: await isCircuitOpen(p.id),
    }))
  );

  const targetProviders = circuitChecks
    .filter((check) => {
      if (options?.targetProviderId && options.targetProviderId !== "default") {
        return (
          check.provider.id === options.targetProviderId ||
          options.targetProviderId.startsWith(`${check.provider.id}-`)
        );
      }
      return isProviderEnabled(check.provider) && !check.open;
    })
    .map((check) => check.provider);

  if (targetProviders.length === 0) {
    return { sources: [], subtitles: [] };
  }

  const results = await Promise.allSettled(
    targetProviders.map((p) =>
      fetchWithTimeout(
        p,
        { ...request, serverId: options?.targetProviderId },
        timeoutMs
      )
    )
  );

  const collectedSources: StreamSource[] = [];
  const collectedSubtitles: SubtitleTrack[] = [];
  const seenSourceUrls = new Set<string>();
  const seenSubtitleLabels = new Set<string>();

  for (let i = 0; i < results.length; i++) {
    const res = results[i];
    const provider = targetProviders[i];

    if (res.status === "fulfilled" && res.value) {
      // Collect sources
      for (const source of res.value.sources) {
        if (source.url && !seenSourceUrls.has(source.url)) {
          seenSourceUrls.add(source.url);
          collectedSources.push({
            ...source,
            url: source.direct ? source.url : buildStreamProxyUrl(source.url, source.headers),
            provider: {
              id: source.provider?.id || provider.id,
              name: source.provider?.name || provider.name,
            },
          });
        }
      }

      // Collect subtitles
      for (const sub of res.value.subtitles) {
        const key = `${sub.label.toLowerCase()}_${sub.lang?.toLowerCase() ?? ""}`;
        if (sub.url && !seenSubtitleLabels.has(key)) {
          seenSubtitleLabels.add(key);
          collectedSubtitles.push({
            ...sub,
            flagUrl: sub.flagUrl,
            format: sub.format,
            url: buildStreamProxyUrl(sub.url, sub.headers),
          });
        }
      }
    }
  }

  // Sort sources: Provider Priority (ASC) -> Quality Rank (DESC)
  collectedSources.sort((a, b) => {
    const providerA = targetProviders.find((p) => p.id === a.provider.id);
    const providerB = targetProviders.find((p) => p.id === b.provider.id);
    const priorityA = providerA?.priority ?? 100;
    const priorityB = providerB?.priority ?? 100;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    const rankA = QUALITY_RANKS[a.quality] ?? 0;
    const rankB = QUALITY_RANKS[b.quality] ?? 0;
    return rankB - rankA;
  });

  return {
    sources: collectedSources,
    subtitles: collectedSubtitles,
  };
}

export async function listAvailableProviders(): Promise<Array<{ id: string; name: string }>> {
  const circuitChecks = await Promise.all(
    ALL_PROVIDERS.map(async (p) => ({
      provider: p,
      open: await isCircuitOpen(p.id),
    }))
  );

  return circuitChecks
    .filter((check) => isProviderEnabled(check.provider) && !check.open)
    .map((check) => ({
      id: check.provider.id,
      name: check.provider.name,
    }));
}
