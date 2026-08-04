import { useState } from 'react';
import { ProtocolFooter } from './components/ProtocolFooter'
import { LogoRotating } from '../components/logo/LogoRotating';

// Top-level site navigation: Protocol / Enterprise / About. Assurance and
// Documentation now live one level down, under Enterprise (Services and
// Developers respectively) — see enterprise/Nav.tsx for that hierarchy.
//
// W003 note: the former in-page Problem / Solution / How It Works sections
// (and their nav anchors) were migrated to AOC Enterprise — see
// enterprise/GovernanceGap.tsx and enterprise/GovernanceEmerges.tsx. This
// page temporarily carries a short "foundation" bridge in their place until
// Protocol's own sovereignty-focused refactor (W003 Step 2).
const mobileNavigationItems = [
  { label: 'Protocol', href: '/' },
  { label: 'Enterprise', href: '/?view=enterprise' },
  { label: 'About', href: '/?view=about' },
];

export const AocLandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
      <header>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black relative/90 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <LogoRotating size={28} inverted />
              </div>

              <div className="flex items-baseline">
                <span className="text-xl font-semibold tracking-tighter">AOC</span>
                <span className="text-xs text-white uppercase tracking-[0.2em] ml-2">
                  Protocol
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-10 text-sm font-medium">
              <a href="#foundation" className="hover:text-white transition">
                Foundation
              </a>
              <a href="/?view=enterprise" className="hover:text-white transition text-white/70">
                Enterprise
              </a>
              <a href="/?view=about" className="hover:text-white transition text-white/70">
                About
              </a>
            </div>

            <a
              href="/app"
              className="hidden md:inline-block px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition active:scale-[0.98]"
            >
              Launch App
            </a>

            <button
              type="button"
              className="relative flex md:hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-white/30 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
            >
              <span className="sr-only">
                {isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              </span>
              <span
                className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${
                  isMobileMenuOpen ? 'translate-y-0 rotate-45' : '-translate-y-1.5'
                }`}
              />
              <span
                className={`absolute h-0.5 w-5 bg-current transition-opacity duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${
                  isMobileMenuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-1.5'
                }`}
              />
            </button>
          </div>

          <div
            id="mobile-navigation"
            aria-hidden={!isMobileMenuOpen}
            inert={!isMobileMenuOpen}
            className={`absolute left-0 right-0 top-full overflow-hidden border-b border-white/10 bg-black/95 backdrop-blur-lg transition-[max-height,opacity] duration-300 ease-out md:hidden ${
              isMobileMenuOpen
                ? 'max-h-96 opacity-100'
                : 'pointer-events-none max-h-0 opacity-0'
            }`}
          >
            <div className="max-w-7xl mx-auto px-6 py-5">
              <div className="flex flex-col gap-1">
                {mobileNavigationItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href="/app"
                  className="mt-3 rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-gray-200 active:scale-[0.98]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Launch App
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <section className="min-h-screen flex items-center pt-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-[68px] md:text-[82px] leading-[1.05] font-semibold tracking-[-3.5px] mb-6">
            You don&apos;t own your data.
          </h1>

          <p className="text-[52px] md:text-[62px] leading-none font-light tracking-[-2px] text-white mb-8">
            You just hope no one abuses it.
          </p>

          <p className="max-w-[620px] mx-auto text-[21px] text-white leading-relaxed mb-14">
            There is a better system. One where access is granted, not assumed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#foundation"
              className="px-12 py-5 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold text-xl rounded-2xl transition-all active:scale-[0.98] inline-block"
            >
              Enter the new model →
            </a>

            <a
              href="/?view=enterprise"
              className="px-10 py-5 border border-white/15 hover:border-white/30 text-white font-semibold text-xl rounded-2xl transition-all active:scale-[0.98] inline-block"
            >
              Integrate AOC
            </a>
          </div>
        </div>
      </section>

      {/*
        W003 bridge section — temporary. The governance-oriented Problem,
        Solution, How It Works, and infrastructure-diagram sections that
        used to live here were migrated to AOC Enterprise (see
        enterprise/GovernanceGap.tsx and enterprise/GovernanceEmerges.tsx).
        This is intentionally a short, neutral transition, not Protocol's
        final sovereignty-focused narrative — that rewrite is W003 Step 2.
      */}
      <section id="foundation" className="scroll-mt-24 py-32 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">The Foundation</p>
          <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
            AOC Protocol is the open foundation.
          </h2>
          <p className="mt-6 text-lg text-white/65 leading-relaxed">
            Protocol defines what a digital asset can be — identifiable, portable, verifiable, and
            interoperable across systems. AOC Enterprise builds on that foundation to operationalize
            governance: policy, consent, delegation, and audit for organizations that need to control
            how those assets are actually used.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/?view=enterprise"
              className="px-8 py-4 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold rounded-2xl transition-all active:scale-[0.98] inline-block"
            >
              See how Enterprise governs it →
            </a>
            <a
              href="/?view=docs#getting-started"
              className="px-8 py-4 border border-white/15 hover:border-white/30 text-white font-semibold rounded-2xl transition-all active:scale-[0.98] inline-block"
            >
              Read the docs
            </a>
          </div>
        </div>
      </section>

      <ProtocolFooter />

      <section className="py-32 border-t border-white/10 text-center">
        <div>
          <h2 className="text-6xl font-semibold mb-8">Access should be earned.</h2>
          <a href="/?view=docs#getting-started" className="inline-flex items-center justify-center px-12 py-6 bg-[#00f0ff] text-black font-semibold text-2xl rounded-2xl hover:scale-105 transition">
            Start building on AOC →
          </a>
        </div>
      </section>
    </main>
  );
};
