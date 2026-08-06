import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { SectionHeader } from '../enterprise/primitives';
import {
  IdentityIcon,
  IntegrityIcon,
  InteroperabilityIcon,
  PortabilityIcon,
  ProvenanceIcon,
  type IconProps,
} from './CapabilityIcons';

// The Sovereignty section teaches exactly one idea — "a digital asset keeps
// its meaning wherever it goes" — through a two-column composition rather
// than the FAQ-style card grid this used to be. The left column states the
// idea in plain language; the right column is a floating Capability Dock
// (macOS Dock / Apple Wallet register, not a carousel) that lets a visitor
// discover *why* it's true one capability at a time, only on demand.
//
// The dock's hover-expand mechanism is the same battle-tested approach as
// the sibling Capabilities section (CapabilityFamilies.tsx): every visual
// change is transform/opacity/shadow on the tile's own surface (so the
// dock's geometry never moves and no sibling is ever displaced), and the
// floating panel lives outside layout with pointer-events: none, tracked by
// a document-level mousemove against the active tile+panel's live rects
// (not a single onMouseLeave, which a panel extending past its container's
// edge — e.g. the last tile in the stack — can miss entirely once the
// cursor travels further away afterward).
const EASE = [0.33, 1, 0.68, 1] as const;

type SovereigntyCapability = {
  id: string;
  name: string;
  summary: string;
  Icon: (props: IconProps) => ReturnType<typeof IdentityIcon>;
};

const SOVEREIGNTY_CAPABILITIES: SovereigntyCapability[] = [
  {
    id: 'identity',
    name: 'Identity',
    summary: 'A permanent identity of its own — not an account number or a folder path owned by one company.',
    Icon: IdentityIcon,
  },
  {
    id: 'integrity',
    name: 'Integrity',
    summary: "You can always verify it's the original, instead of just trusting whoever handed it to you.",
    Icon: IntegrityIcon,
  },
  {
    id: 'origin',
    name: 'Origin',
    summary: 'You always know where it came from, and everything that has happened to it since.',
    Icon: ProvenanceIcon,
  },
  {
    id: 'portability',
    name: 'Portability',
    summary: 'It still works even if you move it somewhere else — nothing lost, nothing locked in.',
    Icon: PortabilityIcon,
  },
  {
    id: 'compatibility',
    name: 'Compatibility',
    summary: 'Any other compatible system understands it instantly, with no special integration.',
    Icon: InteroperabilityIcon,
  },
];

