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
