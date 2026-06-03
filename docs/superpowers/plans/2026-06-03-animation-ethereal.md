# Animation & Ethereal Treatment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Layer atmospheric ambient animations and ethereal polish onto the daydreamer landing site using only CSS keyframes and minimal React — no new libraries.

**Architecture:** All visual atmosphere lives in `Background.tsx` (new divs + shooting star spawner hook) and `globals.css` (new keyframes + rule augmentations). Twelve animated elements total, all independently cycling at offset intervals so nothing pulses in sync. The shooting star spawner is the only JS-driven animation — everything else is pure CSS.

**Tech Stack:** Next.js 15, React 19, CSS custom properties, CSS keyframes

---

## File Map

| File                        | Change                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/Background.tsx` | Add `glow` field to `Star` type, update `seededStars()`, update star render, add three decorative divs, add `Shot` type + `shots` state + spawner `useEffect` |
| `app/globals.css`           | Add 10 new keyframes, add CSS for new elements, augment 5 existing rules                                                                                      |

---

## Task 1 — Enrich star data and render glow stars

**Files:**

- Modify: `components/Background.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update the `Star` type in `Background.tsx`**

Replace the existing `Star` type (lines 4–13) with:

```ts
type Star = {
    id: number;
    x: number;
    y: number;
    s: number; // widened range: 0.4–2.8px
    o: number;
    d: number;
    dur: number;
    glow: boolean; // ~15% of stars get a halo
};
```

- [ ] **Step 2: Update `seededStars()` to generate the new fields**

Replace the existing `seededStars` function body with:

```ts
function seededStars(count: number, seed: number): Star[] {
    let state = seed >>> 0;
    const rand = () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0xffffffff;
    };
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: rand() * 100,
        y: rand() * 62,
        s: rand() * 2.4 + 0.4,
        o: rand() * 0.5 + 0.18,
        d: rand() * 6,
        dur: rand() * 4 + 4,
        glow: rand() < 0.15,
    }));
}
```

- [ ] **Step 3: Update the star render in `Background.tsx` to split normal vs. glow stars**

Replace the existing `{stars.map(...)}` JSX inside `.dd-bg-stars` with:

```tsx
{
    stars.map((st) =>
        st.glow ? (
            <span
                key={st.id}
                className="dd-star-glow"
                style={{
                    left: `${st.x}%`,
                    top: `${st.y}%`,
                    width: st.s,
                    height: st.s,
                    animationDuration: `${st.dur}s`,
                    animationDelay: `${st.d}s`,
                }}
            />
        ) : (
            <span
                key={st.id}
                style={{
                    left: `${st.x}%`,
                    top: `${st.y}%`,
                    width: st.s,
                    height: st.s,
                    opacity: st.o,
                    animationDelay: `${st.d}s`,
                    animationDuration: `${st.dur}s`,
                }}
            />
        ),
    );
}
```

- [ ] **Step 4: Add the `dd-starshine` keyframe and `.dd-star-glow` rule to `globals.css`**

Add after the existing `@keyframes dd-twinkle` block:

```css
@keyframes dd-starshine {
    0%,
    100% {
        opacity: 0.25;
        box-shadow: 0 0 3px 1px rgba(243, 236, 217, 0.2);
    }
    50% {
        opacity: 0.9;
        box-shadow: 0 0 8px 3px rgba(243, 236, 217, 0.45);
    }
}
```

Add after `.dd-bg-stars span { ... }`:

```css
/* Layout properties outside media query — glow stars must be visible even under reduced-motion */
.dd-star-glow {
    position: absolute;
    border-radius: 50%;
    background: #fff;
    opacity: 0.45;
}
@media (prefers-reduced-motion: no-preference) {
    .dd-star-glow {
        animation: dd-starshine 5s var(--ease-soft) infinite;
        /* animationDuration and animationDelay overridden inline per star */
    }
}
```

- [ ] **Step 5: Verify visually**

```bash
npm run dev
```

Open http://localhost:3000. The star field should have a handful of stars (~7 out of 46) that are noticeably brighter and sport a soft glowing halo. Stars should vary more in size (some very small at ~0.4px, some larger at ~2.8px).

- [ ] **Step 6: Commit**

```bash
git add components/Background.tsx app/globals.css
git commit -m "feat: enrich star field with glow stars and size variety"
```

