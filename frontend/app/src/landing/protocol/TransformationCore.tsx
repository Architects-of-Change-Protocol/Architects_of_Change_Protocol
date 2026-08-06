import { useEffect, useId, useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import type { TransformPhase } from './useTransformationPhase';

// ---------------------------------------------------------------------------
// The invisible protocol layer between "a file" and "a digital asset".
//
// Not a flow diagram. Not a transport animation. A single faceted amethyst
// mineral quietly assembles from the file's raw bytes, pulses once (the
// protocol interpreting it), then emits the structured context — Identity,
// Integrity, Provenance, etc. — that appears on the asset card. The mineral
// is the recurring visual identity of AOC Protocol; the asset card, not the
// mineral, is the payoff the eye should land on. Sequencing lives in
// ./useTransformationPhase.ts — this file is the visual only.
//
// At rest the mineral itself never moves -- no breathing, no pulsing, no
// rotation. It reads as a precision-cut optical object (sapphire, watch
// crystal), and the only motion allowed is light interacting with it: a
// soft specular highlight that occasionally sweeps across the facets (see
// useSpecularSweep / SpecularSweep below), on an irregular cadence so it
// never reads as a mechanical loop.
// ---------------------------------------------------------------------------

function useIsHorizontal() {
  const [horizontal, setHorizontal] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setHorizontal(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return horizontal;
}

// Six facets radiating from a shared center point — an abstract faceted
// gem, not a gemstone illustration. Opacity varies per facet to read as
// light catching different faces, never as a flat icon. centerX locates
// each facet along the gem's width so the specular sweep and its faint
// refraction shimmer can reach each face in the order light would.
const FACETS = [
  { points: '50,6 24,30 50,50', opacity: 0.92, centerX: 41.3 },
  { points: '50,6 50,50 76,30', opacity: 0.6, centerX: 58.7 },
  { points: '24,30 24,68 50,50', opacity: 0.8, centerX: 32.7 },
  { points: '76,30 50,50 76,68', opacity: 0.48, centerX: 67.3 },
  { points: '24,68 50,94 50,50', opacity: 0.72, centerX: 41.3 },
  { points: '50,94 76,68 50,50', opacity: 0.4, centerX: 58.7 },
];

// The gem's outer silhouette (the six outer vertices) — used to clip the
// specular beam so it only ever appears "on" the crystal's surface, never
// as a shape floating in front of or behind it.
const GEM_OUTLINE = '50,6 76,30 76,68 50,94 24,68 24,30';

const facetGroupVariants: Variants = {
  idle: { opacity: 0 },
  gather: { opacity: 0 },
  assemble: { opacity: 1, transition: { staggerChildren: 0.045 } },
  pulse: { opacity: 1 },
  emit: { opacity: 1 },
  rest: { opacity: 1 },
};

const facetVariants: Variants = {
  idle: { opacity: 0 },
  gather: { opacity: 0 },
  assemble: (baseOpacity: number) => ({ opacity: baseOpacity, transition: { duration: 0.3, ease: 'easeOut' } }),
  pulse: (baseOpacity: number) => ({ opacity: baseOpacity }),
  emit: (baseOpacity: number) => ({ opacity: baseOpacity }),
  rest: (baseOpacity: number) => ({ opacity: baseOpacity }),
};

// Rest is a single still frame -- no loop, no breathing, no scale. Once the
// mineral arrives here it does not animate itself again; only the specular
// sweep (light) moves from this point on.
const gemVariants: Variants = {
  idle: { opacity: 0, scale: 0.9 },
  gather: { opacity: 0, scale: 0.9 },
  assemble: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  pulse: { opacity: 1, scale: [1, 1.035, 1], transition: { duration: 0.22, ease: 'easeInOut' } },
  emit: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  rest: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
};

const glowVariants: Variants = {
  idle: { opacity: 0 },
  gather: { opacity: 0.1 },
  assemble: { opacity: 0.3, transition: { duration: 0.3 } },
  pulse: { opacity: 0.55, transition: { duration: 0.22, ease: 'easeInOut' } },
  emit: { opacity: 0.28, transition: { duration: 0.3 } },
  rest: { opacity: 0.14, transition: { duration: 0.4 } },
};

type MotionParticle = { size: number; offset: number; drift: number; delay: number };

// Raw-byte particles (gather) — small, quiet, never sparks. Perpendicular
// jitter values are hand-picked, not random, so the motion is reproducible
// and never flashes differently between renders.
const PARTICLES: MotionParticle[] = [
  { size: 2.5, offset: -16, drift: 5, delay: 0 },
  { size: 2, offset: 9, drift: -7, delay: 0.05 },
  { size: 2, offset: -5, drift: 4, delay: 0.1 },
  { size: 2.5, offset: 14, drift: -5, delay: 0.03 },
  { size: 2, offset: -20, drift: 8, delay: 0.08 },
  { size: 2, offset: 4, drift: -3, delay: 0.13 },
];

// Structured streams (emit) — ordered, parallel, intentional; replaces the
// particle motif once the protocol has interpreted the asset.
const STREAMS: { offset: number; delay: number }[] = [
  { offset: -9, delay: 0 },
  { offset: -3, delay: 0.06 },
  { offset: 3, delay: 0.12 },
  { offset: 9, delay: 0.18 },
];

function Particle({ config, axis, phase }: { config: MotionParticle; axis: 'x' | 'y'; phase: TransformPhase }) {
  const reach = 46;
  const from = axis === 'x'
    ? { x: -reach, y: config.offset }
    : { x: config.offset, y: -reach };
  const mid = axis === 'x'
    ? { x: -reach * 0.35, y: config.offset + config.drift * 0.6 }
    : { x: config.offset + config.drift * 0.6, y: -reach * 0.35 };
  const to = axis === 'x'
    ? { x: 0, y: config.offset + config.drift }
    : { x: config.offset + config.drift, y: 0 };

  const variants: Variants = {
    idle: { opacity: 0 },
    gather: {
      opacity: [0, 0.55, 0.5, 0],
      x: [from.x, mid.x, to.x, to.x],
      y: [from.y, mid.y, to.y, to.y],
      scale: [0.6, 0.9, 0.85, 0.6],
      transition: { duration: 0.85, delay: config.delay, times: [0, 0.3, 0.8, 1], ease: 'easeInOut' },
    },
    assemble: { opacity: 0 },
    pulse: { opacity: 0 },
    emit: { opacity: 0 },
    rest: { opacity: 0 },
  };

  return (
    <motion.span
      aria-hidden
      className="absolute left-1/2 top-1/2 rounded-full bg-violet-400"
      style={{ width: config.size, height: config.size, marginLeft: -config.size / 2, marginTop: -config.size / 2 }}
      variants={variants}
      animate={phase}
      initial="idle"
    />
  );
}

function Stream({ config, axis, phase }: { config: { offset: number; delay: number }; axis: 'x' | 'y'; phase: TransformPhase }) {
  const reach = 46;
  const isX = axis === 'x';

  const variants: Variants = {
    idle: { opacity: 0 },
    gather: { opacity: 0 },
    assemble: { opacity: 0 },
    pulse: { opacity: 0 },
    emit: {
      opacity: [0, 0.85, 0.85, 0],
      x: isX ? [0, reach * 0.45, reach] : config.offset,
      y: isX ? config.offset : [0, reach * 0.45, reach],
      transition: { duration: 0.5, delay: config.delay, times: [0, 0.4, 1], ease: [0.4, 0, 0.2, 1] },
    },
    rest: { opacity: 0 },
  };

  return (
    <motion.span
      aria-hidden
      className={`absolute left-1/2 top-1/2 rounded-full bg-violet-400/80 ${isX ? 'h-[2px] w-3' : 'h-3 w-[2px]'}`}
      style={isX ? { marginTop: -1 } : { marginLeft: -1 }}
      variants={variants}
      animate={phase}
      initial="idle"
    />
  );
}

type SweepSeed = { angle: number; duration: number };

function randomSweepSeed(): SweepSeed {
  return {
    angle: 14 + Math.random() * 14, // 14-28deg -- a different angle each pass
    duration: 2.1 + Math.random() * 0.9, // 2.1-3.0s, within the 2-3s target
  };
}

// Schedules recurring specular passes on an irregular cadence: a 6-10s idle
// pause between sweeps, each at a slightly different angle and duration, so
// consecutive passes never read as a mechanical loop. The crystal itself
// never re-renders because of this -- only the sweep/shimmer overlays key
// off `run` to restart.
function useSpecularSweep(active: boolean) {
  const [run, setRun] = useState(0);
  const [seed, setSeed] = useState<SweepSeed>(randomSweepSeed);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const scheduleNext = (pauseMs: number) => {
      timer.current = window.setTimeout(() => {
        if (cancelled) return;
        setSeed(randomSweepSeed());
        setRun((r) => r + 1);
        scheduleNext(6000 + Math.random() * 4000);
      }, pauseMs);
    };

    scheduleNext(1400 + Math.random() * 900);

    return () => {
      cancelled = true;
      window.clearTimeout(timer.current);
    };
  }, [active]);

  return { run, seed };
}

