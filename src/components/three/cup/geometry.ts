import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { mulberry32 } from "@/lib/math";

/**
 * Procedural Cup2Eat cup – real-world proportions of a ~ 95mm rim noodle cup.
 * Units: 1 unit ≈ 45 mm. Cup sits with its base at y = 0 (CupModel recentres it).
 */
export const CUP = {
  H: 2.4, // body height
  RB: 0.76, // outer radius at the base
  RT: 1.0, // outer radius at the rim
  FOOT: 0.08, // printed wall starts above the foot
  WALL: 0.014, // paperboard thickness
  RIM_TUBE: 0.046, // rolled rim bead
  CONTENT_Y: 2.4 - 0.34, // broth surface
  LID_R: 1.075,
} as const;

/** Outer radius at height y, including the subtle embossed groove near the top. */
export function radiusAt(y: number) {
  const t = THREE.MathUtils.clamp(y / CUP.H, 0, 1);
  const base = CUP.RB + (CUP.RT - CUP.RB) * t;
  // A shallow shoulder groove ~ 9mm below the rim, like real stacking cups.
  const g = Math.exp(-Math.pow((y - (CUP.H - 0.24)) / 0.03, 2));
  return base - 0.011 * g;
}

export type Quality = "high" | "low";
const seg = (q: Quality, hi: number, lo: number) => (q === "high" ? hi : lo);

/** Printed outer wall. u wraps around (front centre at u = 0.5), v runs base→rim. */
export function createWallGeometry(q: Quality) {
  const rows = seg(q, 72, 36);
  const pts: THREE.Vector2[] = [];
  for (let j = 0; j <= rows; j++) {
    const y = CUP.FOOT + ((CUP.H - CUP.FOOT) * j) / rows;
    pts.push(new THREE.Vector2(radiusAt(y), y));
  }
  const g = new THREE.LatheGeometry(pts, seg(q, 160, 80), -Math.PI, Math.PI * 2);
  g.computeVertexNormals();
  // Lathe seam produces split normals at u=0/1 – fine, that is where the real paper seam is.
  return g;
}

/** Unprinted inner paper wall from the rim down to the broth. */
export function createInnerWallGeometry(q: Quality) {
  const rows = 12;
  const pts: THREE.Vector2[] = [];
  for (let j = 0; j <= rows; j++) {
    const y = CUP.H - ((CUP.H - CUP.CONTENT_Y + 0.05) * j) / rows;
    pts.push(new THREE.Vector2(radiusAt(y) - CUP.WALL, y));
  }
  const g = new THREE.LatheGeometry(pts, seg(q, 96, 48));
  g.computeVertexNormals();
  return g;
}

/** Rolled rim bead – a torus that sits on the wall lip. */
export function createRimGeometry(q: Quality) {
  const g = new THREE.TorusGeometry(CUP.RT - CUP.WALL * 0.3, CUP.RIM_TUBE, seg(q, 18, 10), seg(q, 160, 80));
  g.rotateX(Math.PI / 2);
  g.translate(0, CUP.H - 0.005, 0);
  return g;
}

/** Recessed base with a foot ring (what you see when the cup tilts towards camera). */
export function createBaseGeometry(q: Quality) {
  const r = CUP.RB;
  const pts = [
    new THREE.Vector2(0, 0.055),
    new THREE.Vector2(r - 0.085, 0.055),
    new THREE.Vector2(r - 0.07, 0.012),
    new THREE.Vector2(r - 0.045, 0),
    new THREE.Vector2(r - 0.018, 0.004),
    new THREE.Vector2(r - 0.004, 0.03),
    new THREE.Vector2(radiusAt(CUP.FOOT), CUP.FOOT + 0.002),
  ];
  const g = new THREE.LatheGeometry(pts, seg(q, 96, 48));
  g.computeVertexNormals();
  return g;
}

/**
 * Snap-on printed lid. Built in "hinge space": the hinge sits at the rear edge so the
 * lid can peel up and away physically. Planar UVs so square lid artwork maps cleanly.
 */
export function createLidGeometry(q: Quality) {
  const p: [number, number][] = [
    [0, 0.084],
    [0.25, 0.083],
    [0.5, 0.08],
    [0.72, 0.075],
    [0.84, 0.069],
    [0.875, 0.056], // embossed ring groove
    [0.9, 0.05],
    [0.925, 0.055],
    [0.95, 0.07],
    [0.985, 0.08], // raised shoulder
    [1.03, 0.078],
    [1.062, 0.064],
    [1.078, 0.03], // skirt wraps the rolled rim
    [1.079, -0.02],
    [1.072, -0.052],
    [1.058, -0.064],
    [1.035, -0.058], // tucks under the bead
  ];
  const pts = p.map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, seg(q, 160, 80));
  // planar UVs from above
  const pos = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const R = CUP.LID_R;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, 0.5 + pos.getX(i) / (2 * R), 0.5 - pos.getZ(i) / (2 * R));
  }
  uv.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

