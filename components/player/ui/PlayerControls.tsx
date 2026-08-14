import type { ReactNode } from "react";

import { SeekBar } from "./SeekBar";
import { TimeDisplay } from "./TimeDisplay";
import { VolumeControl } from "./VolumeControl";

interface PlayerControlsProps {
  visible: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  title?: string;
  subtitle?: string;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSeekBy: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onToggleSubtitles: () => void;
  children?: ReactNode;
}

export function PlayerControls({
  visible,
  isPlaying,
  currentTime,
  duration,
  volume,
  muted,
  title,
  subtitle,
  onTogglePlay,
  onSeek,
  onSeekBy,
  onVolumeChange,
  onToggleMute,
  onToggleFullscreen,
  onOpenSettings,
  onToggleSubtitles,
  children,
}: PlayerControlsProps) {
  return (
    <div
      data-player-ui
      className={`absolute bottom-0 left-0 right-0 z-30 h-44 flex items-end pointer-events-auto transition-[opacity,transform] duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="w-full flex flex-col items-stretch pb-3 pt-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="px-4 md:px-8">
          {/* Seek row */}
          <div className="flex items-center gap-x-3">
            <div className="flex items-center flex-1">
              <SeekBar
                currentTime={currentTime}
                duration={duration}
                onSeek={onSeek}
              />
            </div>
            <TimeDisplay currentTime={currentTime} duration={duration} />
          </div>

          {/* Controls row */}
          <div className="relative flex items-center justify-between mt-2 md:mt-3">
            {/* Centered title (does not affect side control layouts) */}
            {title ? (
              <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
                <div className="min-w-0 max-w-[40%] text-center">
                  <p className="truncate text-[13px] font-semibold text-white drop-shadow-md md:text-sm">
                    {title}
                  </p>
                  {subtitle ? (
                    <p className="truncate text-[11px] text-white/60 md:text-xs">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="flex space-x-3 items-center relative z-10">
              {/* Play / Pause */}
              <button
                type="button"
                id="ButtonPlay"
                onClick={onTogglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                title={isPlaying ? "Pause (space)" : "Play (space)"}
                className="tabbable p-2 rounded-full hover:bg-white/20 transition-transform duration-100 flex items-center gap-3 active:scale-110 active:bg-white/30 active:text-white"
              >
                <span className="text-3xl md:text-2xl flex items-center justify-center w-[1em] h-[1em]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 384 512"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d={
                        isPlaying
                          ? "M0 448V64c0-17.7 14.3-32 32-32s32 14.3 32 32V448c0 17.7-14.3 32-32 32S0 465.7 0 448zM256 64c0-17.7 14.3-32 32-32s32 14.3 32 32V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V64z"
                          : "M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
                      }
                    />
                  </svg>
                </span>
              </button>

              {/* Rewind 10s */}
              <button
                type="button"
                onClick={() => onSeekBy(-10)}
                aria-label="Rewind 10 seconds"
                title="Rewind 10 seconds (←)"
                className="tabbable p-2 rounded-full hover:bg-white/20 transition-transform duration-100 flex items-center gap-3 active:scale-110 active:bg-white/30 active:text-white"
              >
                <span className="text-3xl md:text-2xl flex items-center justify-center w-[1em] h-[1em]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 25 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M13.6667 12.3333L9 7.66667M9 7.66667L13.6667 3M9 7.66667H18.3333C19.571 7.66667 20.758 8.15833 21.6332 9.0335C22.5083 9.90867 23 11.0957 23 12.3333C23 13.571 22.5083 14.758 21.6332 15.6332C20.758 16.5083 19.571 17 18.3333 17H16"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      fill="currentColor"
                      d="M4.50426 14.2727V23H2.65909V16.0241H2.60795L0.609375 17.277V15.6406L2.76989 14.2727H4.50426ZM10.0004 23.1918C9.2674 23.1889 8.63672 23.0085 8.10831 22.6506C7.58274 22.2926 7.17791 21.7741 6.89382 21.0952C6.61257 20.4162 6.47337 19.5994 6.47621 18.6449C6.47621 17.6932 6.61683 16.8821 6.89808 16.2116C7.18217 15.5412 7.587 15.0312 8.11257 14.6818C8.64098 14.3295 9.27024 14.1534 10.0004 14.1534C10.7305 14.1534 11.3583 14.3295 11.8839 14.6818C12.4123 15.0341 12.8185 15.5455 13.1026 16.2159C13.3867 16.8835 13.5273 17.6932 13.5245 18.6449C13.5245 19.6023 13.3825 20.4205 13.0984 21.0994C12.8171 21.7784 12.4137 22.2969 11.8881 22.6548C11.3626 23.0128 10.7333 23.1918 10.0004 23.1918ZM10.0004 21.6619C10.5004 21.6619 10.8995 21.4105 11.1978 20.9077C11.4961 20.4048 11.6438 19.6506 11.641 18.6449C11.641 17.983 11.5728 17.4318 11.4364 16.9915C11.3029 16.5511 11.1126 16.2202 10.8654 15.9986C10.6211 15.777 10.3327 15.6662 10.0004 15.6662C9.5032 15.6662 9.10547 15.9148 8.80717 16.4119C8.50888 16.9091 8.35831 17.6534 8.35547 18.6449C8.35547 19.3153 8.42223 19.875 8.55575 20.3239C8.69212 20.7699 8.88388 21.1051 9.13104 21.3295C9.3782 21.5511 9.66797 21.6619 10.0004 21.6619Z"
                    />
                  </svg>
                </span>
              </button>

              {/* Forward 10s */}
              <button
                type="button"
                onClick={() => onSeekBy(10)}
                aria-label="Forward 10 seconds"
                title="Forward 10 seconds (→)"
                className="tabbable p-2 rounded-full hover:bg-white/20 transition-transform duration-100 flex items-center gap-3 active:scale-110 active:bg-white/30 active:text-white"
              >
                <span className="text-3xl md:text-2xl flex items-center justify-center w-[1em] h-[1em]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 26 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M11.3333 12.3333L16 7.66667M16 7.66667L11.3333 3M16 7.66667H6.66667C5.42899 7.66667 4.242 8.15833 3.36684 9.0335C2.49167 9.90867 2 11.0957 2 12.3333C2 13.571 2.49167 14.758 3.36684 15.6332C4.242 16.5083 5.42899 17 6.66667 17H9"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      fill="currentColor"
                      d="M16.5043 14.2727V23H14.6591V16.0241H14.608L12.6094 17.277V15.6406L14.7699 14.2727H16.5043ZM22.0004 23.1918C21.2674 23.1889 20.6367 23.0085 20.1083 22.6506C19.5827 22.2926 19.1779 21.7741 18.8938 21.0952C18.6126 20.4162 18.4734 19.5994 18.4762 18.6449C18.4762 17.6932 18.6168 16.8821 18.8981 16.2116C19.1822 15.5412 19.587 15.0312 20.1126 14.6818C20.641 14.3295 21.2702 14.1534 22.0004 14.1534C22.7305 14.1534 23.3583 14.3295 23.8839 14.6818C24.4123 15.0341 24.8185 15.5455 25.1026 16.2159C25.3867 16.8835 25.5273 17.6932 25.5245 18.6449C25.5245 19.6023 25.3825 20.4205 25.0984 21.0994C24.8171 21.7784 24.4137 22.2969 23.8881 22.6548C23.3626 23.0128 22.7333 23.1918 22.0004 23.1918ZM22.0004 21.6619C22.5004 21.6619 22.8995 21.4105 23.1978 20.9077C23.4961 20.4048 23.6438 19.6506 23.641 18.6449C23.641 17.983 23.5728 17.4318 23.4364 16.9915C23.3029 16.5511 23.1126 16.2202 22.8654 15.9986C22.6211 15.777 22.3327 15.6662 22.0004 15.6662C21.5032 15.6662 21.1055 15.9148 20.8072 16.4119C20.5089 16.9091 20.3583 17.6534 20.3555 18.6449C20.3555 19.3153 20.4222 19.875 20.5558 20.3239C20.6921 20.7699 20.8839 21.1051 21.131 21.3295C21.3782 21.5511 21.668 21.6619 22.0004 21.6619Z"
                    />
                  </svg>
                </span>
              </button>

              {/* Volume */}
              <VolumeControl
                volume={volume}
                muted={muted}
                onVolumeChange={onVolumeChange}
                onToggleMute={onToggleMute}
              />
            </div>

            <div className="flex items-center gap-3 relative z-10">
              {children}

              {/* Subtitles */}
              <button
                type="button"
                onClick={onToggleSubtitles}
                aria-label="Subtitles"
                title="Subtitles (c)"
                className="tabbable p-2 rounded-full hover:bg-white/20 transition-transform duration-100 flex items-center gap-3 active:scale-110 active:bg-white/30 active:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.25em"
                  height="1.25em"
                  viewBox="0 0 25 20"
                  aria-hidden="true"
                >
                  <path
                    transform="translate(-3 -6)"
                    fill="currentColor"
                    d="M25.5,6H5.5A2.507,2.507,0,0,0,3,8.5v15A2.507,2.507,0,0,0,5.5,26h20A2.507,2.507,0,0,0,28,23.5V8.5A2.507,2.507,0,0,0,25.5,6ZM5.5,16h5v2.5h-5ZM18,23.5H5.5V21H18Zm7.5,0h-5V21h5Zm0-5H13V16H25.5Z"
                  />
                </svg>
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={onOpenSettings}
                aria-label="Settings"
                title="Settings (↑)"
                className="tabbable p-2 rounded-full hover:bg-white/20 transition-transform duration-100 flex items-center gap-3 active:scale-110 active:bg-white/30 active:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="1.25em"
                  width="1.25em"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
                </svg>
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                id="ButtonFullscreen"
                onClick={onToggleFullscreen}
                aria-label="Fullscreen"
                title="Fullscreen (f)"
                className="tabbable p-2 rounded-full hover:bg-white/20 transition-transform duration-100 flex items-center gap-3 active:scale-110 active:bg-white/30 active:text-white"
              >
                <span className="text-3xl md:text-2xl flex items-center justify-center w-[1em] h-[1em]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 448 512"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM32 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64v-64c0-17.7-14.3-32-32-32zM416 320c-17.7 0-32 14.3-32 32v64h-64c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32v-96c0-17.7-14.3-32-32-32z"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
