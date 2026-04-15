// frontend/landing/AocLandingPage.ts
import React from 'react';

const landingCopy = {
  hero: {
    title: "You don't own your data.",
    subtitle: "You just hope no one abuses it.",
    description: "There is a better system. One where access is granted, not assumed.",
    cta: "Enter the new model"
  }
};

export const renderAocLandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-2xl flex items-center justify-center text-black font-bold text-2xl animate-[spin_30s_linear_infinite]">
              A
            </div>
            <span className="text-xl font-semibold tracking-tighter">AOC</span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm font-medium">
            <a href="#problem" className="hover:text-gray-300 transition-colors">The Problem</a>
            <a href="#solution" className="hover:text-gray-300 transition-colors">Solution</a>
            <a href="#how" className="hover:text-gray-300 transition-colors">How it works</a>
          </div>

          <a 
            href="/app" 
            className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition"
          >
            Launch App
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center pt-16 relative">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-[68px] md:text-[82px] leading-[1.05] font-semibold tracking-[-3.5px] mb-6">
            {landingCopy.hero.title}
          </h1>
          <p className="text-[52px] md:text-[62px] leading-none font-light tracking-[-2px] text-gray-400 mb-8">
            {landingCopy.hero.subtitle}
          </p>
          <p className="max-w-[620px] mx-auto text-[21px] text-gray-400 leading-relaxed mb-14">
            {landingCopy.hero.description}
          </p>

          <button 
            onClick={() => window.location.href = '/app'}
            className="group px-12 py-5 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold text-xl rounded-2xl transition-all active:scale-[0.97] flex items-center gap-3 mx-auto"
          >
            {landingCopy.hero.cta} →
          </button>
        </div>

        {/* Fondo sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff12_0%,transparent_65%)] pointer-events-none" />
      </section>

      {/* SECTION 2: The current model is broken */}
      <section id="problem" className="py-32 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-6xl font-semibold tracking-tight text-center mb-20">
            The current model is broken.
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <p className="text-xl leading-relaxed">
                Your data is copied.<br />
                Stored.<br />
                <span className="text-gray-400">Resold.</span>
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <p className="text-xl leading-relaxed">
                Consent is implied.<br />
                <span className="text-gray-400">Not explicit.</span>
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <p className="text-xl leading-relaxed">
                You never see who accessed what.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <p className="text-xl leading-relaxed">
                Trust is a blind assumption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Espacio para las siguientes secciones */}
      <div className="h-32" />
    </div>
  );
};
