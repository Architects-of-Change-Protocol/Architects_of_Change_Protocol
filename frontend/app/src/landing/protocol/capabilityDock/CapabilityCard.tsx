import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { CapabilityFamily } from '../content';
import { CapabilityMineral } from './CapabilityMineral';
import { useCardInfluence } from './useDockProximity';
import {
  CARD_COMPACT_SCALE_RANGE,
  CARD_EXPANDED_WIDTH_PX,
  CARD_LIFT_RANGE,
  DOCK_CONTENT_TRANSITION,
  DOCK_CONTENT_TRANSITION_REDUCED,
  OVERLAY_ENTER_SCALE,
  SHADOW_OPACITY_RANGE,
  type CapabilityId,
} from './dockTokens';

export type CapabilityCardProps = {
  capability: CapabilityFamily & { id: CapabilityId };
  index: number;
  isDominant: boolean;
  reducedMotion: boolean;
  pointerX: MotionValue<number | null>;
  getCenterX: (index: number) => number;
  tabIndex: number;
  detailId: string;
  onFocusCard: (index: number) => void;
  onActivate: (index: number) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => void;
  registerCard: (el: HTMLButtonElement | null) => void;
};

/**
 * One capability in the dock.
 *
 * Architecture (layout-stable Dock):
 * - FIXED layout slot: equal flex column; compact mineral + name only.
 * - COMPACT surface: native typography/mineral size; continuous compositor
 *   transforms only (scale ~1→1.12, lift, shadow, border) from influence.
 * - DOMINANT overlay: absolute, fixed expanded width (~300px), out of
 *   document flow. Contains mineral + name (aria-hidden duplicates) + the
 *   single accessible description. Opacity/scale crossfade only — no layout
 *   width/height animation driven by the pointer.
 *
 * Pointer motion never changes document flow. Description text width is
 * constant, so line wrapping is invariant while the pointer moves.
 */
export function CapabilityCard({
  capability,
  index,
  isDominant,
  reducedMotion,
  pointerX,
  getCenterX,
  tabIndex,
  detailId,
  onFocusCard,
  onActivate,
  onKeyDown,
  registerCard,
}: CapabilityCardProps) {
  const influence = useCardInfluence(pointerX, () => getCenterX(index), reducedMotion);

  const scale = useTransform(influence, [0, 1], CARD_COMPACT_SCALE_RANGE);
  const lift = useTransform(influence, [0, 1], CARD_LIFT_RANGE);
  const boxShadow = useTransform(influence, (inf) => {
    const opacity =
      SHADOW_OPACITY_RANGE[0] +
      inf * (SHADOW_OPACITY_RANGE[1] - SHADOW_OPACITY_RANGE[0]);
    return `0 ${10 + inf * 34}px ${20 + inf * 40}px rgba(124,58,237,${opacity})`;
  });
  const borderColor = useTransform(
    influence,
    [0, 1],
    ['rgba(226,232,240,1)', 'rgba(196,181,253,1)'],
  );

  const contentTransition = reducedMotion
    ? DOCK_CONTENT_TRANSITION_REDUCED
    : DOCK_CONTENT_TRANSITION;

  return (
    <motion.button
      type="button"
      ref={registerCard}
      data-capability-card={capability.id}
      aria-expanded={isDominant}
      aria-describedby={detailId}
      tabIndex={tabIndex}
      onFocus={() => onFocusCard(index)}
      onClick={() => onActivate(index)}
      onKeyDown={(event) => onKeyDown(event, index)}
      // Layout slot is equal-flex and compact only — no pointer-driven
      // flexGrow / width / height. z-index lifts the active slot so the
      // absolute overlay paints above neighbors.
      style={{ zIndex: isDominant ? 30 : 1 }}
      className="group relative flex min-w-0 flex-1 basis-0 flex-col items-center justify-end outline-none cursor-pointer"
    >
      {/* ── COMPACT SURFACE (in-flow, defines layout footprint) ─────────── */}
      <motion.div
        data-visual-surface="compact"
        className="relative z-0 flex w-full flex-col items-center rounded-2xl border bg-slate-50 px-3 py-5 text-center group-focus-visible:ring-2 group-focus-visible:ring-violet-400 group-focus-visible:ring-offset-2"
        style={{
          scale,
          y: lift,
          boxShadow,
          borderColor,
          transformOrigin: 'bottom center',
        }}
        initial={false}
        animate={{ opacity: isDominant ? 0 : 1 }}
        transition={contentTransition}
      >
        <CapabilityMineral
          id={capability.id}
          influence={influence}
          className="h-11 w-11 shrink-0"
        />
        {/* Single accessible name — overlay's copy is aria-hidden. */}
        <span className="mt-3 text-sm font-extrabold leading-tight text-slate-900">
          {capability.name}
        </span>
      </motion.div>

      {/* ── DOMINANT OVERLAY (absolute, fixed width, out of flow) ──────── */}
      <motion.div
        data-visual-surface="overlay"
        className="absolute bottom-0 left-1/2 z-10 flex flex-col items-center rounded-2xl border border-violet-300 bg-slate-50 px-4 py-5 text-center shadow-[0_20px_44px_rgba(139,92,246,0.18)] group-focus-visible:ring-2 group-focus-visible:ring-violet-400 group-focus-visible:ring-offset-2"
        style={{
          width: CARD_EXPANDED_WIDTH_PX,
          x: '-50%',
          transformOrigin: 'bottom center',
          // Clicks pass through when hidden; when dominant the parent button
          // still receives events from the expanded visual area via stacking.
          pointerEvents: isDominant ? 'auto' : 'none',
        }}
        initial={false}
        animate={{
          opacity: isDominant ? 1 : 0,
          scale: isDominant ? 1 : OVERLAY_ENTER_SCALE,
          y: isDominant ? -4 : 0,
        }}
        transition={contentTransition}
      >
        {/* Decorative duplicates — excluded from AT and Testing Library defaults. */}
        <div aria-hidden="true" className="flex flex-col items-center">
          <CapabilityMineral
            id={capability.id}
            influence={influence}
            className="h-11 w-11 shrink-0"
          />
          <span className="mt-3 text-sm font-extrabold leading-tight text-slate-900">
            {capability.name}
          </span>
        </div>

        {/*
          Single description node for aria-describedby. Always mounted so
          the accessibility tree resolves even while visually collapsed
          (opacity 0 on the parent overlay). Fixed parent width keeps line
          breaks invariant during pointer motion.
        */}
        <div id={detailId} className="mt-3.5 w-full text-left">
          <p className="text-[13.5px] leading-relaxed text-slate-500">
            {capability.summary}
          </p>
        </div>
      </motion.div>
    </motion.button>
  );
}
