import type { CSSProperties, ReactNode } from "react";
import { mulberry32 } from "@/lib/math";

function starPath(points: number, seed: number, inner = 0.74) {
  const r = mulberry32(seed);
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? 0.98 - r() * 0.08 : inner - r() * 0.08;
    pts.push(`${(50 + Math.cos(a) * rad * 50).toFixed(2)},${(50 + Math.sin(a) * rad * 50).toFixed(2)}`);
  }
  return pts.join(" ");
}

/** Comic-style burst badge (SVG star with offset ink shadow). */
export function Burst({
  children,
  className = "",
  style,
  size = 190,
  points = 14,
  seed = 3,
  fill = "var(--yolk)",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  size?: number;
  points?: number;
  seed?: number;
  fill?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const d = starPath(points, seed);
  return (
    <div className={`burst ${className}`} style={{ width: size, height: size, ...style }} {...rest}>
      <svg viewBox="0 0 100 100" aria-hidden>
        <polygon points={d} transform="translate(3 4)" fill="var(--ink)" />
        <polygon points={d} fill={fill} stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
      <span className="display" style={{ fontSize: size * 0.13 }}>
        {children}
      </span>
    </div>
  );
}

export function Wordmark({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <span className={`display comic inline-block ${className}`} style={{ fontSize: size, textTransform: "none" }} aria-label="Cup2Eat">
      <span className="lean" style={{ transform: "skewX(-9deg)" }}>
        Cup<span style={{ color: "var(--ember)" }}>2</span>Eat
      </span>
    </span>
  );
}
