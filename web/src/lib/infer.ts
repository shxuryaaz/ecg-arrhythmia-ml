import * as ort from 'onnxruntime-web/wasm'
import { CLASSES, type Cls } from './motion'

ort.env.wasm.wasmPaths = '/ort/'
ort.env.wasm.numThreads = 1

export type ModelKey = 'seen' | 'unseen'
export type Beat = { id: number; label: Cls; record: string; beat: number; rr_s: number; mean_rr_s: number; rr: number[]; x: number[] }
export type Prediction = { probs: Record<Cls, number>; pred: Cls; ms: number }

const sessions: Partial<Record<ModelKey, Promise<ort.InferenceSession>>> = {}

export function loadModel(key: ModelKey) {
  sessions[key] ??= ort.InferenceSession.create(`/models/cnn_${key}.onnx`, { executionProviders: ['wasm'] })
  return sessions[key]!
}

export async function predict(key: ModelKey, beat: Beat): Promise<Prediction> {
  const s = await loadModel(key)
  const t0 = performance.now()
  const out = await s.run({
    beat: new ort.Tensor('float32', Float32Array.from(beat.x), [1, 180]),
    rr: new ort.Tensor('float32', Float32Array.from(beat.rr), [1, 3]),
  })
  const logits = Array.from(out.logits.data as Float32Array)
  const m = Math.max(...logits), e = logits.map(v => Math.exp(v - m)), z = e.reduce((a, b) => a + b, 0)
  const probs = Object.fromEntries(CLASSES.map((c, i) => [c, e[i] / z])) as Record<Cls, number>
  const pred = CLASSES[logits.indexOf(m)]
  return { probs, pred, ms: performance.now() - t0 }
}
