# Animation & Ethereal Treatment — Design Spec

**Date:** 2026-06-03
**Direction:** Atmospheric Serenity — ambient life, nothing dramatic, everything serene
**Approach:** CSS enrichment + minimal React (Approach 2)
**Constraint:** No new libraries. CSS keyframes + existing React patterns only.

---

## Scope

Two files only:

| File                        | Change                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `components/Background.tsx` | Richer star data, aurora div, horizon glow div, vignette div, shooting star spawner |
| `app/globals.css`           | New keyframes and CSS rules for all animated elements                               |

**Untouched:** `Landing.tsx`, `Scene.tsx`, `TopBar.tsx`, `Footer.tsx`, `page.tsx`, `layout.tsx`

---

## Background.tsx Changes

### 1. Richer star data

`seededStars()` gains two new fields derived from the same seeded LCG (no hydration mismatch):

```ts
type Star = {
    id: number;
    x: number; // left %
    y: number; // top % (upper 62% of sky)
    s: number; // size px — widened range: 0.4–2.8px
    o: number; // base opacity
    d: number; // animation delay s
    dur: number; // twinkle duration s
    glow: boolean; // ~15% of stars — halo treatment
};
```

The `glow` flag is set when `rand() < 0.15`. Glow stars render with `className="dd-star-glow"` instead of the default span; they're slightly larger and get the `dd-starshine` keyframe.

### 2. New decorative divs (inside `<div className="dd-bg">`)

```tsx
<div className="dd-aurora"      aria-hidden="true" />
<div className="dd-horizon-glow" aria-hidden="true" />
<div className="dd-vignette"    aria-hidden="true" />
```

All three are `aria-hidden`, pointer-events none.

### 3. Shooting star spawner

A single `useEffect` (fires after mount, `mounted` dependency):

- Checks `window.matchMedia('(prefers-reduced-motion: reduce)').matches` — returns early if true
- Schedules shots via `setTimeout` with random delay `4000 + rand * 10000` ms (4–14s)
- Each shot: random `x` (10–80%), `y` (5–35%), `angle` (−20 to −50 deg), `length` (80–160px), unique `id`
- Appends to `shots: Shot[]` state; removes the shot after 1200ms (animation completes)
- Cleanup clears the pending timeout on unmount

```tsx
type Shot = { id: number; x: number; y: number; angle: number; length: number };
```

Rendered inside `.dd-bg-stars`:

```tsx
{
    shots.map((sh) => (
        <span
            key={sh.id}
            className="dd-shoot"
            style={{
                left: `${sh.x}%`,
                top: `${sh.y}%`,
                width: sh.length,
                transform: `rotate(${sh.angle}deg)`,
            }}
        />
    ));
}
```

---

## globals.css Changes

### New keyframes

| Keyframe              | Duration       | Purpose                                                                 |
| --------------------- | -------------- | ----------------------------------------------------------------------- |
| `dd-starshine`        | 5–7s per star  | Opacity + box-shadow pulse on glow stars                                |
| `dd-shoot`            | 1.1s           | Translate along axis + opacity arc (0→1→0) for shooting stars           |
| `dd-aurora`           | 14s            | Horizontal drift + slow opacity pulse (aurora band)                     |
| `dd-grain`            | 0.12s steps(1) | Background-position shuffle — film flutter on grain                     |
| `dd-dawn-breathe`     | 8s             | Opacity pulse on `.dd-bg-dawn` radial bloom                             |
| `dd-dot-breathe`      | 6s             | Color + text-shadow pulse on `.dd-dot` accent period                    |
| `dd-wordmark-glow`    | 9s             | Soft text-shadow luminance pulse on `.dd-hero-mark`                     |
| `dd-btn-pulse`        | 5s             | Ambient box-shadow glow pulse on `.dd-enter` (resting state, not hover) |
| `dd-vignette-breathe` | 9s             | Opacity pulse on the radial corner vignette                             |
| `dd-horizon-breathe`  | 11s            | Opacity pulse on the warm horizon gradient                              |

