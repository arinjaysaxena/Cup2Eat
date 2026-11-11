"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, Stats } from "@react-three/drei";
import * as THREE from "three";
import { appStore, useApp } from "@/lib/store";
import { CameraRig } from "./CameraRig";
import { CupShadow, Lighting } from "./Lighting";
import { HeroCup } from "./HeroCup";
import { AmbientFood } from "./AmbientFood";
import { Particles } from "./Particles";
import { Collection } from "./Collection";
import { disposeAllCupTextures, ensureFontsLoaded } from "./cup/packaging";
import { disposeCupGeometries } from "./cup/CupModel";
import { disposeFoodAssets } from "./food/foodAssets";

/** Flags the experience as ready after the first frames have rendered with real assets. */
function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current++;
    if (frames.current === 3) appStore.set({ ready: true });
  });
  return null;
}

/** Dev utility: /?export=glb downloads the procedural hero cup as a GLB (geometry, UVs, PBR, textures). */
function GlbExporter() {
  const scene = useThree((s) => s.scene);
  const ready = useApp((s) => s.ready);
  useEffect(() => {
    if (!ready || new URLSearchParams(window.location.search).get("export") !== "glb") return;
    let cancelled = false;
    (async () => {
      const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
      const cup = scene.getObjectByName("Cup2Eat_Cup");
      if (!cup || cancelled) return;
      const clone = cup.clone(true);
      clone.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) o.visible = true;
      });
      const result = await new GLTFExporter().parseAsync(clone, { binary: true, maxTextureSize: 4096 });
      const blob = new Blob([result as ArrayBuffer], { type: "model/gltf-binary" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "cup2eat-ramen-bistro-japanese-miso.glb";
      a.click();
      (window as unknown as { __glbExported?: boolean }).__glbExported = true;
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, scene]);
  return null;
}

function SceneContent({ high, reduced, isMobile }: { high: boolean; reduced: boolean; isMobile: boolean }) {
  const q = high ? "high" : "low";
  return (
    <>
      <HeroCup quality={q} reduced={reduced} />
      <Collection quality={q} isMobile={isMobile} />
      <AmbientFood quality={q} />
      <Particles count={high ? 700 : 220} reduced={reduced} />
      <CupShadow high={high} />
      <ReadySignal />
      <GlbExporter />
    </>
  );
}

export default function Stage() {
  const tier = useApp((s) => s.tier);
  const isMobile = useApp((s) => s.isMobile);
  const reduced = useApp((s) => s.reducedMotion);
  const high = tier === "high";
  const maxDpr = high ? 2 : 1.5;
  const [dpr, setDpr] = useState(high ? 1.75 : 1.25);
  const [fontsReady, setFontsReady] = useState(false);
  const debug = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug");

  useEffect(() => {
    let alive = true;
    ensureFontsLoaded().then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
      disposeAllCupTextures();
      disposeCupGeometries();
      disposeFoodAssets();
    };
  }, []);

  return (
    <Canvas
      className="stage-canvas"
      dpr={dpr}
      shadows={high ? "soft" : false}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: debug }}
      camera={{ fov: 30, near: 0.1, far: 80, position: [0, 0.6, 6.4] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
        gl.setClearColor(0x000000, 0);
      }}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
        onFallback={() => setDpr(1)}
      />
      <CameraRig reduced={reduced} />
      <Lighting high={high} />
      {fontsReady && (
        <Suspense fallback={null}>
          <SceneContent high={high} reduced={reduced} isMobile={isMobile} />
        </Suspense>
      )}
      {debug && <Stats />}
    </Canvas>
  );
}
