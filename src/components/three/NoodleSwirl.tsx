"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import { clamp } from "@/lib/math";
import { createNoodleSwirlGeometry, type Quality } from "./cup/geometry";
import { getFoodAssets } from "./food/foodAssets";

/**
 * Long crimped noodle strands that unspool out of the cup and spiral upward.
 * Growth is a draw-range over the tube, so it reverses perfectly when scrubbing back
 * (it looks like the noodles are slurped back into the cup).
 */
export function NoodleSwirl({ quality }: { quality: Quality }) {
  const group = useRef<THREE.Group>(null);
  const count = quality === "high" ? 3 : 2;
  const geos = useMemo(() => Array.from({ length: count }, (_, i) => createNoodleSwirlGeometry(quality, i)), [count, quality]);
  const material = getFoodAssets(quality).materials.noodle;

  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);

  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    const swirl = sceneState.noodles.swirl;
    g.visible = swirl > 0.002;
    if (!g.visible) return;
    g.rotation.y += dt * 0.12;
    geos.forEach((geo, i) => {
      const tubular = geo.userData.tubular as number;
      const radial = geo.userData.radial as number;
      const local = clamp(swirl * 1.15 - i * 0.07);
      const segs = Math.floor(local * tubular);
      geo.setDrawRange(0, segs * radial * 6);
    });
    g.position.y = Math.sin(clock.elapsedTime * 0.7) * 0.03;
  });

  return (
    <group ref={group}>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} material={material} castShadow={quality === "high"} frustumCulled={false} />
      ))}
    </group>
  );
}
