import type { Provider } from "../types";
import { vixsrcProvider } from "./vixsrc";

// Active provider list (Test provider removed/disabled)
export const ALL_PROVIDERS: Provider[] = [
  vixsrcProvider,
];