---

## Task 2 — Add atmospheric decorative elements (aurora, horizon glow, vignette)

**Files:**

- Modify: `components/Background.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add three new divs to `Background.tsx` inside `.dd-bg`**

The new order of children inside `<div className="dd-bg" aria-hidden="true">` should be:

```tsx
<div className="dd-bg" aria-hidden="true">
    <div className="dd-bg-night" />
    <div className="dd-bg-dawn" />
    <div className="dd-aurora" />
    <div className="dd-bg-stars">{/* existing star render */}</div>
    <div className="dd-bg-wisp" />
    <div className="dd-horizon-glow" />
    <div className="dd-bg-grain" />
    <div className="dd-vignette" />
</div>
```

Insert `<div className="dd-aurora" />` after `.dd-bg-dawn`.
Insert `<div className="dd-horizon-glow" />` after `.dd-bg-wisp`.
Insert `<div className="dd-vignette" />` after `.dd-bg-grain` (last child, so it layers on top).

- [ ] **Step 2: Add the aurora keyframe and CSS rule to `globals.css`**

Add after the `@keyframes dd-drift` block:

```css
@keyframes dd-aurora {
    0%,
    100% {
        opacity: 0;
        transform: translateX(-30px);
    }
    20%,
    80% {
        opacity: 1;
    }
    50% {
        transform: translateX(30px);
    }
}
```

Add a new rule after `.dd-bg-wisp { ... }`:

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
    pointer-events: none;
    opacity: 0;
}
@media (prefers-reduced-motion: no-preference) {
    .dd-aurora {
        animation: dd-aurora 14s ease-in-out 2s infinite;
    }
}
```

- [ ] **Step 3: Add the horizon glow keyframe and CSS rule to `globals.css`**

Add after `@keyframes dd-aurora`:

```css
@keyframes dd-horizon-breathe {
    0%,
    100% {
        opacity: 0.55;
    }
    50% {
        opacity: 0.9;
    }
}
```

Add after `.dd-aurora { ... }`:

```css
.dd-horizon-glow {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 35%;
    background: linear-gradient(0deg, rgba(229, 199, 162, 0.07) 0%, transparent 100%);
    pointer-events: none;
}
@media (prefers-reduced-motion: no-preference) {
    .dd-horizon-glow {
        animation: dd-horizon-breathe 11s ease-in-out 3s infinite;
    }
}
```

- [ ] **Step 4: Add the vignette keyframe and CSS rule to `globals.css`**

Add after `@keyframes dd-horizon-breathe`:

```css
@keyframes dd-vignette-breathe {
    0%,
    100% {
        opacity: 0.75;
    }
    50% {
        opacity: 1;
    }
}
```

Add after `.dd-horizon-glow { ... }`:

```css
.dd-vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse 72% 68% at 50% 50%, transparent 30%, rgba(7, 10, 22, 0.62) 100%);
}
@media (prefers-reduced-motion: no-preference) {
    .dd-vignette {
        animation: dd-vignette-breathe 9s ease-in-out 1s infinite;
    }
}
```

- [ ] **Step 5: Verify visually**

```bash
npm run dev
```

Open http://localhost:3000. You should see:

- A faint aurora band drifting across the mid-sky region (visible mostly at 20–80% of its 14s cycle — be patient, or increase the opacity temporarily to `rgba(91,107,168,0.5)` to test, then revert)
- A subtle warm glow at the bottom horizon that slowly breathes
- The corners slightly darker than before (the vignette softly frames the content)

- [ ] **Step 6: Commit**

```bash
git add components/Background.tsx app/globals.css
git commit -m "feat: add aurora band, horizon glow, and vignette to landing"
```

---

## Task 3 — Animate existing elements (grain, dawn bloom, dot, wordmark, button)

**Files:**

- Modify: `app/globals.css`

- [ ] **Step 1: Add the grain animation keyframe**

Add after `@keyframes dd-vignette-breathe`:

```css
@keyframes dd-grain {
    0% {
        background-position: 0 0;
    }
    20% {
        background-position: 60px 30px;
    }
    40% {
        background-position: 120px 80px;
    }
    60% {
        background-position: 20px 120px;
    }
    80% {
        background-position: 160px 50px;
    }
    100% {
        background-position: 0 0;
    }
}
```

