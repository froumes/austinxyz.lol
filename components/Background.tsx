"use client";

import { useEffect, useMemo, useState } from "react";

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

type Shot = {
  id: number;
  x: number;
  y: number;
  angle: number;
  length: number;
};

// Deterministic LCG so SSR and CSR render the same star field
// (avoids hydration mismatches without a useEffect detour).
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

export default function Background() {
  // Render stars only after mount. SSR/SSG paints empty starfield, then
  // hydration adds them. Twinkle animation masks the late arrival.
  const [mounted, setMounted] = useState(false);
  const [shots, setShots] = useState<Shot[]>([]);
  useEffect(() => setMounted(true), []);
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
  const stars = useMemo(() => (mounted ? seededStars(46, 1337) : []), [mounted]);

  return (
    <div className="dd-bg" aria-hidden="true">
      <div className="dd-bg-night" />
      <div className="dd-bg-dawn" />
      <div className="dd-aurora" />
      <div className="dd-bg-stars">
        {stars.map((st) =>
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
        )}
        {shots.map((sh) => (
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
        ))}
      </div>
      <div className="dd-bg-wisp" />
      <div className="dd-horizon-glow" />
      <div className="dd-bg-grain" />
      <div className="dd-vignette" />
    </div>
  );
}
