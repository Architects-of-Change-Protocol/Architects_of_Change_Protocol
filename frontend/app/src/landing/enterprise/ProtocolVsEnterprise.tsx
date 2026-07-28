import { PROTOCOL_VS_ENTERPRISE } from './content';
import { SectionHeader } from './primitives';

export function ProtocolVsEnterprise() {
  const { protocol, enterprise } = PROTOCOL_VS_ENTERPRISE;

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <SectionHeader
        eyebrow="Two layers, one protocol"
        title="AOC Enterprise is not AOC Protocol."
        description="One defines the language sovereign architectures are built from. The other is the commercial platform that operates them."
      />

      <div className="grid md:grid-cols-2 gap-4">
        <PositioningCard {...protocol} tone="protocol" />
        <PositioningCard {...enterprise} tone="enterprise" />
      </div>
    </section>
  );
}

function PositioningCard({
  title,
  kicker,
  summary,
  points,
  tone,
}: {
  title: string;
  kicker: string;
  summary: string;
  points: string[];
  tone: 'protocol' | 'enterprise';
}) {
  const isEnterprise = tone === 'enterprise';
  return (
    <article
      className={`rounded-2xl border p-6 md:p-7 ${
        isEnterprise ? 'border-cyan-300/25 bg-cyan-300/[0.04]' : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      <p className={`text-[11px] uppercase tracking-[0.2em] font-mono ${isEnterprise ? 'text-cyan-300/80' : 'text-white/40'}`}>
        {kicker}
      </p>
      <h3 className="mt-2.5 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm text-white/60 leading-relaxed">{summary}</p>
      <ul className="mt-5 space-y-2">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-sm text-white/70">
            <span className={`mt-1.5 h-1 w-1 rounded-full shrink-0 ${isEnterprise ? 'bg-cyan-300' : 'bg-white/35'}`} />
            {point}
          </li>
        ))}
      </ul>
    </article>
  );
}
