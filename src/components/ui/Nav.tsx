"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { scrollToScene } from "@/lib/scroll";
import { Wordmark } from "./Burst";

export const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "experience", label: "The Experience" },
  { id: "products", label: "Products" },
  { id: "why", label: "About" },
  { id: "contact", label: "Contact" },
];

const ACTIVE_FOR: Record<string, string> = {
  home: "home",
  experience: "experience",
  reveal: "experience",
  inside: "experience",
  products: "products",
  why: "why",
  contact: "contact",
};

export function Nav() {
  const scene = useApp((s) => s.scene);
  const [open, setOpen] = useState(false);
  const light = scene === "products";
  const active = ACTIVE_FOR[scene] ?? "home";

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    scrollToScene(id);
  };

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-[var(--gutter)] pt-5 pb-3 transition-colors duration-500"
      style={{ color: light ? "var(--ink)" : "var(--cream)" }}
    >
      <a href="#home" onClick={(e) => go(e, "home")} aria-label="Cup2Eat — back to top" className="relative z-10">
        <Wordmark size={30} />
      </a>

      <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((l) => (
          <a key={l.id} href={`#${l.id}`} onClick={(e) => go(e, l.id)} className="nav-link" aria-current={active === l.id}>
            {l.label}
          </a>
        ))}
        <a href="#products" onClick={(e) => go(e, "products")} className="btn !py-3 !px-4 !text-[11px]">
          Get yours <span className="arrow">→</span>
        </a>
      </nav>

      <button
        className="md:hidden relative z-10 w-12 h-12 grid place-items-center rounded-full border-2"
        style={{ borderColor: "currentColor" }}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="block w-5 h-[2px] bg-current transition-transform" style={{ transform: open ? "translateY(1px) rotate(45deg)" : "translateY(-4px)" }} />
        <span className="absolute block w-5 h-[2px] bg-current transition-transform" style={{ transform: open ? "rotate(-45deg)" : "translateY(4px)" }} />
      </button>

      <div
        id="mobile-menu"
        className="md:hidden fixed inset-0 bg-[#140e0b] flex flex-col justify-center gap-2 px-8 transition-[opacity,visibility] duration-300"
        style={{ opacity: open ? 1 : 0, visibility: open ? "visible" : "hidden", color: "var(--cream)" }}
      >
        {NAV_LINKS.map((l, i) => (
          <a key={l.id} href={`#${l.id}`} onClick={(e) => go(e, l.id)} className="display text-[13vw] leading-[1]" tabIndex={open ? 0 : -1}>
            <span className="text-[var(--yolk)] text-[4vw] align-top mr-3 font-[family-name:var(--font-body)]">0{i + 1}</span>
            {l.label}
          </a>
        ))}
      </div>
    </header>
  );
}
