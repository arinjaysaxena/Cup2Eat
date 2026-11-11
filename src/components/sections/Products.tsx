"use client";
import { useEffect, useState } from "react";
import { brand, variants } from "@/content/brand";
import { appStore, useApp } from "@/lib/store";
import { SPACING } from "@/lib/constants";

const DESKTOP_DIST = 10.2;
const FOV = 30;

/** Horizontal offset (as % of viewport width) between cups, matching the 3D camera exactly. */
function useSlotOffset() {
  const [pct, setPct] = useState(28);
  useEffect(() => {
    const calc = () => {
      const aspect = window.innerWidth / window.innerHeight;
      const fit = aspect < 1 ? 1 + (1 - aspect) * 1.15 : aspect < 1.35 ? 1 + (1.35 - aspect) * 0.4 : 1;
      const visibleW = 2 * DESKTOP_DIST * fit * Math.tan(((FOV / 2) * Math.PI) / 180) * aspect;
      setPct((SPACING / visibleW) * 100);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return pct;
}

/** SCENE 05 — THE PRODUCT COLLECTION (3D cups on plinths, HTML hit-areas + info aligned to them) */
export function Products() {
  const focus = useApp((s) => s.focus);
  const focusActive = useApp((s) => s.focusActive);
  const isMobile = useApp((s) => s.isMobile);
  const offset = useSlotOffset();
  const current = variants[focus];

  const select = (i: number) => appStore.set({ focus: i, focusActive: true });

  return (
    <section id="products" className="scene" style={{ height: "280vh" }} aria-labelledby="products-title">
      <div className="pin text-[var(--ink)]">
        <div data-a="pr-head" className="a-in absolute left-[var(--gutter)] top-24 md:top-28">
          <p className="kicker">
            <span className="text-[var(--ember)]">05</span> — The {brand.range} range
          </p>
          <h2 id="products-title" className="display mt-3 text-[clamp(36px,4.3vw,72px)]">
            <span className="lean block">
              {brand.collection.headline[0]} {brand.collection.headline[1]}
            </span>
            <span className="lean block text-[var(--ember)]">{brand.collection.headline[2]}</span>
          </h2>
          <p className="hand text-2xl mt-2 -rotate-2 opacity-80">{isMobile ? "Tap a flavour to meet it" : "Hover a cup to meet it"}</p>
        </div>

        <div data-a="pr-slots" className="a-in absolute inset-0">
          {!isMobile ? (
            <div className="absolute inset-0" onMouseLeave={() => appStore.set({ focusActive: false })} role="group" aria-label="Choose a flavour">
              {variants.map((v, i) => (
                <button
                  key={v.id}
                  className="slot"
                  style={{ left: `${50 + (i - 1) * offset}%`, top: "30%" }}
                  onMouseEnter={() => select(i)}
                  onFocus={() => select(i)}
                  onClick={() => select(i)}
                  aria-pressed={focusActive && focus === i}
                  aria-label={`${v.range} ${v.flavour}`}
                >
                  <span className="kicker opacity-70">{v.range}</span>
                  <span className="display name mt-1">{v.flavour}</span>
                  <span className="meta mt-3 text-sm max-w-[240px] leading-snug">
                    <span className={v.descriptionIsPlaceholder ? "placeholder-copy" : ""}>{v.description}</span>
                    {v.descriptionIsPlaceholder && (
                      <>
                        {" "}
                        <span className="placeholder-tag">Copy TBC</span>
                      </>
                    )}
                  </span>
                  <span className="chip mt-4" style={{ borderColor: "var(--ink)" }}>
                    <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ background: v.palette.accent, outline: "1.5px solid var(--ink)" }} />
                    {focusActive && focus === i ? "Meet the cup" : "Explore"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="absolute inset-x-0 bottom-0 px-[var(--gutter)] pb-8 pt-6 text-center" style={{ background: "linear-gradient(transparent, rgba(245,231,204,.95) 30%)" }}>
              <div className="flex items-center justify-between gap-3">
                <button
                  className="w-12 h-12 rounded-full border-2 border-[var(--ink)] text-xl"
                  onClick={() => select((focus + variants.length - 1) % variants.length)}
                  aria-label="Previous flavour"
                >
                  ←
                </button>
                <div aria-live="polite">
                  <p className="kicker opacity-70">{current.range}</p>
                  <p className="display text-[34px] leading-none mt-1">{current.flavour}</p>
                </div>
                <button
                  className="w-12 h-12 rounded-full border-2 border-[var(--ink)] text-xl"
                  onClick={() => select((focus + 1) % variants.length)}
                  aria-label="Next flavour"
                >
                  →
                </button>
              </div>
              <p className="text-sm mt-3">
                <span className="placeholder-copy">{current.description}</span> <span className="placeholder-tag">Copy TBC</span>
              </p>
              <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Flavours">
                {variants.map((v, i) => (
                  <button
                    key={v.id}
                    role="tab"
                    aria-selected={focus === i}
                    aria-label={v.flavour}
                    onClick={() => select(i)}
                    className="h-3 rounded-full border-2 border-[var(--ink)] transition-all"
                    style={{ width: focus === i ? 34 : 12, background: focus === i ? v.palette.accent : "transparent" }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
