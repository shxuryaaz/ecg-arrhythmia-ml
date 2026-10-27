import { useReducedMotion } from 'framer-motion'

export type MascotState = 'calm' | 'alarmed' | 'early' | 'puzzled' | 'asleep'

const HEART = 'M98.8 183.1Q60.8 149.2 28.0 107.8Q6.5 72.9 28.7 32.5Q69.1 27.8 96.8 56.4Q99.8 70.7 103.1 59.4Q133.3 26.5 168.5 34.1Q195.4 71.6 171.1 107.8Q138.5 149.1 99.8 182.0Z'
const TRACE: Record<MascotState, string> = {
  calm: 'M47.7 122.6L61.6 122.2L67.5 117.7L74.6 121.7L80.2 122.0L82.9 128.0L87.6 96.4L92.5 131.7L96.4 121.7L103.9 122.5L119.9 121.5L131.7 122.6L151.5 122.1',
  alarmed: 'M48.0 121.8L61.6 122.4L67.4 114.8L74.5 121.5L80.1 122.1L82.4 132.7L88.2 75.1L93.3 139.6L96.7 121.5L104.0 122.5L120.1 122.3L131.9 122.3L151.5 121.7',
  early: 'M48.1 121.9L62.1 121.6L68.4 118.4L74.2 121.6L80.0 121.8L82.7 128.5L88.6 95.5L93.4 132.1L96.9 121.7L104.2 121.9L120.2 122.2L131.6 122.3L152.6 122.6',
  puzzled: 'M47.9 122.1L62.5 122.0L68.0 120.1L73.6 122.0L80.2 122.4L82.5 124.8L87.5 109.4L93.2 126.5L97.6 122.6L104.2 122.1L119.6 121.4L132.0 121.5L151.6 121.7',
  asleep: 'M48.0 122.2L62.2 121.6L67.4 121.8L73.7 122.4L80.2 122.1L83.1 122.2L87.6 121.9L92.6 122.5L96.5 122.4L103.5 122.2L119.8 121.9L132.4 121.4L151.5 122.5',
}
const TILT: Record<MascotState, number> = { calm: 0, alarmed: -6, early: 10, puzzled: 0, asleep: 0 }

function Eyes({ state }: { state: MascotState }) {
  const ink = '#15171A'
  if (state === 'alarmed') return <>
    <circle cx="76" cy="92" r="9" fill="#F6F4EE" stroke={ink} strokeWidth="3" /><circle cx="78" cy="93" r="3" fill={ink} />
    <circle cx="124" cy="92" r="9" fill="#F6F4EE" stroke={ink} strokeWidth="3" /><circle cx="126" cy="93" r="3" fill={ink} />
  </>
  if (state === 'asleep') return <>
    <path d="M66 92Q76 99 86 92" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    <path d="M114 92Q124 99 134 92" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
  </>
  return <>
    <path d="M64.4 92.6L87.4 91.6" stroke={ink} strokeWidth="3" strokeLinecap="round" /><circle cx="79" cy="90" r="2.6" fill={ink} />
    <path d="M113.7 92.7L134.3 91.3" stroke={ink} strokeWidth="3" strokeLinecap="round" /><circle cx="127" cy="90" r="2.6" fill={ink} />
    {state === 'puzzled' && <path d="M110 70Q124 62 138 72" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />}
  </>
}

/** Beat, the mascot. Static SVG for now; ticket 6 swaps the internals for the EffectCraft Lottie. `periodS` drives the pump tempo. */
export default function Mascot({ state, periodS = 0.9, size = 120 }: { state: MascotState; periodS?: number; size?: number }) {
  const reduce = useReducedMotion()
  const pump = !reduce && state !== 'asleep'
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={`Beat the mascot, ${state}`}
      style={{ transformOrigin: '50% 60%', animation: pump ? `pump ${periodS}s ease-out infinite` : undefined }}>
      <g transform={`rotate(${TILT[state]} 100 100)`} style={{ transition: 'transform 300ms ease' }}>
        <path d={HEART} fill="#F6F4EE" stroke="#15171A" strokeWidth="3.2" strokeLinejoin="round" />
        <path d={TRACE[state]} fill="none" stroke="#D4321F" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" style={{ transition: 'd 300ms ease' }} />
        <Eyes state={state} />
        {state === 'asleep' && <text x="166" y="30" fontFamily="IBM Plex Mono, monospace" fontSize="18" fill="#15171A" transform="rotate(-10 166 30)">z z</text>}
      </g>
    </svg>
  )
}
