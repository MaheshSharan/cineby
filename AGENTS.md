# AGENTS.md

## Cineby Engineering Standards

This document defines the coding standards, architectural rules, and implementation expectations for Cineby.

These rules apply to all application code unless a more specific rule exists for a directory.

---

## 1. Core Engineering Principles

Write code that is:

* Simple before clever.
* Explicit before implicit.
* Small before abstract.
* Typed before dynamic.
* Reusable only when reuse is real.
* Easy to delete, change, and test.
* Consistent with the existing architecture.

Do not add complexity without a concrete requirement.

### Prefer the smallest correct implementation

If a problem can be solved cleanly in 10 lines, do not write 50.

Do not compress code merely to reduce line count. Optimize for **clarity, correctness, and maintainability**, not artificial brevity.

Bad:

```ts
function getMovieTitle(movie: Movie | null | undefined): string {
  if (movie) {
    if (movie.title) {
      return movie.title;
    }

    if (movie.name) {
      return movie.name;
    }

    return "";
  }

  return "";
}
```

Prefer:

```ts
function getMovieTitle(movie?: Movie | null): string {
  return movie?.title ?? movie?.name ?? "";
}
```

Do not turn simple code into unnecessary abstractions.

---

## 2. TypeScript

TypeScript is strict. Do not weaken the type system to make implementation easier.

### Never use `any`

Do not introduce:

```ts
any
```

Use an explicit type, generic, union, `unknown`, or a properly modeled interface instead.

If an external value is unknown:

```ts
const data: unknown = response;
```

Then validate or narrow it before use.

Do not use:

```ts
const data = response as any;
```

### Type assertions

Avoid unnecessary assertions:

```ts
const movie = data as Movie;
```

Prefer validation, type guards, or correctly typed APIs.

Assertions are acceptable only when the runtime invariant is genuinely guaranteed and cannot be expressed more accurately.

### Avoid duplicated types

If a type represents a domain concept, define it once and reuse it.

Do not create multiple slightly different versions of the same concept across components.

---

## 3. Functions

Functions should have one clear responsibility.

A function should generally:

* Do one thing.
* Have a clear input.
* Have a predictable output.
* Avoid hidden side effects.
* Be easy to test independently.

### Avoid large functions

A function containing multiple unrelated responsibilities should be split.

Bad:

```ts
async function loadMoviePage() {
  // fetch movie
  // validate user
  // transform movie
  // calculate recommendations
  // update state
  // manipulate DOM
  // handle errors
}
```

Prefer separate responsibilities:

```ts
const movie = await getMovie(id);
const recommendations = await getRecommendations(movie.id);
```

with domain-specific functions handling each operation.

### Function length

There is no arbitrary line limit.

However, a function should be questioned when it:

* Requires extensive scrolling to understand.
* Contains multiple levels of nested conditionals.
* Performs unrelated operations.
* Has many parameters.
* Requires comments explaining what individual sections are doing.

Do not split functions solely to satisfy a line-count rule.

---

## 4. Naming

Names must describe intent.

Prefer:

```ts
getMovieDetails()
fetchUserProfile()
isAuthenticated()
formatRuntime()
handleSearchSubmit()
```

Avoid:

```ts
getData()
process()
handle()
doStuff()
run()
x()
temp()
```

Boolean values should read naturally:

```ts
isLoading
isAuthenticated
hasResults
canEdit
shouldFetch
```

Event handlers should normally use:

```ts
handleSearch()
handleSubmit()
handleClose()
```

Functions that perform an action should use verbs:

```ts
fetchMovie()
createPlaylist()
deleteSession()
```

---

## 5. React

Use functional components and React hooks.

Do not introduce class components.

Components should primarily describe UI and UI behavior.

Move domain logic, API logic, parsing, and complex transformations out of components.

Bad:

```tsx
function MoviePage() {
  // 200 lines of fetching,
  // transformation,
  // authentication,
  // filtering,
  // state management,
  // and JSX.
}
```

Prefer:

```tsx
function MoviePage() {
  const { movie, isLoading } = useMovie(movieId);

  return <MovieView movie={movie} isLoading={isLoading} />;
}
```

