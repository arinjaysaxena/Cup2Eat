import * as THREE from "three";
import type { Variant } from "@/content/brand";
import { CUP, radiusAt, type Quality } from "./geometry";
import { mulberry32 } from "@/lib/math";

/**
 * Generated packaging artwork for the Cup2Eat Ramen Bistro range.
 *
 * The print is designed flat in true arc-length space (like a real cup dieline),
 * then pre-warped row by row for the cone so type stays undistorted on the 3D model.
 * Supplying `labelArtworkUrl` / `lidArtworkUrl` on a variant swaps this out for final
 * artwork with zero changes to the model.
 */

export interface Fonts {
  display: string;
  hand: string;
  body: string;
}

export function readFonts(): Fonts {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string, fb: string) => cs.getPropertyValue(n).trim() || fb;
  return {
    display: v("--font-display", "Impact, sans-serif"),
    hand: v("--font-hand", "cursive"),
    body: v("--font-body", "system-ui, sans-serif"),
  };
}

export async function ensureFontsLoaded() {
  if (typeof document === "undefined" || !document.fonts) return;
  const f = readFonts();
  try {
    await Promise.all([
      document.fonts.load(`80px ${f.display}`, "CUP2EAT"),
      document.fonts.load(`40px ${f.hand}`, "Meet"),
      document.fonts.load(`600 30px ${f.body}`, "Ramen"),
      document.fonts.load(`700 30px ${f.body}`, "Ramen"),
    ]);
    await document.fonts.ready;
  } catch {
    /* fall back to system fonts */
  }
}

const SLANT = Math.hypot(CUP.H - CUP.FOOT, CUP.RT - CUP.RB);

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.round(w);
  c.height = Math.round(h);
  return [c, c.getContext("2d")!] as const;
}

/* ---------------------------------------------------------------- helpers */

function wavyLine(ctx: CanvasRenderingContext2D, x0: number, y0: number, len: number, amp: number, freq: number, angle: number) {
  ctx.save();
  ctx.translate(x0, y0);
  ctx.rotate(angle);
  ctx.beginPath();
  for (let i = 0; i <= len; i += 3) {
    const y = Math.sin((i / len) * Math.PI * 2 * freq) * amp;
    if (i === 0) ctx.moveTo(i, y);
    else ctx.lineTo(i, y);
  }
  ctx.stroke();
  ctx.restore();
}

