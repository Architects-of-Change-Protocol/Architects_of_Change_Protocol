export function AocInfrastructureAnimated() {
  return (
    <section className="relative w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#050816]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.08),transparent_35%),radial-gradient(circle_at_bottom,rgba(124,58,237,0.08),transparent_35%)]" />

      <div className="relative mx-auto w-full max-w-[1180px] px-6 py-10 md:px-8 md:py-14">
        <header className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
            One control plane across every data-driven vertical
          </h2>
          <p className="mt-4 text-[11px] uppercase tracking-[0.35em] text-white/55 md:text-xs">
            Consent • Policy • Identity • Capability Control • Audit
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          <VerticalCard title="HR" subtitle="References • Hiring • Reputation" />
          <VerticalCard title="Finance" subtitle="Consented Access • Risk Signals" />
          <VerticalCard title="Health" subtitle="Patient-Controlled Data" />
          <VerticalCard title="Events" subtitle="Tickets • Credentials • Rewards" />
          <VerticalCard
            title="AI Agents"
            subtitle="Scoped Machine Access"
            active
            className="col-span-2 md:col-span-1"
          />
        </div>

        <div className="relative mt-10">
          <div className="pointer-events-none absolute left-0 right-0 top-[32px] h-px bg-cyan-400/25" />
          <div className="pointer-events-none absolute left-0 right-0 bottom-[32px] h-px bg-cyan-400/25" />

          <div className="relative rounded-[22px] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0.01))] px-5 py-8 md:px-8 md:py-10">
            <div className="mb-5 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-white/55">
              Access Requests &amp; Decision Flow
            </div>

            <div className="relative mx-auto max-w-[940px]">
              <div className="absolute left-[8%] right-[8%] top-[56px] h-px bg-gradient-to-r from-cyan-400/10 via-fuchsia-400/35 to-cyan-400/10" />

              <div className="grid grid-cols-4 gap-4 text-center">
                <FlowStep label="Request" />
                <FlowStep label="Evaluate" />
                <FlowStep label="Transform" />
                <FlowStep label="Enforce" />
              </div>

              <div className="relative mt-6 h-10 overflow-hidden">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-[11px] md:text-xs">
                  <span className="inline-block animate-request-fade rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3 py-1 text-cyan-300 shadow-[0_0_24px_rgba(0,240,255,0.12)]">
                    AI Agent → Request: Employment history (scoped access)
                  </span>
                </div>
              </div>

              <div className="pointer-events-none absolute left-[10%] right-[10%] top-[49px] h-4">
                <div className="signal-dot" />
              </div>

              <div className="pointer-events-none absolute left-[32%] top-[78px] h-[96px] w-px bg-gradient-to-b from-fuchsia-400/0 via-fuchsia-400/35 to-fuchsia-400/0 animate-link-pulse" />
              <div className="pointer-events-none absolute left-[74%] top-[78px] h-[96px] w-px bg-gradient-to-b from-cyan-400/0 via-cyan-400/35 to-cyan-400/0 animate-link-pulse-delayed" />

              <div className="mt-6 flex justify-end">
                <div className="animate-output-fade rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1 text-[11px] text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.12)] md:text-xs">
                  Scoped Access Granted
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
          <ModuleCard title="Identity" />
          <ModuleCard title="Policy" active="policy" />
          <ModuleCard title="Consent" />
          <ModuleCard title="Capabilities" active="capabilities" />
          <ModuleCard title="Audit" />
        </div>

        <div className="relative mt-10 overflow-hidden rounded-[26px] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(124,58,237,0.08),rgba(255,255,255,0.02))] px-6 py-10 text-center md:px-10 md:py-14">
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
        @keyframes signal-move {
          0% {
            left: 0%;
            opacity: 0;
            transform: translateX(0) scale(0.85);
          }
          8% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          40% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          92% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          100% {
            left: 100%;
            opacity: 0;
            transform: translateX(-100%) scale(0.9);
          }
        }

        @keyframes request-fade {
          0%, 12% {
            opacity: 0;
            transform: translateY(4px);
          }
          20%, 72% {
            opacity: 1;
            transform: translateY(0);
          }
          88%, 100% {
            opacity: 0;
            transform: translateY(-2px);
          }
        }

        @keyframes output-fade {
          0%, 62% {
            opacity: 0;
            transform: translateY(4px);
          }
          72%, 92% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-2px);
          }
        }

        @keyframes module-pulse {
          0%, 18% {
            box-shadow: 0 0 0 rgba(0,0,0,0);
            border-color: rgba(255,255,255,0.1);
          }
          28%, 48% {
            box-shadow: 0 0 32px rgba(0,240,255,0.14);
            border-color: rgba(0,240,255,0.35);
          }
          60%, 100% {
            box-shadow: 0 0 0 rgba(0,0,0,0);
            border-color: rgba(255,255,255,0.1);
          }
        }

        @keyframes module-pulse-delayed {
          0%, 52% {
            box-shadow: 0 0 0 rgba(0,0,0,0);
            border-color: rgba(255,255,255,0.1);
          }
          62%, 82% {
            box-shadow: 0 0 32px rgba(0,240,255,0.14);
            border-color: rgba(0,240,255,0.35);
          }
          90%, 100% {
            box-shadow: 0 0 0 rgba(0,0,0,0);
            border-color: rgba(255,255,255,0.1);
          }
        }

        @keyframes link-pulse {
          0%, 18% { opacity: 0.06; }
          28%, 48% { opacity: 0.85; }
          60%, 100% { opacity: 0.08; }
        }

        @keyframes link-pulse-delayed {
          0%, 52% { opacity: 0.06; }
          62%, 82% { opacity: 0.85; }
          90%, 100% { opacity: 0.08; }
        }

        @keyframes ai-card-pulse {
          0%, 100% {
            box-shadow: 0 0 0 rgba(0,240,255,0);
          }
          50% {
            box-shadow: 0 0 42px rgba(0,240,255,0.16);
          }
        }

        .signal-dot {
          position: absolute;
          top: 0;
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background: #7dd3fc;
          box-shadow:
            0 0 0 2px rgba(125, 211, 252, 0.12),
            0 0 22px rgba(0, 240, 255, 0.55);
          animation: signal-move 5.5s ease-in-out infinite;
        }

        .animate-request-fade {
          animation: request-fade 5.5s ease-in-out infinite;
        }

        .animate-output-fade {
          animation: output-fade 5.5s ease-in-out infinite;
        }

        .animate-module-pulse {
          animation: module-pulse 5.5s ease-in-out infinite;
        }

        .animate-module-pulse-delayed {
          animation: module-pulse-delayed 5.5s ease-in-out infinite;
        }

        .animate-link-pulse {
          animation: link-pulse 5.5s ease-in-out infinite;
        }

        .animate-link-pulse-delayed {
          animation: link-pulse-delayed 5.5s ease-in-out infinite;
        }

        .animate-ai-card-pulse {
          animation: ai-card-pulse 4.8s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}

