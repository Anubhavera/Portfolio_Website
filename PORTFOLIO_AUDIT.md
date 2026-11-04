**Portfolio audit and redesign brief — 9 September 2026**

Audience: employers first, freelance clients second. Recommendation: retain the globe and dark visual identity, simplify the opening screen, and make selected projects the main evidence of your skills.

This is an audit and proposal. Application source and deployment have not been changed.

**Evidence and limits**

Reviewed the active homepage (`src/assets/pages/refined-home.jsx`), both secondary pages, routing, shared styles, shader code, reflection component, HTML, dependencies, and build/lint output. `Home.jsx` is an older implementation and is not the active homepage.

Fetched the live homepage HTML and JavaScript through HTTP. The deployed bundle contains the current homepage's distinctive labels, project names, and layout classes; the local build also produces the same asset filenames. This supports the connection between this checkout and the deployed version, but is not a claim of byte-for-byte identity.

No connected browser was available. No screenshots, rendered mobile layouts, keyboard interaction tests, Lighthouse scores, frame rates, or real-device performance measurements were obtained. Layout concerns below are source-based risks, not claimed visual test results. Some initial automated requests were blocked; subsequent curl requests successfully retrieved the homepage and bundle and repeatedly returned Vercel NOT_FOUND responses for the secondary routes.

| Check | Result |
| --- | --- |
| Homepage | HTTP 200 after redirect to www |
| Direct `/projects` request | HTTP 404, confirmed again; non-www redirects to the same failing route |
| Direct `/services` request | HTTP 404, confirmed again |
| `npm run build` | Pass; warning about a JavaScript chunk over 500 kB |
| Main local build JavaScript | 776.03 kB minified; 219.68 kB gzip estimate from Vite |
| `npm run lint` | Fail: 7 errors, 4 warnings |
| Current working tree before audit | Clean |

**1. Reduce repetition and establish a clear reading order**

The opening screen distributes content across a brand block, navigation, right metadata column, outlined name, two figure captions, central introduction, three footer columns, two edge labels, and a moving ticker. Name, location, time, availability, and technologies repeat. The issue is the number of competing text groups as well as their word count.

| Current element | Proposed treatment | Reason |
| --- | --- | --- |
| Animated globe | Keep as the hero's signature visual | Demonstrates your interest in interactive graphics |
| Reflection | Keep only if it fits the measured mobile performance budget | It adds another rendering pass |
| Brand and large outlined name | Keep a small brand and one legible main heading; remove the duplicate outline | Clarifies hierarchy |
| FIG. 01 / FIG. 02 captions | Remove from the homepage | Shader and reflection labels do not explain your professional value |
| Coordinates and repeated clocks | Remove coordinates and clocks; keep one location line in About | Reduces metadata clutter |
| SESSION ACTIVE / WEBGL ENABLED / 60FPS | Remove | These are hardcoded labels, not measured status |
| Moving bottom ticker | Remove | Repeats content and introduces persistent motion |
| Stack in several locations | Consolidate into a small About block and project-specific tags | Connects skills to evidence |
| Availability in several locations | Keep one truthful line near Contact | Avoids repetition and inconsistent phrasing |
| Vol. 01 / 2026 labels | Remove | Adds publishing metadata without useful context |
| Crosshair cursor | Use standard cursor behavior | Keeps reading and clicking predictable |

Retain a restrained palette: near-black, off-white, and one blue/cyan accent. Use a readable sans-serif for body copy; reserve the condensed face for short headings and monospace for small project metadata. Start with 16–18px body copy, comfortable line height, and a consistent content width. These are proposed design settings to validate in-browser.

**2. Organize the homepage around hiring decisions**

Recommended order: Header → Hero → Selected work → About → Contact.

The header should contain your name and Work / About / Contact links. The hero should contain one professional focus, a brief supporting sentence, and a primary “View selected work” link. Place the globe beside the copy on wide screens and below it on small screens. Give the hero enough height for visual impact while allowing ordinary document scrolling into projects.

Show three projects on the homepage so visitors can inspect your work without first discovering a navigation transition. Detailed case studies can use their own routes. Use a consistent header on those routes rather than offering only “Back to Home.”

