// Extra checks: GLB export, no-WebGL fallback, nav/CTA link behaviour, reduced motion.
// Usage: node scripts/qa-extra.mjs [baseUrl]
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3210/";
const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find((p) => fs.existsSync(p));
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitReady = (page) => page.waitForFunction(() => !document.querySelector(".loader"), { timeout: 120000 });
fs.mkdirSync("qa-shots", { recursive: true });
const errors = [];
const track = (page, tag) => {
  page.on("console", (m) => m.type() === "error" && errors.push(`[${tag}] ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`[${tag}] ${e.message}`));
};

// 1. GLB export of the procedural hero cup
{
  const page = await browser.newPage();
  track(page, "glb");
  const out = path.resolve("public/models");
  fs.mkdirSync(out, { recursive: true });
  const cdp = await page.createCDPSession();
  await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: out });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(base + "?export=glb", { waitUntil: "networkidle2" });
  await waitReady(page);
  await page.waitForFunction(() => window.__glbExported === true, { timeout: 60000 });
  await sleep(2500);
  const f = path.join(out, "cup2eat-ramen-bistro-japanese-miso.glb");
  console.log("GLB:", fs.existsSync(f) ? `${(fs.statSync(f).size / 1024).toFixed(0)} KB` : "MISSING");
  await page.close();
}

// 2. No-WebGL fallback
{
  const page = await browser.newPage();
  track(page, "nowebgl");
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(base + "?nowebgl", { waitUntil: "networkidle2" });
  await waitReady(page);
  await sleep(2500);
  await page.screenshot({ path: "qa-shots/fallback-nowebgl.jpg", type: "jpeg", quality: 80 });
  console.log("fallback cup rendered:", await page.evaluate(() => !!document.querySelector(".static-cup .body")));
  await page.close();
}

// 3. Nav + CTA links land on their scenes; reduced motion path
{
  const page = await browser.newPage();
  track(page, "links");
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(base, { waitUntil: "networkidle2" });
  await waitReady(page);
  await sleep(1500);
  const sceneAt = () => page.evaluate(() => document.querySelector('nav[aria-label="Primary"] [aria-current="true"]')?.textContent);
  for (const label of ["Products", "About", "Contact", "The Experience", "Home"]) {
    await page.evaluate((label) => {
      [...document.querySelectorAll('nav[aria-label="Primary"] a')].find((a) => a.textContent.trim() === label)?.click();
    }, label);
    await sleep(2200);
    console.log(`nav "${label}" → scrollY=${await page.evaluate(() => Math.round(scrollY))}, active=${await sceneAt()}`);
  }
  // hero CTA
  await page.evaluate(() => [...document.querySelectorAll("#home a.btn")][0].click());
  await sleep(2200);
  console.log(`hero CTA → active=${await sceneAt()}`);
  // finale CTA
  await page.evaluate(() => document.querySelector("#contact a.btn").click());
  await sleep(2200);
  console.log(`finale CTA → active=${await sceneAt()}`);
  // product selection via keyboard focus
  await page.evaluate(() => document.querySelectorAll(".slot")[2]?.focus());
  await sleep(500);
  console.log("focused slot pressed:", await page.evaluate(() => document.querySelectorAll(".slot")[2]?.getAttribute("aria-pressed")));
  await page.close();
}

console.log("errors:", errors.length);
errors.forEach((e) => console.log(e));
await browser.close();