The component should make the UI structure obvious.

---

## 6. React State

Do not create state for values that can be derived.

Bad:

```tsx
const [movies, setMovies] = useState<Movie[]>([]);
const [movieCount, setMovieCount] = useState(0);
```

when the count can be derived from `movies`.

Prefer:

```tsx
const movieCount = movies.length;
```

Avoid duplicated sources of truth.

Use the least powerful state mechanism that solves the problem:

1. Local variable
2. Derived value
3. `useState`
4. `useReducer`
5. Context
6. External state management

Do not introduce global state when local state is sufficient.

---

## 7. `useEffect`

`useEffect` is for synchronizing React with external systems.

Do not use it as a general-purpose replacement for normal JavaScript logic.

Avoid:

```tsx
useEffect(() => {
  setFilteredMovies(
    movies.filter(movie => movie.title.includes(query))
  );
}, [movies, query]);
```

Prefer:

```tsx
const filteredMovies = movies.filter(movie =>
  movie.title.includes(query)
);
```

Use effects for things such as:

* Network synchronization.
* Browser APIs.
* Subscriptions.
* Event listeners.
* Timers.
* External libraries.

Every `useEffect` should have a clear reason to exist.

---

## 8. Custom Hooks

Create a custom hook when logic is:

* Reused by multiple components, or
* Complex enough to obscure the component's primary purpose.

Good:

```ts
useMovie()
useAuth()
useSearch()
useDebounce()
```

Do not create hooks that merely wrap one trivial line.

Bad:

```ts
function useMovieTitle(movie: Movie) {
  return movie.title;
}
```

---

## 9. Next.js Pages Router

Cineby uses the **Next.js Pages Router**.

Do not introduce App Router patterns into this project.

Use the appropriate Pages Router mechanisms:

* `pages/`
* `getServerSideProps`
* `getStaticProps`
* `getStaticPaths`
* API routes where applicable
* `next/router`
* Next.js page-level conventions

Do not mix:

```ts
next/navigation
```

or App Router conventions into Pages Router code unless there is a deliberate architectural decision to migrate.

Keep page files thin.

A page should primarily compose:

* Data requirements
* Page-level layout
* Feature components

Do not place large domain implementations directly inside `pages/*`.

---

## 10. Component Structure

Prefer this structure:

```text
components/
  movie/
    MovieCard.tsx
    MovieGrid.tsx
    MovieDetails.tsx

hooks/
  useMovie.ts
  useSearch.ts

lib/
  api/
  auth/
  movies/

types/
```

Organize code by responsibility and domain rather than creating a giant generic folder.

Avoid:

```text
utils/
  everything.ts
```

A utility belongs near the domain it serves when possible.

---

## 11. File Responsibility

Every file should have a clear reason to exist.

A file should ideally answer one question:

> "What responsibility does this file own?"

Examples:

```text
MovieCard.tsx
```

Owns the movie card UI.

```text
useMovie.ts
```

Owns the React-facing movie data logic.

```text
movieApi.ts
```

Owns movie API operations.

```text
movie.types.ts
```

Owns movie-related types.

Do not create files containing unrelated helpers merely because they are convenient places to put code.

---

## 12. File Size

There is no artificial maximum file size.

However, a file should be split when it contains multiple independent responsibilities.

A large file is not automatically bad.

A large file containing:

* unrelated components,
* API requests,
* data transformation,
* authentication,
* formatting,
* and business rules

is bad.

Split by responsibility, not by arbitrary line count.

---

## 13. Imports

Keep imports clean and intentional.

Prefer:

```ts
import { MovieCard } from "@/components/movie/MovieCard";
```

over deeply coupled relative paths:

```ts
import { MovieCard } from "../../../../components/movie/MovieCard";
```

Use the project's configured path aliases consistently.

Do not import internal implementation details when a public module API exists.

Avoid circular dependencies.

---

## 14. API Layer

Components must not contain raw API implementation when the operation is reusable or domain-specific.

Avoid:

```tsx
fetch("/api/movie/" + id)
```

spread throughout components.

