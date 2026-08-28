import type { MediaSummary } from "@/lib/tmdb";
import { ContentRow } from "@/components/content/ContentRow";
import { MovieCard } from "@/components/movie/MovieCard";
import { TopOneCard } from "@/components/movie/TopOneCard";

interface TopTenRowProps {
  items: MediaSummary[];
}

export function TopTenRow({ items }: TopTenRowProps) {
  if (items.length === 0) return null;

  const [topOne, ...rest] = items;

  return (
    <ContentRow
      title={
        <div className="flex flex-col">
          <span className="text-xl md:text-2xl font-semibold text-text-hi">
            TOP 10 on Cineby
          </span>
          <span className="text-[13px] md:text-sm font-normal text-text-mid mt-0.5">
            The most watched titles right now
          </span>
        </div>
      }
    >
      {topOne ? <TopOneCard media={topOne} /> : null}
      {rest.map((item, index) => (
        <MovieCard
          key={item.id}
          media={item}
          variant="poster"
          rank={index + 2}
        />
      ))}
    </ContentRow>
  );
}