"use client";

import { useState } from "react";
import Background from "./Background";
import TopBar from "./TopBar";
import Footer from "./Footer";

type Props = { onEnter: () => void };

export default function Landing({ onEnter }: Props) {
  const [leaving, setLeaving] = useState(false);

  const handle = () => {
    if (leaving) return;
    setLeaving(true);
    // Let the fade settle before swapping views.
    window.setTimeout(onEnter, 720);
  };

  return (
    <section className={"dd-landing" + (leaving ? " is-leaving" : "")}>
      <Background />
      <TopBar />

      <div className="dd-landing-center">
        <span className="dd-eyebrow dd-fade" style={{ ["--i" as string]: 0 }}>
          a quieter place to land
        </span>

        <h1 className="dd-wordmark dd-hero-mark dd-fade" style={{ ["--i" as string]: 1 }}>
          daydreamer<span className="dd-dot">.</span>
        </h1>

        <div className="dd-fade" style={{ ["--i" as string]: 2 }}>
          <button className="dd-btn dd-enter" type="button" onClick={handle} aria-label="enter">
            enter
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <Footer />
    </section>
  );
}
