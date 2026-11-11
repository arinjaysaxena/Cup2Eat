"use client";
import { useEffect, useRef, useState } from "react";
import { SCENES } from "@/lib/sceneController";
import { scrollToScene } from "@/lib/scroll";
import { useApp } from "@/lib/store";

/** Scene index + scroll progress (right edge) and the hero scroll cue. */
export function Rail() {
  const scene = useApp((s) => s.scene);
  const bar = useRef<HTMLDivElement>(null);
  const [atTop, setAtTop] = useState(true);
  const light = scene === "products";

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (bar.current) bar.current.style.transform = `scaleY(${p})`;
      setAtTop(window.scrollY < 60);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        aria-label="Scenes"
        className="rail fixed right-[var(--gutter)] top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end transition-colors duration-500"
        style={{ color: light ? "var(--ink)" : "var(--cream)" }}
      >
        <div className="absolute -right-4 top-0 bottom-0 w-[2px] bg-current opacity-15">
          <div ref={bar} className="w-full h-full origin-top bg-[var(--yolk)]" style={{ transform: "scaleY(0)" }} />
        </div>
        {SCENES.map((s, i) => (
          <button key={s.id} onClick={() => scrollToScene(s.id)} aria-current={scene === s.id} aria-label={`Scene ${i + 1}: ${s.label}`}>
            <span className="lbl">
              {String(i + 1).padStart(2, "0")} · {s.label}
            </span>
            <span className="tick" />
          </button>
        ))}
      </nav>

      <button
        onClick={() => scrollToScene("experience")}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden md:flex flex-col items-center gap-2 text-[var(--cream)] transition-opacity duration-500"
        style={{ opacity: atTop ? 1 : 0, pointerEvents: atTop ? "auto" : "none" }}
        aria-label="Scroll to begin the experience"
      >
        <span className="kicker !text-[10px]">Scroll</span>
        <span className="w-[22px] h-[34px] rounded-full border-2 border-current grid justify-center pt-[6px]">
          <span className="w-[3px] h-[7px] rounded-full bg-[var(--yolk)] bob" />
        </span>
      </button>
    </>
  );
}
