import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useReveal, CLASSES, type Cls } from '../lib/motion'
import results from '../data/results.json'

type ModelKey = 'logreg' | 'rf' | 'cnn'
type Split = 'intra_patient' | 'inter_patient'
const MODELS: [ModelKey, string][] = [['logreg', 'Logistic regression'], ['rf', 'Random forest'], ['cnn', '1D CNN']]
const SPLITS: [Split, string][] = [['intra_patient', 'seen patients'], ['inter_patient', 'unseen patients']]
type R = { accuracy: number; macro_f1: number; per_class: Record<string, { precision: number; recall: number; 'f1-score': number }>; confusion: number[][] }
const get = (s: Split, m: ModelKey) => (results as unknown as Record<Split, Record<ModelKey, R>>)[s][m]
const f1_4 = (r: R) => ['N', 'S', 'V', 'F'].reduce((a, c) => a + r.per_class[c]['f1-score'], 0) / 4

export default function Results() {
  const reduce = useReducedMotion()
  const [m, setM] = useState<ModelKey>('cnn')
  const [s, setS] = useState<Split>('inter_patient')
  const [hover, setHover] = useState<[number, number] | null>(null)
  const r = get(s, m); const cm = r.confusion; const rowSum = cm.map(row => row.reduce((a, b) => a + b, 0)); const maxOff = Math.max(...cm.flatMap((row, i) => row.filter((_, j) => j !== i)))
  const H = 220
  return (
    <section id="results" className="section !pt-0">
      <p className="eyebrow section-eyebrow">05 · Results</p>
      <div className="section-body">
        <motion.h2 {...useReveal()} className="display text-[36px] md:text-[48px] leading-[1.1]">Scores halve on patients the models never saw.</motion.h2>
        <motion.p {...useReveal(0.1)} className="text-[18px] leading-[1.6] text-ink-2">Macro F1 over the four populated classes. Grey is the usual random split, where every patient is in both train and test. Red is the honest one: 22 patients for training, 22 different patients for testing.</motion.p>
      </div>

      <div className="col-span-12 mt-10 grid lg:grid-cols-12 gap-6 items-start">
        <motion.div {...useReveal(0.15)} className="lg:col-span-7 rounded-2xl border border-line bg-card p-6 md:p-7 flex flex-col gap-6">
          <div className="flex flex-wrap justify-between items-baseline gap-2">
            <p className="text-[14px] font-semibold">Macro F1 by model and split</p>
            <div className="flex gap-4 text-[12px] text-muted">
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-stone-2 inline-block" />seen patients</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red inline-block" />unseen patients</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 md:gap-8 border-b border-line px-1" style={{ height: H + 24 }}>
            {MODELS.map(([k]) => (
              <div key={k} className="flex gap-2.5 items-end justify-center h-full">
                {SPLITS.map(([sp]) => {
                  const v = f1_4(get(sp, k))
                  return (
                    <div key={sp} className="flex flex-col items-center justify-end gap-1.5 h-full">
                      <span className={`mono text-[13px] ${sp === 'inter_patient' && k === 'cnn' ? 'font-medium' : ''}`}>{v.toFixed(2)}</span>
                      <motion.div className={`w-10 md:w-12 rounded-t ${sp === 'inter_patient' ? 'bg-red' : 'bg-stone-2'}`}
                        initial={reduce ? false : { height: 0 }} whileInView={{ height: v * H }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 md:gap-8 text-center text-[13px] md:text-[14px]">{MODELS.map(([k, n]) => <span key={k}>{n}</span>)}</div>
          <table className="w-full text-[13px] mono border-t border-line pt-2">
            <thead><tr className="text-muted text-left"><th className="font-normal py-2">Unseen patients</th><th className="font-normal">Acc.</th><th className="font-normal">N</th><th className="font-normal">S</th><th className="font-normal">V</th><th className="font-normal">F</th></tr></thead>
            <tbody>{MODELS.map(([k, n]) => { const x = get('inter_patient', k); return (
              <tr key={k} className="border-t border-line-2"><td className="py-2 font-sans">{n}</td><td>{(x.accuracy * 100).toFixed(1)}%</td>{['N', 'S', 'V', 'F'].map(c => <td key={c} className={x.per_class[c]['f1-score'] < 0.2 ? 'text-red' : ''}>{x.per_class[c]['f1-score'].toFixed(2)}</td>)}</tr>) })}</tbody>
          </table>
          <p className="text-[12px] text-muted -mt-3">Per-class F1 on unseen patients. Red marks a class the model essentially cannot find.</p>
        </motion.div>

        <motion.div {...useReveal(0.25)} className="lg:col-span-5 rounded-2xl border border-line bg-card p-6 flex flex-col gap-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <p className="text-[14px] font-semibold">Confusion matrix</p>
            <div className="flex gap-1.5">
              {MODELS.map(([k]) => <button key={k} onClick={() => setM(k)} aria-pressed={m === k} className={`mono text-[12px] px-2.5 py-1 rounded-full border transition-colors ${m === k ? 'bg-ink text-paper border-ink' : 'border-line'}`}>{k}</button>)}
            </div>
          </div>
          <div className="flex border border-line rounded-full p-[3px] self-start">
            {SPLITS.map(([sp, n]) => <button key={sp} onClick={() => setS(sp)} aria-pressed={s === sp} className={`text-[12px] font-medium py-1 px-3 rounded-full ${s === sp ? 'bg-ink text-paper' : 'text-muted'}`}>{n}</button>)}
          </div>
          <div className="grid grid-cols-[28px_repeat(5,minmax(0,1fr))] gap-1 mono text-[12px] text-center" onMouseLeave={() => setHover(null)}>
            <span /><span className="text-muted">N</span><span className="text-muted">S</span><span className="text-muted">V</span><span className="text-muted">F</span><span className="text-muted">Q</span>
            {CLASSES.map((rc, i) => [
              <span key={rc + 'l'} className="text-muted self-center">{rc}</span>,
              ...CLASSES.map((pc, j) => {
                const v = cm[i][j]; const diag = i === j; const share = rowSum[i] ? v / rowSum[i] : 0
                const bg = diag ? (v > 0 ? '#15171A' : '#F6F4EE') : v === 0 ? '#F6F4EE' : v > maxOff * 0.5 ? '#C62D1B' : v > maxOff * 0.1 ? '#D9D5CB' : '#EDEAE2'
                const fg = diag && v > 0 ? '#F6F4EE' : v > maxOff * 0.5 && !diag ? '#fff' : '#15171A'
                return (
                  <button key={rc + pc} onMouseEnter={() => setHover([i, j])} onFocus={() => setHover([i, j])} aria-label={`${v} ${rc} beats predicted ${pc}`}
                    className="py-2.5 rounded-md transition-transform hover:scale-105" style={{ background: bg, color: fg, outline: hover && hover[0] === i && hover[1] === j ? '2px solid #C62D1B' : undefined }}>
                    {v.toLocaleString('en-US')}
                  </button>
                )
              }),
            ])}
          </div>
          <p className="text-[13px] leading-relaxed text-muted min-h-[40px]">
            {hover ? `${cm[hover[0]][hover[1]].toLocaleString('en-US')} beats the cardiologist called ${CLASSES[hover[0]]} were predicted ${CLASSES[hover[1]]} (${(100 * cm[hover[0]][hover[1]] / (rowSum[hover[0]] || 1)).toFixed(1)}% of that row).`
              : 'Rows are the cardiologist’s label, columns the model’s. Hover a cell.'}
          </p>
        </motion.div>
      </div>

      <div className="col-span-12 mt-10 grid grid-cols-12 gap-x-6 gap-y-5">
        <p className="eyebrow col-span-12 md:col-span-4">06 · What it means</p>
        <div className="col-span-12 md:col-span-8 grid sm:grid-cols-2 gap-4">
          {[
            ['Ventricular beats transfer', 'A wide QRS looks the same in every patient. 0.90 F1 on unseen hearts for both strong models.'],
            ['Supraventricular beats do not', 'Normal shape, early timing. Three RR features were not enough to carry that rule across patients.'],
            ['Accuracy lies', '94% on unseen patients sounds fine. Always saying "normal" scores 89%. Macro F1 is the number to read.'],
            ['Not a medical device', 'One lead, 44 patients, recorded in the 1970s. A course project, tested honestly, nothing more.'],
          ].map(([t, d], i) => (
            <motion.div key={t} {...useReveal(i * 0.08)} className="p-6 rounded-2xl border border-line flex flex-col gap-2">
              <p className="text-[15px] font-semibold">{t}</p>
              <p className="text-[14px] leading-[1.55] text-ink-2">{d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
