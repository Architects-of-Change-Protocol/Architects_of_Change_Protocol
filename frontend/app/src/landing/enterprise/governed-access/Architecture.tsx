import { SectionHeader } from '../primitives';

function ArrowDown() {
  return (
    <div className="flex justify-center py-2 text-slate-400">
      <svg viewBox="0 0 256 256" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
        <path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z" />
      </svg>
    </div>
  );
}

// The same three-band composition diagram as ../ArchitectureStack.tsx —
// reused verbatim as the visual pattern rather than reinvented, per the
// "reuse W005 visual language" brief. Scoped copy: this page frames the
// stack as what makes the product provider-neutral, not as the Enterprise
// homepage's broader "governance emerges from composition" thesis.
export function Architecture() {
  return (
    <section id="architecture" className="scroll-mt-16 max-w-4xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Architecture"
        title="Three layers. One governed decision."
        description="Enterprise never holds a credential. Only grant status and usage cross the boundary between what decides and what stores."
      />

      <div className="rounded-xl bg-slate-100 px-6 py-5">
        <p className="text-sm font-extrabold tracking-[0.05em] text-slate-500">AOC PROTOCOL</p>
        <p className="mt-2 text-[12.5px] text-slate-500">identity &middot; consent &middot; capability tokens &middot; audit envelopes</p>
      </div>
      <ArrowDown />
      <div className="rounded-xl bg-teal-600 px-6 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-extrabold tracking-[0.05em] text-white">AOC ENTERPRISE &mdash; GOVERNED ACCESS</p>
        <p className="mt-2 text-[12.5px] text-teal-200">
          Decision &middot; Policy &middot; Grant &middot; Revocation &middot; Usage &middot; Evidence
        </p>
      </div>
      <ArrowDown />
      <div className="rounded-xl bg-slate-100 px-6 py-5">
        <p className="text-sm font-extrabold tracking-[0.05em] text-slate-500">PROVIDER ADAPTER</p>
        <p className="mt-2 text-[12.5px] text-slate-500">reads only resource &middot; status &middot; expiry &mdash; writes only usage events</p>
      </div>

      <p className="mt-8 text-sm text-slate-500 leading-relaxed max-w-2xl">
        This is the same stack Enterprise composes for every capability it offers. Governed Access is the first
        capability to ship on it — see <a href="/?view=enterprise#architecture" className="text-teal-600 hover:text-teal-500 font-semibold">the full architecture on AOC Enterprise</a>.
      </p>
    </section>
  );
}