Prefer a centralized API layer:

```ts
movieApi.getById(id)
```

The API layer should handle:

* Request construction.
* HTTP methods.
* Authentication headers.
* Response parsing.
* Error normalization.
* API-specific details.

Components should consume domain-level functions rather than knowing API implementation details.

---

## 15. API Types

API responses must be typed.

Do not assume that external data matches a TypeScript interface merely because TypeScript says so.

Where runtime validation is necessary, validate the response at the API boundary.

The rest of the application should receive normalized, predictable data.

Do not leak raw API response structures throughout the UI.

---

## 16. Error Handling

Errors must be intentional.

Do not silently swallow errors:

```ts
try {
  await fetchMovie();
} catch {}
```

If an error is intentionally ignored, document why.

Prefer meaningful error handling:

```ts
try {
  await fetchMovie();
} catch (error) {
  logger.error(error);
  setError("Unable to load movie.");
}
```

Do not expose internal errors, stack traces, tokens, or sensitive request data to users.

---

## 17. Authentication

Authentication logic must be centralized.

Do not independently read, decode, modify, or validate authentication state across random components.

Use a single authentication abstraction.

Avoid:

```ts
localStorage.getItem("token")
```

scattered throughout the application.

Prefer:

```ts
auth.getToken()
auth.isAuthenticated()
```

or the project's equivalent abstraction.

Never log:

* JWTs
* Authorization headers
* Passwords
* Session secrets
* Private API credentials

Treat authentication tokens as sensitive data.

---

## 18. Security

Never trust client-side input.

Validate data at boundaries.

Do not:

* Use `dangerouslySetInnerHTML` without a documented security reason and sanitization.
* Construct executable code from strings.
* Store secrets in client-side source code.
* Log credentials or tokens.
* Disable security checks merely to make development easier.
* Bypass authorization checks because the UI already hides an action.

Client-side authorization is not a security boundary.

Server-side authorization must remain authoritative.

---

## 19. Environment Variables

Secrets and server-only configuration must never be exposed to the browser.

Do not use:

```env
NEXT_PUBLIC_SECRET_KEY=
```

for secrets.

Anything prefixed with `NEXT_PUBLIC_` should be considered browser-visible.

Never commit:

```text
.env
.env.local
.env.production
```

or credentials to Git.

Use environment variables for deployment-specific configuration.

---

## 20. Tailwind CSS

Use Tailwind consistently with the existing design system.

Prefer existing utility patterns over creating new one-off styles.

Avoid extremely large unreadable class strings when a component clearly has multiple visual responsibilities.

If a class combination is repeated meaningfully, extract a component or an appropriate reusable style abstraction.

Do not create a new abstraction for every repeated class.

Avoid inline styles unless there is a concrete reason Tailwind cannot express the requirement.

---

## 21. UI Components

Prefer composable components.

Good:

```tsx
<MovieCard>
  <MoviePoster />
  <MovieInfo />
</MovieCard>
```

when the pieces have independent responsibilities.

Do not over-componentize simple markup.

Bad:

```tsx
<MovieCardTitle />
<MovieCardImage />
<MovieCardWrapper />
<MovieCardContainer />
```

when each component contains only one trivial element.

Abstraction must provide real value.

---

## 22. Business Logic

Business rules must not be duplicated across UI components.

If a rule matters to the application, give it a named function.

Bad:

```ts
if (movie.vote_average > 7 && movie.vote_count > 1000) {
  ...
}
```

repeated in multiple locations.

Prefer:

```ts
isPopularMovie(movie)
```

This makes business rules discoverable and changeable.

---

## 23. Constants

Do not scatter magic values throughout the codebase.

Bad:

```ts
if (runtime > 180) {
```

Prefer:

```ts
const LONG_MOVIE_MINUTES = 180;
```

Constants should have meaningful names.

Do not create constants for values that are already obvious and used once.

---

## 24. Comments

Code should explain **what it does** through structure and naming.

Comments should explain **why** something exists.

Bad:

```ts
// Loop through movies
movies.forEach(...)
```

Good:

```ts
// TMDB can return duplicate results across paginated recommendation queries.
```

