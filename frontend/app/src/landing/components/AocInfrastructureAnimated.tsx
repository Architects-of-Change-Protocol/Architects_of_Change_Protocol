export function AocInfrastructureAnimated() {
  return (
    <section className="relative w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#050816]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.08),transparent_35%),radial-gradient(circle_at_bottom,rgba(124,58,237,0.08),transparent_35%)]" />

      <div className="relative mx-auto w-full max-w-[1180px] px-6 py-10 md:px-8 md:py-14">
        <header className="mb-10 text-center animate-stage-frame">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
            One control plane across every data-driven vertical
          </h2>
          <p className="mt-4 text-[11px] uppercase tracking-[0.35em] text-white/55 md:text-xs">
            Consent • Policy • Identity • Capability Control • Audit
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-5">
          <VerticalCard title="HR" subtitle="References • Hiring • Reputation" />
          <VerticalCard title="Finance" subtitle="Consented Access • Risk Signals" />
          <VerticalCard title="Health" subtitle="Patient-Controlled Data" />
          <VerticalCard title="Events" subtitle="Tickets • Credentials • Rewards" />
          <div className="col-span-2 md:col-span-1"><VerticalCard title="AI Agents" subtitle="Scoped Machine Access" active /></div>
        </div>

        <div className="relative mt-8 md:mt-10 animate-stage-structure">
          <div className="pointer-events-none absolute left-0 right-0 top-[32px] h-px bg-cyan-400/25" />
          <div className="pointer-events-none absolute left-0 right-0 bottom-[32px] h-px bg-cyan-400/25" />

          <div className="relative rounded-[22px] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0.01))] px-4 py-6 md:px-8 md:py-10">
            <div className="mb-5 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-white/55">
              Access Requests &amp; Decision Flow
            </div>

            <div className="relative mx-auto max-w-[940px]">
              <div className="absolute left-[16%] right-[16%] top-[112px] h-px bg-gradient-to-r from-cyan-400/10 via-fuchsia-400/35 to-cyan-400/10 md:left-[8%] md:right-[8%] md:top-[56px]" />

              <div className="grid grid-cols-2 gap-y-6 gap-x-5 text-center md:grid-cols-4">
                <FlowStep label="Request" index={0} />
                <FlowStep label="Evaluate" index={1} />
                <FlowStep label="Transform" index={2} />
                <FlowStep label="Enforce" index={3} />
              </div>

              <div className="relative mt-5 min-h-[92px] overflow-visible md:h-10 md:min-h-0">
                <div className="absolute left-1/2 top-0 w-[84%] -translate-x-1/2 text-center text-[10px] leading-snug md:w-auto md:text-xs md:leading-normal md:whitespace-nowrap">
                  <span className="inline-block max-w-full animate-flow-request rounded-2xl border border-cyan-400/20 bg-cyan-400/8 px-3 py-2.5 leading-[1.35] text-cyan-300 shadow-[0_0_24px_rgba(0,240,255,0.12)] md:rounded-full md:px-3 md:py-1 md:leading-normal">
                    AI Agent → Request: Employment history (scoped access)
                  </span>
                </div>
              </div>

              <div className="pointer-events-none absolute left-[14%] right-[14%] top-[146px] h-4 md:left-[10%] md:right-[10%] md:top-[49px]">
                <div className="signal-dot" />
              </div>

              <div className="pointer-events-none absolute left-[28%] top-[170px] h-[64px] w-px bg-gradient-to-b from-fuchsia-400/0 via-fuchsia-400/35 to-fuchsia-400/0 animate-connector-ai md:left-[32%] md:top-[78px] md:h-[96px]" />
              <div className="pointer-events-none absolute left-[72%] top-[170px] h-[64px] w-px bg-gradient-to-b from-cyan-400/0 via-cyan-400/35 to-cyan-400/0 animate-connector-audit md:left-[74%] md:top-[78px] md:h-[96px]" />

              <div className="mt-5 flex justify-center md:justify-end">
                <div className="animate-flow-outcome rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1 text-[11px] text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.12)] md:text-xs">
                  Scoped Access Granted
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-10 grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-5">
          <ModuleCard title="Identity" />
          <ModuleCard title="Policy" active="policy" />
          <ModuleCard title="Consent" />
          <ModuleCard title="Capabilities" active="capabilities" />
          <div className="col-span-2 md:col-span-1"><ModuleCard title="Audit" /></div>
        </div>

        <div className="relative mt-8 md:mt-10 overflow-hidden rounded-[26px] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(124,58,237,0.08),rgba(255,255,255,0.02))] px-5 py-8 text-center md:px-10 md:py-14 animate-stage-outcome">
          <div className="absolute inset-x-0 top-0 h-[5px] bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 shadow-[0_0_24px_rgba(0,240,255,0.35)]" />
          <div className="absolute inset-x-0 top-0 mx-auto h-24 w-[70%] bg-cyan-400/10 blur-3xl" />

          <h3 className="text-4xl font-semibold tracking-tight text-[#cbb8ff] md:text-6xl">
            AOC PROTOCOL
          </h3>
          <p className="mt-4 text-sm text-white/70 md:text-base">
            Programmable control layer for governed data access
          </p>
          <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-white/35">
            All decisions resolve through AOC
          </p>
        </div>
      </div>

      <style>{`
        :root {
          --aoc-motion-cycle: 9.6s;
          --aoc-ease-premium: cubic-bezier(0.22, 1, 0.36, 1);
          --aoc-ease-soft: cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes stage-fade-up {
          0% {
            opacity: 0;
            transform: translateY(3px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes card-breathe {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        @keyframes ai-card-adapt {
          0%,
          100% {
            transform: translateY(0) scale(1);
            box-shadow: 0 0 0 rgba(0, 240, 255, 0);
            border-color: rgba(0, 240, 255, 0.45);
          }
          40% {
            transform: translateY(-2px) scale(1.008);
            box-shadow: 0 0 30px rgba(0, 240, 255, 0.11);
            border-color: rgba(56, 233, 255, 0.55);
          }
          70% {
            transform: translateY(-1px) scale(1.004);
            box-shadow: 0 0 18px rgba(0, 240, 255, 0.08);
          }
        }

        @keyframes flow-request {
          0%,
          18% {
            opacity: 0;
            transform: translateY(4px);
          }
          24%,
          64% {
            opacity: 1;
            transform: translateY(0);
          }
          74%,
          100% {
            opacity: 0;
            transform: translateY(-1px);
          }
        }

        @keyframes flow-outcome {
          0%,
          66% {
            opacity: 0;
            transform: translateY(4px);
          }
          74%,
          94% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-1px);
          }
        }

        @keyframes signal-travel {
          0% {
            left: 0%;
            opacity: 0;
            transform: translateX(0) scale(0.88);
          }
          8% {
            opacity: 0.88;
            transform: translateX(0) scale(1);
          }
          80% {
            opacity: 0.88;
            transform: translateX(0) scale(1);
          }
          100% {
            left: 100%;
            opacity: 0;
            transform: translateX(-100%) scale(0.9);
          }
        }

        @keyframes step-react-0 {
          0%,
          10%,
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
          14%,
          22% {
            transform: scale(1.06);
            filter: brightness(1.2);
          }
        }

        @keyframes step-react-1 {
          0%,
          24%,
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
          28%,
          36% {
            transform: scale(1.06);
            filter: brightness(1.2);
          }
        }

        @keyframes step-react-2 {
          0%,
          42%,
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
          46%,
          54% {
            transform: scale(1.06);
            filter: brightness(1.2);
          }
        }

        @keyframes step-react-3 {
          0%,
          60%,
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
          64%,
          72% {
            transform: scale(1.06);
            filter: brightness(1.2);
          }
        }

        @keyframes connector-ai {
          0%,
          28% {
            opacity: 0.08;
          }
          36%,
          58% {
            opacity: 0.72;
          }
          68%,
          100% {
            opacity: 0.1;
          }
        }

        @keyframes connector-audit {
          0%,
          56% {
            opacity: 0.06;
          }
          64%,
          84% {
            opacity: 0.8;
          }
          92%,
          100% {
            opacity: 0.1;
          }
        }

        @keyframes module-ai {
          0%,
          28%,
          100% {
            box-shadow: 0 0 0 rgba(0, 0, 0, 0);
            border-color: rgba(255, 255, 255, 0.1);
          }
          38%,
          56% {
            box-shadow: 0 0 22px rgba(0, 240, 255, 0.13);
            border-color: rgba(56, 233, 255, 0.34);
          }
        }

        @keyframes module-audit {
          0%,
          60%,
          100% {
            box-shadow: 0 0 0 rgba(0, 0, 0, 0);
            border-color: rgba(255, 255, 255, 0.1);
          }
          68%,
          84% {
            box-shadow: 0 0 20px rgba(34, 211, 238, 0.09);
            border-color: rgba(103, 232, 249, 0.3);
          }
        }

        .animate-stage-frame {
          animation: stage-fade-up 700ms var(--aoc-ease-premium) both;
        }

        .animate-stage-structure {
          animation: stage-fade-up 900ms var(--aoc-ease-premium) 140ms both;
        }

        .animate-stage-outcome {
          animation: stage-fade-up 960ms var(--aoc-ease-premium) 280ms both;
        }

        .animate-card-breathe {
          animation: card-breathe calc(var(--aoc-motion-cycle) + 1.8s) var(--aoc-ease-soft) infinite;
          will-change: transform;
        }

        .animate-ai-card-pulse {
          animation: ai-card-adapt calc(var(--aoc-motion-cycle) - 1s) var(--aoc-ease-soft) infinite;
          will-change: transform, box-shadow;
        }

        .animate-flow-request {
          animation: flow-request var(--aoc-motion-cycle) var(--aoc-ease-soft) infinite;
          will-change: transform, opacity;
        }

        .animate-flow-outcome {
          animation: flow-outcome var(--aoc-motion-cycle) var(--aoc-ease-soft) infinite;
          will-change: transform, opacity;
        }

        .signal-dot {
          position: absolute;
          top: 0;
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background: #7dd3fc;
          box-shadow: 0 0 0 2px rgba(125, 211, 252, 0.12), 0 0 18px rgba(0, 240, 255, 0.45);
          animation: signal-travel var(--aoc-motion-cycle) var(--aoc-ease-soft) infinite;
          will-change: transform, opacity, left;
        }

        .animate-step-react-0 {
          animation: step-react-0 var(--aoc-motion-cycle) var(--aoc-ease-soft) infinite;
          transform-origin: center;
        }

        .animate-step-react-1 {
          animation: step-react-1 var(--aoc-motion-cycle) var(--aoc-ease-soft) infinite;
          transform-origin: center;
        }

        .animate-step-react-2 {
          animation: step-react-2 var(--aoc-motion-cycle) var(--aoc-ease-soft) infinite;
          transform-origin: center;
        }

        .animate-step-react-3 {
          animation: step-react-3 var(--aoc-motion-cycle) var(--aoc-ease-soft) infinite;
          transform-origin: center;
        }

        .animate-connector-ai {
          animation: connector-ai var(--aoc-motion-cycle) linear infinite;
        }

        .animate-connector-audit {
          animation: connector-audit var(--aoc-motion-cycle) linear infinite;
        }

        .animate-module-pulse {
          animation: module-ai var(--aoc-motion-cycle) var(--aoc-ease-soft) infinite;
        }

        .animate-module-pulse-delayed {
          animation: module-audit var(--aoc-motion-cycle) linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-stage-frame,
          .animate-stage-structure,
          .animate-stage-outcome,
          .animate-card-breathe,
          .animate-ai-card-pulse,
          .animate-flow-request,
          .animate-flow-outcome,
          .signal-dot,
          .animate-step-react-0,
          .animate-step-react-1,
          .animate-step-react-2,
          .animate-step-react-3,
          .animate-connector-ai,
          .animate-connector-audit,
          .animate-module-pulse,
          .animate-module-pulse-delayed {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  )
}

function VerticalCard({
  title,
  subtitle,
  active = false,
}: {
  title: string
  subtitle: string
  active?: boolean
}) {
  return (
    <div
      className={[
        'group h-full rounded-[20px] border px-5 py-7 transition-all duration-300 ease-out',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]',
        active
          ? 'border-white/10 hover:-translate-y-[3px] hover:border-cyan-300/70 hover:shadow-[0_0_40px_rgba(0,240,255,0.18)]'
          : 'border-white/10 animate-card-breathe hover:-translate-y-[3px] hover:border-cyan-400/50 hover:shadow-[0_0_32px_rgba(0,240,255,0.14)]',
      ].join(' ')}
    >
      <div className="text-lg sm:text-xl font-semibold text-white transition-all duration-300 group-hover:text-cyan-200 group-hover:drop-shadow-[0_0_6px_rgba(0,240,255,0.5)]">{title}</div>
      <div className="mt-2 text-[15px] sm:text-sm leading-7 sm:leading-6 text-white/45 transition-all duration-300 group-hover:text-white/75">{subtitle}</div>
    </div>
  )
}

function FlowStep({ label, index }: { label: string; index: 0 | 1 | 2 | 3 }) {
  return (
    <div className="relative">
      <div
        className={[
          'mx-auto mb-2 h-2.5 w-2.5 rounded-full bg-[#8b5cf6] shadow-[0_0_14px_rgba(139,92,246,0.5)]',
          index === 0
            ? 'animate-step-react-0'
            : index === 1
              ? 'animate-step-react-1'
              : index === 2
                ? 'animate-step-react-2'
                : 'animate-step-react-3',
        ].join(' ')}
      />
      <div className="text-[9px] uppercase tracking-[0.18em] text-white/42 md:text-[11px] md:tracking-[0.24em]">
        {label}
      </div>
    </div>
  )
}

function ModuleCard({
  title,
  active,
}: {
  title: string
  active?: 'policy' | 'capabilities'
}) {
  return (
    <div
      className={[
        'group h-full rounded-[18px] border px-5 py-7 text-center text-lg font-semibold text-white transition-all duration-300 ease-out',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]',
        active === 'policy'
          ? 'animate-module-pulse border-white/10'
          : active === 'capabilities'
            ? 'animate-module-pulse-delayed border-white/10'
            : 'border-white/10',
        'hover:-translate-y-[3px] hover:border-cyan-300/60',
        'hover:shadow-[0_0_40px_rgba(0,240,255,0.18)]',
      ].join(' ')}
    >
      <span className="transition-all duration-300 group-hover:text-cyan-200 group-hover:drop-shadow-[0_0_6px_rgba(0,240,255,0.45)]">{title}</span>
    </div>
  )
}
