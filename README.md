# ECG arrhythmia classification on MIT-BIH

Heartbeat classification into the five AAMI classes (N, S, V, F, Q) from single-lead ECG, using the public MIT-BIH Arrhythmia Database. Logistic regression, random forest and a small 1D CNN, evaluated on both a random (intra-patient) split and the de Chazal inter-patient DS1/DS2 split.

## Run

```
uv venv --python 3.11 .venv
uv pip install --python .venv/bin/python wfdb scikit-learn pandas numpy matplotlib torch
mkdir -p data/mitdb && cd data/mitdb
for r in 100 101 102 103 104 105 106 107 108 109 111 112 113 114 115 116 117 118 119 121 122 123 124 200 201 202 203 205 207 208 209 210 212 213 214 215 217 219 220 221 222 223 228 230 231 232 233 234; do for e in dat hea atr; do echo "https://physionet-open.s3.amazonaws.com/mitdb/1.0.0/$r.$e"; done; done | xargs -n1 -P8 curl -sS -O
cd ../.. && .venv/bin/python train.py
```

Outputs `results.json` and `figures/`. Runs in about two minutes on a laptop.

## Results (macro F1 over N, S, V, F)

| Model | Intra-patient | Inter-patient |
| --- | --- | --- |
| Logistic regression | 0.60 | 0.49 |
| Random forest | 0.90 | 0.48 |
| 1D CNN | 0.85 | 0.52 |

Data: Moody & Mark, MIT-BIH Arrhythmia Database, PhysioNet (ODC-By licence).
