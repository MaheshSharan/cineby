import type { MediaSource } from "../types";
import type { StreamProvider, StreamRequest } from "./types";
import { TEST_PROVIDER } from "./test";

const providers: StreamProvider[] = [TEST_PROVIDER];

export async function resolveStream(
  serverId: string,
  request: StreamRequest
): Promise<MediaSource | null> {
  const provider = providers.find((item) => item.id === serverId) ?? providers[0];

  if (!provider) {
    return null;
  }

  return provider.resolve(request);
}

export function listProviders(): StreamProvider[] {
  return providers;
}
