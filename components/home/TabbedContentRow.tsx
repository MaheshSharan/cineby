import { useState, type ReactNode } from "react";

import type { MediaSummary } from "@/lib/tmdb";

import { ContentRow } from "@/components/content/ContentRow";
import { MovieCard } from "@/components/movie/MovieCard";
import { Tabs, type TabOption } from "@/components/ui/Tabs";

interface TabbedContentRowProps {
  title: string;
  movies: MediaSummary[];
  series: MediaSummary[];
}

export function TabbedContentRow({ title, movies, series }: TabbedContentRowProps) {
  const options: TabOption[] = [
    { key: "movies", label: "Movies" },
    { key: "series", label: "Series" },
  ];

  return (
    <TabbedRow
      title={title}
      options={options}
      initialKey="movies"
      renderItems={(activeKey) => {
        const items = activeKey === "series" ? series : movies;

        return items.map((item) => (
          <MovieCard key={item.id} media={item} variant="backdrop" />
        ));
      }}
    />
  );
}

interface TabbedRowProps {
  title: string;
  options: TabOption[];
  initialKey: string;
  renderItems: (activeKey: string) => ReactNode;
}

function TabbedRow({ title, options, initialKey, renderItems }: TabbedRowProps) {
  const [activeKey, setActiveKey] = useState(initialKey);

  return (
    <ContentRow
      title={title}
      action={<Tabs options={options} activeKey={activeKey} onChange={setActiveKey} />}
    >
      {renderItems(activeKey)}
    </ContentRow>
  );
}