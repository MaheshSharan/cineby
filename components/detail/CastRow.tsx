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
    <section className="py-6">
      <h2 className="mb-4 px-4 text-[24px] font-semibold uppercase leading-none tracking-[0.05em] sm:px-6">
        Actors
      </h2>

      <div className="no-scrollbar flex gap-5 overflow-x-auto px-4 pb-2 sm:px-6">
        {cast.map((member) => (
          <div key={member.id} className="w-28 shrink-0 text-center">
            <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-secondary">
              {member.profilePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getProfileUrl(member.profilePath) ?? undefined}
                  alt={member.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground">
                  {member.name.charAt(0)}
                </div>
              )}
            </div>
            <p className="mt-2 truncate text-[13px] font-medium">{member.name}</p>
            {member.character ? (
              <p className="truncate text-[11px] text-muted-foreground">{member.character}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}