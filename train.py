"""ECG heartbeat classification on MIT-BIH (AAMI 5-class).
Run: .venv/bin/python train.py   -> results.json + figures/*.png
"""
import json, time, numpy as np, wfdb, torch, torch.nn as nn
from pathlib import Path
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt

DATA = Path("data/mitdb"); OUT = Path("figures"); OUT.mkdir(exist_ok=True)
SEED = 0; np.random.seed(SEED); torch.manual_seed(SEED)
HALF = 90  # samples each side of the R-peak (0.5 s window at 360 Hz)
AAMI = {**{s: "N" for s in "NLRej"}, **{s: "S" for s in "AaJS"}, "V": "V", "E": "V", "F": "F", "/": "Q", "f": "Q", "Q": "Q"}
CLASSES = ["N", "S", "V", "F", "Q"]
PACED = {"102", "104", "107", "217"}
DS1 = "101 106 108 109 112 114 115 116 118 119 122 124 201 203 205 207 208 209 215 220 223 230".split()
DS2 = "100 103 105 111 113 117 121 123 200 202 210 212 213 214 219 221 222 228 231 232 233 234".split()

def load_record(rec):
    sig, meta = wfdb.rdsamp(str(DATA / rec))
    ch = meta["sig_name"].index("MLII")
    x = sig[:, ch]
    ann = wfdb.rdann(str(DATA / rec), "atr")
    keep = [(p, AAMI[s]) for p, s in zip(ann.sample, ann.symbol) if s in AAMI]
    pos = np.array([p for p, _ in keep]); lab = [l for _, l in keep]
    rr = np.diff(pos, prepend=pos[0]) / 360.0; rr[0] = rr[1]
    post = np.append(rr[1:], rr[-1]); mean_rr = rr.mean()
    X, R, y = [], [], []
    for i, (p, l) in enumerate(zip(pos, lab)):
        if p - HALF < 0 or p + HALF > len(x): continue
        b = x[p - HALF:p + HALF]; b = (b - b.mean()) / (b.std() + 1e-8)
        loc = rr[max(0, i - 10):i + 1].mean()
        X.append(b); R.append([rr[i] / mean_rr, post[i] / mean_rr, rr[i] / loc]); y.append(CLASSES.index(l))
    return np.array(X, np.float32), np.array(R, np.float32), np.array(y), np.full(len(y), rec)

recs = sorted(p.stem for p in DATA.glob("*.atr") if p.stem not in PACED)
parts = [load_record(r) for r in recs]
X = np.concatenate([p[0] for p in parts]); R = np.concatenate([p[1] for p in parts])
y = np.concatenate([p[2] for p in parts]); rec_of = np.concatenate([p[3] for p in parts])
print("beats", len(y), dict(zip(CLASSES, np.bincount(y, minlength=5).tolist())))

# figure: one example beat per class
fig, ax = plt.subplots(1, 5, figsize=(15, 2.6))
for c in range(5):
    idx = np.where(y == c)[0][:20]
    for i in idx: ax[c].plot(np.arange(-HALF, HALF) / 360, X[i], color="tab:blue", alpha=0.25, lw=0.8)
    ax[c].set_title(f"{CLASSES[c]} (n={int((y==c).sum())})"); ax[c].set_xlabel("s from R-peak")
plt.tight_layout(); plt.savefig(OUT / "beats_per_class.png", dpi=130); plt.close()

class CNN(nn.Module):
    def __init__(s):
        super().__init__()
        s.conv = nn.Sequential(nn.Conv1d(1, 32, 7, padding=3), nn.ReLU(), nn.MaxPool1d(2),
                               nn.Conv1d(32, 64, 5, padding=2), nn.ReLU(), nn.MaxPool1d(2),
                               nn.Conv1d(64, 64, 3, padding=1), nn.ReLU(), nn.AdaptiveAvgPool1d(1))
        s.fc = nn.Sequential(nn.Linear(64 + 3, 64), nn.ReLU(), nn.Dropout(0.3), nn.Linear(64, 5))
    def forward(s, x, r): return s.fc(torch.cat([s.conv(x.unsqueeze(1)).squeeze(-1), r], 1))

