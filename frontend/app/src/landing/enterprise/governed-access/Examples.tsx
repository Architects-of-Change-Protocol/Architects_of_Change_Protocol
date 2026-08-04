import { SectionHeader } from '../primitives';
import { EXAMPLE_SCENARIOS } from './content';

// Illustrative scenarios only — deliberately not customer claims or case
// studies. Each card is labeled "Example Scenario" so that's unambiguous,
// matching the honesty bar the rest of the Enterprise section holds to
// (see ../PlatformStatus.tsx).
export function Examples() {
  return (
    <section id="examples" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Illustrative Only"
        title="What this looks like in practice"
        description="Example scenarios, not customer claims — the kind of access decision Governed Access is built to handle."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {EXAMPLE_SCENARIOS.map((example) => (
          <div key={example.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-indigo-600">Example Scenario</p>
            <h4 className="mt-2.5 text-[15.5px] font-extrabold text-slate-900">{example.title}</h4>
            <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500">{example.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
