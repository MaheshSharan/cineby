import { useEffect, useRef } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  CalendarIcon,
  LockIcon,
  LogOutIcon,
  SettingsIcon,
  UploadIcon,
  UserRoundIcon,
  XIcon,
} from "@/components/ui/icons";

interface AccountDrawerProps {
  open: boolean;
  onClose: () => void;
}

function formatCreatedAt(value?: string): string {
  if (!value) return "8/13/2026";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "8/13/2026";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function AccountDrawer({ open, onClose }: AccountDrawerProps) {
  const { user, logout } = useAuth();
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const username = user?.displayName || user?.email.split("@")[0] || "User";

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-[40] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        ref={asideRef}
        aria-hidden={!open}
        className={`glass-card-dark fixed right-0 top-0 z-[50] flex h-screen w-full max-w-sm flex-col border-l border-white/10 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white">My Account</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="group rounded-lg p-2 transition-colors hover:bg-white/10"
          >
            <XIcon size={20} className="text-gray-400 transition-colors group-hover:text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hidden" style={{ scrollbarWidth: "none" }}>
          <div className="flex h-full w-full flex-col justify-between gap-6">
            <div className="flex flex-col items-center">
              <div className="group relative mb-6">
                <div className="relative">
                  <div className="glass-card-subtle h-24 w-24 rounded-full border border-primary/30 p-1 shadow-lg shadow-primary/10">
                    <img
                      src="/default-avatar.jpeg"
                      alt={username}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                  <div className="glass-card absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-primary shadow-lg">
                    <UserRoundIcon size={14} className="text-white" />
                  </div>
                </div>
              </div>

              <div className="mb-6 text-center">
                <h1 className="mb-2 text-xl font-semibold text-white">{username}</h1>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <CalendarIcon size={14} />
                  <span>Created at: {formatCreatedAt(user?.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-4 flex items-center gap-2">
                <SettingsIcon size={16} className="text-gray-400" />
                <h2 className="text-sm font-medium uppercase tracking-wider text-gray-300">
                  Settings
                </h2>
              </div>
              <div className="space-y-3">
                <input
                  type="file"
                  name="avatar"
                  id="avatar"
                  accept="image/png, image/jpeg"
                  className="hidden"
                />
                <label
                  htmlFor="avatar"
                  className="glass-card-subtle group flex cursor-pointer items-center gap-3 rounded-xl border border-gray-400/20 p-3 transition-all duration-200 hover:border-primary/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 transition-colors group-hover:bg-primary/30">
                    <UploadIcon size={18} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-gray-300 transition-colors group-hover:text-white">
                    Upload avatar
                  </span>
                </label>
                <button
                  type="button"
                  className="glass-card-subtle group flex w-full items-center gap-3 rounded-xl border border-gray-400/20 p-3 transition-all duration-200 hover:border-primary/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 transition-colors group-hover:bg-primary/30">
                    <LockIcon size={18} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-gray-300 transition-colors group-hover:text-white">
                    Change password
                  </span>
                </button>
              </div>
            </div>

            <div className="border-t border-gray-700/50 pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-primary/90 p-3 transition-all duration-200 hover:bg-primary shadow-lg hover:shadow-primary/20"
              >
                <LogOutIcon size={18} className="text-white transition-transform group-hover:scale-110" />
                <span className="font-medium text-white">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
