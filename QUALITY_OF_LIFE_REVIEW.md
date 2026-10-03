# Portfolio quality-of-life review — September 11, 2026

Local branch: `refinement/quality-of-life`, based on merged main commit `a97760c`.
Preview: http://127.0.0.1:5174/ · Work: http://127.0.0.1:5174/projects · About: http://127.0.0.1:5174/services

## Comparison and implementation

Reviewed the live [portfolio](https://www.anubhavhooda.dev/) and [Arkon](https://arkon.digital/) through their rendered Home, Projects, and Services/About interfaces. Arkon's project page gives imagery substantial space, presents techniques and live-demo actions together, and retains the same navigation across sections. Its services page keeps the globe separate from a compact content column. These are useful principles for this portfolio; its content and styling are not copied.

| Observed issue in the portfolio | Local improvement |
| --- | --- |
| Work/About offer only a back-to-home button. | Both now provide Home, Work, About, and Contact navigation, with the current page identified visually and accessibly. |
| Home uses buttons for page navigation. | Real links support native URL copying and modified clicks. Ordinary navigation retains the existing GSAP camera transition. |
| Three narrow desktop project cards make screenshots and descriptions difficult to inspect. | Two wider columns retain the side-positioned globe; mobile stays one column. Each screenshot opens a large native dialog with Close, Escape, keyboard containment, and focus restoration. |
| Two projects have no outgoing action. | All three link to their verified public source repositories. Sundown retains its existing live demo. No unverified application URL or outcome metric was added. |
| About lists 24 capability pills across four broad categories. | Thirteen relevant capabilities grouped under Web Applications, Interactive Interfaces, and Workflow Systems. Both inner pages end with a clear next step. |
| Animated scenes cannot be paused independently of OS preferences. | A small pause/resume control stops the render loop and parallax, remembers the preference, and synchronizes between tabs. System reduced motion takes priority; storage failures remain nonfatal. Scene resources are not recreated on toggles. |
| Route changes retain one page title and do not move keyboard focus. | Route-specific titles/descriptions/canonicals, heading focus after navigation, and a skip-to-content link with a main landmark on Home. |
| Unmatched client routes render no page. | A recovery page offers Home and Work. The local Vercel configuration uses its documented SPA fallback so the router can handle deep links after deployment. |

Verified repository destinations: [Sundown Studios](https://github.com/Anubhavera/Sundown_Studios), [Sprintly](https://github.com/Anubhavera/Sprintly), [Temporal Workflow Agent](https://github.com/Anubhavera/Temporal-Workflow-Agent). Hosting configuration follows [Vercel's Vite SPA guidance](https://vercel.com/docs/frameworks/frontend/vite).

## Preserved behavior

The sphere shader, wet-stone ground, reflection treatment, default mouse parallax, and paced circular introduction are unchanged. The active scenes still use imperative Three.js; installed React Three Fiber/Drei packages are not their rendering architecture. This pass improves the existing lifecycle instead of migrating it.

## Validation and limits

- `npm run lint`, `npm run build`, and `git diff --check` pass. Production preview on port 5175 was smoke-tested for intro release, image loading, preview dialogs, and route navigation; no runtime errors were reported.
- `npm test`: 13 passing tests, including four new motion-preference regressions covering reload persistence, denied storage, OS precedence, cross-tab changes, and listener cleanup; nine existing loader tests remain green.
- Browser checks: desktop project presentation; 390px and 320px layouts; enlarged preview and Escape/focus restoration; motion pause, reload persistence, and live OS preference changes; Home → Work and Work → About → Home navigation; route title/focus; one mounted canvas after navigation; missing-page recovery.
- These are browser-emulated mobile checks, not physical-device performance measurements. No deployment or push is included. Vercel routing must still be verified on a future deployment.
- Existing build warnings concern the large Three.js application bundle and stale Browserslist data. Dependencies and lockfiles are not changed in this pass.

The main checkout's unrelated `package-lock.json` edits and `PORTFOLIO_AUDIT.md` are untouched. Further content improvements should use actual project outcomes, contributions, and screenshots supplied or verified from the projects; no hiring claims or results have been invented.
