import { LogoRotating } from '../components/logo/LogoRotating';

export const renderEnterprisePage = () => {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
      <header>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <LogoRotating size={28} inverted />
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-semibold tracking-tighter">AOC</span>
                <span className="text-xs text-white uppercase tracking-[0.2em] ml-2">
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
              className="px-6 py-2.5 bg-[#00f0ff] text-black rounded-full text-sm font-semibold hover:bg-[#00d4e0] transition"
            >
              Talk to us
            </a>
          </div>
        </nav>
      </header>

      <section className="min-h-screen flex items-center pt-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 text-xs tracking-[0.22em] uppercase mb-8">
            Compliance infrastructure for modern data systems
          </div>

          <h1 className="text-[56px] md:text-[78px] leading-[1.04] font-semibold tracking-[-3px] mb-6">
            Make data access
            <br />
            provably compliant.
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-2xl text-white/70 leading-relaxed mb-10">
            AOC gives enterprises a control layer for consent, permissions, and auditability —
            so every data interaction is explicit, enforceable, and verifiable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:hello@aocprotocol.xyz?subject=Request%20AOC%20Enterprise%20Demo"
              className="px-10 py-4 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold rounded-2xl transition"
            >
              Request a demo
            </a>
            <a
              href="#solution"
              className="px-10 py-4 border border-white/15 hover:border-white/30 text-white rounded-2xl transition"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      <section id="problem" className="py-32 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <header className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
              The current enterprise model is fragile.
            </h2>
            <p className="max-w-3xl mx-auto text-white/60 text-lg">
              Most companies still rely on implied consent, fragmented permissions, and weak audit trails.
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-8">
            <article className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <div className="text-cyan-300 text-xs uppercase tracking-[0.2em] mb-4">Risk</div>
              <h3 className="text-2xl font-semibold mb-3">Privacy compliance is reactive</h3>
              <p className="text-white/60 leading-relaxed">
                Policies say one thing, but systems often cannot prove who accessed what, when, or under which permission state.
              </p>
            </article>

            <article className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <div className="text-cyan-300 text-xs uppercase tracking-[0.2em] mb-4">Trust</div>
              <h3 className="text-2xl font-semibold mb-3">Users are asked to trust blindly</h3>
              <p className="text-white/60 leading-relaxed">
                Access is usually inherited, bundled, or hidden inside terms nobody can realistically monitor in real time.
              </p>
            </article>

            <article className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <div className="text-cyan-300 text-xs uppercase tracking-[0.2em] mb-4">Auditability</div>
              <h3 className="text-2xl font-semibold mb-3">Evidence is incomplete</h3>
              <p className="text-white/60 leading-relaxed">
                Without enforced permissions and verifiable logs, enterprises carry regulatory exposure and operational ambiguity.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="solution" className="py-32 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <header className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
              AOC turns compliance into infrastructure.
            </h2>
            <p className="max-w-3xl mx-auto text-white/60 text-lg">
              Instead of treating privacy as policy alone, AOC enforces access at the system level.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8">
            <article className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <div className="text-cyan-300 text-xs uppercase tracking-[0.2em] mb-4">Explicit consent</div>
              <h3 className="text-2xl font-semibold mb-3">Access is granted, not assumed</h3>
              <p className="text-white/60 leading-relaxed">
                Requests become visible actions. Permissions are explicit, time-bound, and tied to user intent.
              </p>
            </article>

            <article className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <div className="text-cyan-300 text-xs uppercase tracking-[0.2em] mb-4">Modular permissions</div>
              <h3 className="text-2xl font-semibold mb-3">Granularity replaces all-or-nothing access</h3>
              <p className="text-white/60 leading-relaxed">
                Enterprises can request exactly what is needed, while users retain control over the scope of access.
              </p>
            </article>

            <article className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <div className="text-cyan-300 text-xs uppercase tracking-[0.2em] mb-4">Verifiable interactions</div>
              <h3 className="text-2xl font-semibold mb-3">Every interaction leaves evidence</h3>
              <p className="text-white/60 leading-relaxed">
                Access events can be logged, verified, and audited — giving compliance teams a stronger operational foundation.
              </p>
            </article>

            <article className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <div className="text-cyan-300 text-xs uppercase tracking-[0.2em] mb-4">Competitive advantage</div>
              <h3 className="text-2xl font-semibold mb-3">Trust becomes a product feature</h3>
              <p className="text-white/60 leading-relaxed">
                The first companies to give users visible control over their data can differentiate on trust, compliance, and transparency.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="integration" className="py-32 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <header className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
              How enterprises can use AOC
            </h2>
            <p className="max-w-3xl mx-auto text-white/60 text-lg">
              AOC can serve as a control and verification layer across data-heavy products and workflows.
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-8">
            <article className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-semibold mb-3">Data brokers & lookup platforms</h3>
              <p className="text-white/60 leading-relaxed">
                Replace implicit access with enforceable permission states and user-visible evidence.
              </p>
            </article>

            <article className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-semibold mb-3">Fintech, HR, health & identity</h3>
              <p className="text-white/60 leading-relaxed">
                Introduce modular permissions in sensitive workflows where consent and traceability matter most.
              </p>
            </article>

            <article className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-semibold mb-3">Compliance-forward product teams</h3>
              <p className="text-white/60 leading-relaxed">
                Build trust-centered experiences without leaving consent logic buried in policy documents.
              </p>
            </article>
          </div>

          <div className="mt-16 bg-white/[0.03] border border-white/10 rounded-3xl p-10 text-center">
            <div className="text-cyan-300 text-xs uppercase tracking-[0.2em] mb-4">Next step</div>
            <h3 className="text-3xl md:text-4xl font-semibold mb-4">
              Want to make your system compliant by design?
            </h3>
            <p className="max-w-2xl mx-auto text-white/60 leading-relaxed mb-8">
              Talk to us about enterprise use cases, pilot integrations, and how AOC can become your permission and auditability layer.
            </p>
            <a
              href="mailto:hello@aocprotocol.xyz?subject=AOC%20Enterprise%20Pilot"
              className="px-10 py-4 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold rounded-2xl transition inline-block"
            >
              Start the conversation
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};
