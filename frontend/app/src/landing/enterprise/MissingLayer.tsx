import { Chip } from './primitives';

// Deck slide 3 — the deck's own "governance is a layer, not a starting
// point" statement. This is where the previous homepage's strongest concept
// ("Governance is the result of composition, not the starting point") lives
// on: the chain below is the composition claim in its simplest form, and the
// Architecture section further down composes it into the full stack.
export function MissingLayer() {
  return (
    <section className="scroll-mt-16 px-6 py-24 text-center border-t border-slate-200">
      <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
        <span className="text-indigo-600">Governed</span> Access
      </h2>
      <p className="mt-5 max-w-xl mx-auto text-lg text-slate-500">
        The layer that decides, records, and proves what happens between a request and access.
      </p>

      <div className="mt-14 flex items-center justify-center gap-0 flex-wrap">
        <Chip>Request</Chip>
        <span className="hidden sm:block h-px w-14 bg-slate-200" aria-hidden />
        <Chip tone="accent">Governed Access</Chip>
        <span className="hidden sm:block h-px w-14 bg-slate-200" aria-hidden />
        <Chip>Access</Chip>
      </div>
    </section>
  );
}
