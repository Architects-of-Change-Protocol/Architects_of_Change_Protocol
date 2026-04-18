import { HowItWorksFlow } from './components/HowItWorksFlow';
import { LogoRotating } from '../components/logo/LogoRotating';
import { ProblemCard } from './components/ProblemCard';
import { DataPipelineAnimation } from './components/DataPipelineAnimation';
import { ImplicitConsentAnimation } from './components/ImplicitConsentAnimation';
import { InvisibleAccessAnimation } from './components/InvisibleAccessAnimation';
import { BlindTrustAnimation } from './components/BlindTrustAnimation';

export const renderAocLandingPage = () => {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
      <header>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <LogoRotating size={28} inverted />
              </div>

              <div className="flex items-baseline">
                <span className="text-xl font-semibold tracking-tighter">AOC</span>
                <span className="text-xs text-gray-300 uppercase tracking-[0.2em] ml-2">
                  Protocol
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-10 text-sm font-medium">
              <a href="#problem" className="hover:text-gray-300 transition">
                Problem
              </a>
              <a href="#solution" className="hover:text-gray-300 transition">
                Solution
              </a>
              <a href="#how" className="hover:text-gray-300 transition">
                How it works
              </a>
            </div>

            <a
              href="#how"
              className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition"
            >
              Launch App
            </a>
          </div>
        </nav>
      </header>

      <section className="min-h-screen flex items-center pt-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-[68px] md:text-[82px] leading-[1.05] font-semibold tracking-[-3.5px] mb-6">
            You don&apos;t own your data.
          </h1>

          <p className="text-[52px] md:text-[62px] leading-none font-light tracking-[-2px] text-gray-300 mb-8">
            You just hope no one abuses it.
          </p>

          <p className="max-w-[620px] mx-auto text-[21px] text-gray-300 leading-relaxed mb-14">
            There is a better system. One where access is granted, not assumed.
          </p>

          <a
            href="#solution"
            className="px-12 py-5 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold text-xl rounded-2xl transition-all active:scale-[0.97] inline-block"
          >
            Enter the new model →
          </a>
        </div>
      </section>

      <section id="problem" className="scroll-mt-24 py-40 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <header className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tight">
              The current model is broken.
            </h2>
          </header>

          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <ProblemCard title={<>Your data is copied. Stored. Resold.</>}>
                <DataPipelineAnimation />
              </ProblemCard>
            </div>

            <div>
              <ProblemCard title={<>Consent is implied. Not explicit.</>}>
                <ImplicitConsentAnimation />
              </ProblemCard>
            </div>

            <div>
              <ProblemCard title={<>You never see who accessed what.</>}>
                <InvisibleAccessAnimation />
              </ProblemCard>
            </div>

            <div>
              <ProblemCard title={<>Trust is a blind assumption.</>}>
                <BlindTrustAnimation />
              </ProblemCard>
            </div>
          </div>
        </div>
      </section>

      <section id="solution" className="scroll-mt-24 py-40 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <header className="mb-24">
            <h2 className="text-5xl md:text-6xl font-semibold mb-6">
              What if access required permission?
            </h2>
            <p className="text-xl text-gray-300">
              Not assumed. Not inherited. Not silently granted.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8">
            <article className="bg-white/[0.03] border border-white/10 rounded-3xl p-10 hover:-translate-y-1 transition">
              Explicit consent
            </article>
            <article className="bg-white/[0.03] border border-white/10 rounded-3xl p-10 hover:-translate-y-1 transition">
              Modular permissions
            </article>
            <article className="bg-white/[0.03] border border-white/10 rounded-3xl p-10 hover:-translate-y-1 transition">
              Verifiable interactions
            </article>
            <article className="bg-white/[0.03] border border-white/10 rounded-3xl p-10 hover:-translate-y-1 transition">
              Full control remains with the user
            </article>
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-24 py-32 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-semibold mb-4">How it works</h2>

          <p className="max-w-2xl mx-auto text-base sm:text-lg leading-7 text-white/60 mb-10">
            AOC enforces access in real time. Every request is evaluated against explicit
            permissions, then granted or denied, and permanently recorded.
          </p>

          <div className="w-full h-[660px] sm:h-[420px] md:h-[460px] flex items-center justify-center bg-black">
            <div className="relative w-full max-w-5xl h-full rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 md:p-8">
              <div className="absolute left-5 top-[96px] w-[165px] sm:hidden text-left pointer-events-none">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                  Step 1
                </p>
                <p className="mt-1 text-base font-semibold text-white">
                  Define Permissions
                </p>
              </div>

              <div className="absolute left-5 top-[288px] w-[165px] sm:hidden text-left pointer-events-none">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                  Step 2
                </p>
                <p className="mt-1 text-base font-semibold text-white">
                  Evaluate Request
                </p>
              </div>

              <div className="absolute left-5 top-[468px] w-[165px] sm:hidden text-left pointer-events-none">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                  Step 3
                </p>
                <p className="mt-1 text-base font-semibold text-white">
                  Grant &amp; Audit Access
                </p>
              </div>

              <div className="w-full h-full flex items-center justify-center pl-[138px] sm:pl-0">
                <div className="w-full h-full transform rotate-90 sm:rotate-0 scale-[2.6] sm:scale-100 origin-center">
                  <HowItWorksFlow />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                Step 1
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                Define Permissions
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Every interaction starts with explicit rules. Who can access what, under which conditions.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                Step 2
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                Evaluate Request
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Each request is checked in real time against permissions, context, and policy.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                Step 3
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                Grant &amp; Audit Access
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Approved actions execute. Every outcome is recorded for transparency and auditability.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="py-32 border-t border-white/10 text-center">
        <div>
          <h2 className="text-6xl font-semibold mb-8">Access should be earned.</h2>
          <button className="px-12 py-6 bg-[#00f0ff] text-black font-semibold text-2xl rounded-2xl hover:scale-[1.02] transition">
            Start building on AOC →
          </button>
        </div>
      </section>
    </main>
  );
};
