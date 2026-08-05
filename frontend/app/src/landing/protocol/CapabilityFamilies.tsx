import { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { CAPABILITY_FAMILIES, type CapabilityFamily } from './content';
import {
  GovernanceCompatibilityIcon,
  IdentityIcon,
  IntegrityIcon,
  InteroperabilityIcon,
  LicensingIcon,
  PortabilityIcon,
  ProvenanceIcon,
  VerifiabilityIcon,
  type IconProps,
} from './CapabilityIcons';
import { SectionHeader, StatusPill } from '../enterprise/primitives';

const CAPABILITY_ICONS: Record<CapabilityFamily['id'], (props: IconProps) => ReturnType<typeof IdentityIcon>> = {
  identity: IdentityIcon,
  integrity: IntegrityIcon,
  provenance: ProvenanceIcon,
  portability: PortabilityIcon,
  interoperability: InteroperabilityIcon,
  verifiability: VerifiabilityIcon,
  licensing: LicensingIcon,
  'governance-compatibility': GovernanceCompatibilityIcon,
};

// A single capability at rest shows only its icon and name — an object
// worth exploring, not a wall of text. Hovering (or focusing, or tapping on
// touch) brings one card forward: its description and status unfold in
// place and it lifts slightly, while every sibling quietly steps back in
// scale and opacity, and the row below it genuinely moves down to make
// room — nothing is ever covered or unreachable.
//
// Five earlier versions got this wrong:
//
// V1 changed the hit target's own grid column span to grow the active
// card (smoothed via Framer Motion's `layout` prop) — that moved the hit
// target itself under the cursor mid-hover, producing false/stuck hover
// states on some transitions.
//
// V2 tried to patch that by suppressing pointer events for the duration of
// Framer's layout-animation callbacks, tracked with a start/complete
// counter — but an interrupted animation can fire onLayoutAnimationStart
// without its matching onLayoutAnimationComplete, so the counter could get
// permanently stuck above zero, deadlocking hover for the rest of the
// page's lifetime after the very first hover.
//
// V3 kept every card's own box a fixed width and let the description grow
// in normal document flow, reasoning that CSS Grid's row-track sizing
// would only ever grow the active row — but CSS Grid's default
// `align-items: stretch` also stretches every *sibling* in that row to
// match, so the row below still shifted out from under a hover mid-
// transition (an admittedly rare miss, but a real one).
//
// V4 removed the description from normal flow entirely (an absolutely
// positioned overlay on an invisible, never-resized spacer), which made
// row-track sizing provably constant — but an overlay tall enough to hold
// a full description is taller than one row, so it permanently painted
// over — and made unreachable — whatever card sat in the same column one
// row down. Not a transient mis-hover; a 100%-reproducible dead zone.
//
// V5 and V6 both went back to real, in-flow height growth with
// `items-start` to stop sibling stretch — both correct, and kept below —
// but each tried to guard the resulting row-shift with a pointer-events
// lock (first grid-wide, then narrowed to non-active cards only). Both
// leaned on browser hit-test behavior that turned out to be asymmetric:
// Chromium fires a real mouseleave when an element is excluded from
// hit-testing while the cursor sits on it, but does *not* fire a matching
// mouseenter when it's later re-included under a still-stationary cursor.
// V5's whole-grid lock excluded the active card itself, self-collapsing it
// every ~415ms forever. V6's narrower per-card lock avoided that, but
// re-armed on every incidental crossing (a fast or diagonal move can graze
// an unrelated card's hit box en route to its real target) with no memory
// of a lock already in flight, so a transition landing inside another
// transition's lock window was silently dropped — the previous card stuck
// open, the new target never activating (measured ~48% failure rate on
// rapid diagonal transitions, and it also broke touch tap-switching, since
// a tap's own blur-then-click sequence is exactly this kind of double
// transition).
//
// This version stops trying to control hit-testing at all. Instead of
// suppressing events during the window a reflow might cause a spurious
// hover, it debounces *commitment*: a mouse-driven activation only takes
// effect after it has been the single most recent hover event for
// `HOVER_INTENT_MS` uninterrupted. A transient hover — a sibling sweeping
// past a stationary cursor mid-reflow, or the cursor grazing an unrelated
// card en route to its real target — gets superseded by the next real
// hover event before its timer fires and never commits; a genuine,
// sustained hover always outlasts the window and commits normally. This
// needs no exemptions, no lock bookkeeping, and no assumption about which
// direction the browser does or doesn't resynthesize events. Keyboard focus
// and touch taps are unaffected — they're discrete, not continuous, so
// they were never the pathway at risk and stay immediate.
const EASE = [0.33, 1, 0.68, 1] as const;
const HOVER_INTENT_MS = 100;

export function CapabilityFamilies() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  // A tap focuses its element before its click fires. Without this flag the
  // resulting onFocus would set activeId, then the same tap's onClick would
  // read that as "already active" and immediately toggle it back off — so a
  // card never visibly expanded until a second tap. Set on pointerdown,
  // consumed by the very next onFocus, so real keyboard-driven focus (no
  // preceding pointerdown) is unaffected.
  const pointerActivatedRef = useRef(false);
  // Tracks the one pending mouse-hover-intent timer, if any. A new mouse
  // hover event (on any card) always clears whatever was previously
  // pending before scheduling its own, so a superseded intent can never
  // fire after the fact.
  const hoverIntentTimerRef = useRef<number | undefined>(undefined);

  const clearHoverIntent = () => {
    window.clearTimeout(hoverIntentTimerRef.current);
  };

  // Immediate activation — used by every discrete input (keyboard focus,
  // blur, click, Escape, tap-outside). None of these are susceptible to the
  // reflow mis-hover problem, so none of them need to wait.
  const setActiveNow = (next: string | null | ((current: string | null) => string | null)) => {
    clearHoverIntent();
    setActiveId(next);
  };

  // Debounced activation — used only by mouse hover. Supersedes (cancels)
  // any previously pending hover intent.
  const scheduleActiveFromHover = (id: string) => {
    clearHoverIntent();
    hoverIntentTimerRef.current = window.setTimeout(() => setActiveId(id), HOVER_INTENT_MS);
  };

  useEffect(() => clearHoverIntent, []);

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
    // Direct setActiveId, not setActiveNow: touch never leaves a pending
    // hover-intent timer behind (only mouse hover schedules one), so there
    // is nothing here that needs clearing.
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
          className="grid items-start sm:grid-cols-2 lg:grid-cols-4 gap-5"
          onMouseLeave={() => !isTouch && setActiveNow(null)}
        >
          {CAPABILITY_FAMILIES.map((family) => {
            const isActive = activeId === family.id;
            const isDimmed = activeId !== null && !isActive;
            const Icon = CAPABILITY_ICONS[family.id];
            const detailId = `capability-detail-${family.id}`;

            return (
              <motion.div
                key={family.id}
                data-capability-card
                onMouseEnter={() => !isTouch && scheduleActiveFromHover(family.id)}
                onPointerDown={() => {
                  pointerActivatedRef.current = true;
                }}
                onFocus={() => {
                  if (isTouch && pointerActivatedRef.current) {
                    pointerActivatedRef.current = false;
                    return;
                  }
                  setActiveNow(family.id);
                }}
                onBlur={() => setActiveNow((current) => (current === family.id ? null : current))}
                onClick={() => isTouch && setActiveNow((current) => (current === family.id ? null : family.id))}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setActiveNow(null);
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
                  animate={{ scale: isActive ? 1.04 : isDimmed ? 0.9 : 1, opacity: isDimmed ? 0.4 : 1 }}
                  transition={{ duration: isActive ? 0.32 : 0.25, ease: EASE }}
                  style={{
                    zIndex: isActive ? 10 : 1,
                    transitionProperty: 'border-color, box-shadow',
                    transitionDuration: '300ms',
                    transitionTimingFunction: 'cubic-bezier(0.33,1,0.68,1)',
                  }}
                  className={`relative rounded-2xl border bg-slate-50 p-6 outline-none cursor-default focus-visible:ring-2 focus-visible:ring-violet-400 ${
                    isActive
                      ? 'border-violet-300 shadow-[0_20px_44px_rgba(139,92,246,0.2)]'
                      : 'border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)]'
                  }`}
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