Add the animation to `.dd-bg-grain` — find the existing rule and append inside `@media (prefers-reduced-motion: no-preference)`. The simplest approach is to add a new block after the existing `.dd-bg-grain` rule:

```css
@media (prefers-reduced-motion: no-preference) {
    .dd-bg-grain {
        animation: dd-grain 0.12s steps(1) infinite;
    }
}
```

- [ ] **Step 2: Add the dawn bloom breathing keyframe and animation**

Add after `@keyframes dd-grain`:

```css
@keyframes dd-dawn-breathe {
    0%,
    100% {
        opacity: 0.7;
    }
    50% {
        opacity: 1;
    }
}
```

Add after `.dd-bg-dawn { ... }`:

```css
@media (prefers-reduced-motion: no-preference) {
    .dd-bg-dawn {
        animation: dd-dawn-breathe 8s ease-in-out 1s infinite;
    }
}
```

- [ ] **Step 3: Add the accent dot breathing keyframe and animation**

Add after `@keyframes dd-dawn-breathe`:

```css
@keyframes dd-dot-breathe {
    0%,
    100% {
        color: var(--dawn);
        text-shadow: 0 0 8px rgba(229, 199, 162, 0.15);
    }
    50% {
        color: #f0d8b4;
        text-shadow: 0 0 24px rgba(229, 199, 162, 0.5);
    }
}
```

