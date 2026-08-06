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
// no timeline here on purpose, and there is no concept of "background",
// "card" or "panel" either -- this is one continuous manufactured sheet, and
// every "component" on it is only ever a typographic or lighting treatment
// of that same material, never its own box. FabricSurface lays down the
// plain material underneath everything; the headline and paragraph are
// printed straight onto it with no container of their own; and each
// capability entry occupies its own region, defined *only* by an extremely
// faint radial tone shift (no edge, no border-radius, nothing a border-box
// could clip -- see the gradient on each entry below) plus whitespace and
// label weight. That's deliberately not a border, a fill or a shadow: a
// bounded shape reads as a component the instant the eye can trace its
// edge, so the gradient fades to nothing well inside each grid cell instead
// of stopping at one -- there is no edge to trace, only a region that
// happens to sit a hair differently than the material around it, the way a
// finish change reads on machined aluminum or embossed paper.
// PuzzleReliefOverlay then paints the single jigsaw-piece relief across the
// *finished*, fully opaque composition from above, via mix-blend-mode -- see
// ./composition/PuzzleRelief.tsx -- so the same uninterrupted lighting
// crosses the fabric, the headline and every capability region alike. Copy
// lives in ./content.ts.
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
              nothing else competes with it. The caption is plain text printed
              on the same sheet, not a plate or a pill sitting on top of it. */}
          <div className="relative hidden h-[380px] items-end justify-end lg:flex" aria-hidden>
            <p className="text-[11px] font-mono tracking-wide text-slate-400">One capability. One layer of meaning.</p>
          </div>
        </div>

        {/* Each region is a single, off-center radial gradient -- not a border,
            not a box-shadow -- tuned to fade to fully transparent well before
            it reaches the cell's own edges. A box-shadow follows the shape's
            outline no matter how soft it is, which is exactly what reads as
            "a component"; this has no outline to follow, only a tone that
            happens to be a hair different near the label and gone by the
            time it would meet the next region. */}
        <div className="mt-20 grid gap-x-12 gap-y-12 sm:grid-cols-2 md:mt-24 md:gap-y-14 lg:grid-cols-3">
          {COMPOSITION_LAYERS.map((layer) => (
            <div
              key={layer.name}
              className="bg-[radial-gradient(230px_130px_at_20%_18%,rgba(15,23,42,0.022)_0%,rgba(15,23,42,0.009)_45%,rgba(15,23,42,0)_82%)] px-5 py-6"
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
