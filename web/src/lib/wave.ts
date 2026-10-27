/** Path helpers for drawing ECG beats as SVG. */

/** Polyline path for a z-scored beat sample array, fitted to w x h. */
export function beatPath(x: number[], w: number, h: number, pad = 10): string {
  const lo = Math.min(...x), hi = Math.max(...x), span = hi - lo || 1
  const sx = w / (x.length - 1), sy = (h - pad * 2) / span
  return x.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * sx).toFixed(1)} ${(h - pad - (v - lo) * sy).toFixed(1)}`).join('')
}

/** One stylised normal beat, 300 units wide, baseline at b. */
export function synthBeat(x0: number, b: number, amp = 1): string {
  const a = amp
  return `M${x0} ${b}H${x0 + 30}Q${x0 + 50} ${b - 18 * a} ${x0 + 70} ${b}H${x0 + 95}L${x0 + 103} ${b + 8 * a}L${x0 + 112} ${b - 80 * a}L${x0 + 121} ${b + 18 * a}L${x0 + 130} ${b}H${x0 + 160}Q${x0 + 187} ${b - 32 * a} ${x0 + 215} ${b}H${x0 + 300}`
}

/** A run of beats across a width. */
export function synthTrace(width: number, b: number, amp = 1, period = 300): string {
  let d = ''
  for (let x = -period; x < width + period; x += period) d += synthBeat(x, b, amp)
  return d
}
