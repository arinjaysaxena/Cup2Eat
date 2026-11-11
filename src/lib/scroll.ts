"use client";
import type Lenis from "lenis";
import { sceneScrollY } from "./sceneController";
import { clamp, easeInOutCubic } from "./math";
import { appStore } from "./store";

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};

/** Jump to a scene's composed moment. Works with or without smooth scrolling. */
export function scrollToScene(id: string) {
  const y = sceneScrollY(id);
  const dist = Math.abs(y - window.scrollY);
  if (lenis) {
    lenis.scrollTo(y, { duration: clamp(dist / 4200, 0.9, 2.6), easing: easeInOutCubic });
  } else {
    window.scrollTo({ top: y, behavior: appStore.get().reducedMotion ? "auto" : "smooth" });
  }
  const el = document.getElementById(id);
  if (el) {
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }
}
