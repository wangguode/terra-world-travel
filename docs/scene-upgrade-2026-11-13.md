# Browser scene upgrade — 2026-11-13

The scene now combines a licensed real scanned temple tower courtyard with an original Buddhist precinct and a monumental Buddha. It is inspired by the scale and procession of a mountain Buddhist sanctuary; it is not a scan or exact reconstruction of Lingshan. The city uses the Amazon Lumberyard Bistro exterior rather than the stylized Littlest Tokyo sample.

## Assets and provenance

- Jiaoshan Dinghui Temple by Metazeon, CC BY 4.0. The GitHub-distributed source embeds its creator, Sketchfab source and license in asset.extras. Source repository/commit and SHA256 are preserved in `public/models/jiaoshan-temple/source-metadata.json`; public attribution and modifications in `credits.txt`. The scanned coverage is the tower courtyard, not a full monastery. GLB geometry was unpacked into three buffers below25MiB; its atlas was resized to4096px JPEG.
- Amazon Lumberyard Bistro v5.2, CC BY 4.0, from pinned neftaly/bistro-gltf commit41b6f6ca07da385b5be8f632f440b25a03a427f5. Public attribution/license retained. Full web asset set76.5MB; largest file24.38MiB. Only the Exterior scene is displayed. Generic stone/wood/roof textures are also reused on the original temple architecture.
- Venice Sunset HDR, Poly Haven, CC0. See `assets/environment-credits.md`.
- No new npm dependency; Three.js rendering remains browser-local. No third-party executable source was downloaded or executed.

## Behavior and verification

- Model loading has progress and a lightweight local scene fallback. Bistro downloads only after selecting the city.
- Movement reads a mutable input ref; it no longer rebuilds the renderer on every key transition. Blur clears stuck keys. Pointer gestures support mouse and touch camera rotation.
- Temple waypoints: overview, gate, hall and giant Buddha. These are scene navigation viewpoints, not a complete building collision/navmesh system. Keyboard movement retains its current height; it is not guaranteed to respect every scanned wall or stair.
- Runtime measured FPS replaces the hard-coded60FPS display. Device performance varies. Mobile caps pixel ratio at1.25; desktop1.5.
- `node scripts/verify-world.mjs`: local Chrome checks actual model loading, movement, stable WebGL canvas/context, no asset reload from movement, merit interaction, mode caching, temple waypoint buttons,375px layout, console errors; outputs screenshots and JSON under `screenshots/world-verification`.
- `npm run lint`, `npm run typecheck`; production export: `npm run build -- --webpack`. The installed Turbopack build fails while binding an internal child-process port in this execution environment; official webpack build is supported and was used.

## Deployment and access diagnosis

At inspection time, https://terra-world-travel.153557421.workers.dev returned HTTP200 and all initial GLB/Draco requests200 from the checking network; the live browser rendered both worlds. That does not establish reachability from the user's network. The reported whole-domain timeout remains consistent with DNS/routing/domain reachability; no root cause has been proven on that network.

A custom domain can avoid reliance on a shared workers.dev hostname, but requires the actual domain and Cloudflare access, and must be tested from the affected network. Local Cloudflare OAuth was expired; no account/domain settings were changed. Do not assume a redeployment fixes network blocking.

Current deployment is static `out/` via `wrangler.json` assets. Build without `GITHUB_ACTIONS=true`, which currently adds a GitHub Pages basePath. Every new asset is below Cloudflare's25MiB per-file ceiling. Upload the complete export, including local model buffers/textures, decode files and license text. Do not deploy only the HTML/JS bundle.

## Limits

The current application is a Three.js interactive scene and local knowledge lookup. No14B inference backend/checkpoint or neural frame-generation stream was found in the inspected code; marketing claims are not evidence of those capabilities. This change improves rendering and assets, and does not add model inference. It does not promise film/UE5 fidelity,60FPS on all devices, full photoreal scanned monastery coverage, complete collisions, or exact Lingshan reconstruction. Existing lower-page shader demonstrations and marketing copy are outside this scene replacement.

## Visual acceptance correction

User rejected the combined scene as insufficiently photorealistic. The current branch is an experiment, NOT an accepted film-quality delivery and must not be deployed as such. Default experimental temple view now isolates the real scan from the procedural Lingshan layout (the latter is explicitly labelled a draft). Desktop restores8192px source-resolution atlas; mobile uses4096px. Close-up inspection exposed substantial geometric damage/melted eaves and incomplete vegetation in this scan; resolution does not repair those flaws. It is unsuitable as the final film-quality asset. Keep the public deployment unchanged pending a genuinely better free licensed asset and reviewed visual sample. No asset purchase is authorized; user requires free/open-source assets with realism prioritized.
