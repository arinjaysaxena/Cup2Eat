"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { Variant } from "@/content/brand";
import {
  CUP,
  createBaseGeometry,
  createBrothGeometry,
  createInnerWallGeometry,
  createLidGeometry,
  createNoodleNestGeometry,
  createRimGeometry,
  createTabGeometry,
  createWallGeometry,
  radiusAt,
  type Quality,
} from "./geometry";
import { createBrothBump, getCupTextures } from "./packaging";
import { FOOD_SIZE, getFoodAssets, type FoodKind } from "../food/foodAssets";
import { mulberry32 } from "@/lib/math";

/* ------------------------------------------------ shared geometry cache */

type CupGeometries = ReturnType<typeof buildGeometries>;
const geoCache = new Map<Quality, CupGeometries>();

function buildGeometries(q: Quality) {
  return {
    wall: createWallGeometry(q),
    inner: createInnerWallGeometry(q),
    rim: createRimGeometry(q),
    base: createBaseGeometry(q),
    lid: createLidGeometry(q),
    tab: createTabGeometry(),
    broth: createBrothGeometry(q),
    nest: createNoodleNestGeometry(q),
  };
}

export function getCupGeometries(q: Quality) {
  let g = geoCache.get(q);
  if (!g) {
    g = buildGeometries(q);
    geoCache.set(q, g);
  }
  return g;
}

export function disposeCupGeometries() {
  geoCache.forEach((g) => Object.values(g).forEach((x) => x.dispose()));
  geoCache.clear();
}

/* ------------------------------------------------ toppings on the noodle mound */

interface Topping {
  kind: FoodKind;
  matrices: THREE.Matrix4[];
}

function buildToppings(seed: number): Topping[] {
  const rand = mulberry32(seed);
  const maxR = radiusAt(CUP.CONTENT_Y) - 0.16;
  const counts: Record<FoodKind, number> = { tofu: 6, corn: 16, scallion: 14, chilli: 7, bokchoy: 2 };
  const out: Topping[] = [];
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  (Object.keys(counts) as FoodKind[]).forEach((kind) => {
    const matrices: THREE.Matrix4[] = [];
    for (let i = 0; i < counts[kind]; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * maxR * (kind === "bokchoy" ? 0.5 : 1);
      const rr = r / (maxR + 0.1);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const y = CUP.CONTENT_Y + 0.02 + (1 - rr * rr) * 0.2 + 0.07 + rand() * 0.02;
      const size = FOOD_SIZE[kind] * (0.8 + rand() * 0.4) * (kind === "bokchoy" ? 0.85 : 1);
      if (kind === "bokchoy") e.set(-Math.PI / 2 + 0.35, a + Math.PI / 2, 0);
      else if (kind === "scallion" || kind === "chilli") e.set(Math.PI / 2 + (rand() - 0.5) * 0.6, rand() * 3, 0);
      else e.set(rand() * 0.6, rand() * 3, rand() * 0.6);
      q.setFromEuler(e);
      matrices.push(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(size, size, size)));
    }
    out.push({ kind, matrices });
  });
  return out;
}

function ToppingMesh({ t, q, cast }: { t: Topping; q: Quality; cast: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geometries, materials } = getFoodAssets(q);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    t.matrices.forEach((mat, i) => m.setMatrixAt(i, mat));
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [t]);
  return (
    <instancedMesh
      ref={ref}
      args={[geometries[t.kind], materials[t.kind], t.matrices.length]}
      castShadow={cast}
      frustumCulled={false}
    />
  );
}

/* ------------------------------------------------ the cup */

export interface CupModelProps {
  variant: Variant;
  quality: Quality;
  /** Pivot group at the rear lid hinge — animate it to open the lid. */
  lidPivotRef?: RefObject<THREE.Group | null>;
  /** Group holding the food inside — parent toggles visibility when the lid is on. */
  contentsRef?: RefObject<THREE.Group | null>;
  castShadow?: boolean;
}

export function CupModel({ variant, quality, lidPivotRef, contentsRef, castShadow = false }: CupModelProps) {
  const geo = getCupGeometries(quality);
  const tex = useMemo(() => getCupTextures(variant, quality), [variant, quality]);
  const toppings = useMemo(() => buildToppings(variant.id.length * 31), [variant.id]);
  const food = getFoodAssets(quality);

  const mats = useMemo(() => {
    const p = variant.palette;
    const brothBump = createBrothBump();
    return {
      wall: new THREE.MeshPhysicalMaterial({
        map: tex.label,
        roughnessMap: tex.roughness,
        roughness: 1,
        bumpMap: tex.bump,
        bumpScale: 0.35,
        clearcoat: 0.55,
        clearcoatRoughness: 0.32,
        sheen: 0.25,
        sheenRoughness: 0.6,
        sheenColor: new THREE.Color("#ffffff"),
      }),
      rim: new THREE.MeshPhysicalMaterial({ color: p.accent, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.25 }),
      base: new THREE.MeshStandardMaterial({ color: p.base, roughness: 0.75 }),
      inner: new THREE.MeshStandardMaterial({
        color: "#f1e7d4",
        roughness: 0.9,
        bumpMap: tex.interiorBump,
        bumpScale: 0.6,
        side: THREE.DoubleSide,
      }),
      lid: new THREE.MeshPhysicalMaterial({
        map: tex.lid,
        roughness: 0.42,
        roughnessMap: tex.roughness,
        clearcoat: 0.65,
        clearcoatRoughness: 0.22,
        bumpMap: tex.bump,
        bumpScale: 0.25,
        side: THREE.DoubleSide,
      }),
      tab: new THREE.MeshPhysicalMaterial({ color: p.accent, roughness: 0.4, clearcoat: 0.6, side: THREE.DoubleSide }),
      broth: (() => {
        const m = (food.materials.broth as THREE.MeshPhysicalMaterial).clone();
        m.color.set(p.broth);
        m.bumpMap = brothBump;
        m.bumpScale = 0.4;
        return m;
      })(),
      brothBump,
    };
  }, [tex, variant.palette, food.materials.broth]);

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => (m as THREE.Material | THREE.Texture).dispose());
    },
    [mats],
  );

  return (
    <group position={[0, -CUP.H / 2, 0]}>
      <mesh geometry={geo.wall} material={mats.wall} castShadow={castShadow} receiveShadow />
      <mesh geometry={geo.rim} material={mats.rim} castShadow={castShadow} />
      <mesh geometry={geo.base} material={mats.base} />
      <mesh geometry={geo.inner} material={mats.inner} receiveShadow />

      <group ref={contentsRef}>
        <mesh geometry={geo.broth} material={mats.broth} receiveShadow />
        <mesh geometry={geo.nest} material={food.materials.noodle} castShadow={castShadow} receiveShadow />
        {toppings.map((t) => (
          <ToppingMesh key={t.kind} t={t} q={quality} cast={castShadow} />
        ))}
      </group>

      {/* hinge at the rear edge of the rim */}
      <group ref={lidPivotRef} position={[0, CUP.H, -CUP.LID_R]}>
        <group position={[0, 0, CUP.LID_R]}>
          <mesh geometry={geo.lid} material={mats.lid} castShadow={castShadow} receiveShadow />
          <mesh geometry={geo.tab} material={mats.tab} castShadow={castShadow} />
        </group>
      </group>
    </group>
  );
}
