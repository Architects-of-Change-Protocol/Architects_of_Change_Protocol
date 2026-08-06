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
// plain material underneath everything; the headline, the paragraph and the
// six capability entries are all simply printed onto it -- no fill color of
// their own, no border, no shadow, not even the inset "pressed" treatment a
// neumorphic panel would use (that's still a box, just a softer one). The
// only things that separate one entry from the next are whitespace and
// typographic weight, exactly like a spec sheet on premium packaging rather
// than a UI card grid. PuzzleReliefOverlay then paints the single
// jigsaw-piece relief across the *finished*, fully opaque composition from
// above, via mix-blend-mode -- see ./composition/PuzzleRelief.tsx. Because
// nothing below it has a fill of its own to interrupt, that relief now
// shades the fabric, the headline and every capability entry with the exact
// same uninterrupted lighting -- which is what actually makes it impossible
// to tell where the background ends and the content begins, rather than a
// card treatment trying to approximate that. Copy lives in ./content.ts.
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

        {/* No card, no plate, not even an inset "pressed" treatment -- that's
            still a box, just a quieter one. Each entry is printed straight
            onto the sheet; only its label weight/color and the whitespace
            around it group it as one unit, the way a spec sheet or a piece
            of packaging insert separates entries without drawing a box
            around each one. */}
        <div className="mt-20 grid gap-x-12 gap-y-12 sm:grid-cols-2 md:mt-24 md:gap-y-14 lg:grid-cols-3">
          {COMPOSITION_LAYERS.map((layer) => (
            <div key={layer.name}>
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
