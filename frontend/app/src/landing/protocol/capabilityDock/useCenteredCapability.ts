import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

// Mobile equivalent of useDockProximity: there is no hover and no cursor, so
// "nearest to the point of attention" becomes "nearest to the horizontal
// center of the scroll-snap carousel" instead. An IntersectionObserver
// scoped to a narrow central band of the carousel (rootMargin pulls both
// edges in by 35%, leaving only the middle ~30% as the detection zone) does
// the equivalent of the desktop pointer-distance calculation without
// touching scroll position on every frame — whichever card has the highest
// intersection ratio inside that band is the centered/dominant one.

function buildThresholds(steps = 10): number[] {
  return Array.from({ length: steps + 1 }, (_, i) => i / steps);
}

export type CenteredCapabilityController = {
  registerItem: (index: number, el: HTMLElement | null) => void;
  centeredIndex: number | null;
  scrollToIndex: (index: number) => void;
};

// See useDockProximity.ts's containerRef parameter for why this is passed
// in (created by the caller) rather than created and returned here.
export function useCenteredCapability(
  count: number,
  enabled: boolean,
  containerRef: RefObject<HTMLDivElement | null>,
): CenteredCapabilityController {
  const itemEls = useRef<(HTMLElement | null)[]>([]);
  const ratios = useRef<number[]>([]);
  const [centeredIndex, setCenteredIndex] = useState<number | null>(0);

  const registerItem = useCallback((index: number, el: HTMLElement | null) => {
    itemEls.current[index] = el;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = containerRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    ratios.current = new Array(count).fill(0);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = itemEls.current.findIndex((el) => el === entry.target);
          if (index !== -1) ratios.current[index] = entry.intersectionRatio;
        }
        let best: number | null = null;
        let bestRatio = 0;
        ratios.current.forEach((ratio, index) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = index;
          }
        });
        setCenteredIndex(best);
      },
      { root, threshold: buildThresholds(), rootMargin: '0px -35% 0px -35%' },
    );

    itemEls.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [enabled, count, containerRef]);

  const scrollToIndex = useCallback((index: number) => {
    itemEls.current[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, []);

  return { registerItem, centeredIndex, scrollToIndex };
}
