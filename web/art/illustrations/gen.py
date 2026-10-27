"""Three section illustrations, hand-drawn line style, seeded jitter. Emits SVG files + src/components/art.tsx."""
import random, math, os
INK, RED, PAPER, MUTED, LINE = "#15171A", "#D4321F", "#F6F4EE", "#6B6760", "#D9D5CB"
def jit(pts, seed, amt=1.2):
    r = random.Random(seed); return [(x + r.uniform(-amt, amt), y + r.uniform(-amt, amt)) for x, y in pts]
def poly(pts, close=False): return "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + ("Z" if close else "")
def qpath(pts, close=False):
    d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"
    for i in range(1, len(pts) - 1, 2):
        (cx, cy), (x, y) = pts[i], pts[i + 1]; d += f"Q{cx:.1f} {cy:.1f} {x:.1f} {y:.1f}"
    return d + ("Z" if close else "")
def stroke(d, color=INK, w=2.4, fill="none", extra=""):
    return f'<path d="{d}" fill="{fill}" stroke="{color}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def beat_pts(x0, b, amp=1.0, s=1.0):
    return [(x0, b), (x0 + 10*s, b), (x0 + 14*s, b - 4*amp), (x0 + 18*s, b), (x0 + 22*s, b), (x0 + 24*s, b + 4*amp), (x0 + 28*s, b - 22*amp), (x0 + 32*s, b + 7*amp), (x0 + 35*s, b), (x0 + 42*s, b), (x0 + 48*s, b - 6*amp), (x0 + 54*s, b), (x0 + 64*s, b)]

