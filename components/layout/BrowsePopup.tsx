import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  AntennaIcon,
  ChevronDownIcon,
  ClapperboardIcon,
  FanIcon,
  GalleryVerticalEndIcon,
  Grid2x2Icon,
  HeartIcon,
  PartyPopperIcon,
  ProjectorIcon,
  SlidersHorizontalIcon,
  TvIcon,
  XIcon,
} from "@/components/ui/icons";

const CONTENT_LINKS = [
  { label: "Movies", href: "/browse/movie", Icon: ClapperboardIcon },
  { label: "TV Shows", href: "/browse/tv", Icon: TvIcon },
  { label: "Anime", href: "/browse/anime", Icon: FanIcon },
];

const FEATURE_LINKS = [
  { label: "Channels", Icon: AntennaIcon },
  { label: "4K", Icon: ProjectorIcon },
  { label: "Watch Party", Icon: PartyPopperIcon },
];

export function BrowsePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Browse"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-white transition-colors duration-150 hover:bg-white/10 hover:text-primary"
      >
        <Grid2x2Icon size={16} className="text-primary" />
        Browse
        <ChevronDownIcon size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label="Browse menu"
          className="browse-popup-content absolute left-0 top-full z-50 mt-2 overflow-hidden"
        >
          <div className="w-[320px] rounded-[20px] border border-white/10 bg-[#05070a]/85 shadow-[0_24px_56px_-24px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.04)_inset] backdrop-blur-[20px]">
            <div className="flex items-center justify-between px-5 pb-2 pt-5">
              <span className="text-sm font-semibold text-text-hi">Browse</span>
              <button
                type="button"
                aria-label="Close browse menu"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-mid transition-colors duration-150 hover:bg-white/10 hover:text-white"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="px-5 pb-2 pt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-text-mid">
              Content
            </div>
            <div className="px-4">
              <div className="mb-2 grid grid-cols-3 gap-1.5">
                {CONTENT_LINKS.map(({ label, href, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-white/10 py-3 px-2 text-white transition-all duration-200 hover:border-primary/40 hover:bg-white/[0.06]"
                  >
                    <Icon size={20} className="text-primary" />
                    <span className="text-[9px] font-medium text-white">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="px-5 pt-2 text-[10px] font-medium uppercase tracking-[0.08em] text-text-mid">
              Features
            </div>
            <div className="px-4">
              <div className="mb-3 grid grid-cols-3 gap-1.5">
                {FEATURE_LINKS.map(({ label, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-white/10 py-3 px-2 text-white transition-all duration-200 hover:border-primary/40 hover:bg-white/[0.06]"
                  >
                    <Icon size={20} className="text-primary" />
                    <span className="text-[9px] font-medium text-white">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 px-4 pb-4 pt-3">
              <div className="flex items-center justify-between">
                <button type="button" className="flex items-center gap-3 text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-text-mid">
                    <GalleryVerticalEndIcon size={18} />
                  </span>
                  <span className="text-sm text-white">History</span>
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <button type="button" className="flex items-center gap-3 text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-text-mid">
                    <HeartIcon size={18} />
                  </span>
                  <span className="text-sm text-white">Watchlist</span>
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-text-mid">
                    <SlidersHorizontalIcon size={16} />
                  </span>
                  <span className="text-sm text-white">Ads</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={false}
                  aria-label="Toggle ads"
                  className="relative h-6 w-10 rounded-full bg-white/10 transition-colors duration-200"
                >
                  <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-text-hi transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
