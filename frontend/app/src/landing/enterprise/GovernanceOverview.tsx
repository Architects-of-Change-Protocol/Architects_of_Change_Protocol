import { OVERVIEW_METRICS } from './content';
import { Eyebrow, HierarchyRail } from './primitives';

export function GovernanceOverview() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-16">
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <Eyebrow>Governance overview · sample deployment</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-white">
              What kind of governed architecture am I operating?
            </h2>
          </div>
          <span className="text-xs text-white/40 font-mono border border-white/10 rounded-full px-3 py-1.5">
            Illustrative data
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {OVERVIEW_METRICS.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45 font-mono">{metric.label}</p>
              <p className="mt-2.5 text-xl font-semibold text-white tracking-tight">{metric.value}</p>
              <p className="mt-1.5 text-sm text-white/50">{metric.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.015] px-5 py-5 md:px-7">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/40 font-mono mb-3">
          The AOC Enterprise mental model
        </p>
        <HierarchyRail />
      </div>
    </section>
  );
}
