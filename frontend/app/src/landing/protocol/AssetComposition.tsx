import { Eyebrow } from '../enterprise/primitives';
import { FabricSurface, PuzzleReliefOverlay } from './composition/PuzzleRelief';
import {
  COMPOSITION_CTA_HREF,
  COMPOSITION_CTA_LABEL,
  COMPOSITION_EYEBROW,
  COMPOSITION_HEADLINE,
  COMPOSITION_LAYERS,
  COMPOSITION_PARAGRAPH,
} from './content';

// The section's whole point: a digital asset becomes valuable by composing
// capabilities into it, not by moving through implementation steps. There is
// no timeline here on purpose. The section is built as one continuous sheet,
// not stacked layers: FabricSurface lays down the plain material underneath
// everything, all the content (headline, paragraph, cards) renders fully
// opaque in the middle, and PuzzleReliefOverlay paints the single
// jigsaw-piece relief across the *finished* composition from above, via
// mix-blend-mode -- see ./composition/PuzzleRelief.tsx. That's what lets the
// relief continue under the capability cards without making them
// translucent. Copy lives in ./content.ts.
export function AssetComposition() {
  return (
    <section id="creation" className="relative scroll-mt-16 overflow-hidden border-t border-slate-200 py-20 md:py-28">
      <FabricSurface />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-24 items-center">
          <div>
            <Eyebrow tone="accent" mineral="amethyst">{COMPOSITION_EYEBROW}</Eyebrow>
            <h2 className="mt-4 text-3xl md:text-[2.75rem] font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              {COMPOSITION_HEADLINE}
            </h2>
            <p className="mt-5 max-w-md text-[15px] md:text-base leading-relaxed text-slate-600">
              {COMPOSITION_PARAGRAPH}
            </p>
            <a
              href={COMPOSITION_CTA_HREF}
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-500 transition-colors"
            >
              {COMPOSITION_CTA_LABEL}
              <span aria-hidden>&rarr;</span>
            </a>
          </div>

          {/* The illustration is the relief itself -- most visible here, where
              nothing else competes with it. A small engraved-style caption is
              the only thing that sits in this column, like a placard beside a
              displayed object rather than a description of it. */}
          <div className="relative hidden h-[380px] items-end justify-end lg:flex" aria-hidden>
            <div className="rounded-full border border-slate-200/80 bg-[#fbfaf9] px-3 py-1.5 text-[11px] font-mono tracking-wide text-slate-500 shadow-[0_1px_1px_rgba(15,23,42,0.04)]">
              One capability. One layer of meaning.
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-5 sm:grid-cols-2 md:mt-24 md:gap-6 lg:grid-cols-3">
          {COMPOSITION_LAYERS.map((layer) => (
            <div
              key={layer.name}
              className="rounded-2xl border border-slate-200/70 bg-[#fbfaf9] px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(15,23,42,0.04)]"
            >
              <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-violet-600">{layer.name}</p>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{layer.sentence}</p>
            </div>
          ))}
        </div>
      </div>

      <PuzzleReliefOverlay />
    </section>
  );
}
