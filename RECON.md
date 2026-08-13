# Cineby — Full Technical Recon

Recon of the live Cineby site (https://www.cineby.at/) conducted before rebuilding the project from scratch.
Goal: replicate the platform 1:1 — UI, functionality, architecture.

> Status: site shutting down Aug 26, 2026 (hosting cost). Developer plans to open-source the raw media
> scrappers (m3u8/mp4 stream resolution). Everything else must be rebuilt.

---

## 1. High-Level Architecture

Cineby is a **thin Next.js frontend** sitting on top of two data layers:

1. **TMDB (metadata)** — reversed-proxied through their own API host. Not proprietary; purely TMDB.
2. **Closed scraper backend** — resolves actual playable streams. This is the proprietary part the
   developer says he will open-source later.

```
Browser (Next.js SPA/SSR)
  ├── db.speedracelight.com/3/*   → TMDB metadata proxy (movies, tv, search, discover, trending)
  ├── api.speedracelight.com      → streaming seed + source resolution (CLOSED)
  ├── backend.cineby.at/v1        → auth, users, watchlist, history, watch parties (CLOSED)
  ├── wsrv.nl (weserv) + TMDB     → image optimization CDN
  ├── vidking.net                 → embeddable player (playback)
  ├── videasy.to                  → subtitles API + "Rybbit" analytics
  └── cors proxies                → bypass CORS for scraper hosts
```

---

## 2. Frontend

- **Framework:** Next.js **Pages Router** (NOT App Router).
  - `pages/index`, `pages/movie/[...params]`, `pages/tv/[...params]`, custom `pages/_app`.
- **UI lib:** React. Dark theme. Mobile-first responsive.
- **PWA:** `manifest.json`, app icons.
- **Font:** Inter (Google Fonts).
- **Language / i18n:** `en` (default), plus `de`, `es`, `fr`, `pt`.

### Frontend routes
| Route | Purpose |
|-------|---------|
| `/` | Home — hero carousel, trending rows, top 10, top rated, genres |
| `/movie/[id]` | Movie details (banner, metadata, cast, similar, recommendations) |
| `/tv/[id]` | TV details (seasons/episodes) |
| `/watch` | Player page |
| `/watch/tv` | TV player |
| `/watch/movie` | Movie player |
| `/browse/movie`, `/browse/tv`, `/browse/anime` | Browse grids with filters |
| `/search` | Search |
| `/watchlist` | User watchlist (auth required) |
| `/history` | Watch history (auth required) |
| `/account` | Account/settings (auth required) |
| `/watchparty` | Watch party (WebSocket) |
| `/category` | Category listing |
| `/recovery` | Password/account recovery |
| `/4k`, `/livestream`, `/sports` | Extra content sections |
| `/dmca`, `/contact-us`, `/provider` | Static/legal pages |

Protected routes (auth): `/account`, `/history`, `/watchlist`.

---

## 3. Metadata Layer (TMDB via proxy)

- **Single source of truth = TMDB.**
- The site proxies TMDB through **`db.speedracelight.com/3/*`** — a pure reverse proxy.
  - Open CORS (`access-control-allow-origin: *`), no auth key exposed to client.
  - Behind Cloudflare + CloudFront.
- TMDB IDs drive the entire URL structure (`/movie/969681`, `/tv/108978`).

### Verified working endpoints (`db.speedracelight.com/3/...`)
- `search/multi?query=...`
- `search/movie?query=...`
- `discover/movie?sort_by=popularity.desc`
- `trending/all/day`, `trending/movie/day`
- `movie/popular`, `tv/popular`
- `genre/movie/list`
- `configuration` (image base URLs + sizes)
- `movie/{id}?append_to_response=credits,external_ids,videos,recommendations,translations,similar,release_dates&language=en&include_video_language=en,null`
- `movie/{id}/images?include_image_language=en,en,null`
- `tv/{id}/images?include_image_language=en,en,null`

### Home page data sections (from TMDB)
- Hero / "trending" carousel (backdrop images)
- "TOP 10 Today"
- "Trending Today" (Movies / Series tabs)
- "Only on <provider>" (series)
- "Top rated" (Movies / Series tabs)
- Genre browse (Movies / Series tabs)

### Image handling
- **weserv.nl** (`wsrv.nl`) CDN optimizer proxying TMDB posters/backdrops, e.g.
  `https://wsrv.nl/?url=<encoded TMDB url>&output=webp&q=50&n=-1`.
  Quality varies by size: hero `q=80`, row `q=65`, small `q=50`.
- TMDB image sizes: `w342`, `w500`, `w780`, `original` (posters/backdrops).
- Secondary/fallback image hosts: `img.zorores.com`, flixhq thumbnails `cdn.noitatnemucod.net/thumbnail/300x400/100/`.
- Trailers: YouTube `oembed` for metadata.

---

## 4. Own Backend (closed — must be rebuilt)

- **Base URL:** `https://backend.cineby.at/v1` (dev override → `http://localhost:8080/v1`).
- **WebSocket:** `https://backend.cineby.at/v1/ws` (used by Watch Party).
- **Auth model:** JWT stored in `localStorage` under key `JWT_TOKEN` (also validated server-side).
  - Note: this contradicts AGENTS.md guidance about HTTP-only cookies only — but this is what the live
    site does; we decide internally whether to keep parity or improve security.

### Known auth endpoints
- `POST /auth/validate-jwt` — body `{ token }`, returns `{ valid }`
- `POST /auth/validate-recovery` — body `{ token }`, returns `{ valid }`

### Backend feature areas (from nav/protected routes)
- Accounts (create/update, password change, avatar upload, "Created at" timestamp)
- Watchlist (add/remove/list)
- Watch history (record/list)
- Watch parties (WebSocket realtime)
- Recovery flow

---

## 5. Streaming Pipeline (CLOSED — the part being open-sourced)

This is the proprietary media-resolution flow. Rebuilt from live traffic capture.

### Flow
1. **Seed request:**
   ```
   GET https://api.speedracelight.com/seed?mediaId={tmdbId}
   → { "seed": "59552973.OaldOojG-w6e5Q9FSuvLb1", "ttlMs": 30000 }
   ```
   Short-lived signed token, 30s TTL.

2. **Source resolution:**
   ```
   GET https://api.speedracelight.com/cdn/sources-with-title
       ?title={title}&mediaType=movie&year={year}
       &episodeId={ep}&seasonId={season}&tmdbId={tmdbId}&imdbId={imdbId}
       &enc=2&seed={seed}
   → encrypted/obfuscated text payload (decrypt → stream manifest)
   ```

3. **Playback:** decrypted HLS `.m3u8` manifest + segments served from obfuscated CDN hosts.
   Observed CDN hosts: `moon.ironwallnet.net`, `steelatom.top`.
   Paths are obfuscated base64 token strings (`/vd/<token>/index-s1080p-v1-a1.m3u8`, `seg-*.m4s`).

### Scraper / provider sources (identified)
- **FlixHQ** — `api.speedracelight.com/movies/flixhq`
- **SmashyStream** — via `cors-smashystream.cineby.workers.dev` proxy
- **Player embed:** **Vidking** (`https://www.vidking.net/`) — customizable embeddable HTML5 player.

### CORS bypass proxies (used by frontend to reach scraper hosts)
- `corsproxy.io/?<url>`
- `simple-proxy.cineby.at/?destination=<url>`
- `simple-proxy-two.vercel.app/?destination=<url>`
- `cors-smashystream.cineby.workers.dev/?destination=<url>`
- `justchill.weathershare.site/?url=<url>&referer=...`

### Subtitles
- `subs.videasy.to/search?id=<...>` — subtitle search API
- **OpenSubtitles.org** — via `proxy-opensubtitles.cineby.workers.dev/?destination=`
- Language map used in player: czech, german, english, spanish, unknown, french, hindi, hungarian,
  indonesian, italian, japanese, polish, portuguese, tamil, telugu, thai, turkish, ukrainian.

---

## 6. Analytics / Ads

- **Analytics ("Rybbit"):** `https://users.videasy.to/api/script.js` loaded with `data-site-id="6"`.
  - Tracks pageviews, SPAs, outbound links, errors, Web Vitals, session replay (rrweb).
  - Endpoints: `POST /api/track`, `POST /session-replay/record/{siteId}`.
- **Ads:** two tag scripts injected when ads enabled (toggle key `ads-enabled-session` in sessionStorage):
  - `/scripts/os.js`
  - `//ks.blirtonethe.com/sI8wyOCm9UIp/138028`
  - Both were `ERR_BLOCKED_BY_CLIENT` (adblocker) — confirms ads are a revenue dependency.

---

## 7. Assets / Misc

- `logo.png`, `icon-192x192.png`, `favicon.ico`, `manifest.json`, `seo.png`.
- Footer disclaimer: *"This site does not store any files on our server, we only linked to the media
  which is hosted on 3rd party services."*
- Contact: `contact@cineby.at`.

---

## 8. What Is Proprietary vs. Rebuildable

| Layer | Proprietary? | Rebuild note |
|-------|:---:|-------------|
| TMDB metadata proxy | No | Use TMDB directly or own proxy |
| Image optimization (weserv) | No | Use weserv or self-host Sharp |
| Next.js frontend + UI | No | Build fresh, replicate design |
| Auth / accounts backend | Yes | Rebuild (JWT or improve) |
| Watchlist / history / watch party | Yes | Rebuild |
| Seed + source resolution (scrappers) | **Yes — open-sourcing later** | FlixHQ + SmashyStream decrypt→m3u8 |
| Player embed (Vidking) | Third-party | Decide: self-build player vs embed |
| Subtitles (Videasy + OpenSubtitles) | Third-party | Integrate API or self-host |
| Analytics (Rybbit) / Ads | Third-party | Self-host or replace |

---

## 9. Rebuild Considerations

- The site is **100% TMDB-driven** for content metadata — no custom content DB needed for the read path.
- The only hard, proprietary piece is the **seed → sources → decrypt → m3u8** chain. Plan to integrate
  the open-sourced scrappers here once the developer releases them.
- Frontend should reproduce: hero carousel, "TOP 10 Today", "Trending Today" (movies/series tabs),
  "Only on provider", "Top rated", genre browse, infinite-scroll browse, instant debounced search,
  skeleton loaders, mobile-first responsive.
- Auth: live site uses localStorage JWT; decide whether to keep parity or move to HTTP-only cookies.
- Ad revenue model: keep an ad-tag toggle mechanism if monetization is intended.