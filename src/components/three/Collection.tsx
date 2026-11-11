"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { variants } from "@/content/brand";
import { interaction, sceneState } from "@/lib/sceneState";
import { appStore } from "@/lib/store";
import { clamp, damp, easeOutCubic, lerp } from "@/lib/math";
import { CupModel } from "./cup/CupModel";
import { CUP, type Quality } from "./cup/geometry";
import { SPACING } from "@/lib/constants";

/**
 * The product gallery: the hero cup (centre, driven by HeroCup) is joined by the other
 * variants, each standing on a lacquered plinth like a collectible.
 * Desktop: hover focuses a cup. Mobile: the line-up becomes a carousel.
 */

const plinthGeo = new THREE.CylinderGeometry(0.98, 1.04, 4, 64, 1, false);
const ringGeo = new THREE.TorusGeometry(0.985, 0.018, 8, 96);
ringGeo.rotateX(Math.PI / 2);

function SideCup({ index, quality }: { index: 0 | 2; quality: Quality }) {
  const v = variants[index];
  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const contents = useRef<THREE.Group>(null);
  const focus = useRef(0);
  const angle = useRef(0);
  const side = index === 0 ? -1 : 1;

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const s = sceneState.collection.show;
    const r = root.current;
    if (!r || !spin.current) return;
    r.visible = s > 0.001;
    if (!r.visible) return;
    const local = easeOutCubic(clamp(s * 1.5 - (index === 0 ? 0 : 0.35)));
    const app = appStore.get();
    const f = app.focus === index && (app.focusActive || app.isMobile) && s > 0.6 ? 1 : 0;
    focus.current = damp(focus.current, f, 5, dt);
    const c = sceneState.cup;
    const baseX = side * SPACING + interaction.carousel;
    r.position.set(
      lerp(baseX + side * 6, baseX, local),
      lerp(c.y - 4, c.y, local) + Math.sin(clock.elapsedTime * 0.9 + index) * 0.05 + focus.current * 0.16,
      c.z,
    );
    r.scale.setScalar(c.scale);
    r.rotation.z = lerp(side * -0.6, 0, local);
    angle.current += dt * (0.12 + focus.current * 1.4);
    if (focus.current < 0.05) angle.current = damp(angle.current, Math.round(angle.current / (Math.PI * 2)) * Math.PI * 2 + side * 0.35, 2, dt);
    spin.current.rotation.y = angle.current + (1 - local) * side * -2.5;
    if (lid.current) {
      const peek = focus.current * 0.12;
      lid.current.position.set(0, CUP.H + peek * 0.3, -CUP.LID_R);
      lid.current.rotation.set(-peek, 0, 0);
    }
    if (contents.current) contents.current.visible = focus.current > 0.01;
  });

  return (
    <group ref={root} visible={false}>
      <group ref={spin}>
        <CupModel variant={v} quality={quality} lidPivotRef={lid} contentsRef={contents} castShadow={quality === "high"} />
      </group>
    </group>
  );
}

function Plinths({ quality }: { quality: Quality }) {
  const group = useRef<THREE.Group>(null);
  const mats = useMemo(
    () => ({
      body: new THREE.MeshPhysicalMaterial({ color: "#efdcb8", roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.3 }),
      rings: variants.map(
        (v) => new THREE.MeshStandardMaterial({ color: v.palette.accent, emissive: v.palette.accent, emissiveIntensity: 0.9 }),
      ),
    }),
    [],
  );
  useEffect(
    () => () => {
      mats.body.dispose();
      mats.rings.forEach((m) => m.dispose());
    },
    [mats],
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const s = sceneState.collection.show;
    g.visible = s > 0.001;
    if (!g.visible) return;
    const c = sceneState.cup;
    const top = c.y - (CUP.H / 2) * c.scale - 0.04;
    g.children.forEach((child, i) => {
      const local = easeOutCubic(clamp(s * 1.6 - i * 0.18));
      child.position.set((i - 1) * SPACING + interaction.carousel, lerp(top - 6, top, local) - 2 * 1, c.z);
      child.scale.set(c.scale, 1, c.scale);
    });
  });

  return (
    <group ref={group} visible={false}>
      {variants.map((v, i) => (
        <group key={v.id}>
          <mesh geometry={plinthGeo} material={mats.body} receiveShadow castShadow={quality === "high"} />
          <mesh geometry={ringGeo} material={mats.rings[i]} position={[0, 2, 0]} />
        </group>
      ))}
    </group>
  );
}

export function Collection({ quality, isMobile }: { quality: Quality; isMobile: boolean }) {
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const app = appStore.get();
    const target = isMobile ? -(app.focus - 1) * SPACING : 0;
    interaction.carousel = damp(interaction.carousel, target, 4, dt);
  });
  return (
    <group>
      <SideCup index={0} quality={quality} />
      <SideCup index={2} quality={quality} />
      <Plinths quality={quality} />
    </group>
  );
}