All cycles are offset so nothing pulses in sync — the page breathes irregularly, not mechanically.

### New CSS rules

**Glow stars:**

```css
.dd-star-glow {
    position: absolute;
    border-radius: 50%;
    background: #fff;
    /* animationDuration and animationDelay set inline via style prop — same pattern as normal stars */
    animation: dd-starshine var(--ease-soft) infinite;
}
```

`box-shadow: 0 0 6px 2px rgba(243,236,217,0.28)` grows to `0 0 10px 3px rgba(243,236,217,0.5)` at peak.

In `Background.tsx`, glow stars pass `animationDuration` and `animationDelay` inline (same as normal stars), e.g. `style={{ animationDuration: \`${st.dur}s\`, animationDelay: \`${st.d}s\` }}`.

**Aurora band:**

```css
.dd-aurora {
    position: absolute;
    height: 28px;
    left: 0;
    right: 0;
    top: 28%;
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(91, 107, 168, 0.18) 28%,
        rgba(127, 200, 184, 0.14) 58%,
        transparent 100%
    );
    filter: blur(10px);
    mix-blend-mode: screen;
    animation: dd-aurora 14s ease-in-out infinite;
}
```

**Horizon glow:**

```css
.dd-horizon-glow {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 35%;
    background: linear-gradient(0deg, rgba(229, 199, 162, 0.07) 0%, transparent 100%);
    pointer-events: none;
    animation: dd-horizon-breathe 11s ease-in-out infinite;
}
```

**Vignette:**

```css
.dd-vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse 72% 68% at 50% 50%, transparent 30%, rgba(7, 10, 22, 0.62) 100%);
    animation: dd-vignette-breathe 9s ease-in-out infinite;
}
```

**Shooting star:**

```css
.dd-shoot {
    position: absolute;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(243, 236, 217, 0.9));
    transform-origin: left center;
    animation: dd-shoot 1.1s var(--ease-dream) forwards;
    pointer-events: none;
}
```

**Existing element augmentations:**

- `.dd-bg-grain` — adds `animation: dd-grain 0.12s steps(1) infinite`
- `.dd-bg-dawn` — adds `animation: dd-dawn-breathe 8s ease-in-out 1s infinite`
- `.dd-dot` — adds `animation: dd-dot-breathe 6s ease-in-out infinite`
- `.dd-hero-mark` — adds `animation: dd-wordmark-glow 9s ease-in-out 0.5s infinite`
- `.dd-enter` (resting) — adds `animation: dd-btn-pulse 5s ease-in-out 1.5s infinite`

### Reduced motion

All new keyframe animations live inside `@media (prefers-reduced-motion: no-preference)` blocks.

The shooting star spawner early-returns if `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.

The existing reduced-motion block (`animation-duration: 0.01ms !important`) already handles any that slip through.

---

## Summary of all animated elements

| Element                | Mechanism                      | Cycle            |
| ---------------------- | ------------------------------ | ---------------- |
| Stars (normal)         | CSS — existing `dd-twinkle`    | 4–8s             |
| Stars (glow ~15%)      | CSS — new `dd-starshine`       | 5–7s             |
| Shooting stars         | React spawner → CSS `dd-shoot` | Random 4–14s gap |
| Aurora band            | CSS — `dd-aurora`              | 14s              |
| Dawn radial bloom      | CSS — `dd-dawn-breathe`        | 8s               |
| Horizon glow           | CSS — `dd-horizon-breathe`     | 11s              |
| Vignette               | CSS — `dd-vignette-breathe`    | 9s               |
| Wisp drift             | CSS — existing `dd-drift`      | 22s              |
| Grain film flutter     | CSS — `dd-grain` steps         | 0.12s            |
| Accent dot `.`         | CSS — `dd-dot-breathe`         | 6s               |
| Wordmark               | CSS — `dd-wordmark-glow`       | 9s               |
| Enter button (resting) | CSS — `dd-btn-pulse`           | 5s               |
