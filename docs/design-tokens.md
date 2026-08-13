# Cineby — Design Tokens (extracted from live site)

Extracted from the live site (computed styles + compiled CSS) on Aug 13, 2026.
Used to reproduce the UI 1:1 via Tailwind theme tokens.

## Palette

| Token | HSL (site CSS) | Hex (computed) | Role |
|-------|----------------|----------------|------|
| `background` | `214 30% 3%` | `#05070a` | App background |
| `foreground` | `220 22% 95%` | `#eef1f6` | Primary text |
| `card` | `215 28% 5%` | `#0b0f14` | Card surface |
| `card` (hover) | — | `#141922` | Card hover surface |
| `popover` | `215 28% 6%` | `#0f141b` | Popover/dropdown |
| `popover-foreground` | `220 22% 95%` | `#eef1f6` | Popover text |
| `primary` | `0 72% 51%` | `#dc2626` | Red accent (CTA, active states) |
| `primary` (soft) | — | `rgba(220,38,38,0.8)` | Buttons, overlays |
| `primary-foreground` | `220 25% 10%` | `#131720` | Text on red |
| `secondary` | `215 30% 8%` | `#0e1219` | Secondary surface |
| `secondary-foreground` | `220 22% 95%` | `#eef1f6` | Secondary text |
| `muted` | `215 25% 12%` | `#141a23` | Muted surface |
| `muted-foreground` | `218 13% 60%` | `#8a94a6` | Muted text (meta/labels) |
| `accent` | `0 72% 51%` | `#dc2626` | Accent (red) |
| `accent-foreground` | `220 25% 10%` | `#131720` | Text on accent |
| `destructive` | `0 72% 51%` | `#dc2626` | Destructive |
| `destructive-foreground` | `0 0% 98%` | `#fafafa` | Destructive text |
| `border` | `216 24% 15%` | `#1c2127` | Borders, dividers |
| `input` | `216 24% 15%` | `#1c2127` | Input borders |
| `ring` | `0 72% 51%` | `#dc2626` | Focus ring |
| white alpha | — | `rgba(255,255,255,0.2)` | Chip/overlay surfaces |

## Radii

- Base token: `0.5rem` (`--radius`)
- Cards: `10px`
- Pills/badges: `9999px`
- Small chips: `2px`

## Typography

- **Font stack:** `Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- Sizes in use:
  - `11px` (400/700) — small labels, meta
  - `13px` (400/500) — row item titles, secondary text
  - `14px` (400/500) — body secondary
  - `16px` (400/500/700) — base body, button labels
  - `18px` (600) — section sub-headings
  - `24px` (600) — section headings
  - `48px` (900) — hero title
- Note: site loads Inter from Google Fonts (variable font).

## Gradients

- **Hero/banner overlays** (layered over backdrop image):
  ```
  linear-gradient(rgba(5,7,10,0) 40%, rgba(5,7,10,0.92) 88%, rgb(5,7,10) 100%)  /* bottom fade to bg */
  linear-gradient(90deg, rgba(5,7,10,0.78) 0, rgba(5,7,10,0.35) 42%, rgba(5,7,10,0) 65%) /* left fade */
  linear-gradient(rgba(5,7,10,0.6) 0, rgba(5,7,10,0) 35%)  /* top fade */
  ```
- **Card hover surface:**
  ```
  linear-gradient(135deg, rgb(11,15,20) 0, rgb(20,25,34) 100%)
  ```
- **Red glow accent:**
  ```
  radial-gradient(rgba(220,38,38,0.14) 0, rgba(220,38,38,0.06) 30%, rgba(0,0,0,0) 60%)
  ```

## Notes

- Scheme: **dark only** (the live site has no light theme toggle).
- This is a standard shadcn/ui dark theme with a red primary — so Tailwind + shadcn-style HSL
  CSS variables reproduce it exactly.
- Reference files kept in `docs/reference/` (compiled site CSS + computed-tokens.json).
