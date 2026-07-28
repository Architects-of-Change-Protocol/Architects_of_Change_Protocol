import { ProtocolFooter } from '../components/ProtocolFooter';
import { EnterpriseNav } from './Nav';
import { EXPLORE_CAPABILITIES } from './content';

export function CapabilityDetailPage({ slug }: { slug: string }) {
  const capability = EXPLORE_CAPABILITIES.find((c) => c.slug === slug);

  return (
    <main className="min-h-screen bg-[#090b11] text-white font-sans">
      <EnterpriseNav />

      <div className="max-w-3xl mx-auto px-6 py-24">
        <a href="/?view=enterprise#capabilities" className="text-sm text-white/40 hover:text-white/70 transition-colors">
          &larr; Back to Enterprise
        </a>

        <p className="mt-8 text-[11px] uppercase tracking-[0.22em] text-cyan-300/80 font-mono">Capability</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          {capability?.name ?? slug}
        </h1>
        {capability ? (
          <p className="mt-4 max-w-xl text-lg text-white/60 leading-relaxed">{capability.summary}</p>
        ) : null}

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-8">
          <p className="text-sm text-white/50 leading-relaxed">
            The dedicated {capability?.name ?? 'capability'} page is in preparation.
          </p>
        </div>
      </div>

      <ProtocolFooter />
    </main>
  );
}
