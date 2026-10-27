import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** onnxruntime-web references its wasm by URL; the page loads it from /ort/ instead, so drop the hoisted copy. */
const dropWasm: Plugin = { name: 'drop-wasm', generateBundle(_, bundle) { for (const k of Object.keys(bundle)) if (k.endsWith('.wasm')) delete bundle[k] } }

export default defineConfig({
  plugins: [react(), tailwindcss(), dropWasm],
  optimizeDeps: { exclude: ['onnxruntime-web'] },
})
