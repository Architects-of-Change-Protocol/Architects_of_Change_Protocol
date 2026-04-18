export function BlindTrustIllustration() {
  return (
    <div className="w-full max-w-[470px] aspect-[16/9] flex items-center justify-center">
      <svg viewBox="0 0 800 450" className="w-full h-full">
        <defs>
          <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="800" height="450" fill="transparent" />

        {/* soft cyan halo */}
        <ellipse cx="390" cy="220" rx="220" ry="120" fill="rgba(0,240,255,0.08)">
          <animate attributeName="rx" values="214;226;214" dur="3s" repeatCount="indefinite" />
          <animate attributeName="ry" values="116;124;116" dur="3s" repeatCount="indefinite" />
        </ellipse>

        {/* USER WITH BLINDFOLD */}
        <g transform="translate(120,150)" stroke="rgba(255,255,255,0.9)" fill="none">
          <circle cx="40" cy="20" r="16" strokeWidth="2" />
          <line x1="40" y1="36" x2="40" y2="82" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="40" y1="50" x2="18" y2="65" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="50" x2="62" y2="65" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="82" x2="26" y2="118" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="82" x2="54" y2="118" strokeWidth="2" strokeLinecap="round" />

          {/* blindfold */}
          <rect x="24" y="14" width="32" height="7" rx="3.5" fill="rgba(255,255,255,0.95)" stroke="none">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="1.8s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* visible trust flow */}
        <path
          d="M 185 220 L 320 220"
          stroke="rgba(0,240,255,0.22)"
          strokeWidth="2"
          strokeDasharray="7 8"
          fill="none"
        />

        <circle r="5" fill="#00f0ff" filter="url(#cyanGlow)">
          <animateMotion dur="2.2s" repeatCount="indefinite" path="M 185 220 L 320 220" />
          <animate attributeName="opacity" values="0;1;1;0" dur="2.2s" repeatCount="indefinite" />
        </circle>

        {/* TRUST PANEL */}
        <g transform="translate(330,150)">
          <rect
            x="0"
            y="0"
            width="150"
            height="110"
            rx="12"
            fill="rgba(15,18,24,0.95)"
            stroke="rgba(0,240,255,0.28)"
            strokeWidth="2"
          />
          <rect x="18" y="20" width="88" height="7" rx="3.5" fill="rgba(255,255,255,0.12)" />
          <rect x="18" y="36" width="108" height="7" rx="3.5" fill="rgba(255,255,255,0.09)" />
          <rect x="18" y="52" width="76" height="7" rx="3.5" fill="rgba(255,255,255,0.12)" />

          {/* pretty trust button */}
          <rect
            x="18"
            y="74"
            width="74"
            height="22"
            rx="11"
            fill="rgba(0,240,255,0.14)"
            stroke="rgba(0,240,255,0.42)"
            filter="url(#cyanGlow)"
          >
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
          </rect>

          <text
            x="55"
            y="89"
            textAnchor="middle"
            fill="rgba(255,255,255,0.92)"
            fontSize="11"
            fontWeight="700"
            letterSpacing="0.8"
          >
            TRUST
          </text>

          {/* fake safe badge */}
          <rect x="105" y="74" width="28" height="22" rx="6" fill="rgba(255,255,255,0.06)" />
          <circle cx="119" cy="85" r="6" stroke="rgba(0,240,255,0.7)" strokeWidth="1.4" fill="none" />
        </g>

        {/* hidden extraction path behind trust */}
        <path
          d="M 405 205 Q 520 150 620 165"
          stroke="rgba(255,42,42,0.30)"
          strokeWidth="1.8"
          strokeDasharray="5 8"
          fill="none"
        />

        <circle r="4.5" fill="#ff2a2a" filter="url(#redGlow)">
          <animateMotion
            dur="2.6s"
            begin="0.8s"
            repeatCount="indefinite"
            path="M 405 205 Q 520 150 620 165"
          />
          <animate attributeName="opacity" values="0;0;1;1;0" dur="2.6s" begin="0.8s" repeatCount="indefinite" />
        </circle>

        {/* hidden actor */}
        <g transform="translate(645,138)">
          <ellipse
            cx="22"
            cy="18"
            rx="12"
            ry="14"
            fill="rgba(20,20,30,0.95)"
            stroke="rgba(255,42,42,0.24)"
            strokeWidth="1.2"
          />
          <path
            d="M 22 32 L 22 68 L 10 92 M 22 68 L 34 92 M 22 46 L 8 58 M 22 46 L 36 58"
            stroke="rgba(32,32,42,0.82)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="17" cy="15" r="2.1" fill="#ff2a2a" filter="url(#redGlow)">
            <animate attributeName="opacity" values="0.55;1;0.55" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="27" cy="15" r="2.1" fill="#ff2a2a" filter="url(#redGlow)">
            <animate attributeName="opacity" values="0.55;1;0.55" dur="1.4s" begin="0.16s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* no visibility label */}
        <g transform="translate(520,245)">
          <rect
            x="0"
            y="0"
            width="92"
            height="24"
            rx="12"
            fill="rgba(255,42,42,0.10)"
            stroke="rgba(255,42,42,0.34)"
          >
            <animate attributeName="opacity" values="0.45;0.85;0.45" dur="2.2s" repeatCount="indefinite" />
          </rect>
          <text
            x="46"
            y="16"
            textAnchor="middle"
            fill="#ff4a4a"
            fontSize="10"
            fontWeight="700"
            letterSpacing="1"
          >
            NO VISIBILITY
          </text>
        </g>

        {/* subtle confusion ring around panel */}
        <ellipse
          cx="405"
          cy="205"
          rx="118"
          ry="74"
          stroke="rgba(0,240,255,0.12)"
          strokeWidth="1.4"
          fill="none"
          strokeDasharray="10 10"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 405 205;360 405 205"
            dur="16s"
            repeatCount="indefinite"
          />
        </ellipse>
      </svg>
    </div>
  );
}
