import type { ReactNode } from "react";

interface PlayerHeaderProps {
  onBack?: () => void;
  visible: boolean;
  rightSlot?: ReactNode;
}

export function PlayerHeader({ onBack, visible, rightSlot }: PlayerHeaderProps) {
  return (
    <div
      data-player-ui
      className={`absolute inset-x-0 top-0 z-40 pointer-events-auto transition-[opacity,transform] duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between h-[68px] md:h-20 lg:h-24 px-4 md:px-10 gap-x-5 md:gap-x-8 header-top">
        <div className="flex items-center gap-4 min-w-0">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="flex-shrink-0 flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full text-text-hi hover:bg-white/10 transition-colors"
            >
              <svg
                width="1.5em"
                height="1.5em"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M21 12L3 12M3 12L11.5 3.5M3 12L11.5 20.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
        </div>

        {rightSlot ? <div className="flex-shrink-0">{rightSlot}</div> : null}
      </div>
    </div>
  );
}
