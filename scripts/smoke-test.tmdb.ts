import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getMovieDetails,
  getTvDetails,
  getGenres,
  searchMulti,
  discoverMovies,
  discoverTv,
} from "../lib/tmdb/server";

const MOVIE_ID = 969681; // Spider-Man: Brand New Day
const TV_ID = 108978; // Reacher

function check(label: string, ok: boolean, detail?: string) {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
}

async function run() {
  const trending = await getTrending("all", "day");
  check("trending/all/day", trending.results.length > 0, `n=${trending.results.length}, first=${trending.results[0].title}`);

  const trendingMovies = await getTrending("movie", "week");
  check("trending/movie/week", trendingMovies.results.length > 0, `n=${trendingMovies.results.length}`);

  const popularMovies = await getPopularMovies();
  check("movie/popular", popularMovies.results.length > 0 && popularMovies.results[0].mediaType === "movie", `n=${popularMovies.results.length}`);

  const topRated = await getTopRatedMovies();
  check("movie/top_rated", topRated.results.length > 0, `n=${topRated.results.length}`);

  const genres = await getGenres("movie");
  check("genre/movie/list", genres.genres.length > 0, `n=${genres.genres.length}, first=${genres.genres[0].name}`);

  const search = await searchMulti("spider man");
  check("search/multi", search.results.length > 0, `n=${search.results.length}, first=${search.results[0].title}`);

  const movie = await getMovieDetails(MOVIE_ID);
  check("movie details", movie.id === MOVIE_ID, `title=${movie.title}, cert=${movie.certification}, cast=${movie.cast.length}, videos=${movie.videos.length}, recs=${movie.recommendations.length}, imdb=${movie.imdbId}`);

  const tv = await getTvDetails(TV_ID);
  check("tv details", tv.id === TV_ID, `name=${tv.title}, seasons=${tv.numberOfSeasons}, cert=${tv.certification}, cast=${tv.cast.length}, videos=${tv.videos.length}`);

  const discover = await discoverMovies({ genreId: 28, sortBy: "popularity.desc" });
  check("discover/movie by genre", discover.results.length > 0, `n=${discover.results.length}, first=${discover.results[0].title}`);

  const discoverTvList = await discoverTv({ genreId: 10765 });
  check("discover/tv by genre", discoverTvList.results.length > 0, `n=${discoverTvList.results.length}`);

  console.log("\nDone.");
}

run().catch((error) => {
  console.error("FATAL", error);
  process.exit(1);
});