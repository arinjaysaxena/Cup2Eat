import { Burst } from "../ui/Burst";

/** SCENE 02 — THE CUP TAKES OVER (pinned; camera circles the cup, type moves behind it) */
export function Takeover() {
  return (
    <section id="experience" className="scene" style={{ height: "260vh" }} aria-label="The cup takes over">
      <div className="pin">
        <p data-a="to-kicker" className="a-in kicker absolute left-[var(--gutter)] top-28 text-[var(--cream)]">
          <span className="text-[var(--yolk)]">02</span> — The cup takes over
        </p>
        <h2 className="sr-only">Small cup. Big personality.</h2>

        <div data-a="to-ann-1" className="a-in-l callout left-[6vw] md:left-[12vw] top-[26%]">
          <span className="txt max-w-[190px]">
            <b>Ramen Bistro</b>The range. Say it like you mean it.
          </span>
          <span className="line" />
          <span className="dot" />
        </div>

        <div data-a="to-ann-2" className="a-in-r callout right-[6vw] md:right-[13vw] top-[18%] flex-row-reverse text-right">
          <span className="txt max-w-[170px]">
            <b>The lid</b>Hold that thought.
          </span>
          <span className="line" />
          <span className="dot" />
        </div>

        <div data-a="to-ann-3" className="a-in-l callout left-[6vw] md:left-[14vw] bottom-[18%]">
          <span className="txt max-w-[200px]">
            <b>Japanese Miso</b>One cup. Three moods. Keep scrolling.
          </span>
          <span className="line" />
          <span className="dot" />
        </div>

        <Burst data-a="to-burst" className="a-pop" size={150} seed={21} fill="var(--cream)" style={{ right: "9vw", bottom: "14%" }}>
          Look
          <br />
          at it
          <br />
          go!
        </Burst>
      </div>
    </section>
  );
}
