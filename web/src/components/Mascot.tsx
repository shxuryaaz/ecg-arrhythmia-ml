import { useEffect, useRef } from 'react'
import type { AnimationItem } from 'lottie-web'
const lottie = () => import('lottie-web/build/player/lottie_light').then(m => m.default)
import { useReducedMotion } from 'framer-motion'

export type MascotState = 'calm' | 'alarmed' | 'early' | 'puzzled' | 'asleep'
const cache: Partial<Record<MascotState, Promise<object>>> = {}
const load = (s: MascotState) => (cache[s] ??= fetch(`/lottie/beat-${s}.json`).then(r => r.json()))

/** Beat, the mascot. Five EffectCraft Lotties (web/art/effectcraft). The loop is 3 beats at speed 1, so speed = 1 / RR seconds. */
export default function Mascot({ state, periodS = 0.9, size = 120 }: { state: MascotState; periodS?: number; size?: number }) {
  const box = useRef<HTMLDivElement>(null)
  const anim = useRef<AnimationItem | null>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    let live = true
    Promise.all([load(state), lottie()]).then(([data, lottie]) => {
      if (!live || !box.current) return
      anim.current?.destroy()
      box.current.style.opacity = '0'
      anim.current = lottie.loadAnimation({ container: box.current, renderer: 'svg', loop: true, autoplay: !reduce, animationData: data, rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } })
      if (reduce) anim.current.goToAndStop(3, true)
      requestAnimationFrame(() => { if (box.current) box.current.style.opacity = '1' })
    })
    return () => { live = false }
  }, [state, reduce])

  useEffect(() => { anim.current?.setSpeed(state === 'asleep' ? 1 : 1 / periodS) }, [periodS, state])
  useEffect(() => () => anim.current?.destroy(), [])

  return <div ref={box} role="img" aria-label={`Beat the mascot, ${state}`} style={{ width: size, height: size, transition: 'opacity 240ms ease' }} />
}
