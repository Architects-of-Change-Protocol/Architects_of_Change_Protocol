import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { CapabilityFamily } from '../content';
import { CapabilityMineral } from './CapabilityMineral';
import { useCardInfluence } from './useDockProximity';
import {
  CARD_FLEX_GROW_RANGE,
  CARD_LIFT_RANGE,
  DOCK_CONTENT_TRANSITION,
  DOCK_CONTENT_TRANSITION_REDUCED,
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

/** One capability in the dock. Every visual response to proximity — scale,
 * lift, shadow, border, the mineral's own detail — reads off a single
 * spring-smoothed `influence` value in [0, 1] rather than a fixed
 * hover/not-hover switch, so the row reads as one continuous surface. Only
 * the description's reveal is gated on the discrete `isDominant` flag: the
 * card that actually composes differently (real width via flex-grow, real
 * height via grid-template-rows) rather than just scaling up. */
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
  const flexGrow = useTransform(influence, [0, 1], CARD_FLEX_GROW_RANGE);
  const lift = useTransform(influence, [0, 1], CARD_LIFT_RANGE);
  const boxShadow = useTransform(influence, (inf) => {
    const opacity = SHADOW_OPACITY_RANGE[0] + inf * (SHADOW_OPACITY_RANGE[1] - SHADOW_OPACITY_RANGE[0]);
    return `0 ${10 + inf * 34}px ${20 + inf * 40}px rgba(124,58,237,${opacity})`;
  });
  const borderColor = useTransform(
    influence,
    [0, 1],
    ['rgba(226,232,240,1)', 'rgba(196,181,253,1)'],
  );

  const contentTransition = reducedMotion ? DOCK_CONTENT_TRANSITION_REDUCED : DOCK_CONTENT_TRANSITION;

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
      style={{ flexGrow, y: lift, boxShadow, borderColor }}
      className="relative flex min-w-[110px] shrink-0 basis-0 flex-col items-center rounded-2xl border bg-slate-50 px-4 py-5 text-center outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
    >
      <CapabilityMineral id={capability.id} influence={influence} className="h-11 w-11 shrink-0" />

      <span className="mt-3 text-sm font-extrabold leading-tight text-slate-900">{capability.name}</span>

      <motion.div
        className="grid w-full text-left"
        initial={false}
        animate={{ gridTemplateRows: isDominant ? '1fr' : '0fr', marginTop: isDominant ? 14 : 0 }}
        transition={contentTransition}
      >
        <div id={detailId} className="overflow-hidden">
          <p className="text-[13.5px] leading-relaxed text-slate-500">{capability.summary}</p>
        </div>
      </motion.div>
    </motion.button>
  );
}
