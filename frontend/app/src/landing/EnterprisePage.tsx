import { AocInfrastructureAnimated } from './components/AocInfrastructureAnimated';
import { LogoRotating } from '../components/logo/LogoRotating';

export const EnterprisePage = () => {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
      <header>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                <LogoRotating size={24} inverted />
              </div>
              <div className="flex items-baseline">
                <span className="text-lg md:text-xl font-semibold tracking-tighter">AOC</span>
                <span className="text-[10px] md:text-xs text-white uppercase tracking-[0.2em] ml-1.5 md:ml-2">
                  Enterprise
                </span>
              </div>
            </a>

            <div className="hidden md:flex items-center gap-10 text-sm font-medium">
              <a href="#problem" className="hover:text-white transition">Problem</a>
              <a href="#solution" className="hover:text-white transition">Solution</a>
              <a href="#integration" className="hover:text-white transition">Integration</a>
            </div>

            <a
              href="mailto:hello@aocprotocol.xyz?subject=AOC%20Enterprise%20Inquiry"
              className="px-4 py-2 md:px-6 md:py-2.5 bg-[#00f0ff] text-black rounded-full text-xs md:text-sm font-semibold hover:bg-[#00d4e0] transition min-h-[40px] md:min-h-0"
            >
              Talk to us
            </a>
          </div>
        </nav>
      </header>

      <section className="min-h-screen flex items-center pt-14 md:pt-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center py-8 md:py-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.22em] uppercase mb-5 md:mb-8">
            Compliance infrastructure for modern data systems
          </div>

          <h1 className="text-[40px] sm:text-[48px] md:text-[78px] leading-[1.03] md:leading-[1.04] font-semibold tracking-[-1.6px] md:tracking-[-3px] mb-4 md:mb-6">
            Make data access
            <br />
            provably compliant.
          </h1>

          <p className="max-w-3xl mx-auto text-base md:text-2xl text-white/70 leading-relaxed mb-7 md:mb-10">
            AOC gives enterprises a control layer for consent, permissions, and auditability —
            so every data interaction is explicit, enforceable, and verifiable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <a
              href="mailto:hello@aocprotocol.xyz?subject=Request%20AOC%20Enterprise%20Demo"
              className="w-full sm:w-auto px-7 py-3.5 md:px-10 md:py-4 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold rounded-xl md:rounded-2xl transition"
            >
              Request a demo
            </a>
            <a
              href="#solution"
              className="w-full sm:w-auto px-7 py-3.5 md:px-10 md:py-4 border border-white/15 hover:border-white/30 text-white rounded-xl md:rounded-2xl transition"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      <section id="problem" className="py-12 md:py-32 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <header className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-6xl font-semibold tracking-tight mb-3 md:mb-4">
              The current enterprise model is fragile.
            </h2>
            <p className="max-w-3xl mx-auto text-white/60 text-base md:text-lg">
              Most companies still rely on implied consent, fragmented permissions, and weak audit trails.
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            <article className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8">
              <div className="text-cyan-300 text-[10px] md:text-xs uppercase tracking-[0.18em] md:tracking-[0.2em] mb-3 md:mb-4">Risk</div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">Privacy compliance is reactive</h3>
              <p className="text-sm md:text-base text-white/60 leading-relaxed">
                Policies say one thing, but systems often cannot prove who accessed what, when, or under which permission state.
              </p>
            </article>

            <article className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8">
              <div className="text-cyan-300 text-[10px] md:text-xs uppercase tracking-[0.18em] md:tracking-[0.2em] mb-3 md:mb-4">Trust</div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">Users are asked to trust blindly</h3>
              <p className="text-sm md:text-base text-white/60 leading-relaxed">
                Access is usually inherited, bundled, or hidden inside terms nobody can realistically monitor in real time.
              </p>
            </article>

            <article className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8">
              <div className="text-cyan-300 text-[10px] md:text-xs uppercase tracking-[0.18em] md:tracking-[0.2em] mb-3 md:mb-4">Auditability</div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">Evidence is incomplete</h3>
              <p className="text-sm md:text-base text-white/60 leading-relaxed">
                Without enforced permissions and verifiable logs, enterprises carry regulatory exposure and operational ambiguity.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="solution" className="py-12 md:py-32 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <header className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-6xl font-semibold tracking-tight mb-3 md:mb-4">
              AOC turns compliance into infrastructure.
            </h2>
            <p className="max-w-3xl mx-auto text-white/60 text-base md:text-lg">
              Instead of treating privacy as policy alone, AOC enforces access at the system level.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-4 md:gap-8">
            <article className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8">
              <div className="text-cyan-300 text-[10px] md:text-xs uppercase tracking-[0.18em] md:tracking-[0.2em] mb-3 md:mb-4">Explicit consent</div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">Access is granted, not assumed</h3>
              <p className="text-sm md:text-base text-white/60 leading-relaxed">
                Requests become visible actions. Permissions are explicit, time-bound, and tied to user intent.
              </p>
            </article>

            <article className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8">
              <div className="text-cyan-300 text-[10px] md:text-xs uppercase tracking-[0.18em] md:tracking-[0.2em] mb-3 md:mb-4">Modular permissions</div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">Granularity replaces all-or-nothing access</h3>
              <p className="text-sm md:text-base text-white/60 leading-relaxed">
                Enterprises can request exactly what is needed, while users retain control over the scope of access.
              </p>
            </article>

            <article className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8">
              <div className="text-cyan-300 text-[10px] md:text-xs uppercase tracking-[0.18em] md:tracking-[0.2em] mb-3 md:mb-4">Verifiable interactions</div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">Every interaction leaves evidence</h3>
              <p className="text-sm md:text-base text-white/60 leading-relaxed">
                Access events can be logged, verified, and audited — giving compliance teams a stronger operational foundation.
              </p>
            </article>

            <article className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8">
              <div className="text-cyan-300 text-[10px] md:text-xs uppercase tracking-[0.18em] md:tracking-[0.2em] mb-3 md:mb-4">Competitive advantage</div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">Trust becomes a product feature</h3>
              <p className="text-sm md:text-base text-white/60 leading-relaxed">
                The first companies to give users visible control over their data can differentiate on trust, compliance, and transparency.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-24 border-t border-white/10">
        <div className="w-full px-4 md:px-6">
          <div className="mb-6 md:mb-10 max-w-3xl mx-auto text-center">
            <p className="text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.25em] text-white/50 mb-3 md:mb-4">Shared Infrastructure</p>
            <h2 className="text-3xl md:text-5xl font-semibold text-white mb-3 md:mb-4">
              A single control plane for governed enterprise access
            </h2>
            <p className="text-white/70 text-sm md:text-lg leading-relaxed">
              AOC provides a unified layer for consent, policy enforcement, capability restrictions,
              identity-aware access, and full auditability across enterprise systems.
            </p>
          </div>
          <AocInfrastructureAnimated />
        </div>
      </section>

      <section id="integration" className="py-12 md:py-32 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <header className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-6xl font-semibold tracking-tight mb-3 md:mb-4">
              How enterprises can use AOC
            </h2>
            <p className="max-w-3xl mx-auto text-white/60 text-base md:text-lg">
              AOC can serve as a control and verification layer across data-heavy products and workflows.
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            <article className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8">
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Data brokers & lookup platforms</h3>
              <p className="text-sm md:text-base text-white/60 leading-relaxed">
                Replace implicit access with enforceable permission states and user-visible evidence.
              </p>
            </article>

            <article className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8">
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Fintech, HR, health & identity</h3>
              <p className="text-sm md:text-base text-white/60 leading-relaxed">
                Introduce modular permissions in sensitive workflows where consent and traceability matter most.
              </p>
            </article>

            <article className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8">
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Compliance-forward product teams</h3>
              <p className="text-sm md:text-base text-white/60 leading-relaxed">
                Build trust-centered experiences without leaving consent logic buried in policy documents.
              </p>
            </article>
          </div>

          <div className="mt-8 md:mt-16 bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-10 text-center">
            <div className="text-cyan-300 text-[10px] md:text-xs uppercase tracking-[0.18em] md:tracking-[0.2em] mb-3 md:mb-4">Next step</div>
            <h3 className="text-2xl md:text-4xl font-semibold mb-3 md:mb-4">
              Want to make your system compliant by design?
            </h3>
            <p className="max-w-2xl mx-auto text-sm md:text-base text-white/60 leading-relaxed mb-5 md:mb-8">
              Talk to us about enterprise use cases, pilot integrations, and how AOC can become your permission and auditability layer.
            </p>
            <a
              href="mailto:hello@aocprotocol.xyz?subject=AOC%20Enterprise%20Pilot"
              className="px-7 py-3.5 md:px-10 md:py-4 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold rounded-xl md:rounded-2xl transition inline-block"
            >
              Start the conversation
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};
