import { ILLUSTRATIVE_PROVIDERS } from './content';
import { SectionHeader, StatusPill } from './primitives';

export function ProviderNeutral() {
  return (
    <section id="provider-neutral" className="scroll-mt-24 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <SectionHeader
        eyebrow="Open and Provider-Neutral"
        title="A digital asset shouldn't be owned by the place it's stored."
        description="A digital asset isn't conceptually owned by one storage provider, application, database or cloud. AOC Protocol separates an asset's identity from its location: canonical references, adapter interfaces and open contracts are the architectural objective, not a promise of automatic migration or universal compatibility across every provider today."
      />

      <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 items-start">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-7">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono mb-4">
            Digital Asset Identity
          </p>
          <div className="space-y-2.5">
            {ILLUSTRATIVE_PROVIDERS.map((provider) => (
              <div
                key={provider.name}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.015] px-3.5 py-2.5"
              >
                <span className="text-sm text-white/70 font-mono">{provider.name}</span>
                <StatusPill status={provider.status} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/40 leading-relaxed">
            Illustrative — no provider adapter ships as part of AOC Protocol today. Provider
            adapters are an implementation concern, not a Protocol claim.
          </p>
        </div>

        <p className="text-sm md:text-base leading-relaxed text-white/60">
          An AOC-compatible digital asset may be stored in Pinata, S3, Azure or another provider
          without making that provider the asset's canonical identity. Storage is where the bytes
          live; identity is what the asset is. Moving an asset between providers, applications or
          organizational boundaries shouldn't require re-establishing what it is from scratch —
          that's what provider neutrality is for.
        </p>
      </div>
    </section>
  );
}
