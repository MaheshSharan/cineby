import { LockIcon, PencilIcon, PlusIcon } from "@/components/ui/icons";
import type { Profile } from "@/components/profile/types";

interface ProfileGridProps {
  profiles: Profile[];
  isManaging: boolean;
  onToggleManage: () => void;
  onSelectProfile: (profile: Profile) => void;
  onAddProfile: () => void;
}

export function ProfileGrid({
  profiles,
  isManaging,
  onToggleManage,
  onSelectProfile,
  onAddProfile,
}: ProfileGridProps) {
  return (
    <div className="flex w-full justify-center animate-in fade-in duration-300">
      <div className="flex w-full max-w-3xl flex-col items-center text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-[42px] md:leading-tight">
          Who&apos;s watching?
        </h1>

        <div className="relative mt-10 flex flex-wrap items-start justify-center gap-6 md:mt-12 md:gap-8">
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectProfile(p)}
              className="group flex w-24 flex-col items-center md:w-32 cursor-pointer"
            >
              <span className="relative block aspect-square w-full overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04] transition-all duration-200 group-hover:border-white/40 group-hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.avatarUrl}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
                {/* Pencil Edit Badge overlay in Manage Mode */}
                {isManaging ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px] rounded-full border border-white/20 transition-transform group-hover:scale-105">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white border border-white/30 shadow-lg">
                      <PencilIcon size={16} strokeWidth={2.2} />
                    </span>
                  </span>
                ) : (
                  p.hasPin && (
                    <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 border border-white/20 text-white/90 shadow">
                      <LockIcon size={11} />
                    </span>
                  )
                )}
              </span>
              <span className="mt-3 flex w-full items-center justify-center gap-1.5 text-[13px] text-white/70 transition-colors group-hover:text-white md:text-sm font-medium">
                <span className="truncate">{p.name}</span>
              </span>
            </button>
          ))}

          {/* Add Profile Button (Max 5) */}
          {profiles.length < 5 && (
            <button
              type="button"
              onClick={onAddProfile}
              className="group flex w-24 flex-col items-center md:w-32 cursor-pointer"
            >
              <span className="flex aspect-square w-full items-center justify-center rounded-full border border-dashed border-white/[0.14] bg-white/[0.02] transition-colors duration-200 group-hover:border-white/30 group-hover:bg-white/[0.05]">
                <PlusIcon size={32} className="text-white/30 transition-colors group-hover:text-white/70" />
              </span>
              <span className="mt-3 w-full truncate text-[13px] text-white/70 transition-colors group-hover:text-white md:text-sm font-medium">
                Add profile
              </span>
            </button>
          )}
        </div>

        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onToggleManage}
            className="h-10 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
          >
            {isManaging ? "Done" : "Manage profiles"}
          </button>
        </div>
      </div>
    </div>
  );
}