Make About a real introduction: a short biography, primary skills, relevant experience or education when supplied, location, and a résumé link when a real résumé is available. The existing About link opens `/services`, which contains 24 service/technology labels and no biography. For employers, that list should become a focused skills summary backed by project evidence. Freelance offerings can be a short paragraph near Contact.

**3. Proposed copy, grounded in the existing content**

Hero:

> Anubhav Hooda
>
> I build web applications and interactive interfaces.
>
> Working with React, TypeScript, and WebGL to bring products and visual ideas to life.
>
> View selected work · Get in touch

The current site identifies you as a Design Engineer. That can remain a small role label if it matches your desired jobs. The project descriptions also cover backend and workflow engineering, so a narrowly graphics-only introduction would underrepresent the work shown.

Selected work introduction:

> A selection of web applications, interactive websites, and workflow experiments.

Proposed project summaries:

| Project | Proposed summary |
| --- | --- |
| Sprintly | A multi-tenant project management app with a React and TypeScript frontend and a Django/GraphQL backend. |
| Temporal Workflow Agent | An experimental agent execution engine built around Temporal workflow orchestration. |
| Sundown Studios | A studio website project focused on motion, layout, and responsive frontend development. |

Use Sprintly first if it is complete and demonstrates your strongest engineering work. Order is provisional until the actual applications and repositories are reviewed. Give each project its own screenshot, your role, project type, a short technical decision, and clearly labeled demo/source/case-study links where available.

Only Sundown currently has a destination URL in the project data, and only its image is linked. Sprintly and Temporal have hoverable cards but no destination. Supply actual links or present an honest status; avoid controls that imply unavailable actions. Use descriptive accessible link names and actual images with alt text instead of meaningful screenshots solely as CSS backgrounds. Use root-relative asset URLs such as `/sprintly.png` to avoid trailing-slash route resolution problems.

The existing “cutting-edge technologies” and “more absorbing user experiences” introduction does not explain your contribution. Replace it with concrete scope. Do not add invented users, clients, performance gains, ownership claims, or years of experience. If Sundown is a recreation, tutorial project, or adaptation, label and credit it accurately; its provenance has not been established by this audit.

Draft About:

> I'm a developer based in New Delhi, working across web applications and interactive graphics. My projects explore product interfaces, full-stack development, and workflow orchestration.

Draft Contact:

> Have a role or project in mind?
>
> I'm open to full-time opportunities and selected freelance projects.
>
> hoodaanubhav@gmail.com · LinkedIn · GitHub

The location and availability follow the current site's statements and should be checked for continued accuracy before publishing. “Q3 2026” is current at the audit date, but will require maintenance; omit the quarter unless it communicates an intentional time window.

**4. Loading animation specification**

Use a near-black screen with a small “AH” mark or your name and one thin animated line. Keep the motion quiet. Do not add a second 3D animation, a terminal simulation, or an unmeasured percentage counter.

The loader must exist in lightweight HTML/CSS before the main application bundle runs; a loader defined only inside the current eagerly loaded React application cannot cover the wait for that bundle. For fast loads, let it exit immediately once ready with an approximately 200–300ms fade. Do not impose a minimum viewing duration just to finish the animation.

Use real readiness signals for the application shell, critical fonts, and either the first usable scene frame or its fallback. Do not wait for below-the-fold project screenshots. Asset completion alone does not establish that a WebGL scene has rendered.

Bound the wait for optional graphics to approximately two seconds once the application shell is ready, then show readable content with a static fallback. The scene can appear later. Handle font failure, texture failure, unsupported WebGL, and context loss without trapping visitors. A timeout cannot rescue a React bundle that never runs, so include a static introduction/contact fallback and a way for the lightweight loading shell to reveal it if application startup fails.

Play the branded introduction once per browser session, with a guarded session-storage check. Internal navigation and return visits during that session should remain immediate; a minimal loading status can still appear if needed. Respect reduced-motion preferences by using a static mark and immediate reveal. Keep obscured content out of the keyboard focus order, announce a concise loading status, and restore normal scrolling and interaction on every exit path.

