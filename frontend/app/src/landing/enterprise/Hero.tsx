import { PROTOCOL_VS_ENTERPRISE } from './content';
import { Eyebrow } from './primitives';

export function Hero() {
  const { protocol, enterprise } = PROTOCOL_VS_ENTERPRISE;

  return (
    <section id="overview" className="scroll-mt-16 max-w-7xl mx-auto px-6 pt-16 pb-14 md:pt-20">
      <Eyebrow>AOC Enterprise · the commercial governance platform</Eyebrow>
      <h1 className="mt-5 max-w-4xl text-4xl md:text-6xl font-semibold tracking-tight text-white leading-[1.05]">
        Compose, govern, and operate sovereign architectures.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-white/65 leading-relaxed">
        AOC Enterprise transforms sovereignty primitives into operational governance
        capabilities — the control plane for designing, governing, evaluating, and
        running architectures built on AOC Protocol.
      </p>

      <div className="mt-9 flex flex-col sm:flex-row gap-3">
        <a
          href="mailto:hello@aocprotocol.xyz?subject=AOC%20Enterprise%20Governance%20Walkthrough"
          className="inline-flex items-center justify-center rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-black hover:bg-cyan-200 transition-colors"
        >
          Book a governance walkthrough
        </a>
        <a
          href="#architectures"
          className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white/80 hover:border-white/35 hover:text-white transition-colors"
        >
          View architecture patterns
        </a>
      </div>

      <div className="mt-14 grid md:grid-cols-2 gap-4">
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
