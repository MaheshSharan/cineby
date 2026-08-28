import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import { useActiveProfile } from "@/hooks/useActiveProfile";

import { useAuth } from "@/components/auth/AuthProvider";
import { Dock } from "@/components/layout/Dock";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";
import { AvatarModal } from "@/components/profile/AvatarModal";
import { SearchModal } from "@/components/search/SearchModal";
import {
  ClapperboardIcon,
  FanIcon,
  HomeIcon,
  SearchIcon,
  TvIcon,
  UserRoundIcon,
} from "@/components/ui/icons";

interface NavItem {
  label: string;
  href: string;
  isActive: boolean;
  icon: React.ReactNode;
}

export function Header() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { activeProfile } = useActiveProfile();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const currentPath = router.asPath;
  const isHome = router.pathname === "/";
  const isMovies = currentPath.startsWith("/browse/movie") || router.pathname.startsWith("/movie");
  const isTv = currentPath.startsWith("/browse/tv") || router.pathname.startsWith("/tv");
  const isAnime = currentPath.startsWith("/browse/anime");

  const navItems: NavItem[] = [
    {
      label: "Home",
      href: "/",
      isActive: isHome,
      icon: <HomeIcon size={14} className="flex-shrink-0" />,
    },
    {
      label: "Movies",
      href: "/browse/movie",
      isActive: isMovies,
      icon: <ClapperboardIcon size={14} className="flex-shrink-0" />,
    },
    {
      label: "TV Shows",
      href: "/browse/tv",
      isActive: isTv,
      icon: <TvIcon size={14} className="flex-shrink-0" />,
    },
    {
      label: "Anime",
      href: "/browse/anime",
      isActive: isAnime,
      icon: <FanIcon size={14} className="flex-shrink-0" />,
    },
  ];

  const handleUserClick = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  return (
    <>
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-30">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-20 md:h-24"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(rgba(5, 7, 10, 0.92) 0%, rgba(5, 7, 10, 0.55) 40%, rgba(5, 7, 10, 0.3) 62%, rgba(5, 7, 10, 0.13) 79%, rgba(5, 7, 10, 0.04) 91%, rgba(5, 7, 10, 0) 100%)",
            opacity: 0.72,
          }}
        />
        <div className="layout-container pointer-events-auto">
          <div className="relative flex h-[68px] items-center justify-between md:h-[80px]">
            {/* Left side logo & heading (untouched) */}
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

            {/* Right side navigation cluster */}
            <nav
              className="control-3d header-search-cluster relative hidden md:flex items-center h-10 px-1 rounded-[12px]"
              aria-label="Main navigation"
              style={{
                background:
                  "linear-gradient(rgba(255, 255, 255, 0.055) 0%, rgba(255, 255, 255, 0.01) 100%), rgba(22, 22, 24, 0.82)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                boxShadow:
                  "inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 6px 14px -6px rgba(0, 0, 0, 0.55)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center gap-0.5 h-10 whitespace-nowrap">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] text-[13px] transition-colors duration-200 ${
                      item.isActive
                        ? "bg-white/[0.12] text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                        : "text-white/70 font-medium hover:text-white hover:bg-white/[0.07]"
                    }`}
                  >
                    {item.isActive ? item.icon : null}
                    <span>{item.label}</span>
                  </Link>
                ))}

                <span className="w-px h-4 mx-1.5 bg-white/15" aria-hidden="true" />
              </div>

              {/* Search button */}
              <button
                type="button"
                aria-label="Search"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center h-8 w-8 rounded-[8px] text-white/75 hover:text-white hover:bg-white/[0.07] transition-colors duration-200 cursor-pointer"
              >
                <SearchIcon size={16} />
              </button>

              {/* Profile / Account trigger with Dropdown */}
              <div className="relative profile-trigger">
                <button
                  type="button"
                  aria-label={user ? "My Account" : "Login"}
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="menu"
                  onClick={handleUserClick}
                  className="flex items-center justify-center h-8 w-8 rounded-[8px] text-white/75 hover:text-white hover:bg-white/[0.07] transition-colors duration-200 cursor-pointer"
                >
                  {user ? (
                    <span className="relative flex items-center justify-center w-5 h-5 rounded-full overflow-hidden ring-1 ring-white/25">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeProfile?.avatarUrl || user.avatarUrl || "/avatar/classic-1.png"}
                        alt={activeProfile?.name || user.displayName || user.email}
                        className="w-full h-full object-cover"
                      />
                    </span>
                  ) : (
                    <UserRoundIcon size={16} />
                  )}
                </button>

                <ProfileDropdown
                  open={isProfileDropdownOpen}
                  onClose={() => setIsProfileDropdownOpen(false)}
                  onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
                />
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Dock Navigation */}
      <Dock
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAccount={() => {
          if (user) {
            router.push("/profiles");
          } else {
            openAuthModal("login");
          }
        }}
      />

      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AvatarModal
        open={isAvatarModalOpen}
        currentAvatarUrl={activeProfile?.avatarUrl || user?.avatarUrl || undefined}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </>
  );
}

