import type { Provider } from "../types";
import { vidyProvider } from "./vidy";
import { vidkingProvider } from "./vidking";
import { vixsrcProvider } from "./vixsrc";

// Active provider list (Vidy is default and primary)
export const ALL_PROVIDERS: Provider[] = [
  vidyProvider,
  vidkingProvider,
  vixsrcProvider,
];

