import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'

export default function Count({ to, suffix = '', className = '' }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!ref.current) return
    if (!inView || reduce) { ref.current.textContent = to.toLocaleString('en-US') + suffix; return }
    const c = animate(0, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: v => { if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('en-US') + suffix } })
    return () => c.stop()
  }, [inView, to, suffix, reduce])
  return <span ref={ref} className={className}>0{suffix}</span>
}