Do not leave stale comments.

Do not use comments to justify poor architecture.

---

## 25. TODOs

Do not leave vague TODOs.

Bad:

```ts
// TODO: fix this
```

Good:

```ts
// TODO: Replace polling with WebSocket updates after backend event support is available.
```

If a TODO represents real planned work, make it actionable and specific.

---

## 26. Dead Code

Do not keep unused:

* Imports
* Variables
* Functions
* Components
* Types
* Constants
* Commented-out implementations

Git is the history.

Do not use commented-out code as a backup.

Delete it.

---

## 27. Duplication

Do not blindly eliminate every duplicate line.

Small duplication can be preferable to premature abstraction.

Extract code when:

* The same behavior appears in multiple places.
* The behavior represents a meaningful domain concept.
* Changing one implementation should update all consumers.

Do not create generic abstractions simply because two pieces of code currently look similar.

---

## 28. Performance

Do not optimize based on assumptions.

First write clear code.

Optimize when there is evidence of a real performance problem.

Avoid unnecessary:

* Re-renders
* Network requests
* Large client-side computations
* State duplication
* Bundle-heavy dependencies

Do not add `useMemo`, `useCallback`, or memoization everywhere.

Memoization must have a reason.

---

## 29. Data Fetching

Avoid fetching the same data independently from multiple components when it can be owned by a higher-level data boundary.

Do not make a component fetch data merely because it needs to display it if the page already owns that data.

Keep loading, error, and empty states explicit.

Every asynchronous UI should consider:

```text
loading
success
empty
error
```

where applicable.

---

## 30. WebSocket Code

WebSocket connections must have explicit lifecycle management.

Always consider:

* Connection creation
* Cleanup
* Reconnection
* Error handling
* Duplicate subscriptions
* Component unmounting

Do not create a new WebSocket connection on every render.

Keep WebSocket protocol details outside presentation components.

---

## 31. Testing

Test behavior, not implementation details.

Prefer tests that answer:

> "Does Cineby behave correctly?"

rather than:

> "Was this exact internal function called three times?"

Prioritize tests for:

* Authentication behavior
* API transformations
* Business rules
* Critical user flows
* Error handling
* Complex utilities

Do not write tests merely to increase coverage numbers.

---

## 32. Dependencies

Do not add a dependency for something that can be implemented clearly with existing platform capabilities.

Before adding a package, ask:

1. Is it actually necessary?
2. Is the problem recurring?
3. Does the dependency meaningfully reduce complexity?
4. Is it maintained?
5. Does it introduce unnecessary bundle or security risk?

Do not add libraries for trivial helpers.

---

## 33. Git Hygiene

Commits should be focused.

Prefer:

```text
fix: handle missing movie metadata
feat: add movie search pagination
refactor: extract authentication client
```

Avoid commits such as:

```text
stuff
changes
fixes
update
```

Do not mix unrelated refactoring with a feature or bug fix unless necessary.

Do not reformat unrelated files.

---

## 34. Pull Requests

A PR should be understandable without reconstructing the author's thought process.

Keep changes focused.

Before opening a PR:

* Remove dead code.
* Remove debugging statements.
* Remove temporary logs.
* Check TypeScript errors.
* Check lint errors.
* Check affected tests.
* Review the final diff.
* Verify no secrets or environment files are included.

Do not submit code that "works on my machine" while knowingly leaving obvious technical debt in the changed area.

---

## 35. Debugging

Temporary debugging code must not remain in production code.

Remove:

```ts
console.log(...)
console.error(...)
debugger
```

unless it is intentionally part of the application's logging strategy.

Never log sensitive information.

---

## 36. GitHub Code Navigation

Code should be written so GitHub's symbol navigation can understand it.

Prefer named declarations:

```ts
export function getMovieDetails() {}
```

```ts
export function MovieCard() {}
```

```ts
export function useMovie() {}
```

over anonymous implementations assigned to ambiguous variables when a named declaration improves navigation.

Keep one primary responsibility per file where practical.

Use clear exported names.

Avoid deeply nested anonymous functions for important business logic.

### Important

