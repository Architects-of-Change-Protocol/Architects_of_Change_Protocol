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
// "card" or "panel" either -- this is one continuous manufactured sheet.
// FabricSurface lays down the plain material underneath everything; the
// headline and paragraph are simply printed onto it (no container of their
// own); the capability cards are shallow *recessed* regions machined into
// the same sheet (an inset shadow, not a border or a drop shadow, is what
// separates them from the surrounding material -- see the debossed treatment
// below); and PuzzleReliefOverlay paints the single jigsaw-piece relief
// across the *finished*, fully opaque composition from above, via
// mix-blend-mode -- see ./composition/PuzzleRelief.tsx. That overlay is what
// lets a card's own lighting react to the hidden geometry beneath it
// (a barely-perceptible shift in its edge highlight and ambient shadow as
// the relief crosses it) without the card ever becoming translucent. Copy
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

        {/* Shallow recesses machined into the sheet, not panels resting on it --
            no border, no drop shadow. A soft inset shadow on the top-left edge
            and a soft inset highlight on the bottom-right edge is the same
            physical language a real pressed/engraved region would use under
            the section's own top-left light, just inverted from the raised
            puzzle relief (which is convex; these are concave). Kept
            deliberately faint -- a suggestion of depth, not a UI effect. */}
        <div className="mt-20 grid gap-5 sm:grid-cols-2 md:mt-24 md:gap-6 lg:grid-cols-3">
          {COMPOSITION_LAYERS.map((layer) => (
            <div
              key={layer.name}
              className="rounded-2xl bg-[#f7f6f5] px-6 py-7 shadow-[inset_1.5px_1.5px_3px_rgba(15,23,42,0.05),inset_-1.5px_-1.5px_3px_rgba(255,255,255,0.9)]"
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
