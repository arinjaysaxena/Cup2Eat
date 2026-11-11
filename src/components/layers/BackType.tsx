import { brand } from "@/content/brand";

/**
 * Typography that lives BEHIND the 3D canvas, so the cup passes in front of it.
 * Opacity/position are owned by the master timeline ([data-b]).
 */
export function BackType() {
  return (
    <div className="layer layer-back" aria-hidden>
      <div data-b="to">
        <div data-b="to-1" className="backline display stroke-text" style={{ top: "14%", left: "18%", color: "var(--cream)" }}>
          {brand.takeover.headline[0]}
        </div>
        <div data-b="to-2" className="backline display comic comic-yolk" style={{ top: "54%", left: "-30%" }}>
          {brand.takeover.headline[1]}
        </div>
      </div>
      <div data-b="pr">
        <div className="backline display stroke-text" style={{ top: "30%", left: "50%", translate: "-50% 0", color: "rgba(20,14,11,.16)" }}>
          {brand.range}
        </div>
      </div>
      <div data-b="fi" style={{ display: "grid", placeItems: "center" }}>
        <div data-b="fi-move" style={{ display: "grid", placeItems: "center" }}>
        <div className="display comic" style={{ fontSize: "clamp(80px, 16.5vw, 300px)", marginTop: "4vh", textTransform: "none" }}>
          <span className="lean">
            Cup<span style={{ color: "var(--yolk)" }}>2</span>Eat.
          </span>
        </div>
        </div>
      </div>
    </div>
  );
}
