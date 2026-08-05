import { Card, SectionHeader } from '../enterprise/primitives';
import { MINERALS } from '../enterprise/minerals';

const FILE_TRAITS = ['Content', 'Format', 'Location'];
const ASSET_TRAITS = ['Identity', 'Integrity', 'Provenance', 'Capabilities', 'References', 'Portability'];
const m = MINERALS.amethyst;

export function FileToAsset() {
  return (
    <section id="digital-asset" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="From File to Digital Asset"
        title="A file contains content. A digital asset carries more."
        description="Any file — a photo, a document, a dataset — is just bytes with a format and a place it happens to sit. An AOC-compatible digital asset adds a layer that compatible systems can interpret: who it belongs to, whether it's intact, where it came from, and what it's allowed to do."
        mineral="amethyst"
      />

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
        <Card className="p-6 md:p-7">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-mono">A File</p>
          <p className="mt-2 font-mono text-slate-700 text-sm">photo.jpg</p>
          <ul className="mt-5 space-y-2.5">
            {FILE_TRAITS.map((trait) => (
              <li key={trait} className="flex items-center gap-2.5 text-sm text-slate-500">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                {trait}
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex items-center justify-center text-slate-300" aria-hidden>
          <span className="hidden md:inline text-2xl">&rarr;</span>
          <span className="md:hidden text-2xl">&darr;</span>
        </div>

        <div className={`rounded-2xl border ${m.border} ${m.soft} p-6 md:p-7`}>
          <p className={`text-[11px] uppercase tracking-[0.2em] font-mono ${m.text}`}>
            AOC-Compatible Digital Asset
          </p>
          <p className="mt-2 font-mono text-slate-700 text-sm">photo.jpg + protocol context</p>
          <ul className="mt-5 space-y-2.5">
            {ASSET_TRAITS.map((trait) => (
              <li key={trait} className="flex items-center gap-2.5 text-sm text-slate-900">
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
                {trait}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-8 max-w-3xl text-sm text-slate-500 leading-relaxed">
        Not every raw file is automatically an AOC-compatible asset. An application or tool that
        speaks the protocol creates or registers that context — see{' '}
        <a href="#creation" className={`${m.text} ${m.textHover} underline underline-offset-2`}>
          how an asset is created
        </a>
        .
      </p>
    </section>
  );
}
