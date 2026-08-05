import { SectionHeader } from '../primitives';
import { CONTINUOUS_CAPABILITIES } from './content';

// Section 8 — Continuous Assurance. Explicitly forward-looking: matches the
// honesty bar ../PlatformStatus.tsx sets elsewhere (Available today /
// Design Partner stage / Roadmap) rather than claiming these are live.
export function ContinuousAssurance() {
  return (
    <section id="continuous-assurance" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Roadmap"
        title="Assurance does not end at the initial assessment"
        description="A single assessment is a snapshot. The direction we're building toward is continuous — capability posture that stays current as the architecture changes."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CONTINUOUS_CAPABILITIES.map((label) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" aria-hidden />
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Roadmap capabilities — not yet available. Today, Continuous Assurance means the fifth stage of the
        engagement model above: an ongoing relationship, not an automated monitoring product.
      </p>
    </section>
  );
}
