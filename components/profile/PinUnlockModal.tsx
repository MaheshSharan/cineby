import { XIcon } from "@/components/ui/icons";
import type { Profile } from "@/components/profile/types";

interface PinUnlockModalProps {
  profile: Profile | null;
  enteredPin: string;
  pinError: string | null;
  isSubmitting: boolean;
  onPinChange: (val: string) => void;
  onClose: () => void;
  onSubmit: (pin: string) => void;
}

export function PinUnlockModal({
  profile,
  enteredPin,
  pinError,
  isSubmitting,
  onPinChange,
  onClose,
  onSubmit,
}: PinUnlockModalProps) {
  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Enter profile PIN"
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/[0.09] bg-[#121214]/95 p-6 text-center shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
          >
            <XIcon size={16} />
          </button>
        </div>

        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
        </span>

        <h2 className="mt-4 text-xl font-bold tracking-tight text-white">
          Enter PIN for {profile.name}
        </h2>
        <p className="mt-1 text-[12.5px] text-white/50">
          This profile is protected with a 4-digit PIN
        </p>

        {pinError && (
          <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 py-2 px-3 text-[12px] font-medium text-red-400">
            {pinError}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <div className="relative inline-flex cursor-text">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              autoFocus
              value={enteredPin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                onPinChange(val);
                if (val.length === 4) {
                  onSubmit(val);
                }
              }}
              className="absolute inset-0 z-10 cursor-text opacity-0"
            />
            <div className="flex gap-2.5">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = enteredPin.length > idx;
                const isActive = enteredPin.length === idx;
                return (
                  <div
                    key={idx}
                    className={`flex h-12 w-10 items-center justify-center rounded-xl border text-xl font-semibold tabular-nums transition-all ${
                      isActive
                        ? "border-white bg-white/[0.07] text-white shadow-[0_0_0_2px_rgba(255,255,255,0.1)]"
                        : isFilled
                        ? "border-white/30 bg-white/[0.05] text-white"
                        : "border-white/[0.1] bg-white/[0.03] text-white"
                    }`}
                  >
                    {isFilled ? "•" : isActive ? <span className="h-5 w-1 rounded-full bg-white animate-pulse" /> : ""}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-7 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-full border border-white/[0.08] bg-white/[0.02] text-[13px] font-medium text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={enteredPin.length < 4 || isSubmitting}
            onClick={() => onSubmit(enteredPin)}
            className="flex-1 h-10 rounded-full bg-white text-[13px] font-semibold text-[#0b0f14] hover:bg-white/90 disabled:opacity-40 transition-all cursor-pointer"
          >
            {isSubmitting ? "Checking..." : "Unlock"}
          </button>
        </div>
      </div>
    </div>
  );
}
