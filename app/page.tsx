"use client";

import { useState } from "react";
import Landing from "@/components/Landing";
import Scene from "@/components/Scene";

type View = "landing" | "scene";

export default function Page() {
  const [view, setView] = useState<View>("landing");

  return (
    <main className="dd-app">
      {view === "landing" ? (
        <Landing onEnter={() => setView("scene")} />
      ) : (
        <Scene onBack={() => setView("landing")} />
      )}
    </main>
  );
}
