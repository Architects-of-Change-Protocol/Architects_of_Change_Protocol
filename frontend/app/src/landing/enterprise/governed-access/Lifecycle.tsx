import { Chip } from '../primitives';
import { LIFECYCLE_STAGES } from './content';

// The deck-style "missing layer" moment (see ../MissingLayer.tsx), extended
// to the full 8-stage chain this product owns end to end. This section is
// the declaration — what the chain is. ./OperationalLifecycle.tsx below is
// the teaching version, where each stage is explained on hover.
export function Lifecycle() {
  return (
    <section className="scroll-mt-16 px-6 py-24 text-center border-t border-slate-200">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">What Governed Access Adds</p>
      <h2 className="mt-3.5 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
        One chain, from request to revocation.
      </h2>
      <p className="mt-5 max-w-xl mx-auto text-lg text-slate-500">
        Every request becomes a decision. Every decision becomes a grant. Every grant produces evidence — and
        can be revoked.
      </p>

      <div className="mt-14 flex items-center justify-center gap-x-0 gap-y-4 flex-wrap max-w-3xl mx-auto">
        {LIFECYCLE_STAGES.map((stage, i) => (
          <span key={stage.label} className="flex items-center">
            <Chip tone={i === 3 ? 'accent' : 'muted'}>{stage.label}</Chip>
            {i < LIFECYCLE_STAGES.length - 1 ? (
              <span className="mx-1.5 hidden sm:inline text-slate-300" aria-hidden>
                &rarr;
              </span>
            ) : null}
          </span>
        ))}
      </div>
    </section>
  );
}
