import type { ReactNode } from "react";

interface PlayerHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  visible: boolean;
  rightSlot?: ReactNode;
}

export function PlayerHeader({
  title,
  subtitle,
  onBack,
  visible,
  rightSlot,
}: PlayerHeaderProps) {
  return (
    <div
      data-player-ui
      className={`absolute inset-x-0 top-0 z-40 transition-[opacity,transform] duration-300 ${
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between h-[68px] md:h-20 lg:h-24 px-4 md:px-10 gap-x-4 md:gap-x-8 header-top">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="flex-shrink-0 flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full text-white hover:bg-white/10 transition-colors"
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

          {title ? (
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="truncate text-base md:text-xl font-bold text-white leading-tight">
                {title}
              </h1>
              {subtitle ? (
                <p className="truncate text-xs md:text-sm text-gray-400 font-medium leading-normal mt-0.5">
                  {subtitle}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {rightSlot ? (
          <div className="flex-shrink-0 flex items-center gap-2 md:gap-3">
            {rightSlot}
          </div>
        ) : null}
      </div>
    </div>
  );
}