/** Pull tab protruding from the front of the lid. */
export function createTabGeometry() {
  const s = new THREE.Shape();
  const w = 0.2;
  s.moveTo(-w, 0);
  s.lineTo(-w * 0.8, 0.17);
  s.quadraticCurveTo(-w * 0.75, 0.25, -w * 0.4, 0.25);
  s.lineTo(w * 0.4, 0.25);
  s.quadraticCurveTo(w * 0.75, 0.25, w * 0.8, 0.17);
  s.lineTo(w, 0);
  s.lineTo(-w, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  // bend slightly downward like real foil-board tabs
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const z = -pos.getZ(i);
    pos.setY(i, pos.getY(i) - z * z * 0.35);
  }
  g.computeVertexNormals();
  g.translate(0, 0.07, CUP.LID_R - 0.03);
  return g;
}

/** Broth surface disc. */
export function createBrothGeometry(q: Quality) {
  const r = radiusAt(CUP.CONTENT_Y) - CUP.WALL - 0.004;
  const g = new THREE.CircleGeometry(r, seg(q, 64, 32));
  g.rotateX(-Math.PI / 2);
  g.translate(0, CUP.CONTENT_Y, 0);
  return g;
}

/**
 * Nest of wavy ramen noodles mounded inside the cup.
 * Each strand is a meandering curve with a tight crimp, merged into one draw call.
 */
export function createNoodleNestGeometry(q: Quality, seed = 7) {
  const rand = mulberry32(seed);
  const strands = seg(q, 34, 18);
  const maxR = radiusAt(CUP.CONTENT_Y) - 0.07;
  const geos: THREE.BufferGeometry[] = [];
  for (let s = 0; s < strands; s++) {
    const a = rand() * Math.PI * 2;
    const start = new THREE.Vector2(Math.cos(a), Math.sin(a)).multiplyScalar(maxR * (0.4 + rand() * 0.55));
    const dirA = a + Math.PI + (rand() - 0.5) * 1.4;
    const dir = new THREE.Vector2(Math.cos(dirA), Math.sin(dirA));
    const perp = new THREE.Vector2(-dir.y, dir.x);
    const len = maxR * (1.1 + rand() * 0.8);
    const freq = 26 + rand() * 12;
    const amp = 0.022 + rand() * 0.012;
    const lazy = (rand() - 0.5) * 0.6;
    const pts: THREE.Vector3[] = [];
    const N = 70;
    for (let k = 0; k <= N; k++) {
      const t = k / N;
      const c = start
        .clone()
        .addScaledVector(dir, t * len)
        .addScaledVector(perp, Math.sin(t * Math.PI * 2) * lazy + Math.sin(t * freq) * amp);
      if (c.length() > maxR) c.multiplyScalar(maxR / c.length());
      const rr = c.length() / maxR;
      // mound: higher in the middle, settles into the broth at the edges
      const y = CUP.CONTENT_Y + 0.02 + (1 - rr * rr) * 0.2 + (s / strands) * 0.05 + Math.cos(t * freq * 0.5) * 0.008;
      pts.push(new THREE.Vector3(c.x, y, c.y));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    geos.push(new THREE.TubeGeometry(curve, seg(q, 140, 70), 0.021, seg(q, 6, 4), false));
  }
  const merged = mergeGeometries(geos, false)!;
  geos.forEach((g) => g.dispose());
  return merged;
}

/** Long noodle strands spiralling up out of the cup – grown with setDrawRange. */
export function createNoodleSwirlGeometry(q: Quality, index: number) {
  const rand = mulberry32(100 + index * 13);
  const phase = (index / 3) * Math.PI * 2 + rand();
  const turns = 1.6 + rand() * 0.6;
  const pts: THREE.Vector3[] = [];
  const N = 220;
  const height = 3.2 + rand() * 1.2;
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    const r = 0.25 + t * (1.6 + rand() * 0.02 + index * 0.25);
    const a = phase + t * turns * Math.PI * 2;
    const crimp = Math.sin(t * 160) * 0.035 * (0.4 + t);
    pts.push(
      new THREE.Vector3(
        Math.cos(a) * (r + crimp),
        CUP.CONTENT_Y + t * height + Math.sin(t * 9 + index) * 0.15,
        Math.sin(a) * (r + crimp),
      ),
    );
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const tubular = seg(q, 900, 420);
  const radial = seg(q, 7, 5);
  const g = new THREE.TubeGeometry(curve, tubular, 0.034, radial, false);
  g.userData.tubular = tubular;
  g.userData.radial = radial;
  return g;
}
