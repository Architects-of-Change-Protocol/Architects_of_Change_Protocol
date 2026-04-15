// frontend/landing/AocLandingPage.ts
import React from 'react';

export const renderAocLandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
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
            <a href="#problem" className="hover:text-gray-300 transition-colors">Problem</a>
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

      {/* HERO */}
      <section className="min-h-screen flex items-center pt-16 relative">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-[68px] md:text-[82px] leading-[1.05] font-semibold tracking-[-3.5px] mb-6">
            You don't own your data.
          </h1>
          <p className="text-[52px] md:text-[62px] leading-none font-light tracking-[-2px] text-gray-400 mb-8">
            You just hope no one abuses it.
          </p>
          <p className="max-w-[620px] mx-auto text-[21px] text-gray-400 leading-relaxed mb-14">
            There is a better system. One where access is granted, not assumed.
          </p>

          <button 
            onClick={() => window.location.href = '/app'}
            className="group px-12 py-5 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold text-xl rounded-2xl transition-all active:scale-[0.97] flex items-center gap-3 mx-auto"
          >
            Enter the new model →
          </button>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff12_0%,transparent_65%)] pointer-events-none" />
      </section>

      {/* 2. The current model is broken */}
      <section id="problem" className="py-32 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-6xl font-semibold tracking-tight text-center mb-20">
            The current model is broken.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <p className="text-xl leading-relaxed">Your data is copied.<br />Stored.<br /><span className="text-gray-400">Resold.</span></p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <p className="text-xl leading-relaxed">Consent is implied.<br /><span className="text-gray-400">Not explicit.</span></p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <p className="text-xl leading-relaxed">You never see who accessed what.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <p className="text-xl leading-relaxed">Trust is a blind assumption.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. What if access required permission? */}
      <section className="py-32 border-t border-white/10 bg-black">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-6xl font-semibold tracking-tight mb-6">
            What if access required permission?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-16">
            A system where every piece of data is locked behind explicit, modular consent.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex items-start gap-5">
              <div className="text-[#00f0ff] text-3xl mt-1">🛡️</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">You approve access</h3>
                <p className="text-gray-400">You decide who can see your data.</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex items-start gap-5">
              <div className="text-[#00f0ff] text-3xl mt-1">🔐</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">You define scope</h3>
                <p className="text-gray-400">Granular control over what gets shared.</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex items-start gap-5">
              <div className="text-[#00f0ff] text-3xl mt-1">↩️</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">You can revoke at any time</h3>
                <p className="text-gray-400">No permanent access.</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex items-start gap-5">
              <div className="text-[#00f0ff] text-3xl mt-1">👁️</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Every interaction is traceable</h3>
                <p className="text-gray-400">Full transparency and auditability.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AOC is not an app. It's a new data layer */}
      <section className="py-32 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-6xl font-semibold tracking-tight mb-4">
            AOC is not an app.
          </h2>
          <h3 className="text-6xl font-semibold tracking-tight text-[#00f0ff] mb-8">
            It's a new data layer.
          </h3>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-16">
            A sovereign infrastructure where individuals control access to their information.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <h4 className="text-2xl font-semibold mb-3">Consent-based access</h4>
              <p className="text-gray-400">Nothing happens without explicit permission</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <h4 className="text-2xl font-semibold mb-3">Modular permissions</h4>
              <p className="text-gray-400">Granular control over what gets shared</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <h4 className="text-2xl font-semibold mb-3">Verifiable interactions</h4>
              <p className="text-gray-400">Every access event is cryptographically logged</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <h4 className="text-2xl font-semibold mb-3">No central ownership</h4>
              <p className="text-gray-400">Data remains sovereign to the individual</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. References. Verified. Controlled. */}
      <section className="py-32 border-t border-white/10 bg-black">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-6xl font-semibold tracking-tight mb-20">
            References. Verified.<br />Controlled.
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 w-full md:w-64 text-left">
              <div className="text-[#00f0ff] text-5xl font-bold mb-4">01</div>
              <p className="text-lg">Company requests access</p>
            </div>
            <div className="text-4xl text-gray-600">→</div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 w-full md:w-64 text-left">
              <div className="text-[#00f0ff] text-5xl font-bold mb-4">02</div>
              <p className="text-lg">Candidate approves</p>
            </div>
            <div className="text-4xl text-gray-600">→</div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 w-full md:w-64 text-left">
              <div className="text-[#00f0ff] text-5xl font-bold mb-4">03</div>
              <p className="text-lg">References are shared</p>
            </div>
            <div className="text-4xl text-gray-600">→</div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 w-full md:w-64 text-left">
              <div className="text-[#00f0ff] text-5xl font-bold mb-4">04</div>
              <p className="text-lg">Access expires</p>
            </div>
          </div>

          <p className="mt-16 text-xl text-gray-400">Simple. Inevitable. Superior.</p>
        </div>
      </section>

      {/* 6. This is not a feature. It's the future. */}
      <section className="py-32 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-6xl font-semibold tracking-tight mb-6">
            This is not a feature.<br />
            <span className="text-[#00f0ff]">It's the future.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-16">
            The internet evolved from static pages to dynamic platforms.<br />
            The next evolution is controlled data access.
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <div className="bg-white/5 border border-white/10 rounded-3xl px-10 py-8">
              <p className="text-gray-400 mb-1">Web 1.0</p>
              <p className="text-xl font-semibold">Static pages</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl px-10 py-8">
              <p className="text-gray-400 mb-1">Web 2.0</p>
              <p className="text-xl font-semibold">Dynamic platforms</p>
            </div>
            <div className="bg-[#00f0ff] text-black rounded-3xl px-10 py-8 border border-[#00f0ff]">
              <p className="mb-1">Web 3.0</p>
              <p className="text-xl font-semibold">Controlled access</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Access should be earned + Final CTA */}
      <section className="py-32 border-t border-white/10 bg-black text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-6xl font-semibold tracking-tight mb-8">
            Access should be earned.
          </h2>
          
          <button 
            onClick={() => window.location.href = '/app'}
            className="group px-12 py-6 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold text-2xl rounded-2xl transition-all active:scale-[0.97] mb-8"
          >
            Start building on AOC →
          </button>

          <p className="text-gray-400 text-lg">Join the infrastructure for sovereign data</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-4 md:mb-0">AOC — Architects of Change Protocol</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-gray-300 transition">Documentation</a>
            <a href="#" className="hover:text-gray-300 transition">GitHub</a>
            <a href="#" className="hover:text-gray-300 transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
