import { ProtocolFooter } from '../components/ProtocolFooter';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EnterpriseNav } from './Nav';

// Governed Access is the first commercial Solution under AOC Enterprise —
// it implements governed access over externally stored digital assets.
// This is a navigation-skeleton page: it exists so "Solutions > Governed
// Access" resolves to a real destination with the correct place in the
// hierarchy, not a full product page.
export function GovernedAccessPage() {
  return (
    <main className="min-h-screen bg-[#090b11] text-white font-sans">
      <EnterpriseNav />

      <Breadcrumbs
        items={[
          { label: 'Protocol', href: '/' },
          { label: 'Enterprise', href: '/?view=enterprise' },
          { label: 'Solutions' },
          { label: 'Governed Access' },
        ]}
      />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <a href="/?view=enterprise" className="text-sm text-white/40 hover:text-white/70 transition-colors">
          &larr; Back to Enterprise
        </a>

        <p className="mt-8 text-[11px] uppercase tracking-[0.22em] text-cyan-300/80 font-mono">
          Enterprise Solution
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          Governed Access
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/60 leading-relaxed">
          Implement governed access over externally stored digital assets — built on the identity,
          consent, and capability primitives defined by AOC Protocol.
        </p>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-8">
          <p className="text-sm text-white/50 leading-relaxed">
            Governed Access is AOC Enterprise&apos;s first Solution. The dedicated Governed Access
            product page is in preparation.
          </p>
        </div>

        <a
          href="mailto:hello@aocprotocol.xyz?subject=AOC%20Enterprise%20Governed%20Access"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-black hover:bg-cyan-200 transition-colors"
        >
          Talk to architecture
        </a>
      </div>

      <ProtocolFooter />
    </main>
  );
}
