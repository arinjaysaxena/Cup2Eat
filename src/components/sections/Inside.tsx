import { brand, getVariant, HERO_VARIANT } from "@/content/brand";

const DOTS: Record<string, string> = {
  "Wavy noodles": "#f1c46a",
  Tofu: "#f6ead0",
  "Sweet corn": "#ffc21e",
  "Spring onion": "#4fb238",
  "Bok choy": "#8fd05a",
  Chilli: "#d3221a",
};

// tag positions around the frame (desktop / mobile friendly percentages)
const POS = [
  { left: "8%", top: "58%" },
  { right: "10%", top: "22%" },
  { right: "16%", top: "62%" },
  { left: "34%", top: "80%" },
  { right: "30%", top: "84%" },
  { left: "16%", top: "76%" },
];

/** SCENE 04 — THE WORLD INSIDE THE CUP */
export function Inside() {
  const v = getVariant(HERO_VARIANT);
  return (
    <section id="inside" className="scene" style={{ height: "360vh" }} aria-labelledby="inside-title">
      <div className="pin">
        <div data-a="in-head" className="a-in absolute left-[var(--gutter)] top-[16vh] max-w-[90vw]">
          <p className="kicker text-[var(--ink)]">
            <span className="text-[var(--cream)]">04</span> — The world inside the cup
          </p>
          <h2 id="inside-title" className="display mt-4 text-[clamp(48px,7.4vw,128px)]">
            {brand.inside.headline.map((l, i) => (
              <span key={l} className={`block lean comic ${i === 2 ? "comic-yolk" : ""}`}>
                {l}
              </span>
            ))}
          </h2>
        </div>

        <ul className="tag-list" aria-label="Ingredients as pictured on the pack">
          {v.packArtIngredients.map((name, i) => (
            <li key={name} data-a="in-tag" className="tag" style={POS[i]}>
              <i style={{ background: DOTS[name] ?? "#fff" }} />
              {name}
              <sup>†</sup>
            </li>
          ))}
        </ul>

        <p data-a="in-note" className="a-in mono-note absolute left-[var(--gutter)] bottom-6 max-w-[420px] text-[var(--ink)]">
          † Callouts mirror the illustrated Ramen Bistro pack art. Final ingredient list to be supplied by Cup2Eat.{" "}
          <span className="placeholder-tag">Placeholder</span>
        </p>

        <p data-a="in-settle" className="a-in hand absolute left-0 right-0 top-[17vh] mx-auto text-center text-[clamp(26px,3vw,44px)] text-[var(--cream)] w-[90vw]">
          …and back in the cup it all goes. Lid on.
        </p>
      </div>
    </section>
  );
}
