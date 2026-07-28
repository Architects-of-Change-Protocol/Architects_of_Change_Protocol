import { CAPABILITY_FAMILIES } from './content';
import { SectionHeader, StatusPill } from './primitives';

const healthDot: Record<string, string> = {
  Healthy: 'bg-emerald-300',
  Attention: 'bg-amber-300',
  Planned: 'bg-white/25',
};

export function Capabilities() {
  return (
    <section id="capabilities" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <SectionHeader
        eyebrow="Stage 2 · Capabilities"
        title="Capabilities are the heart of AOC Enterprise."
        description="Every architecture is composed from capability families — the powers a system is allowed to exercise. Governance, further down the model, defines how those powers are used."
      />

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.4fr_0.7fr_0.9fr_1.6fr_1.4fr] gap-4 px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-white/40 font-mono bg-white/[0.02]">
          <span>Family</span>
          <span>Coverage</span>
          <span>Status</span>
          <span>Configuration</span>
          <span>Dependencies</span>
        </div>

        <div className="divide-y divide-white/10">
          {CAPABILITY_FAMILIES.map((family) => (
            <div key={family.id} className="grid md:grid-cols-[1.4fr_0.7fr_0.9fr_1.6fr_1.4fr] gap-2 md:gap-4 px-6 py-5 items-start md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${healthDot[family.health]}`} />
                  <span className="font-medium text-white">{family.name}</span>
                </div>
                <p className="mt-1 text-sm text-white/50 leading-relaxed md:max-w-xs">{family.summary}</p>
              </div>

              <div className="flex items-center gap-2 md:block">
                <span className="md:hidden text-[11px] uppercase tracking-[0.14em] text-white/40 font-mono">Coverage</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-cyan-300/70" style={{ width: `${family.coverage}%` }} />
                  </div>
                  <span className="text-sm text-white/60 font-mono">{family.coverage}%</span>
                </div>
              </div>

              <div>
                <StatusPill label={family.status} />
              </div>

              <p className="text-sm text-white/55">{family.configuration}</p>

              <div className="flex flex-wrap gap-1.5">
                {family.dependencies.length === 0 ? (
                  <span className="text-sm text-white/35">None</span>
                ) : (
                  family.dependencies.map((dep) => (
                    <span key={dep} className="text-[11px] rounded-full border border-white/15 px-2.5 py-1 text-white/55">
                      {dep}
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
