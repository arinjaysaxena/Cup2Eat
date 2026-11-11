"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resetSceneState, sceneState as S } from "./sceneState";
import { clamp } from "./math";

gsap.registerPlugin(ScrollTrigger);

/**
 * CENTRAL SCENE CONTROLLER
 *
 * One master GSAP timeline, normalised to 0..1 = the full page scroll, scrubbed by a
 * single ScrollTrigger. Every scene's tweens are positioned from the real DOM section
 * ranges, so the 3D camera, cup, lid, ingredients, lighting, backgrounds and typography
 * share one clock and reverse perfectly when scrolling back.
 *
 * Scene boundaries (section ids):
 *   home → experience → reveal → inside → products → why (why-0..3) → contact
 */

export interface Layout {
  portrait: boolean;
  mobile: boolean;
}

export const SCENES = [
  { id: "home", label: "Arrival", anchor: 0 },
  { id: "experience", label: "Takeover", anchor: 0.35 },
  { id: "reveal", label: "The reveal", anchor: 0.97 },
  { id: "inside", label: "Inside", anchor: 0.3 },
  { id: "products", label: "Products", anchor: 0.25 },
  { id: "why", label: "Why Cup2Eat", anchor: -0.15 },
  { id: "contact", label: "Finale", anchor: 0.55 },
] as const;

const TAU = Math.PI * 2;

/** Absolute scroll position (px) of local time t in a section. t<0 = entering, 0..1 = pinned range. */
export function sectionY(id: string, t: number) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const vh = window.innerHeight;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const h = el.offsetHeight;
  return t >= 0 ? top + t * Math.max(h - vh, 1) : top + t * vh;
}

function maxScroll() {
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}

