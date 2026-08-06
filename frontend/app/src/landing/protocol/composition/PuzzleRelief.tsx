import { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PUZZLE_PIECE_PATH, PUZZLE_PIECE_VIEWBOX } from './puzzlePiece';

// ---------------------------------------------------------------------------
// The section's centerpiece: one jigsaw-piece silhouette, never drawn as a
// graphic. It's implied entirely by a soft cast shadow, a faint rim
// highlight and, occasionally, a slow grazing light -- as if a stretched
// fabric were lying over a solid object just beneath it. Neither the fabric
// nor the piece ever moves; only the light does. See ./puzzlePiece.ts for
// the shape itself and ../TransformationCore.tsx for the sibling technique
// this borrows (a gradient swept across an element's own silhouette via
// objectBoundingBox + mixBlendMode, restarted on an irregular cadence so it
// never reads as a mechanical loop).
// ---------------------------------------------------------------------------

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
// trailing it on the far side. A single highlight streak on a near-white
// fabric all but disappears (there's almost no headroom to lighten further),
// so the shadow band is what actually sells the motion -- the highlight
// just adds the glint at its leading edge.
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
        <stop offset="48%" stopColor="#1e2433" stopOpacity={0.16} />
        <stop offset="58%" stopColor="#1e2433" stopOpacity={0.16} />
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
        <stop offset="46%" stopColor="#ffffff" stopOpacity={0.95} />
        <stop offset="54%" stopColor="#ffffff" stopOpacity={0.95} />
        <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
      </motion.linearGradient>
      <motion.path
        d={PUZZLE_PIECE_PATH}
        fill={`url(#${highlightId})`}
        style={{ mixBlendMode: 'overlay' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: seed.duration, times: [0, 0.22, 0.72, 1], ease: 'easeInOut' }}
      />
    </>
  );
}

/** Full-bleed background for the asset-composition section. Every other
 * element in that section renders on a translucent surface so this relief
 * stays sensed underneath it, not hidden behind it. */
export function PuzzleRelief() {
  const uid = useId();
  const gradientId = `puzzle-sweep-${uid}`;
  const reduceMotion = useReducedMotion() ?? false;
  const { run, seed } = useGrazingLight(!reduceMotion);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden role="presentation">
      {/* the fabric itself */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_25%_0%,#fdfcff_0%,#f8f8fb_45%,#f4f4f7_100%)]" />

      <svg
        viewBox={PUZZLE_PIECE_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        className="absolute -right-10 top-12 h-[480px] w-[480px] sm:-right-6 sm:h-[620px] sm:w-[620px] md:top-16 md:h-[760px] md:w-[760px] lg:-right-4 lg:h-[860px] lg:w-[860px]"
        style={{ transform: 'rotate(-7deg)' }}
      >
        <defs>
          <linearGradient id={`${gradientId}-surface`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#eceaf2" stopOpacity="0.32" />
          </linearGradient>
        </defs>

        {/* ambient occlusion -- the wide, soft shadow the piece casts into the fabric */}
        <path
          d={PUZZLE_PIECE_PATH}
          fill="#0f172a"
          opacity={0.05}
          style={{ filter: 'blur(26px)', transform: 'translate(10px, 16px)' }}
        />
        {/* the raised rim -- shadow, lower-right */}
        <path
          d={PUZZLE_PIECE_PATH}
          fill="#0f172a"
          opacity={0.07}
          style={{ filter: 'blur(9px)', transform: 'translate(4px, 6px)' }}
        />
        {/* the raised rim -- highlight, upper-left */}
        <path
          d={PUZZLE_PIECE_PATH}
          fill="#ffffff"
          opacity={0.85}
          style={{ filter: 'blur(7px)', transform: 'translate(-3px, -4px)' }}
        />
        {/* the surface itself -- a whisper of tone, not a printed shape */}
        <path d={PUZZLE_PIECE_PATH} fill={`url(#${gradientId}-surface)`} />

        {!reduceMotion ? (
          <g key={run}>
            <GrazingSweep seed={seed} gradientId={`${gradientId}-sweep`} />
          </g>
        ) : null}
      </svg>
    </div>
  );
}