Do not attempt to create a custom GitHub scrollbar or function navigator in application code.

GitHub's code viewer automatically provides symbol/function navigation for supported languages. The correct way to improve that experience is to keep the source structurally navigable:

```text
function
function
function
type
constant
```

with meaningful names and predictable file organization.

When a developer opens a file on GitHub, they should be able to understand its structure from the symbol/outline navigation without reading the entire file.

---

## 37. Recommended File Pattern

For a typical feature, prefer:

```text
features/
  movie/
    components/
      MovieCard.tsx
      MovieDetails.tsx

    hooks/
      useMovie.ts

    api/
      movieApi.ts

    utils/
      formatMovieRuntime.ts

    types.ts
```

Keep feature-specific implementation inside the feature.

Only promote something to a global/shared location when it is genuinely shared.

---

## 38. Recommended Component File Pattern

A component file should generally follow this order:

```tsx
// 1. External imports

// 2. Internal imports

// 3. Types

// 4. Constants

// 5. Component

// 6. Small component-local helpers
```

Example:

```tsx
import type { Movie } from "@/features/movie/types";

interface MovieCardProps {
  movie: Movie;
  onSelect?: (movie: Movie) => void;
}

export function MovieCard({ movie, onSelect }: MovieCardProps) {
  return (
    <button type="button" onClick={() => onSelect?.(movie)}>
      {movie.title}
    </button>
  );
}
```

Do not put unrelated helpers, API calls, or business logic into the component file.

---

## 39. Recommended Hook File Pattern

A hook should expose a small, predictable API.

```ts
interface UseMovieResult {
  movie: Movie | null;
  isLoading: boolean;
  error: Error | null;
}

export function useMovie(id: string): UseMovieResult {
  // ...
}
```

Consumers should not need to understand the hook's internal implementation.

---

## 40. Recommended API File Pattern

Keep transport details inside the API module.

```ts
export async function getMovie(id: string): Promise<Movie> {
  const response = await apiClient.get(`/movies/${id}`);

  return parseMovie(response.data);
}
```

Do not leak raw `fetch`, Axios, headers, or response parsing throughout UI code.

---

## 41. Recommended Utility Pattern

Utilities should be pure whenever possible.

Good:

```ts
export function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}
```

A utility should not unexpectedly:

* Modify global state.
* Perform network requests.
* Access browser APIs.
* Mutate its arguments.

If it has side effects, it probably belongs somewhere else.

---

## 42. Avoid Clever Code

Do not optimize for showing how much JavaScript/TypeScript you know.

Avoid:

* Excessive one-liners.
* Clever chained expressions.
* Unnecessary metaprogramming.
* Complex generic types for simple problems.
* Deep destructuring that hides meaning.
* Abstractions that require documentation to understand.

Readable code is senior code.

---

## 43. Review Standard

Before considering code complete, ask:

### Correctness

* Does it actually solve the requirement?
* Are edge cases handled?
* Are failure states handled?

### Design

* Does each function have one responsibility?
* Is business logic in the correct layer?
* Is state duplicated unnecessarily?
* Is this abstraction actually needed?

### Type Safety

* Is there any `any`?
* Are assertions justified?
* Are external values validated?

### Maintainability

* Can another developer understand this quickly?
* Can the implementation change without touching unrelated code?
* Are names meaningful?
* Is the file responsible for one coherent area?

### Security

* Are secrets protected?
* Are tokens protected?
* Is user input handled safely?
* Are authorization checks enforced server-side?

### Cleanliness

* Any dead code?
* Any debug logging?
* Any unnecessary dependencies?
* Any unrelated changes?

If the answer is no, improve the implementation before merging.

---

## 44. The Standard

The goal is not to write the fewest lines.

The goal is to write the **smallest amount of code that expresses the correct design clearly**.

Prefer:

```text
simple
typed
explicit
composable
testable
maintainable
```

Avoid:

```text
clever
duplicated
implicit
over-engineered
loosely typed
tightly coupled
```

Every new abstraction, dependency, state variable, effect, and file should have a reason to exist.

**Make the code easy to understand before making it clever.**