# [TITAN] [pulse-site] Scaffold + design system

Status: Done
Owner: [Frontend]
Branch: titan/pulse-site (one branch, one commit per ticket)

Vite + React + TS + Tailwind v4 + framer-motion in web/. Fonts (Fraunces, IBM Plex Sans, IBM Plex Mono), colour tokens, nav, 12-col section grid, reduced-motion support, phone layout.

## Comments
[Frontend] Vite react-ts scaffold into web/, Tailwind v4 via the vite plugin, framer-motion, onnxruntime-web, lottie-web. Then tokens, fonts and the shell.
[Frontend] Done. create-vite refused to run non-interactively so the eight files are hand-written. Tailwind v4 theme tokens, three fonts, sticky nav that goes solid on scroll, section grid that collapses under 900px, focus rings. Build: 70 KB gzip JS, 445 ms.
[QA] Built it, opened it. Nav links point at anchors that don't exist yet, so they scroll nowhere. Not a bug until ticket 3 lands. Passing it.
[Reviewer] One thing: onnxruntime's wasm is copied into public/ort by hand. Make sure ticket 4 pins wasmPaths there or the first load will 404 and look like the model is broken.
