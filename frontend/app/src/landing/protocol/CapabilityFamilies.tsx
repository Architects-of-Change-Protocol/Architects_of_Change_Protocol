import { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { CAPABILITY_FAMILIES } from './content';
import { CAPABILITY_ICONS } from './CapabilityIcons';
import { SectionHeader, StatusPill } from '../enterprise/primitives';

// A single capability at rest shows only its icon and name — an object
// worth exploring, not a wall of text. Hovering (or focusing, or tapping on
// touch) brings one card forward: it widens, its description and status
// unfold, and every sibling quietly steps back in scale and opacity. The
// grid itself never reflows violently — only the active card's column span
// changes, and Framer Motion's `layout` animates that resize and the
// resulting sibling reflow as one continuous motion instead of a jump.
const EASE = [0.33, 1, 0.68, 1] as const;

export function CapabilityFamilies() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [isReflowing, setIsReflowing] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const reflowCount = useRef(0);
  // A tap focuses its element before its click fires. Without this flag the
  // resulting onFocus would set activeId, then the same tap's onClick would
  // read that as "already active" and immediately toggle it back off — so a
  // card never visibly expanded until a second tap. Set on pointerdown,
  // consumed by the very next onFocus, so real keyboard-driven focus (no
  // preceding pointerdown) is unaffected.
  const pointerActivatedRef = useRef(false);

  // While the active card's column span animates, every sibling's bounding
  // box moves too (Framer Motion's `layout` reflow). Chromium re-hit-tests
  // elements that pass under a stationary cursor during that reflow and
  // fires real mouseenter/mouseleave on whatever card ends up there, which
  // can silently activate a card the pointer never intentionally entered.
  // Suppressing pointer events for the reflow's duration prevents that.
  const startReflow = () => {
    reflowCount.current += 1;
    setIsReflowing(true);
  };
  const endReflow = () => {
    reflowCount.current = Math.max(0, reflowCount.current - 1);
    if (reflowCount.current === 0) setIsReflowing(false);
  };

  useEffect(() => {
    const mq = window.matchMedia('(hover: none)');
    const onChange = () => setIsTouch(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Touch devices have no hover: tapping a card expands it, tapping
  // anywhere else in the grid (or outside it) collapses it again.
  useEffect(() => {
    if (!isTouch || !activeId) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-capability-card]')) setActiveId(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isTouch, activeId]);

  return (
    <section id="capabilities" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="What Can a Digital Asset Express?"
        title="Capabilities are what a digital asset can declare about itself."
        description="Each family below is a property an asset's manifest or canonical record can carry. Hover or focus a capability to see what it declares — status labels show what's already defined as a canonical contract in @aoc/protocol versus what's still a protocol direction."
        mineral="amethyst"
      />

      <MotionConfig reducedMotion="user">
        <div
          ref={gridRef}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          style={{ pointerEvents: isReflowing ? 'none' : 'auto' }}
          onMouseLeave={() => !isTouch && setActiveId(null)}
        >
          {CAPABILITY_FAMILIES.map((family) => {
            const isActive = activeId === family.id;
            const isDimmed = activeId !== null && !isActive;
            const Icon = CAPABILITY_ICONS[family.id];
            const detailId = `capability-detail-${family.id}`;

            return (
              <motion.div
                key={family.id}
                layout
                data-capability-card
                transition={{ layout: { duration: isActive ? 0.32 : 0.25, ease: EASE } }}
                onLayoutAnimationStart={startReflow}
                onLayoutAnimationComplete={endReflow}
                className={isActive ? 'sm:col-span-2 lg:col-span-2' : undefined}
                onMouseEnter={() => !isTouch && setActiveId(family.id)}
                onPointerDown={() => {
                  pointerActivatedRef.current = true;
                }}
                onFocus={() => {
                  if (isTouch && pointerActivatedRef.current) {
                    pointerActivatedRef.current = false;
                    return;
                  }
                  setActiveId(family.id);
                }}
                onBlur={() => setActiveId((current) => (current === family.id ? null : current))}
                onClick={() => isTouch && setActiveId((current) => (current === family.id ? null : family.id))}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setActiveId(null);
                    event.currentTarget.blur();
                  } else if (event.key === ' ' || event.key === 'Spacebar') {
                    // The card isn't a native button; without this, Space
                    // falls through to the browser's default page-scroll.
                    event.preventDefault();
                  }
                }}
                tabIndex={0}
                role="group"
                aria-label={family.name}
                aria-expanded={isActive}
                aria-describedby={detailId}
              >
                <motion.div
                  animate={{ scale: isDimmed ? 0.9 : 1, opacity: isDimmed ? 0.4 : 1 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className={`relative h-full rounded-2xl border bg-slate-50 p-6 outline-none cursor-default focus-visible:ring-2 focus-visible:ring-violet-400 ${
                    isActive
                      ? 'border-violet-300 shadow-[0_20px_44px_rgba(139,92,246,0.2)]'
                      : 'border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)]'
                  }`}
                  style={{ transitionProperty: 'border-color, box-shadow', transitionDuration: '300ms', transitionTimingFunction: 'cubic-bezier(0.33,1,0.68,1)' }}
                >
                  {isActive && (
                    <motion.div
                      aria-hidden
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(circle_at_28%_18%,rgba(139,92,246,0.16),transparent_65%)]"
                    />
                  )}

                  <motion.div
                    animate={isActive ? { y: [0, -3, 0] } : { y: 0 }}
                    transition={isActive ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2, ease: EASE }}
                    className="relative w-fit text-violet-600"
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>

                  <h3 className="relative mt-4 text-base font-extrabold text-slate-900">{family.name}</h3>

                  <motion.div
                    id={detailId}
                    initial={false}
                    animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                    transition={{
                      height: { duration: isActive ? 0.32 : 0.24, ease: EASE },
                      opacity: { duration: 0.2, ease: EASE, delay: isActive ? 0.08 : 0 },
                    }}
                    className="relative overflow-hidden"
                  >
                    <p className="mt-3 text-sm leading-relaxed text-slate-500">{family.summary}</p>
                    <motion.div
                      initial={false}
                      animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 6 }}
                      transition={{ duration: 0.2, ease: EASE, delay: isActive ? 0.16 : 0 }}
                      className="mt-4"
                    >
                      <StatusPill label={family.status} />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </MotionConfig>
    </section>
  );
}
