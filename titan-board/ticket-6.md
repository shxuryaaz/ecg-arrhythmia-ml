# [TITAN] [pulse-site] Art + motion (ArtCraft suite)

Status: Done
Owner: [Frontend]
Branch: titan/pulse-site (one branch, one commit per ticket)

Install EffectCraft, SoundCraft, PhotoCraft. Mascot in VectorCraft -> EffectCraft Lottie (pump loop, states, blink, wake). Three illustrations. Lub-dub in SoundCraft. OG card + favicons in PhotoCraft. Sources under web/art/.

## Comments
[Frontend] Pulling EffectCraft 0.17, SoundCraft 0.13.1, PhotoCraft 0.16 from GitHub releases plus their CLIs. VectorCraft is already installed.
[Frontend] Pipeline that actually ran: gen.py (seeded jitter) writes five mascot SVGs with named groups -> EffectCraft edit.pasteSvg keeps the group names -> keyframes on the layer scale (pump, 3 beats per 3 s loop), eyes-group scale (blink), rotation wobble for alarmed, zz drift for asleep -> file.exportLottie, 6 to 8 KB each. Site loads them with lottie-web light and sets speed = 1/RR so the heart pumps at the real tempo. Three illustrations from a second generator, opened and saved as .vectorcraft in VectorCraft over port 7979 with screenshots as proof. Lub-dub synthesised in numpy, mastered by soundcraft-cli convert --normalize, played on a timer at the beat's RR when the sound toggle is on. OG card: Chrome renders the layout, PhotoCraft sets the two Fraunces title lines (type.create) and exports og.png plus the 180 px touch icon (image.imageSize).
[QA] Lottie mounts (one svg in the mascot box), state follows the prediction, sound toggle flips. The alarmed render frame from EffectCraft has a black background, that is just the proof PNG being transparent. No console errors.
[Reviewer] The PhotoCraft title came out heavier than the site's Fraunces 300. Not blocking, the card still reads. Flagging it for next time: pass the weight explicitly.
[Frontend] Noted. FilmCraft was not installed and ticket 9 is optional, so no video this run.
