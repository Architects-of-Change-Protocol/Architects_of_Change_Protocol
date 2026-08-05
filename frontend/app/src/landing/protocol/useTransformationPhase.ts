import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Drives the File -> Digital Asset transformation timeline (see
// TransformationCore.tsx for the visual). Kept separate from that file so it
// stays component-only for Vite Fast Refresh, same split as
// ./minerals.ts / ./primitives.tsx.
//
// Timeline (~2.2s), triggered once the stage crosses 35% into view and
// replayed only if the viewer leaves and later re-enters:
//   gather   0.0-0.9s   raw-byte particles drift from the file toward center
//   assemble 0.9-1.2s   the mineral's facets softly appear
//   pulse    1.2-1.42s  one gentle heartbeat -- protocol interpretation
//   emit     1.42-2.2s  structured streams travel outward; asset traits
//                       reveal progressively as they arrive
//   rest     2.2s+      an almost-imperceptible breathing loop
// ---------------------------------------------------------------------------

export type TransformPhase = 'idle' | 'gather' | 'assemble' | 'pulse' | 'emit' | 'rest';

// Scheduled entirely via timeouts (including the immediate "gather" entry)
// so every phase transition happens inside a callback, not synchronously in
// the effect body -- the state is subscribed to timer events, never mirrored
// from a dependency directly.
const PHASE_AT = { gather: 0, assemble: 900, pulse: 1200, emit: 1420, rest: 2200 } as const;

export function useTransformationPhase(ref: React.RefObject<Element | null>) {
  const inView = useInView(ref, { amount: 0.35 });
  // useReducedMotion() returns null until it can read the media query client
  // side; treat "not yet known" as "motion allowed" rather than propagating
  // a nullable flag through components that expect a plain boolean.
  const reduceMotion = useReducedMotion() ?? false;
  const [sequencePhase, setSequencePhase] = useState<TransformPhase>('idle');
  const timers = useRef<number[]>([]);

  useEffect(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];

    if (!inView || reduceMotion) return;

    timers.current = (Object.keys(PHASE_AT) as (keyof typeof PHASE_AT)[]).map((key) =>
      window.setTimeout(() => setSequencePhase(key), PHASE_AT[key]),
    );

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, [inView, reduceMotion]);

  const phase: TransformPhase = !inView ? 'idle' : reduceMotion ? 'rest' : sequencePhase;
  return { phase, reduceMotion };
}
