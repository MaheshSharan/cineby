import type { MediaSource } from "../types";
import type { StreamRequest, StreamResolutionResult } from "./types";

const TEST_STREAM_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

const TEST_PROVIDER = {
  id: "test",
  name: "Test Server",
  fetch: async (request: StreamRequest): Promise<StreamResolutionResult> => {
    const source: MediaSource = {
      id: `test-${request.mediaType}-${request.mediaId}`, kind: "test", name: "Test Server",
      url: TEST_STREAM_URL, format: "hls", quality: null,
    };
    return { source, sources: [source], subtitles: [] };
  },
};

export { TEST_PROVIDER };
