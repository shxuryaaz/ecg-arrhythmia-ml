import { useReducedMotion } from 'framer-motion'

/** Shared reveal-on-scroll props. Respects prefers-reduced-motion. */
export function useReveal(delay = 0) {
  const reduce = useReducedMotion()
  if (reduce) return { initial: false as const, whileInView: undefined, viewport: undefined, transition: undefined }
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay },
  }
}

export const CLASS_NAMES: Record<string, string> = {
  N: 'Normal', S: 'Supraventricular', V: 'Ventricular', F: 'Fusion', Q: 'Unknown',
}
export const CLASSES = ['N', 'S', 'V', 'F', 'Q'] as const
export type Cls = (typeof CLASSES)[number]
