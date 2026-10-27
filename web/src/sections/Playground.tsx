import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { CLASSES, CLASS_NAMES, type Cls, useReveal } from '../lib/motion'
import { beatPath } from '../lib/wave'
import type { Beat, ModelKey, Prediction } from '../lib/infer'
const infer = () => import('../lib/infer')
import Mascot, { type MascotState } from '../components/Mascot'
import { Split } from '../components/art'

const MASCOT: Record<Cls, MascotState> = { N: 'calm', S: 'early', V: 'alarmed', F: 'puzzled', Q: 'puzzled' }

export default function Playground() {
  const ref = useRef<HTMLElement>(null)
  const near = useInView(ref, { once: true, margin: '400px' })
  const reduce = useReducedMotion()
  const [beats, setBeats] = useState<Beat[]>([])
  const [ready, setReady] = useState<Record<ModelKey, boolean>>({ seen: false, unseen: false })
  const [model, setModel] = useState<ModelKey>('unseen')
  const [filter, setFilter] = useState<Cls | 'any'>('any')
  const [beat, setBeat] = useState<Beat | null>(null)
  const [pred, setPred] = useState<Prediction | null>(null)
  const [tally, setTally] = useState<{ ok: boolean; label: Cls; pred: Cls }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sound, setSound] = useState(false)
  const audio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!near) return
    fetch('/beats.json').then(r => r.json()).then((b: Beat[]) => { setBeats(b); setBeat(b.find(x => x.label === 'V') ?? b[0]) }).catch(() => setError('Could not load the beats.'))
    for (const k of ['unseen', 'seen'] as ModelKey[]) infer().then(m => m.loadModel(k)).then(() => setReady(r => ({ ...r, [k]: true }))).catch(e => setError(`Model failed to load: ${String(e)}`))
  }, [near])

  useEffect(() => {
    if (!beat || !ready[model]) return
    let live = true
    infer().then(m => m.predict(model, beat)).then(p => { if (live) { setPred(p); setTally(t => [...t.slice(-23), { ok: p.pred === beat.label, label: beat.label, pred: p.pred }]) } })
    return () => { live = false }
  }, [beat, model, ready])

  const shuffle = useCallback((cls: Cls | 'any' = filter) => {
    const pool = beats.filter(b => (cls === 'any' || b.label === cls) && b.id !== beat?.id)
    if (pool.length) setBeat(pool[Math.floor(Math.random() * pool.length)])
  }, [beats, filter, beat])

  useEffect(() => {
    if (!sound || !beat) return
    audio.current ??= new Audio('/sfx/lubdub.wav')
    const a = audio.current; const period = Math.min(2, Math.max(0.35, beat.rr_s)) * 1000
    const tick = () => { a.currentTime = 0; a.play().catch(() => setSound(false)) }
    tick(); const id = window.setInterval(tick, period)
    return () => { window.clearInterval(id); a.pause() }
  }, [sound, beat])

  const loading = !ready[model] || !beat
  const state: MascotState = loading || !pred ? 'asleep' : MASCOT[pred.pred]
  const right = tally.filter(t => t.ok).length

  return (
    <section id="playground" ref={ref} className="section">
      <p className="eyebrow section-eyebrow">04 · Playground</p>
      <div className="section-body !gap-5">
        <motion.h2 {...useReveal()} className="display text-[36px] md:text-[48px] leading-[1.1]">Pick a real beat. The model runs in your browser.</motion.h2>
        <motion.p {...useReveal(0.1)} className="text-[18px] leading-[1.6] text-ink-2">300 beats from patients the model never trained on. Nothing leaves this page: the network is about 100 KB and runs on your CPU.</motion.p>
      </div>
      <div className="col-span-12 mt-10 grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => shuffle()} disabled={!beats.length} className="btn btn-ink !py-2.5 !px-4 !text-[14px] disabled:opacity-50">Shuffle beat</button>
              {(['any', ...CLASSES.filter(c => c !== 'Q')] as (Cls | 'any')[]).map(c => (
                <button key={c} onClick={() => { setFilter(c); shuffle(c) }} aria-pressed={filter === c}
                  className={`mono text-[14px] py-2.5 px-3.5 rounded-full border transition-colors ${filter === c ? 'border-red bg-red-tint text-red' : 'border-line hover:border-ink'}`}>{c}</button>
              ))}
            </div>
            <div className="flex items-center gap-2.5 text-[13px] text-muted">
              <button onClick={() => setSound(v => !v)} aria-pressed={sound} title={sound ? 'Mute the heartbeat' : 'Play a heartbeat at this beat\u2019s tempo'}
                className={`mono text-[12px] py-1.5 px-3 rounded-full border transition-colors ${sound ? 'border-red text-red bg-red-tint' : 'border-line hover:border-ink'}`}>{sound ? 'sound on' : 'sound off'}</button>
              <span>Model trained on</span>
              <div className="flex border border-line rounded-full p-[3px]">
                {(['seen', 'unseen'] as ModelKey[]).map(k => (
                  <button key={k} onClick={() => setModel(k)} aria-pressed={model === k}
                    className={`text-[13px] font-medium py-1.5 px-3 rounded-full transition-colors ${model === k ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}>{k} patients</button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl border border-line bg-card p-5 md:p-7">
            <div className="flex justify-between mono text-[12px] text-muted mb-3">
              <span>{beat ? `record ${beat.record} · beat ${beat.beat.toLocaleString('en-US')} · lead MLII` : 'loading beats…'}</span>
              <span className="hidden sm:inline">0.5 s window · 360 Hz · z-scored</span>
            </div>
            <svg role="img" aria-label={beat ? `Selected heartbeat, cardiologist label ${CLASS_NAMES[beat.label]}` : 'Waveform'} viewBox="0 0 800 300" preserveAspectRatio="none" className="w-full h-[220px] md:h-[300px] block" fill="none">
              <path d="M0 150H800" stroke="#D9D5CB" strokeDasharray="2 6" />
              <path d="M400 0V300" stroke="#D9D5CB" strokeDasharray="2 6" />
              <AnimatePresence mode="wait">
                {beat && (
                  <motion.path key={beat.id} d={beatPath(beat.x, 800, 300, 20)} stroke="#C62D1B" strokeWidth="2.5" strokeLinejoin="round"
                    initial={reduce ? false : { pathLength: 0, opacity: 0.6 }} animate={{ pathLength: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: 'easeInOut' }} />
                )}
              </AnimatePresence>
            </svg>
            <div className="flex justify-between mono text-[12px] text-muted mt-2"><span>−0.25 s</span><span>R-peak</span><span>+0.25 s</span></div>
          </div>

          <div className="grid grid-cols-3 gap-3 mono text-[13px]">
            {[['RR before', beat?.rr[0]], ['RR after', beat?.rr[1]], ['vs local mean', beat?.rr[2]]].map(([l, v]) => (
              <div key={l as string} className="p-3.5 rounded-xl border border-line bg-card">
                <p className="text-[12px] text-muted">{l as string}</p>
                <p className="mt-1 text-[18px]">{typeof v === 'number' ? `${v.toFixed(2)}×` : '–'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="rounded-2xl border border-line bg-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-baseline">
              <p className="text-[13px] text-muted">Prediction</p>
              <p className="mono text-[12px] text-muted">{pred ? `${pred.ms.toFixed(0)} ms` : loading ? 'loading model…' : ''}</p>
            </div>
            <div className="flex items-center gap-4">
              <Mascot state={state} periodS={beat ? Math.min(2, Math.max(0.35, beat.rr_s)) : 0.9} size={104} />
              <div className="min-w-0">
                <AnimatePresence mode="wait">
                  <motion.p key={pred?.pred ?? 'none'} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className={`display text-[64px] leading-none ${pred?.pred === 'V' ? 'text-red' : ''}`} style={{ fontWeight: 500 }}>{pred?.pred ?? '·'}</motion.p>
                </AnimatePresence>
                <p className="mt-1 text-[15px] font-semibold">{pred ? CLASS_NAMES[pred.pred] : loading ? 'Waking up' : ''}</p>
                {pred && beat && (
                  <p className={`mt-1 text-[13px] font-medium ${pred.pred === beat.label ? 'text-green' : 'text-red'}`}>
                    {pred.pred === beat.label ? 'Correct' : 'Wrong'} · cardiologist label {beat.label}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2.5 mono text-[13px]">
              {CLASSES.map(c => {
                const p = pred?.probs[c] ?? 0
                return (
                  <div key={c} className="grid grid-cols-[24px_1fr_52px] items-center gap-3">
                    <span>{c}</span>
                    <div className="flex"><motion.div className={`h-2.5 rounded-full ${pred?.pred === c ? 'bg-red' : 'bg-stone'}`} style={{ minWidth: 2 }}
                      animate={{ width: `${Math.max(p * 100, 0.5)}%` }} transition={{ duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }} /></div>
                    <span className="text-right">{p.toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
            {error && <p className="text-[13px] text-red">{error}</p>}
          </div>

          <Split className="w-full h-auto" />
          <div className="rounded-2xl border border-line p-5 flex flex-col gap-3">
            <p className="text-[13px] text-muted">Your session</p>
            <div className="flex justify-between mono text-[14px]">
              <span>{tally.length} {tally.length === 1 ? 'beat' : 'beats'} tried</span>
              <span className="text-green">{right} right</span>
              <span className="text-red">{tally.length - right} wrong</span>
            </div>
            <div className="flex gap-1 min-h-[6px]">
              {tally.map((t, i) => <motion.div key={i} layout className={`h-1.5 flex-1 rounded-full ${t.ok ? 'bg-green' : 'bg-red'}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} />)}
            </div>
            <p className="text-[13px] leading-relaxed text-muted">
              {tally.length === 0 ? 'Shuffle a few beats. Try an S beat on the unseen-patients model.' :
                tally.some(t => !t.ok && t.label === 'S') ? 'The misses are S beats called N. That is the model’s known weakness on unseen patients.' :
                model === 'seen' ? 'This model saw these patients in training, so it looks better than it is.' : 'Switch to the seen-patients model to see how much a leaky split flatters the score.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
