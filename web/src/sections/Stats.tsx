import Count from '../components/Count'

const cells = [
  { n: 100708, label: 'labelled heartbeats' },
  { n: 44, label: 'patients, MIT-BIH, PhysioNet' },
  { n: 3, label: 'models, two test protocols' },
]

export default function Stats() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 border-y border-line">
      {cells.map((c, i) => (
        <div key={c.label} className={`px-5 py-7 md:px-14 md:py-8 ${i < 3 ? 'md:border-r' : ''} ${i % 2 === 0 ? 'border-r md:border-r' : ''} border-line`}>
          <p className="mono text-[36px] md:text-[44px] font-medium leading-none"><Count to={c.n} /></p>
          <p className="mt-2 text-[14px] text-muted">{c.label}</p>
        </div>
      ))}
      <div className="px-5 py-7 md:px-14 md:py-8">
        <p className="mono text-[36px] md:text-[44px] font-medium leading-none text-red">0.90 <span className="text-stone-2">→</span> 0.48</p>
        <p className="mt-2 text-[14px] text-muted">macro F1, seen vs unseen patients</p>
      </div>
    </section>
  )
}
