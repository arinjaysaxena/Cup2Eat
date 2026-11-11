import { brand } from "@/content/brand";
import { Burst } from "../ui/Burst";

const Step = ({ n, title, note, a }: { n: string; title: string; note: string; a: string }) => (
  <div data-a={a} className="a-in absolute left-[var(--gutter)] bottom-[12vh] max-w-[80vw]">
    <p className="kicker text-[var(--yolk)]">{n} / 03</p>
    <p className="display comic text-[clamp(40px,6vw,92px)] mt-2">
      <span className="lean">{title}</span>
    </p>
    <p className="hand text-[clamp(20px,2vw,28px)] mt-2 opacity-90">{note}</p>
  </div>
);

/** SCENE 03 — THE BIG REVEAL (pinned; lid lifts, separates, camera dives into the cup) */
export function Reveal() {
  return (
    <section id="reveal" className="scene" style={{ height: "340vh" }} aria-label="The big reveal">
      <div className="pin">
        <h2 className="sr-only">The big reveal</h2>
        <Step a="rv-1" n="01" title="Easy does it" note="Fingers on the tab…" />
        <Burst data-a="rv-pop" className="a-pop" size={170} points={16} seed={4} style={{ left: "54%", top: "16%" }}>
          <span style={{ fontSize: "2.1em" }}>Pop!</span>
        </Burst>
        <Step a="rv-2" n="02" title="Lid, away" note="Mind the steam." />
        <Step a="rv-3" n="03" title="Hello, noodles" note="Now that's a view." />
        <div data-a="rv-head" className="a-in absolute right-[var(--gutter)] top-[22vh] text-right">
          <p className="display comic text-[clamp(44px,7vw,120px)]">
            <span className="lean block">{brand.reveal.headline[0]}</span>
            <span className="lean block comic-yolk">{brand.reveal.headline[1]}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
