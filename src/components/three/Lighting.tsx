"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import { CUP } from "./cup/geometry";

/**
 * Commercial product lighting:
 *  - custom studio environment (softboxes + warm strip lights) for clearcoat reflections
 *  - a narrow warm key spot from upper-left for the dramatic "reveal" highlight
 *  - orange / amber rim lights to cut the cup from the background
 *  - a low bounce from below (like a tabletop reflector)
 */
export function Lighting({ high }: { high: boolean }) {
  const key = useRef<THREE.SpotLight>(null);
  const rimA = useRef<THREE.DirectionalLight>(null);
  const rimB = useRef<THREE.DirectionalLight>(null);
  const bounce = useRef<THREE.PointLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ scene }) => {
    const l = sceneState.light;
    const c = sceneState.cup;
    target.position.set(c.x, c.y, c.z);
    target.updateMatrixWorld();
    if (key.current) {
      key.current.intensity = 260 * l.key;
      key.current.position.set(c.x - 4.2, c.y + 6.2, c.z + 5.2);
    }
    if (rimA.current) rimA.current.intensity = 5.5 * l.rim;
    if (rimB.current) rimB.current.intensity = 3.2 * l.rim;
    if (bounce.current) {
      bounce.current.intensity = 6 * l.key;
      bounce.current.position.set(c.x, c.y - 2.6, c.z + 2.2);
    }
    scene.environmentIntensity = 0.85 * l.env;
  });

  return (
    <>
      <ambientLight intensity={0.12} color="#ffe2c4" />
      <primitive object={target} />
      <spotLight
        ref={key}
        target={target}
        position={[-4, 6, 5]}
        angle={0.34}
        penumbra={0.85}
        decay={2}
        color="#fff0d8"
        castShadow={high}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight ref={rimA} position={[6, 3, -5]} color="#ff7417" />
      <directionalLight ref={rimB} position={[-6, 2.5, -4]} color="#ffc23a" />
      <pointLight ref={bounce} color="#ff9b45" decay={2} distance={8} />

      <Environment resolution={high ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={3.2} color="#fff4e6" position={[-3.5, 4, 4]} scale={[4, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={6} color="#ffad4d" position={[5, 0.5, -1.5]} scale={[1.2, 8, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={3} color="#ff6a1a" position={[-5, 0, -2.5]} scale={[1, 8, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 6, 0]} scale={3} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.2} color="#ffe0b8" position={[0, -5, 3]} scale={[8, 1.5, 1]} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}

function blobTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,0.85)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** Soft contact shadow under the floating cup (high tier) / blob shadow (low tier). */
export function CupShadow({ high }: { high: boolean }) {
  const group = useRef<THREE.Group>(null);
  const blobMat = useRef<THREE.MeshBasicMaterial>(null);
  const tex = useMemo(() => (high ? null : blobTexture()), [high]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const c = sceneState.cup;
    const op = sceneState.shadow.opacity * (1 - sceneState.collection.show);
    g.visible = op > 0.02;
    g.position.set(c.x, c.y - (CUP.H / 2) * c.scale - 0.55, c.z);
    g.scale.setScalar(c.scale);
    if (blobMat.current) blobMat.current.opacity = op;
  });

  return (
    <group ref={group}>
      {high ? (
        <ContactShadows opacity={0.6} scale={5} blur={2.6} far={3.2} resolution={512} color="#1a0800" frames={Infinity} />
      ) : (
        <mesh rotation-x={-Math.PI / 2}>
          <planeGeometry args={[3, 3]} />
          <meshBasicMaterial ref={blobMat} map={tex} transparent depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
