import type { CompositionCapabilityId } from '../content';

// One hairline glyph per capability, drawn to sit directly on the material
// with no badge, circle or tinted backdrop of its own -- a filled shape here
// would read as a small icon "card" the instant it got a background, which
// is exactly the kind of component-ness this section avoids everywhere
// else. Every glyph is stroke-only (bar a single solid accent dot/line where
// a real minimal mark calls for one), 22x22, currentColor, so it inherits
// whatever ink the caller sets.

type IconProps = { className?: string };

function IdentityIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 22 22" fill="none" className={className} aria-hidden focusable="false">
      <circle cx="11" cy="11" r="6.9" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="11" cy="11" r="2" fill="currentColor" />
    </svg>
  );
}

function IntegrityIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 22 22" fill="none" className={className} aria-hidden focusable="false">
      <path
        d="M11 3.3 17.1 5.5V10.3C17.1 14.2 14.6 17.2 11 18.5 7.4 17.2 4.9 14.2 4.9 10.3V5.5L11 3.3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M8.2 11.1 10 12.9 13.9 8.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OriginIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 22 22" fill="none" className={className} aria-hidden focusable="false">
      <path
        d="M11 18.7C14.4 14.9 16.1 12 16.1 9.4A5.1 5.1 0 1 0 5.9 9.4C5.9 12 7.6 14.9 11 18.7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="9.2" r="1.9" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function CapabilitiesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 22 22" fill="none" className={className} aria-hidden focusable="false">
      <polygon
        points="11,3.4 17.3,7.1 17.3,14.5 11,18.2 4.7,14.5 4.7,7.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M11 3.4V10.8M11 10.8 17.3 7.1M11 10.8 4.7 7.1M11 10.8V18.2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
    </svg>
  );
}

function PortabilityIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 22 22" fill="none" className={className} aria-hidden focusable="false">
      <rect x="2.4" y="8.1" width="5.6" height="5.8" rx="1.15" stroke="currentColor" strokeWidth="1.4" />
      <rect x="14" y="8.1" width="5.6" height="5.8" rx="1.15" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.6 11h4.6M11.3 8.9l2.1 2.1-2.1 2.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CompatibilityIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 22 22" fill="none" className={className} aria-hidden focusable="false">
      <circle cx="8.4" cy="11" r="5.7" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="13.6" cy="11" r="5.7" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

const COMPOSITION_ICON_COMPONENTS: Record<CompositionCapabilityId, (props: IconProps) => ReturnType<typeof IdentityIcon>> = {
  identity: IdentityIcon,
  integrity: IntegrityIcon,
  origin: OriginIcon,
  capabilities: CapabilitiesIcon,
  portability: PortabilityIcon,
  compatibility: CompatibilityIcon,
};

export function CompositionIcon({ id, className }: { id: CompositionCapabilityId; className?: string }) {
  const Icon = COMPOSITION_ICON_COMPONENTS[id];
  return <Icon className={className} />;
}
