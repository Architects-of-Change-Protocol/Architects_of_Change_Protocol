import { Eyebrow } from '../enterprise/primitives';
import { PuzzleRelief } from './composition/PuzzleRelief';
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
// no timeline here on purpose -- see ./composition/PuzzleRelief.tsx for the
// single jigsaw-piece relief that runs underneath the headline, paragraph
// and cards alike, so the section reads as one continuous, crafted surface
// rather than a list of things that happened. Copy lives in ./content.ts.
export function AssetComposition() {
  return (
    <section id="creation" className="relative scroll-mt-16 overflow-hidden border-t border-slate-200 py-20 md:py-28">
      <PuzzleRelief />

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
            <div className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-[11px] font-mono tracking-wide text-slate-500 shadow-sm backdrop-blur">
              One capability. One layer of meaning.
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-5 sm:grid-cols-2 md:mt-24 md:gap-6 lg:grid-cols-3">
          {COMPOSITION_LAYERS.map((layer) => (
            <div
              key={layer.name}
              className="rounded-2xl border border-slate-200/70 bg-white/60 px-6 py-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_40px_-24px_rgba(15,23,42,0.18)] backdrop-blur-sm"
            >
              <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-violet-600">{layer.name}</p>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{layer.sentence}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
