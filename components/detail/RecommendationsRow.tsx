import type { MediaSummary } from "@/lib/tmdb";

import { ContentRow } from "@/components/content/ContentRow";
import { MovieCard } from "@/components/movie/MovieCard";

interface RecommendationsRowProps {
  title: string;
  items: MediaSummary[];
}

export function RecommendationsRow({ title, items }: RecommendationsRowProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ContentRow title={title}>
      {items.map((item) => (
        <MovieCard key={item.id} media={item} />
      ))}
    </ContentRow>
  );
}