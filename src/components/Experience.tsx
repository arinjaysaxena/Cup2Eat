"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { appStore, useApp } from "@/lib/store";
import { detectTier, detectWebGL, prefersReducedMotion } from "@/lib/device";
import { buildMasterTimeline, SCENES, type Layout } from "@/lib/sceneController";
import { interaction } from "@/lib/sceneState";
import { setLenis } from "@/lib/scroll";
import { Backdrop } from "./layers/Backdrop";
import { BackType } from "./layers/BackType";
import { StageMount } from "./layers/StageMount";
import { Nav } from "./ui/Nav";
import { Rail } from "./ui/Rail";
import { Loader } from "./ui/Loader";
import { Hero } from "./sections/Hero";
import { Takeover } from "./sections/Takeover";
import { Reveal } from "./sections/Reveal";
import { Inside } from "./sections/Inside";
import { Products } from "./sections/Products";
import { Why } from "./sections/Why";
import { Finale } from "./sections/Finale";
import { Footer } from "./sections/Footer";

gsap.registerPlugin(ScrollTrigger);

const getLayout = (): Layout => ({
  portrait: window.innerWidth / window.innerHeight < 0.9,
  mobile: appStore.get().isMobile,
});

export function Experience() {
  const webgl = useApp((s) => s.webgl);

  // 1. capability detection
  useEffect(() => {
    const { tier, isMobile } = detectTier();
    appStore.set({ tier, isMobile, reducedMotion: prefersReducedMotion(), webgl: detectWebGL() });
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  // 2. smooth scroll + master timeline + input
  useEffect(() => {
    if (webgl === null) return;
    const reduced = appStore.get().reducedMotion;

    let lenis: Lenis | null = null;
    const raf = (t: number) => lenis?.raf(t * 1000);
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      setLenis(lenis);
    }

    let ctl = buildMasterTimeline(getLayout(), reduced);

    const sceneTriggers = SCENES.map((s) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => self.isActive && appStore.set({ scene: s.id }),
      }),
    );

    // rebuild only on meaningful resizes (ignore mobile URL-bar jitter)
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (w === lastW && Math.abs(h - lastH) < 140) return;
        lastW = w;
        lastH = h;
        const { isMobile } = detectTier();
        appStore.set({ isMobile });
        ctl.trigger.kill();
        ctl.tl.kill();
        ScrollTrigger.refresh();
        ctl = buildMasterTimeline(getLayout(), reduced);
        ScrollTrigger.refresh();
      }, 220);
    };
    window.addEventListener("resize", onResize);

    // pointer parallax + drag-to-spin (mouse/pen only, so touch scrolling is untouched)
    let lastX = 0;
    let lastT = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      interaction.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      interaction.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
      if (interaction.dragging) {
        const dx = e.clientX - lastX;
        const now = performance.now();
        const dt = Math.max(1, now - lastT) / 1000;
        interaction.dragDelta += dx * 0.009;
        interaction.dragVelocity = (dx * 0.009) / dt;
        lastX = e.clientX;
        lastT = now;
      }
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      const t = e.target as HTMLElement;
      if (t.closest("a,button,input,textarea,select,[data-nodrag]")) return;
      const scene = appStore.get().scene;
      if (scene !== "home" && scene !== "experience" && scene !== "contact") return;
      interaction.dragging = true;
      lastX = e.clientX;
      lastT = performance.now();
      document.documentElement.classList.add("is-dragging");
    };
    const onUp = () => {
      interaction.dragging = false;
      document.documentElement.classList.remove("is-dragging");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    // arrival intro once assets are on screen
    let introDone = false;
    const playIntro = () => {
      if (introDone || !appStore.get().ready) return;
      introDone = true;
      if (reduced) {
        interaction.intro = 1;
        gsap.set(".hero-line", { opacity: 1, y: 0 });
        return;
      }
      gsap.to(interaction, { intro: 1, duration: 2.8, ease: "power3.out", delay: 0.15 });
      gsap.fromTo(
        ".hero-line",
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power4.out", stagger: 0.09, delay: 0.35 },
      );
    };
    const unsub = appStore.subscribe(playIntro);
    playIntro();
    if (webgl === false) appStore.set({ ready: true });

    return () => {
      unsub();
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      sceneTriggers.forEach((t) => t.kill());
      ctl.trigger.kill();
      ctl.tl.kill();
      if (lenis) {
        gsap.ticker.remove(raf);
        lenis.destroy();
        setLenis(null);
      }
    };
  }, [webgl]);

  return (
    <>
      <a href="#products" className="skip-link">
        Skip to products
      </a>
      <Loader />
      <Backdrop />
      <BackType />
      <StageMount />
      <div className="grain" aria-hidden />
      <Nav />
      <Rail />
      <main id="main">
        <Hero />
        <Takeover />
        <Reveal />
        <Inside />
        <Products />
        <Why />
        <Finale />
      </main>
      <Footer />
    </>
  );
}
