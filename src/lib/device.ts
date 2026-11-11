"use client";
import type { Tier } from "./store";

export function detectWebGL(): boolean {
  if (new URLSearchParams(window.location.search).has("nowebgl")) return false;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    return !!gl;
  } catch {
    return false;
  }
}

export function detectTier(): { tier: Tier; isMobile: boolean } {
  const isMobile =
    window.matchMedia("(max-width: 820px)").matches || window.matchMedia("(pointer: coarse)").matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 8;
  const forced = new URLSearchParams(window.location.search).get("tier");
  if (forced === "low" || forced === "high") return { tier: forced, isMobile };
  const tier: Tier = isMobile || cores <= 2 || mem <= 2 ? "low" : "high";
  return { tier, isMobile };
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
