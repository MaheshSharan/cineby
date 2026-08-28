import type { Provider } from "../types";
import { vidkingProvider } from "./vidking";

// Active provider list (Vidking is default and primary)
export const ALL_PROVIDERS: Provider[] = [
  vidkingProvider,
];
