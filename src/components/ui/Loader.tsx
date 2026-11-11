"use client";
import { useEffect, useState } from "react";
import { appStore, useApp } from "@/lib/store";
import { Wordmark } from "./Burst";

/** First-paint cover while fonts, generated packaging and the first 3D frames get ready. */
export function Loader() {
  const ready = useApp((s) => s.ready);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // never trap people behind the loader
    const t = setTimeout(() => appStore.set({ ready: true }), 9000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(t);
  }, [ready]);

  if (gone) return null;
  return (
    <div className={`loader ${ready ? "done" : ""}`} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-6">
        <Wordmark size={64} />
        <div className="w-44 h-[3px] bg-[rgba(255,243,214,.15)] overflow-hidden rounded-full">
          <div className="h-full w-1/3 bg-[var(--yolk)] rounded-full loader-bar" />
        </div>
        <p className="hand text-2xl text-[var(--cream)] opacity-80">Heating things up…</p>
      </div>
    </div>
  );
}