def train_cnn(Xtr, Rtr, ytr, Xte, Rte, epochs=12):
    dev = "mps" if torch.backends.mps.is_available() else "cpu"
    m = CNN().to(dev); opt = torch.optim.Adam(m.parameters(), 1e-3)
    w = torch.tensor(len(ytr) / (5 * np.bincount(ytr, minlength=5) + 1), dtype=torch.float32).sqrt().to(dev)
    lossf = nn.CrossEntropyLoss(weight=w)
    Xt, Rt, yt = map(lambda a: torch.tensor(a).to(dev), (Xtr, Rtr, ytr))
    for ep in range(epochs):
        m.train(); perm = torch.randperm(len(yt), device=dev)
        for i in range(0, len(yt), 256):
            b = perm[i:i + 256]; opt.zero_grad(); l = lossf(m(Xt[b], Rt[b]), yt[b]); l.backward(); opt.step()
    m.eval(); out = []
    with torch.no_grad():
        for i in range(0, len(Xte), 2048):
            out.append(m(torch.tensor(Xte[i:i+2048]).to(dev), torch.tensor(Rte[i:i+2048]).to(dev)).argmax(1).cpu())
    return torch.cat(out).numpy()

def evaluate(name, split, ytrue, ypred, t):
    rep = classification_report(ytrue, ypred, labels=range(5), target_names=CLASSES, output_dict=True, zero_division=0)
    cm = confusion_matrix(ytrue, ypred, labels=range(5))
    fig, ax = plt.subplots(figsize=(4.2, 3.8)); ax.imshow(cm, cmap="Blues")
    for i in range(5):
        for j in range(5): ax.text(j, i, cm[i, j], ha="center", va="center", fontsize=8, color="white" if cm[i, j] > cm.max()/2 else "black")
    ax.set_xticks(range(5), CLASSES); ax.set_yticks(range(5), CLASSES); ax.set_xlabel("Predicted"); ax.set_ylabel("True")
    ax.set_title(f"{name}, {split}"); plt.tight_layout(); plt.savefig(OUT / f"cm_{split}_{name}.png", dpi=130); plt.close()
    r = {"accuracy": accuracy_score(ytrue, ypred), "macro_f1": f1_score(ytrue, ypred, average="macro"),
         "per_class": {c: rep[c] for c in CLASSES}, "confusion": cm.tolist(), "train_seconds": round(t, 1)}
    print(f"{split:14s} {name:8s} acc={r['accuracy']:.4f} macroF1={r['macro_f1']:.4f} ({t:.0f}s)")
    return r

def run_models(split, tr, te):
    Xtr, Rtr, ytr, Xte, Rte, yte = X[tr], R[tr], y[tr], X[te], R[te], y[te]
    Ftr, Fte = np.hstack([Xtr, Rtr]), np.hstack([Xte, Rte])
    res = {"n_train": int(len(ytr)), "n_test": int(len(yte)), "test_counts": dict(zip(CLASSES, np.bincount(yte, minlength=5).tolist()))}
    t = time.time(); p = LogisticRegression(max_iter=2000, class_weight="balanced", C=0.5).fit(Ftr, ytr).predict(Fte)
    res["logreg"] = evaluate("logreg", split, yte, p, time.time() - t)
    t = time.time(); p = RandomForestClassifier(300, class_weight="balanced_subsample", n_jobs=-1, random_state=SEED).fit(Ftr, ytr).predict(Fte)
    res["rf"] = evaluate("rf", split, yte, p, time.time() - t)
    t = time.time(); p = train_cnn(Xtr, Rtr, ytr, Xte, Rte)
    res["cnn"] = evaluate("cnn", split, yte, p, time.time() - t)
    return res

results = {"n_beats": int(len(y)), "class_counts": dict(zip(CLASSES, np.bincount(y, minlength=5).tolist())), "records": recs}
tr, te = train_test_split(np.arange(len(y)), test_size=0.2, stratify=y, random_state=SEED)
results["intra_patient"] = run_models("intra_patient", tr, te)
tr = np.where(np.isin(rec_of, DS1))[0]; te = np.where(np.isin(rec_of, DS2))[0]
results["inter_patient"] = run_models("inter_patient", tr, te)
json.dump(results, open("results.json", "w"), indent=1)

if __name__ == "__main__":  # self-check
    assert results["intra_patient"]["rf"]["accuracy"] > 0.9, "RF should beat 90% on intra-patient split"
    print("ok")
