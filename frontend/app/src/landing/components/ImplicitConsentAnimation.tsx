export function ImplicitConsentAnimation() {
  return (
    <div className="w-full max-w-[470px] aspect-[16/9] flex items-center justify-center">
      <svg viewBox="0 0 800 450" className="w-full h-full">
        <defs>
          <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="800" height="450" fill="transparent" />

        {/* ambient halo */}
        <ellipse cx="400" cy="225" rx="215" ry="118" fill="rgba(255,42,42,0.10)">
          <animate attributeName="rx" values="208;222;208" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="ry" values="112;124;112" dur="3.2s" repeatCount="indefinite" />
        </ellipse>

        {/* user */}
        <g transform="translate(90,165)" stroke="rgba(255,255,255,0.86)" fill="none">
          <circle cx="40" cy="25" r="15" strokeWidth="2" />
          <path d="M 40 40 L 40 75" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 40 50 L 25 60 M 40 50 L 55 60" strokeWidth="2" strokeLinecap="round" />
          <path d="M 40 75 L 30 105 M 40 75 L 50 105" strokeWidth="2" strokeLinecap="round" />

          {/* passive cursor / no real action */}
          <circle cx="84" cy="58" r="3.5" fill="#ff2a2a" filter="url(#softGlow)">
            <animate attributeName="opacity" values="0.15;0.5;0.15" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* dotted implied path */}
        <path
          d="M 160 225 L 300 225"
          stroke="rgba(255,42,42,0.22)"
          strokeWidth="1.5"
          strokeDasharray="6 8"
          fill="none"
        />

        {/* creeping consent packet */}
        <circle r="6" fill="#ff2a2a" filter="url(#redGlow)">
          <animateMotion
            dur="2.4s"
            repeatCount="indefinite"
            path="M 160 225 L 300 225"
          />
          <animate attributeName="opacity" values="0;1;1;0" dur="2.4s" repeatCount="indefinite" />
        </circle>

        {/* consent modal / terms panel */}
        <g transform="translate(310,120)">
          <rect
            x="0"
            y="0"
            width="190"
            height="175"
            rx="12"
            fill="rgba(18,18,26,0.96)"
            stroke="rgba(255,42,42,0.26)"
            strokeWidth="2"
          />

          {/* header */}
          <rect
            x="0"
            y="0"
            width="190"
            height="28"
            rx="12"
            fill="rgba(26,26,38,0.92)"
          />
          <circle cx="18" cy="14" r="3" fill="#ff2a2a" />
          <circle cx="32" cy="14" r="3" fill="#ff2a2a" />
          <circle cx="46" cy="14" r="3" fill="#ff2a2a" />

          {/* terms lines */}
          <rect x="20" y="48" width="120" height="6" rx="3" fill="rgba(255,255,255,0.10)" />
          <rect x="20" y="64" width="142" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
          <rect x="20" y="80" width="130" height="6" rx="3" fill="rgba(255,255,255,0.10)" />
          <rect x="20" y="96" width="110" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
          <rect x="20" y="112" width="138" height="6" rx="3" fill="rgba(255,255,255,0.10)" />

          {/* checkbox area */}
          <rect x="20" y="134" width="18" height="18" rx="4" fill="rgba(0,0,0,0.35)" stroke="rgba(255,42,42,0.35)" />
          <path
            d="M 24 143 L 29 148 L 35 138"
            fill="none"
            stroke="#ff2a2a"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0"
          >
            <animate attributeName="opacity" values="0;0;1;1;1;0" dur="2.4s" repeatCount="indefinite" />
          </path>

          {/* auto consent toggle */}
          <rect x="122" y="136" width="46" height="16" rx="8" fill="rgba(255,42,42,0.16)" stroke="rgba(255,42,42,0.22)" />
          <circle cx="130" cy="144" r="6" fill="#ff2a2a" filter="url(#softGlow)">
            <animate attributeName="cx" values="130;130;160;160;160;130" dur="2.4s" repeatCount="indefinite" />
          </circle>

          {/* accepted stamp */}
          <g transform="translate(108,52) rotate(-12)">
            <rect
              x="0"
              y="0"
              width="62"
              height="22"
              rx="4"
              fill="rgba(255,42,42,0.10)"
              stroke="rgba(255,42,42,0.50)"
              strokeWidth="1.5"
              opacity="0"
            >
              <animate attributeName="opacity" values="0;0;0.95;0.95;0.95;0" dur="2.4s" repeatCount="indefinite" />
            </rect>
            <text
              x="31"
              y="15"
              textAnchor="middle"
              fill="#ff2a2a"
              fontSize="10"
              fontWeight="700"
              letterSpacing="1"
              opacity="0"
            >
              ACCEPTED
              <animate attributeName="opacity" values="0;0;1;1;1;0" dur="2.4s" repeatCount="indefinite" />
            </text>
          </g>
        </g>

        {/* leak to the right */}
        <path
          d="M 500 225 L 620 225"
          stroke="rgba(255,42,42,0.18)"
          strokeWidth="2"
          strokeDasharray="7 8"
          fill="none"
        />

        <circle r="6" fill="#ff2a2a" filter="url(#redGlow)">
          <animateMotion
            dur="2.4s"
            begin="1.1s"
            repeatCount="indefinite"
            path="M 500 225 L 620 225"
          />
          <animate attributeName="opacity" values="0;0;1;1;0" dur="2.4s" repeatCount="indefinite" />
        </circle>

        {/* silent recipient / system actor */}
        <g transform="translate(655,150)">
          <ellipse
            cx="25"
            cy="20"
            rx="12"
            ry="14"
            fill="rgba(18,18,26,0.96)"
            stroke="rgba(255,42,42,0.24)"
            strokeWidth="1.2"
          />
          <path d="M 25 34 L 25 56" stroke="rgba(255,42,42,0.42)" strokeWidth="1.8" fill="none" />
          <path d="M 25 42 L 15 50" stroke="rgba(255,42,42,0.42)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M 25 42 L 35 50" stroke="rgba(255,42,42,0.42)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M 25 56 L 18 72" stroke="rgba(255,42,42,0.42)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M 25 56 L 32 72" stroke="rgba(255,42,42,0.42)" strokeWidth="1.6" fill="none" strokeLinecap="round" />

          <circle cx="20" cy="18" r="2.1" fill="#ff2a2a" filter="url(#softGlow)">
            <animate attributeName="opacity" values="0.35;1;0.35" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="30" cy="18" r="2.1" fill="#ff2a2a" filter="url(#softGlow)">
            <animate attributeName="opacity" values="0.35;1;0.35" dur="1.2s" begin="0.12s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* passive status dots */}
        <circle cx="710" cy="250" r="4" fill="#ff2a2a" filter="url(#softGlow)">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="732" cy="266" r="3.2" fill="#ff2a2a">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.6s" begin="0.25s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