// The moving highlight: a narrow bright band inside an objectBoundingBox
// gradient, swept across by animating the gradient's own x1/x2 attributes
// (real SVG attributes, not a CSS transform) and painted directly onto a
// copy of the gem's own outline. That sidesteps the standard clip-path +
// CSS-transform ordering issue -- a clip-path is evaluated in an element's
// local, pre-transform space, so a shape moved purely via a `transform`
// never actually re-enters a stationary clip region -- and it means the
// highlight is physically confined to the gem's real silhouette without
// needing a separate clip shape at all.
function SpecularSweep({ seed, gradientId }: { seed: SweepSeed; gradientId: string }) {
  const span = 1; // width, in fractional bounding-box units, between x1 and x2
  return (
    <>
      <motion.linearGradient
        id={gradientId}
        gradientUnits="objectBoundingBox"
        gradientTransform={`rotate(${seed.angle} 0.5 0.5)`}
        initial={{ x1: -1.4, x2: -1.4 + span }}
        animate={{ x1: 1.4, x2: 1.4 + span }}
        transition={{ duration: seed.duration, ease: 'easeInOut' }}
      >
        <stop offset="0%" stopColor="#f5f3ff" stopOpacity={0} />
        <stop offset="46%" stopColor="#f5f3ff" stopOpacity={0.9} />
        <stop offset="54%" stopColor="#f5f3ff" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#f5f3ff" stopOpacity={0} />
      </motion.linearGradient>
      <motion.polygon
        points={GEM_OUTLINE}
        fill={`url(#${gradientId})`}
        style={{ mixBlendMode: 'screen' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0.3, 0] }}
        transition={{ duration: seed.duration, times: [0, 0.18, 0.72, 1], ease: 'easeInOut' }}
      />
    </>
  );
}

