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
// touch) lifts that card into its own layer, Dock-style: it scales up and
// rises slightly with a restrained amethyst glow, while every sibling
// quietly steps back in scale and opacity. Its description and status
// unfold in a floating panel attached to the card rather than participating
// in layout at all.
//
// Six earlier versions tried to make the CARD ITSELF grow to fit its
// description — via grid column-span, via normal-flow height growth, via
// an always-taller invisible spacer — and every one of them either moved
// or resized the interactive hit target under the cursor (causing
// false/stuck hover across various specific mechanisms) or, when they
// avoided that by overlaying instead of resizing, permanently occluded and
// made unreachable whatever card sat in the space the overlay grew into.
// Chasing bigger and more specific guards against the resulting hover
// races (pointer-event locks, animation-callback counters, hover-intent
// debouncing) fixed each specific failure but the category kept finding a
// new edge.
//
// This version sidesteps the entire category rather than guarding it: the
// grid's own geometry (row heights, column widths, item positions) never
// changes, ever, regardless of activeId — nothing here uses layout
// animation, grid-affecting size changes, or pointer-event manipulation.
// Every visual change is a `transform`/`opacity`/`box-shadow` on the card's
// own surface, which never alters its grid box, so no sibling can ever be
// physically displaced by another card's state. The description lives in a
// separate, absolutely positioned floating panel (outside normal flow, so
// it cannot affect grid sizing either) with `pointer-events: none` — it can
// visually extend over neighboring cards, exactly like a Dock tooltip or an
// Apple Wallet detail popover would, but a completely inert layer never
// blocks hovering, focusing, or clicking whatever is actually underneath.
//
// One edge this approach still had to account for: the panel being
// pointer-events:none means the cursor passes through it to whatever's
// really there — for a bottom-row card, that's empty space below the grid
// container's own box, not another card. Getting the "should this still
// count as hovered" check right took three attempts. Two of them tried to
// read the active card's/panel's rects off a React ref populated only
// while that card was active — neither ever actually attached through
// `motion.div`'s own ref-forwarding (confirmed via direct fiber
// inspection: `.current` stayed null even while genuinely active). The
// third replaced the ref with a plain DOM lookup by stable id (which does
// work) but still ran the check from the grid's own `onMouseLeave` — and
// `mouseleave` is a one-shot event fired only at the instant the cursor
// crosses the grid's box, not a continuous signal. Since a bottom-row
// card's panel extends past that boundary, the one `mouseleave` the
// browser ever sends usually still lands inside the card+panel union and
// gets waved through — but the cursor can then travel arbitrarily far away
// afterward without the grid ever hearing about it again, leaving the card
// stuck open until something else (a different card's hover, a click,
// Escape) intervened.
//
// This version drops the grid's own onMouseLeave for this purpose entirely
// and tracks a `document`-level mousemove instead, active only while some
// card is hovered-active: on every move it re-reads the current card's and
// panel's rects fresh (by the same stable-id DOM lookup) and clears
// activeId the moment the cursor is genuinely outside their union — a
// continuous check rather than a single stale snapshot, so it's correct
// however far or long the cursor travels afterward. `activeIdRef` mirrors
// `activeId` synchronously (updated inside `setActive`, not through a
// `useEffect`) so this listener — and the touch/keyboard paths, which all
// go through `setActive` too — always compare against the true current
// value instead of one captured in a stale closure.
const EASE = [0.33, 1, 0.68, 1] as const;

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
  // Mirrors activeId so the document-level mousemove tracker below always
  // reads the true current value, never one from a stale closure. Must be
  // updated synchronously, in plain JS, at the moment setActive is called —
  // not inside React's setState updater, which doesn't run until React's
  // own render/flush timing. A raw `document.addEventListener` handler
  // (like the mousemove tracker) sits outside React's event system, so a
  // mousemove landing between an onMouseEnter call and React actually
  // flushing that update would otherwise read activeIdRef one step behind
  // reality — exactly the race a previous version of this fix hit: a fast
  // move from one card straight into a non-overlapping one could have the
  // tracker see the *old* card, decide the cursor is now outside it, and
  // cancel the new card's activation that was already in flight.
  const activeIdRef = useRef<string | null>(null);

  const setActive = (next: string | null | ((current: string | null) => string | null)) => {
    const resolved = typeof next === 'function' ? next(activeIdRef.current) : next;
    activeIdRef.current = resolved;
    setActiveId(resolved);
  };

  useEffect(() => {
    const mq = window.matchMedia('(hover: none)');
    const onChange = () => setIsTouch(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Continuously verifies, on every mouse move anywhere on the page, that
  // the cursor is still within the active card's own footprint (its card
  // plus its floating panel — looked up fresh each time by stable DOM id,
  // not a ref; see the comment above the component for why). A single
  // persistent listener rather than one scoped to activeId: it already
  // no-ops correctly when nothing is active, and reading activeIdRef fresh
  // means it never needs to be torn down and rebuilt on every change.
  useEffect(() => {
    const onDocumentMouseMove = (event: MouseEvent) => {
      if (isTouch) return;
      const id = activeIdRef.current;
      if (!id) return;
      const cardRect = document.querySelector(`[data-capability-card="${id}"]`)?.getBoundingClientRect();
      const panelRect = document.getElementById(`capability-detail-${id}`)?.getBoundingClientRect();
      const rects = [cardRect, panelRect].filter((rect): rect is DOMRect => rect != null);
      if (rects.length === 0) {
        setActive(null);
        return;
      }
      // A small tolerance on every edge: at the exact instant a card
      // activates via a boundary crossing, this same mousemove event can
      // fire with coordinates the browser's native hit-testing already
      // resolved to the new card but that land a sub-pixel short of its
      // measured `getBoundingClientRect()` (observed ~1.4px) — without
      // slack here, that single event would both activate the card (via
      // onMouseEnter) and immediately cancel it (via this check reading
      // the same coordinates as "outside"), most reliably on straight
      // vertical/horizontal crossings like the top-row-panel-to-bottom-row
      // handoff, where every card shares identical boundary geometry.
      const EDGE_TOLERANCE = 4;
      const left = Math.min(...rects.map((rect) => rect.left)) - EDGE_TOLERANCE;
      const right = Math.max(...rects.map((rect) => rect.right)) + EDGE_TOLERANCE;
      const top = Math.min(...rects.map((rect) => rect.top)) - EDGE_TOLERANCE;
      const bottom = Math.max(...rects.map((rect) => rect.bottom)) + EDGE_TOLERANCE;
      if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) {
        setActive(null);
      }
    };
    document.addEventListener('mousemove', onDocumentMouseMove);
    return () => document.removeEventListener('mousemove', onDocumentMouseMove);
  }, [isTouch]);

  // Touch devices have no hover: tapping a card expands it, tapping
  // anywhere else in the grid (or outside it) collapses it again.
  useEffect(() => {
    if (!isTouch || !activeId) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-capability-card]')) setActive(null);
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
        >
          {CAPABILITY_FAMILIES.map((family) => {
            const isActive = activeId === family.id;
            const isDimmed = activeId !== null && !isActive;
            const Icon = CAPABILITY_ICONS[family.id];
            const detailId = `capability-detail-${family.id}`;

            return (
              <motion.div
                key={family.id}
                data-capability-card={family.id}
                className="relative"
                onMouseEnter={() => !isTouch && setActive(family.id)}
                onPointerDown={() => {
                  pointerActivatedRef.current = true;
                }}
                onFocus={() => {
                  if (isTouch && pointerActivatedRef.current) {
                    pointerActivatedRef.current = false;
                    return;
                  }
                  setActive(family.id);
                }}
                onBlur={() => setActive((current) => (current === family.id ? null : current))}
                onClick={() => isTouch && setActive((current) => (current === family.id ? null : family.id))}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setActive(null);
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
                {/* The puck — the only element that ever transforms. Its
                    resting layout box (icon + title, unconditional) never
                    changes, so the outer hit target above never resizes
                    either; only paint-time scale/translate/shadow move. */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.08 : isDimmed ? 0.96 : 1,
                    y: isActive ? -8 : 0,
                    opacity: isDimmed ? 0.85 : 1,
                  }}
                  transition={{ duration: isActive ? 0.32 : 0.25, ease: EASE }}
                  style={{
                    zIndex: isActive ? 20 : 1,
                    transitionProperty: 'border-color, box-shadow',
                    transitionDuration: '300ms',
                    transitionTimingFunction: 'cubic-bezier(0.33,1,0.68,1)',
                  }}
                  className={`relative rounded-2xl border bg-slate-50 p-6 outline-none cursor-default focus-visible:ring-2 focus-visible:ring-violet-400 ${
                    isActive
                      ? 'border-violet-300 shadow-[0_24px_48px_rgba(139,92,246,0.24)]'
                      : isDimmed
                        ? 'border-slate-200 shadow-[0_4px_12px_rgba(15,23,42,0.04)]'
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
                </motion.div>

                {/* The floating panel — never part of layout (position:
                    absolute, outside the puck's own box) and never
                    interactive (pointer-events: none), so it can visually
                    extend over neighboring cards, Wallet/Dock-tooltip
                    style, without ever blocking hover/focus/click on
                    whatever is actually underneath it. Always mounted
                    (harmless — it's out of flow either way) rather than
                    conditionally via AnimatePresence: an exit animation
                    that keeps the real, id-bearing panel around briefly
                    after isActive flips false would otherwise collide with
                    a separately-mounted accessible duplicate carrying the
                    same id. One element, one id, always in the a11y tree;
                    only its opacity communicates active state. */}
                <motion.div
                  id={detailId}
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -6 }}
                  transition={{ duration: isActive ? 0.24 : 0.16, ease: EASE }}
                  style={{ zIndex: 20 }}
                  className="pointer-events-none absolute inset-x-0 top-full mt-2 rounded-2xl border border-violet-200 bg-slate-50 p-5 shadow-[0_20px_44px_rgba(139,92,246,0.2)]"
                >
                  <p className="text-sm leading-relaxed text-slate-500">{family.summary}</p>
                  <motion.div
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 6 }}
                    transition={{ duration: 0.2, ease: EASE, delay: isActive ? 0.1 : 0 }}
                    className="mt-4"
                  >
                    <StatusPill label={family.status} />
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
