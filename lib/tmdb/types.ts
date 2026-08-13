export type MediaType = "movie" | "tv";

export type TrendingTimeWindow = "day" | "week";

export type ImageSize =
  | "w92"
  | "w154"
  | "w185"
  | "w342"
  | "w500"
  | "w780"
  | "w1280"
  | "original";

export interface MediaSummary {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  mediaType: MediaType;
  originalLanguage: string;
  popularity: number;
}

export interface Paginated<T> {
  page: number;
  results: T[];
  totalPages: number;
  totalResults: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface GenreList {
  genres: Genre[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string | null;
  profilePath: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  profilePath: string | null;
}

export interface MediaVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface Company {
  id: number;
  name: string;
  logoPath: string | null;
}

export interface MovieDetails extends MediaSummary {
  originalTitle: string;
  tagline: string | null;
  status: string | null;
  runtime: number | null;
  budget: number | null;
  revenue: number | null;
  genres: Genre[];
  productionCompanies: Company[];
  cast: CastMember[];
  crew: CrewMember[];
  videos: MediaVideo[];
  recommendations: MediaSummary[];
  similar: MediaSummary[];
  certification: string | null;
  imdbId: string | null;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  posterPath: string | null;
  seasonNumber: number;
  episodeCount: number;
  airDate: string | null;
}

export interface CreatedBy {
  id: number;
  name: string;
  profilePath: string | null;
}

export interface TvDetails extends MediaSummary {
  originalName: string;
  tagline: string | null;
  status: string | null;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  episodeRunTime: number[];
  genres: Genre[];
  networks: Company[];
  seasons: Season[];
  createdBy: CreatedBy[];
  cast: CastMember[];
  crew: CrewMember[];
  videos: MediaVideo[];
  recommendations: MediaSummary[];
  similar: MediaSummary[];
  certification: string | null;
  imdbId: string | null;
}

export interface Backdrop {
  filePath: string;
  width: number;
  height: number;
  iso6391: string | null;
}

export interface Poster {
  filePath: string;
  width: number;
  height: number;
}

export interface ImageSet {
  backdrops: Backdrop[];
  posters: Poster[];
}

export interface EpisodeExternalIds {
  imdbId: string | null;
  tvdbId: number | null;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episodeNumber: number;
  seasonNumber: number;
  airDate: string | null;
  runtime: number | null;
  stillPath: string | null;
  voteAverage: number;
}

export interface SeasonEpisodes {
  id: number;
  name: string;
  overview: string;
  seasonNumber: number;
  episodes: Episode[];
}
