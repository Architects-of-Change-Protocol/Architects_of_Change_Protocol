import { useState } from 'react';
import { ProtocolFooter } from './components/ProtocolFooter'
import { LogoRotating } from '../components/logo/LogoRotating';
import { Hero } from './protocol/Hero';
import { FileToAsset } from './protocol/FileToAsset';
import { CapabilityFamilies } from './protocol/CapabilityFamilies';
import { Sovereignty } from './protocol/Sovereignty';
import { AssetCreationFlow } from './protocol/AssetCreationFlow';
import { PhotographExample } from './protocol/PhotographExample';
import { ProviderNeutral } from './protocol/ProviderNeutral';
import { ProtocolToEnterprise } from './protocol/ProtocolToEnterprise';
import { Developers } from './protocol/Developers';
import { usePageMeta } from './protocol/usePageMeta';

// Top-level site navigation: Protocol / Enterprise / About. Assurance and
// Documentation now live one level down, under Enterprise (Services and
// Developers respectively) — see enterprise/Nav.tsx for that hierarchy.
//
// W004: Protocol is rebuilt around its own thesis — digital assets, their
// capabilities, and sovereignty-related properties — rather than the
// governance/operational-control narrative that now lives on AOC Enterprise
// (see enterprise/GovernanceGap.tsx and enterprise/GovernanceEmerges.tsx,
// migrated in W003). See docs/w004-protocol-digital-assets-sovereignty-refactor.md.
const mobileNavigationItems = [
  { label: 'Protocol', href: '/' },
  { label: 'Enterprise', href: '/?view=enterprise' },
  { label: 'About', href: '/?view=about' },
];

export const AocLandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  usePageMeta();

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
              <a href="#digital-asset" className="hover:text-white transition">
                Digital Assets
              </a>
              <a href="#capabilities" className="hover:text-white transition text-white/70">
                Capabilities
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

      <Hero />
      <FileToAsset />
      <CapabilityFamilies />
      <Sovereignty />
      <AssetCreationFlow />
      <PhotographExample />
      <ProviderNeutral />
      <ProtocolToEnterprise />
      <Developers />

      <ProtocolFooter />

      <section className="py-32 border-t border-white/10 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-semibold mb-8">
            Build digital assets that retain identity, integrity and capabilities beyond a single
            application.
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#digital-asset" className="inline-flex items-center justify-center px-8 py-5 border border-white/15 hover:border-white/30 text-white font-semibold text-lg rounded-2xl transition-all active:scale-[0.98]">
              Explore the Protocol
            </a>
            <a href="https://github.com/Architects-of-Change-Protocol/Architects_of_Change_Protocol" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-8 py-5 border border-white/15 hover:border-white/30 text-white font-semibold text-lg rounded-2xl transition-all active:scale-[0.98]">
              Build with AOC
            </a>
            <a href="/?view=enterprise" className="inline-flex items-center justify-center px-8 py-5 bg-[#00f0ff] text-black font-semibold text-lg rounded-2xl hover:scale-105 transition">
              See AOC Enterprise →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};
