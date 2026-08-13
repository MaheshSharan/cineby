import type { MediaSummary } from "@/lib/tmdb";
import { ContentRow } from "@/components/content/ContentRow";
import { MovieCard } from "@/components/movie/MovieCard";

interface TopTenRowProps {
  items: MediaSummary[];
}

export function TopTenRow({ items }: TopTenRowProps) {
  return (
    <ContentRow title="TOP 10 Today">
      {items.map((item, index) => (
        <MovieCard
          key={item.id}
          media={item}
          variant="poster"
          rank={index + 1}
        />
      ))}
    </ContentRow>
  );
}