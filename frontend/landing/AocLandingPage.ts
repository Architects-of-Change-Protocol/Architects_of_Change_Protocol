// frontend/landing/AocLandingPage.ts
import React from 'react';

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
            <a href="#problem" className="hover:text-gray-300 transition-colors">Problem</a>
            <a href="#solution" className="hover:text-gray-300 transition-colors">Solution</a>
            <a href="#how" className="hover:text-gray-300 transition-colors">How it works</a>
          </div>
          <a href="/app" className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition">
            Launch App
          </a>
        </div>
      </nav>

      {/* HERO - Más fiel a Figma */}
      <section className="min-h-screen flex items-center pt-20 relative">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-[82px] md:text-[110px] lg:text-[124px] leading-[1.02] font-semibold tracking-[-5.5px] mb-8">
            You don't own your data.
          </h1>

          <p className="text-[54px] md:text-[74px] lg:text-[84px] font-light tracking-[-3px] text-gray-300 mb-12 leading-none">
            You just hope no one abuses it.
          </p>

          <p className="text-2xl md:text-3xl text-gray-400 max-w-3xl mx-auto mb-20">
            There is a better system. One where access is granted, not assumed.
          </p>

          <button 
            onClick={() => window.location.href = '/app'}
            className="group px-16 py-7 bg-[#00f0ff] hover:bg-[#00e5ff] text-black font-semibold text-2xl rounded-2xl transition-all active:scale-[0.97] shadow-2xl shadow-cyan-500/50"
          >
            Enter the new model →
          </button>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff10_0%,transparent_70%)] pointer-events-none" />
      </section>

      {/* 2. The current model is broken */}
      <section id="problem" className="py-32 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-6xl md:text-7xl font-semibold tracking-tight text-center mb-20">
            The current model is broken.
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12">
              <p className="text-2xl leading-relaxed">Your data is copied.<br />Stored.<br /><span className="text-gray-400">Resold.</span></p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12">
              <p className="text-2xl leading-relaxed">Consent is implied.<br /><span className="text-gray-400">Not explicit.</span></p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12">
              <p className="text-2xl leading-relaxed">You never see who accessed what.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12">
              <p className="text-2xl leading-relaxed">Trust is a blind assumption.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. What if access required permission? */}
      <section className="py-32 border-t border-white/10 bg-black">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-6xl md:text-7xl font-semibold tracking-tight mb-8">
            What if access required permission?
          </h2>
          <p className="text-2xl text-gray-400 max-w-3xl mx-auto mb-20">
            A system where every piece of data is locked behind explicit, modular consent.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 flex gap-6">
              <div className="text-[#00f0ff] text-4xl">🛡️</div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">You approve access</h3>
                <p className="text-gray-400">You decide who can see your data.</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 flex gap-6">
              <div className="text-[#00f0ff] text-4xl">🔐</div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">You define scope</h3>
                <p className="text-gray-400">Granular control over what gets shared.</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 flex gap-6">
              <div className="text-[#00f0ff] text-4xl">↩️</div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">You can revoke at any time</h3>
                <p className="text-gray-400">No permanent access.</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 flex gap-6">
              <div className="text-[#00f0ff] text-4xl">👁️</div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Every interaction is traceable</h3>
                <p className="text-gray-400">Full transparency and auditability.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AOC is not an app. It's a new data layer */}
      <section className="py-32 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-6xl md:text-7xl font-semibold tracking-tight mb-4">
            AOC is not an app.
          </h2>
          <h3 className="text-6xl md:text-7xl font-semibold tracking-tight text-[#00f0ff] mb-10">
            It's a new data layer.
          </h3>
          <p className="text-2xl text-gray-400 max-w-3xl mx-auto mb-20">
            A sovereign infrastructure where individuals control access to their information.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <h4 className="text-2xl font-semibold mb-4">Consent-based access</h4>
              <p className="text-gray-400">Nothing happens without explicit permission</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <h4 className="text-2xl font-semibold mb-4">Modular permissions</h4>
              <p className="text-gray-400">Granular control over what gets shared</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <h4 className="text-2xl font-semibold mb-4">Verifiable interactions</h4>
              <p className="text-gray-400">Every access event is cryptographically logged</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <h4 className="text-2xl font-semibold mb-4">No central ownership</h4>
              <p className="text-gray-400">Data remains sovereign to the individual</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. References. Verified. Controlled. */}
      <section className="py-32 border-t border-white/10 bg-black">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-6xl md:text-7xl font-semibold tracking-tight mb-20">
            References. Verified.<br />Controlled.
          </h2>

          <div className="flex flex-wrap justify-center gap-10">
            {[ 
              { num: "01", text: "Company requests access" },
              { num: "02", text: "Candidate approves" },
              { num: "03", text: "References are shared" },
              { num: "04", text: "Access expires" }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 w-64 text-left">
                <div className="text-[#00f0ff] text-5xl font-bold mb-4">{item.num}</div>
                <p className="text-xl">{item.text}</p>
              </div>
            ))}
          </div>

          <p className="mt-20 text-2xl text-gray-400">Simple. Inevitable. Superior.</p>
        </div>
      </section>

      {/* 6. This is not a feature. It's the future. */}
      <section className="py-32 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-6xl md:text-7xl font-semibold tracking-tight mb-8">
            This is not a feature.<br />
            <span className="text-[#00f0ff]">It's the future.</span>
          </h2>
          <p className="text-2xl text-gray-400 mb-20">
            The internet evolved from static pages to dynamic platforms.<br />
            The next evolution is controlled data access.
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <div className="bg-white/5 border border-white/10 rounded-3xl px-12 py-10">
              <p className="text-gray-400">Web 1.0</p>
              <p className="text-2xl font-semibold">Static pages</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl px-12 py-10">
              <p className="text-gray-400">Web 2.0</p>
              <p className="text-2xl font-semibold">Dynamic platforms</p>
            </div>
            <div className="bg-[#00f0ff] text-black rounded-3xl px-12 py-10 border border-[#00f0ff]">
              <p className="text-black">Web 3.0</p>
              <p className="text-2xl font-semibold">Controlled access</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-32 border-t border-white/10 bg-black text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-6xl md:text-7xl font-semibold tracking-tight mb-12">
            Access should be earned.
          </h2>
          <button 
            onClick={() => window.location.href = '/app'}
            className="px-16 py-7 bg-[#00f0ff] hover:bg-[#00e5ff] text-black font-semibold text-2xl rounded-2xl transition-all active:scale-95"
          >
            Start building on AOC →
          </button>
          <p className="mt-8 text-gray-400 text-lg">Join the infrastructure for sovereign data</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div>AOC — Architects of Change Protocol</div>
          <div className="flex gap-8 mt-6 md:mt-0">
            <a href="#" className="hover:text-gray-300">Documentation</a>
            <a href="#" className="hover:text-gray-300">GitHub</a>
            <a href="#" className="hover:text-gray-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
