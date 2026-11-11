"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { getVariant, HERO_VARIANT } from "@/content/brand";

// The 3D bundle is code-split and only requested once we know WebGL is available.
const Stage = dynamic(() => import("../three/Stage"), { ssr: false });

/** Visually coherent fallback for devices without WebGL: the same generated pack art on a 2.5D cup. */
function StaticCup() {
  const [poster, setPoster] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const { ensureFontsLoaded, getCupTextures } = await import("../three/cup/packaging");
      await ensureFontsLoaded();
      if (alive) setPoster(getCupTextures(getVariant(HERO_VARIANT), "low").posterDataUrl);
    })();
    return () => {
      alive = false;
    };
  }, []);
  if (!poster) return null;
  return (
    <div className="static-cup bob" style={{ right: "9vw", top: "22vh", width: "min(30vw, 360px)" }} aria-hidden>
      <div className="lid" />
      <div className="body" style={{ backgroundImage: `url(${poster})` }} />
    </div>
  );
}

export function StageMount() {
  const webgl = useApp((s) => s.webgl);
  if (webgl === null) return null;
  return <div className="layer layer-stage">{webgl ? <Stage /> : <StaticCup />}</div>;
}
