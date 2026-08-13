import type { MediaSummary } from "@/lib/tmdb";

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
    <div>
      <h2 className="heading-trail mb-6 text-xl font-semibold text-text-hi md:text-2xl">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) => (
          <MovieCard key={item.id} media={item} variant="grid" />
        ))}
      </div>
    </div>
  );
}