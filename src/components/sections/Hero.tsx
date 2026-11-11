"use client";
import { brand } from "@/content/brand";
import { scrollToScene } from "@/lib/scroll";
import { Burst } from "../ui/Burst";

/** SCENE 01 — THE ARRIVAL */
export function Hero() {
  const [l1, l2, l3] = brand.hero.headline;
  return (
    <section id="home" className="scene" style={{ height: "100vh" }} aria-labelledby="hero-title">
      <div data-a="hero" className="relative h-full flex items-stretch md:items-center px-[var(--gutter)] pt-24 pb-20 md:pt-10 md:pb-0">
        <div className="max-w-[min(640px,92vw)] flex flex-col justify-between md:block">
          <div>
          <p className="hero-line kicker text-[var(--yolk)] flex items-center gap-3">
            <span className="w-8 h-[2px] bg-[var(--yolk)]" />
            {brand.hero.eyebrow}
          </p>
          <h1 id="hero-title" className="display mt-4 md:mt-5 text-[clamp(50px,8.6vw,148px)]">
            <span className="hero-line block">
              <span className="lean comic">{l1}</span>
            </span>
            <span className="hero-line block">
              <span className="lean comic">{l2}</span>
            </span>
            <span className="hero-line block">
              <span className="lean comic comic-yolk">{l3}</span>
            </span>
          </h1>
          </div>
          <div>
          <p className="hero-line hand mt-0 md:mt-7 max-w-[400px] text-[clamp(20px,2.1vw,31px)] leading-[1.05] -rotate-3 text-[var(--cream)]">
            {brand.hero.support}
            <svg viewBox="0 0 220 14" className="block w-40 mt-2" aria-hidden>
              <path d="M2 9 Q 40 2 80 8 T 160 7 T 218 5" stroke="var(--yolk)" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
          </p>
          <div className="hero-line mt-5 md:mt-9 flex flex-wrap gap-4 items-center">
            <a
              href="#experience"
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                scrollToScene("experience");
              }}
            >
              {brand.hero.cta} <span className="arrow">↓</span>
            </a>
            <a
              href="#products"
              className="btn btn-ghost hidden md:inline-flex"
              onClick={(e) => {
                e.preventDefault();
                scrollToScene("products");
              }}
            >
              See the range <span className="arrow">→</span>
            </a>
          </div>
          </div>
        </div>

        <Burst className="hero-line hidden md:grid" size={165} seed={8} style={{ right: "4vw", top: "15%", rotate: "8deg" }}>
          Small cup.
          <br />
          <span style={{ fontSize: "1.35em" }}>Big</span>
          <br />
          personality.
        </Burst>
        <p className="hero-line hidden md:flex absolute items-center gap-2 kicker !text-[10px] text-[var(--cream)] opacity-70" style={{ right: "26vw", bottom: "12vh" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 3v6h6" />
          </svg>
          Drag to spin the cup
        </p>
      </div>
    </section>
  );
}