function VerticalCard({
  title,
  subtitle,
  active = false,
  className,
}: {
  title: string
  subtitle: string
  active?: boolean
  className?: string
}) {
  return (
    <div
      className={[
        'min-h-[104px] rounded-[20px] border px-4 py-4 transition-all duration-500 md:min-h-[132px] md:px-5 md:py-6',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]',
        active
          ? 'border-cyan-400/45 shadow-[0_0_32px_rgba(0,240,255,0.12)] animate-ai-card-pulse'
          : 'border-white/10',
        className,
      ].join(' ')}
    >
      <div className="text-lg font-semibold text-white md:text-xl">{title}</div>
      <div className="mt-2 text-xs text-white/45 md:mt-3 md:text-sm">{subtitle}</div>
    </div>
  )
}

function FlowStep({ label }: { label: string }) {
  return (
    <div className="relative">
      <div className="mx-auto mb-2 h-2.5 w-2.5 rounded-full bg-[#8b5cf6] shadow-[0_0_18px_rgba(139,92,246,0.6)]" />
      <div className="text-[10px] uppercase tracking-[0.24em] text-white/38 md:text-[11px]">
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
        'rounded-[18px] border px-5 py-6 text-center text-lg font-semibold text-white',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]',
        active === 'policy'
          ? 'animate-module-pulse border-white/10'
          : active === 'capabilities'
            ? 'animate-module-pulse-delayed border-white/10'
            : 'border-white/10',
      ].join(' ')}
    >
      {title}
    </div>
  )
}
