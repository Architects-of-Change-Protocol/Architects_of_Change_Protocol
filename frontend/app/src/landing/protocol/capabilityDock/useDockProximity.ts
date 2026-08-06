import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { DOCK_REDUCED_SPRING, DOCK_SPRING, gaussianInfluence } from './dockTokens';

// The desktop/tablet dock's geometry + pointer-proximity engine.
//
// Design constraint driving the shape of this hook: the row must respond to
// every pointer move, but almost none of that response should go through
// React state. A single shared `pointerX` motion value is updated directly
// (bypassing setState) on a rAF-batched pointermove handler; each card reads
// it via `useCardInfluence` below and derives its own spring-smoothed
// influence with framer-motion's own subscription system, which mutates the
// DOM directly and never triggers a React render. The only thing that *does*
// go through React state is `dominantIndex` — and only when the nearest card
// actually changes, not on every intermediate pixel, since that number
// drives real discrete UI (aria-expanded, which description is mounted,
// which link is shown).
//
// Card centers are measured once (mount + ResizeObserver + window resize),
// never on every pointer move — a live getBoundingClientRect() per card per
// pointermove would be the classic read/write layout-thrash trap this hook
// exists to avoid.

export type DockProximityController = {
  registerCard: (index: number, el: HTMLElement | null) => void;
  pointerX: MotionValue<number | null>;
  dominantIndex: number | null;
  getCenterX: (index: number) => number;
  /** Pins the dock's visual state to a specific card's own measured center —
   * used by keyboard focus and touch/tap so the continuous scale system
   * agrees with a discretely-chosen dominant card. */
  pinToCard: (index: number) => void;
  clear: () => void;
  remeasure: () => void;
};

// `containerRef` is created by the caller (with its own `useRef`) and handed
// in, rather than created here and handed back out: the element the hook
// measures against is also the element the caller attaches via JSX `ref=`,
// and keeping that `useRef` call in the component that owns the JSX keeps
// the ref's provenance obvious to both readers and static analysis.
export function useDockProximity(
  count: number,
  enabled: boolean,
  containerRef: RefObject<HTMLDivElement | null>,
): DockProximityController {
  const cardEls = useRef<(HTMLElement | null)[]>([]);
  const centers = useRef<number[]>([]);
  const pointerX = useMotionValue<number | null>(null);
  const [dominantIndex, setDominantIndex] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingClientX = useRef<number | null>(null);

  const measure = useCallback(() => {
    centers.current = cardEls.current.map((el) => {
      if (!el) return NaN;
      const rect = el.getBoundingClientRect();
      return rect.left + rect.width / 2;
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    measure();
    const container = containerRef.current;
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measure()) : null;
    if (container && ro) ro.observe(container);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, enabled, count, containerRef]);

  const nearestIndexFor = useCallback((x: number): { index: number; distance: number } | null => {
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < centers.current.length; i += 1) {
      const c = centers.current[i];
      if (Number.isNaN(c)) continue;
      const d = Math.abs(c - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best === -1 ? null : { index: best, distance: bestDist };
  }, []);

  const flush = useCallback(() => {
    rafRef.current = null;
    const x = pendingClientX.current;
    if (x == null) return;
    pointerX.set(x);
    const nearest = nearestIndexFor(x);
    setDominantIndex(nearest ? nearest.index : null);
  }, [nearestIndexFor, pointerX]);

  const registerCard = useCallback((index: number, el: HTMLElement | null) => {
    cardEls.current[index] = el;
  }, []);

  const onPointerMove = useCallback(
    (clientX: number) => {
      pendingClientX.current = clientX;
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(flush);
      }
    },
    [flush],
  );

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;
    const handleMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      onPointerMove(event.clientX);
    };
    const handleLeave = () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      pendingClientX.current = null;
      pointerX.set(null);
      setDominantIndex(null);
    };
    container.addEventListener('pointermove', handleMove);
    container.addEventListener('pointerleave', handleLeave);
    return () => {
      container.removeEventListener('pointermove', handleMove);
      container.removeEventListener('pointerleave', handleLeave);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, onPointerMove, pointerX, containerRef]);

  const pinToCard = useCallback(
    (index: number) => {
      const center = centers.current[index];
      if (!Number.isNaN(center)) pointerX.set(center);
      setDominantIndex(index);
    },
    [pointerX],
  );

  const clear = useCallback(() => {
    pointerX.set(null);
    setDominantIndex(null);
  }, [pointerX]);

  const getCenterX = useCallback((index: number) => centers.current[index] ?? NaN, []);

  return { registerCard, pointerX, dominantIndex, getCenterX, pinToCard, clear, remeasure: measure };
}

/** Per-card derived, spring-smoothed influence in [0, 1] — distance from the
 * shared pointerX to this card's own last-measured center, run through a
 * Gaussian falloff and then a physical spring. Lives entirely in
 * framer-motion's subscription graph: nothing here re-renders the card. */
export function useCardInfluence(
  pointerX: MotionValue<number | null>,
  getCenterX: () => number,
  reducedMotion: boolean,
): MotionValue<number> {
  const raw = useTransform(pointerX, (x) => {
    if (x == null) return 0;
    const center = getCenterX();
    if (Number.isNaN(center)) return 0;
    return gaussianInfluence(Math.abs(x - center));
  });
  return useSpring(raw, reducedMotion ? DOCK_REDUCED_SPRING : DOCK_SPRING);
}

/** Same spring-smoothed [0, 1] output as useCardInfluence, but driven by a
 * discrete boolean rather than pointer distance — used by the mobile
 * carousel, where "influence" is simply "is this the centered card". */
export function useDiscreteInfluence(active: boolean, reducedMotion: boolean): MotionValue<number> {
  const raw = useMotionValue(active ? 1 : 0);
  useEffect(() => {
    raw.set(active ? 1 : 0);
  }, [active, raw]);
  return useSpring(raw, reducedMotion ? DOCK_REDUCED_SPRING : DOCK_SPRING);
}
