"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import { mulberry32 } from "@/lib/math";
import { FOOD_SIZE, getFoodAssets, type FoodKind } from "./food/foodAssets";
import type { Quality } from "./cup/geometry";

/**
 * Out-of-focus food pieces drifting through the arrival composition (foreground and
 * background depth layers). They fade as the cup takes over the frame.
 */
const LAYOUT: { kind: FoodKind; n: number }[] = [
  { kind: "corn", n: 9 },
  { kind: "tofu", n: 5 },
  { kind: "scallion", n: 7 },
  { kind: "chilli", n: 5 },
];

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3();

function Layer({ kind, n, seed, quality }: { kind: FoodKind; n: number; seed: number; quality: Quality }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geometries, materials } = getFoodAssets(quality);
  const items = useMemo(() => {
    const r = mulberry32(seed);
    return Array.from({ length: n }, () => {
      // keep a clear window in the centre-right where the cup lives
      const near = r() < 0.28;
      const side = r() > 0.45 ? 1 : -1;
      // near (big, soft) pieces only frame the right edge so they never cross the copy
      const x = near ? 3.4 + r() * 1.6 : side * (2.4 + r() * 5) + 0.9;
      const z = near ? 1.2 + r() * 1.2 : -2 - r() * 5;
      return {
        p: new THREE.Vector3(x, (r() - 0.5) * (near ? 4.5 : 6.5), z),
        axis: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(),
        rate: 0.2 + r() * 0.5,
        phase: r() * 10,
        size: FOOD_SIZE[kind] * (kind === "bokchoy" ? 1.4 : 2.2) * (0.8 + r() * 0.6),
      };
    });
  }, [kind, n, seed]);

  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const amt = sceneState.ambient.amount;
    m.visible = amt > 0.01;
    if (!m.visible) return;
    const t = clock.elapsedTime;
    items.forEach((it, i) => {
      _v.copy(it.p);
      _v.y += Math.sin(t * it.rate + it.phase) * 0.25 + (1 - amt) * 3 * (it.p.y > 0 ? 1 : -1);
      _v.x += Math.cos(t * it.rate * 0.7 + it.phase) * 0.15;
      _q.setFromAxisAngle(it.axis, t * it.rate + it.phase);
      _s.setScalar(it.size * amt);
      _m.compose(_v, _q, _s);
      m.setMatrixAt(i, _m);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geometries[kind], materials[kind], n]} frustumCulled={false} />;
}

export function AmbientFood({ quality }: { quality: Quality }) {
  return (
    <group>
      {LAYOUT.map((l, i) => (
        <Layer key={l.kind} kind={l.kind} n={quality === "high" ? l.n : Math.ceil(l.n / 2)} seed={500 + i * 9} quality={quality} />
      ))}
    </group>
  );
}