# 1. Holter patient: torso, three electrodes, leads to a recorder on the belt
def holter(seed=11):
    g = []
    cx, cy, rr = 140, 40, 26
    g.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rr}" ry="{rr + 2}" transform="rotate(-6 {cx} {cy})" fill="{PAPER}" stroke="{INK}" stroke-width="2.4"/>')
    g.append(stroke(poly(jit([(cx - 6, cy + 8), (cx + 6, cy + 8)], seed + 5, 0.6)), INK, 2))
    neck = jit([(130, 66), (131, 80)], seed + 2); g.append(stroke(poly(neck))); g.append(stroke(poly(jit([(150, 66), (149, 80)], seed + 4))))
    torso = jit([(70, 100), (96, 82), (131, 80), (149, 80), (184, 82), (210, 100), (212, 150), (205, 200), (200, 250), (80, 250), (74, 200), (68, 150), (70, 100)], seed + 1)
    g.append(stroke(qpath(torso, True), fill=PAPER))
    # electrodes
    pads = [(118, 118), (166, 124), (142, 176)]
    for i, (x, y) in enumerate(pads):
        g.append(f'<circle cx="{x}" cy="{y}" r="7" fill="{PAPER}" stroke="{INK}" stroke-width="2.4"/><circle cx="{x}" cy="{y}" r="2.2" fill="{RED}"/>')
    # recorder on belt
    g.append(stroke(qpath(jit([(96, 232), (118, 228), (140, 232), (140, 262), (118, 266), (96, 262), (96, 232)], seed + 3), True), fill=PAPER))
    g.append(stroke(poly(beat_pts(100, 247, amp=0.5, s=0.55)), RED, 1.8))
    # leads
    for (x, y) in pads:
        pts = [(x, y + 7), ((x + 118) / 2 + 10, (y + 240) / 2 + 20), (116, 232)]
        g.append(stroke(qpath(jit(pts, seed + int(x))), MUTED, 1.6))
    # the 24 h strip coming out
    strip = []
    for k in range(4): strip += beat_pts(150 + k * 64, 290 + k * 0.5, amp=0.9, s=1.0)
    g.append(stroke(poly(jit(strip, seed + 9, 0.5)), RED, 2.0))
    g.append(f'<text x="150" y="330" font-family="IBM Plex Mono, monospace" font-size="12" fill="{MUTED}">24 h · 100,000 beats</text>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 350" role="img" aria-label="A patient wearing a Holter recorder, the strip of beats coming out">{"".join(g)}</svg>'

# 2. Seen vs unseen: 22 patient glyphs train, 22 different ones test, a dashed wall between
def split(seed=21):
    g = []
    def person(x, y, s, color):
        r = random.Random(s)
        hx, hy = x + r.uniform(-0.8, 0.8), y + r.uniform(-0.8, 0.8)
        return (f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="5" fill="{PAPER}" stroke="{color}" stroke-width="2"/>'
                f'<path d="M{x-9:.1f} {y+19:.1f}Q{x:.1f} {y+6:.1f} {x+9:.1f} {y+19:.1f}" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round"/>')
    for i in range(22):
        g.append(person(24 + (i % 11) * 20, 48 + (i // 11) * 30, seed + i, INK))
        g.append(person(260 + (i % 11) * 20, 48 + (i // 11) * 30, seed + 100 + i, RED))
    g.append(f'<path d="M236 24V128" stroke="{INK}" stroke-width="2" stroke-dasharray="4 6" stroke-linecap="round"/>')
    g.append(f'<text x="24" y="24" font-family="IBM Plex Mono, monospace" font-size="12" fill="{MUTED}">TRAIN · 22 patients</text>')
    g.append(f'<text x="260" y="24" font-family="IBM Plex Mono, monospace" font-size="12" fill="{RED}">TEST · 22 different patients</text>')
    g.append(f'<text x="24" y="150" font-family="IBM Plex Mono, monospace" font-size="11" fill="{MUTED}">the model never sees a test patient\'s heart</text>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 160" role="img" aria-label="22 training patients on the left, 22 different test patients on the right, a wall between">{"".join(g)}</svg>'

# 3. Stack of beats: rows of traces receding, most normal, a few ventricular in red
def stack(seed=31):
    g = []
    r = random.Random(seed)
    rows = 14
    for k in range(rows):
        y = 150 - k * 9; op = 0.9 - k * 0.055
        pts = []
        for j in range(6): pts += beat_pts(10 + j * 64 + k * 3, y, amp=1.0 - k * 0.02, s=1.0)
        red = r.random() < 0.22
        color = RED if red else INK
        if red:  # wide ventricular shape on one of the beats
            jj = r.randrange(6); base = 10 + jj * 64 + k * 3
            pts = [p for p in pts if not (base <= p[0] < base + 64)] + [(base, y), (base + 20, y), (base + 28, y - 30), (base + 36, y + 18), (base + 44, y + 4), (base + 64, y)]
            pts.sort(key=lambda p: p[0])
        g.append(stroke(poly(jit(pts, seed + k, 0.5)), color, 1.8, extra=f'opacity="{op:.2f}"'))
    g.append(f'<text x="10" y="184" font-family="IBM Plex Mono, monospace" font-size="12" fill="{MUTED}">×100,708 · 9 in 10 normal · V in red</text>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 196" role="img" aria-label="A stack of heartbeat traces, most normal, a few ventricular beats in red">{"".join(g)}</svg>'

arts = {"Holter": holter(), "Split": split(), "Stack": stack()}
for n, s in arts.items(): open(f"{n.lower()}.svg", "w").write(s)
tsx = "/* generated by web/art/illustrations/gen.py, do not edit by hand */\n"
for n, s in arts.items():
    body = s.replace('xmlns="http://www.w3.org/2000/svg" ', '').replace("stroke-width", "strokeWidth").replace("stroke-linecap", "strokeLinecap").replace("stroke-linejoin", "strokeLinejoin").replace("stroke-dasharray", "strokeDasharray").replace("font-family", "fontFamily").replace("font-size", "fontSize").replace("<svg ", '<svg className={className} ')
    tsx += f"export function {n}({{ className = '' }}: {{ className?: string }}) {{\n  return (\n    {body}\n  )\n}}\n\n"
open(os.path.expanduser("~/Desktop/ecg-arrhythmia-ml/web/src/components/art.tsx"), "w").write(tsx)
print("ok")
