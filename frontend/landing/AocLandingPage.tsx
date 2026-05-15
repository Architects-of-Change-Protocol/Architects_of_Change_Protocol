// frontend/landing/AocLandingPage.tsx
import React from 'react';
import { ProblemCard } from './components/ProblemCard';
import { DataPipelineAnimation } from './components/DataPipelineAnimation';
import { ImplicitConsentAnimation } from './components/ImplicitConsentAnimation';
import { InvisibleAccessAnimation } from './components/InvisibleAccessAnimation';
import { BlindTrustAnimation } from './components/BlindTrustAnimation';
import { AocInfrastructureAnimated } from './components/AocInfrastructureAnimated';

const useCases = [
  [
    'AI Copilots',
    'Copilots need task-specific access, not persistent system-wide privileges. AOC issues temporary permissions and logs every action.',
  ],
  [
    'PMOs',
    'Program teams coordinate across sensitive milestones. AOC enforces role and project boundaries across shared workflows.',
  ],
  [
    'HR Systems',
    'People data must stay tightly controlled. AOC limits who or what can read, update, or export employee records.',
  ],
  [
    'Healthcare Data',
    'Clinical and operational data requires strict policy controls. AOC applies scoped access with auditable decisions for compliance.',
  ],
  [
    'Vendor Access',
    'Third parties often keep access after work changes. AOC provides revocable, time-bound permissions for external partners.',
  ],
  [
    'Enterprise APIs',
    'API keys are commonly over-scoped. AOC applies granular machine authorization for each integration path.',
  ],
  [
    'Contractor Permissions',
    'Contractors need fast onboarding with safe boundaries. AOC grants narrow access that expires automatically.',
  ],
  [
    'Customer Data Systems',
    'Support and AI workflows touch customer data daily. AOC enforces least-privilege access with full traceability.',
  ],
];

export const renderAocLandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-black font-bold text-3xl animate-[spin_30s_linear_infinite]">
              A
            </div>
            <span className="text-2xl font-semibold tracking-tighter">AOC</span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm font-medium">
            <a href="#problem" className="hover:text-gray-300">
              Problem
            </a>
            <a href="#solution" className="hover:text-gray-300">
              Solution
            </a>
            <a href="#use-cases" className="hover:text-gray-300">
              Use Cases
            </a>
          </div>

          <a
            href="/app"
            className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200"
          >
            Launch Platform
          </a>
        </div>
      </nav>

      <section className="min-h-screen flex items-center justify-center pt-20 relative px-6 text-center">
        <div className="max-w-6xl relative z-10">
          <h1 className="text-[56px] sm:text-[72px] md:text-[110px] lg:text-[124px] leading-[1.02] font-semibold tracking-[-2.5px] md:tracking-[-5.5px] mb-6">
            Control exactly what AI can access.
          </h1>

          <p className="text-xl md:text-3xl text-gray-400 max-w-4xl mx-auto mb-14 md:mb-20">
            AOC Enterprise gives organizations programmable control over data, systems,
            and AI agents using auditable permissions, scoped access, and enterprise-grade
            governance.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
            <button
              onClick={() => {
                window.location.href = '/app';
              }}
              className="px-10 md:px-16 py-6 md:py-7 bg-[#00f0ff] hover:bg-[#00e5ff] text-black font-semibold text-xl md:text-2xl rounded-2xl transition-all active:scale-95 shadow-2xl shadow-cyan-500/50"
            >
              Launch Platform
            </button>
            <a
              href="#solution"
              className="px-10 py-6 md:py-7 border border-white/30 hover:border-white/60 text-white font-medium text-xl rounded-2xl transition-all"
            >
              Explore Enterprise
            </a>
            <a
              href="/docs"
              className="px-10 py-6 md:py-7 border border-white/20 hover:border-white/50 text-gray-300 hover:text-white font-medium text-xl rounded-2xl transition-all"
            >
              Read Documentation
            </a>
          </div>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff10_0%,transparent_70%)] pointer-events-none" />
      </section>

      <section id="problem" className="py-32 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight text-center mb-6">
            Most AI systems are over-permissioned.
          </h2>

          <p className="text-xl text-gray-400 text-center max-w-4xl mx-auto mb-20">
            AI agents, vendor tools, and automation layers often keep broad access long
            after it is needed. That creates security exposure, compliance friction,
            and operational risk leaders cannot fully audit.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <ProblemCard title={<>AI agents get broad access by default.</>}>
              <DataPipelineAnimation />
            </ProblemCard>

            <ProblemCard title={<>Vendors and automations keep unnecessary permissions.</>}>
              <ImplicitConsentAnimation />
            </ProblemCard>

            <ProblemCard title={<>Audit trails are fragmented and incomplete.</>}>
              <InvisibleAccessAnimation />
            </ProblemCard>

            <ProblemCard title={<>Every integration becomes a trust liability.</>}>
              <BlindTrustAnimation />
            </ProblemCard>
          </div>
        </div>
      </section>

      <section id="solution" className="py-32 border-t border-white/10 bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight text-center mb-6">
            AOC adds programmable permissions to AI and enterprise systems.
          </h2>

          <p className="text-xl text-gray-400 text-center max-w-4xl mx-auto mb-20">
            Capability-based authorization — programmable digital permissions with limited
            scope — helps teams enforce policy without slowing delivery.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h3 className="text-3xl font-semibold mb-4">Scoped Access</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Precise control over what AI systems can access and do across systems,
                data, and workflows.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h3 className="text-3xl font-semibold mb-4">Policy Enforcement</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Intelligent rules that enforce operational boundaries for humans, vendors,
                APIs, and AI agents.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h3 className="text-3xl font-semibold mb-4">Auditability</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Track, verify, and review critical permissions and actions with records
                designed for security and compliance teams.
              </p>
            </div>
          </div>

          <AocInfrastructureAnimated />
        </div>
      </section>

      <section id="use-cases" className="py-32 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight text-center mb-6">
            Real enterprise use cases.
          </h2>

          <p className="text-xl text-gray-400 text-center max-w-4xl mx-auto mb-16">
            Infrastructure for controlled AI access across copilots, operations, vendors,
            and regulated data environments.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map(([title, copy]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.015] p-6">
                <h3 className="text-2xl font-semibold mb-3 tracking-tight">{title}</h3>
                <p className="text-gray-300 leading-relaxed">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 border-t border-white/10 bg-black text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8">
            Govern what AI can access, do, and share.
          </h2>

          <p className="text-xl text-gray-400 mb-12">
            Enterprise-grade authorization for machine trust and operational control.
          </p>

          <a
            href="#solution"
            className="inline-flex px-16 py-7 bg-[#00f0ff] hover:bg-[#00e5ff] text-black font-semibold text-2xl rounded-2xl transition-all active:scale-95"
          >
            Explore Enterprise
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div>AOC — Architects of Change Protocol</div>

          <div className="flex gap-8 mt-6 md:mt-0">
            <a href="/docs" className="hover:text-gray-300">
              Documentation
            </a>
            <a
              href="https://github.com/Architects-of-Change-Protocol"
              className="hover:text-gray-300"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a href="mailto:enterprise@aocprotocol.org" className="hover:text-gray-300">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
