import { useState } from "react";

import type { CastMember } from "@/lib/tmdb";
import { getProfileUrl } from "@/lib/tmdb/image";
import { ChevronDownIcon } from "@/components/ui/icons";

const COLLAPSED_COUNT = 12;

interface CastRowProps {
  cast: CastMember[];
}

export function CastRow({ cast }: CastRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (cast.length === 0) {
    return null;
  }

  const hasMore = cast.length > COLLAPSED_COUNT;
  const visibleCast = hasMore && !isExpanded ? cast.slice(0, COLLAPSED_COUNT) : cast;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="heading-trail min-w-0 truncate text-xl font-semibold text-text-hi md:text-2xl">
          Actors
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCast.map((member) => (
          <div
            key={member.id}
            className="group flex items-center gap-3 rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 hover:border-primary/40 hover:bg-white/[0.05]"
          >
            <div className="relative flex-shrink-0">
              {member.profilePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getProfileUrl(member.profilePath) ?? undefined}
                  alt={member.name}
                  title={member.name}
                  loading="lazy"
                  decoding="async"
                  className="h-14 w-14 rounded-full object-cover ring-1 ring-white/[0.08] transition-all duration-200 group-hover:ring-primary/40"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-text-hi ring-1 ring-white/[0.08]">
                  {member.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col">
              <p className="line-clamp-1 text-sm font-medium leading-tight text-text-hi transition-colors duration-200 group-hover:text-primary">
                {member.name}
              </p>
              {member.character ? (
                <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-text-mid">
                  {member.character}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {hasMore ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse cast list" : "Expand cast list"}
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-text-mid shadow-lg backdrop-blur-xl transition-all duration-200 hover:border-primary/40 hover:bg-white/[0.07] hover:text-text-hi hover:scale-105 active:scale-95"
          >
            <ChevronDownIcon
              size={18}
              className={`transition-transform duration-300 ease-out ${
                isExpanded ? "rotate-180 text-primary" : "group-hover:text-white"
              }`}
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}