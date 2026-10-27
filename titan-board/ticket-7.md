# [TITAN] [pulse-site] Build, QA pass, deploy

Status: Done
Owner: [QA, Shipper]
Branch: titan/pulse-site (one branch, one commit per ticket)

Production build, Lighthouse >= 90 perf/a11y, phone check, Vercel deploy only on an explicit 'deploy'.

## Comments
[QA] Lighthouse on the production build, first pass: performance 79, accessibility 96, best practices 100, SEO 91. LCP 4.0 s because the hero copy animated from opacity 0 and lottie-web sat in the main chunk. Two contrast failures, both the red on the tint. Sound button's aria-label did not include its visible text.
[Frontend] Fixed all four: headline slides in without fading, lottie split into its own 48 KB chunk, red darkened to clear 4.5:1 on the tint and on white, sound button uses a title instead. Also a tiny Vite plugin drops the 15 MB wasm rollup was hoisting into dist, the page loads it from /ort/ anyway.
[QA] Second Lighthouse pass: performance 96, accessibility 100, best practices 100, SEO 100. LCP 2.3 s, CLS 0.06. Phone and desktop full-page shots clean. Deploy is parked until the user says "deploy".
[Reviewer] Approve. dist is 2 MB of site plus the 15 MB wasm under /ort, which is what the browser actually fetches once and caches.
