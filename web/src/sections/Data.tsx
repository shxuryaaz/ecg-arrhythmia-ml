import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useReveal, CLASSES, CLASS_NAMES, type Cls } from '../lib/motion'
import { beatPath } from '../lib/wave'
import { Stack } from '../components/art'

const COUNTS: Record<Cls, number> = { N: 90102, S: 2781, V: 7008, F: 802, Q: 15 }
const ORDER: Cls[] = ['N', 'V', 'S', 'F', 'Q']

export default function Data() {
  const [gallery, setGallery] = useState<Record<string, number[][]> | null>(null)
  const [active, setActive] = useState<Cls>('V')
  const reduce = useReducedMotion()
  useEffect(() => { fetch('/gallery.json').then(r => r.json()).then(setGallery).catch(() => setGallery({})) }, [])
  const max = COUNTS.N
  return (
    <section id="data" className="section !pt-0">
      <div className="section-eyebrow flex flex-col gap-8">
        <p className="eyebrow">02 · The data</p>
        <motion.div {...useReveal(0.2)} className="hidden md:block max-w-[320px]"><Stack className="w-full h-auto" /></motion.div>
      </div>
      <div className="section-body">
        <motion.h2 {...useReveal()} className="display text-[36px] md:text-[48px] leading-[1.1]">Nine in ten beats are normal.</motion.h2>
        <motion.p {...useReveal(0.1)} className="text-[18px] leading-[1.6] text-ink-2">MIT-BIH Arrhythmia Database, 44 half-hour recordings, every beat labelled by two cardiologists. Pick a class to see twenty real beats from it, overlaid.</motion.p>
        <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="flex flex-col gap-3 mono text-[14px]">
            {ORDER.map((c, i) => (
              <button key={c} onMouseEnter={() => setActive(c)} onFocus={() => setActive(c)} onClick={() => setActive(c)} aria-pressed={active === c}
                className={`grid grid-cols-[40px_1fr_80px] items-center gap-4 text-left rounded-lg px-2 py-1 -mx-2 transition-colors ${active === c ? 'bg-line-2' : ''}`}>
                <span className={active === c ? 'text-red font-medium' : ''}>{c}</span>
                <div className="h-7 flex">
                  <motion.div className={`h-7 rounded ${c === 'V' ? 'bg-red' : c === 'N' ? 'bg-ink' : 'bg-stone'}`} style={{ minWidth: 3 }}
                    initial={reduce ? false : { width: 0 }} whileInView={{ width: `${(COUNTS[c] / max) * 100}%` }} viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }} />
                </div>
                <span className="text-right">{COUNTS[c].toLocaleString('en-US')}</span>
              </button>
            ))}
          </div>
          <motion.div {...useReveal(0.2)} className="rounded-2xl border border-line bg-card p-5">
            <div className="flex justify-between items-baseline mb-2">
              <p className="text-[14px] font-semibold">{CLASS_NAMES[active]} <span className="mono text-muted font-normal">({active})</span></p>
              <p className="mono text-[12px] text-muted">20 real beats</p>
            </div>
            <svg role="img" aria-label={`Twenty overlaid ${CLASS_NAMES[active]} beats`} viewBox="0 0 280 160" className="w-full h-[160px]">
              <path d="M140 0V160" stroke="#D9D5CB" strokeDasharray="2 6" />
              {gallery?.[active]?.map((b, i) => (
                <motion.path key={active + i} d={beatPath(b, 280, 160)} fill="none" stroke={active === 'V' ? '#C62D1B' : '#15171A'} strokeWidth="1.2" strokeOpacity="0.28"
                  initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: i * 0.03 }} />
              ))}
              {!gallery && <text x="140" y="84" textAnchor="middle" className="mono" fontSize="12" fill="#6B6760">loading beats…</text>}
            </svg>
            <p className="mt-2 text-[12px] text-muted mono">−0.25 s · R-peak · +0.25 s</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
