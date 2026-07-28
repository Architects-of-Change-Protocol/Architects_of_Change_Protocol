import { CAPABILITY_CATALOG, type ArchitecturePattern } from './content';
import { CapabilityCheckItem, SectionHeader, Stat, StatusPill } from './primitives';

export function CapabilityComposer({ pattern }: { pattern: ArchitecturePattern }) {
  const { enabled, available, coverage, maturity, dependencies, recommendedNext } = pattern.capabilitySet;

  return (
    <div id="capabilities" className="scroll-mt-16 mt-16">
      <SectionHeader
        eyebrow="Stage 3 · Capabilities"
        title="Compose capabilities onto the architecture."
        description={
          <>
            <span className="text-white/70 font-medium">{pattern.name}</span> is currently composed from the
            capabilities below. Capabilities define powers — what the architecture is able to do. Governance,
            further down the model, defines how those powers are actually used.
          </>
        }
      />

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
          <div className="space-y-2">
            {enabled.map((id) => (
              <CapabilityCheckItem key={id} name={CAPABILITY_CATALOG[id].name} summary={CAPABILITY_CATALOG[id].summary} checked />
            ))}
            {available.map((id) => (
              <CapabilityCheckItem key={id} name={CAPABILITY_CATALOG[id].name} summary={CAPABILITY_CATALOG[id].summary} checked={false} />
            ))}
          </div>
        </div>

        <div className="space-y-3.5">
          <Stat label="Architecture Coverage" value={`${coverage}%`} detail="Capabilities enabled vs. relevant to this pattern" />
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45 font-mono">Capability Maturity</p>
            <div className="mt-2.5">
              <StatusPill label={maturity} />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45 font-mono">Dependencies</p>
            <ul className="mt-2.5 space-y-1.5">
              {dependencies.map((dep) => (
                <li key={dep} className="text-sm text-white/60 leading-relaxed">
                  {dep}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.04] p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/70 font-mono">Recommended Next Capability</p>
            <p className="mt-2.5 text-sm font-medium text-white">{CAPABILITY_CATALOG[recommendedNext].name}</p>
            <p className="mt-1 text-xs text-white/50 leading-relaxed">{CAPABILITY_CATALOG[recommendedNext].summary}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
