"use client";
import { brand } from "@/content/brand";
import { scrollToScene } from "@/lib/scroll";
import { NAV_LINKS } from "../ui/Nav";
import { Wordmark } from "../ui/Burst";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 bg-[var(--ink)] text-[var(--cream)]">
      {/* torn paper edge */}
      <svg className="absolute -top-[23px] left-0 w-full h-6" viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden>
        <path
          d="M0 6 L0 3 L4 4 L7 1.5 L11 3.5 L15 2 L19 4 L23 1 L27 3 L31 2.2 L35 4.2 L39 1.4 L43 3.3 L47 2 L51 4 L55 1.8 L59 3.6 L63 1.2 L67 3 L71 2.4 L75 4 L79 1.6 L83 3.2 L87 2 L91 4 L95 1.5 L100 3 L100 6 Z"
          fill="var(--ink)"
        />
      </svg>
      <div className="px-[var(--gutter)] pt-16 pb-10 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Wordmark size={64} />
          <p className="hand text-2xl mt-4 opacity-80 max-w-[280px]">{brand.hero.support}</p>
        </div>
        <nav aria-label="Footer">
          <p className="kicker text-[var(--yolk)] mb-4">Explore</p>
          <ul className="space-y-2">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  className="hover:text-[var(--yolk)] transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToScene(l.id);
                  }}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="kicker text-[var(--yolk)] mb-4">Follow</p>
          <ul className="space-y-2">
            {brand.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--yolk)] transition-colors">
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            <span className="placeholder-tag">Handles TBC</span>
          </p>
        </div>
        <div>
          <p className="kicker text-[var(--yolk)] mb-4">Contact</p>
          <a href={`mailto:${brand.contact.email}`} className="display text-2xl hover:text-[var(--yolk)] transition-colors normal-case">
            {brand.contact.email}
          </a>
          {brand.contact.emailIsPlaceholder && (
            <p className="mt-2">
              <span className="placeholder-tag">Placeholder email</span>
            </p>
          )}
          <p className="mono-note mt-4">{brand.contact.company}</p>
        </div>
      </div>
      <div className="px-[var(--gutter)] py-6 border-t border-[rgba(255,243,214,.12)] flex flex-wrap gap-4 justify-between items-center mono-note">
        <span>
          © {year} {brand.name}. All rights reserved.
        </span>
        <button onClick={() => scrollToScene("home")} className="kicker hover:text-[var(--yolk)]">
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}
