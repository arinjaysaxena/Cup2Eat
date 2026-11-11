"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import { clamp, mulberry32, smoothstep } from "@/lib/math";
import { CUP, type Quality } from "./cup/geometry";
import { FOOD_SIZE, getFoodAssets, type FoodKind } from "./food/foodAssets";

/**
 * Ingredients that emerge from the cup and become a floating world.
 *
 * Every piece follows its own choreographed path, driven only by sceneState:
 *   spread 0    → resting on the noodles inside the cup (invisible under the lid)
 *   spread 0.35 → a fountain hovering just above the rim
 *   spread 1    → scattered through space as a macro "world inside the cup"
 * `ring` blends every piece onto an orbit around the cup (used for later scenes).
 * Because positions are a pure function of the state, scrolling backwards
 * rewinds the motion exactly.
 */

const RISE_T = 0.35;

interface Piece {
  start: THREE.Vector3;
  rise: THREE.Vector3;
  target: THREE.Vector3;
  delay: number;
  size: number;
  axis: THREE.Vector3;
  spinRate: number;
  phase: number;
  ringR: number;
  ringY: number;
  ringSpeed: number;
}

const COUNTS: Record<Quality, Record<FoodKind, number>> = {
  high: { tofu: 16, corn: 48, scallion: 36, chilli: 26, bokchoy: 9 },
  low: { tofu: 8, corn: 22, scallion: 16, chilli: 12, bokchoy: 5 },
};

function makePieces(kind: FoodKind, n: number, seed: number): Piece[] {
  const rand = mulberry32(seed);
  const pieces: Piece[] = [];
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    const r0 = Math.sqrt(rand()) * 0.62;
    const start = new THREE.Vector3(Math.cos(a) * r0, CUP.CONTENT_Y + 0.12, Math.sin(a) * r0);

    const a1 = a + (rand() - 0.5) * 1.2;
    const r1 = 0.25 + rand() * 1.15;
    const rise = new THREE.Vector3(Math.cos(a1) * r1, CUP.H + 0.35 + rand() * 1.7, Math.sin(a1) * r1);

    // world positions: a thick shell around the cup, biased upward and to the sides,
    // leaving a clear column for the cup itself
    const a2 = a1 + (rand() - 0.5) * 1.6;
    const r2 = 1.55 + Math.pow(rand(), 0.8) * 3.1;
    const target = new THREE.Vector3(Math.cos(a2) * r2, CUP.H * 0.5 + (rand() - 0.42) * 5.2, Math.sin(a2) * r2);

    pieces.push({
      start,
      rise,
      target,
      delay: rand(),
      size: FOOD_SIZE[kind] * (0.75 + rand() * 0.5),
      axis: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
      spinRate: 0.25 + rand() * 0.9,
      phase: rand() * Math.PI * 2,
      ringR: 0.85 + rand() * 0.45,
      ringY: CUP.H * 0.5 + (rand() - 0.5) * 2.4,
      ringSpeed: (0.12 + rand() * 0.16) * (rand() > 0.15 ? 1 : -1),
    });
  }
  return pieces;
}

const _p = new THREE.Vector3();
const _r = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _m = new THREE.Matrix4();

function KindInstances({ kind, quality, seed, reduced }: { kind: FoodKind; quality: Quality; seed: number; reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geometries, materials } = getFoodAssets(quality);
  const pieces = useMemo(() => makePieces(kind, COUNTS[quality][kind], seed), [kind, quality, seed]);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const st = sceneState.ingredients;
    const spread = st.spread;
    const ring = st.ring;
    if (spread < 0.001 && ring < 0.001) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;
    const time = reduced ? clock.elapsedTime * 0.2 : clock.elapsedTime;
    const a = RISE_T;
    for (let i = 0; i < pieces.length; i++) {
      const pc = pieces[i];
      // staggered local progress
      const t = clamp((spread - pc.delay * 0.16) / 0.84);
      // quadratic through start (0) → rise (a) → target (1)
      const L0 = ((t - a) * (t - 1)) / a;
      const L1 = (t * (t - 1)) / (a * (a - 1));
      const L2 = (t * (t - a)) / (1 - a);
      _p.set(0, 0, 0)
        .addScaledVector(pc.start, L0)
        .addScaledVector(pc.rise, L1)
        .addScaledVector(pc.target, L2);
      const drift = smoothstep(0.2, 0.8, t);
      _p.y += Math.sin(time * 0.9 + pc.phase) * 0.08 * drift;
      _p.x += Math.cos(time * 0.6 + pc.phase) * 0.05 * drift;

      // orbit
      const ang = pc.phase + time * pc.ringSpeed;
      const R = st.ringRadius * pc.ringR;
      _r.set(Math.cos(ang) * R, pc.ringY + Math.sin(time * 0.8 + pc.phase) * 0.12, Math.sin(ang) * R);
      _p.lerp(_r, ring);

      const vis = smoothstep(0, 0.07, t);
      const grow = 1 + smoothstep(RISE_T, 1, t) * 1.35;
      const ringScale = kind === "bokchoy" ? 0.6 : 1.25;
      const sc = pc.size * Math.max(vis * grow * (1 - ring), ring * ringScale) * st.size;
      _s.setScalar(sc);
      _q.setFromAxisAngle(pc.axis, pc.phase + time * pc.spinRate * (0.3 + drift + ring));
      if (kind === "bokchoy") _q.multiply(_q2.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, 0.3));
      _m.compose(_p, _q, _s);
      mesh.setMatrixAt(i, _m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[geometries[kind], materials[kind], pieces.length]}
      frustumCulled={false}
      castShadow={quality === "high"}
    />
  );
}

export function Ingredients({ quality, reduced }: { quality: Quality; reduced: boolean }) {
  const kinds: FoodKind[] = ["tofu", "corn", "scallion", "chilli", "bokchoy"];
  return (
    <group>
      {kinds.map((k, i) => (
        <KindInstances key={k} kind={k} quality={quality} seed={1000 + i * 77} reduced={reduced} />
      ))}
    </group>
  );
}
