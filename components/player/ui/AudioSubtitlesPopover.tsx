import { useRef, useState } from "react";
import type { SubtitleTrack } from "../types";

export interface SubtitleAppearance {
  fontSize: number;
  bgOpacity: number;
  color: string;
}

export const DEFAULT_SUBTITLE_APPEARANCE: SubtitleAppearance = {
  fontSize: 24,
  bgOpacity: 0.5,
  color: "#FFFFFF",
};

interface AudioSubtitlesPopoverProps {
  open: boolean;
  subtitleTracks: SubtitleTrack[];
  activeSubtitleId?: string | null;
  onSubtitleChange: (track: SubtitleTrack | null) => void;
  onUploadSubtitle?: (file: File) => void;
  onOpenOpenSubtitles?: () => void;
  appearance: SubtitleAppearance;
  onAppearanceChange: (appearance: SubtitleAppearance) => void;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleaned = hex.replace(/^#/, "");
  if (cleaned.length === 3) {
    cleaned = cleaned.split("").map((c) => c + c).join("");
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return { r: 255, g: 255, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function AudioSubtitlesPopover({
  open,
  subtitleTracks,
  activeSubtitleId,
  onSubtitleChange,
  onUploadSubtitle,
  onOpenOpenSubtitles,
  appearance,
  onAppearanceChange,
}: AudioSubtitlesPopoverProps) {
  const [view, setView] = useState<"main" | "appearance">("main");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUploadSubtitle) {
      onUploadSubtitle(file);
    }
  };

  const rgb = hexToRgb(appearance.color);

  const handleRgbChange = (channel: "r" | "g" | "b", val: number) => {
    const nextRgb = { ...rgb, [channel]: val };
    onAppearanceChange({
      ...appearance,
      color: rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b),
    });
  };

  return (
    <div
      data-player-ui
      className={`fixed left-1/2 top-[76px] z-50 -translate-x-1/2 max-w-[calc(100vw-0.75rem)] md:absolute md:left-auto md:right-0 md:top-full md:max-w-none md:translate-x-0 md:pt-2 transition-opacity duration-150 origin-top md:origin-top-right will-change-[opacity] ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="player-surface rounded-xl p-4 shadow-2xl overflow-x-auto">
        {view === "appearance" ? (
          /* ================= CUSTOMIZE APPEARANCE SUBVIEW ================= */
          <div className="w-[340px] max-w-[calc(100vw-2rem)] flex flex-col text-white">
            <button
              type="button"
              onClick={() => setView("main")}
              className="flex items-center justify-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 text-[12.5px] font-medium text-gray-300 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white h-9 mb-3 flex-shrink-0 self-start cursor-pointer"
            >
              <svg
                width="1.5em"
                height="1.5em"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                aria-hidden="true"
              >
                <path d="M15 6L9 12L15 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to subtitles
            </button>

            <div className="max-h-[min(440px,58vh)] overflow-y-auto no-scrollbar -mr-2 pr-2">
              <div className="px-3 space-y-5 h-full">
                {/* Font Size */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                      Font Size
                    </span>
                    <span className="text-[13px] font-semibold text-white tabular-nums">
                      {appearance.fontSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="50"
                    step="1"
                    aria-label="Font Size"
                    value={appearance.fontSize}
                    onChange={(e) =>
                      onAppearanceChange({
                        ...appearance,
                        fontSize: Number(e.target.value),
                      })
                    }
                    className="w-full accent-white cursor-pointer"
                  />
                </div>

                {/* Background Opacity */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                      Background Blur
                    </span>
                    <span className="text-[13px] font-semibold text-white tabular-nums">
                      {Math.round(appearance.bgOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    aria-label="Background Blur"
                    value={appearance.bgOpacity}
                    onChange={(e) =>
                      onAppearanceChange({
                        ...appearance,
                        bgOpacity: Number(e.target.value),
                      })
                    }
                    className="w-full accent-white cursor-pointer"
                  />
                </div>

                {/* Color */}
                <div className="space-y-2.5">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                    Color
                  </span>
                  <div className="flex items-center gap-2">
                    <label
                      className="relative h-8 w-8 flex-shrink-0 cursor-pointer rounded-full ring-1 ring-inset ring-white/20 transition-all duration-150 hover:scale-110 hover:ring-white/50"
                      aria-label="Color picker"
                      style={{ backgroundColor: appearance.color }}
                    >
                      <input
                        type="color"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        value={appearance.color}
                        onChange={(e) =>
                          onAppearanceChange({
                            ...appearance,
                            color: e.target.value,
                          })
                        }
                      />
                    </label>
                    <div className="grid flex-1 grid-cols-3 gap-1.5">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="w-2.5 flex-shrink-0 text-[10px] font-bold uppercase text-gray-400/70">
                          r
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          className="w-full min-w-0 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] text-center text-[12px] text-white focus:outline-none focus:border-white/[0.3] transition-colors tabular-nums"
                          aria-label="Color R"
                          value={rgb.r}
                          onChange={(e) => handleRgbChange("r", Number(e.target.value))}
                        />
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="w-2.5 flex-shrink-0 text-[10px] font-bold uppercase text-gray-400/70">
                          g
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          className="w-full min-w-0 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] text-center text-[12px] text-white focus:outline-none focus:border-white/[0.3] transition-colors tabular-nums"
                          aria-label="Color G"
                          value={rgb.g}
                          onChange={(e) => handleRgbChange("g", Number(e.target.value))}
                        />
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="w-2.5 flex-shrink-0 text-[10px] font-bold uppercase text-gray-400/70">
                          b
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          className="w-full min-w-0 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] text-center text-[12px] text-white focus:outline-none focus:border-white/[0.3] transition-colors tabular-nums"
                          aria-label="Color B"
                          value={rgb.b}
                          onChange={(e) => handleRgbChange("b", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Latency */}
                <div className="space-y-2.5">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                    Latency
                  </span>
                  <p className="text-xs text-gray-400/70">
                    {activeSubtitleId ? "0ms" : "You haven't selected caption"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => onAppearanceChange(DEFAULT_SUBTITLE_APPEARANCE)}
                    className="flex w-full h-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-gray-300 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("main")}
                    className="flex w-full h-10 items-center justify-center rounded-full bg-white px-6 text-[13px] font-semibold text-[#0b0f14] transition-all hover:bg-white/90 cursor-pointer"
                  >
                    Save to profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= MAIN AUDIO & SUBTITLES VIEW ================= */
          <div className="flex flex-col text-white">
            <div className="flex divide-x divide-white/10 max-h-[min(360px,50vh)]">
              {/* AUDIO COLUMN */}
              <div className="min-w-[140px] md:min-w-[170px] max-w-[240px] flex flex-col min-h-0 pr-4">
                <p className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500 flex-shrink-0">
                  Audio
                </p>
                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-0.5 pr-1">
                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-left transition-colors text-white bg-white/[0.14]"
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block truncate">Default Audio</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* SUBTITLES COLUMN */}
              <div className="min-w-[140px] md:min-w-[170px] max-w-[240px] flex flex-col min-h-0 pl-4">
                <div className="flex items-center justify-between px-2.5 pb-2.5 flex-shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                    Subtitles
                  </span>
                  {/* Subtitle On/Off Switch Toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(activeSubtitleId)}
                    aria-label="Toggle subtitles"
                    onClick={() => {
                      if (activeSubtitleId) {
                        onSubtitleChange(null);
                      } else if (subtitleTracks.length > 0) {
                        const defaultSub =
                          subtitleTracks.find(
                            (s) => s.lang.toLowerCase() === "en" || s.label.toLowerCase().includes("english")
                          ) ?? subtitleTracks[0];
                        onSubtitleChange(defaultSub);
                      }
                    }}
                    className={`group relative h-4 w-7 shrink-0 rounded-full border transition-all duration-200 cursor-pointer focus:outline-none ${
                      activeSubtitleId
                        ? "bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                        : "bg-white/[0.06] border-white/[0.1] hover:border-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-[1.5px] h-2.5 w-2.5 rounded-full transition-all duration-200 shadow-sm ${
                        activeSubtitleId
                          ? "left-[14px] bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                          : "left-[2px] bg-white/40 group-hover:bg-white/60"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1.5 pr-1">
                  {/* Subtitle Tracks */}
                  {subtitleTracks.length === 0 ? (
                    <div className="flex items-center justify-center px-3 py-4">
                      <p className="text-center text-[12px] leading-relaxed text-gray-400">
                        No subtitles available
                      </p>
                    </div>
                  ) : (
                    subtitleTracks.map((track) => {
                      const isActive =
                        activeSubtitleId === track.id || activeSubtitleId === track.lang;

                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => onSubtitleChange(track)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                            isActive
                              ? "bg-white/[0.08] border border-cyan-500/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                              : "text-gray-300 hover:text-white hover:bg-white/[0.04] border border-transparent"
                          }`}
                        >
                          {/* Flag Icon Container */}
                          <div className="flex h-7 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-black/40 p-0.5 border border-white/10 overflow-hidden shadow-inner">
                            {track.flagUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={track.flagUrl}
                                alt=""
                                className="h-full w-full object-cover rounded-[4px]"
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-white/50 uppercase">
                                {track.lang?.slice(0, 2) || "CC"}
                              </span>
                            )}
                          </div>

                          {/* Language Name & Lang code */}
                          <div className="flex-1 min-w-0">
                            <span className="block truncate text-[13px] font-medium text-white leading-tight">
                              {track.label || track.lang}
                            </span>
                            <span className="block text-[11px] text-gray-400 font-normal lowercase leading-tight mt-0.5">
                              {track.lang || "en"}
                            </span>
                          </div>

                          {/* Selected Checkmark Badge */}
                          {isActive && (
                            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-cyan-400/80 bg-cyan-500/20 text-cyan-300">
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}

                  {/* Upload Subtitles Button */}
                  <div className="group relative mt-1 flex cursor-pointer select-none items-center gap-x-2 rounded-lg border border-dashed border-white/[0.12] bg-white/[0.01] px-3 py-2 text-[12.5px] font-medium text-gray-300 transition-colors duration-200 hover:border-white/[0.3] hover:bg-white/[0.04] hover:text-white">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".vtt,.srt"
                      className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-3.5 w-3.5 flex-shrink-0 text-white/40 transition-colors group-hover:text-white/80"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <div className="min-w-0 flex-1 truncate">Upload subtitles</div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION */}
            <div className="mt-3 pt-3 border-t border-white/10 space-y-0.5">
              <button
                type="button"
                onClick={onOpenOpenSubtitles}
                className="w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
              >
                <span className="flex items-center gap-2.5 whitespace-nowrap">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-search w-4 h-4 text-gray-400 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  Search on OpenSubtitles
                </span>
                <svg
                  width="1.5em"
                  height="1.5em"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5 text-gray-500 flex-shrink-0"
                  aria-hidden="true"
                >
                  <path d="M9 6L15 12L9 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setView("appearance")}
                className="w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
              >
                <span className="flex items-center gap-2.5 whitespace-nowrap">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-settings2 w-4 h-4 text-gray-400 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M20 7h-9" />
                    <path d="M14 17H5" />
                    <circle cx="17" cy="17" r="3" />
                    <circle cx="7" cy="7" r="3" />
                  </svg>
                  Customize appearance
                </span>
                <svg
                  width="1.5em"
                  height="1.5em"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5 text-gray-500 flex-shrink-0"
                  aria-hidden="true"
                >
                  <path d="M9 6L15 12L9 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
