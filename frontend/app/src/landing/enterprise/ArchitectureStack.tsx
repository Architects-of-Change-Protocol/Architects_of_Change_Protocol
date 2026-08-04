import { SectionHeader } from './primitives';

function ArrowDown() {
  return (
    <div className="flex justify-center py-2 text-slate-400">
      <svg viewBox="0 0 256 256" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
        <path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z" />
      </svg>
    </div>
  );
}

const PROVIDERS = [
  { name: 'Pinata', live: true },
  { name: 'S3', live: false },
  { name: 'Azure Blob', live: false },
  { name: 'Google Drive', live: false },
  { name: 'SharePoint', live: false },
];

// Deck slide 5. This is where the previous homepage's strongest concept —
// "governance is the result of composition, not the starting point" — lives
// on: the three bands are literally that composition, drawn as the deck
// draws it, rather than the old four-illustration grid + separate
// AocInfrastructureAnimated diagram (which described generic verticals —
// HR, Finance, Health — that the SK005 deck's narrower governed-access
// story doesn't cover). AocInfrastructureAnimated itself is untouched and
// still used by the Protocol homepage.
export function ArchitectureStack() {
  return (
    <section id="architecture" className="scroll-mt-16 max-w-4xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Governance Emerges From Composition"
        title="One governance layer. Any provider underneath."
        description="Enterprise never holds a credential. Only grant status and usage cross the boundary — governance is what composing these three layers produces, not a property of any one of them."
      />

      <div className="rounded-xl bg-slate-100 px-6 py-5">
        <p className="text-sm font-extrabold tracking-[0.05em] text-slate-500">AOC PROTOCOL</p>
        <p className="mt-2 text-[12.5px] text-slate-500">identity · consent · capability tokens · audit envelopes</p>
      </div>
      <ArrowDown />
      <div className="rounded-xl bg-indigo-600 px-6 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-extrabold tracking-[0.05em] text-white">AOC ENTERPRISE</p>
        <p className="mt-2 text-[12.5px] text-indigo-200">
          Decision · Obligation · Grant · Revocation · Usage · Evidence — cannot hold a credential or SDK type
        </p>
      </div>
      <ArrowDown />
      <div className="rounded-xl bg-slate-100 px-6 py-5">
        <p className="text-sm font-extrabold tracking-[0.05em] text-slate-500">PROVIDER ADAPTER</p>
        <p className="mt-2 text-[12.5px] text-slate-500">reads only resource · status · expiry — writes only usage events</p>
      </div>
      <ArrowDown />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {PROVIDERS.map((provider) => (
          <div
            key={provider.name}
            className={`rounded-[10px] px-2 py-4 text-center ${
              provider.live ? 'bg-indigo-600 shadow-[0_8px_24px_rgba(15,23,42,0.08)]' : 'bg-slate-100'
            }`}
          >
            <span className={`block text-[13.5px] font-bold ${provider.live ? 'text-white' : 'text-slate-900'}`}>
              {provider.name}
            </span>
            <span className={`mt-1.5 block text-[9px] font-extrabold tracking-[0.1em] ${provider.live ? 'text-indigo-200' : 'text-slate-400'}`}>
              {provider.live ? 'LIVE' : 'ROADMAP'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
