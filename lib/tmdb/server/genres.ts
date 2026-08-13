import type { GenreList, MediaType } from "../types";
import { tmdbGet } from "./client";
import { getTmdbConfig } from "./config";
import { toGenreList } from "./transform";
import { validateGenreList } from "./validate";

export async function getGenres(mediaType: MediaType): Promise<GenreList> {
  const { defaultLanguage } = getTmdbConfig();

  const raw = await tmdbGet<unknown>({
    path: `/genre/${mediaType}/list`,
    params: { language: defaultLanguage },
  });

  return toGenreList(validateGenreList(raw));
}