export function buildMasterTimeline(layout: Layout, reduced: boolean) {
  resetSceneState();
  // DOM targets go back to their CSS-defined initial state before tweens record start values
  gsap.set("[data-a],[data-b],[data-bg]", { clearProps: "opacity,transform,visibility,strokeDashoffset" });

  const max = maxScroll();
  const at = (id: string, t: number) => clamp(sectionY(id, t) / max);
  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

  /** Tween `target` between local times t0..t1 of section `id`. */
  const tw = (target: gsap.TweenTarget, vars: gsap.TweenVars, id: string, t0: number, t1: number, ease = "power2.inOut") => {
    const s = at(id, t0);
    const e = at(id, t1);
    tl.to(target, { ...vars, ease, duration: Math.max(0.00001, e - s) }, s);
  };
  const show = (sel: string, id: string, t0: number, t1: number, from: gsap.TweenVars = {}) =>
    tw(sel, { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, ...from }, id, t0, t1, "power3.out");
  const hide = (sel: string, id: string, t0: number, t1: number, vars: gsap.TweenVars = {}) =>
    tw(sel, { opacity: 0, ...vars }, id, t0, t1, "power2.in");
  const bg = (name: string, v: number, id: string, t0: number, t1: number) =>
    tw(`[data-bg="${name}"]`, { opacity: v }, id, t0, t1, "sine.inOut");

  const P = layout.portrait;

  /* ------------------------------------------------------------------ initial composition */
  if (P) {
    S.cup.x = 0;
    S.cup.y = -0.4;
    S.cup.scale = 0.8;
    S.camera.ty = -0.2;
  }

  /* ================================================================== 01 → 02  TAKEOVER */
  tw("[data-a='hero']", { y: -140, opacity: 0 }, "experience", -1, -0.35, "power2.in");
  tw(S.cup, { x: 0, y: P ? -0.1 : -0.05, rx: 0.08, rz: 0.05, scale: P ? 0.82 : 1.08 }, "experience", -1, 0.1);
  tw(S.cup, { spin: 2.2 }, "experience", -1, -0.2, "sine.inOut");
  tw(S.camera, { az: -0.6, el: 0.24, dist: 7.4, ty: 0.1 }, "experience", -1, 0.1);
  tw(S.ambient, { amount: 0 }, "experience", -0.7, 0.15, "power2.in");
  tw(S.shadow, { opacity: 0.3 }, "experience", -1, 0);
  bg("takeover", 1, "experience", -0.8, 0);

  // camera circles while the cup spins on its own axis
  tw(S.camera, { az: 1.0, el: 0.04 }, "experience", 0.1, 1, "sine.inOut");
  tw(S.cup, { rz: -0.06 }, "experience", 0.1, 1, "sine.inOut");

  // typography behind + in front of the cup
  tw("[data-b='to']", { opacity: 1 }, "experience", -0.6, 0);
  tw("[data-b='to-1']", { xPercent: -28 }, "experience", -0.8, 1);
  tw("[data-b='to-2']", { xPercent: 22 }, "experience", -0.8, 1);
  show("[data-a='to-kicker']", "experience", -0.3, 0.05, { y: 0 });
  show("[data-a='to-ann-1']", "experience", 0.12, 0.25);
  show("[data-a='to-ann-2']", "experience", 0.36, 0.5);
  show("[data-a='to-ann-3']", "experience", 0.58, 0.72);
  show("[data-a='to-burst']", "experience", 0.7, 0.82);
  hide("[data-a='to-kicker'],[data-a='to-ann-1'],[data-a='to-ann-2'],[data-a='to-ann-3'],[data-a='to-burst']", "experience", 0.9, 1);
  hide("[data-b='to']", "reveal", -0.9, -0.4);

  /* ================================================================== 03  THE BIG REVEAL */
  bg("reveal", 1, "reveal", -0.9, -0.1);
  tw(S.cup, { spin: 0, rx: 0.04, rz: 0, y: P ? -0.25 : -0.2 }, "reveal", -0.9, 0);
  tw(S.camera, { az: 0.22, el: 0.3, dist: 5.9, ty: 0.55 }, "reveal", -0.9, 0.12);
  tw(S.light, { key: 1.3, env: 0.75, rim: 1.25 }, "reveal", -0.6, 0.1);
  tw(S.particles, { amount: 0.45 }, "reveal", -0.6, 0.1);

  // anticipation → pop → peel away (the lid never just vanishes)
  tw(S.lid, { tilt: -0.035, lift: 0.012 }, "reveal", 0.08, 0.15, "sine.inOut");
  tw(S.lid, { tilt: 0.42, lift: 0.1 }, "reveal", 0.15, 0.29, "back.out(2.4)");
  tw(S.lid, { lift: 0.5, slide: -1.05, tilt: 0.8, spin: -0.3, roll: 0.3 }, "reveal", 0.29, 0.52, "power2.out");
  tw(S.lid, { lift: 0.55, slide: -2.15, tilt: 0.5, spin: -0.75, roll: 0.55 }, "reveal", 0.52, 0.92, "sine.inOut");
  tw(S.steam, { amount: 1 }, "reveal", 0.3, 0.6, "sine.out");

  // macro: camera rises over the rim and looks into the cup
  tw(S.camera, { el: 0.98, dist: 4.4, ty: 0.95, fov: 28 }, "reveal", 0.38, 0.72);
  tw(S.noodles, { swirl: 0.32 }, "reveal", 0.62, 0.97, "power1.inOut");
  tw(S.ingredients, { spread: 0.33 }, "reveal", 0.6, 0.97, "power1.inOut");
  tw(S.camera, { az: 1.5, el: 0.74 }, "reveal", 0.72, 1, "sine.inOut");

  show("[data-a='rv-1']", "reveal", 0.02, 0.1);
  hide("[data-a='rv-1']", "reveal", 0.3, 0.36);
  show("[data-a='rv-pop']", "reveal", 0.15, 0.22, { scale: 1, rotate: -8 });
  hide("[data-a='rv-pop']", "reveal", 0.3, 0.38, { scale: 1.4 });
  show("[data-a='rv-2']", "reveal", 0.36, 0.44);
  hide("[data-a='rv-2']", "reveal", 0.6, 0.66);
  show("[data-a='rv-3']", "reveal", 0.66, 0.74);
  show("[data-a='rv-head']", "reveal", 0.76, 0.9);
  hide("[data-a='rv-3'],[data-a='rv-head']", "inside", -0.85, -0.55, { y: -60 });

  /* ================================================================== 04  WORLD INSIDE THE CUP */
  bg("world", 1, "inside", -0.8, -0.1);
  tw(S.light, { key: 1, env: 1.25, rim: 1.4 }, "inside", -0.8, 0);
  tw(S.particles, { amount: 1, speed: 1.4 }, "inside", -0.8, 0);
  tw(S.cup, { scale: P ? 0.8 : 1, y: P ? -0.7 : -0.35 }, "inside", -0.8, 0.05);
  tw(S.camera, { dist: 7.4, el: 0.24, ty: 0.85, fov: 34 }, "inside", -0.8, 0.05);
  tw(S.ingredients, { spread: 0.62 }, "inside", -0.8, 0.05, "power1.inOut");
  tw(S.noodles, { swirl: 0.75 }, "inside", -0.8, 0.1, "power1.inOut");
  tw(S.steam, { amount: 0.3 }, "inside", -0.8, 0);
  tw(S.camera, { az: 4.0 }, "inside", -0.8, 0.6, "sine.inOut");
  // fly-through: push in among the ingredients, then pull back out
  tw(S.camera, { dist: 4.7, ty: 1.4, el: 0.05 }, "inside", 0.05, 0.3, "sine.inOut");
  tw(S.camera, { dist: 7.6, ty: 0.9, el: 0.2 }, "inside", 0.3, 0.6, "sine.inOut");
  tw(S.ingredients, { spread: 1 }, "inside", 0.05, 0.4, "sine.inOut");
  tw(S.noodles, { swirl: 1 }, "inside", 0.1, 0.4, "sine.inOut");

  // everything settles back into the cup, lid drops home
  tw(S.ingredients, { spread: 0 }, "inside", 0.6, 0.86, "power2.in");
  tw(S.noodles, { swirl: 0 }, "inside", 0.58, 0.84, "power2.in");
  tw(S.steam, { amount: 0 }, "inside", 0.7, 0.92);
  tw(S.lid, { lift: 0.4, slide: 0, tilt: 0.12, spin: 0, roll: 0 }, "inside", 0.6, 0.86, "power2.inOut");
  tw(S.lid, { lift: 0, tilt: 0 }, "inside", 0.86, 0.97, "bounce.out");
  tw(S.camera, { az: TAU, dist: 7.2, el: 0.14, ty: 0.2, fov: 30 }, "inside", 0.6, 1);

  show("[data-a='in-head']", "inside", -0.45, 0.05, { y: 0 });
  hide("[data-a='in-head']", "inside", 0.5, 0.6, { y: -80 });
  tw("[data-a='in-tag']", { opacity: 1, y: 0, scale: 1, stagger: (at("inside", 0.35) - at("inside", 0.1)) / 8 }, "inside", 0.1, 0.2, "back.out(2)");
  show("[data-a='in-note']", "inside", 0.15, 0.3);
  hide("[data-a='in-tag'],[data-a='in-note']", "inside", 0.52, 0.6);
  show("[data-a='in-settle']", "inside", 0.66, 0.76);
  hide("[data-a='in-settle']", "inside", 0.92, 1);

  /* ================================================================== 05  PRODUCT COLLECTION */
  bg("gallery", 1, "products", -0.8, -0.05);
  tw(S.cup, { x: 0, y: P ? 0.12 : -0.24, scale: P ? 0.72 : 0.68, rx: 0.05, rz: 0, spin: 0, float: 0.4 }, "products", -0.9, 0);
  tw(S.camera, { dist: P ? 6.6 : 10.2, el: 0.08, ty: P ? 0.1 : 0.05 }, "products", -0.9, 0);
  tw(S.collection, { show: 1 }, "products", -0.55, 0.12, "power3.out");
  tw(S.light, { key: 1.15, env: 1.3, rim: 1 }, "products", -0.8, 0);
  tw(S.particles, { amount: 0.25, speed: 0.6 }, "products", -0.8, 0);
  tw(S.camera, { az: TAU + 0.1 }, "products", 0.1, 1, "sine.inOut");
  tw("[data-b='pr']", { opacity: 1 }, "products", -0.6, 0);
  show("[data-a='pr-head']", "products", -0.4, 0.05, { y: 0 });
  show("[data-a='pr-slots']", "products", -0.05, 0.15, { y: 0 });

  /* ================================================================== 06  WHY CUP2EAT */
  hide("[data-a='pr-head'],[data-a='pr-slots'],[data-b='pr']", "why", -1, -0.65);
  tw(S.collection, { show: 0 }, "why", -1, -0.4, "power2.in");
  bg("why", 1, "why", -0.9, -0.2);
  tw(S.particles, { amount: 0.8, speed: 1 }, "why", -0.9, -0.2);
  tw(S.light, { key: 1, env: 1, rim: 1.1 }, "why", -0.9, -0.2);
  tw(S.camera, { dist: 7.2, el: 0.12, ty: 0, az: TAU }, "why", -0.9, -0.2);

  // 01 Ready in minutes – cup left, lid peeks, steam escapes
  tw(S.cup, { x: P ? 0 : -1.95, y: P ? -0.85 : -0.25, rx: 0.12, rz: 0.2, scale: 0.85, spin: 0.25, float: 1 }, "why-0", -0.9, -0.2);
  tw(S.lid, { lift: 0.14, tilt: 0.3 }, "why-0", -0.5, -0.1, "back.out(2)");
  tw(S.steam, { amount: 0.85 }, "why-0", -0.4, 0);
  tw("[data-a='why-dial']", { strokeDashoffset: 0 }, "why-0", -0.8, 0.2, "power1.inOut");

  // 02 Delicious taste – cup right, pieces orbit
  tw(S.lid, { lift: 0, tilt: 0 }, "why-1", -1, -0.7, "power2.in");
  tw(S.steam, { amount: 0 }, "why-1", -1, -0.6);
  tw(S.cup, { x: P ? 0 : 1.85, y: P ? -0.8 : -0.15, rz: -0.16, spin: 0.5 }, "why-1", -0.9, -0.2);
  tw(S.ingredients, { ring: 1, ringRadius: 1.75, size: 1.1 }, "why-1", -0.8, -0.2, "power2.out");

  // 03 Premium ingredients – centred, wide hero orbit
  tw(S.cup, { x: 0, y: P ? -0.4 : -0.3, rz: 0.04, scale: 0.68, spin: 0.35 }, "why-2", -0.9, -0.2);
  tw(S.ingredients, { ringRadius: 2.9, size: 1.6 }, "why-2", -0.9, -0.2);
  tw(S.camera, { el: 0.32 }, "why-2", -0.9, -0.2);

  // 04 On-the-go goodness – the cup takes off
  tw(S.ingredients, { ring: 0, size: 1 }, "why-3", -1, -0.6, "power2.in");
  tw(S.camera, { el: 0.08 }, "why-3", -1, -0.5);
  tw(S.cup, { x: P ? -0.4 : -2.2, y: P ? -0.6 : 0.1, rz: 0.5, rx: 0.2, scale: 0.95, spin: 1.2 }, "why-3", -0.9, -0.35);
  tw(S.cup, { x: P ? 0.4 : 2.2, y: P ? -0.9 : -0.25, rz: 0.62 }, "why-3", -0.35, 0.6, "sine.inOut");
  tw(S.particles, { speed: 7, amount: 1.2 }, "why-3", -0.7, -0.2);
  tw(S.camera, { roll: -0.07 }, "why-3", -0.7, -0.1);
  tw("[data-a='why-3-marquee']", { xPercent: -35 }, "why-3", -1, 1);
  tw("[data-a='why-2-ring']", { rotate: 120 }, "why-2", -1, 1);

  /* ================================================================== 07  FINALE */
  bg("finale", 1, "contact", -0.9, -0.1);
  tw(S.particles, { speed: 1, amount: 1 }, "contact", -0.9, -0.2);
  tw(S.camera, { roll: 0, el: 0.16, ty: 0.25, dist: 6.6 }, "contact", -0.9, -0.1);
  tw(S.cup, { x: 0, y: 0.18, rx: 0.14, rz: -0.1, scale: 0.78, spin: 0.6, float: 1 }, "contact", -0.9, -0.1);
  tw(S.ingredients, { ring: 0.85, ringRadius: 2.4, size: 0.85 }, "contact", -0.6, 0.2, "power2.out");
  tw(S.ambient, { amount: 1 }, "contact", -0.5, 0.3);
  tw(S.shadow, { opacity: 0.5 }, "contact", -0.6, 0);
  tw(S.light, { key: 1.15, env: 1.1, rim: 1.25 }, "contact", -0.6, 0);
  // the final pull-back
  tw(S.camera, { dist: 9.4, el: 0.22, ty: 0.6 }, "contact", 0, 1, "sine.inOut");
  tw(S.ingredients, { ringRadius: 2.9 }, "contact", 0, 1, "sine.inOut");
  tw("[data-b='fi']", { opacity: 1, scale: 1 }, "contact", -0.6, 0.15, "power3.out");
  show("[data-a='fi-kicker']", "contact", -0.4, 0.05);
  show("[data-a='fi-head']", "contact", -0.3, 0.12);
  show("[data-a='fi-cta']", "contact", -0.1, 0.25);

  // footer hand-off: the cup + giant wordmark scroll up with the page instead of hiding behind it
  const footer = document.querySelector("footer");
  if (footer) {
    const fh = footer.offsetHeight;
    const start = at("contact", 1);
    const aspect = window.innerWidth / window.innerHeight;
    const fit = aspect < 1 ? 1 + (1 - aspect) * 1.15 : aspect < 1.35 ? 1 + (1.35 - aspect) * 0.4 : 1;
    const unitsPerPx = (2 * 9.4 * fit * Math.tan((15 * Math.PI) / 180)) / window.innerHeight;
    const dur = Math.max(0.00001, 1 - start);
    tl.to(S.camera, { ty: 0.6 - fh * unitsPerPx, duration: dur, ease: "none" }, start);
    tl.to("[data-b='fi-move']", { y: -fh, duration: dur, ease: "none" }, start);
  }

  tl.set({}, {}, 1); // pad timeline to exactly 1 → progress == scroll progress

  const trigger = ScrollTrigger.create({
    start: 0,
    end: "max",
    scrub: reduced ? true : 0.7,
    animation: tl,
  });
  return { tl, trigger };
}

/** Smooth-scroll target for nav links: lands where each scene is fully composed. */
export function sceneScrollY(id: string) {
  const s = SCENES.find((x) => x.id === id);
  if (!s) {
    const el = document.getElementById(id);
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  }
  if (id === "home") return 0;
  return Math.max(0, sectionY(id, s.anchor));
}
