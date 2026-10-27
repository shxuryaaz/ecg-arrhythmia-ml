# [TITAN] [pulse-site] Playground

Status: Done
Owner: [Frontend]
Branch: titan/pulse-site (one branch, one commit per ticket)

onnxruntime-web loads the two models, beat picker (shuffle / by class), waveform draws in, probabilities animate, correct/wrong badge, model toggle, session tally, skeleton state while wasm loads.

## Comments
[Frontend] Playground in. Lazy-loads the inference chunk (77 KB) only when the section is near the viewport, wasm from /ort/, single thread so no COOP/COEP headers needed. Waveform draws in per beat, probability bars animate, mascot is a static SVG for now and pumps with CSS at the beat's RR period.
[QA] Drove it in Chrome: shuffled six beats, filtered to S, toggled the model. Predictions change, tally counts, no console errors. One S beat on the unseen model came back "Wrong, label S" which is exactly the report's finding, so that is a pass. The first build bundled a 29 MB WebGPU wasm nobody uses.
[Frontend] Switched to the onnxruntime-web/wasm entry. 14.8 MB file still lands in dist/assets because rollup hoists it, but the page loads the copy from /ort/ and never touches it. Noted for ticket 7.
[Reviewer] Flag, not a block: the wasm duplicate in dist is dead weight on the deploy. Shipper, exclude it or live with it, but decide.
