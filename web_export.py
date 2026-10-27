"""Ticket 1: export the two CNNs to ONNX and write the playground data. Run after train.py's env exists."""
import json, numpy as np, torch, torch.nn as nn, wfdb
from pathlib import Path
from sklearn.model_selection import train_test_split
import onnxruntime as ort

DATA = Path("data/mitdb"); OUT = Path("web/public"); (OUT / "models").mkdir(parents=True, exist_ok=True)
SEED = 0; np.random.seed(SEED); torch.manual_seed(SEED)
HALF = 90
AAMI = {**{s: "N" for s in "NLRej"}, **{s: "S" for s in "AaJS"}, "V": "V", "E": "V", "F": "F", "/": "Q", "f": "Q", "Q": "Q"}
CLASSES = ["N", "S", "V", "F", "Q"]
PACED = {"102", "104", "107", "217"}
DS1 = "101 106 108 109 112 114 115 116 118 119 122 124 201 203 205 207 208 209 215 220 223 230".split()
DS2 = "100 103 105 111 113 117 121 123 200 202 210 212 213 214 219 221 222 228 231 232 233 234".split()

def load_record(rec):
    sig, meta = wfdb.rdsamp(str(DATA / rec)); x = sig[:, meta["sig_name"].index("MLII")]
    ann = wfdb.rdann(str(DATA / rec), "atr")
    keep = [(p, AAMI[s]) for p, s in zip(ann.sample, ann.symbol) if s in AAMI]
    pos = np.array([p for p, _ in keep]); lab = [l for _, l in keep]
    rr = np.diff(pos, prepend=pos[0]) / 360.0; rr[0] = rr[1]; post = np.append(rr[1:], rr[-1]); mean_rr = rr.mean()
    X, R, y, meta_rows = [], [], [], []
    for i, (p, l) in enumerate(zip(pos, lab)):
        if p - HALF < 0 or p + HALF > len(x): continue
        b = x[p - HALF:p + HALF]; b = (b - b.mean()) / (b.std() + 1e-8)
        loc = rr[max(0, i - 10):i + 1].mean()
        X.append(b); R.append([rr[i] / mean_rr, post[i] / mean_rr, rr[i] / loc]); y.append(CLASSES.index(l))
        meta_rows.append({"record": rec, "beat": i, "rr_s": round(float(rr[i]), 3), "mean_rr_s": round(float(mean_rr), 3)})
    return np.array(X, np.float32), np.array(R, np.float32), np.array(y), meta_rows

recs = sorted(p.stem for p in DATA.glob("*.atr") if p.stem not in PACED)
parts = {r: load_record(r) for r in recs}
X = np.concatenate([parts[r][0] for r in recs]); R = np.concatenate([parts[r][1] for r in recs])
y = np.concatenate([parts[r][2] for r in recs]); rec_of = np.concatenate([[r] * len(parts[r][2]) for r in recs])
meta = [m for r in recs for m in parts[r][3]]

class CNN(nn.Module):
    def __init__(s):
        super().__init__()
        s.conv = nn.Sequential(nn.Conv1d(1, 32, 7, padding=3), nn.ReLU(), nn.MaxPool1d(2),
                               nn.Conv1d(32, 64, 5, padding=2), nn.ReLU(), nn.MaxPool1d(2),
                               nn.Conv1d(64, 64, 3, padding=1), nn.ReLU(), nn.AdaptiveAvgPool1d(1))
        s.fc = nn.Sequential(nn.Linear(64 + 3, 64), nn.ReLU(), nn.Dropout(0.3), nn.Linear(64, 5))
    def forward(s, x, r): return s.fc(torch.cat([s.conv(x.unsqueeze(1)).squeeze(-1), r], 1))

def train_cnn(Xtr, Rtr, ytr, epochs=12):
    m = CNN(); opt = torch.optim.Adam(m.parameters(), 1e-3)
    w = torch.tensor(len(ytr) / (5 * np.bincount(ytr, minlength=5) + 1), dtype=torch.float32).sqrt()
    lossf = nn.CrossEntropyLoss(weight=w); Xt, Rt, yt = map(torch.tensor, (Xtr, Rtr, ytr))
    for ep in range(epochs):
        m.train(); perm = torch.randperm(len(yt))
        for i in range(0, len(yt), 256):
            b = perm[i:i + 256]; opt.zero_grad(); lossf(m(Xt[b], Rt[b]), yt[b]).backward(); opt.step()
    return m.eval()

def export(m, name):
    path = OUT / "models" / f"{name}.onnx"
    torch.onnx.export(m, (torch.zeros(1, 180), torch.zeros(1, 3)), str(path), input_names=["beat", "rr"], output_names=["logits"],
                      dynamic_axes={"beat": {0: "n"}, "rr": {0: "n"}, "logits": {0: "n"}}, opset_version=17, dynamo=False)
    s = ort.InferenceSession(str(path)); xb, rb = X[:500], R[:500]
    o = s.run(None, {"beat": xb, "rr": rb})[0]
    with torch.no_grad(): t = m(torch.tensor(xb), torch.tensor(rb)).numpy()
    assert np.abs(o - t).max() < 1e-4, f"{name} parity {np.abs(o - t).max()}"
    print(name, "exported", path.stat().st_size, "bytes, parity ok, argmax agree", (o.argmax(1) == t.argmax(1)).mean())

tr, _ = train_test_split(np.arange(len(y)), test_size=0.2, stratify=y, random_state=SEED)
export(train_cnn(X[tr], R[tr], y[tr]), "cnn_seen")
ds1 = np.where(np.isin(rec_of, DS1))[0]
m_unseen = train_cnn(X[ds1], R[ds1], y[ds1]); export(m_unseen, "cnn_unseen")

# playground beats: 300 from DS2, stratified toward the rare classes
ds2 = np.where(np.isin(rec_of, DS2))[0]; rng = np.random.default_rng(SEED)
want = {0: 140, 1: 70, 2: 60, 3: 25, 4: 7}; pick = []
for c, n in want.items():
    idx = ds2[y[ds2] == c]; pick += list(rng.choice(idx, min(n, len(idx)), replace=False))
rng.shuffle(pick)
beats = [{"id": int(i), "label": CLASSES[y[i]], "record": meta[i]["record"], "beat": meta[i]["beat"], "rr_s": meta[i]["rr_s"], "mean_rr_s": meta[i]["mean_rr_s"],
          "rr": [round(float(v), 4) for v in R[i]], "x": [round(float(v), 3) for v in X[i]]} for i in pick]
json.dump(beats, open(OUT / "beats.json", "w"), separators=(",", ":"))
gallery = {c: [[round(float(v), 3) for v in X[i]] for i in rng.choice(np.where(y == k)[0], min(20, int((y == k).sum())), replace=False)] for k, c in enumerate(CLASSES)}
json.dump(gallery, open(OUT / "gallery.json", "w"), separators=(",", ":"))
json.dump(json.load(open("results.json")), open(OUT / "results.json", "w"), separators=(",", ":"))
print("beats", len(beats), {c: sum(b["label"] == c for b in beats) for c in CLASSES}, "sizes", (OUT / "beats.json").stat().st_size, (OUT / "gallery.json").stat().st_size)
