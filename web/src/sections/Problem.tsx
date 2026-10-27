import { motion } from 'framer-motion'
import { useReveal, CLASSES, CLASS_NAMES } from '../lib/motion'

export default function Problem() {
  const r = useReveal()
  return (
    <section id="problem" className="section">
      <p className="eyebrow section-eyebrow">01 · The problem</p>
      <div className="section-body">
        <motion.h2 {...r} className="display text-[36px] md:text-[48px] leading-[1.1]">A cardiologist cannot read 100,000 beats. A model that always says "normal" scores 90%.</motion.h2>
        <motion.p {...useReveal(0.1)} className="text-[18px] leading-[1.6] text-ink-2">Arrhythmias are irregular rhythms. Some are harmless. Ventricular ones can kill. The screening tool is a 24-hour ECG, and the bottleneck is reading it. Automated beat classification is the core problem behind every Holter analyser and wearable monitor, and it has a trap: normal beats dominate, so accuracy lies.</motion.p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {CLASSES.map((c, i) => (
            <motion.div key={c} {...useReveal(0.15 + i * 0.07)} whileHover={{ y: -4 }}
              className={`p-4 rounded-xl border ${c === 'V' ? 'border-red bg-red-tint' : 'border-line bg-card'}`}>
              <p className={`mono text-[22px] font-medium ${c === 'V' ? 'text-red' : ''}`}>{c}</p>
              <p className="mt-1.5 text-[13px] text-muted">{CLASS_NAMES[c]}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
