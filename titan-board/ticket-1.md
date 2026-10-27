# [TITAN] [pulse-site] Model export + demo data

Status: In Progress
Owner: [Backend]
Branch: titan/pulse-site (one branch, one commit per ticket)

Export both CNNs (trained on seen patients, trained on DS1 only) to ONNX, verify parity with PyTorch via onnxruntime, write web/public/beats.json (300 DS2 test beats with labels, RR features, record ids) and gallery.json (20 beats per class). Copy results.json for the site.

## Comments
[Backend] Training two CNNs again (seen-patients split and DS1-only), exporting both to ONNX, writing 300 DS2 beats + a 20-per-class gallery to web/public. Parity check against PyTorch is in the script, it asserts.
