
export function DataPipelineAnimation() {
  return (
    <div className="w-full max-w-[420px] aspect-[16/9] flex items-center justify-center">
      <svg viewBox="0 0 800 450" className="w-full h-full">
        <rect width="800" height="450" fill="transparent" />

        <ellipse cx="400" cy="225" rx="220" ry="120" fill="rgba(255,42,42,0.07)" />

        <g transform="translate(90,165)" stroke="rgba(255,255,255,0.8)" fill="none">
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
          />
        </g>

        <path
          d="M 160 225 L 320 225"
          stroke="rgba(255,42,42,0.22)"
          strokeWidth="1.5"
          strokeDasharray="6 8"
          fill="none"
        />

        <g transform="translate(330,150)">
          <rect
            x="0"
            y="0"
            width="140"
            height="100"
            rx="5"
            fill="rgba(18,18,26,0.92)"
            stroke="rgba(255,42,42,0.28)"
            strokeWidth="2"
          />
          <rect
            x="0"
            y="0"
            width="140"
            height="20"
            fill="rgba(28,28,40,0.85)"
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
        </g>

        <g transform="translate(500,195)">
          <rect
            x="0"
            y="0"
            width="130"
            height="16"
            rx="8"
            fill="rgba(65,65,80,0.4)"
            stroke="rgba(255,42,42,0.18)"
          />
          <rect x="6" y="3" width="18" height="10" rx="4" fill="rgba(255,42,42,0.15)" />
          <rect x="36" y="3" width="18" height="10" rx="4" fill="rgba(255,42,42,0.08)" />
          <rect x="66" y="3" width="18" height="10" rx="4" fill="rgba(255,42,42,0.15)" />
          <rect x="96" y="3" width="18" height="10" rx="4" fill="rgba(255,42,42,0.08)" />
        </g>

        <g transform="translate(650,150)">
          <ellipse
            cx="25"
            cy="20"
            rx="12"
            ry="14"
            fill="rgba(18,18,26,0.96)"
            stroke="rgba(255,42,42,0.2)"
            strokeWidth="1"
          />
          <path
            d="M 25 34 L 25 60 L 18 80 L 32 80 L 25 60"
            fill="rgba(18,18,26,0.96)"
            stroke="rgba(255,42,42,0.2)"
            strokeWidth="1"
          />
          <circle cx="20" cy="18" r="2.4" fill="#ff2a2a" />
          <circle cx="30" cy="18" r="2.4" fill="#ff2a2a" />

          <ellipse
            cx="75"
            cy="20"
            rx="12"
            ry="14"
            fill="rgba(18,18,26,0.96)"
            stroke="rgba(255,42,42,0.2)"
            strokeWidth="1"
          />
          <path
            d="M 75 34 L 75 60 L 68 80 L 82 80 L 75 60"
            fill="rgba(18,18,26,0.96)"
            stroke="rgba(255,42,42,0.2)"
            strokeWidth="1"
          />
          <circle cx="70" cy="18" r="2.4" fill="#ff2a2a" />
          <circle cx="80" cy="18" r="2.4" fill="#ff2a2a" />
        </g>

        <rect x="121" y="202" width="16" height="16" rx="2" fill="#ff2a2a" stroke="#ff6b6b" />
        <rect x="380" y="190" width="12" height="12" rx="2" fill="#ff2a2a" />
        <rect x="380" y="210" width="12" height="12" rx="2" fill="#ff2a2a" />
        <rect x="380" y="230" width="12" height="12" rx="2" fill="#ff2a2a" />
        <rect x="570" y="198" width="14" height="14" rx="2" fill="#ff2a2a" />
        <rect x="610" y="198" width="14" height="14" rx="2" fill="#ff2a2a" />

        <text
          x="610"
          y="350"
          fill="rgba(255,42,42,0.85)"
          fontSize="22"
          fontFamily="Orbitron, monospace"
        >
          $
        </text>
        <text
          x="680"
          y="350"
          fill="rgba(255,42,42,0.85)"
          fontSize="22"
          fontFamily="Orbitron, monospace"
        >
          $
        </text>
      </svg>
    </div>
  );
}
