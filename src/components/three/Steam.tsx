"use client";
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import { mulberry32 } from "@/lib/math";
import { CUP } from "./cup/geometry";

/** Soft rising steam wisps from the open cup (GPU animated, state driven opacity). */
export function Steam({ count = 46, reduced = false }: { count?: number; reduced?: boolean }) {
  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(5);
    const seeds = new Float32Array(count * 4);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      seeds.set([rand(), rand(), rand(), rand()], i * 4);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("seed", new THREE.BufferAttribute(seeds, 4));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uAmount: { value: 0 },
        uTop: { value: CUP.H },
        uScale: { value: 1 },
      },
      vertexShader: /* glsl */ `
        attribute vec4 seed;
        uniform float uTime; uniform float uTop; uniform float uScale;
        varying float vLife; varying float vSeed;
        void main(){
          float life = fract(uTime * (0.08 + seed.z * 0.06) + seed.w);
          vLife = life; vSeed = seed.x;
          float a = seed.x * 6.2831;
          float r = sqrt(seed.y) * 0.6 + life * 0.5;
          vec3 p = vec3(cos(a) * r, uTop - 0.25 + life * 2.6, sin(a) * r);
          p.x += sin(uTime * 0.7 + seed.y * 10.0 + life * 4.0) * 0.25 * life;
          p.z += cos(uTime * 0.5 + seed.x * 10.0) * 0.2 * life;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (120.0 + life * 260.0) * uScale / -mv.z;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uAmount; varying float vLife; varying float vSeed;
        void main(){
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          float soft = smoothstep(0.5, 0.0, d);
          soft *= 0.75 + 0.25 * sin((c.x + vSeed) * 12.0) * sin((c.y - vSeed) * 9.0);
          float fade = smoothstep(0.0, 0.18, vLife) * (1.0 - smoothstep(0.55, 1.0, vLife));
          gl_FragColor = vec4(vec3(1.0, 0.97, 0.92), soft * fade * uAmount * 0.32);
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

  useFrame(({ clock, size, viewport }) => {
    material.uniforms.uTime.value = clock.elapsedTime * (reduced ? 0.3 : 1);
    material.uniforms.uAmount.value = sceneState.steam.amount;
    material.uniforms.uScale.value = (size.height / 900) * viewport.dpr;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