// A faint per-facet brightness bump timed to when the sweep crosses that
// facet's position -- refraction rather than a flat glow, briefly revealing
// the gem's geometry through light instead of animating the geometry itself.
function FacetShimmer({ facet, seed }: { facet: (typeof FACETS)[number]; seed: SweepSeed }) {
  const delay = (facet.centerX / 100) * seed.duration * 0.55;
  return (
    <motion.polygon
      points={facet.points}
      fill="#f5f3ff"
      style={{ mixBlendMode: 'screen' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.14, 0] }}
      transition={{ duration: 0.55, delay, ease: 'easeInOut' }}
    />
  );
}

export function TransformationCore({ phase, reduceMotion = false }: { phase: TransformPhase; reduceMotion?: boolean }) {
  const horizontal = useIsHorizontal();
  const axis = horizontal ? 'x' : 'y';
  const uid = useId();
  const gradientId = `aoc-specular-gradient-${uid}`;
  const { run, seed } = useSpecularSweep(phase === 'rest' && !reduceMotion);

  // Reduced motion: the mineral renders fully assembled and static, with no
  // fade-in, no breathing loop, and no particles/streams -- an instant final
  // state rather than a slowed-down version of the sequence.
  if (reduceMotion) {
    return (
      <div className="relative mx-auto flex h-32 w-32 items-center justify-center md:h-[9.5rem] md:w-[9.5rem]" role="presentation" aria-hidden>
        <div className="absolute h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.5),transparent_72%)] opacity-20 blur-xl" />
        <svg viewBox="0 0 100 100" className="relative h-16 w-16 md:h-[4.75rem] md:w-[4.75rem]">
          {FACETS.map((facet, i) => (
            <polygon key={i} points={facet.points} fill="#8b5cf6" stroke="#ede9fe" strokeOpacity={0.35} strokeWidth={0.6} opacity={facet.opacity} />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto flex h-32 w-32 items-center justify-center md:h-[9.5rem] md:w-[9.5rem]"
      role="presentation"
      aria-hidden
    >
      <motion.div
        className="absolute h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.5),transparent_72%)] blur-xl"
        variants={glowVariants}
        animate={phase}
        initial="idle"
      />

      {PARTICLES.map((p, i) => (
        <Particle key={i} config={p} axis={axis} phase={phase} />
      ))}

      <motion.svg
        viewBox="0 0 100 100"
        className="relative h-16 w-16 md:h-[4.75rem] md:w-[4.75rem]"
        variants={gemVariants}
        animate={phase}
        initial="idle"
        style={{ transformOrigin: '50px 50px', isolation: 'isolate' }}
      >
        <motion.g variants={facetGroupVariants} animate={phase} initial="idle">
          {FACETS.map((facet, i) => (
            <motion.polygon
              key={i}
              points={facet.points}
              fill="#8b5cf6"
              stroke="#ede9fe"
              strokeOpacity={0.35}
              strokeWidth={0.6}
              custom={facet.opacity}
              variants={facetVariants}
            />
          ))}
        </motion.g>

        {phase === 'rest' && (
          <g key={run}>
            {FACETS.map((facet, i) => (
              <FacetShimmer key={i} facet={facet} seed={seed} />
            ))}
            <SpecularSweep seed={seed} gradientId={gradientId} />
          </g>
        )}
      </motion.svg>

      {STREAMS.map((s, i) => (
        <Stream key={i} config={s} axis={axis} phase={phase} />
      ))}
    </div>
  );
}
