# Portfolio

Use Node 20.19+ (or Node 22.12+) and `npm ci`. The build uses Vite 7, React 18, and Tailwind 3.

```bash
npm test
npm run lint
npm run build
```

## Dependency maintenance

The October 2026 refresh updates React Router and compatible transitive packages, replaces vulnerable Vite 5 with Vite 7 and its matching React plugin, and requires patched PostCSS 8.5.28+.

`npm audit` still reports the Tailwind 3 / chokidar / fast-glob / micromatch / braces development tool chain. The latest braces 3 release (3.0.3) is affected by [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). Eliminating that chain requires a separately validated Tailwind 4 styling migration; no unsupported braces override is used. Those tools process the repository's trusted source during builds. Re-run the audit before publishing since advisories change.
