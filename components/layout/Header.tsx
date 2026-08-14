import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { AccountDrawer } from "@/components/layout/AccountDrawer";
import { BrowsePopup } from "@/components/layout/BrowsePopup";
import { Dock } from "@/components/layout/Dock";
import { SearchModal } from "@/components/search/SearchModal";
import { CodeIcon, HomeIcon, SearchIcon, UserRoundIcon } from "@/components/ui/icons";

export function Header() {
  const { user, openAuthModal } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const handleUserClick = () => {
    if (user) {
      setIsAccountOpen(true);
    } else {
      openAuthModal("login");
    }
  };

  return (
    <>
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-30">
        <div className="pointer-events-none absolute inset-x-0 -top-6 h-36 bg-gradient-to-b from-neo-bg/75 via-neo-bg/25 to-transparent" />
        <div className="layout-container pointer-events-auto">
          <div className="relative flex h-[68px] items-center justify-between md:h-[80px]">
            <Link href="/" className="group relative z-10 flex items-center gap-2" aria-label="Cineby home">
              <picture>
                <img
                  src="/logo.png"
                  alt="Cineby"
                  width={40}
                  height={40}
                  className="h-8 w-8 transition-transform duration-300 group-hover:scale-[1.06] md:h-10 md:w-10"
                />
              </picture>
              <span className="text-xl font-bold text-white md:text-2xl">Cineby</span>
            </Link>

            <nav className="relative z-10 hidden items-center gap-1 md:flex" aria-label="Main navigation">
              <Link
                href="/"
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-white transition-colors duration-150 hover:bg-white/10 hover:text-primary"
              >
                <HomeIcon size={16} />
                Home
              </Link>
              <a
                href="https://www.vidking.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-white transition-colors duration-150 hover:bg-white/10 hover:text-primary"
              >
                <CodeIcon size={16} />
                API
              </a>
              <BrowsePopup />
              <button
                type="button"
                aria-label="Search"
                onClick={() => setIsSearchOpen(true)}
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-text-hi transition-colors duration-150 hover:bg-white/10 hover:text-primary"
              >
                <SearchIcon size={24} className="text-text-hi" />
              </button>
              <button
                type="button"
                aria-label={user ? "Open account" : "Login"}
                onClick={handleUserClick}
                className="ml-1 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-text-hi transition-colors duration-150 hover:bg-white/10 hover:text-primary"
              >
                {user ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl || "/default-avatar.jpeg"}
                    alt={user.displayName || user.email}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRoundIcon size={22} />
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Dock Navigation */}
      <Dock
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AccountDrawer open={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </>
  );
}
