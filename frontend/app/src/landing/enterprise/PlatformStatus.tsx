import { EXPLORE_CAPABILITIES } from './content';
import { SectionHeader } from './primitives';

const COLUMNS = [
  {
    icon: 'M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Z',
    title: 'Available today',
    items: ['Enterprise core (v1.0.0)', '27-endpoint API surface', 'Agent Governance', 'Evidence & Audit API', 'Assurance Runtime (SAF v1.0.0)'],
  },
  {
    icon: 'M254.3,107.91,228.78,56.85a16,16,0,0,0-21.47-7.15L182.44,62.13,130.05,48.27a8.14,8.14,0,0,0-4.1,0L73.56,62.13,48.69,49.7a16,16,0,0,0-21.47,7.15L1.7,107.9a16,16,0,0,0,7.15,21.47l27,13.51,55.49,39.63a8.06,8.06,0,0,0,2.71,1.25l64,16a8,8,0,0,0,7.6-2.1l55.07-55.08,26.42-13.21a16,16,0,0,0,7.15-21.46Z',
    title: 'Design Partner stage',
    items: ['Governed Access lifecycle — architecture frozen', 'Pinata Provider Adapter — conformance-tested', 'Not yet a persisted, callable API'],
  },
  {
    icon: 'M228.92,49.69a8,8,0,0,0-6.86-1.45L160.93,63.52,99.58,32.84a8,8,0,0,0-5.52-.6l-64,16A8,8,0,0,0,24,56V200a8,8,0,0,0,9.94,7.76l61.13-15.28,61.35,30.68A8.15,8.15,0,0,0,160,224a8,8,0,0,0,1.94-.24l64-16A8,8,0,0,0,232,200V56A8,8,0,0,0,228.92,49.69Z',
    title: 'Roadmap',
    items: ['Additional Provider Adapters (S3, Azure, Google Drive, SharePoint)', 'Governed Access production wiring', 'Continuous Assurance signal automation'],
  },
];

// Deck slide 11. Doubles as the homepage's "Developers" narrative beat —
// transparency about platform maturity is the technical-buyer equivalent of
// a docs link. The capability catalog strip below (formerly the standalone
// ExploreCapabilities section) is folded in here rather than kept as its
// own full section, to avoid re-introducing a feature-dump grid right
// before the closing CTA.
export function PlatformStatus() {
  return (
    <section id="platform-status" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="What's Real Today"
        title="What's real today"
        description="No maturity claim here goes further than the architecture behind it."
      />

      <div className="grid md:grid-cols-3 gap-5">
        {COLUMNS.map((column) => (
          <div key={column.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 256 256" className="h-[22px] w-[22px] text-indigo-600" fill="currentColor" aria-hidden="true">
                <path d={column.icon} />
              </svg>
              <h4 className="text-[15.5px] font-extrabold text-slate-900">{column.title}</h4>
            </div>
            <ul className="mt-5 flex flex-col gap-3.5">
              {column.items.map((item) => (
                <li key={item} className="relative pl-4 text-[12.5px] leading-relaxed text-slate-900">
                  <span className="absolute left-0 top-[7px] h-1 w-1 rounded-full bg-slate-400" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 border-t border-slate-200 pt-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Explore the capability catalog</p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {EXPLORE_CAPABILITIES.map((capability) => (
            <a
              key={capability.slug}
              href={`/?view=capability&slug=${capability.slug}`}
              className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[13px] font-mono text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-600"
            >
              {capability.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
