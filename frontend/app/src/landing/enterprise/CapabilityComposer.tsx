import { CAPABILITY_CATALOG, type ArchitecturePattern } from './content';
import { CapabilityCheckItem } from './primitives';

export function CapabilityComposer({ pattern }: { pattern: ArchitecturePattern }) {
  const { enabled, available, dependencies } = pattern.capabilitySet;

  return (
    <div id="capabilities-composer" className="mt-6 grid lg:grid-cols-[1.6fr_1fr] gap-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40 font-mono mb-3">
          Composed for {pattern.name}
        </p>
        <div className="space-y-2">
          {enabled.map((id) => (
            <CapabilityCheckItem key={id} capability={id} name={CAPABILITY_CATALOG[id].name} summary={CAPABILITY_CATALOG[id].summary} checked />
          ))}
          {available.map((id) => (
            <CapabilityCheckItem key={id} capability={id} name={CAPABILITY_CATALOG[id].name} summary={CAPABILITY_CATALOG[id].summary} checked={false} />
          ))}
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
    </div>
  );
}
