import type { PlaybackRate, QualityLabel, ServerOption } from "./types";

export const HISTORY_SAVE_INTERVAL_MS = 30_000;

export const HISTORY_SAVE_THRESHOLD_S = 15;

export const DEFAULT_VOLUME = 0.8;

export const REWIND_MS = 10000;

export const FORWARD_MS = 10000;

export const AUTOHIDE_CONTROLS_MS = 3000;

export const SHOW_CONTROLS_TRANSITION_MS = 300;

export const QUALITIES: QualityLabel[] = ["2160p", "1080p", "720p", "480p"];

export const QUALITY_BADGES: Partial<Record<QualityLabel, string>> = {
  "1080p": "Full HD",
  "720p": "HD",
};

export const PLAYBACK_RATES: PlaybackRate[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const SERVERS: ServerOption[] = [
  { id: "default", name: "Auto", description: "Best available source", kind: "default" },
  { id: "vidking-yoru", name: "Vidking - Yoru", description: "Fast HLS stream", kind: "default" },
  { id: "vidking-cypher", name: "Vidking - Cypher", description: "Alternate HLS stream", kind: "default" },
  { id: "vidking-breach", name: "Vidking - Breach", description: "Alternate HLS stream", kind: "default" },
  { id: "vidking-neon", name: "Vidking - Neon", description: "Alternate HLS stream", kind: "default" },
];
