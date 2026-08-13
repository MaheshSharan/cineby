const BASE_URL = process.env.SMOKE_BASE_URL ?? "http://localhost:3001";

interface User {
  id: number;
  email: string;
  displayName: string | null;
}

function check(label: string, ok: boolean, detail?: string) {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) {
    process.exitCode = 1;
  }
}

async function request(
  baseUrl: string,
  path: string,
  options: { method?: string; body?: unknown; cookie?: string } = {}
): Promise<{ status: number; json: unknown; setCookie: string | null }> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.cookie ? { Cookie: options.cookie } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const setCookie = response.headers.get("set-cookie");
  const cookieValue = setCookie ? setCookie.split(";")[0] : null;

  let json: unknown = null;

  try {
    json = await response.json();
  } catch {
    // Non-JSON responses are treated as null.
  }

  return { status: response.status, json, setCookie: cookieValue };
}

export async function runAuthChecks(baseUrl: string): Promise<void> {
  const email = `smoke-${Date.now()}@example.com`;
  let sessionCookie: string | null = null;

  const registered = await request(baseUrl, "/api/auth/register", {
    method: "POST",
    body: { email, password: "secretpass123", displayName: "Smoke User" },
  });
  sessionCookie = registered.setCookie;
  check(
    "register creates user",
    registered.status === 201 &&
      (registered.json as { user?: User }).user?.email === email,
    `status=${registered.status}`
  );
  check("register sets session cookie", sessionCookie !== null);

  const duplicate = await request(baseUrl, "/api/auth/register", {
    method: "POST",
    body: { email, password: "secretpass123" },
  });
  check("register rejects duplicate email", duplicate.status === 409, `status=${duplicate.status}`);

  const me = await request(baseUrl, "/api/auth/me", { cookie: sessionCookie ?? undefined });
  check(
    "me returns user with cookie",
    me.status === 200 && (me.json as { user?: User }).user?.email === email,
    `status=${me.status}`
  );

  const unauthenticated = await request(baseUrl, "/api/auth/me");
  check("me returns 401 without cookie", unauthenticated.status === 401, `status=${unauthenticated.status}`);

  const added = await request(baseUrl, "/api/watchlist", {
    method: "POST",
    cookie: sessionCookie ?? undefined,
    body: {
      mediaType: "movie",
      mediaId: 969681,
      title: "Spider-Man: Brand New Day",
      posterPath: "/poster.jpg",
      backdropPath: "/backdrop.jpg",
    },
  });
  check("watchlist add", added.status === 201, `status=${added.status}`);

  const inList = await request(baseUrl, "/api/watchlist/movie/969681", {
    cookie: sessionCookie ?? undefined,
  });
  check(
    "watchlist contains added item",
    inList.status === 200 && (inList.json as { inWatchlist?: boolean }).inWatchlist === true,
    `status=${inList.status}`
  );

  const noAuthWatchlist = await request(baseUrl, "/api/watchlist");
  check("watchlist requires auth", noAuthWatchlist.status === 401, `status=${noAuthWatchlist.status}`);

  const recorded = await request(baseUrl, "/api/history", {
    method: "POST",
    cookie: sessionCookie ?? undefined,
    body: { mediaType: "tv", mediaId: 108978, title: "Reacher", seasonNumber: 1, episodeNumber: 1 },
  });
  check("history record", recorded.status === 201, `status=${recorded.status}`);

  const history = await request(baseUrl, "/api/history", { cookie: sessionCookie ?? undefined });
  const items = (history.json as { items?: { title: string }[] }).items ?? [];
  check(
    "history lists recorded watch",
    history.status === 200 && items.length === 1 && items[0].title === "Reacher",
    `status=${history.status}, n=${items.length}`
  );

  const removed = await request(baseUrl, "/api/watchlist/movie/969681", {
    method: "DELETE",
    cookie: sessionCookie ?? undefined,
  });
  check("watchlist remove", removed.status === 200, `status=${removed.status}`);

  const afterRemove = await request(baseUrl, "/api/watchlist/movie/969681", {
    cookie: sessionCookie ?? undefined,
  });
  check(
    "watchlist empty after remove",
    (afterRemove.json as { inWatchlist?: boolean }).inWatchlist === false
  );

  const loggedOut = await request(baseUrl, "/api/auth/logout", {
    method: "POST",
    cookie: sessionCookie ?? undefined,
  });
  check("logout", loggedOut.status === 200, `status=${loggedOut.status}`);

  const loggedIn = await request(baseUrl, "/api/auth/login", {
    method: "POST",
    body: { email, password: "secretpass123" },
  });
  check("login with credentials", loggedIn.status === 200 && loggedIn.setCookie !== null, `status=${loggedIn.status}`);

  const badLogin = await request(baseUrl, "/api/auth/login", {
    method: "POST",
    body: { email, password: "wrong-password" },
  });
  check("login rejects wrong password", badLogin.status === 401, `status=${badLogin.status}`);
}

const isDirectRun =
  typeof process.argv[1] === "string" && process.argv[1].replaceAll("\\", "/").endsWith("smoke-auth.ts");

if (isDirectRun) {
  runAuthChecks(process.env.SMOKE_BASE_URL ?? "http://localhost:3001").catch((error) => {
    console.error(error);
    process.exit(1);
  });
}