"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { interaction, sceneState } from "@/lib/sceneState";
import { damp } from "@/lib/math";

/**
 * Applies the timeline's orbit camera every frame:
 *   position = target + spherical(dist, elevation, azimuth)
 * plus a damped pointer parallax and an aspect-ratio fit so portrait screens keep the
 * cup framed.
 */
export function CameraRig({ reduced }: { reduced: boolean }) {
  const px = useRef(0);
  const py = useRef(0);
  const target = useRef(new THREE.Vector3());

  useFrame(({ camera, size }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const c = sceneState.camera;
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const fit = aspect < 1 ? 1 + (1 - aspect) * 1.15 : aspect < 1.35 ? 1 + (1.35 - aspect) * 0.4 : 1;

    const k = reduced ? 0.25 : 1;
    px.current = damp(px.current, interaction.pointerX * k, 2, dt);
    py.current = damp(py.current, interaction.pointerY * k, 2, dt);

    const intro = 1 - interaction.intro;
    const az = c.az + px.current * 0.05 - intro * 0.5;
    const el = c.el + py.current * 0.035 + intro * 0.12;
    const d = c.dist * fit * (1 + intro * 0.55);
    target.current.set(c.tx, c.ty, c.tz);
    cam.position.set(
      c.tx + d * Math.cos(el) * Math.sin(az),
      c.ty + d * Math.sin(el),
      c.tz + d * Math.cos(el) * Math.cos(az),
    );
    cam.lookAt(target.current);
    if (c.roll) cam.rotateZ(c.roll);
    if (Math.abs(cam.fov - c.fov) > 0.001) {
      cam.fov = c.fov;
      cam.updateProjectionMatrix();
    }
  });
  return null;
}
