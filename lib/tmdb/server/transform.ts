import type {
  Backdrop,
  CastMember,
  Company,
  CrewMember,
  Episode,
  EpisodeExternalIds,
  Genre,
  GenreList,
  ImageSet,
  MediaSummary,
  MediaVideo,
  MovieDetails,
  MediaType,
  Paginated,
  Poster,
  Season,
  SeasonEpisodes,
  TvDetails,
} from "../types";

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function asNumberArray(value: unknown): number[] {
  return Array.isArray(value) ? value.filter((item): item is number => typeof item === "number") : [];
}

function recordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    : [];
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : undefined;
}

export function toMediaSummary(item: Record<string, unknown>, mediaType: MediaType): MediaSummary {
  return {
    id: asNumber(item.id),
    title: (nullableString(item.title) ?? nullableString(item.name)) ?? "",
    overview: nullableString(item.overview) ?? "",
    posterPath: nullableString(item.poster_path),
    backdropPath: nullableString(item.backdrop_path),
    releaseDate: nullableString(item.release_date ?? item.first_air_date),
    voteAverage: asNumber(item.vote_average),
    voteCount: asNumber(item.vote_count),
    genreIds: asNumberArray(item.genre_ids),
    mediaType,
    originalLanguage: nullableString(item.original_language) ?? "",
    popularity: asNumber(item.popularity),
  };
}

export function toPaginated<T>(
  results: Record<string, unknown>[],
  page: number,
  totalPages: number,
  totalResults: number,
  mapItem: (item: Record<string, unknown>) => T
): Paginated<T> {
  return {
    page,
    results: results.map(mapItem),
    totalPages,
    totalResults,
  };
}

export function toGenreList(genres: Record<string, unknown>[]): GenreList {
  return {
    genres: genres.map((genre): Genre => ({
      id: asNumber(genre.id),
      name: nullableString(genre.name) ?? "",
    })),
  };
}

function toGenreListValue(genres: unknown): Genre[] {
  return recordArray(genres).map((genre): Genre => ({
    id: asNumber(genre.id),
    name: nullableString(genre.name) ?? "",
  }));
}

function toCast(credits: unknown): CastMember[] {
  return recordArray(asRecord(credits)?.cast).map((member): CastMember => ({
    id: asNumber(member.id),
    name: nullableString(member.name) ?? "",
    character: nullableString(member.character),
    profilePath: nullableString(member.profile_path),
    order: asNumber(member.order),
  }));
}

function toCrew(credits: unknown): CrewMember[] {
  return recordArray(asRecord(credits)?.crew).map((member): CrewMember => ({
    id: asNumber(member.id),
    name: nullableString(member.name) ?? "",
    job: nullableString(member.job) ?? "",
    profilePath: nullableString(member.profile_path),
  }));
}

function toVideos(value: unknown): MediaVideo[] {
  return recordArray(asRecord(value)?.results).map((video): MediaVideo => ({
    id: nullableString(video.id) ?? "",
    key: nullableString(video.key) ?? "",
    name: nullableString(video.name) ?? "",
    site: nullableString(video.site) ?? "",
    type: nullableString(video.type) ?? "",
  }));
}

function toCompanies(value: unknown): Company[] {
  return recordArray(value).map((company): Company => ({
    id: asNumber(company.id),
    name: nullableString(company.name) ?? "",
    logoPath: nullableString(company.logo_path),
  }));
}

function toRecommendations(value: unknown, mediaType: MediaType): MediaSummary[] {
  return recordArray(asRecord(value)?.results).map((item) => toMediaSummary(item, mediaType));
}

function toCertification(value: unknown): string | null {
  const releaseDates = recordArray(asRecord(value)?.results).flatMap((country) =>
    recordArray(country.release_dates)
  );

  const certified = releaseDates.find((entry) => typeof entry.certification === "string" && entry.certification !== "");

  return nullableString(certified?.certification);
}

function toTvCertification(value: unknown): string | null {
  const ratings = recordArray(asRecord(value)?.results);

  const rated = ratings.find((entry) => typeof entry.rating === "string" && entry.rating !== "");

  return nullableString(rated?.rating);
}

function toLogoPath(images: unknown): string | null {
  const logos = recordArray(asRecord(images)?.logos);

  return nullableString(logos[0]?.file_path);
}

