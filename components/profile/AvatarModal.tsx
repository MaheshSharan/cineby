import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { CheckIcon, XIcon } from "@/components/ui/icons";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { CLASSIC_AVATARS, type AvatarItem } from "@/lib/profile/avatars";

interface AvatarModalProps {
  open: boolean;
  currentAvatarUrl?: string;
  onSelect?: (url: string) => void;
  onClose: () => void;
}

export function AvatarModal({
  open,
  currentAvatarUrl,
  onSelect,
  onClose,
}: AvatarModalProps) {
  const { user, refresh, showToast } = useAuth();
  const { activeProfile } = useActiveProfile();
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentAvatarUrl) {
      setSelectedUrl(currentAvatarUrl);
    } else if (activeProfile?.avatarUrl) {
      setSelectedUrl(activeProfile.avatarUrl);
    } else if (user?.avatarUrl) {
      setSelectedUrl(user.avatarUrl);
    }
  }, [currentAvatarUrl, activeProfile?.avatarUrl, user?.avatarUrl, open]);

  useEffect(() => {
    if (!open) {
      setShowAll(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open, onClose]);

  // Place the currently active avatar at index 0 so it's clearly shown first with the check tick
  const orderedAvatars = useMemo(() => {
    const list = [...CLASSIC_AVATARS];
    if (!selectedUrl) return list;

    const activeIdx = list.findIndex((a) => a.url === selectedUrl);
    if (activeIdx > 0) {
      const [activeItem] = list.splice(activeIdx, 1);
      list.unshift(activeItem);
    }
    return list;
  }, [selectedUrl]);

  if (!open) return null;

  const handleSelectAvatar = async (avatar: AvatarItem) => {
    setSelectedUrl(avatar.url);

    if (onSelect) {
      onSelect(avatar.url);
      onClose();
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch("/api/auth/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: avatar.url }),
      });

      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }

      // Update active profile and profile list in scoped localStorage
      if (user?.id) {
        const activeKey = `cineby_active_profile_${user.id}`;
        const profilesKey = `cineby_profiles_${user.id}`;

        try {
          const activeRaw = localStorage.getItem(activeKey);
          if (activeRaw) {
            const activeObj = JSON.parse(activeRaw);
            activeObj.avatarUrl = avatar.url;
            localStorage.setItem(activeKey, JSON.stringify(activeObj));

            // Also update corresponding profile in the profiles list
            const profilesRaw = localStorage.getItem(profilesKey);
            if (profilesRaw) {
              const profilesList = JSON.parse(profilesRaw);
              const updatedList = profilesList.map((p: { id: string; avatarUrl: string }) =>
                p.id === activeObj.id ? { ...p, avatarUrl: avatar.url } : p
              );
              localStorage.setItem(profilesKey, JSON.stringify(updatedList));
            }
          } else {
            const newActive = {
              id: "default-1",
              name: user.displayName || user.email.split("@")[0],
              avatarUrl: avatar.url,
            };
            localStorage.setItem(activeKey, JSON.stringify(newActive));
            localStorage.setItem(profilesKey, JSON.stringify([newActive]));
          }

          // Trigger same-tab updates across Header, Dock, etc.
          window.dispatchEvent(new StorageEvent("storage", { key: activeKey }));
        } catch {
          // ignore storage error
        }
      }

      await refresh();
      showToast("Avatar updated successfully!");
      onClose();
    } catch {
      showToast("Unable to save avatar. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const displayedAvatars = showAll ? orderedAvatars : orderedAvatars.slice(0, 12);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Choose your look"
        className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          background:
            "linear-gradient(rgba(255, 255, 255, 0.055) 0%, rgba(255, 255, 255, 0.01) 100%), rgba(18, 18, 20, 0.96)",
          border: "1px solid rgba(255, 255, 255, 0.09)",
          boxShadow:
            "inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 20px 40px -10px rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
              Choose your look
            </h2>
            <p className="text-[13px] text-white/50 mt-0.5">
              Pick an avatar that suits your style
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Scrollable Avatars Area */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-styles">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {displayedAvatars.map((avatar) => {
              const isSelected = selectedUrl === avatar.url;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleSelectAvatar(avatar)}
                  className={`group relative aspect-square w-full rounded-full overflow-hidden border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-white ring-2 ring-white/80 shadow-[0_0_16px_rgba(255,255,255,0.3)] scale-[1.03]"
                      : "border-white/[0.08] hover:border-white/40 hover:scale-[1.02]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0b0f14] shadow-md">
                        <CheckIcon size={14} strokeWidth={3} />
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {!showAll && orderedAvatars.length > 12 && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="h-9 rounded-full border border-white/[0.1] bg-white/[0.03] px-5 text-[12.5px] font-medium text-white/70 transition-colors hover:border-white/[0.2] hover:bg-white/[0.06] hover:text-white cursor-pointer"
              >
                Show more
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
