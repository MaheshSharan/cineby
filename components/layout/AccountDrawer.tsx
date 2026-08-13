import { useEffect, useRef, useState } from "react";

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
  if (!value) {
    return new Intl.DateTimeFormat("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
  }
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function AccountDrawer({ open, onClose }: AccountDrawerProps) {
  const { user, logout, refresh, showToast } = useAuth();
  const asideRef = useRef<HTMLElement>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsChangingPassword(false);
      setPasswordError(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
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

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showToast("Avatar image must be smaller than 3MB.");
      return;
    }

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const response = await fetch("/api/auth/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: base64Data }),
        });

        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          showToast(data.error ?? "Failed to update avatar.");
          return;
        }

        await refresh();
        showToast("Avatar updated successfully!");
      } catch {
        showToast("Failed to upload avatar.");
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setPasswordError(data.error ?? "Failed to change password.");
        return;
      }

      showToast("Password updated successfully!");
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Unable to change password. Please try again.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const username = user?.displayName || user?.email.split("@")[0] || "User";
  const avatarSrc = user?.avatarUrl || "/default-avatar.jpeg";

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
                  <div className="glass-card-subtle h-24 w-24 rounded-full border border-primary/30 p-1 shadow-lg shadow-primary/10 overflow-hidden">
                    <img
                      src={avatarSrc}
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
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
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
                    {isUploadingAvatar ? "Uploading avatar…" : "Upload avatar"}
                  </span>
                </label>

                {!isChangingPassword ? (
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(true)}
                    className="glass-card-subtle group flex w-full items-center gap-3 rounded-xl border border-gray-400/20 p-3 transition-all duration-200 hover:border-primary/30"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 transition-colors group-hover:bg-primary/30">
                      <LockIcon size={18} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium text-gray-300 transition-colors group-hover:text-white">
                      Change password
                    </span>
                  </button>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="glass-card-subtle rounded-xl border border-primary/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-hi uppercase tracking-wider">Change Password</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordError(null);
                        }}
                        className="text-xs text-text-mid hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <input
                      type="password"
                      placeholder="Current password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="glass-card-subtle w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-xs text-white placeholder:text-white/60 focus:border-primary focus:outline-none"
                    />
                    <input
                      type="password"
                      placeholder="New password (min 8 chars)"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="glass-card-subtle w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-xs text-white placeholder:text-white/60 focus:border-primary focus:outline-none"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="glass-card-subtle w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-xs text-white placeholder:text-white/60 focus:border-primary focus:outline-none"
                    />

                    {passwordError ? (
                      <p role="alert" className="text-xs text-accent-hi">
                        {passwordError}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={isSubmittingPassword}
                      className="w-full rounded-lg bg-primary py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {isSubmittingPassword ? "Updating…" : "Update Password"}
                    </button>
                  </form>
                )}
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

