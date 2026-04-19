// frontend/landing/AocLandingPage.ts
import React from 'react';
import { ProblemCard } from './components/ProblemCard';
import { DataPipelineAnimation } from './components/DataPipelineAnimation';
import { ImplicitConsentAnimation } from './components/ImplicitConsentAnimation';
import { InvisibleAccessAnimation } from './components/InvisibleAccessAnimation';
import { BlindTrustAnimation } from './components/BlindTrustAnimation';
import { AocInfrastructureAnimated } from './components/AocInfrastructureAnimated'

export const renderAocLandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden font-sans">
      {/* Navbar */}
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
            <a href="#how" className="hover:text-gray-300">
              How it works
            </a>
          </div>

          <a
            href="/app"
            className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200"
          >
            Launch App
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center pt-20 relative px-6 text-center">
        <div className="max-w-6xl relative z-10">
          <h1 className="text-[82px] md:text-[110px] lg:text-[124px] leading-[1.02] font-semibold tracking-[-5.5px] mb-6">
            You don't own your data.
          </h1>

          <p className="text-[54px] md:text-[74px] lg:text-[84px] font-light tracking-[-3px] text-gray-300 mb-12">
            You just hope no one abuses it.
          </p>

          <p className="text-2xl md:text-3xl text-gray-400 max-w-3xl mx-auto mb-20">
            There is a better system. One where access is granted, not assumed.
          </p>

          <button
            onClick={() => {
              window.location.href = '/app';
            }}
            className="px-16 py-7 bg-[#00f0ff] hover:bg-[#00e5ff] text-black font-semibold text-2xl rounded-2xl transition-all active:scale-95 shadow-2xl shadow-cyan-500/50"
          >
            Enter the new model →
          </button>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff10_0%,transparent_70%)] pointer-events-none" />
      </section>

      {/* Problem section */}
      <section id="problem" className="py-32 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-6xl md:text-7xl font-semibold tracking-tight text-center mb-20">
            The current model is broken.
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <ProblemCard title={<>Your data is copied. Stored. Resold.</>}>
              <DataPipelineAnimation />
            </ProblemCard>

            <ProblemCard title={<>Consent is implied. Not explicit.</>}>
              <ImplicitConsentAnimation />
            </ProblemCard>

            <ProblemCard title={<>You never see who accessed what.</>}>
              <InvisibleAccessAnimation />
            </ProblemCard>

            <ProblemCard title={<>Trust is a blind assumption.</>}>
              <BlindTrustAnimation />
            </ProblemCard>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 border-t border-white/10 bg-black text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-6xl md:text-7xl font-semibold tracking-tight mb-12">
            Access should be earned.
          </h2>

          <button
            onClick={() => {
              window.location.href = '/app';
            }}
            className="px-16 py-7 bg-[#00f0ff] hover:bg-[#00e5ff] text-black font-semibold text-2xl rounded-2xl transition-all active:scale-95"
          >
            Start building on AOC →
          </button>

          <p className="mt-10 text-gray-400 text-lg">
            Join the infrastructure for sovereign data
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div>AOC — Architects of Change Protocol</div>

          <div className="flex gap-8 mt-6 md:mt-0">
            <a href="#" className="hover:text-gray-300">
              Documentation
            </a>
            <a href="#" className="hover:text-gray-300">
              GitHub
            </a>
            <a href="#" className="hover:text-gray-300">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
