import type { CastMember } from "@/lib/tmdb";
import { getProfileUrl } from "@/lib/tmdb/image";

interface CastRowProps {
  cast: CastMember[];
}

export function CastRow({ cast }: CastRowProps) {
  if (cast.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="heading-trail min-w-0 truncate text-xl font-semibold text-text-hi md:text-2xl">
          Actors
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cast.map((member) => (
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
    </div>
  );
}