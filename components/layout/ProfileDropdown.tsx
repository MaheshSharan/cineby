import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  BookmarkIcon,
  GalleryVerticalEndIcon,
  ImageIcon,
  LogOutIcon,
  PartyPopperIcon,
  UsersIcon,
} from "@/components/ui/icons";

interface ProfileDropdownProps {
  open: boolean;
  onClose: () => void;
  onOpenAvatarModal?: () => void;
  profileAvatarUrl?: string;
  profileName?: string;
}

export function ProfileDropdown({
  open,
  onClose,
  onOpenAvatarModal,
  profileAvatarUrl,
  profileName,
}: ProfileDropdownProps) {
  const router = useRouter();
  const { user, logout, openAuthModal, showToast } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const handleSwitchProfile = () => {
    onClose();
    router.push("/profiles");
  };

  const handleChangeAvatar = () => {
    onClose();
    if (onOpenAvatarModal) {
      onOpenAvatarModal();
    }
  };

  return (
    <div className="absolute top-full right-0 z-50 pt-2 animate-in fade-in zoom-in-95 duration-150">
      <div
        ref={menuRef}
        role="menu"
        aria-label="My Account"
        className="profile-dropdown pointer-events-auto overflow-hidden w-[240px] rounded-[14px] origin-top-right text-left"
        style={{
          background:
            "linear-gradient(rgba(255, 255, 255, 0.055) 0%, rgba(255, 255, 255, 0.01) 100%), rgba(22, 22, 24, 0.94)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          boxShadow:
            "inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 12px 28px -6px rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* User profile header (When logged in) */}
        {user && (
          <>
            <div className="flex items-center gap-2.5 px-3 pt-3 pb-2.5">
              <span className="relative rounded-full overflow-hidden ring-1 ring-white/20 shrink-0 w-9 h-9">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profileAvatarUrl || "/avatar/classic-1.png"}
                  alt={profileName || "Account"}
                  className="w-full h-full object-cover"
                />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-white truncate text-[13px]">
                  {profileName || "Account"}
                </p>
                <p className="text-white/45 truncate mt-0.5 text-[11px]">{user.email}</p>
              </div>
            </div>
            <div className="mx-3 h-px bg-white/10" />
          </>
        )}

        {/* Section 1: Navigation */}
        <div className="p-1.5 space-y-0.5">
          <Link
            href="/history"
            onClick={onClose}
            role="menuitem"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/[0.07] transition-colors duration-150 text-left"
          >
            <GalleryVerticalEndIcon size={15} className="shrink-0 text-white/55" />
            <span>History</span>
          </Link>

          <Link
            href="/watchlist"
            onClick={onClose}
            role="menuitemcheckbox"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/[0.07] transition-colors duration-150 text-left"
          >
            <BookmarkIcon size={15} className="shrink-0 text-white/55" />
            <span>Watchlist</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              onClose();
              showToast("Watch Party coming soon!");
            }}
            role="menuitem"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/[0.07] transition-colors duration-150 text-left cursor-pointer"
          >
            <PartyPopperIcon size={15} className="shrink-0 text-white/55" />
            <span>Watch Party</span>
          </button>
        </div>

        <div className="mx-3 h-px bg-white/10" />

        {/* Logged in: Profile Management */}
        {user ? (
          <>
            <div className="p-1.5 space-y-0.5">
              <button
                type="button"
                role="menuitem"
                onClick={handleSwitchProfile}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/[0.07] transition-colors duration-150 text-left cursor-pointer"
              >
                <UsersIcon size={15} className="shrink-0 text-white/55" />
                <span>Switch profile</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleChangeAvatar}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/[0.07] transition-colors duration-150 text-left cursor-pointer"
              >
                <ImageIcon size={15} className="shrink-0 text-white/55" />
                <span>Change avatar</span>
              </button>
            </div>

            <div className="mx-3 h-px bg-white/10" />

            <div className="p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-primary/90 hover:text-primary hover:bg-white/[0.07] transition-colors duration-150 text-left cursor-pointer"
              >
                <LogOutIcon size={15} className="shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </>
        ) : (
          /* Logged out: Login / Sign up buttons matching Movy */
          <div className="flex gap-2 p-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                openAuthModal("login");
              }}
              className="flex-1 rounded-lg bg-white font-semibold text-[#0b0f14] transition-colors hover:bg-white/90 py-2 px-3 text-[12px] cursor-pointer"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                openAuthModal("register");
              }}
              className="flex-1 rounded-lg border border-white/15 hover:border-white/30 font-semibold text-white/85 hover:text-white transition-colors py-2 px-3 text-[12px] cursor-pointer"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
