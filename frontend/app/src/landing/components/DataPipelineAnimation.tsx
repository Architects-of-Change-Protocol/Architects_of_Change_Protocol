export function DataPipelineAnimation() {
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

          <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="800" height="450" fill="transparent" />

        <ellipse cx="400" cy="225" rx="220" ry="120" fill="rgba(255,42,42,0.14)">
          <animate
            attributeName="rx"
            values="215;230;215"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="ry"
            values="115;125;115"
            dur="3s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* user */}
        <g transform="translate(90,165)" stroke="rgba(255,255,255,0.86)" fill="none">
          <circle cx="40" cy="25" r="15" strokeWidth="2" />
          <path d="M 40 40 L 40 75" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 40 50 L 25 60 M 40 50 L 55 60" strokeWidth="2" strokeLinecap="round" />
          <path d="M 40 75 L 30 105 M 40 75 L 50 105" strokeWidth="2" strokeLinecap="round" />
          <rect
            x="32"
            y="42"
            width="16"
            height="16"
            rx="2"
            fill="#ff2a2a"
            stroke="rgba(255,255,255,0.25)"
          >
            <animate
              attributeName="fill-opacity"
              values="0.6;1;0.6"
              dur="1.3s"
              repeatCount="indefinite"
            />
          </rect>
        </g>

        {/* dotted line */}
        <path
          d="M 160 225 L 320 225"
          stroke="rgba(255,42,42,0.24)"
          strokeWidth="1.5"
          strokeDasharray="6 8"
          fill="none"
        />

        {/* moving packet */}
        <circle r="7" fill="#ff2a2a" filter="url(#redGlow)">
          <animateMotion
            dur="2.2s"
            repeatCount="indefinite"
            path="M 160 225 L 320 225"
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* server */}
        <g transform="translate(330,150)">
          <rect
            x="0"
            y="0"
            width="140"
            height="100"
            rx="5"
            fill="rgba(18,18,26,0.94)"
            stroke="rgba(255,42,42,0.30)"
            strokeWidth="2"
          />
          <rect
            x="0"
            y="0"
            width="140"
            height="20"
            fill="rgba(28,28,40,0.86)"
            stroke="rgba(255,42,42,0.18)"
            strokeWidth="1"
          />
          <rect
            x="30"
            y="35"
            width="80"
            height="50"
            rx="2"
            fill="rgba(0,0,0,0.52)"
            stroke="rgba(255,42,42,0.45)"
            strokeWidth="1.4"
          />
          <line
            x1="0"
            y1="95"
            x2="140"
            y2="95"
            stroke="rgba(255,42,42,0.38)"
            strokeWidth="2"
            strokeDasharray="8 4"
          />
          <circle cx="50" cy="10" r="3" fill="#ff2a2a" />
          <circle cx="70" cy="10" r="3" fill="#ff2a2a" />
          <circle cx="90" cy="10" r="3" fill="#ff2a2a" />

          <rect x="38" y="44" width="10" height="10" rx="2" fill="#ff2a2a">
            <animate attributeName="opacity" values="0.25;1;0.25" dur="1s" repeatCount="indefinite" />
          </rect>
          <rect x="38" y="58" width="10" height="10" rx="2" fill="#ff2a2a">
            <animate attributeName="opacity" values="0.25;1;0.25" dur="1s" begin="0.15s" repeatCount="indefinite" />
          </rect>
          <rect x="38" y="72" width="10" height="10" rx="2" fill="#ff2a2a">
            <animate attributeName="opacity" values="0.25;1;0.25" dur="1s" begin="0.3s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* pipeline */}
        <g transform="translate(500,195)">
          <rect
            x="0"
            y="0"
            width="130"
            height="16"
            rx="8"
            fill="rgba(65,65,80,0.40)"
            stroke="rgba(255,42,42,0.18)"
          />
          <rect x="6" y="3" width="18" height="10" rx="4" fill="rgba(255,42,42,0.15)">
            <animate attributeName="fill" values="rgba(255,42,42,0.10);#ff2a2a;rgba(255,42,42,0.10)" dur="1.2s" repeatCount="indefinite" />
          </rect>
          <rect x="36" y="3" width="18" height="10" rx="4" fill="rgba(255,42,42,0.08)">
            <animate attributeName="fill" values="rgba(255,42,42,0.08);#ff2a2a;rgba(255,42,42,0.08)" dur="1.2s" begin="0.2s" repeatCount="indefinite" />
          </rect>
          <rect x="66" y="3" width="18" height="10" rx="4" fill="rgba(255,42,42,0.15)">
            <animate attributeName="fill" values="rgba(255,42,42,0.10);#ff2a2a;rgba(255,42,42,0.10)" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
          </rect>
          <rect x="96" y="3" width="18" height="10" rx="4" fill="rgba(255,42,42,0.08)">
            <animate attributeName="fill" values="rgba(255,42,42,0.08);#ff2a2a;rgba(255,42,42,0.08)" dur="1.2s" begin="0.6s" repeatCount="indefinite" />
          </rect>
        </g>

        <circle cx="515" cy="203" r="6" fill="#ff2a2a" filter="url(#redGlow)">
          <animateMotion
            dur="2.1s"
            begin="0.2s"
            repeatCount="indefinite"
            path="M 0 0 L 95 0"
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="2.1s"
            begin="0.2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* evil receiver 1 */}
        <g transform="translate(650,150)">
          <ellipse
            cx="25"
            cy="20"
            rx="12"
            ry="14"
            fill="rgba(18,18,26,0.96)"
            stroke="rgba(255,42,42,0.24)"
            strokeWidth="1.2"
          />
          <path
            d="M 25 34 L 25 56"
            stroke="rgba(255,42,42,0.42)"
            strokeWidth="1.8"
            fill="none"
          />
          <path
            d="M 25 42 L 15 50"
            stroke="rgba(255,42,42,0.42)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 25 42 L 35 50"
            stroke="rgba(255,42,42,0.42)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 25 56 L 18 72"
            stroke="rgba(255,42,42,0.42)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 25 56 L 32 72"
            stroke="rgba(255,42,42,0.42)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />

          <circle cx="20" cy="18" r="2.2" fill="#ff2a2a" filter="url(#eyeGlow)">
            <animate attributeName="opacity" values="0.45;1;0.45" dur="1.1s" repeatCount="indefinite" />
          </circle>
          <circle cx="30" cy="18" r="2.2" fill="#ff2a2a" filter="url(#eyeGlow)">
            <animate attributeName="opacity" values="0.45;1;0.45" dur="1.1s" begin="0.12s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* evil receiver 2 */}
        <g transform="translate(700,150)">
          <ellipse
            cx="25"
            cy="20"
            rx="12"
            ry="14"
            fill="rgba(18,18,26,0.96)"
            stroke="rgba(255,42,42,0.24)"
            strokeWidth="1.2"
          />
          <path
            d="M 25 34 L 25 56"
            stroke="rgba(255,42,42,0.42)"
            strokeWidth="1.8"
            fill="none"
          />
          <path
            d="M 25 42 L 15 50"
            stroke="rgba(255,42,42,0.42)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 25 42 L 35 50"
            stroke="rgba(255,42,42,0.42)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 25 56 L 18 72"
            stroke="rgba(255,42,42,0.42)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 25 56 L 32 72"
            stroke="rgba(255,42,42,0.42)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />

          <circle cx="20" cy="18" r="2.2" fill="#ff2a2a" filter="url(#eyeGlow)">
            <animate attributeName="opacity" values="0.45;1;0.45" dur="1.1s" begin="0.25s" repeatCount="indefinite" />
          </circle>
          <circle cx="30" cy="18" r="2.2" fill="#ff2a2a" filter="url(#eyeGlow)">
            <animate attributeName="opacity" values="0.45;1;0.45" dur="1.1s" begin="0.37s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* extra red blocks */}
        <rect x="121" y="202" width="16" height="16" rx="2" fill="#ff2a2a" stroke="#ff6b6b">
          <animate attributeName="opacity" values="0.25;1;0.25" dur="1.2s" repeatCount="indefinite" />
        </rect>
        <rect x="380" y="190" width="12" height="12" rx="2" fill="#ff2a2a">
          <animate attributeName="opacity" values="0.25;1;0.25" dur="1.2s" begin="0.15s" repeatCount="indefinite" />
        </rect>
        <rect x="380" y="210" width="12" height="12" rx="2" fill="#ff2a2a">
          <animate attributeName="opacity" values="0.25;1;0.25" dur="1.2s" begin="0.3s" repeatCount="indefinite" />
        </rect>
        <rect x="380" y="230" width="12" height="12" rx="2" fill="#ff2a2a">
          <animate attributeName="opacity" values="0.25;1;0.25" dur="1.2s" begin="0.45s" repeatCount="indefinite" />
        </rect>
        <rect x="570" y="198" width="14" height="14" rx="2" fill="#ff2a2a">
          <animate attributeName="opacity" values="0.25;1;0.25" dur="1.2s" begin="0.6s" repeatCount="indefinite" />
        </rect>
        <rect x="610" y="198" width="14" height="14" rx="2" fill="#ff2a2a">
          <animate attributeName="opacity" values="0.25;1;0.25" dur="1.2s" begin="0.75s" repeatCount="indefinite" />
        </rect>

        <text
          x="610"
          y="350"
          fill="rgba(255,42,42,0.85)"
          fontSize="22"
          fontFamily="Orbitron, monospace"
        >
          $
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
        </text>
        <text
          x="680"
          y="350"
          fill="rgba(255,42,42,0.85)"
          fontSize="22"
          fontFamily="Orbitron, monospace"
        >
          $
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.25s" repeatCount="indefinite" />
        </text>
      </svg>
    </div>
  );
}
