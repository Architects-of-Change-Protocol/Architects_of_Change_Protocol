export function BlindTrustAnimation() {
  return (
    <div className="w-full max-w-[420px] aspect-[16/9] flex items-center justify-center">
      <svg viewBox="0 0 800 450" className="w-full h-full">
        <defs>
          <radialGradient id="trustGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff2a2a" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ff2a2a" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="800" height="450" fill="transparent" />
        <ellipse cx="395" cy="225" rx="240" ry="140" fill="url(#trustGlow)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </ellipse>

        {/* stick figure */}
        <g transform="translate(95,145)" stroke="rgba(255,255,255,0.85)" fill="none">
          <circle cx="40" cy="25" r="15" strokeWidth="2" />
          <path d="M 40 40 L 40 75" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 40 50 L 25 60 M 40 50 L 55 60" strokeWidth="2" strokeLinecap="round" />
          <path d="M 40 75 L 30 105 M 40 75 L 50 105" strokeWidth="2" strokeLinecap="round" />
          <rect x="26" y="19" width="28" height="8" rx="3" fill="#ff2a2a">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1.2s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* moving arm connection pulse */}
        <path
          d="M 185 220 C 240 205, 285 205, 338 212"
          stroke="rgba(255,255,255,0.68)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 185 220 C 240 205, 285 205, 338 212"
          stroke="#ff2a2a"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="10 10"
        >
          <animate attributeName="stroke-dashoffset" values="0;-40" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" />
        </path>

        {/* trust node */}
        <g transform="translate(340,210)">
          <circle cx="0" cy="0" r="11" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.75)" strokeWidth="2" />
          <circle cx="0" cy="0" r="4" fill="#ff2a2a">
            <animate attributeName="opacity" values="0.45;1;0.45" dur="1s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* deceptive entity floats */}
        <g transform="translate(430,120)">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="430 120; 430 112; 430 120"
            dur="2.2s"
            repeatCount="indefinite"
          />
          <path
            d="M 0 32 L 34 14 L 68 32 L 68 92 C 68 118 50 136 34 146 C 18 136 0 118 0 92 Z"
            fill="rgba(10,10,14,0.96)"
            stroke="#ff2a2a"
            strokeWidth="3"
          />
          <circle cx="23" cy="60" r="6" fill="#ff2a2a">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1.1s" repeatCount="indefinite" />
          </circle>
          <circle cx="45" cy="60" r="6" fill="#ff2a2a">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1.1s" begin="0.15s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* surrounding shapes pulse */}
        <g opacity="0.45" stroke="rgba(180,180,210,0.55)" fill="none">
          <g>
            <animateTransform attributeName="transform" type="rotate" values="0 620 70; 360 620 70" dur="12s" repeatCount="indefinite" />
            <circle cx="620" cy="70" r="34" strokeWidth="2" />
            <circle cx="620" cy="70" r="5" fill="rgba(220,220,240,0.75)" stroke="none" />
          </g>

          <g>
            <animateTransform attributeName="transform" type="rotate" values="0 712 186; -360 712 186" dur="14s" repeatCount="indefinite" />
            <polygon points="650,150 712,118 772,152 772,222 712,256 650,222" strokeWidth="2" />
            <circle cx="712" cy="186" r="4.5" fill="rgba(220,220,240,0.75)" stroke="none" />
          </g>

          <g>
            <animateTransform attributeName="transform" type="rotate" values="0 758 309; 360 758 309" dur="10s" repeatCount="indefinite" />
            <polygon points="735,270 795,286 780,344 720,328" strokeWidth="2" />
            <circle cx="758" cy="309" r="4.5" fill="rgba(220,220,240,0.75)" stroke="none" />
          </g>
        </g>

        {/* heartbeat */}
        <g transform="translate(125,336)">
          <path
            d="M 0 24 L 20 24 L 28 6 L 40 42 L 52 18 L 64 30 L 82 8 L 102 24"
            stroke="#ff2a2a"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <animate attributeName="opacity" values="0.45;1;0.45" dur="1s" repeatCount="indefinite" />
          </path>
          <ellipse cx="50" cy="28" rx="48" ry="16" fill="rgba(255,42,42,0.10)">
            <animate attributeName="opacity" values="0.2;0.55;0.2" dur="1s" repeatCount="indefinite" />
          </ellipse>
        </g>

        <text
          x="548"
          y="98"
          fill="rgba(255,42,42,0.42)"
          fontSize="18"
          letterSpacing="6"
          fontFamily="Orbitron, monospace"
        >
          DECEPTION
        </text>

        <text
          x="104"
          y="392"
          fill="rgba(255,42,42,0.18)"
          fontSize="15"
          letterSpacing="6"
          fontFamily="Orbitron, monospace"
        >
          BLIND ASSUMPTION
        </text>

        {/* reset trust button pulse */}
        <g transform="translate(120,410)">
          <rect
            x="0"
            y="0"
            width="188"
            height="52"
            fill="rgba(20,10,10,0.75)"
            stroke="#ff2a2a"
            strokeWidth="2"
          >
            <animate attributeName="fill-opacity" values="0.7;0.95;0.7" dur="1.3s" repeatCount="indefinite" />
          </rect>
          <text
            x="94"
            y="33"
            textAnchor="middle"
            fill="rgba(255,255,255,0.9)"
            fontSize="18"
            letterSpacing="4"
            fontFamily="Orbitron, monospace"
          >
            RESET TRUST
          </text>
        </g>
      </svg>
    </div>
  );
}
