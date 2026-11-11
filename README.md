# Cup2Eat — Immersive 3D Brand Experience

A scroll-directed, cinematic product film for the Cup2Eat **Ramen Bistro** range.
The cup is the main character: an original, procedurally modelled 3D cup that the whole page is choreographed around.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Stack: Next.js 16 · React 19 · TypeScript · React Three Fiber 9 · drei · three 0.187 · GSAP + ScrollTrigger · Lenis · Tailwind 4.

## The seven scenes

| # | Section id | What happens |
|---|---|---|
| 01 | `home` | Arrival – camera pushes in while the cup makes one full turn and lands on its front panel. Drag to spin (mouse). |
| 02 | `experience` | The cup takes over – camera orbits, cup spins independently, "SMALL CUP. / BIG PERSONALITY." moves *behind* the cup. |
| 03 | `reveal` | The big reveal – anticipation wobble → lid pops on its rear hinge → peels away and hovers → camera rises into a macro view of noodles & toppings → steam, noodles unspool, ingredients rise. |
| 04 | `inside` | The world inside the cup – background turns into the flavour world, ingredients scatter into space, camera flies through, then everything settles back and the lid drops home. |
| 05 | `products` | Collection – the two other variants slide in on plinths. Hover (desktop) / tabs + arrows (mobile) focus a cup: it lifts, spins and peeks under its lid. |
| 06 | `why` (`why-0..3`) | Four brand claims, four compositions: dial + steam, orbiting toppings, split title around the cup, a speed-lined fly-by. |
| 07 | `contact` | Final brand moment – camera pulls back, objects settle into orbit, giant wordmark behind the cup, CTA, footer hand-off. |

## Architecture

```
src/
  content/brand.ts            ← ALL copy, variants, palettes, placeholders (edit here)
  lib/
    sceneState.ts             ← single mutable 3D state (camera, cup, lid, ingredients, lights…)
    sceneController.ts        ← THE master GSAP timeline (one ScrollTrigger, all scenes)
    scroll.ts                 ← Lenis + scene-aware anchor navigation
    store.ts / device.ts      ← tier detection, reduced motion, focus state
  components/
    Experience.tsx            ← orchestration: Lenis, timeline build/rebuild, pointer + drag, intro
    three/
      Stage.tsx               ← R3F canvas, adaptive DPR (PerformanceMonitor), cleanup, GLB export hook
      CameraRig.tsx           ← orbit camera driven by state (+ parallax, aspect fit)
      Lighting.tsx            ← studio env (Lightformers), key spot, rim lights, contact shadows
      HeroCup.tsx             ← the main character (binds state → transforms, lid, spin)
      cup/geometry.ts         ← procedural cup: lathe body w/ real UVs, rolled rim, base, hinged lid, contents
      cup/packaging.ts        ← generated dieline art (arc-length design, pre-warped for the cone), PBR maps
      cup/CupModel.tsx        ← reusable cup (any variant), PBR materials, toppings
      Ingredients.tsx, NoodleSwirl.tsx, Steam.tsx, Particles.tsx, AmbientFood.tsx, Collection.tsx
    layers/                   ← Backdrop (scene backgrounds), BackType (type behind the cup), StageMount (+ no-WebGL fallback)
    sections/                 ← HTML overlays per scene + Footer
    ui/                       ← Nav, scene Rail, Loader, Burst/Wordmark
```

**One timeline.** `buildMasterTimeline()` creates a paused GSAP timeline normalised to 0–1 = whole-page scroll and positions every tween from the measured DOM ranges of each section (`sectionY(id, t)`: `t<0` = entering, `0..1` = pinned range). Camera, cup, lid, ingredients, steam, lights, backgrounds and typography all live on this one clock, so scrolling backwards rewinds exactly. The timeline is rebuilt on meaningful resizes (state is reset first so it stays deterministic).

**3D components never animate themselves** – they read `sceneState` in `useFrame`. Only ambient motion (bobbing, idle spin, steam) and direct interaction (drag, hover focus) are time-based.

## Replacing placeholders with real brand content

Everything that is not on the supplied brand visual is flagged as a placeholder (dashed `PLACEHOLDER` / `COPY TBC` tags on the page and on the back of the 3D pack).

- **Copy, flavours, descriptions, contact, socials:** `src/content/brand.ts` (set `descriptionIsPlaceholder: false` / `emailIsPlaceholder: false` once real).
- **Final packaging artwork:** set `labelArtworkUrl` (wrap image, front panel centred, ~2.67:1, e.g. 2758×1024) and `lidArtworkUrl` (square) on a variant. The texture is swapped on the existing model – no geometry changes. Note: supply the wrap already fan-warped for the taper, or a straight wrap (it will widen slightly toward the rim).
- **Ingredients:** `packArtIngredients` drives the callouts. The 3D toppings (noodles, tofu, corn, spring onion, bok choy, chilli) mirror the pack illustration only – update `food/foodAssets.ts` if the real recipe differs.
- **New variant:** add an entry to `variants` with a palette – the cup, lid and print are generated from it.

## 3D asset pipeline

The cup is modelled procedurally in Three.js (Blender wasn't available in the build environment) with proper UVs (cylindrical wall UVs with the front at u = 0.5, planar lid UVs) and PBR materials (clearcoat varnish, roughness scuffs, paper bump, seam, paper interior).

- `public/models/cup2eat-ramen-bistro-japanese-miso.glb` – exported from the live model (`/?export=glb` downloads a fresh one). It is a delivery/hand-off asset; the site builds the model at runtime and does **not** download it.
- Compress before hand-off: `npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp --texture-size 2048`

## Performance & accessibility

- 3D bundle is code-split and only requested when WebGL is available; no-WebGL devices get a 2.5D cup made from the same artwork (`?nowebgl` to preview).
- Tiering (`?tier=low|high` to force): low tier / mobile halves geometry, instances and particles, drops shadow maps for a blob shadow, caps DPR at 1.5. `PerformanceMonitor` adapts DPR at runtime; `?debug` shows FPS stats.
- `prefers-reduced-motion`: no smooth-scroll, instant scrub, slowed ambient motion, no intro.
- Nav, scene rail, skip link and footer jump straight to each scene's composed moment; product slots are keyboard focusable buttons; mobile has a menu sheet and a tabbed carousel.
- GPU resources (geometries, materials, canvas textures) are disposed on unmount.

## QA scripts

With the dev server running on port 3210 (`npm run dev -- --port 3210`):

```bash
node scripts/qa.mjs http://localhost:3210/ qa-shots 1440 900   # every scene, forward + reverse, console errors
node scripts/qa.mjs http://localhost:3210/ qa-mobile 390 844    # mobile pass
node scripts/qa-extra.mjs                                       # GLB export, fallback, nav/CTA links, reduced motion
```
