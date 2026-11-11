import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Quality } from "../cup/geometry";

/**
 * Shared macro-food geometry + PBR materials.
 * Only foods depicted in the supplied Cup2Eat pack art are modelled.
 */

export type FoodKind = "tofu" | "corn" | "scallion" | "bokchoy" | "chilli";

function cornGeometry(q: Quality) {
  const g = new THREE.SphereGeometry(0.5, q === "high" ? 16 : 10, q === "high" ? 12 : 8);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    // kernel: plump crown, tapered tip, slightly squared
    const tip = y < 0 ? 1 + y * 0.55 : 1;
    x *= 0.95 * tip;
    z *= 0.7 * tip;
    y *= 0.95;
    if (y > 0.35) y = 0.35 + (y - 0.35) * 0.4;
    pos.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}

function bokChoyGeometry(q: Quality) {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.bezierCurveTo(-0.16, -0.3, -0.42, 0.05, -0.32, 0.36);
  s.bezierCurveTo(-0.24, 0.56, 0.24, 0.56, 0.32, 0.36);
  s.bezierCurveTo(0.42, 0.05, 0.16, -0.3, 0, -0.5);
  const g = new THREE.ShapeGeometry(s, q === "high" ? 24 : 12);
  // subdivide-ish by tessellating via modifier would be overkill: bend by vertex
  const pos = g.attributes.position as THREE.BufferAttribute;
  const colors: number[] = [];
  const stem = new THREE.Color("#eef6d8");
  const leaf = new THREE.Color("#3f9a2f");
  const mid = new THREE.Color("#8fd05a");
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // cup the leaf and curl the tip
    pos.setZ(i, x * x * 0.9 + Math.pow(Math.max(0, y), 2) * 0.35 - Math.abs(x) * 0.05);
    const t = THREE.MathUtils.clamp((y + 0.5) / 1, 0, 1);
    const ribbed = Math.abs(x) < 0.05 ? 0.35 : 0;
    if (t < 0.38) c.copy(stem).lerp(mid, t / 0.38);
    else c.copy(mid).lerp(leaf, (t - 0.38) / 0.62);
    c.lerp(stem, ribbed);
    colors.push(c.r, c.g, c.b);
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

let assets: ReturnType<typeof build> | null = null;
let assetsQ: Quality | null = null;

function build(q: Quality) {
  const geometries: Record<FoodKind, THREE.BufferGeometry> = {
    tofu: new RoundedBoxGeometry(1, 1, 1, q === "high" ? 3 : 2, 0.14),
    corn: cornGeometry(q),
    scallion: new THREE.TorusGeometry(0.5, 0.17, q === "high" ? 10 : 6, q === "high" ? 22 : 14),
    bokchoy: bokChoyGeometry(q),
    chilli: new THREE.TorusGeometry(0.5, 0.2, q === "high" ? 8 : 6, q === "high" ? 18 : 12),
  };
  geometries.scallion.scale(1, 1, 0.75);
  geometries.chilli.scale(1, 1, 0.6);

  const materials: Record<FoodKind | "noodle" | "broth" | "oil", THREE.Material> = {
    tofu: new THREE.MeshPhysicalMaterial({ color: "#f6ead0", roughness: 0.72, sheen: 0.6, sheenColor: new THREE.Color("#fff7e6"), sheenRoughness: 0.8 }),
    corn: new THREE.MeshPhysicalMaterial({ color: "#ffc21e", roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25, sheen: 0.5, sheenColor: new THREE.Color("#fff0a0") }),
    scallion: new THREE.MeshPhysicalMaterial({ color: "#4fb238", roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
    bokchoy: new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.3, side: THREE.DoubleSide }),
    chilli: new THREE.MeshPhysicalMaterial({ color: "#d3221a", roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.15 }),
    noodle: new THREE.MeshPhysicalMaterial({ color: "#f1c46a", roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.2, sheen: 0.4, sheenColor: new THREE.Color("#fff1c2") }),
    broth: new THREE.MeshPhysicalMaterial({ color: "#b86a1c", roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03, metalness: 0 }),
    oil: new THREE.MeshPhysicalMaterial({ color: "#ff9a2a", roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.85 }),
  };
  return { geometries, materials };
}

export function getFoodAssets(q: Quality) {
  if (!assets || assetsQ !== q) {
    disposeFoodAssets();
    assets = build(q);
    assetsQ = q;
  }
  return assets;
}

export function disposeFoodAssets() {
  if (!assets) return;
  Object.values(assets.geometries).forEach((g) => g.dispose());
  Object.values(assets.materials).forEach((m) => m.dispose());
  assets = null;
  assetsQ = null;
}

/** Base world-space size for each kind (cup space units). */
export const FOOD_SIZE: Record<FoodKind, number> = {
  tofu: 0.17,
  corn: 0.085,
  scallion: 0.085,
  bokchoy: 0.4,
  chilli: 0.08,
};
