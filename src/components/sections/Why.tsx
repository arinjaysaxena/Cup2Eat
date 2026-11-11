import { brand } from "@/content/brand";
import { Burst } from "../ui/Burst";

/**
 * SCENE 06 — WHY CUP2EAT?
 * The four benefit claims from the brand visual, each with its own composition while the
 * 3D cup changes pose for every panel (driven by the master timeline).
 */
export function Why() {
  const [minutes, taste, ingredients, go] = brand.benefits;
  return (
    <section id="why" className="scene" aria-labelledby="why-title">
      <h2 id="why-title" className="sr-only">
        Why Cup2Eat?
      </h2>

      {/* 01 — Ready in minutes: cup left, dial right */}
      <article id="why-0" className="why-panel px-[var(--gutter)]">
        <div className="ml-auto w-full md:w-[52%] relative pt-[30vh] md:pt-0">
          <p className="kicker text-[var(--yolk)]">01 · {minutes.kicker}</p>
          <div className="relative mt-4">
            <svg className="dial absolute -right-2 md:right-[6%] -top-[30%] opacity-90" viewBox="0 0 120 120" aria-hidden>
              <circle cx="60" cy="64" r="48" fill="none" stroke="rgba(255,243,214,.15)" strokeWidth="10" />
              <circle
                data-a="why-dial"
                cx="60"
                cy="64"
                r="48"
                fill="none"
                stroke="var(--yolk)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="301.6"
                transform="rotate(-90 60 64)"
              />
              <rect x="52" y="2" width="16" height="9" rx="3" fill="var(--yolk)" />
              <line x1="60" y1="64" x2="60" y2="32" stroke="var(--cream)" strokeWidth="5" strokeLinecap="round" />
              <circle cx="60" cy="64" r="6" fill="var(--cream)" />
            </svg>
            <h3 className="display relative text-[clamp(56px,9vw,160px)]">
              <span className="lean comic block">{minutes.title[0]}</span>
              <span className="lean comic comic-yolk block">{minutes.title[1]}.</span>
            </h3>
          </div>
          <p className="mono-note mt-6 text-[var(--cream)]">
            Official preparation guidance to be supplied by Cup2Eat. <span className="placeholder-tag">Placeholder</span>
          </p>
        </div>
      </article>

      {/* 02 — Delicious taste: type left, cup right with orbiting pieces */}
      <article id="why-1" className="why-panel px-[var(--gutter)]">
        <div className="w-full md:w-[50%] relative pt-[30vh] md:pt-0">
          <p className="kicker text-[var(--yolk)]">02 · {taste.kicker}</p>
          <h3 className="display mt-4 text-[clamp(60px,10vw,180px)]">
            <span className="lean comic block">{taste.title[0]}</span>
            <span className="lean block stroke-text" style={{ color: "var(--yolk)", WebkitTextStroke: "3px var(--yolk)" }}>
              {taste.title[1]}.
            </span>
          </h3>
          <Burst size={140} seed={31} points={12} style={{ right: "6%", top: "-42%", rotate: "-10deg" }} className="hidden md:grid">
            <span style={{ fontSize: "1.6em" }}>Slurp!</span>
          </Burst>
        </div>
      </article>

      {/* 03 — Premium ingredients: title split around the cup */}
      <article id="why-2" className="why-panel flex-col justify-between py-[16vh] px-[var(--gutter)] text-center">
        <div
          data-a="why-2-ring"
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[rgba(255,194,26,.35)]"
          style={{ width: "min(70vw, 70vh)", height: "min(70vw, 70vh)" }}
        />
        <div>
          <p className="kicker text-[var(--yolk)]">03 · {ingredients.kicker}</p>
          <h3 className="display comic mt-3 text-[clamp(56px,11vw,200px)]">
            <span className="lean">{ingredients.title[0]}</span>
          </h3>
        </div>
        <div>
          <h3 className="display comic comic-yolk text-[clamp(44px,8.5vw,160px)]" aria-hidden>
            <span className="lean">{ingredients.title[1]}.</span>
          </h3>
          <p className="mono-note mt-4 text-[var(--cream)]">
            Ingredient specifics to be supplied by Cup2Eat. <span className="placeholder-tag">Placeholder</span>
          </p>
        </div>
      </article>

      {/* 04 — On-the-go goodness: speed lines + marquee, the cup takes off */}
      <article id="why-3" className="why-panel flex-col justify-center">
        <div className="speedlines" aria-hidden />
        <p className="kicker text-[var(--yolk)] relative px-[var(--gutter)] self-start">04 · {go.kicker}</p>
        <div data-a="why-3-marquee" className="marquee display relative mt-4" aria-hidden style={{ marginLeft: "10vw" }}>
          <span className="lean comic">On-the-go</span> <span className="lean stroke-text" style={{ color: "var(--yolk)" }}>goodness</span>{" "}
          <span className="lean comic">★ On-the-go</span>
        </div>
        <h3 className="sr-only">
          {go.title[0]} {go.title[1]}
        </h3>
        <p className="hand relative text-[clamp(24px,2.6vw,38px)] mt-6 px-[var(--gutter)] self-end -rotate-2">Wherever the day takes you.</p>
      </article>
    </section>
  );
}
