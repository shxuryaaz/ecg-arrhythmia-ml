import { motion, useReducedMotion } from 'framer-motion'
import { synthTrace } from '../lib/wave'

export default function Hero() {
  const reduce = useReducedMotion()
  const d = synthTrace(1440, 160)
  return (
    <section className="relative overflow-hidden min-h-[86vh] flex flex-col justify-end px-5 pt-[230px] pb-14 md:pt-0 md:px-14 md:pb-20">
      <svg aria-hidden="true" className="absolute left-0 top-[40px] h-[200px] md:top-[14%] w-full md:h-[320px]" viewBox="0 0 1440 320" preserveAspectRatio="none" fill="none">
        <defs>
          <linearGradient id="sweep" x1="0" x2="1">
            <stop offset="0" stopColor="#F6F4EE" stopOpacity="1" />
            <stop offset="0.55" stopColor="#F6F4EE" stopOpacity="1" />
            <stop offset="1" stopColor="#F6F4EE" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 160H1440" stroke="#D9D5CB" strokeWidth="1" strokeDasharray="2 6" />
        <motion.path d={d} stroke="#C62D1B" strokeWidth="2.5" strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.6, ease: 'easeInOut' }} />
        {!reduce && (
          <motion.rect y="0" width="720" height="320" fill="url(#sweep)" initial={{ x: -760 }} animate={{ x: 1500 }}
            transition={{ duration: 7, ease: 'linear', repeat: Infinity, delay: 2.8 }} />
        )}
      </svg>
      <div className="relative grid grid-cols-12 gap-x-6 gap-y-8 items-end">
        <div className="col-span-12 lg:col-span-8">
          <motion.p className="eyebrow mb-5" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}>Biomedical engineering · machine learning</motion.p>
          <motion.h1 className="display text-[56px] leading-[0.98] md:text-[92px]" initial={reduce ? false : { y: 30 }} animate={{ y: 0 }} transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            Every heartbeat,<br />read by a machine.
          </motion.h1>
        </div>
        <motion.div className="col-span-12 lg:col-span-4 flex flex-col gap-5" initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
          <p className="text-[18px] leading-relaxed text-ink-2">A 24-hour Holter recording holds 100,000 beats. We trained three models to sort each one into five clinical classes, then tested them the honest way: on patients they had never seen.</p>
          <div className="flex flex-wrap gap-3">
            <a href="#playground" className="btn btn-red">Classify a real beat</a>
            <a href="#results" className="btn btn-ghost">See the results</a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