export function Sovereignty() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  // See CapabilityFamilies.tsx for why a tap must set this before onFocus
  // reads it, and why activeIdRef must be updated synchronously alongside
  // setActiveId rather than in an effect — the raw document mousemove
  // listener below sits outside React's event system and would otherwise
  // read one step behind a fast pointer move between tiles.
  const pointerActivatedRef = useRef(false);
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

  useEffect(() => {
    const onDocumentMouseMove = (event: MouseEvent) => {
      if (isTouch) return;
      const id = activeIdRef.current;
      if (!id) return;
      const tileRect = document.querySelector(`[data-sovereignty-tile="${id}"]`)?.getBoundingClientRect();
      const panelRect = document.getElementById(`sovereignty-detail-${id}`)?.getBoundingClientRect();
      const rects = [tileRect, panelRect].filter((rect): rect is DOMRect => rect != null);
      if (rects.length === 0) {
        setActive(null);
        return;
      }
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

  useEffect(() => {
    if (!isTouch || !activeId) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-sovereignty-tile]') && !target.closest('[data-sovereignty-mobile-tile]')) {
        setActive(null);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isTouch, activeId]);

  const activeMobileCapability = SOVEREIGNTY_CAPABILITIES.find((c) => c.id === activeId) ?? null;

  return (
    <section id="sovereignty" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
      <MotionConfig reducedMotion="user">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:items-center">
          <div className="min-w-0">
            <SectionHeader
              eyebrow="Digital Sovereignty"
              title="A digital asset should keep its meaning wherever it goes."
              description="Files usually don't survive the trip. Copy one, move it to a new app, hand it to someone else — and it quietly loses its history, its authenticity, even its identity along the way. A sovereign asset doesn't. It carries its own proof of what it is and where it came from, so it still means the same thing no matter who's holding it or where it lives."
              mineral="amethyst"
            />
            <p className="hidden sm:block text-sm text-slate-400">Hover a capability to see what it means.</p>
            <p className="sm:hidden text-sm text-slate-400">Tap a capability to see what it means.</p>
          </div>

          {/* Capability Dock — attached-panel version. A vertical stack on
              large screens (the dock "lives to the right"); wraps into a
              two-column grid between sm and lg ("wraps elegantly" on
              tablet). Hidden below sm in favor of the swipeable row. */}
          <div className="hidden min-w-0 sm:grid sm:grid-cols-2 sm:gap-4 lg:flex lg:flex-col lg:gap-4">
            {SOVEREIGNTY_CAPABILITIES.map((capability) => {
              const isActive = activeId === capability.id;
              const isDimmed = activeId !== null && !isActive;
              const { Icon } = capability;
              const detailId = `sovereignty-detail-${capability.id}`;

              return (
                <div
                  key={capability.id}
                  data-sovereignty-tile={capability.id}
                  className="relative"
                  onMouseEnter={() => !isTouch && setActive(capability.id)}
                  onPointerDown={() => {
                    pointerActivatedRef.current = true;
                  }}
                  onFocus={() => {
                    if (isTouch && pointerActivatedRef.current) {
                      pointerActivatedRef.current = false;
                      return;
                    }
                    setActive(capability.id);
                  }}
                  onBlur={() => setActive((current) => (current === capability.id ? null : current))}
                  onClick={() => isTouch && setActive((current) => (current === capability.id ? null : capability.id))}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setActive(null);
                      event.currentTarget.blur();
                    } else if (event.key === ' ' || event.key === 'Spacebar') {
                      event.preventDefault();
                    }
                  }}
                  tabIndex={0}
                  role="group"
                  aria-label={capability.name}
                  aria-expanded={isActive}
                  aria-describedby={detailId}
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.045 : isDimmed ? 0.97 : 1,
                      y: isActive ? -3 : 0,
                      opacity: isDimmed ? 0.85 : 1,
                    }}
                    transition={{ duration: isActive ? 0.32 : 0.25, ease: EASE }}
                    style={{
                      zIndex: isActive ? 20 : 1,
                      transitionProperty: 'border-color, box-shadow',
                      transitionDuration: '300ms',
                      transitionTimingFunction: 'cubic-bezier(0.33,1,0.68,1)',
                    }}
                    className={`relative flex items-center gap-4 rounded-2xl border bg-slate-50 px-5 py-4 outline-none cursor-default focus-visible:ring-2 focus-visible:ring-violet-400 ${
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
                        className="pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(circle_at_22%_25%,rgba(139,92,246,0.16),transparent_65%)]"
                      />
                    )}
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="relative text-sm font-extrabold text-slate-900">{capability.name}</span>
                  </motion.div>

                  {/* Never part of layout, never interactive — see the file
                      header comment for why this is what keeps the dock's
                      geometry perfectly stable regardless of activeId. */}
                  <motion.div
                    id={detailId}
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -6 }}
                    transition={{ duration: isActive ? 0.24 : 0.16, ease: EASE }}
                    style={{ zIndex: 20 }}
                    className="pointer-events-none absolute inset-x-0 top-full mt-2 rounded-2xl border border-violet-200 bg-slate-50 p-5 shadow-[0_20px_44px_rgba(139,92,246,0.2)]"
                  >
                    <p className="text-sm leading-relaxed text-slate-500">{capability.summary}</p>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Mobile: a horizontally swipeable row of tiles, tap to open.
              The expanded panel is a single shared surface directly
              underneath the row — same interaction philosophy, adapted so
              nothing gets clipped by the row's own horizontal scroll. */}
          <div className="sm:hidden">
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-6 px-6 snap-x snap-mandatory no-scrollbar">
              {SOVEREIGNTY_CAPABILITIES.map((capability) => {
                const isActive = activeId === capability.id;
                const { Icon } = capability;
                return (
                  <button
                    key={capability.id}
                    type="button"
                    data-sovereignty-mobile-tile={capability.id}
                    onClick={() => setActive((current) => (current === capability.id ? null : capability.id))}
                    aria-expanded={isActive}
                    aria-controls="sovereignty-mobile-panel"
                    className={`flex shrink-0 snap-start items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                      isActive ? 'border-violet-300 bg-violet-50/60' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 whitespace-nowrap">{capability.name}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {activeMobileCapability ? (
                <motion.div
                  key={activeMobileCapability.id}
                  id="sovereignty-mobile-panel"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="mt-3 rounded-2xl border border-violet-200 bg-slate-50 p-5 shadow-[0_20px_44px_rgba(139,92,246,0.16)]"
                >
                  <p className="text-sm leading-relaxed text-slate-500">{activeMobileCapability.summary}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </MotionConfig>
    </section>
  );
}
