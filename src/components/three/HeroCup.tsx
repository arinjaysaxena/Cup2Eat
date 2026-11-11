"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getVariant, HERO_VARIANT } from "@/content/brand";
import { interaction, sceneState } from "@/lib/sceneState";
import { appStore } from "@/lib/store";
import { damp } from "@/lib/math";
import { CupModel } from "./cup/CupModel";
import { CUP, type Quality } from "./cup/geometry";
import { Ingredients } from "./Ingredients";
import { NoodleSwirl } from "./NoodleSwirl";
import { Steam } from "./Steam";

const TAU = Math.PI * 2;

/**
 * The main character. Hierarchy:
 *   root   – position / scale from the timeline (+ carousel offset in the collection)
 *   tilt   – rx / rz lean + ambient float
 *   spin   – ry + ambient auto-spin + drag inertia + pointer parallax
 *   fx     – ingredients, noodle swirl, steam: share cup space but do not spin with the cup
 */
export function HeroCup({ quality, reduced }: { quality: Quality; reduced: boolean }) {
  const root = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const lidPivot = useRef<THREE.Group>(null);
  const contents = useRef<THREE.Group>(null);
  const auto = useRef(0);
  const focus = useRef(0);
  const px = useRef(0);
  const py = useRef(0);
  const variant = getVariant(HERO_VARIANT);

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const t = clock.elapsedTime;
    const c = sceneState.cup;
    const l = sceneState.lid;
    const show = sceneState.collection.show;
    if (!root.current || !tilt.current || !spin.current) return;

    // collection focus (centre slot = index 1)
    const app = appStore.get();
    const focused = show > 0.6 && app.focus === 1 && (app.focusActive || app.isMobile) ? 1 : 0;
    focus.current = damp(focus.current, focused, 5, dt);

    const bob = Math.sin(t * 0.9) * 0.06 * c.float * (reduced ? 0.3 : 1);
    root.current.position.set(c.x + interaction.carousel * show, c.y + bob + focus.current * 0.16, c.z);
    root.current.scale.setScalar(c.scale);

    px.current = damp(px.current, interaction.pointerX, 2.5, dt);
    py.current = damp(py.current, interaction.pointerY, 2.5, dt);
    tilt.current.rotation.set(
      c.rx + py.current * 0.06 * c.float,
      0,
      c.rz + Math.sin(t * 0.7) * 0.025 * c.float,
    );

    // ambient spin + drag inertia; settles to the front panel when spin → 0
    auto.current += interaction.dragDelta;
    interaction.dragDelta = 0;
    if (!interaction.dragging) interaction.dragVelocity = damp(interaction.dragVelocity, 0, 2.2, dt);
    auto.current += interaction.dragVelocity * dt;
    auto.current += dt * 0.22 * c.spin * (reduced ? 0.25 : 1);
    auto.current += dt * focus.current * 1.4;
    const idle = Math.abs(interaction.dragVelocity) < 0.08 && !interaction.dragging;
    if (idle && c.spin < 0.999 && focus.current < 0.05) {
      const nearest = Math.round(auto.current / TAU) * TAU;
      auto.current = damp(auto.current, nearest, 2.6 * (1 - c.spin), dt);
    }
    // arrival: one full decelerating turn that lands on the front panel
    const introTurn = -TAU * (1 - interaction.intro);
    spin.current.rotation.y = c.ry + auto.current + introTurn + px.current * 0.18 * c.float;

    // lid
    const lp = lidPivot.current;
    if (lp) {
      const peek = focus.current * 0.12;
      lp.position.set(l.slide, CUP.H + l.lift + peek * 0.3, -CUP.LID_R);
      lp.rotation.set(-(l.tilt + peek), l.spin, l.roll);
    }
    if (contents.current) contents.current.visible = l.lift + l.tilt + focus.current > 0.002;
  });

  return (
    <group ref={root}>
      <group ref={tilt}>
        <group ref={spin} name="Cup2Eat_Cup">
          <CupModel
            variant={variant}
            quality={quality}
            lidPivotRef={lidPivot}
            contentsRef={contents}
            castShadow={quality === "high"}
          />
        </group>
      </group>
      <group position={[0, -CUP.H / 2, 0]}>
        <Ingredients quality={quality} reduced={reduced} />
        <NoodleSwirl quality={quality} />
        <Steam count={quality === "high" ? 46 : 24} reduced={reduced} />
      </group>
    </group>
  );
}