export function toMovieDetails(raw: Record<string, unknown>): MovieDetails {
  const mediaType: MediaType = "movie";

  return {
    ...toMediaSummary(raw, mediaType),
    originalTitle: nullableString(raw.original_title) ?? "",
    tagline: nullableString(raw.tagline),
    status: nullableString(raw.status),
    runtime: finiteNumber(raw.runtime),
    budget: finiteNumber(raw.budget),
    revenue: finiteNumber(raw.revenue),
    logoPath: toLogoPath(raw.images),
    genres: toGenreListValue(raw.genres),
    productionCompanies: toCompanies(raw.production_companies),
    cast: toCast(raw.credits),
    crew: toCrew(raw.credits),
    videos: toVideos(raw.videos),
    recommendations: toRecommendations(raw.recommendations, mediaType),
    similar: toRecommendations(raw.similar, mediaType),
    certification: toCertification(raw.release_dates),
    imdbId: nullableString(asRecord(raw.external_ids)?.imdb_id),
  };
}

function toSeasons(value: unknown): Season[] {
  return recordArray(value).map((season): Season => ({
    id: asNumber(season.id),
    name: nullableString(season.name) ?? "",
    overview: nullableString(season.overview) ?? "",
    posterPath: nullableString(season.poster_path),
    seasonNumber: asNumber(season.season_number),
    episodeCount: asNumber(season.episode_count),
    airDate: nullableString(season.air_date),
  }));
}

export function toTvDetails(raw: Record<string, unknown>): TvDetails {
  const mediaType: MediaType = "tv";

  return {
    ...toMediaSummary(raw, mediaType),
    originalName: nullableString(raw.original_name) ?? "",
    tagline: nullableString(raw.tagline),
    status: nullableString(raw.status),
    numberOfSeasons: asNumber(raw.number_of_seasons),
    numberOfEpisodes: asNumber(raw.number_of_episodes),
    episodeRunTime: asNumberArray(raw.episode_run_time),
    logoPath: toLogoPath(raw.images),
    genres: toGenreListValue(raw.genres),
    networks: toCompanies(raw.networks),
    seasons: toSeasons(raw.seasons),
    createdBy: recordArray(raw.created_by).map((person) => ({
      id: asNumber(person.id),
      name: nullableString(person.name) ?? "",
      profilePath: nullableString(person.profile_path),
    })),
    cast: toCast(raw.credits),
    crew: toCrew(raw.credits),
    videos: toVideos(raw.videos),
    recommendations: toRecommendations(raw.recommendations, mediaType),
    similar: toRecommendations(raw.similar, mediaType),
    certification: toTvCertification(raw.content_ratings),
    imdbId: nullableString(asRecord(raw.external_ids)?.imdb_id),
  };
}

function toBackdrops(value: unknown): Backdrop[] {
  return recordArray(value).map((backdrop): Backdrop => ({
    filePath: nullableString(backdrop.file_path) ?? "",
    width: asNumber(backdrop.width),
    height: asNumber(backdrop.height),
    iso6391: nullableString(backdrop.iso_639_1),
  }));
}

function toPosters(value: unknown): Poster[] {
  return recordArray(value).map((poster): Poster => ({
    filePath: nullableString(poster.file_path) ?? "",
    width: asNumber(poster.width),
    height: asNumber(poster.height),
  }));
}

export function toImageSet(raw: Record<string, unknown>): ImageSet {
  return {
    backdrops: toBackdrops(raw.backdrops),
    posters: toPosters(raw.posters),
  };
}

export function toEpisodeExternalIds(raw: Record<string, unknown>): EpisodeExternalIds {
  return {
    imdbId: nullableString(raw.imdb_id),
    tvdbId: finiteNumber(raw.tvdb_id),
  };
}

function toEpisode(item: Record<string, unknown>): Episode {
  return {
    id: asNumber(item.id),
    name: nullableString(item.name) ?? "",
    overview: nullableString(item.overview) ?? "",
    episodeNumber: asNumber(item.episode_number),
    seasonNumber: asNumber(item.season_number),
    airDate: nullableString(item.air_date),
    runtime: finiteNumber(item.runtime),
    stillPath: nullableString(item.still_path),
    voteAverage: asNumber(item.vote_average),
  };
}

export function toSeasonEpisodes(raw: Record<string, unknown>): SeasonEpisodes {
  return {
    id: asNumber(raw.id),
    name: nullableString(raw.name) ?? "",
    overview: nullableString(raw.overview) ?? "",
    seasonNumber: asNumber(raw.season_number),
    episodes: recordArray(raw.episodes).map(toEpisode),
  };
}