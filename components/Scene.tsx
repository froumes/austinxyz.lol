"use client";

import { useState } from "react";

type Props = { onBack: () => void };

export default function Scene({ onBack }: Props) {
  const [lit, setLit] = useState(false);

  return (
    <section className={"dd-scene" + (lit ? " is-lit" : "")}>
      <img
        className="dd-scene-img"
        src="/hero-landscape.jpg"
        alt="daydreamer — mountains, a quiet forest, and a coast under a still sky"
      />
      <div className="dd-scene-dark" aria-hidden="true" />
      <div className="dd-scene-sunset" aria-hidden="true" />
      <div className="dd-scene-sun" aria-hidden="true" />

      <div className="dd-scene-top">
        <span className="dd-wordmark dd-scene-mark">
          daydreamer<span className="dd-dot">.</span>
        </span>
      </div>

      <div className="dd-scene-center">
        {!lit ? (
          <div className="dd-scene-block">
            <span className="dd-eyebrow dd-scene-eyebrow">you&apos;re here now</span>
            <h2 className="dd-scene-line">stay a while in the half-light.</h2>
            <button
              className="dd-btn dd-light-btn"
              type="button"
              onClick={() => setLit(true)}
              aria-label="into the light"
            >
              into the light
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
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="dd-scene-block">
            <span className="dd-eyebrow dd-scene-eyebrow dd-scene-eyebrow-lit">good morning</span>
            <h2 className="dd-scene-line dd-scene-line-lit">the light finds you.</h2>
          </div>
        )}
      </div>

      <div className="dd-scene-bottom">
        <button
          className={"dd-textlink" + (lit ? " dd-textlink-lit" : "")}
          type="button"
          onClick={() => (lit ? setLit(false) : onBack())}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          {lit ? "back to the half-light" : "back to the night"}
        </button>
      </div>
    </section>
  );
}
