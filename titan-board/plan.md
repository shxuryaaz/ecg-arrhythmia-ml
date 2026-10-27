# [TITAN] Plan: pulse-site

Status: AWAITING APPROVAL
Project: Pulse, a public website for the ECG arrhythmia classifier
Repo: https://github.com/shxuryaaz/ecg-arrhythmia-ml (site in `web/`)
Mockups + mascot sketches: https://claude.ai/artifact/36AZAtzBA8zYH5jzx2iv8Q
Report: https://claude.ai/artifact/1rxtuTKuLBa6BjV51RmHnE

## What gets built

A single-page, no-login website that tells the project's story and lets a visitor classify real heartbeats in the browser.
Stack: Vite + React + TypeScript, Tailwind v4, framer-motion for animation, onnxruntime-web (wasm) for in-browser inference.
Look: paper-white ground, ink text, one cardiac red accent. Fraunces display, IBM Plex Sans body, IBM Plex Mono numbers.
No backend, no database, no auth. Static site, deployable to Vercel.

## Pieces, in dependency order

| # | Piece | Owner | Depends on |
| --- | --- | --- | --- |
| 1 | Model export + demo data. Export both CNNs (seen-patients and unseen-patients training) to ONNX, verify parity with PyTorch, write `beats.json` (300 DS2 test beats with labels and RR features) and a 20-beats-per-class gallery file. | Backend | none |
| 2 | Scaffold + design system. Vite/React/TS/Tailwind/framer-motion, fonts, tokens, nav, section grid, reduced-motion support, phone layout. | Frontend | none |
| 3 | Hero + story. Animated ECG trace (path draw + continuous sweep), stat counters on scroll, five class cards, dataset bars filling on view with hover beat-gallery overlays, pipeline diagram stepping in. | Frontend | 2 |
| 4 | Playground. Loads the two ONNX models, beat picker (shuffle or by class), waveform draws in, probabilities animate, true vs predicted badge, model toggle (seen vs unseen patients), running hit/miss tally. | Frontend | 1, 2 |
| 5 | Results + conclusion. Grouped F1 bars animating on scroll, two interactive confusion matrices (hover a cell for count and share), per-class table, limitations, links to PDF and repo. | Frontend | 2 |
| 6 | Art + motion, made with the ArtCraft suite. Install EffectCraft, SoundCraft and PhotoCraft from their GitHub releases (prebuilt universal Mac apps; VectorCraft is already in /Applications). Each app is driven over its JSON control port and CLI, screenshots read back after every step. Deliverables: (a) Mascot "Beat" authored as vector art in VectorCraft from the seeded generator (clean paths, 5 states), then rigged and animated in EffectCraft and exported as Lottie JSON: idle pump loop, state switches (calm, alarmed, early, puzzled), blink, wake-up from flatline. Played on the site with lottie-web; the pump loop's speed is set from the selected beat's real RR interval. (b) Three section illustrations in VectorCraft, same line style: Holter patient, 22+22 patient figures for the seen/unseen split, stack of 100k beats. (c) A heartbeat sound (lub-dub) synthesised and mastered in SoundCraft, exported as a short wav/mp3 pair, played at the beat's tempo in the playground, muted by default with a toggle. (d) OG share card 1200x630 and the favicon set composed in PhotoCraft. All source files (.vectorcraft, .ecproj, SoundCraft and PhotoCraft projects) committed under `web/art/`. | Frontend | 2 |
| 7 | Build, QA pass, deploy. Production build, Lighthouse >= 90 on performance and accessibility, phone check, Vercel deploy only on an explicit "deploy". | QA, Shipper | 3, 4, 5, 6 |
| 8 | README + run guide for `web/`. | Docs | 7 |
| 9 | Optional: 30-second site walkthrough video cut in FilmCraft (screen capture of the finished site, mascot intro, music bed). Cut if time runs short. | Frontend | 7 |

## Assumptions

- Site name is "Pulse". Easy to rename.
- The Playground is a section of the one page, reachable from the nav, not a separate route.
- The CNN is the web model (25k params, ~100 KB). The random forest is too large to ship to a browser and stays in the report.
- Report PDF goes in `web/public/` so the site can link it.
- Vercel link only after you say "deploy".

## Review thread

[Planner] Single page, four screens of story, one playground, one results block. All inference client-side so there is nothing to host but static files.

[Reviewer] Planner, two things. First, the user said frontend is graded the most, and your plan spends piece 1 on model export before a single pixel exists. Flip it: scaffold first, export runs in parallel. Second, "hover a class to see twenty beats" is useless on a phone. What happens on touch?

[Planner] Fair on order: piece 2 starts first, piece 1 runs beside it, both are independent anyway. Table updated. On touch: tap toggles the overlay, and the gallery is also shown inline in the Playground beat picker, so phone users still see real beats. Added to piece 3.

[Reviewer] One more, Planner. The user asked for mascots and animations and the first draft had neither. Where is the art?

[Planner] Added piece 6. Mascot reacts to the prediction and beats at the real RR tempo, which is the one animation that teaches something. Three illustrations, no more; the data charts are the real visuals. Sketches are on the mockup canvas.

[Reviewer] Planner, the user has the entire ArtCraft suite on this machine and your art piece used a python script and one app. EffectCraft exports Lottie. SoundCraft makes sound. Use the tools he pointed at.

[Planner] Rewrote piece 6. Generator stays as the seed (hand-drawn jitter is the look he liked on hackly), VectorCraft cleans it, EffectCraft rigs and animates it to Lottie, SoundCraft does the heartbeat audio, PhotoCraft does the share card. FilmCraft walkthrough added as an optional piece 9. Install step is three gh release downloads.

[Reviewer] Plan approved. Watch the ONNX wasm load on first visit; if it is over a second on a cold cache the playground needs a skeleton state, not a blank box.
