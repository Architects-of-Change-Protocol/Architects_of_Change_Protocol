// frontend/landing/AocLandingPage.ts

import React from 'react';

// Copy centralizado - después puedes mover esto a frontend/landing/lib/copy.ts
const copy = {
  hero: {
    title: "You don't own your data.",
    subtitle: "You just hope no one abuses it.",
    description: "There is a better system. One where access is granted, not assumed.",
    cta: "Enter the new model"
  }
};

export const renderAocLandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Navbar minimal */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo AOC - con rotación lenta como pediste antes */}
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-black font-bold text-2xl animate-[spin_25s_linear_infinite]">
              A
            </div>
            <span className="text-xl font-semibold tracking-tighter">AOC</span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm font-medium">
            <a href="#protocol" className="hover:text-gray-300 transition">Protocol</a>
            <a href="#capabilities" className="hover:text-gray-300 transition">Capabilities</a>
            <a href="#enforcement" className="hover:text-gray-300 transition">Enforcement</a>
          </div>

          <a 
            href="/app" 
            className="px-6 py-2 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition"
          >
            Launch App
          </a>
        </div>
      </nav>

      {/* HERO SECTION - principal de tu Figma */}
      <section className="min-h-screen flex items-center relative pt-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-[68px] md:text-[82px] leading-[1.05] font-semibold tracking-[-3px] mb-6">
            {copy.hero.title}
          </h1>

          <p className="text-[52px] md:text-[62px] leading-none font-light tracking-[-2px] text-gray-400 mb-8">
            {copy.hero.subtitle}
          </p>

          <p className="max-w-[620px] mx-auto text-[21px] text-gray-400 leading-relaxed mb-14">
            {copy.hero.description}
          </p>

          <button 
            onClick={() => window.location.href = '/app' /* o tu lógica de wallet */}
            className="group px-12 py-5 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold text-xl rounded-2xl transition-all active:scale-[0.97] flex items-center gap-3 mx-auto"
          >
            {copy.hero.cta}
            <span className="group-hover:translate-x-1 transition">→</span>
          </button>
        </div>

        {/* Fondo sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff10_0%,transparent_60%)]" />
      </section>

      {/* Placeholder para el resto de secciones de tu Figma */}
      <div className="h-32 bg-black" /> {/* Espacio de separación */}

      {/* Aquí agregarás más secciones después (Features, Benefits, Footer, etc.) */}
      <section className="py-32 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-500">Otras secciones de tu Figma irían aquí...</p>
        </div>
      </section>
    </div>
  );
};
