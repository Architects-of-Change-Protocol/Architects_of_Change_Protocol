import { useId } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import {
  CAPABILITY_CRYSTALS,
  CRYSTAL_VIEWBOX,
  MINERAL_SCALE_RANGE,
  type CapabilityId,
} from './dockTokens';

function pointsToString(points: [number, number][]): string {
  return points.map(([x, y]) => `${x},${y}`).join(' ');
}

export type CapabilityMineralProps = {
  id: CapabilityId;
  /** 0 (at rest) to 1 (dominant) — a spring-smoothed motion value shared with
   * the rest of the card, so the mineral, the card surface and the layout
   * all move as one thing rather than three independently-timed pieces. */
  influence: MotionValue<number>;
  className?: string;
};

/** The mineral figure for one capability — a faceted crystal silhouette
 * built from the shared geometry in dockTokens.ts. At rest it is a small,
 * low-detail marker (dim facets, no glint); as `influence` rises toward 1 it
 * gains facet definition, a refraction highlight and a fractional scale —
 * never a spin or a loop, just more presence. */
export function CapabilityMineral({ id, influence, className }: CapabilityMineralProps) {
  const gradientId = useId();
  const spec = CAPABILITY_CRYSTALS[id];

  const scale = useTransform(influence, [0, 1], MINERAL_SCALE_RANGE);
  const facetOpacity = useTransform(influence, [0, 1], [0.22, 1]);
  const glintOpacity = useTransform(influence, [0, 1], [0, 0.9]);
  const strokeOpacity = useTransform(influence, [0, 1], [0.55, 1]);
  const twinOpacity = useTransform(influence, [0, 1], [0.4, 0.85]);

  return (
    <motion.svg
      viewBox={CRYSTAL_VIEWBOX}
      className={className}
      style={{ scale }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${gradientId}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.18" />
        </linearGradient>
        <radialGradient id={`${gradientId}-glint`} cx={spec.glint[0] / 64} cy={spec.glint[1] / 80} r="0.55">
          <stop offset="0%" stopColor="#f5f3ff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#f5f3ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {spec.twinOutline ? (
        <motion.polygon
          points={pointsToString(spec.twinOutline)}
          fill={`url(#${gradientId}-body)`}
          stroke="currentColor"
          strokeWidth={1.3}
          vectorEffect="non-scaling-stroke"
          style={{ opacity: twinOpacity }}
          className="text-violet-400"
        />
      ) : null}

      <polygon
        points={pointsToString(spec.outline)}
        fill={`url(#${gradientId}-body)`}
        stroke="currentColor"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        className="text-violet-600"
      />

      {spec.facets.map(([from, to], index) => (
        <motion.line
          key={index}
          x1={from[0]}
          y1={from[1]}
          x2={to[0]}
          y2={to[1]}
          stroke="currentColor"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          style={{ opacity: facetOpacity }}
          className="text-violet-500"
        />
      ))}

      <motion.polygon
        points={pointsToString(spec.outline)}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        style={{ opacity: strokeOpacity }}
        className="text-violet-700"
      />

      <motion.circle
        cx={spec.glint[0]}
        cy={spec.glint[1]}
        r={10}
        fill={`url(#${gradientId}-glint)`}
        style={{ opacity: glintOpacity }}
      />
    </motion.svg>
  );
}
