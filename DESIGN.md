# Design

## Theme

Dark. The landing is a literal night sky; the scene starts in deep "half-light" and crossfades into broad daylight. The lit state is the only time the page is bright, and it is the *resolution* of the journey, not the default surface.

## Color

### Strategy

**Committed** — one saturated color (night navy `#101631`) carries roughly 60% of the canvas. Warm cream is the body's type and atmospheric warmth.

### Token reference

All tokens live in `app/globals.css`. Names mirror the daydreamer source `colors_and_type.css` so existing brand documentation remains the source of truth.

**Night (cold half — dominant)**
- `--midnight: #0B1026` — deepest sky, near-black blue
- `--night: #101631` — primary dark surface (default `body` bg)
- `--dusk: #1D3B5E` — mid navy, raised surfaces
- `--steel: #283F5F` — navy used inside the mark + borders
- `--pine: #0A0D12` — forest silhouette, deepest shadow

**Cream (warm half — type + mark)**
- `--cream: #F3ECD9` — default `color`, the mark, primary readable text
- `--ivory: #F7EFDB` — dawn glow corner, button hover
- `--sand: #E7D9BC` — muted warm, secondary light surfaces

**Cool accents (drawn from the landscape)**
- `--sea-mist: #CBD8D4` — palest teal
- `--teal: #8FB2AE` — coastal water
- `--slate: #5A6B82` — distant mountains

**Warm horizon**
- `--dawn: #E5C7A2` — the trailing period in `daydreamer.` and the default `--dd-accent`

**Aurora (use one at a time, never together)**
- `--aurora-coral: #E8927C`
- `--aurora-aqua: #7FC8B8`
- `--aurora-indigo: #5B6BA8`

### Semantic mapping

| Token | Value | Use |
|---|---|---|
| `--bg` | `var(--night)` | Default page background |
| `--bg-elevated` | `var(--dusk)` | Frosted top bar (unused on this site — kept for future) |
| `--fg` | `var(--cream)` | Body text + wordmark |
| `--fg-muted` | `rgba(243,236,217,0.62)` | Sub-headings, eyebrows |
| `--fg-faint` | `rgba(243,236,217,0.34)` | Return-link rest state |
| `--border` | `rgba(243,236,217,0.16)` | Hairline borders on dark |
| `--border-strong` | `rgba(243,236,217,0.28)` | Light button border |
| `--dd-accent` | `var(--dawn)` (#E5C7A2) | The dot in `daydreamer.` and the sun in the lit scene |

### Gradients

- `--grad-night` — vertical hero backdrop (`midnight → dusk → steel`)
- `--grad-dawn` — radial bloom in the upper-right of the landing
- `--grad-lockup` — diagonal cold-to-warm (used for OG image / favicon contexts)

## Typography

### Strategy

Two families, neither default. Cormorant (display) for the wordmark and dream moments. Hanken Grotesk (UI) for body, eyebrows, and the button.

### Fonts

- **Display:** Cormorant — weight 300 (rare 400). Lowercase. Letter-spacing -0.015em on display, -0.01em on the second scene line. The wordmark is the largest moment on the page.
- **UI / body:** Hanken Grotesk — 300, 400, 500, 600. Letter-spacing 0.005em on body, 0.42em on eyebrows.
- Both loaded via `next/font/google` (self-hosted at build time, eliminating render-blocking CDN).

### Scale

Mirrors `colors_and_type.css`:

| Token | Value | Use |
|---|---|---|
| `--t-hero` | `clamp(3.5rem, 9vw, 8rem)` | Wordmark on landing |
| `--t-display` | `clamp(2.5rem, 5.5vw, 4.5rem)` | Scene line (`stay a while in the half-light.`) |
| `--t-h3` | `1.25rem` | (reserved) |
| `--t-body-lg` | `1.125rem` | (reserved) |
| `--t-body` | `1rem` | Default |
| `--t-small` | `0.875rem` | Button label |
| `--t-micro` | `0.75rem` | Eyebrows, return link |

Letter-spacing floor on the wordmark is `-0.015em` (well above the -0.04em floor); the wordmark feels airy, not cramped — appropriate to the brand.

## Components

The codebase ships **five** components plus the page wiring. Nothing more.

### `TopBar`
Slim, absolutely-positioned, no background. Holds only the wordmark `daydreamer.` Used in both views.

### `Footer`
Centered eyebrow line: `made for the hours after dark`. Used only on the landing view.

### `Background`
Decorative layered atmosphere for the landing view:
1. `--grad-night` full-bleed gradient
2. `--grad-dawn` radial bloom (`mix-blend-mode: screen`)
3. ~46 randomly-positioned star spans, infinite `dd-twinkle` 5s loop
4. A slow drifting wisp of cool light near the horizon (`dd-drift` 22s loop)
5. SVG-noise grain at ~6% opacity, `mix-blend-mode: overlay`

All decorative layers are `aria-hidden="true"`.

### `Landing`
Centered column: eyebrow → wordmark → button. Staged `dd-rise` entrance with `--i` index variable for each line (160ms stagger, 900ms duration). Entire view fades to opacity 0 over 700ms before unmounting on `enter` click.

### `Scene`
The persistent landscape. Single `<img>` for the hero landscape; absolutely-positioned layers above it:
1. `dd-scene-dark` — deep-night scrim, fades out when lit
2. `dd-scene-sunset` — daytime sky wash, fades in when lit (`mix-blend-mode: screen`)
3. `dd-scene-sun` — radial sun bloom in upper-right, fades in when lit
4. Wordmark `daydreamer.` in the corner (color crossfades cream → night-ink when lit)
5. The half-light copy block + `into the light` button, OR the lit copy block (no button — text-only resolution)
6. Return text-link at the bottom (`back to the half-light` / `back to the night`)

The crossfade is a 1600ms simultaneous transition across all four scene layers (image filter, dark scrim, sky wash, sun bloom). The CSS `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease-dream`) is shared across every motion in the site.

## Layout

Generous, almost luxurious. 8px base scale; the brand lives at the large end (`--s-9` 96px, `--s-10` 128px, `--s-11` 192px between major blocks).

- The page is exactly one viewport tall — both views are `position: absolute; inset: 0`. No scrolling.
- The landing column is `flex-direction: column; align-items: center; justify-content: center` — perfect optical center, no `padding-top` hacks.
- Top bar padding: `var(--s-6) var(--s-8)` (32px / 64px) → drops to `var(--s-5) var(--s-5)` (24px / 24px) on `max-width: 600px`.

## Motion

Single timing system. Every transition uses `--ease-dream` (`cubic-bezier(0.22, 1, 0.36, 1)`) — a gentle exponential ease-out, never bouncy.

- `--dur-quick: 220ms` — hover transforms
- `--dur-base: 420ms` — color/border crossfades
- `--dur-slow: 900ms` — landing staged entrance
- Scene crossfade: 1600ms (longer than `--dur-slow` because it's the emotional payoff)

All motion respects `@media (prefers-reduced-motion: reduce)`: animations and transitions are set to `none`, content is shown in its final state.

## Iconography

Lucide-style inline SVG, 1.6px stroke, rounded caps and joins. Three icons total in the site:
- Landing `enter` button: arrow-right (`M5 12h14M13 6l6 6-6 6`)
- Scene `into the light` button: sun (`circle` + 8 rays)
- Return link: arrow-left

No icon library installed — the three SVGs are inlined directly in their components. ~120 bytes apiece.
