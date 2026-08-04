import { SectionHeader } from './primitives';

// AOC Enterprise is the commercial umbrella; Solutions, Services, and
// Architecture are the three pieces the One Pager breaks the platform into
// ("The solution." / "The service." / "The foundation."). Copy below is
// taken from that One Pager's pill row, extended here with links into each
// piece's own page — the interactive upgrade over a static document.
const PILLS = [
  {
    tag: 'Governed Access',
    tone: 'solution' as const,
    href: '/?view=governed-access',
    lead: 'The solution.',
    body: 'Policy-driven, time-bound, approval-gated access with evidence and revocation built in.',
  },
  {
    tag: 'Assurance',
    tone: 'service' as const,
    href: '/?view=assurance',
    lead: 'The service.',
    body: 'Our team integrates and continuously validates the system against your policies and audits.',
  },
  {
    tag: 'Architecture',
    tone: 'foundation' as const,
    href: '#architecture',
    lead: 'The foundation.',
    body: 'Proven reference patterns on the open AOC Protocol standards — provider-neutral, never locked in.',
  },
];

const TAG_TONE: Record<(typeof PILLS)[number]['tone'], string> = {
  solution: 'bg-indigo-600 text-white',
  service: 'bg-indigo-800 text-white',
  foundation: 'bg-slate-500 text-white',
};

export function SolutionsAndServices() {
  return (
    <section id="solutions-services" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="What AOC Enterprise Is"
        title="The complete governed access lifecycle — delivered, not assembled."
      />

      <div className="grid md:grid-cols-3 gap-5">
        {PILLS.map((pill) => (
          <a
            key={pill.tag}
            href={pill.href}
            className="group block rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-colors hover:border-indigo-300 hover:bg-white"
          >
            <span className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide ${TAG_TONE[pill.tone]}`}>
              {pill.tag}
            </span>
            <p className="mt-4 text-base font-bold text-slate-900">{pill.lead}</p>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{pill.body}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
