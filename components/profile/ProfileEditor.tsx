import { ArrowLeftIcon, LockIcon, PencilIcon, TrashIcon } from "@/components/ui/icons";
import type { Profile } from "@/components/profile/types";

interface ProfileEditorProps {
  profile: Profile;
  name: string;
  avatarUrl: string;
  pinEnabled: boolean;
  pin: string;
  isSaving: boolean;
  onNameChange: (val: string) => void;
  onPinEnabledChange: (val: boolean) => void;
  onPinChange: (val: string) => void;
  onOpenAvatarModal: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export function ProfileEditor({
  profile,
  name,
  avatarUrl,
  pinEnabled,
  pin,
  isSaving,
  onNameChange,
  onPinEnabledChange,
  onPinChange,
  onOpenAvatarModal,
  onCancel,
  onSave,
  onDelete,
}: ProfileEditorProps) {
  return (
    <div className="flex w-full justify-center animate-in fade-in duration-300">
      <div className="flex w-full max-w-xl flex-col items-center text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Edit profile
        </h1>

        <div className="mt-8 w-full">
          <div className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-left md:p-6">
            {/* Look & Name Section */}
            <div className="flex items-center gap-5">
              <button
                type="button"
                aria-label="Choose your look"
                onClick={onOpenAvatarModal}
                className="relative shrink-0 cursor-pointer group"
              >
                <span className="relative block h-20 w-20 overflow-hidden rounded-full border border-white/[0.1] transition-all group-hover:border-white/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0b0f14] bg-white text-[#0b0f14] shadow-md transition-transform group-hover:scale-110">
                  <PencilIcon size={12} strokeWidth={2.5} />
                </span>
              </button>

              <div className="min-w-0 flex-1">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Profile name
                </label>
                <input
                  type="text"
                  maxLength={20}
                  placeholder="Profile name"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-[14px] font-medium text-white outline-none transition-colors placeholder:text-white/40 focus:border-white/[0.3] focus:bg-white/[0.05]"
                />
              </div>
            </div>

            <div className="my-5 h-px bg-white/[0.06]" />

            {/* PIN Section */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
                  <LockIcon size={13} className="text-white/50" />
                  Profile PIN
                </span>
                <p className="mt-1.5 max-w-[300px] text-[12px] leading-relaxed text-white/50">
                  Require a 4-digit PIN to open this profile. Others on this account can&apos;t use it without the code.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={pinEnabled}
                aria-label="Profile PIN"
                onClick={() => onPinEnabledChange(!pinEnabled)}
                className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200 cursor-pointer ${
                  pinEnabled ? "bg-primary" : "bg-white/[0.14]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left] duration-200 ${
                    pinEnabled ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {pinEnabled && (
              <div className="mt-4 pt-3 border-t border-white/[0.04]">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder={profile.hasPin ? "Enter new 4-digit PIN" : "Enter 4-digit PIN"}
                  value={pin}
                  onChange={(e) => onPinChange(e.target.value.replace(/\D/g, ""))}
                  className="h-10 w-48 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-center text-sm font-semibold tracking-widest text-white outline-none focus:border-white/30"
                />
              </div>
            )}

            <div className="my-5 h-px bg-white/[0.06]" />

            {/* Delete Section */}
            <div>
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
                <TrashIcon size={13} className="text-white/50" />
                Delete
              </span>
              <p className="mt-1.5 max-w-[420px] text-[12px] leading-relaxed text-white/50">
                This cannot be undone. History, continue watching, and the watchlist for this profile will be permanently deleted.
              </p>
              <button
                type="button"
                onClick={onDelete}
                className="mt-3 text-left text-[12.5px] font-medium text-primary transition-colors hover:text-primary/80 cursor-pointer"
              >
                I understand and want to delete this profile
              </button>
            </div>
          </div>

          {/* Actions Row */}
          <div className="mt-6 flex w-full items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
            >
              <ArrowLeftIcon size={15} />
              Back
            </button>
            <button
              type="button"
              disabled={!name.trim() || isSaving}
              onClick={onSave}
              className="flex h-11 items-center justify-center rounded-full bg-white px-8 text-[13px] font-semibold text-[#0b0f14] transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
