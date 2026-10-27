"""Mascot SVGs for EffectCraft: named groups (body, trace, eyes, brow, zz) so each can be animated. Seeded jitter."""
import random
INK, RED, PAPER = "#15171A", "#D4321F", "#F6F4EE"
def jit(pts, seed, amt=1.6):
    r = random.Random(seed); return [(x + r.uniform(-amt, amt), y + r.uniform(-amt, amt)) for x, y in pts]
def qpath(pts, close=False):
    d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"
    for i in range(1, len(pts) - 1, 2):
        (cx, cy), (x, y) = pts[i], pts[i + 1]; d += f"Q{cx:.1f} {cy:.1f} {x:.1f} {y:.1f}"
    return d + ("Z" if close else "")
HEART = [(100, 182), (60, 150), (28, 108), (6, 72), (30, 34), (68, 28), (96, 58), (100, 70), (104, 58), (132, 28), (170, 34), (194, 72), (172, 108), (140, 150), (100, 182)]
def body(seed): return f'<path d="{qpath(jit(HEART, seed), True)}" fill="{PAPER}" stroke="{INK}" stroke-width="3.2" stroke-linejoin="round"/>'
def trace(seed, amp):
    pts = [(48, 122), (62, 122), (68, 122 - 4*amp), (74, 122), (80, 122), (83, 122 + 6*amp), (88, 122 - 26*amp), (93, 122 + 10*amp), (97, 122), (104, 122), (120, 122), (132, 122), (152, 122)]
    p = jit(pts, seed, 0.6); return f'<path d="{"M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in p)}" fill="none" stroke="{RED}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>'
def eye_calm(cx, cy, seed):
    a, b = jit([(cx - 11, cy), (cx + 11, cy)], seed, 0.8)
    return f'<path d="M{a[0]:.1f} {a[1]:.1f}L{b[0]:.1f} {b[1]:.1f}" stroke="{INK}" stroke-width="3" stroke-linecap="round"/><circle cx="{cx+3}" cy="{cy-2}" r="2.6" fill="{INK}"/>'
def eye_wide(cx, cy, seed): return f'<circle cx="{cx}" cy="{cy}" r="9" fill="{PAPER}" stroke="{INK}" stroke-width="3"/><circle cx="{cx+2}" cy="{cy+1}" r="3" fill="{INK}"/>'
def eye_shut(cx, cy, seed): return f'<path d="M{cx-10} {cy}Q{cx} {cy+7} {cx+10} {cy}" fill="none" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>'
def svg(name, seed, eyes, amp=1.0, brow=False, zz=False):
    groups = [f'<g id="body">{body(seed)}</g>', f'<g id="trace">{trace(seed + 7, amp)}</g>', f'<g id="eyes">{eyes(76, 92, seed)}{eyes(124, 92, seed + 1)}</g>']
    if brow: groups.append(f'<g id="brow"><path d="M110 70Q124 62 138 72" fill="none" stroke="{INK}" stroke-width="3" stroke-linecap="round"/></g>')
    if zz: groups.append(f'<g id="zz"><path d="M150 44L162 44L150 56L162 56" fill="none" stroke="{INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M168 24L178 24L168 34L178 34" fill="none" stroke="{INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>')
    s = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">{"".join(groups)}</svg>'
    open(f"beat-{name}.svg", "w").write(s)
svg("calm", 1, eye_calm); svg("alarmed", 2, eye_wide, amp=1.8); svg("early", 3, eye_calm); svg("puzzled", 4, eye_calm, amp=0.5, brow=True); svg("asleep", 5, eye_shut, amp=0.0, zz=True)
print("ok")
