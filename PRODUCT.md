# Product

## Register

brand

## Users

Visitors arriving at `austinxyz.lol` — likely late evening, on a phone or laptop, often via a referral or a link in a quiet conversation. The expected state of mind is curiosity without urgency: people who landed here are willing to slow down for a moment. They are not looking for features, signup forms, or content depth — they are looking for something to *feel*.

## Product Purpose

`daydreamer.` is a single-surface atmospheric landing: one quiet entrance, one button, one journey from a dark night sky into full daylight. It exists to make a feeling, not to convert. Success is measured in tone, not metrics: someone who lands here should pause, click `enter` because they want to, watch the half-light, click `into the light` because the night is finished, and then close the tab better than they opened it.

There is no signup, no roadmap, no product behind the door. The door **is** the product.

## Brand Personality

- **Three-word personality:** *hushed, dreamlike, expansive.*
- **Voice:** lowercase, poetic, unhurried — speaks the way you'd talk on a porch at midnight.
- **Emotional goal:** cold-but-warm. The visual temperature is night-cool; the feeling is summer-warm. The tagline says it directly: *cold, but it feels like a summer night.*
- **Trailing period in `daydreamer.` is sacred** — it signals a held breath, a full stop, the brand at rest.
- **Exactly one button per surface.** Minimalism is the product. Two buttons would break it.

## Anti-references

- **SaaS landing pages.** No hero-metric template, no three-column feature grids, no "trusted by" logo strips, no "get started free" energy. None of it.
- **Marketing voice.** No streamline / empower / supercharge / leverage / unleash / transform / seamless. No exclamation points. No emoji, anywhere.
- **Loud minimalism.** Black-and-white "luxury" sites that are quiet visually but shout typographically. We are quiet *all the way through.*
- **Generic dark-mode portfolio sites.** Pure navy + a single accent + condensed sans-serif is the saturated 2024 aesthetic; daydreamer specifically does the *opposite* (warm cream type, soft dawn glow, no condensed type, no neon accent).
- **Decorative scroll-jank.** Parallax layers, scroll-snap sections, sticky cards. The page is short and still.
- **Aurora as a palette.** The aurora colors (coral, aqua, indigo) exist as a whisper — one ribbon at a time, never a brights palette.

## Design Principles

1. **One thousand no's for every yes.** Every element earns its place by being load-bearing for the feeling. If removing it would not be missed, remove it.
2. **Hush, don't whisper-shout.** Tight clamp ceilings, gentle motion, ≤ -0.04em letter-spacing floor on display, no `text-transform: uppercase` outside the eyebrow and the button label. Quiet is a *consistent* property, not a style applied once.
3. **The journey is cold → warm.** The two views together are a literal sunrise. Every motion, color shift, and copy beat reinforces that arc. Going back is allowed (`back to the night`) but never the default direction.
4. **Imagery is a scene, not a stage.** The landscape is one persistent thing that transforms in place — the same mountains, forest, and coast, lit differently. Never cut to a new scene; that would break the feeling that you are *here.*
5. **The wordmark is the brand.** `daydreamer.` is the most expressive thing on the page; treat it like a logo, not type. The dot is the accent color and earns the single hue change.

## Accessibility & Inclusion

- **WCAG 2.1 AA minimum.** Body text ≥ 4.5:1 contrast against background; large text ≥ 3:1. Cream `#F3ECD9` on night `#101631` is 11.5:1 — well above. Muted cream (`rgba(243,236,217,0.62)`) on night is ~7.3:1 — still passes.
- **`prefers-reduced-motion: reduce`** disables every transition and animation: the staged entrance, the wisp drift, the star twinkle, the landscape crossfade. Reduced-motion users see both view states as instant transitions with no movement.
- **Keyboard accessible.** Both buttons are real `<button>` elements with visible focus rings (custom-styled to fit the cream-on-night palette). The return link is also a real button (not an anchor), since "back to the night / half-light" is a state change not a navigation.
- **Screen-reader semantics.** The hero landscape carries a meaningful `alt`. Decorative layers (the night scrim, the sun wash, the grain overlay) are `aria-hidden`. The wordmark `daydreamer.` is announced as a single word.
- **No animation traps.** The wisp loop and star twinkle are decorative and infinite but never reset on focus or hover — nothing that would make a screen reader announce repeating content.
