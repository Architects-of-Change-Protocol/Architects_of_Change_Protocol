import { SectionHeader } from './primitives';

const SOVEREIGNTY_QUESTIONS = [
  { q: 'Who identifies the asset?', a: 'A canonical identity, not an account number or a storage path owned by one vendor.' },
  { q: 'Can its integrity be verified?', a: 'Independently — against a declared digest, not by trusting whoever hands you the file.' },
  { q: 'Can it move?', a: "Between storage providers or applications without losing its identity or its recorded provenance." },
  { q: 'Can another compatible system understand it?', a: 'Yes, if that system speaks the same open contracts — no vendor-specific integration required.' },
  { q: "Does its meaning survive outside the originating platform?", a: "That's the test. If it doesn't, the asset was only ever a file with a platform attached." },
];

export function Sovereignty() {
  return (
    <section id="sovereignty" className="scroll-mt-24 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <SectionHeader
        eyebrow="Digital Sovereignty"
        title="Sovereignty means an asset's meaning doesn't depend on one platform."
        description="Sovereignty here is practical, not absolute. It's the degree to which an asset — and whoever legitimately participates in it — retains control over identity, integrity, provenance and where it can be resolved, rather than that meaning being defined solely by whichever application currently holds the file. Protocol does not claim to guarantee legal ownership, custody or universal enforcement; it defines properties that make an asset sovereignty-aware and independently verifiable."
      />

      <dl className="grid md:grid-cols-2 gap-5">
        {SOVEREIGNTY_QUESTIONS.map(({ q, a }) => (
          <div key={q} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <dt className="text-sm font-semibold text-white">{q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-white/55">{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
