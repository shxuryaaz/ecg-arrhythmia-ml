import { motion } from 'framer-motion'
import { useReveal } from '../lib/motion'

const steps = [
  ['MIT-BIH records', '44 records, 30 min each, lead MLII at 360 Hz, cardiologist labels'],
  ['Beat segmentation', '90 samples each side of the R-peak, z-scored per beat'],
  ['Feature vector', '180 waveform samples plus 3 RR-interval ratios'],
  ['Three models', 'logistic regression, random forest, 1D CNN'],
  ['Evaluation', 'random split vs unseen patients, macro F1, confusion matrix'],
]

export default function Pipeline() {
  return (
    <section className="section !pt-0">
      <p className="eyebrow section-eyebrow">03 · The pipeline</p>
      <div className="section-body">
        <motion.h2 {...useReveal()} className="display text-[36px] md:text-[48px] leading-[1.1]">One script, raw recordings to a per-class score.</motion.h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 list-none p-0 m-0">
          {steps.map(([t, d], i) => (
            <motion.li key={t} {...useReveal(i * 0.12)} className={`relative p-4 rounded-xl border ${i === 3 ? 'border-red bg-red-tint' : 'border-line bg-card'}`}>
              <p className="mono text-[12px] text-muted">0{i + 1}</p>
              <p className="mt-1 text-[15px] font-semibold">{t}</p>
              <p className="mt-1.5 text-[13px] leading-snug text-muted">{d}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
