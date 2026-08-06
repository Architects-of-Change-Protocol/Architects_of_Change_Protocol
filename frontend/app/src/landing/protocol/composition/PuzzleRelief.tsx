import { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PUZZLE_PIECE_PATH, PUZZLE_PIECE_VIEWBOX } from './puzzlePiece';

// ---------------------------------------------------------------------------
// The section's centerpiece: one jigsaw-piece silhouette, never drawn as a
// graphic. It's implied entirely by a soft cast shadow, a faint rim
// highlight and, occasionally, a slow grazing light -- as if a stretched
// fabric were lying over a solid object just beneath it.
//
// Everything in the section -- the empty fabric, the headline, the fully
// opaque capability cards -- has to read as one continuous sheet. That rules
// out the obvious approach (paint the relief *behind* everything, let it
// show through translucent panels): a translucent card is still a second
// layer floating over a first one, and it stops working the moment a card
// isn't translucent. Instead the relief is painted from ABOVE, as the very
// last element in the section, using mix-blend-mode instead of opacity —
// `multiply` for its shadowed parts and `soft-light`/`overlay` for its lit
// parts. A blend mode composites against whatever pixels are already there,
// fabric or solid card alike, so the same silhouette darkens and lightens
// the section's *entire* finished surface uniformly, the way an emboss
// stamped into a printed sheet affects the ink sitting on top of it too.
// FabricSurface below supplies the plain material underneath; this is the
// only place the piece's geometry is ever drawn.
//
// The animated sweep borrows its technique from ../TransformationCore.tsx
// (a gradient swept across an element's own silhouette via
// objectBoundingBox, restarted on an irregular cadence so it never reads as
// a mechanical loop) -- see GrazingSweep below.
// ---------------------------------------------------------------------------

const PUZZLE_SVG_CLASS =
  'absolute -right-10 top-12 h-[480px] w-[480px] sm:-right-6 sm:h-[620px] sm:w-[620px] md:top-16 md:h-[760px] md:w-[760px] lg:-right-4 lg:h-[860px] lg:w-[860px]';

/** The section's base material: a near-white fabric tone and nothing else.
 * No shape lives here on purpose -- see PuzzleReliefOverlay. */
export function FabricSurface() {
  return (
    <div
      className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_120%_90%_at_25%_0%,#fdfcff_0%,#f8f8fb_45%,#f4f4f7_100%)]"
      aria-hidden
    />
  );
}

type LightSeed = { angle: number; duration: number };

function randomLightSeed(): LightSeed {
  return {
    angle: 18 + Math.random() * 10, // 18-28deg -- a graze, not a hard vertical wipe
    duration: 5.5 + Math.random() * 2.5, // slow -- light drifting through a room
  };
}

// Recurring passes on a long, irregular cadence (10-18s apart) so the light
// reads as ambient and incidental, never a mechanical loop the eye can predict.
function useGrazingLight(active: boolean) {
  const [run, setRun] = useState(0);
  const [seed, setSeed] = useState<LightSeed>(randomLightSeed);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!active) return undefined;

    let cancelled = false;
    const scheduleNext = (pauseMs: number) => {
      timer.current = window.setTimeout(() => {
        if (cancelled) return;
        setSeed(randomLightSeed());
        setRun((r) => r + 1);
        scheduleNext(10000 + Math.random() * 8000);
      }, pauseMs);
    };

    scheduleNext(1500 + Math.random() * 1500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer.current);
    };
  }, [active]);

  return { run, seed };
}

