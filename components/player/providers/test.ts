import type { MediaSource } from "../types";
import type { StreamProvider, StreamRequest } from "./types";

const TEST_STREAM_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

const TEST_PROVIDER: StreamProvider = {
  id: "test",
  name: "Test Server",
  resolve: async (request: StreamRequest): Promise<MediaSource> => {
    return {
      id: `test-${request.mediaType}-${request.mediaId}`,
      kind: "test",
      name: "Test Server",
      url: TEST_STREAM_URL,
      format: "hls",
      quality: null,
    };
  },
};

export { TEST_PROVIDER };
