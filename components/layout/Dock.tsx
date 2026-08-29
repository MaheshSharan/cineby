import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import {
  ClapperboardIcon,
  CodeIcon,
  GalleryVerticalEndIcon,
  Grid2x2Icon,
  HeartIcon,
  HomeIcon,
  LogInIcon,
  PartyPopperIcon,
  SearchIcon,
  TvIcon,
  UserRoundIcon,
} from "@/components/ui/icons";

interface DockProps {
  onOpenSearch: () => void;
  onOpenAccount: () => void;
}

const CONTENT_LINKS = [
  { label: "Movies", href: "/browse/movie", Icon: ClapperboardIcon },
  { label: "TV Shows", href: "/browse/tv", Icon: TvIcon },
];

export function Dock({ onOpenSearch, onOpenAccount }: DockProps) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { activeProfile } = useActiveProfile();
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const browseRef = useRef<HTMLDivElement>(null);

  const isHome = router.pathname === "/";

  useEffect(() => {
    if (!isBrowseOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (browseRef.current && !browseRef.current.contains(event.target as Node)) {
        setIsBrowseOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsBrowseOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isBrowseOpen]);

  const handleAccountClick = () => {
    if (user) {
      onOpenAccount();
    } else {
      openAuthModal("login");
    }
  };

  const itemBaseClass =
    "relative inline-flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-[#05070a] border border-white/10 text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_6px_14px_-6px_rgba(0,0,0,0.55)] transition-all duration-200 hover:border-primary/50 hover:text-white focus-visible:ring-2 focus-visible:ring-primary/40 outline-none";

  return (
    <div className="md:hidden">
      {/* Browse Popup for Mobile Dock */}
      {isBrowseOpen ? (
        <div
          ref={browseRef}
          role="dialog"
          aria-label="Browse menu"
          className="fixed bottom-[76px] left-1/2 -translate-x-1/2 z-50 w-[300px] select-none"
        >
          <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#05070a]/90 p-3 shadow-2xl backdrop-blur-2xl">
            <div className="mb-2 text-center">
              <h3 className="text-sm font-semibold text-text-hi">Browse</h3>
            </div>

            <div className="space-y-2.5">
              <section className="space-y-1">
                <h4 className="px-1 text-[10px] font-medium uppercase tracking-[0.08em] text-text-mid">
                  Content
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {CONTENT_LINKS.map(({ label, href, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsBrowseOpen(false)}
                      className="group flex flex-col items-center rounded-lg p-1.5 transition-all duration-200 hover:bg-white/10"
                    >
                      <div className="glass-card-subtle mb-1 rounded-lg border border-primary/20 p-2 group-hover:border-primary/40">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <span className="text-[9px] font-medium text-white">{label}</span>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="space-y-1">
                <h4 className="px-1 text-[10px] font-medium uppercase tracking-[0.08em] text-text-mid">
                  Features
                </h4>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    className="group flex flex-col items-center rounded-lg p-1.5 transition-all duration-200 hover:bg-white/10"
                  >
                    <div className="glass-card-subtle mb-1 rounded-lg border border-yellow-400/20 p-2 group-hover:border-yellow-400/40">
                      <PartyPopperIcon size={18} className="text-yellow-400" />
                    </div>
                    <span className="truncate text-[9px] font-medium text-white">Watch Party</span>
                  </button>
                </div>
              </section>

              <section className="space-y-1">
                <h4 className="px-1 text-[10px] font-medium uppercase tracking-[0.08em] text-text-mid">
                  Personal
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    href="/history"
                    onClick={() => setIsBrowseOpen(false)}
                    className="glass-card-subtle flex h-14 w-full flex-col items-center justify-center rounded-lg border border-gray-400/20 p-1 text-gray-400 transition-all duration-200 hover:text-primary"
                  >
                    <GalleryVerticalEndIcon size={16} className="mb-0.5" />
                    <span className="text-[10px]">History</span>
                  </Link>
                  <Link
                    href="/watchlist"
                    onClick={() => setIsBrowseOpen(false)}
                    className="glass-card-subtle flex h-14 w-full flex-col items-center justify-center rounded-lg border border-gray-400/20 p-1 text-gray-400 transition-all duration-200 hover:text-primary"
                  >
                    <HeartIcon size={16} className="mb-0.5" />
                    <span className="text-[10px]">Watchlist</span>
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}

      {/* Dock Panel */}
      <div
        className="fixed bottom-2 left-1/2 -translate-x-1/2 z-40 flex h-16 items-end gap-3 rounded-[20px] border border-white/10 bg-[#0b0f14]/85 px-2.5 pb-2.5 shadow-[0_24px_56px_-24px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl backdrop-saturate-150"
        role="toolbar"
        aria-label="Primary navigation dock"
      >
        {/* Home */}
        <Link
          href="/"
          className={`${itemBaseClass} ${isHome ? "text-white after:absolute after:-bottom-2 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-primary after:shadow-[0_0_10px_#dc2626]" : ""}`}
          aria-label="Home"
          title="Home"
        >
          <div className="pointer-events-none flex items-center justify-center">
            <HomeIcon size={22} strokeWidth={1.6} />
          </div>
        </Link>

        {/* API */}
        <a
          href="https://www.vidking.net/"
          target="_blank"
          rel="noopener noreferrer"
          className={itemBaseClass}
          aria-label="API"
          title="API"
        >
          <div className="pointer-events-none flex items-center justify-center">
            <CodeIcon size={20} />
          </div>
        </a>

        {/* Browse */}
        <button
          type="button"
          onClick={() => setIsBrowseOpen((prev) => !prev)}
          className={itemBaseClass}
          aria-label="Browse"
          aria-haspopup="true"
          aria-expanded={isBrowseOpen}
          title="Browse"
        >
          <div className="pointer-events-none flex items-center justify-center">
            <Grid2x2Icon size={22} strokeWidth={1.6} />
          </div>
        </button>

        {/* Search */}
        <button
          type="button"
          onClick={onOpenSearch}
          className={itemBaseClass}
          aria-label="Search"
          title="Search"
        >
          <div className="pointer-events-none flex items-center justify-center">
            <SearchIcon size={20} />
          </div>
        </button>

        {/* Account / Login */}
        <button
          type="button"
          onClick={handleAccountClick}
          className={itemBaseClass}
          aria-label={user ? "Open account" : "Login"}
          title={user ? "Account" : "Login"}
        >
          <div className="pointer-events-none flex items-center justify-center">
            {user ? (
              (activeProfile?.avatarUrl || user.avatarUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeProfile?.avatarUrl || user.avatarUrl || "/avatar/classic-1.png"}
                  alt={activeProfile?.name || user.displayName || user.email}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <UserRoundIcon size={20} />
              )
            ) : (
              <LogInIcon size={20} strokeWidth={1.6} />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