Scope the animation to `.dd-landing` only (to avoid interfering with the scene's lit-state color transition):

```css
@media (prefers-reduced-motion: no-preference) {
    .dd-landing .dd-dot {
        animation: dd-dot-breathe 6s ease-in-out infinite;
    }
}
```

- [ ] **Step 4: Add the wordmark glow keyframe and animation**

Add after `@keyframes dd-dot-breathe`:

```css
@keyframes dd-wordmark-glow {
    0%,
    100% {
        text-shadow:
            0 0 40px rgba(243, 236, 217, 0.04),
            0 0 80px rgba(229, 199, 162, 0.02);
    }
    50% {
        text-shadow:
            0 0 60px rgba(243, 236, 217, 0.14),
            0 0 130px rgba(229, 199, 162, 0.07);
    }
}
```

Add:

```css
@media (prefers-reduced-motion: no-preference) {
    .dd-hero-mark {
        animation: dd-wordmark-glow 9s ease-in-out 0.5s infinite;
    }
}
```

- [ ] **Step 5: Add the enter button ambient pulse keyframe and animation**

Add after `@keyframes dd-wordmark-glow`:

```css
@keyframes dd-btn-pulse {
    0%,
    100% {
        box-shadow:
            0 0 0 1px rgba(243, 236, 217, 0.16),
            0 8px 40px -8px rgba(247, 239, 219, 0.22);
    }
    50% {
        box-shadow:
            0 0 0 1px rgba(243, 236, 217, 0.28),
            0 12px 55px -6px rgba(247, 239, 219, 0.42);
    }
}
```

Add (pause on hover so it doesn't fight the hover box-shadow):

```css
@media (prefers-reduced-motion: no-preference) {
    .dd-enter {
        animation: dd-btn-pulse 5s ease-in-out 1.5s infinite;
    }
    .dd-enter:hover {
        animation-play-state: paused;
    }
}
```

- [ ] **Step 6: Verify visually**

```bash
npm run dev
```

Open http://localhost:3000. Observe over ~15 seconds:

- The grain overlay flickers like film stock
- The dawn radial bloom in the upper-right softly brightens and fades
- The accent `.` in `daydreamer.` pulses between warm cream and a slightly warmer, glowing tone
- The wordmark as a whole has a barely-perceptible luminous halo that breathes
- The enter button's glow ring gently pulses (hover it to confirm it pauses cleanly)

- [ ] **Step 7: Commit**

```bash
git add app/globals.css
git commit -m "feat: animate grain, dawn bloom, dot, wordmark, and button with ethereal pulses"
```

---

## Task 4 — Add shooting star spawner

**Files:**

- Modify: `components/Background.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add the `Shot` type and `shots` state to `Background.tsx`**

Add the `Shot` type directly below the `Star` type:

```ts
type Shot = {
    id: number;
    x: number;
    y: number;
    angle: number;
    length: number;
};
```

Add `shots` state inside the `Background` component, after the `mounted` state:

```ts
const [shots, setShots] = useState<Shot[]>([]);
```

- [ ] **Step 2: Add the spawner `useEffect` to `Background.tsx`**

Add after the existing `useEffect(() => setMounted(true), [])`:

```ts
useEffect(() => {
    if (!mounted) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const schedule = () => {
        const delay = 4000 + Math.random() * 10000;
        timeoutId = setTimeout(() => {
            const shot: Shot = {
                id: Date.now(),
                x: 10 + Math.random() * 70,
                y: 5 + Math.random() * 30,
                angle: -(20 + Math.random() * 30),
                length: 80 + Math.random() * 80,
            };
            setShots((prev) => [...prev, shot]);
            setTimeout(() => {
                setShots((prev) => prev.filter((s) => s.id !== shot.id));
            }, 1200);
            schedule();
        }, delay);
    };

    schedule();
    return () => clearTimeout(timeoutId);
}, [mounted]);
```

- [ ] **Step 3: Render shots inside `.dd-bg-stars` in `Background.tsx`**

Inside the `.dd-bg-stars` div, add the shots render after the `{stars.map(...)}` block:

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
                ["--shot-angle" as string]: `${sh.angle}deg`,
            }}
        />
    ));
}
```

- [ ] **Step 4: Add the shooting star keyframe and CSS rule to `globals.css`**

Add after `@keyframes dd-btn-pulse`:

```css
@keyframes dd-shoot {
    0% {
        opacity: 0;
        transform: rotate(var(--shot-angle)) scaleX(0);
    }
    15% {
        opacity: 0.9;
        transform: rotate(var(--shot-angle)) scaleX(0.4);
    }
    75% {
        opacity: 0.6;
        transform: rotate(var(--shot-angle)) scaleX(1);
    }
    100% {
        opacity: 0;
        transform: rotate(var(--shot-angle)) translateX(20px) scaleX(1);
    }
}
```

Add after the `.dd-bg-stars span { ... }` block:

```css
.dd-shoot {
    position: absolute;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(243, 236, 217, 0.9) 100%);
    transform-origin: left center;
    pointer-events: none;
    animation: dd-shoot 1.1s var(--ease-dream) forwards;
}
```

- [ ] **Step 5: Verify visually**

```bash
npm run dev
```

Open http://localhost:3000. Wait 4–14 seconds for the first shooting star to appear. It should streak diagonally across the upper portion of the sky, fading in quickly and fading out over ~1.1 seconds. Subsequent shots fire at random 4–14s intervals.

To test reduced-motion: in Chrome DevTools → Rendering → Emulate CSS media: `prefers-reduced-motion: reduce`. No shooting stars should appear.

- [ ] **Step 6: Commit**

```bash
git add components/Background.tsx app/globals.css
git commit -m "feat: add randomly-timed shooting star spawner"
```

---

## Task 5 — Final verification and production build check

- [ ] **Step 1: Run the full dev server and do a complete visual pass**

```bash
npm run dev
```

Checklist — observe over ~30 seconds at http://localhost:3000:

- [ ] Star field has visible size variation (tiny to moderately large)
- [ ] ~7 stars have a soft halo that pulses
- [ ] Aurora band drifts through mid-sky (faint — watch for it, it fades in/out over 14s)
- [ ] Warm horizon glow visible at bottom of sky
- [ ] Corners slightly darker (vignette)
- [ ] Grain flickers like film stock
- [ ] Dawn bloom in upper-right breathes
- [ ] The `.` in `daydreamer.` pulses warmly
- [ ] Wordmark has a barely-perceptible luminous drift
- [ ] Enter button glow pulses; pauses cleanly on hover; hover states still look correct
- [ ] Shooting star fires within 14s
- [ ] Click "enter" — scene transition still works correctly
- [ ] Click "into the light" — dark→light crossfade still works correctly
- [ ] Click back links — navigation still works correctly

- [ ] **Step 2: Test reduced motion**

In Chrome DevTools → Rendering tab → Emulate CSS media feature: `prefers-reduced-motion: reduce`.

Expected: all animations stop; content is visible in its final resting state; no shooting stars spawn.

- [ ] **Step 3: Run the production build**

```bash
npm run build
```

Expected: build completes with no errors or warnings about unused CSS / invalid keyframes.

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address any issues from final visual and build verification"
```
