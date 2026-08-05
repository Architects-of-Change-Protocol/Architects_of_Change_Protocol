import { SectionHeader, Card } from '../enterprise/primitives';

const SOVEREIGNTY_QUESTIONS = [
  { q: 'Who identifies the asset?', a: 'A canonical identity, not an account number or a storage path owned by one vendor.' },
  { q: 'Can its integrity be verified?', a: 'Independently — against a declared digest, not by trusting whoever hands you the file.' },
  { q: 'Can it move?', a: "Between storage providers or applications without losing its identity or its recorded provenance." },
  { q: 'Can another compatible system understand it?', a: 'Yes, if that system speaks the same open contracts — no vendor-specific integration required.' },
  { q: "Does its meaning survive outside the originating platform?", a: "That's the test. If it doesn't, the asset was only ever a file with a platform attached." },
];

export function Sovereignty() {
  return (
    <section id="sovereignty" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Digital Sovereignty"
        title="Sovereignty means an asset's meaning doesn't depend on one platform."
        description="Sovereignty here is practical, not absolute. It's the degree to which an asset — and whoever legitimately participates in it — retains control over identity, integrity, provenance and where it can be resolved, rather than that meaning being defined solely by whichever application currently holds the file. Protocol does not claim to guarantee legal ownership, custody or universal enforcement; it defines properties that make an asset sovereignty-aware and independently verifiable."
        mineral="amethyst"
      />

      <dl className="grid md:grid-cols-2 gap-5">
        {SOVEREIGNTY_QUESTIONS.map(({ q, a }) => (
          <Card key={q} className="p-6">
            <dt className="text-sm font-extrabold text-slate-900">{q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-slate-500">{a}</dd>
          </Card>
        ))}
      </dl>
    </section>
  );
}
