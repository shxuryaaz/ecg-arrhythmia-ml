import { useEffect, useState } from 'react'

const links = [
  ['#problem', 'Problem'], ['#data', 'Data'], ['#playground', 'Playground'], ['#results', 'Results'], ['#report', 'Report'],
]

export default function Nav() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <nav className={`sticky top-0 z-40 flex items-center justify-between px-5 py-4 md:px-14 md:py-6 border-b transition-colors ${solid ? 'bg-paper/90 backdrop-blur border-line' : 'border-transparent'}`}>
      <a href="#top" className="flex items-center gap-2.5 font-semibold tracking-wide text-[16px] no-underline">
        <svg aria-hidden="true" width="28" height="16" viewBox="0 0 28 16" fill="none" stroke="#D4321F" strokeWidth="2" strokeLinejoin="round"><path d="M0 9h6l3-7 4 13 3-9 2 3h10" /></svg>
        PULSE
      </a>
      <div className="hidden md:flex gap-8 text-[14px] font-medium">
        {links.map(([href, label]) => <a key={href} href={href} className="no-underline hover:text-red transition-colors">{label}</a>)}
      </div>
      <a href="#playground" className="btn btn-ink !py-2.5 !px-4 !text-[14px]">Try the classifier</a>
    </nav>
  )
}
