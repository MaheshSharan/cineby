import { useCallback, useMemo, useState } from "react";

import type { Episode } from "../types";

interface Season {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  overview: string;
}

interface UseEpisodesOptions {
  seasons: Season[];
  episodes: Episode[];
  initialSeason?: number;
  initialEpisode?: number;
}

export interface UseEpisodesResult {
  selectedSeason: number;
  selectedEpisode: Episode | null;
  episodeIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
  selectSeason: (seasonNumber: number) => void;
  selectEpisode: (episode: Episode) => void;
  goNext: () => void;
  goPrevious: () => void;
}

export function useEpisodes({
  seasons,
  episodes,
  initialSeason,
  initialEpisode,
}: UseEpisodesOptions): UseEpisodesResult {
  const defaultSeason = useMemo(
    () => seasons.find((season) => season.seasonNumber > 0) ?? seasons[0],
    [seasons]
  );

  const [selectedSeason, setSelectedSeason] = useState<number>(
    initialSeason ?? defaultSeason?.seasonNumber ?? 1
  );

  const episodeIndex = useMemo(() => {
    const index = episodes.findIndex(
      (episode) => episode.episodeNumber === initialEpisode
    );
    return index >= 0 ? index : 0;
  }, [episodes, initialEpisode]);

  const selectedEpisode = episodes[episodeIndex] ?? null;

  const hasNext = episodeIndex >= 0 && episodeIndex < episodes.length - 1;
  const hasPrevious = episodeIndex > 0;

  const selectSeason = useCallback((seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
  }, []);

  const selectEpisode = useCallback(
    (episode: Episode) => {
      setSelectedSeason(episode.seasonNumber);
    },
    []
  );

  const goNext = useCallback(() => {
    if (!hasNext) return;
    selectEpisode(episodes[episodeIndex + 1]);
  }, [episodes, episodeIndex, hasNext, selectEpisode]);

  const goPrevious = useCallback(() => {
    if (!hasPrevious) return;
    selectEpisode(episodes[episodeIndex - 1]);
  }, [episodes, episodeIndex, hasPrevious, selectEpisode]);

  return {
    selectedSeason,
    selectedEpisode,
    episodeIndex,
    hasNext,
    hasPrevious,
    selectSeason,
    selectEpisode,
    goNext,
    goPrevious,
  };
}
