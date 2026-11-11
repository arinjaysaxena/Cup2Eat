"use client";
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import { mulberry32 } from "@/lib/math";

/** Warm atmospheric specks + spice dust. GPU animated; amount/speed come from the timeline. */
export function Particles({ count = 700, reduced = false }: { count?: number; reduced?: boolean }) {
  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(9);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 22;
      pos[i * 3 + 1] = (rand() - 0.5) * 14;
      pos[i * 3 + 2] = -9 + rand() * 14;
      seed[i * 2] = rand();
      seed[i * 2 + 1] = rand();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("seed", new THREE.BufferAttribute(seed, 2));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uAmount: { value: 1 },
        uScale: { value: 1 },
        uColorA: { value: new THREE.Color("#ffb347") },
        uColorB: { value: new THREE.Color("#ff6a00") },
      },
      vertexShader: /* glsl */ `
        attribute vec2 seed; uniform float uTime; uniform float uScale;
        varying float vTw; varying float vMix;
        void main(){
          vec3 p = position;
          p.y = mod(p.y + uTime * (0.08 + seed.x * 0.18) + 7.0, 14.0) - 7.0;
          p.x += sin(uTime * 0.3 + seed.y * 20.0) * 0.4;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          vTw = 0.55 + 0.45 * sin(uTime * (1.0 + seed.y * 2.0) + seed.x * 30.0);
          vMix = seed.y;
          gl_PointSize = (8.0 + seed.x * 26.0) * uScale / -mv.z;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uAmount; uniform vec3 uColorA; uniform vec3 uColorB;
        varying float vTw; varying float vMix;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          a = a * a;
          gl_FragColor = vec4(mix(uColorA, uColorB, vMix), a * vTw * uAmount * 0.85);
        }`,
    });
    return { geometry: g, material: m };
  }, [count]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ size, viewport }, dt) => {
    const speed = reduced ? 0.15 : sceneState.particles.speed;
    material.uniforms.uTime.value += dt * speed;
    material.uniforms.uAmount.value = sceneState.particles.amount;
    material.uniforms.uScale.value = (size.height / 900) * viewport.dpr * 6;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
