import { useState } from "react";

import type { PlaybackRate, QualityLabel, ServerOption, SubtitleTrack } from "../types";
import { PLAYBACK_RATES, QUALITIES, QUALITY_BADGES } from "../constants";

export type SettingsTab = "quality" | "subtitles" | "servers" | "speed";

interface SettingsModalProps {
  open: boolean;
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  onClose: () => void;
  quality: QualityLabel | null;
  onQualityChange: (quality: QualityLabel | null) => void;
  subtitleTracks: SubtitleTrack[];
  subtitleLabel: string;
  onSubtitleChange: (track: SubtitleTrack | null) => void;
  servers: ServerOption[];
  activeServerId: string;
  onServerChange: (serverId: string) => void;
  rate: PlaybackRate;
  onRateChange: (rate: PlaybackRate) => void;
}

const TABS: { key: SettingsTab; label: string }[] = [
  { key: "quality", label: "Quality" },
  { key: "subtitles", label: "Subtitles" },
  { key: "servers", label: "Servers" },
  { key: "speed", label: "Speed" },
];

function TabIcon({ tab }: { tab: SettingsTab }) {
  switch (tab) {
    case "quality":
      return (
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
          className="lucide lucide-monitor-play w-4 h-4"
          aria-hidden="true"
        >
          <path d="m10 7 5 3-5 3Z" />
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <path d="M12 17v4" />
          <path d="M8 21h8" />
        </svg>
      );
    case "subtitles":
      return (
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
          className="lucide lucide-subtitles w-4 h-4"
          aria-hidden="true"
        >
          <path d="M7 13h4" />
          <path d="M15 13h2" />
          <path d="M7 9h2" />
          <path d="M13 9h4" />
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
        </svg>
      );
    case "servers":
      return (
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
          className="lucide lucide-server w-4 h-4"
          aria-hidden="true"
        >
          <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
          <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
          <line x1="6" x2="6.01" y1="6" y2="6" />
          <line x1="6" x2="6.01" y1="18" y2="18" />
        </svg>
      );
    case "speed":
      return (
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
          className="lucide lucide-gauge w-4 h-4"
          aria-hidden="true"
        >
          <path d="m12 14 4-4" />
          <path d="M3.34 19a10 10 0 1 1 17.32 0" />
        </svg>
      );
  }
}

export function SettingsModal({
  open,
  activeTab,
  onTabChange,
  onClose,
  quality,
  onQualityChange,
  subtitleTracks,
  subtitleLabel,
  onSubtitleChange,
  servers,
  activeServerId,
  onServerChange,
  rate,
  onRateChange,
}: SettingsModalProps) {
  return (
    <div
      data-player-ui
      className={`absolute z-[110] flex flex-col inset-x-0 bottom-0 w-full h-[72vh] md:left-auto md:right-4 md:bottom-auto md:top-1/2 md:h-[calc(100vh-160px)] md:max-h-[640px] md:w-[420px] md:max-w-[95vw] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        open
          ? "translate-y-0 md:-translate-y-1/2 md:translate-x-0"
          : "translate-y-full md:-translate-y-1/2 md:translate-x-[120%]"
      } ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <div
        dir="ltr"
        className="flex-1 min-h-0 w-full flex flex-col player-surface rounded-t-2xl md:rounded-2xl overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
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
                className="lucide lucide-settings2 w-5 h-5"
                aria-hidden="true"
              >
                <path d="M20 7h-9" />
                <path d="M14 17H5" />
                <circle cx="17" cy="17" r="3" />
                <circle cx="7" cy="7" r="3" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-white leading-tight truncate">
                Player Settings
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5 truncate">
                Customize your viewing experience
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 rounded-lg player-tile border text-gray-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <svg
              width="28"
              height="28"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-3 pt-2 flex-shrink-0">
          <div
            role="tablist"
            aria-orientation="horizontal"
            className="flex items-center gap-1 overflow-x-auto settings-tabs-scroll border-b border-white/10"
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`group relative shrink-0 inline-flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium whitespace-nowrap text-gray-400 hover:text-white ${
                  activeTab === tab.key ? "text-white" : ""
                } transition-colors cursor-pointer outline-none after:content-[''] after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:rounded-full after:bg-primary after:origin-center after:scale-x-0 after:transition-transform after:duration-200 ${
                  activeTab === tab.key ? "after:scale-x-100" : ""
                }`}
              >
                <TabIcon tab={tab.key} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {activeTab === "quality" ? (
            <div className="space-y-2">
              {QUALITIES.map((option) => {
                const isActive = quality === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onQualityChange(isActive ? null : option)}
                    className={`w-full flex items-center justify-between p-3 rounded-r-xl transition-all duration-200 border border-l-[3px] text-sm font-medium text-gray-300 hover:text-white ${
                      isActive
                        ? "bg-primary/15 border-primary/40 text-white border-l-primary"
                        : "player-tile !border-l-white/40"
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                    {QUALITY_BADGES[option] ? (
                      <span className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide rounded-md bg-white/5 text-gray-400">
                        {QUALITY_BADGES[option]}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          {activeTab === "subtitles" ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onSubtitleChange(null)}
                className={`w-full flex items-center justify-between p-3 rounded-r-xl transition-all duration-200 border border-l-[3px] text-sm font-medium ${
                  !subtitleLabel || subtitleLabel === "Off"
                    ? "bg-primary/15 border-primary/40 text-white border-l-primary"
                    : "player-tile text-gray-300 hover:text-white !border-l-white/40"
                }`}
              >
                <span>Off</span>
              </button>
              {subtitleTracks.map((track) => {
                const isActive = subtitleLabel === (track.label || track.lang);
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => onSubtitleChange(track)}
                    className={`w-full flex items-center justify-between p-3 rounded-r-xl transition-all duration-200 border border-l-[3px] text-sm font-medium ${
                      isActive
                        ? "bg-primary/15 border-primary/40 text-white border-l-primary"
                        : "player-tile text-gray-300 hover:text-white !border-l-white/40"
                    }`}
                  >
                    <span>{track.label || track.lang}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {activeTab === "servers" ? (
            <div className="space-y-2">
              {servers.map((server) => {
                const isActive = activeServerId === server.id;
                return (
                  <button
                    key={server.id}
                    type="button"
                    onClick={() => onServerChange(server.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-r-xl transition-all duration-200 border border-l-[3px] text-sm font-medium ${
                      isActive
                        ? "bg-primary/15 border-primary/40 text-white border-l-primary"
                        : "player-tile text-gray-300 hover:text-white !border-l-white/40"
                    }`}
                  >
                    <span>{server.name}</span>
                    {server.description ? (
                      <span className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide rounded-md bg-white/5 text-gray-400">
                        {server.description}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          {activeTab === "speed" ? (
            <div className="space-y-2">
              {PLAYBACK_RATES.map((option) => {
                const isActive = rate === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onRateChange(option)}
                    className={`w-full flex items-center justify-between p-3 rounded-r-xl transition-all duration-200 border border-l-[3px] text-sm font-medium ${
                      isActive
                        ? "bg-primary/15 border-primary/40 text-white border-l-primary"
                        : "player-tile text-gray-300 hover:text-white !border-l-white/40"
                    }`}
                  >
                    <span>{option === 1 ? "Normal" : `${option}x`}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
