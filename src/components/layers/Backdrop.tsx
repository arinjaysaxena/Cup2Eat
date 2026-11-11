/**
 * Art-directed background stack. Each scene has its own lit environment; the master
 * timeline cross-fades them ([data-bg]) so the world changes colour with the story.
 */
export function Backdrop() {
  return (
    <div className="layer layer-bg" aria-hidden>
      <div data-bg="arrival" className="bg-arrival halftone">
        <div className="rays" style={{ left: "64%", top: "46%", opacity: 0.55 }} />
      </div>
      <div data-bg="takeover" className="bg-takeover halftone">
        <div className="rays" style={{ opacity: 0.9 }} />
      </div>
      <div data-bg="reveal" className="bg-reveal" />
      <div data-bg="world" className="bg-world halftone">
        <div className="blob" style={{ width: "38vmax", height: "38vmax", left: "-8vmax", top: "48%", background: "#ffd34a", opacity: 0.55 }} />
        <div className="blob" style={{ width: "26vmax", height: "26vmax", right: "-6vmax", top: "-6vmax", background: "#ff4f17", opacity: 0.5 }} />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: 0.18 }}>
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M -5 ${12 + i * 10} Q 25 ${4 + i * 10} 50 ${12 + i * 10} T 105 ${12 + i * 10}`}
              stroke="#fff3d6"
              strokeWidth="0.35"
              fill="none"
            />
          ))}
        </svg>
      </div>
      <div data-bg="gallery" className="bg-gallery halftone" />
      <div data-bg="why" className="bg-why" />
      <div data-bg="finale" className="bg-finale halftone">
        <div className="rays" style={{ top: "44%", opacity: 0.8 }} />
      </div>
    </div>
  );
}
