// Minimal line-icon set for the eight capability families (CapabilityFamilies.tsx).
// Deliberately abstract and geometric — same register as NodeGlyph in
// ../enterprise/primitives.tsx — rather than illustrative, so the resting
// grid reads as a set of precise sculptural marks, not clip-art.

import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IdentityIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8.5" r="3.25" />
      <path d="M5.5 20c0-3.6 3-6.25 6.5-6.25s6.5 2.65 6.5 6.25" />
    </svg>
  );
}

export function IntegrityIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5l6.5 2.6v5.1c0 4.6-2.9 7.7-6.5 9.3-3.6-1.6-6.5-4.7-6.5-9.3V6.1L12 3.5z" />
      <path d="M9 12.2l2 2 4-4.2" />
    </svg>
  );
}

export function ProvenanceIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 3.5h7l4 4v13a1 1 0 01-1 1h-10a1 1 0 01-1-1v-16a1 1 0 011-1z" />
      <path d="M13.5 3.5v4h4" />
      <path d="M8.5 12.5h7M8.5 15.5h7M8.5 9.5h3" />
    </svg>
  );
}

export function PortabilityIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 8.5h15v11a1 1 0 01-1 1h-13a1 1 0 01-1-1v-11z" />
      <path d="M8 8.5V6a2 2 0 012-2h4a2 2 0 012 2v2.5" />
      <path d="M9.5 13l2.5 2.5L14.5 13" />
      <path d="M12 15.5v-5" />
    </svg>
  );
}

export function InteroperabilityIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9.25" cy="12" r="5" />
      <circle cx="14.75" cy="12" r="5" />
    </svg>
  );
}

export function VerifiabilityIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.25 12.3l2.6 2.6 5.1-5.5" />
    </svg>
  );
}

export function LicensingIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 12V4.5a1 1 0 011-1h7.5l8.5 8.5-8.5 8.5-8.5-8.5z" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  );
}

export function GovernanceCompatibilityIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5v17" />
      <path d="M4.5 7h15" />
      <path d="M4.5 7l-2.75 5.5h5.5L4.5 7z" />
      <path d="M19.5 7l-2.75 5.5h5.5L19.5 7z" />
      <path d="M8.5 20.5h7" />
    </svg>
  );
}
