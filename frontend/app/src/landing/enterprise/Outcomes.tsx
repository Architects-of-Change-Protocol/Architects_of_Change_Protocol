import { IconCircle, SectionHeader } from './primitives';

const ICONS: Record<string, string> = {
  shield:
    'M208,40H48A16,16,0,0,0,32,56v56c0,52.72,25.52,84.67,46.93,102.19,23.06,18.86,46,25.26,47,25.53a8,8,0,0,0,4.2,0c1-.27,23.91-6.67,47-25.53C198.48,196.67,224,164.72,224,112V56A16,16,0,0,0,208,40Zm0,72c0,37.07-13.66,67.16-40.6,89.42A129.3,129.3,0,0,1,128,223.62a128.25,128.25,0,0,1-38.92-21.81C61.82,179.51,48,149.3,48,112l0-56,160,0ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z',
  plug: 'M237.66,18.34a8,8,0,0,0-11.32,0l-52.4,52.41-5.37-5.38a32.05,32.05,0,0,0-45.26,0L100,88.69l-6.34-6.35A8,8,0,0,0,82.34,93.66L88.69,100,65.37,123.31a32,32,0,0,0,0,45.26l5.38,5.37-52.41,52.4a8,8,0,0,0,11.32,11.32l52.4-52.41,5.37,5.38a32,32,0,0,0,45.26,0L156,167.31l6.34,6.35a8,8,0,0,0,11.32-11.32L167.31,156l23.32-23.31a32,32,0,0,0,0-45.26l-5.38-5.37,52.41-52.4A8,8,0,0,0,237.66,18.34Zm-116.29,161a16,16,0,0,1-22.62,0L76.69,157.25a16,16,0,0,1,0-22.62L100,111.31,144.69,156Zm57.94-57.94L156,144.69,111.31,100l23.32-23.31a16,16,0,0,1,22.62,0l22.06,22A16,16,0,0,1,179.31,121.37Z',
  briefcase:
    'M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM216,72v41.61A184,184,0,0,1,128,136a184.07,184.07,0,0,1-88-22.38V72Zm0,128H40V131.64A200.19,200.19,0,0,0,128,152a200.25,200.25,0,0,0,88-20.37V200ZM104,112a8,8,0,0,1,8-8h32a8,8,0,0,1,0,16H112A8,8,0,0,1,104,112Z',
};

const OUTCOMES = [
  {
    icon: 'shield',
    title: 'Business',
    items: ['Provable, revocable access', 'Gaps surface before a grant — not after an incident'],
  },
  {
    icon: 'plug',
    title: 'Engineering',
    items: ['One contract, not per-provider glue', 'A new provider is an adapter, not a rewrite'],
  },
  {
    icon: 'briefcase',
    title: 'Commercial',
    items: ['Evidence, not just logs, for security review', 'A faster path through enterprise deal cycles'],
  },
];

// Deck slide 6.
export function Outcomes() {
  return (
    <section id="outcomes" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="What Changes"
        title="What changes when access is governed"
        description="One model. Three audiences. The same evidence record answers all three."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {OUTCOMES.map((outcome) => (
          <div key={outcome.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <IconCircle>
              <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d={ICONS[outcome.icon]} />
              </svg>
            </IconCircle>
            <h3 className="mt-1 text-lg font-extrabold text-slate-900">{outcome.title}</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {outcome.items.map((item) => (
                <li key={item} className="relative pl-4 text-sm leading-relaxed text-slate-500">
                  <span className="absolute left-0 top-[9px] h-[5px] w-[5px] rounded-full bg-indigo-600" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
