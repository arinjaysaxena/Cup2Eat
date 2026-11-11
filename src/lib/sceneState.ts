/**
 * The single source of truth for everything the 3D scene shows.
 *
 * The master GSAP timeline (see lib/sceneController.ts) is the ONLY writer of these
 * values. 3D components read them every frame inside useFrame. This keeps the whole
 * experience on one coordinated, reversible timeline.
 */

export interface SceneState {
  camera: {
    /** Orbit angle around target (radians). Increases as the camera circles the cup. */
    az: number;
    /** Elevation above horizon (radians). */
    el: number;
    dist: number;
    tx: number;
    ty: number;
    tz: number;
    fov: number;
    roll: number;
  };
  cup: {
    x: number;
    y: number;
    z: number;
    rx: number;
    ry: number;
    rz: number;
    scale: number;
    /** Multiplier for ambient auto-spin (0 = settle to front) */
    spin: number;
    /** Ambient floating bob amount */
    float: number;
  };
  lid: {
    /** Vertical lift of the hinge point (world units, cup space) */
    lift: number;
    /** Rotation about the rear hinge (radians, + = front edge up) */
    tilt: number;
    /** Sideways travel of the lid (cup space) */
    slide: number;
    /** Lid yaw */
    spin: number;
    /** Lid roll while flying */
    roll: number;
  };
  /** 0..1 noodle strands unspooling out of the cup */
  noodles: { swirl: number };
  /** spread 0 = inside cup, 0.35 = fountain above cup, 1 = world. ring = orbit around cup. */
  ingredients: { spread: number; ring: number; ringRadius: number; size: number };
  steam: { amount: number };
  light: { key: number; rim: number; env: number; warmth: number };
  collection: { show: number };
  particles: { amount: number; speed: number };
  /** Out-of-focus food pieces drifting around the arrival composition */
  ambient: { amount: number };
  shadow: { opacity: number };
}

export const createInitialState = (): SceneState => ({
  camera: { az: 0, el: 0.1, dist: 7.4, tx: 0, ty: 0.05, tz: 0, fov: 30, roll: 0 },
  cup: { x: 1.35, y: -0.1, z: 0, rx: 0.16, ry: 0, rz: -0.13, scale: 1, spin: 1, float: 1 },
  lid: { lift: 0, tilt: 0, slide: 0, spin: 0, roll: 0 },
  noodles: { swirl: 0 },
  ingredients: { spread: 0, ring: 0, ringRadius: 2.1, size: 1 },
  steam: { amount: 0 },
  light: { key: 1, rim: 1, env: 1, warmth: 0 },
  collection: { show: 0 },
  particles: { amount: 1, speed: 1 },
  ambient: { amount: 1 },
  shadow: { opacity: 0.55 },
});

/** Mutable singleton. Never replace — reset with resetSceneState so references stay valid. */
export const sceneState: SceneState = createInitialState();

export function resetSceneState() {
  const fresh = createInitialState();
  (Object.keys(fresh) as (keyof SceneState)[]).forEach((k) => {
    Object.assign(sceneState[k], fresh[k]);
  });
}

/** Non-timeline interaction input (pointer, drag spin). Written by DOM handlers. */
export const interaction = {
  pointerX: 0,
  pointerY: 0,
  /** Pending drag rotation (radians) consumed by the hero cup each frame */
  dragDelta: 0,
  /** Angular velocity carried after release (inertia) */
  dragVelocity: 0,
  dragging: false,
  /** Damped horizontal offset of the product line-up (mobile carousel) */
  carousel: 0,
  /** 0→1 one-shot arrival intro (camera push-in) played once assets are ready */
  intro: 0,
};
