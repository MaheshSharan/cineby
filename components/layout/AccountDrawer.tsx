import { useEffect, useRef } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  LogOutIcon,
  LockIcon,
  SettingsIcon,
  UploadIcon,
  UserRoundIcon,
  XIcon,
} from "@/components/ui/icons";

interface AccountDrawerProps {
  open: boolean;
  onClose: () => void;
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid Date";
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
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

  return (
    <aside
      ref={asideRef}
      aria-hidden={!open}
      className={`fixed right-0 top-0 z-[50] flex h-screen w-[320px] flex-col border-l border-white/10 bg-[#05070a]/85 shadow-2xl backdrop-blur-[20px] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="border-b border-white/10 p-5">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">My Account</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-mid transition-colors duration-150 hover:bg-white/10 hover:text-white"
          >
            <XIcon size={20} />
          </button>
        </div>

        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <div className="relative h-24 w-24">
            <div className="h-24 w-24 rounded-full border border-primary/30 bg-white/[0.04] p-1 backdrop-blur-[14px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20">
                <UserRoundIcon size={40} className="text-primary" />
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0b0f14] bg-primary">
              <UserRoundIcon size={14} className="text-white" />
            </div>
          </div>
          <h3 className="mt-2 text-base font-semibold text-white">{user?.email ?? "Account"}</h3>
          <p className="text-xs text-text-mid">Created at: {user ? formatCreatedAt(user.createdAt) : ""}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="mb-4">
          <div className="mb-3 flex items-center gap-2 text-text-mid">
            <SettingsIcon size={14} />
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-mid">Settings</p>
          </div>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-white transition-colors duration-150 hover:bg-white/[0.06]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-text-mid">
                <UploadIcon size={18} />
              </span>
              <span className="text-sm text-white">Upload avatar</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-white transition-colors duration-150 hover:bg-white/[0.06]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-text-mid">
                <LockIcon size={18} />
              </span>
              <span className="text-sm text-white">Change password</span>
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.06] py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-white/10"
        >
          <LogOutIcon size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
