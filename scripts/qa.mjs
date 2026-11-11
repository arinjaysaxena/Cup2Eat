// Visual + console QA: node scripts/qa.mjs [url] [outDir] [width] [height]
// Screenshots each scene at its composed moment (forwards, then backwards) and logs console errors.
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const url = process.argv[2] ?? "http://localhost:3210/";
const out = process.argv[3] ?? "qa-shots";
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);
const mobile = width < 700;
fs.mkdirSync(out, { recursive: true });

const chrome = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => fs.existsSync(p));

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") errors.push(`[${m.type()}] ${m.text()}`);
});
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));

const t0 = Date.now();
await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });
await page.waitForFunction(() => !document.querySelector(".loader"), { timeout: 120000 }).catch(() => errors.push("loader never cleared"));
console.log("ready in", Date.now() - t0, "ms");
await new Promise((r) => setTimeout(r, 3500));

// [name, sectionId, local t]  (mirrors sectionY in sceneController)
const shots = [
  ["01-arrival", "home", 0],
  ["02a-takeover", "experience", 0.15],
  ["02b-takeover", "experience", 0.75],
  ["03a-lid-pop", "reveal", 0.24],
  ["03b-lid-away", "reveal", 0.5],
  ["03c-macro", "reveal", 0.85],
  ["04a-world", "inside", 0.15],
  ["04b-flythrough", "inside", 0.32],
  ["04c-settle", "inside", 0.9],
  ["05-collection", "products", 0.3],
  ["06a-minutes", "why-0", 0],
  ["06b-taste", "why-1", 0],
  ["06c-ingredients", "why-2", 0],
  ["06d-on-the-go", "why-3", 0],
  ["07-finale", "contact", 0.5],
  ["08-footer", "__end", 0],
];

const yFor = (id, t) =>
  page.evaluate(
    (id, t) => {
      if (id === "__end") return document.documentElement.scrollHeight;
      const el = document.getElementById(id);
      const vh = innerHeight;
      const top = el.getBoundingClientRect().top + scrollY;
      const h = el.offsetHeight;
      return t >= 0 ? top + t * Math.max(h - vh, 1) : top + t * vh;
    },
    id,
    t,
  );

async function shoot(list, suffix) {
  for (const [name, id, t] of list) {
    const y = await yFor(id, t);
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await new Promise((r) => setTimeout(r, 2600));
    await page.screenshot({ path: path.join(out, `${name}${suffix}.jpg`), type: "jpeg", quality: 82 });
    console.log("shot", name + suffix);
  }
}

const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
await shoot(only ? shots.filter(([n]) => only.includes(n)) : shots, "");
if (!process.env.NO_REVERSE) {
  // reverse direction: a few key scenes on the way back up
  await shoot([...shots].reverse().filter(([n]) => ["04b-flythrough", "03b-lid-away", "02b-takeover", "01-arrival"].includes(n)), "-rev");
}

if (process.env.HOVER) {
  const y = await yFor("products", 0.3);
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await new Promise((r) => setTimeout(r, 2000));
  await page.mouse.move(width * 0.22, height * 0.5);
  await new Promise((r) => setTimeout(r, 1800));
  await page.screenshot({ path: path.join(out, `05b-hover-left.jpg`), type: "jpeg", quality: 82 });
}

console.log("---- console errors/warnings:", errors.length);
errors.slice(0, 40).forEach((e) => console.log(e));
await browser.close();