// Real grazing light on a physical bump reads as two bands traveling
// together: a bright edge on the side facing the light, a faint dark edge
// trailing it on the far side -- so both a highlight and a shadow band sweep
// in tandem, each on its own blend mode.
function GrazingSweep({ seed, gradientId }: { seed: LightSeed; gradientId: string }) {
  const highlightId = `${gradientId}-highlight`;
  const shadowId = `${gradientId}-shadow`;
  return (
    <>
      <motion.linearGradient
        id={shadowId}
        gradientUnits="objectBoundingBox"
        gradientTransform={`rotate(${seed.angle} 0.5 0.5)`}
        initial={{ x1: -1.45, x2: -0.55 }}
        animate={{ x1: 1.15, x2: 2.05 }}
        transition={{ duration: seed.duration, ease: [0.22, 1, 0.36, 1] }}
      >
        <stop offset="0%" stopColor="#1e2433" stopOpacity={0} />
        <stop offset="48%" stopColor="#1e2433" stopOpacity={0.05} />
        <stop offset="58%" stopColor="#1e2433" stopOpacity={0.05} />
        <stop offset="100%" stopColor="#1e2433" stopOpacity={0} />
      </motion.linearGradient>
      <motion.path
        d={PUZZLE_PIECE_PATH}
        fill={`url(#${shadowId})`}
        style={{ mixBlendMode: 'multiply' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: seed.duration, times: [0, 0.22, 0.72, 1], ease: 'easeInOut' }}
      />

      <motion.linearGradient
        id={highlightId}
        gradientUnits="objectBoundingBox"
        gradientTransform={`rotate(${seed.angle} 0.5 0.5)`}
        initial={{ x1: -1.3, x2: -0.4 }}
        animate={{ x1: 1.3, x2: 2.2 }}
        transition={{ duration: seed.duration, ease: [0.22, 1, 0.36, 1] }}
      >
        <stop offset="0%" stopColor="#ffffff" stopOpacity={0} />
        <stop offset="46%" stopColor="#ffffff" stopOpacity={0.09} />
        <stop offset="54%" stopColor="#ffffff" stopOpacity={0.09} />
        <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
      </motion.linearGradient>
      <motion.path
        d={PUZZLE_PIECE_PATH}
        fill={`url(#${highlightId})`}
        style={{ mixBlendMode: 'soft-light' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: seed.duration, times: [0, 0.22, 0.72, 1], ease: 'easeInOut' }}
      />
    </>
  );
}

/** Painted ABOVE every element in the section -- fabric, headline, cards
 * alike -- entirely through mix-blend-mode, never through opacity or
 * backdrop-filter. This is what lets fully opaque capability cards still
 * read as part of the same embossed sheet instead of panels sitting over
 * it. Must render last (highest in paint order) and stay pointer-events-none
 * so it never intercepts clicks on the content beneath it. */
export function PuzzleReliefOverlay() {
  const uid = useId();
  const gradientId = `puzzle-sweep-${uid}`;
  const reduceMotion = useReducedMotion() ?? false;
  const { run, seed } = useGrazingLight(!reduceMotion);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden role="presentation">
      <svg
        viewBox={PUZZLE_PIECE_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        className={PUZZLE_SVG_CLASS}
        style={{ transform: 'rotate(-7deg)' }}
      >
        <defs>
          <linearGradient id={`${gradientId}-surface`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#e7e4ee" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* ambient occlusion -- the wide, soft shadow the piece casts into the sheet.
            A blend mode reaches every opaque pixel beneath it at full strength (there's
            no translucency left to dilute it), so these opacities read roughly 3x
            stronger than the same numbers would on a translucent panel -- tuned down
            accordingly to stay a whisper, not a graphic. */}
        <path
          d={PUZZLE_PIECE_PATH}
          fill="#0f172a"
          opacity={0.02}
          style={{ filter: 'blur(30px)', transform: 'translate(10px, 16px)', mixBlendMode: 'multiply' }}
        />
        {/* the raised rim -- shadow, lower-right */}
        <path
          d={PUZZLE_PIECE_PATH}
          fill="#0f172a"
          opacity={0.035}
          style={{ filter: 'blur(11px)', transform: 'translate(4px, 6px)', mixBlendMode: 'multiply' }}
        />
        {/* the raised rim -- highlight, upper-left. Kept noticeably weaker than the
            shadow layers above: soft-light lightens whatever it crosses, and where it
            crosses card body text (already dark) that reads as a visible contrast dip
            past roughly this opacity -- multiply-based shadow doesn't have the same
            problem, since multiplying already-dark text by a light color barely moves it. */}
        <path
          d={PUZZLE_PIECE_PATH}
          fill="#ffffff"
          opacity={0.06}
          style={{ filter: 'blur(9px)', transform: 'translate(-3px, -4px)', mixBlendMode: 'soft-light' }}
        />
        {/* the surface itself -- a whisper of tone, not a printed shape */}
        <path d={PUZZLE_PIECE_PATH} fill={`url(#${gradientId}-surface)`} style={{ mixBlendMode: 'soft-light' }} />

        {!reduceMotion ? (
          <g key={run}>
            <GrazingSweep seed={seed} gradientId={`${gradientId}-sweep`} />
          </g>
        ) : null}
      </svg>
    </div>
  );
}
