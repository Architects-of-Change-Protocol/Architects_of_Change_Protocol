export function InvisibleAccessAnimation() {
  return (
    <div className="w-full max-w-[420px] aspect-[16/9] flex items-center justify-center">
      <svg viewBox="0 0 800 450" className="w-full h-full">
        <defs>
          <radialGradient id="vaultGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4de3ff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#4de3ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="800" height="450" fill="transparent" />

        {/* faint cyan vault glow */}
        <ellipse cx="410" cy="235" rx="150" ry="100" fill="url(#vaultGlow)" />

        {/* stick figure */}
        <g transform="translate(120,155)" stroke="rgba(255,255,255,0.82)" fill="none">
          <circle cx="40" cy="25" r="15" strokeWidth="2" />
          <path d="M 40 40 L 40 75" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 40 50 L 25 60 M 40 50 L 55 60" strokeWidth="2" strokeLinecap="round" />
          <path d="M 40 75 L 30 105 M 40 75 L 50 105" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* shadow observer behind user */}
        <g opacity="0.28" transform="translate(210,165)">
          <ellipse cx="28" cy="20" rx="13" ry="15" fill="rgba(80,90,120,0.4)" />
          <path
            d="M 28 35 L 28 64 L 20 84 L 36 84 L 28 64"
            fill="rgba(80,90,120,0.28)"
          />
          <circle cx="23" cy="19" r="2.2" fill="#ff2a2a">
            <animate attributeName="opacity" values="0.15;0.8;0.15" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="33" cy="19" r="2.2" fill="#ff2a2a">
            <animate attributeName="opacity" values="0.15;0.8;0.15" dur="1.8s" begin="0.2s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* vault cube */}
        <g transform="translate(340,150)">
          <polygon
            points="100,30 150,58 100,86 50,58"
            fill="rgba(120,200,220,0.10)"
            stroke="rgba(160,230,255,0.75)"
            strokeWidth="2"
          />
          <polygon
            points="50,58 100,86 100,150 50,122"
            fill="rgba(90,160,180,0.10)"
            stroke="rgba(160,230,255,0.6)"
            strokeWidth="2"
          />
          <polygon
            points="100,86 150,58 150,122 100,150"
            fill="rgba(50,120,150,0.08)"
            stroke="rgba(160,230,255,0.45)"
            strokeWidth="2"
          />

          {/* lock */}
          <g transform="translate(85,86)">
            <rect
              x="0"
              y="14"
              width="30"
              height="26"
              rx="4"
              fill="rgba(180,240,255,0.1)"
              stroke="rgba(220,250,255,0.7)"
              strokeWidth="1.4"
            />
            <path
              d="M 7 14 L 7 8 C 7 1, 23 1, 23 8 L 23 14"
              fill="none"
              stroke="rgba(220,250,255,0.7)"
              strokeWidth="1.4"
            />
            <circle cx="15" cy="27" r="4" fill="none" stroke="rgba(220,250,255,0.75)" strokeWidth="1.2" />
            <line x1="15" y1="31" x2="15" y2="38" stroke="rgba(220,250,255,0.75)" strokeWidth="1.2" />
          </g>
        </g>

        {/* invisible access line */}
        <path
          d="M 470 214 L 645 120"
          stroke="#ff2a2a"
          strokeWidth="2"
          strokeDasharray="10 10"
          fill="none"
          opacity="0.75"
        >
          <animate attributeName="stroke-dashoffset" values="0;-40" dur="1.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.35;0.9;0.35" dur="1.4s" repeatCount="indefinite" />
        </path>

        {/* red watcher eye */}
        <g transform="translate(655,82)">
          <ellipse
            cx="0"
            cy="0"
            rx="26"
            ry="15"
            fill="rgba(255,42,42,0.07)"
            stroke="rgba(255,42,42,0.5)"
            strokeWidth="2"
          />
          <circle cx="0" cy="0" r="6" fill="#ff2a2a">
            <animate attributeName="r" values="5;7;5" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.65;1;0.65" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
}
