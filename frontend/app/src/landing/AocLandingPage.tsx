import { useEffect, useState } from 'react';
import { HowItWorksFlow } from './components/HowItWorksFlow';
import { LogoRotating } from '../components/logo/LogoRotating';
import { ProblemCard } from './components/ProblemCard';
import { DataPipelineAnimation } from './components/DataPipelineAnimation';
import { ImplicitConsentAnimation } from './components/ImplicitConsentAnimation';
import { InvisibleAccessAnimation } from './components/InvisibleAccessAnimation';
import { BlindTrustAnimation } from './components/BlindTrustAnimation';

type StageIndex = 0 | 1 | 2;

type StageCard = {
  id: StageIndex;
  title: string;
  description: string;
};

const STAGE_ROTATION_MS = 2000;

const HOW_IT_WORKS_STAGES: StageCard[] = [
  {
    id: 0,
    title: 'Define Permissions',
    description: 'Set granular rules for who can access what, under which conditions.',
  },
  {
    id: 1,
    title: 'Evaluate Request',
    description: 'Each incoming request is checked against live permissions and system policy.',
  },
  {
    id: 2,
    title: 'Grant & Audit Access',
    description: 'Approved actions execute and every outcome is written to an auditable trail.',
  },
];

export const renderAocLandingPage = () => {
  const [activeStage, setActiveStage] = useState<StageIndex>(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStage((prev) => ((prev + 1) % HOW_IT_WORKS_STAGES.length) as StageIndex);
    }, STAGE_ROTATION_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

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
          <h1 className=" text-[68px] md:text-[82px] leading-[1.05] font-semibold tracking-[-3.5px] mb-6">
            You don&apos;t own your data.
          </h1>

          <p className=" text-[52px] md:text-[62px] leading-none font-light tracking-[-2px] text-gray-300 mb-8">
            You just hope no one abuses it.
          </p>

          <p className=" max-w-[620px] mx-auto text-[21px] text-gray-300 leading-relaxed mb-14">
            There is a better system. One where access is granted, not assumed.
          </p>

          <a
            href="#solution"
            className=" px-12 py-5 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold text-xl rounded-2xl transition-all active:scale-[0.97] inline-block"
          >
            Enter the new model →
          </a>
        </div>
      </section>

      <section id="problem" className="scroll-mt-24 py-40 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <header className="text-center mb-20 ">
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tight">
              The current model is broken.
            </h2>
          </header>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="">
              <ProblemCard title={<>Your data is copied. Stored. Resold.</>}>
                <DataPipelineAnimation />
              </ProblemCard>
            </div>

            <div className="">
              <ProblemCard title={<>Consent is implied. Not explicit.</>}>
                <ImplicitConsentAnimation />
              </ProblemCard>
            </div>

            <div className="">
              <ProblemCard title={<>You never see who accessed what.</>}>
                <InvisibleAccessAnimation />
              </ProblemCard>
            </div>

            <div className="">
              <ProblemCard title={<>Trust is a blind assumption.</>}>
                <BlindTrustAnimation />
              </ProblemCard>
            </div>
          </div>
        </div>
      </section>

      <section id="solution" className="scroll-mt-24 py-40 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <header className="mb-24 ">
            <h2 className="text-5xl md:text-6xl font-semibold mb-6">
              What if access required permission?
            </h2>
            <p className="text-xl text-gray-300">
              Not assumed. Not inherited. Not silently granted.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8">
            <article className=" bg-white/[0.03] border border-white/10 rounded-3xl p-10 hover:-translate-y-1 transition">
              Explicit consent
            </article>
            <article className=" bg-white/[0.03] border border-white/10 rounded-3xl p-10 hover:-translate-y-1 transition">
              Modular permissions
            </article>
            <article className=" bg-white/[0.03] border border-white/10 rounded-3xl p-10 hover:-translate-y-1 transition">
              Verifiable interactions
            </article>
            <article className=" bg-white/[0.03] border border-white/10 rounded-3xl p-10 hover:-translate-y-1 transition">
              Full control remains with the user
            </article>
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-24 py-24 md:py-28 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <header className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-white/55 mb-4">Realtime authorization flow</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-5">How AOC works</h2>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
              AOC enforces permissions in real time. Every request is evaluated against explicit access
              rules, then granted, denied, and recorded for audit.
            </p>
          </header>

          <div className="bg-white/[0.02] border border-white/10 rounded-[28px] px-3 sm:px-4 md:px-6 py-4 md:py-6 mb-8 md:mb-10">
            <div className="w-full h-[280px] sm:h-[320px] md:h-[360px] lg:h-[390px]">
              <HowItWorksFlow activeStage={activeStage} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {HOW_IT_WORKS_STAGES.map((stage) => {
              const isActive = stage.id === activeStage;

              return (
                <article
                  key={stage.id}
                  className={[
                    'rounded-2xl border p-6 md:p-7 transition-all duration-300',
                    isActive
                      ? 'border-cyan-300/50 bg-cyan-400/[0.08] shadow-[0_0_40px_rgba(0,240,255,0.12)]'
                      : 'border-white/10 bg-white/[0.02]',
                  ].join(' ')}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-white/50 mb-3">Stage {stage.id + 1}</p>
                  <h3 className="text-xl font-semibold mb-3 text-white">{stage.title}</h3>
                  <p className="text-sm sm:text-base leading-relaxed text-gray-300">{stage.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-32 border-t border-white/10 text-center">
        <div className="">
          <h2 className="text-6xl font-semibold mb-8">Access should be earned.</h2>
          <button className="px-12 py-6 bg-[#00f0ff] text-black font-semibold text-2xl rounded-2xl hover:scale-[1.02] transition">
            Start building on AOC →
          </button>
        </div>
      </section>
    </main>
  );
};
