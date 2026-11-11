"use client";
import { brand, variants } from "@/content/brand";
import { scrollToScene } from "@/lib/scroll";

/** SCENE 07 — THE FINAL BRAND MOMENT (giant wordmark lives behind the cup in BackType) */
export function Finale() {
  return (
    <section id="contact" className="scene" style={{ height: "220vh" }} aria-labelledby="finale-title">
      <div className="pin flex flex-col items-center justify-between pt-28 pb-[9vh] px-[var(--gutter)] text-center">
        <div>
          <p data-a="fi-kicker" className="a-in kicker text-[var(--cream)]">
            {brand.range} · {variants.map((v) => v.flavour).join(" · ")}
          </p>
          <h2 id="finale-title" data-a="fi-head" className="a-in display comic mt-4 text-[clamp(40px,6vw,104px)]">
            <span className="lean">{brand.finale.headline[0]}</span>
            <span className="sr-only"> {brand.finale.headline[1]}</span>
          </h2>
        </div>
        <div data-a="fi-cta" className="a-in flex flex-col items-center gap-4">
          <a
            href="#products"
            className="btn"
            onClick={(e) => {
              e.preventDefault();
              scrollToScene("products");
            }}
          >
            {brand.finale.cta} <span className="arrow">→</span>
          </a>
          <p className="hand text-2xl text-[var(--cream)] opacity-90">{brand.hero.support}</p>
        </div>
      </div>
    </section>
  );
}
