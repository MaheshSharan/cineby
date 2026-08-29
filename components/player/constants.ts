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
  // Vidy Servers
  { id: "vidy-miami", name: "Vidy - Miami", description: "Original audio · Fast HLS / 4K", kind: "default" },
  { id: "vidy-seattle", name: "Vidy - Seattle", description: "Original audio · Fast HLS", kind: "default" },
  { id: "vidy-denver", name: "Vidy - Denver", description: "Original audio · DASH / HLS", kind: "default" },
  { id: "vidy-atlanta", name: "Vidy - Atlanta", description: "Original audio · Alternate HLS", kind: "default" },
  { id: "vidy-phoenix", name: "Vidy - Phoenix", description: "Original audio · Alternate HLS", kind: "default" },
  { id: "vidy-portland", name: "Vidy - Portland", description: "Original audio · Alternate HLS", kind: "default" },
  { id: "vidy-austin", name: "Vidy - Austin", description: "Original audio · English stream", kind: "default" },
  { id: "vidy-dallas", name: "Vidy - Dallas", description: "Original audio · Alternate HLS", kind: "default" },
  { id: "vidy-munich", name: "Vidy - Munich", description: "German dubbed audio", kind: "default" },
  { id: "vidy-berlin", name: "Vidy - Berlin", description: "German dubbed audio", kind: "default" },
  { id: "vidy-paris", name: "Vidy - Paris", description: "French dubbed audio", kind: "default" },
  { id: "vidy-delhi", name: "Vidy - Delhi", description: "Hindi dubbed audio", kind: "default" },
  { id: "vidy-cancun", name: "Vidy - Cancun", description: "Spanish dubbed audio", kind: "default" },
  // Vidking Servers
  { id: "vidking-yoru", name: "Vidking - Yoru", description: "Fast HLS stream", kind: "default" },
  { id: "vidking-cypher", name: "Vidking - Cypher", description: "Alternate HLS stream", kind: "default" },
  { id: "vidking-breach", name: "Vidking - Breach", description: "Alternate HLS stream", kind: "default" },
  { id: "vidking-neon", name: "Vidking - Neon", description: "Alternate HLS stream", kind: "default" },
];
