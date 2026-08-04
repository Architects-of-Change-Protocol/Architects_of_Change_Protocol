import { IconCircle, SectionHeader } from '../primitives';
import { CAPABILITIES } from './content';

// Same grid pattern as ../Benefits.tsx, applied to the capability set this
// product actually ships rather than a build-vs-buy comparison.
export function Capabilities() {
  return (
    <section id="capabilities" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Capabilities"
        title="What Governed Access ships"
        description="Eight capabilities, composed from the same architecture — not eight separate products."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CAPABILITIES.map((capability) => (
          <div key={capability.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <IconCircle size="sm">
              <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: capability.icon }} />
            </IconCircle>
            <h4 className="mt-3 text-[14.5px] font-extrabold text-slate-900">{capability.title}</h4>
            <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500">{capability.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
