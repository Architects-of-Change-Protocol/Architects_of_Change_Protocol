import { useEffect, useState } from 'react';
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
// light catching different faces, never as a flat icon.
const FACETS = [
  { points: '50,6 24,30 50,50', opacity: 0.92 },
  { points: '50,6 50,50 76,30', opacity: 0.6 },
  { points: '24,30 24,68 50,50', opacity: 0.8 },
  { points: '76,30 50,50 76,68', opacity: 0.48 },
  { points: '24,68 50,94 50,50', opacity: 0.72 },
  { points: '50,94 76,68 50,50', opacity: 0.4 },
];

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

const gemVariants: Variants = {
  idle: { opacity: 0, scale: 0.9 },
  gather: { opacity: 0, scale: 0.9 },
  assemble: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  pulse: { opacity: 1, scale: [1, 1.035, 1], transition: { duration: 0.22, ease: 'easeInOut' } },
  emit: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  rest: {
    opacity: 1,
    scale: [1, 1.015, 1],
    transition: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
  },
};

const glowVariants: Variants = {
  idle: { opacity: 0 },
  gather: { opacity: 0.1 },
  assemble: { opacity: 0.3, transition: { duration: 0.3 } },
  pulse: { opacity: 0.55, transition: { duration: 0.22, ease: 'easeInOut' } },
  emit: { opacity: 0.28, transition: { duration: 0.3 } },
  rest: {
    opacity: [0.16, 0.26, 0.16],
    transition: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
  },
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

export function TransformationCore({ phase, reduceMotion = false }: { phase: TransformPhase; reduceMotion?: boolean }) {
  const horizontal = useIsHorizontal();
  const axis = horizontal ? 'x' : 'y';

  // Reduced motion: the mineral renders fully assembled and static, with no
  // fade-in, no breathing loop, and no particles/streams -- an instant final
  // state rather than a slowed-down version of the sequence.
  if (reduceMotion) {
    return (
      <div className="relative mx-auto flex h-28 w-28 items-center justify-center md:h-32 md:w-32" role="presentation" aria-hidden>
        <div className="absolute h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.5),transparent_72%)] opacity-20 blur-xl" />
        <svg viewBox="0 0 100 100" className="relative h-14 w-14 md:h-16 md:w-16">
          {FACETS.map((facet, i) => (
            <polygon key={i} points={facet.points} fill="#8b5cf6" stroke="#ede9fe" strokeOpacity={0.35} strokeWidth={0.6} opacity={facet.opacity} />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto flex h-28 w-28 items-center justify-center md:h-32 md:w-32"
      role="presentation"
      aria-hidden
    >
      <motion.div
        className="absolute h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.5),transparent_72%)] blur-xl"
        variants={glowVariants}
        animate={phase}
        initial="idle"
      />

      {PARTICLES.map((p, i) => (
        <Particle key={i} config={p} axis={axis} phase={phase} />
      ))}

      <motion.svg
        viewBox="0 0 100 100"
        className="relative h-14 w-14 md:h-16 md:w-16"
        variants={gemVariants}
        animate={phase}
        initial="idle"
        style={{ transformOrigin: '50px 50px' }}
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
      </motion.svg>

      {STREAMS.map((s, i) => (
        <Stream key={i} config={s} axis={axis} phase={phase} />
      ))}
    </div>
  );
}