Reduced-motion behavior should cover the globe, camera movement, GSAP transitions, and CSS animations as well as the loader. [MDN documents the user preference mechanism](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

**5. Engineering priorities**

| Priority | Finding and location | Recommended action |
| --- | --- | --- |
| First | Live secondary routes return 404 | Configure Vercel to serve the SPA entry for supported client routes and verify deployed refresh/direct navigation. Add an intentional unknown-route view. |
| First | `src/App.css:64` disables body scrolling; homepage overlay/frame use fixed `100vh` dimensions and homepage CSS has no responsive media queries | Restore normal vertical scrolling; use responsive layouts and content-driven sizing. Short screens, mobile widths, and zoom require browser verification. Services has no independent scroll container to compensate for the global lock. |
| First | `refined-home.jsx:290` requires scene objects before navigating | Make semantic navigation links work independently of graphics; let animation enhance successful navigation. |
| First | Home catches scene initialization errors without a user-facing fallback; other pages do not guard renderer initialization | Keep text and navigation usable when graphics initialization fails. |
| Next | Main application imports all routes eagerly | Separate the lightweight shell and content from deferred graphics and secondary route code. Simply splitting route files may leave Three.js on the critical path because Home also imports it. |
| Next | `index.html:22` loads Three.js r128 from a CDN in addition to the npm module | Remove the unused global script after checking references. The source uses module imports. |
| Next | Font and texture payload | Replace the existing 273,860-byte JetBrains Mono TTF with its available 93,824-byte WOFF2 and choose an appropriate font-display strategy. Optimize the 494,240-byte background texture and roughly 1 MB Temporal screenshot after visual comparison. |
| Next | Scene cleanup only disposes the renderer on active routes | Dispose owned geometries, materials, textures, controls, and reflector render target; cancel timers and kill owned GSAP timelines. Capture the mount element for cleanup. `WaterReflector` already exposes a disposal method that Home does not call. |
| Next | Render loops run continuously and use fixed per-frame increments | Use elapsed time for consistent animation speed, pause when hidden, and reduce graphics quality on constrained devices. Measure before choosing reflection quality and resolution caps. |
| Next | Homepage lacks an h1/main landmark; navigation uses buttons; service pills imply interaction; reduced-motion handling absent | Add semantic structure, links, clear focus states, descriptive image/link text, and noninteractive styling for labels. Verify contrast and keyboard navigation in-browser. |
| Next | HTML has a generic title and lacks description/social metadata | Add a descriptive title, meta description, canonical URL, and Open Graph image. Correct the favicon MIME declaration. Consider prerendering core portfolio content once structure is settled. |
| Later | Scene setup is duplicated; active homepage mixes scene logic, content, and hundreds of CSS lines | Extract reusable scene/lifecycle logic, content data, shared navigation, and styles. Remove unused legacy code only after reference checks. |

[Vercel documents the SPA rewrite needed for Vite deep links](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas). [Chrome's rendering guidance recommends code splitting and lazy loading for large client-rendered applications](https://web.dev/articles/rendering-on-the-web). No framework migration is necessary just to simplify this portfolio or add the loader.

The large Blender/texture directories are present in the repository, but this audit does not treat all repository assets as downloaded page weight. The build output is the relevant evidence for bundled assets.

**6. Validation required during implementation**

Fix the existing seven lint errors and investigate the four effect-cleanup warnings, then require both build and lint to pass. The errors are unused imports/variables; lint success alone will not validate the experience.

Verify desktop, tablet, narrow phones, short landscape screens, and 200% zoom for readable content, reachable links, and no accidental horizontal overflow. Test keyboard-only navigation and reduced motion. Test loader behavior with warm cache, slow network, blocked fonts/textures, WebGL failure, startup failure, and route changes during transitions. Ensure no overlay remains permanently or steals focus after dismissal.

On a deployed preview, open and refresh every supported route directly, follow project links, and confirm images load with the final route shapes. Measure load performance and scene behavior on a representative mobile device. Confirm new copy against actual project repositories and résumé facts before publishing.

Recommended implementation order: route/scroll/fallback repairs → homepage hierarchy and copy → project evidence and About → lightweight loader and deferred graphics → responsive/accessibility/performance verification.
