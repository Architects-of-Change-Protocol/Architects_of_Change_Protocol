import { SectionHeader } from '../primitives';
import { PROVIDERS } from './content';

// Deck-consistent provider grid (visual pattern shared with
// ../ArchitectureStack.tsx's provider row), scoped to this page's own claim:
// Enterprise doesn't change when the provider does — only the adapter does.
// Status vocabulary matches ../PlatformStatus.tsx exactly: Pinata is the
// only conformance-tested adapter today.
export function ProviderNeutral() {
  return (
    <section id="provider-neutral" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Provider Neutral"
        title="The same governed decision. Any provider underneath."
        description="Governed Access doesn't run inside a storage provider — it runs above it. Enterprise makes the same decision, issues the same kind of grant, and produces the same kind of evidence regardless of where the bytes live. Only the Provider Adapter changes."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {PROVIDERS.map((provider) => (
          <div
            key={provider.name}
            className={`rounded-[10px] px-3 py-4 text-center ${
              provider.status === 'live' ? 'bg-indigo-600 shadow-[0_8px_24px_rgba(15,23,42,0.08)]' : 'bg-slate-100'
            }`}
          >
            <span className={`block text-[13.5px] font-bold ${provider.status === 'live' ? 'text-white' : 'text-slate-900'}`}>
              {provider.name}
            </span>
            <span
              className={`mt-1.5 block text-[9px] font-extrabold tracking-[0.1em] ${
                provider.status === 'live' ? 'text-indigo-200' : 'text-slate-400'
              }`}
            >
              {provider.status === 'live' ? 'LIVE' : 'ROADMAP'}
            </span>
          </div>
        ))}
        <div className="rounded-[10px] border border-dashed border-slate-300 px-3 py-4 text-center flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-slate-400" aria-hidden>
            +
          </span>
          <span className="mt-1 block text-[11px] font-semibold text-slate-500">Future Providers</span>
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-500 leading-relaxed max-w-2xl">
        A new provider is a new adapter, not a rewrite of the governance layer above it — the policy, decision,
        grant, and evidence model stays identical.
      </p>
    </section>
  );
}
