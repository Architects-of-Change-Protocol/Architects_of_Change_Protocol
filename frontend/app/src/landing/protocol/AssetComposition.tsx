import { Eyebrow } from '../enterprise/primitives';
import { FabricSurface, PuzzleReliefOverlay } from './composition/PuzzleRelief';
import { CompositionIcon } from './composition/icons';
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
// of that same material, never its own box.
//
// The single jigsaw piece is the section's centerpiece, not an illustration
// beside the copy: it holds the six capabilities inside its own silhouette.
// FabricSurface lays down the plain material for the whole section;
// the puzzle pane below is the one place on that material where the six
// capability entries live, arranged in plain, unrotated document flow so the
// words themselves never bend or tilt; PuzzleReliefOverlay then paints the
// relief -- the emboss, its rim light and the slow grazing sweep -- across
// that same pane from above, via mix-blend-mode (see
// ./composition/PuzzleRelief.tsx). Crucially the pane carries no clipping of
// its own: the relief's soft shadow is left free to bleed past the pane's
// own edge and graze the paragraph column too, so the two halves read as one
// uninterrupted sheet rather than a text block sitting beside a separate
// boxed graphic. A gentle rotation on the relief layer only (never on the
// copy) is what reads as "an object sitting at a slight angle beneath a
// flat printed sheet" rather than a picture pasted onto the page. Copy
// lives in ./content.ts; the six glyphs live in ./composition/icons.tsx.
//
// Below `sm`, six full capability sentences genuinely cannot fit inside a
// silhouette narrow enough to still read as "square, with a tab and a
// socket" on a phone -- so on small screens the pane shrinks to a plain
// glyph and the same six entries continue below it as an ordinary list on
// the same fabric, rather than forcing illegibly small type into the shape.
export function AssetComposition() {
  return (
    <section id="creation" className="relative scroll-mt-16 overflow-hidden border-t border-slate-200 py-24 md:py-32 lg:py-40">
      <FabricSurface />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-14 sm:flex-row sm:items-center sm:justify-between sm:gap-2 lg:gap-6">
          <div className="w-full max-w-md sm:w-[36%] sm:max-w-none sm:shrink-0">
            <Eyebrow tone="accent" mineral="amethyst">{COMPOSITION_EYEBROW}</Eyebrow>
            <h2 className="mt-4 text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-slate-900 leading-[1.1]">
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

          {/* The puzzle pane: centered in the space between the paragraph and
              the section's edge, pulled in toward the text (negative margin)
              so its bleed overlaps that gap instead of leaving a seam.
              Roughly 60% of the row's width on large screens -- the
              silhouette itself only occupies the middle portion of that, so
              its cast shadow is what actually reaches the paragraph. No
              overflow-hidden here: the shadow is meant to escape this box. */}
          <div className="w-full sm:-ml-8 sm:w-[64%] md:-ml-10 lg:-ml-6 lg:w-[62%]">
            <div className="relative mx-auto aspect-square w-full max-w-[210px] sm:max-w-[380px] md:max-w-[480px] lg:max-w-[600px]">
              {/* Each entry is set off only by typography, spacing and its
                  position in the grid -- no border, fill or shadow, so
                  nothing here reads as a card sitting on top of the piece. */}
              <div className="absolute inset-[13%] hidden grid-cols-2 content-center gap-x-6 gap-y-8 sm:grid md:gap-x-7 md:gap-y-9">
                {COMPOSITION_LAYERS.map((layer) => (
                  <div key={layer.id} className="flex flex-col gap-1.5">
                    <CompositionIcon id={layer.id} className="h-[18px] w-[18px] text-violet-600/85 md:h-5 md:w-5" />
                    <p className="mt-0.5 text-[10.5px] md:text-[11px] font-bold uppercase tracking-[0.1em] text-slate-800">
                      {layer.name}
                    </p>
                    <p className="text-[10.5px] md:text-[11.5px] leading-snug text-slate-600">{layer.sentence}</p>
                  </div>
                ))}
              </div>

              <PuzzleReliefOverlay />
            </div>
          </div>
        </div>

        {/* Mobile-only fallback: the same six entries, plain and stacked,
            printed on the same fabric directly below the (now much smaller)
            puzzle glyph above. */}
        <div className="mt-12 grid grid-cols-1 gap-y-7 sm:hidden">
          {COMPOSITION_LAYERS.map((layer) => (
            <div key={layer.id} className="flex flex-col gap-1.5">
              <CompositionIcon id={layer.id} className="h-[18px] w-[18px] text-violet-600/85" />
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-800">{layer.name}</p>
              <p className="max-w-sm text-[13px] leading-relaxed text-slate-600">{layer.sentence}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
