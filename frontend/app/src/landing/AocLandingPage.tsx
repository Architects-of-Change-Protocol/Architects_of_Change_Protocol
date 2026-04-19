import { useState } from 'react';
import { AocInfrastructureAnimated } from './components/AocInfrastructureAnimated'
import { HowItWorksFlow } from './components/HowItWorksFlow';
import { LogoRotating } from '../components/logo/LogoRotating';
import { ProblemCard } from './components/ProblemCard';
import { DataPipelineAnimation } from './components/DataPipelineAnimation';
import { ImplicitConsentAnimation } from './components/ImplicitConsentAnimation';
import { InvisibleAccessAnimation } from './components/InvisibleAccessAnimation';
import { BlindTrustAnimation } from './components/BlindTrustAnimation';
import { ModularPermissionsAnimation } from './components/ModularPermissionsAnimation';
import { ExplicitConsentAnimation } from './components/ExplicitConsentAnimation';
import { VerifiableInteractionsAnimation } from './components/VerifiableInteractionsAnimation';
import { FullControlAnimation } from './components/FullControlAnimation';

export const AocLandingPage = () => {
  const [mobileHowExpanded, setMobileHowExpanded] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'user' | 'company'>('user');
  const openHowSection = () => {
    if (mobileHowExpanded) {
      setMobileHowExpanded(false);
      return;
    }

    setMobileHowExpanded(true);
    requestAnimationFrame(() => {
      document.getElementById('how')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
      <header>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black relative/90 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                <LogoRotating size={24} inverted />
              </div>

              <div className="flex items-baseline">
                <span className="text-lg md:text-xl font-semibold tracking-tighter">AOC</span>
                <span className="text-[10px] md:text-xs text-white uppercase tracking-[0.2em] ml-1.5 md:ml-2">
                  Protocol
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-10 text-sm font-medium">
              <a href="#problem" className="hover:text-white transition">
                Problem
              </a>
              <a href="#solution" className="hover:text-white transition">
                Solution
              </a>
              <a href="#how" className="hover:text-white transition">
                How it works
              </a>
            </div>

            <a
              href="/app"
              className="px-4 py-2 md:px-6 md:py-2.5 bg-white text-black rounded-full text-xs md:text-sm font-semibold hover:bg-gray-200 transition active:scale-[0.98] inline-block min-h-[40px] md:min-h-0"
            >
              Launch App
            </a>
          </div>
        </nav>
      </header>

      <section className="min-h-screen flex items-center pt-14 md:pt-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center py-8 md:py-0">
          <div className="md:hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left max-w-xl mx-auto">
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/80 mb-2">AOC Protocol</p>
            <h1 className="text-[31px] leading-[1.05] font-semibold tracking-tight">
              Control your data access.
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Govern every request through explicit permission.
            </p>

            <div className="mt-4">
              <a
                href="/app"
                className="w-full px-6 py-3.5 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold text-base rounded-xl transition-all active:scale-[0.98] inline-block text-center"
              >
                Launch App
              </a>
            </div>

            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-2">I am a</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMode('user')}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium border transition ${
                    selectedMode === 'user'
                      ? 'bg-cyan-400/15 border-cyan-300/70 text-cyan-200'
                      : 'bg-white/[0.02] border-white/15 text-white/80'
                  }`}
                >
                  User
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('company')}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium border transition ${
                    selectedMode === 'company'
                      ? 'bg-cyan-400/15 border-cyan-300/70 text-cyan-200'
                      : 'bg-white/[0.02] border-white/15 text-white/80'
                  }`}
                >
                  Company
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              <a
                href="#how"
                onClick={(event) => {
                  event.preventDefault();
                  openHowSection();
                }}
                className="w-full px-6 py-3 border border-white/15 hover:border-white/30 text-white font-medium text-sm rounded-xl transition-all"
              >
                {mobileHowExpanded ? 'Hide explanation ↑' : 'See how it works ↓'}
              </a>
            </div>
          </div>

          <div className="hidden md:block">
            <h1 className="text-[40px] sm:text-[48px] md:text-[82px] leading-[1.02] md:leading-[1.05] font-semibold tracking-[-1.8px] md:tracking-[-3.5px] mb-4 md:mb-6">
              You don&apos;t own your data.
            </h1>

            <p className="text-[30px] sm:text-[36px] md:text-[62px] leading-[1.04] md:leading-none font-light tracking-[-1px] md:tracking-[-2px] text-white mb-5 md:mb-8">
              You just hope no one abuses it.
            </p>

            <p className="max-w-[620px] mx-auto text-base md:text-[21px] text-white/90 leading-relaxed md:leading-relaxed mb-8 md:mb-14">
              There is a better system. One where access is granted, not assumed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#solution"
                className="w-full sm:w-auto px-7 py-3.5 md:px-12 md:py-5 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold text-base md:text-xl rounded-xl md:rounded-2xl transition-all active:scale-[0.98] inline-block"
              >
                Enter the new model →
              </a>

              <a
                href="/enterprise"
                className="w-full sm:w-auto px-7 py-3.5 md:px-10 md:py-5 border border-white/15 hover:border-white/30 text-white font-semibold text-base md:text-xl rounded-xl md:rounded-2xl transition-all active:scale-[0.98] inline-block"
              >
                Integrate AOC
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="scroll-mt-20 md:scroll-mt-24 py-12 md:py-40 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <header className="text-center mb-8 md:mb-20">
            <h2 className="text-3xl md:text-6xl font-semibold tracking-tight">
              The current model is broken.
            </h2>
          </header>

          <div className="grid md:grid-cols-2 gap-4 md:gap-10">
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

      <section id="solution" className="scroll-mt-20 md:scroll-mt-24 py-12 md:py-40 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center">
          <header className="mb-8 md:mb-24">
            <h2 className="text-3xl md:text-6xl font-semibold mb-4 md:mb-6">
              What if access required permission?
            </h2>
            <p className="text-base md:text-xl text-white">
              Not assumed. Not inherited. Not silently granted.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-4 md:gap-8">
            <article className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8 hover:-translate-y-1 transition min-h-[220px] md:min-h-[320px] flex flex-col">
              <div className="text-xs md:text-sm text-white/60 mb-3 md:mb-4">Explicit consent</div>
              <div className="flex-1 flex items-center justify-center">
                <ExplicitConsentAnimation />
              </div>
            </article>
            <article className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8 hover:-translate-y-1 transition min-h-[220px] md:min-h-[320px] flex flex-col">
              <div className="text-xs md:text-sm text-white/60 mb-3 md:mb-4">Modular permissions</div>
              <div className="flex-1 flex items-center justify-center">
                <ModularPermissionsAnimation />
              </div>
            </article>
            <article className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8 hover:-translate-y-1 transition min-h-[220px] md:min-h-[320px] flex flex-col">
              <div className="text-xs md:text-sm text-white/60 mb-3 md:mb-4">Verifiable interactions</div>
              <div className="flex-1 flex items-center justify-center">
                <VerifiableInteractionsAnimation />
              </div>
            </article>
            <article className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8 hover:-translate-y-1 transition min-h-[220px] md:min-h-[320px] flex flex-col">
              <div className="text-xs md:text-sm text-white/60 mb-3 md:mb-4">Full control remains with the user</div>
              <div className="flex-1 flex items-center justify-center">
                <FullControlAnimation />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 md:scroll-mt-24 py-12 md:py-32 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-6xl font-semibold mb-3 md:mb-4">How it works</h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-6 md:leading-7 text-white/60 mb-6 md:mb-10">
            AOC enforces access in real time. Every request is evaluated against explicit
            permissions, then granted or denied, and permanently recorded.
          </p>

          <div
            className={`w-full md:h-[460px] md:flex md:items-center md:justify-center bg-black relative before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.07)_0%,transparent_70%)] before:animate-pulse ${
              mobileHowExpanded ? 'h-[430px] flex items-center justify-center' : 'hidden md:flex'
            }`}
          >
            <div className="relative w-full max-w-5xl h-full rounded-2xl md:rounded-3xl border border-white/10 bg-white/[0.02] p-3 sm:p-6 md:p-8">
              <div className="absolute left-4 top-[72px] w-[130px] sm:hidden text-left pointer-events-none">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                  Step 1
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Define Permissions
                </p>
              </div>

              <div className="absolute left-4 top-[190px] w-[130px] sm:hidden text-left pointer-events-none">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                  Step 2
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Evaluate Request
                </p>
              </div>

              <div className="absolute left-4 top-[305px] w-[130px] sm:hidden text-left pointer-events-none">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                  Step 3
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Grant &amp; Audit Access
                </p>
              </div>

              <div className="w-full h-full flex items-center justify-center pl-[106px] sm:pl-0">
                <div className="w-full h-full transform rotate-90 sm:rotate-0 scale-[2.15] sm:scale-100 origin-center">
                  <HowItWorksFlow />
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-6 md:mt-10 grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-3 ${mobileHowExpanded ? '' : 'hidden md:grid'}`}>
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                Step 1
              </p>
              <h3 className="mt-2 text-base md:text-lg font-semibold text-white">
                Define Permissions
              </h3>
              <p className="mt-2 text-xs md:text-sm leading-5 md:leading-6 text-white/60">
                Every interaction starts with explicit rules. Who can access what, under which conditions.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                Step 2
              </p>
              <h3 className="mt-2 text-base md:text-lg font-semibold text-white">
                Evaluate Request
              </h3>
              <p className="mt-2 text-xs md:text-sm leading-5 md:leading-6 text-white/60">
                Each request is checked in real time against permissions, context, and policy.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                Step 3
              </p>
              <h3 className="mt-2 text-base md:text-lg font-semibold text-white">
                Grant &amp; Audit Access
              </h3>
              <p className="mt-2 text-xs md:text-sm leading-5 md:leading-6 text-white/60">
                Approved actions execute. Every outcome is recorded for transparency and auditability.
              </p>
            </article>
          </div>
        </div>
      </section>
<AocInfrastructureAnimated />
      <section className="py-12 md:py-32 border-t border-white/10 text-center">
        <div>
          <h2 className="text-3xl md:text-6xl font-semibold mb-5 md:mb-8">Access should be earned.</h2>
          <button className="px-7 py-3.5 md:px-12 md:py-6 bg-[#00f0ff] text-black font-semibold text-base md:text-2xl rounded-xl md:rounded-2xl hover:scale-[1.03] transition">
            Start building on AOC →
          </button>
        </div>
      </section>
    </main>
  );
};
