# Local portfolio refinement

The reviewed refinement was prepared on `refinement/original-scene` for integration into `main`. Further visual experiments should use a separate branch or worktree so they can be reviewed locally.

## Preview

- Main checkout: http://127.0.0.1:5173/
- Refinement: http://127.0.0.1:5174/
- Replay the circular introduction: http://127.0.0.1:5174/?intro=1

To restart the refinement from this directory:

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

## What changed

- A paced circular loading reveal on black: 550 ms settling pause, 1.4 s draw, 650 ms halo hold, and 2.4 s scene reveal (about five seconds total when ready). The circle fades independently as the scene gradually brightens. It waits for scene/texture/font readiness, runs once per session, respects reduced motion, and has a bounded fallback if initialization fails. The static HTML retains contact information if the app cannot download.
- The existing water reflector now has gentler distortion and a clearer reflection. Its plane is raised so the reflected sphere is visible beneath the main sphere. Copy has stronger contrast over the water.
- The original sphere, shader, typography, mouse parallax, and camera transitions remain. Repeated decorative labels and the ticker are removed; the introduction, project descriptions, and About text are shorter. Selected work has a clear action.
- Mobile navigation and content scroll correctly. Project cards expose actual live links, with image descriptions and keyboard focus styles.
- The active scenes use imperative Three.js; React Three Fiber and Drei are installed but were not used in them. Kept that architecture to preserve the visual behavior. Secondary scenes now share one lifecycle hook. Animation is time-based, pauses in hidden tabs, and respects reduced motion. Camera interpolation no longer competes with GSAP during transitions. Render targets, materials, textures, listeners, and animation frames are cleaned up.
- Local Vercel configuration adds direct-route rewrites for Work and About. Hosting behavior must be checked separately from the local preview.

## Validation

```sh
npm run lint
npm test
npm run build
```

All passed on September 10, 2026; nine automated tests cover loader readiness, failed startup, session replay, denied storage, and reduced-motion behavior. Browser checks covered desktop, 390px and 320px widths, project images/scrolling, Home–Work–About navigation, loading reveal, reduced motion, and blocked app download recovery.

The production build still reports a large JavaScript chunk (about 745 kB, 213 kB gzip) and outdated Browserslist data. No dependency upgrades were mixed into this visual pass. Mobile checks use browser emulation, not a physical phone; low-end GPU performance still needs device testing.

## Water follow-up (local)

The reviewed baseline is on `main` at `3919b44`. The water follow-up is isolated on `refinement/water-surface`, available at the same port 5174 preview.

The reference comparison showed that surface relief, localized highlights, and a sharp reflection interrupted by raised stone were missing from the first pass. The current treatment uses a separate displaced stone bed and shallow planar reflection surface:

- Existing rock height, roughness, and normal data now drive actual geometry and a lit standard material. High stones physically interrupt the reflection. The desktop ground uses 160 subdivisions per axis, and mobile uses 96.
- The shallow water adds reflected light over the submerged stone, with slight slow ripples. It no longer uses the earlier blur kernel or coarse repeated height texture as its visible ground.
- A localized cool light catches the stone relief beneath the sphere, with the outer floor fading to black. Ground and water share the transition fade.
- Sphere colors use the same source-camera projection in both passes. Display-authored shader colors are decoded for the linear reflection target and encoded at screen output, avoiding the washed-out mirror.
- The original source material maps remain untouched. `scripts/prepare-ground-textures.py` uses Pillow to prepare a 1024px normal map and a 512px packed height/roughness map, about 573 KiB combined. Generated runtime assets are checked in; running the preparation script is optional.
- The loader waits for both material maps to settle. Cleanup disposes both textures, the stone geometry/material, and the reflection resources. Mobile copy has additional contrast over the water.

Validation: lint, nine existing loader tests, and the production build pass. Browser checks cover shader compilation, desktop parallax, mobile at 390px with device pixel ratio 2, reduced motion, and navigation back to Home. Real-device GPU performance remains unmeasured.
