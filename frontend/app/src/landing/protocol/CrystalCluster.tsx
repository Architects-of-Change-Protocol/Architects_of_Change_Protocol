import { useId } from 'react';

type CrystalClusterProps = {
  variant: 'protocol' | 'enterprise';
};

const PALETTE = {
  protocol: {
    glow: 'text-violet-400',
    deep: 'text-violet-800',
    mid: 'text-violet-600',
    light: 'text-violet-300',
    highlight: 'text-violet-100',
  },
  enterprise: {
    glow: 'text-indigo-400',
    deep: 'text-indigo-800',
    mid: 'text-indigo-600',
    light: 'text-indigo-300',
    highlight: 'text-indigo-100',
  },
} as const;

/** A shared faceted formation whose mineral palette identifies its product. */
export function CrystalCluster({ variant }: CrystalClusterProps) {
  const id = useId().replaceAll(':', '');
  const palette = PALETTE[variant];
  const face = `${id}-face`;
  const brightFace = `${id}-bright-face`;
  const glow = `${id}-glow`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 260 220"
      className="h-full w-full overflow-visible"
    >
      <defs>
        <linearGradient id={face} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className={palette.light} stopColor="currentColor" stopOpacity="0.88" />
          <stop offset="0.5" className={palette.mid} stopColor="currentColor" stopOpacity="0.68" />
          <stop offset="1" className={palette.deep} stopColor="currentColor" stopOpacity="0.82" />
        </linearGradient>
        <linearGradient id={brightFace} x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0" className={palette.highlight} stopColor="currentColor" stopOpacity="0.96" />
          <stop offset="0.42" className={palette.light} stopColor="currentColor" stopOpacity="0.72" />
          <stop offset="1" className={palette.mid} stopColor="currentColor" stopOpacity="0.48" />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0" className={palette.glow} stopColor="currentColor" stopOpacity="0.24" />
          <stop offset="1" className={palette.glow} stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="139" cy="143" rx="112" ry="76" fill={`url(#${glow})`} />

      {/* Rear shards establish the cluster silhouette before the central prism. */}
      <g stroke="currentColor" strokeWidth="1" strokeLinejoin="round" className={palette.light}>
        <g opacity="0.7">
          <path d="M31 185 51 107 69 88 82 119 82 187Z" fill={`url(#${face})`} />
          <path d="m51 107 18-19-4 87-14 10Z" className={palette.highlight} fill="currentColor" fillOpacity="0.45" />
          <path d="m69 88 13 31v68l-17-12Z" className={palette.deep} fill="currentColor" fillOpacity="0.52" />
        </g>
        <g opacity="0.76">
          <path d="m176 187 8-89 20-24 18 29 13 82Z" fill={`url(#${face})`} />
          <path d="m184 98 20-24-5 101-23 12Z" fill={`url(#${brightFace})`} />
          <path d="m204 74 18 29 13 82-36-10Z" className={palette.deep} fill="currentColor" fillOpacity="0.56" />
        </g>
      </g>

      {/* Secondary prisms overlap the rear plane for translucent depth. */}
      <g stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" className={palette.light}>
        <g opacity="0.84">
          <path d="m56 188 12-105 23-31 23 35 5 101Z" fill={`url(#${face})`} />
          <path d="m68 83 23-31-4 121-31 15Z" fill={`url(#${brightFace})`} />
          <path d="m91 52 23 35 5 101-32-15Z" className={palette.deep} fill="currentColor" fillOpacity="0.6" />
          <path d="m91 52-4 121" stroke="white" strokeOpacity="0.5" />
        </g>
        <g opacity="0.78">
          <path d="m151 188 7-77 18-24 18 27 7 74Z" fill={`url(#${face})`} />
          <path d="m158 111 18-24-3 90-22 11Z" fill={`url(#${brightFace})`} />
          <path d="m176 87 18 27 7 74-28-11Z" className={palette.deep} fill="currentColor" fillOpacity="0.52" />
        </g>
      </g>

      {/* The dominant architectural prism anchors the shared geometry. */}
      <g stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" className={palette.light}>
        <path d="m93 188 8-137 31-40 32 43 10 134Z" fill={`url(#${face})`} />
        <path d="m101 51 31-40-5 158-34 19Z" fill={`url(#${brightFace})`} />
        <path d="m132 11 32 43 10 134-47-19Z" className={palette.deep} fill="currentColor" fillOpacity="0.66" />
        <path d="m132 11-5 158" stroke="white" strokeOpacity="0.66" />
        <path d="m101 51 26 118-34 19" stroke="white" strokeOpacity="0.22" fill="none" />
      </g>

      {/* Low mineral bed grounds the prisms without reading as a rock. */}
      <path
        d="m25 188 31-16 29 7 27-12 31 10 29-9 28 12 35-5 20 13-19 18H48Z"
        fill={`url(#${face})`}
        className={palette.mid}
        stroke="currentColor"
        strokeOpacity="0.38"
      />
      <path d="m48 188 37-9 27-12 31 10 29-9 28 12 35-5" fill="none" stroke="white" strokeOpacity="0.48" />
    </svg>
  );
}
