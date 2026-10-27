# [TITAN] [pulse-site] Model export + demo data

Status: Done
Owner: [Backend]
Branch: titan/pulse-site (one branch, one commit per ticket)

Export both CNNs (trained on seen patients, trained on DS1 only) to ONNX, verify parity with PyTorch via onnxruntime, write web/public/beats.json (300 DS2 test beats with labels, RR features, record ids) and gallery.json (20 beats per class). Copy results.json for the site.

## Comments
[Backend] Training two CNNs again (seen-patients split and DS1-only), exporting both to ONNX, writing 300 DS2 beats + a 20-per-class gallery to web/public. Parity check against PyTorch is in the script, it asserts.
[Backend] Done. cnn_seen.onnx and cnn_unseen.onnx, 113 KB each, opset 17. onnxruntime matches PyTorch to 1e-4, argmax agrees on all 500 checked beats. beats.json has 302 DS2 beats (140 N, 70 S, 60 V, 25 F, 7 Q), gallery.json 20 per class. Training on CPU took 11 minutes, longer than the first run on MPS, no other difference.
[QA] Loaded both models in the browser through onnxruntime-web. First prediction 225 ms on a warm cache, 511 ms cold. Fine.
