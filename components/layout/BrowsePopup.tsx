import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  ChevronDownIcon,
  ClapperboardIcon,
  FanIcon,
  GalleryVerticalEndIcon,
  Grid2x2Icon,
  HeartIcon,
  PartyPopperIcon,
  TvIcon,
} from "@/components/ui/icons";

const CONTENT_LINKS = [
  { label: "Movies", href: "/browse/movie", Icon: ClapperboardIcon },
  { label: "TV Shows", href: "/browse/tv", Icon: TvIcon },
  { label: "Anime", href: "/browse/anime", Icon: FanIcon },
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
          className="absolute top-full right-0 z-50 mt-2 pointer-events-none"
        >
          <div className="browse-popup-content pointer-events-auto w-[320px] overflow-hidden rounded-[20px] border border-white/10 bg-[#05070a]/85 shadow-[0_24px_56px_-24px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.04)_inset] backdrop-blur-[20px] select-none">
            <div className="flex items-center justify-center p-3">
              <h3 className="text-sm font-semibold text-text-hi tracking-[-0.01em]">Browse</h3>
            </div>

            <div className="p-2.5 space-y-2.5">
              <section className="space-y-1">
                <h4 className="px-1 mb-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-text-mid">
                  Content
                </h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {CONTENT_LINKS.map(({ label, href, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className="group flex flex-col items-center rounded-lg p-2 transition-all duration-200 hover:bg-white/10"
                    >
                      <div className="glass-card-subtle mb-1 rounded-lg border border-primary/20 p-2 transition-all duration-200 group-hover:border-primary/40">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <span className="text-[9px] font-medium text-white">{label}</span>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="space-y-1">
                <h4 className="px-1 mb-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-text-mid">
                  Features
                </h4>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    className="group flex flex-col items-center rounded-lg p-2 transition-all duration-200 hover:bg-white/10"
                  >
                    <div className="glass-card-subtle mb-1 rounded-lg border border-yellow-400/20 p-2 transition-all duration-200 group-hover:border-yellow-400/40">
                      <PartyPopperIcon size={20} className="text-yellow-400" />
                    </div>
                    <span className="truncate text-[9px] font-medium text-white">Watch Party</span>
                  </button>
                </div>
              </section>

              <section className="space-y-1">
                <h4 className="px-1 mb-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-text-mid">
                  Personal
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    href="/history"
                    onClick={() => setIsOpen(false)}
                    className="glass-card-subtle flex h-20 w-full flex-col items-center justify-center rounded-lg border border-gray-400/20 p-1.5 text-gray-400 transition-all duration-200 hover:border-primary/20 hover:text-primary"
                  >
                    <GalleryVerticalEndIcon size={18} className="mb-1" />
                    <span className="text-xs">History</span>
                  </Link>
                  <Link
                    href="/watchlist"
                    onClick={() => setIsOpen(false)}
                    className="glass-card-subtle flex h-20 w-full flex-col items-center justify-center rounded-lg border border-gray-400/20 p-1.5 text-gray-400 transition-all duration-200 hover:border-primary/20 hover:text-primary"
                  >
                    <HeartIcon size={18} className="mb-1" />
                    <span className="text-xs">Watchlist</span>
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
