import type { Provider, StreamRequest, StreamResponse } from "../../types";

const TEST_STREAM_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

async function scrape(req: StreamRequest): Promise<StreamResponse> {
  if (req.signal?.aborted) {
    return { sources: [], subtitles: [] };
  }

  return {
    sources: [
      {
        url: TEST_STREAM_URL,
        type: "hls",
        quality: "1080p",
        provider: {
          id: "test",
          name: "Test Server",
        },
      },
    ],
    subtitles: [
      {
        url: "https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/subtitles/subtitles_en.vtt",
        label: "English",
        lang: "en",
        format: "vtt",
      },
    ],
  };
}

export const testProvider: Provider = {
  id: "test",
  name: "Test Server",
  priority: 999,
  fetch: scrape,
};