function seigaiha(ctx: CanvasRenderingContext2D, w: number, h: number, r: number, color: string, lw: number) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  for (let row = 0, y = 0; y < h + r; row++, y += r * 0.5) {
    const off = row % 2 ? r : 0;
    for (let x = -r + off; x < w + r; x += r * 2) {
      for (let k = 1; k <= 4; k++) {
        ctx.beginPath();
        ctx.arc(x, y, (r * k) / 4, Math.PI, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

/** Comic style word: thick outline + offset drop block */
function comicText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  font: string,
  fill: string,
  stroke: string,
  shadow: string,
  depth: number,
) {
  ctx.save();
  ctx.font = `${size}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "round";
  for (let d = depth; d > 0; d -= 2) {
    ctx.fillStyle = shadow;
    ctx.fillText(text, x + d * 0.6, y + d);
  }
  ctx.lineWidth = size * 0.16;
  ctx.strokeStyle = stroke;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Stylised ramen illustration window used on the front of the pack. */
function drawFoodWindow(ctx: CanvasRenderingContext2D, cx: number, top: number, w: number, h: number, v: Variant, seed: number) {
  const p = v.palette;
  const rand = mulberry32(seed);
  ctx.save();
  // wavy-topped window
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, top + h);
  ctx.lineTo(cx - w / 2, top + 40);
  const steps = 9;
  for (let i = 0; i <= steps; i++) {
    const x = cx - w / 2 + (w * i) / steps;
    const y = top + (i % 2 ? 0 : 40);
    ctx.quadraticCurveTo(x - w / steps / 2, top + (i % 2 ? 40 : 0), x, y);
  }
  ctx.lineTo(cx + w / 2, top + h);
  ctx.closePath();
  ctx.save();
  ctx.clip();

  const g = ctx.createRadialGradient(cx, top + h * 0.55, 10, cx, top + h * 0.6, w * 0.6);
  g.addColorStop(0, "#f7b24a");
  g.addColorStop(0.5, p.broth);
  g.addColorStop(1, "#3a1606");
  ctx.fillStyle = g;
  ctx.fillRect(cx - w / 2, top, w, h);

  // noodles
  ctx.lineCap = "round";
  for (let i = 0; i < 70; i++) {
    const x = cx - w / 2 + rand() * w;
    const y = top + 30 + rand() * h;
    const len = 120 + rand() * 260;
    const ang = (rand() - 0.5) * 1.4;
    ctx.strokeStyle = "rgba(90,40,5,0.55)";
    ctx.lineWidth = 11;
    wavyLine(ctx, x, y + 3, len, 5, len / 16, ang);
    ctx.strokeStyle = i % 3 ? "#ffd889" : "#f5c25c";
    ctx.lineWidth = 7;
    wavyLine(ctx, x, y, len, 5, len / 16, ang);
  }
  // tofu
  for (let i = 0; i < 7; i++) {
    const x = cx - w * 0.4 + rand() * w * 0.8;
    const y = top + 60 + rand() * h * 0.7;
    const s = 38 + rand() * 18;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rand() - 0.5) * 0.8);
    ctx.fillStyle = "rgba(60,25,0,0.45)";
    roundRect(ctx, -s / 2 + 5, -s / 2 + 6, s, s, 7);
    ctx.fill();
    ctx.fillStyle = "#fbf0d6";
    roundRect(ctx, -s / 2, -s / 2, s, s, 7);
    ctx.fill();
    ctx.fillStyle = "#e9d3a6";
    ctx.fillRect(-s / 2 + 4, s / 2 - 12, s - 8, 8);
    ctx.restore();
  }
  // greens + corn + chilli
  for (let i = 0; i < 26; i++) {
    const x = cx - w / 2 + rand() * w;
    const y = top + 50 + rand() * h * 0.85;
    const t = rand();
    if (t < 0.35) {
      ctx.strokeStyle = "#5bbd3b";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(x, y, 12 + rand() * 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#b9e88d";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (t < 0.7) {
      ctx.fillStyle = "#ffcb2b";
      ctx.beginPath();
      ctx.ellipse(x, y, 11, 9, rand(), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.ellipse(x - 3, y - 3, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#d4241b";
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rand() * 3);
      ctx.fillRect(-9, -3, 18, 6);
      ctx.restore();
    }
  }
  // bok choy leaves at the edges
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(cx + side * w * 0.36, top + h * 0.35);
    ctx.rotate(side * 0.7);
    const lg = ctx.createLinearGradient(0, 80, 0, -110);
    lg.addColorStop(0, "#eaf5cf");
    lg.addColorStop(0.45, "#8fd05a");
    lg.addColorStop(1, "#2f8a2a");
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(0, 90);
    ctx.bezierCurveTo(-60, 20, -55, -100, 0, -120);
    ctx.bezierCurveTo(55, -100, 60, 20, 0, 90);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 85);
    ctx.lineTo(0, -100);
    ctx.stroke();
    ctx.restore();
  }
  // steam-y highlight
  const hl = ctx.createLinearGradient(cx, top, cx, top + h);
  hl.addColorStop(0, "rgba(255,240,200,0.35)");
  hl.addColorStop(0.35, "rgba(255,240,200,0)");
  ctx.fillStyle = hl;
  ctx.fillRect(cx - w / 2, top, w, h);
  ctx.restore();

  // window outline
  ctx.lineWidth = 8;
  ctx.strokeStyle = p.accent;
  ctx.stroke();
  ctx.restore();
}

function drawBarcode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ink: string, font: string) {
  const rand = mulberry32(42);
  ctx.save();
  ctx.fillStyle = "#fff8ea";
  ctx.fillRect(x - 14, y - 14, w + 28, h + 60);
  ctx.fillStyle = "#151515";
  let xx = x;
  while (xx < x + w) {
    const bw = 2 + Math.floor(rand() * 4) * 2;
    if (rand() > 0.4) ctx.fillRect(xx, y, bw, h);
    xx += bw + 2;
  }
  ctx.font = `600 22px ${font}`;
  ctx.fillStyle = "#151515";
  ctx.textAlign = "center";
  ctx.fillText("BARCODE · PLACEHOLDER", x + w / 2, y + h + 34);
  ctx.restore();
  void ink;
}

/* ---------------------------------------------------------------- wall wrap */

function drawWrapDesign(v: Variant, W: number, H: number, P: number, fonts: Fonts) {
  const [c, ctx] = makeCanvas(W, H);
  const p = v.palette;
  const cx = W / 2;
  const S = H / 1024; // design scale (designed at 1024px tall)
  ctx.scale(1, 1);

  // base
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, p.base);
  bg.addColorStop(1, p.baseDeep);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // fine pattern work
  seigaiha(ctx, W, H * 0.66, 70 * S, `${p.baseDeep}`, 3 * S);
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 3 * S;
  const rand = mulberry32(3);
  for (let i = 0; i < 46; i++) {
    wavyLine(ctx, rand() * W, H * 0.62 + rand() * H * 0.36, 200 * S + rand() * 260 * S, 6 * S, 9, (rand() - 0.5) * 0.4);
  }
  ctx.globalAlpha = 1;

  // sunburst behind the logo
  ctx.save();
  ctx.translate(cx, 230 * S);
  ctx.fillStyle = p.highlight;
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 18; i++) {
    ctx.rotate((Math.PI * 2) / 18);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-26 * S, -420 * S);
    ctx.lineTo(26 * S, -420 * S);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;

  // top + bottom bands
  ctx.fillStyle = p.accent;
  ctx.fillRect(0, 0, W, 30 * S);
  ctx.fillStyle = p.highlight;
  ctx.fillRect(0, 30 * S, W, 9 * S);
  ctx.fillStyle = p.accent;
  ctx.fillRect(0, H - 26 * S, W, 26 * S);

  // ---------- FRONT PANEL
  ctx.save();
  ctx.translate(cx, 0);
  ctx.transform(1, 0, -0.12, 1, 0, 0); // italic lean
  ctx.rotate(-0.045);
  comicText(ctx, "CUP", 0, 205 * S, 168 * S, fonts.display, p.ink, "#0b0909", p.accent, 16 * S);
  // "2EAT" with the 2 in highlight
  ctx.font = `${168 * S}px ${fonts.display}`;
  const w2 = ctx.measureText("2").width;
  const wEat = ctx.measureText("EAT").width;
  const total = w2 + wEat;
  comicText(ctx, "2", -total / 2 + w2 / 2, 350 * S, 182 * S, fonts.display, p.highlight, "#0b0909", p.accent, 16 * S);
  comicText(ctx, "EAT", -total / 2 + w2 + wEat / 2 + 6 * S, 350 * S, 168 * S, fonts.display, p.ink, "#0b0909", p.accent, 16 * S);
  ctx.restore();

  // little spark marks
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 9 * S;
  ctx.lineCap = "round";
  for (const [dx, dy, a] of [
    [215, 95, -0.6],
    [245, 140, -0.25],
    [250, 195, 0.1],
  ] as const) {
    ctx.save();
    ctx.translate(cx + dx * S, dy * S);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(36 * S, 0);
    ctx.stroke();
    ctx.restore();
  }

  // range name
  ctx.textAlign = "center";
  ctx.fillStyle = p.ink;
  ctx.font = `${92 * S}px ${fonts.display}`;
  ctx.fillText("RAMEN", cx, 485 * S);
  ctx.fillText("BISTRO", cx, 578 * S);

  // flavour ribbon
  ctx.save();
  ctx.translate(cx, 640 * S);
  ctx.rotate(-0.025);
  ctx.font = `${50 * S}px ${fonts.display}`;
  const label = v.flavour.toUpperCase();
  const lw = Math.max(ctx.measureText(label).width + 90 * S, 420 * S);
  ctx.fillStyle = "#0b0909";
  ctx.beginPath();
  ctx.moveTo(-lw / 2 + 12 * S, -38 * S + 10 * S);
  ctx.lineTo(lw / 2 + 22 * S, -38 * S + 10 * S);
  ctx.lineTo(lw / 2 - 2 * S, 44 * S + 10 * S);
  ctx.lineTo(-lw / 2 - 12 * S, 44 * S + 10 * S);
  ctx.fill();
  ctx.fillStyle = p.accent;
  ctx.beginPath();
  ctx.moveTo(-lw / 2 + 4 * S, -40 * S);
  ctx.lineTo(lw / 2 + 14 * S, -40 * S);
  ctx.lineTo(lw / 2 - 8 * S, 42 * S);
  ctx.lineTo(-lw / 2 - 18 * S, 42 * S);
  ctx.fill();
  ctx.fillStyle = p.onAccent;
  ctx.textBaseline = "middle";
  ctx.fillText(label, 0, 4 * S);
  ctx.restore();

  // food illustration window
  drawFoodWindow(ctx, cx, 715 * S, 860 * S, 290 * S, v, 11);

  // ---------- RIGHT SIDE: pack line
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = p.accent;
  ctx.font = `${44 * S}px ${fonts.display}`;
  const sx = cx + 470 * S;
  ["INSTANT", "GOURMET", "GOODNESS"].forEach((t, i) => ctx.fillText(t, sx, 250 * S + i * 52 * S));
  ctx.strokeStyle = p.highlight;
  ctx.lineWidth = 6 * S;
  ctx.beginPath();
  ctx.moveTo(sx, 395 * S);
  ctx.lineTo(sx + 240 * S, 395 * S);
  ctx.stroke();
  ctx.fillStyle = p.ink;
  ctx.font = `600 ${30 * S}px ${fonts.body}`;
  ctx.fillText(v.flavour.toUpperCase(), sx, 445 * S);
  ctx.globalAlpha = 0.75;
  ctx.font = `500 ${24 * S}px ${fonts.body}`;
  ctx.fillText("NET WT — g  (placeholder)", sx, 485 * S);
  ctx.globalAlpha = 1;
  ctx.restore();

  // ---------- LEFT SIDE: giant outlined "2" and vertical range text
  ctx.save();
  ctx.translate(cx - 640 * S, 560 * S);
  ctx.font = `${520 * S}px ${fonts.display}`;
  ctx.textAlign = "center";
  ctx.lineWidth = 7 * S;
  ctx.strokeStyle = p.accent;
  ctx.globalAlpha = 0.85;
  ctx.strokeText("2", 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(cx - 455 * S, 120 * S);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = p.highlight;
  ctx.font = `${38 * S}px ${fonts.display}`;
  ctx.fillText("RAMEN BISTRO ★ " + v.flavour.toUpperCase(), 0, 0);
  ctx.restore();

  // ---------- BACK PANELS (placeholders, clearly marked)
  const panel = (x: number, title: string, lines: string[]) => {
    const pw = 520 * S;
    const ph = 520 * S;
    const px = x - pw / 2;
    const py = 120 * S;
    ctx.save();
    ctx.fillStyle = "rgba(255,243,214,0.07)";
    roundRect(ctx, px, py, pw, ph, 18 * S);
    ctx.fill();
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 3 * S;
    ctx.setLineDash([10 * S, 8 * S]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = p.accent;
    roundRect(ctx, px, py, pw, 70 * S, 18 * S);
    ctx.fill();
    ctx.fillRect(px, py + 40 * S, pw, 30 * S);
    ctx.fillStyle = p.onAccent;
    ctx.font = `${34 * S}px ${fonts.display}`;
    ctx.textAlign = "left";
    ctx.fillText(title, px + 26 * S, py + 48 * S);
    ctx.fillStyle = p.ink;
    ctx.font = `600 ${25 * S}px ${fonts.body}`;
    lines.forEach((l, i) => ctx.fillText(l, px + 26 * S, py + 120 * S + i * 40 * S));
    // ruled lines suggesting the future table
    ctx.strokeStyle = "rgba(255,243,214,0.14)";
    ctx.lineWidth = 2 * S;
    for (let i = 0; i < 6; i++) {
      const yy = py + 120 * S + lines.length * 40 * S + i * 36 * S;
      ctx.beginPath();
      ctx.moveTo(px + 26 * S, yy);
      ctx.lineTo(px + pw - 26 * S, yy);
      ctx.stroke();
    }
    ctx.restore();
  };
  const backL = cx - W * 0.3;
  const backR = cx + W * 0.3;
  panel(backL, "HOW TO ENJOY", ["PLACEHOLDER —", "official preparation", "steps to be supplied."]);
  panel(backR, "INGREDIENTS", ["PLACEHOLDER —", "ingredient list &", "nutrition to be supplied."]);
  drawBarcode(ctx, backR - 150 * S, 700 * S, 300 * S, 110 * S, p.ink, fonts.body);
  ctx.save();
  ctx.fillStyle = p.ink;
  ctx.textAlign = "center";
  ctx.font = `${60 * S}px ${fonts.display}`;
  ctx.fillText("CUP2EAT", backL, 760 * S);
  ctx.font = `${40 * S}px ${fonts.hand}`;
  ctx.fillStyle = p.accent;
  ctx.fillText("a little cup of a whole lot of goodness", backL, 815 * S);
  ctx.restore();

  void P;
  return c;
}

/** Pre-warp the flat dieline onto the cone: each row samples the arc it really covers. */
function warpToCone(design: HTMLCanvasElement, W: number, H: number) {
  const [c, ctx] = makeCanvas(W, H);
  const step = 2;
  for (let y = 0; y < H; y += step) {
    const v = 1 - (y + step / 2) / H; // 1 = rim
    const h = CUP.FOOT + v * (CUP.H - CUP.FOOT);
    const k = radiusAt(h) / CUP.RT;
    const sw = W * k;
    ctx.drawImage(design, W / 2 - sw / 2, y, sw, step, 0, y, W, step);
  }
  // paper seam at the back (u = 0 / 1) – overlap shadow + glue line
  const seam = ctx.createLinearGradient(0, 0, 18, 0);
  seam.addColorStop(0, "rgba(0,0,0,0.55)");
  seam.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = seam;
  ctx.fillRect(0, 0, 18, H);
  return c;
}

function addGrain(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, seed: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const rand = mulberry32(seed);
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

/* ---------------------------------------------------------------- lid */

function drawLid(v: Variant, size: number, fonts: Fonts) {
  const [c, ctx] = makeCanvas(size, size);
  const p = v.palette;
  const S = size / 1024;
  const cx = size / 2;
  const R = size / 2;
  // outer skirt band (beyond the rim) – printed base colour
  ctx.fillStyle = p.base;
  ctx.fillRect(0, 0, size, size);
  // accent field with sunburst
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cx, R * 0.915, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = p.accent;
  ctx.fillRect(0, 0, size, size);
  ctx.translate(cx, cx);
  ctx.fillStyle = p.highlight;
  ctx.globalAlpha = 0.28;
  for (let i = 0; i < 24; i++) {
    ctx.rotate((Math.PI * 2) / 24);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-30 * S, -520 * S);
    ctx.lineTo(30 * S, -520 * S);
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  // ring text
  ctx.save();
  ctx.translate(cx, cx);
  ctx.fillStyle = p.onAccent;
  ctx.font = `${34 * S}px ${fonts.display}`;
  const ring = `RAMEN BISTRO ★ ${v.flavour.toUpperCase()} ★ INSTANT GOURMET GOODNESS ★ `;
  const chars = ring.split("");
  const rr = R * 0.78;
  let ang = -Math.PI / 2 - 1.2;
  const circumference = 2 * Math.PI * rr;
  const totalW = chars.reduce((a, ch) => a + ctx.measureText(ch).width, 0);
  const spread = circumference / totalW;
  for (const ch of chars) {
    const cw = ctx.measureText(ch).width * spread;
    ctx.save();
    ctx.rotate(ang + cw / rr / 2 + Math.PI / 2);
    ctx.translate(0, -rr);
    ctx.textAlign = "center";
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    ang += cw / rr;
  }
  ctx.restore();
  // centre disc
  ctx.beginPath();
  ctx.arc(cx, cx, R * 0.62, 0, Math.PI * 2);
  ctx.fillStyle = p.base;
  ctx.fill();
  ctx.lineWidth = 10 * S;
  ctx.strokeStyle = p.highlight;
  ctx.stroke();
  ctx.save();
  ctx.translate(cx, cx);
  ctx.rotate(-0.06);
  ctx.transform(1, 0, -0.12, 1, 0, 0);
  comicText(ctx, "CUP", 0, -10 * S, 150 * S, fonts.display, p.ink, "#0b0909", p.accent, 12 * S);
  ctx.font = `${150 * S}px ${fonts.display}`;
  const w2 = ctx.measureText("2").width;
  const we = ctx.measureText("EAT").width;
  comicText(ctx, "2", -(w2 + we) / 2 + w2 / 2, 135 * S, 160 * S, fonts.display, p.highlight, "#0b0909", p.accent, 12 * S);
  comicText(ctx, "EAT", -(w2 + we) / 2 + w2 + we / 2 + 4 * S, 135 * S, 150 * S, fonts.display, p.ink, "#0b0909", p.accent, 12 * S);
  ctx.restore();
  // peel here (front of lid = bottom of the canvas)
  ctx.save();
  ctx.fillStyle = p.base;
  ctx.font = `${30 * S}px ${fonts.display}`;
  ctx.textAlign = "center";
  ctx.fillText("PEEL HERE  ▼", cx, size - 95 * S);
  ctx.restore();
  // fine outer stripe on skirt
  ctx.beginPath();
  ctx.arc(cx, cx, R * 0.965, 0, Math.PI * 2);
  ctx.lineWidth = 8 * S;
  ctx.strokeStyle = p.highlight;
  ctx.stroke();
  addGrain(ctx, size, size, 10, 99);
  return c;
}

/* ---------------------------------------------------------------- material maps */

/** Roughness map: paper base + glossier ink + faint handling scuffs. */
function drawRoughness(w: number, h: number, seed: number) {
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = "rgb(120,120,120)";
  ctx.fillRect(0, 0, w, h);
  const rand = mulberry32(seed);
  for (let i = 0; i < 70; i++) {
    ctx.strokeStyle = `rgba(200,200,200,${0.08 + rand() * 0.18})`;
    ctx.lineWidth = 0.5 + rand() * 2;
    ctx.beginPath();
    const x = rand() * w;
    const y = rand() * h;
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rand() - 0.5) * 80, y + (rand() - 0.5) * 30);
    ctx.stroke();
  }
  // fingerprint-ish soft smudges
  for (let i = 0; i < 6; i++) {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
    g.addColorStop(0, "rgba(175,175,175,0.35)");
    g.addColorStop(1, "rgba(175,175,175,0)");
    ctx.save();
    ctx.translate(rand() * w, rand() * h);
    ctx.fillStyle = g;
    ctx.fillRect(-40, -40, 80, 80);
    ctx.restore();
  }
  addGrain(ctx, w, h, 28, seed + 1);
  return c;
}

/** Bump map: paper fibre, forming creases and the glued overlap seam. */
function drawBump(w: number, h: number, seed: number) {
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = "rgb(128,128,128)";
  ctx.fillRect(0, 0, w, h);
  const rand = mulberry32(seed);
  for (let i = 0; i < 9; i++) {
    const x = rand() * w;
    ctx.strokeStyle = `rgba(${rand() > 0.5 ? 150 : 105},128,128,0.35)`;
    ctx.lineWidth = 1 + rand() * 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (rand() - 0.5) * 30, h);
    ctx.stroke();
  }
  // seam ridge
  ctx.fillStyle = "rgb(190,190,190)";
  ctx.fillRect(0, 0, 6, h);
  addGrain(ctx, w, h, 36, seed + 2);
  return c;
}

/* ---------------------------------------------------------------- public API */

export interface CupTextures {
  label: THREE.Texture;
  lid: THREE.Texture;
  roughness: THREE.Texture;
  bump: THREE.Texture;
  interiorBump: THREE.Texture;
  /** flat (unwarped) front art – used for the 2D fallback */
  posterDataUrl: string;
  dispose: () => void;
}

const cache = new Map<string, CupTextures>();

function canvasTex(c: HTMLCanvasElement, srgb: boolean, aniso: number) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = aniso;
  t.needsUpdate = true;
  return t;
}

export function getCupTextures(v: Variant, q: Quality, fonts: Fonts = readFonts()): CupTextures {
  const key = `${v.id}:${q}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const H = q === "high" ? 1024 : 640;
  const P = H / SLANT;
  const W = Math.round(2 * Math.PI * CUP.RT * P);
  const design = drawWrapDesign(v, W, H, P, fonts);
  const wrap = warpToCone(design, W, H);
  addGrain(wrap.getContext("2d")!, W, H, 9, 5);
  const aniso = q === "high" ? 8 : 2;
  const label = canvasTex(wrap, true, aniso);
  label.wrapS = THREE.RepeatWrapping;

  const lid = canvasTex(drawLid(v, q === "high" ? 1024 : 512, fonts), true, aniso);
  const roughness = canvasTex(drawRoughness(512, 256, 17), false, aniso);
  roughness.wrapS = THREE.RepeatWrapping;
  const bump = canvasTex(drawBump(1024, 512, 23), false, aniso);
  bump.wrapS = THREE.RepeatWrapping;
  const interiorBump = canvasTex(drawBump(512, 256, 31), false, 1);

  // poster for the no-WebGL fallback: front ±0.25 of the flat design
  const [pc, pctx] = makeCanvas(H * 0.95, H);
  pctx.drawImage(design, W / 2 - pc.width / 2, 0, pc.width, H, 0, 0, pc.width, H);
  const posterDataUrl = pc.toDataURL("image/jpeg", 0.85);

  // Swap in final artwork when supplied – no model changes required.
  const loader = new THREE.ImageLoader();
  if (v.labelArtworkUrl)
    loader.load(v.labelArtworkUrl, (img) => {
      label.image = img as unknown as HTMLCanvasElement;
      label.needsUpdate = true;
    });
  if (v.lidArtworkUrl)
    loader.load(v.lidArtworkUrl, (img) => {
      lid.image = img as unknown as HTMLCanvasElement;
      lid.needsUpdate = true;
    });

  const set: CupTextures = {
    label,
    lid,
    roughness,
    bump,
    interiorBump,
    posterDataUrl,
    dispose: () => {
      [label, lid, roughness, bump, interiorBump].forEach((t) => t.dispose());
      cache.delete(key);
    },
  };
  cache.set(key, set);
  return set;
}

export function disposeAllCupTextures() {
  [...cache.values()].forEach((s) => s.dispose());
}

/** Broth ripple normal-ish bump */
export function createBrothBump(size = 256) {
  const [c, ctx] = makeCanvas(size, size);
  ctx.fillStyle = "rgb(128,128,128)";
  ctx.fillRect(0, 0, size, size);
  const rand = mulberry32(77);
  for (let i = 0; i < 40; i++) {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 + rand() * 30);
    g.addColorStop(0, "rgba(200,200,200,0.5)");
    g.addColorStop(1, "rgba(128,128,128,0)");
    ctx.save();
    ctx.translate(rand() * size, rand() * size);
    ctx.fillStyle = g;
    ctx.fillRect(-40, -40, 80, 80);
    ctx.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}
