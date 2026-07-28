import { ARCHITECTURE_PATTERNS, type ArchitecturePattern } from './content';
import { NodeGlyph, StatusPill } from './primitives';

export function ArchitectureBuilder({
  selected,
  onSelect,
}: {
  selected: ArchitecturePattern;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5" role="radiogroup" aria-label="Choose the center of gravity of your architecture">
        {ARCHITECTURE_PATTERNS.map((pattern) => {
          const isSelected = pattern.id === selected.id;
          return (
            <button
              key={pattern.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(pattern.id)}
              className={`text-left rounded-2xl border p-5 transition-colors ${
                isSelected
                  ? 'border-cyan-300/50 bg-cyan-300/[0.06]'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.035]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <NodeGlyph shape={pattern.shape} />
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    isSelected ? 'border-cyan-300 bg-cyan-300' : 'border-white/25'
                  }`}
                  aria-hidden
                />
              </div>
              <h3 className="mt-4 font-semibold text-white">{pattern.name}</h3>
              <p className="mt-1.5 text-sm text-white/55 leading-relaxed">{pattern.tagline}</p>
            </button>
          );
        })}
      </div>

      <ArchitectureDetail pattern={selected} />
    </div>
  );
}

function ArchitectureDetail({ pattern }: { pattern: ArchitecturePattern }) {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.015] p-6 md:p-7">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-2xl font-semibold text-white tracking-tight">{pattern.name} Architecture</h3>
        <StatusPill label={pattern.maturity} />
      </div>
      <p className="mt-3 max-w-2xl text-sm text-white/60 leading-relaxed">{pattern.summary}</p>
    </div>
  );
}
