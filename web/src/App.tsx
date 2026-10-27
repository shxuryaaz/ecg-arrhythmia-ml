import Nav from './components/Nav'

export default function App() {
  return (
    <div id="top" className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <section id="problem" className="section"><p className="eyebrow section-eyebrow">01 · The problem</p><div className="section-body"><h2 className="display text-5xl">Scaffold</h2></div></section>
      </main>
      <footer id="report" className="mt-auto flex flex-col md:flex-row gap-3 justify-between md:items-center px-5 md:px-14 py-7 border-t border-line text-[14px] text-muted">
        <span>Data: MIT-BIH Arrhythmia Database, PhysioNet (ODC-By)</span>
        <div className="flex gap-6"><a href="/report.pdf">Full report (PDF)</a><a href="https://github.com/shxuryaaz/ecg-arrhythmia-ml">Source code</a></div>
      </footer>
    </div>
  )
}
