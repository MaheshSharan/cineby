import { useEffect, useMemo, useRef, useState } from "react";

import { CheckIcon, XIcon } from "@/components/ui/icons";
import { CLASSIC_AVATARS, type AvatarItem } from "@/lib/profile/avatars";

interface AvatarModalProps {
  open: boolean;
  currentAvatarUrl?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function AvatarModal({
  open,
  currentAvatarUrl,
  onSelect,
  onClose,
}: AvatarModalProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(currentAvatarUrl ?? null);
  const [showAll, setShowAll] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setSelectedUrl(currentAvatarUrl ?? null);
    }
  }, [open, currentAvatarUrl]);

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

  // Put the profile's current avatar first so it's visible with the tick,
  // but key the order off the incoming prop — not the clicked selection —
  // so the grid stays stable while the user browses other options.
  const orderedAvatars = useMemo(() => {
    if (!currentAvatarUrl) return CLASSIC_AVATARS;

    const activeIdx = CLASSIC_AVATARS.findIndex((avatar) => avatar.url === currentAvatarUrl);
    if (activeIdx <= 0) return CLASSIC_AVATARS;

    const list = [...CLASSIC_AVATARS];
    const [activeItem] = list.splice(activeIdx, 1);
    list.unshift(activeItem);
    return list;
  }, [currentAvatarUrl]);

  if (!open) return null;

  const handleSelectAvatar = (avatar: AvatarItem) => {
    setSelectedUrl(avatar.url);
    onSelect(avatar.url);
    onClose();
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
