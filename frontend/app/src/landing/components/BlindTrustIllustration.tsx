export function BlindTrustIllustration() {
  return (
    <div className="w-full max-w-[470px] aspect-[16/9] flex items-center justify-center">
      <svg viewBox="0 0 800 450" className="w-full h-full">

        <defs>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="turb"/>
            <feColorMatrix type="saturate" values="0"/>
            <feBlend in="SourceGraphic" mode="overlay"/>
          </filter>
        </defs>

        <rect width="800" height="450" fill="transparent" />

        {/* USER */}
        <g transform="translate(200,140)" stroke="white" fill="none">
          <circle cx="0" cy="0" r="18" strokeWidth="2"/>
          <line x1="0" y1="18" x2="0" y2="72" strokeWidth="2"/>
          <line x1="0" y1="36" x2="-24" y2="56" strokeWidth="2"/>
          <line x1="0" y1="36" x2="24" y2="56" strokeWidth="2"/>
          <line x1="0" y1="72" x2="-16" y2="118" strokeWidth="2"/>
          <line x1="0" y1="72" x2="16" y2="118" strokeWidth="2"/>

          {/* BLINDFOLD */}
          <rect x="-14" y="-4" width="28" height="6" fill="rgba(255,255,255,0.9)">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
          </rect>
        </g>

        {/* FAKE UI PANEL */}
        <g transform="translate(400,110)">
          <rect
            x="-60"
            y="-40"
            width="120"
            height="80"
            rx="12"
            fill="rgba(0,240,255,0.08)"
            stroke="rgba(0,240,255,0.4)"
            filter="url(#softGlow)"
          />

          {/* fake controls */}
          {[0,1,2].map(i => (
            <rect
              key={i}
              x="-30"
              y={-20 + i*20}
              width="60"
              height="6"
              rx="3"
              fill="rgba(0,240,255,0.5)"
            >
              <animate
                attributeName="opacity"
                values="0.4;1;0.4"
                dur="2s"
                begin={`${i*0.4}s`}
                repeatCount="indefinite"
              />
            </rect>
          ))}
        </g>

        {/* CHAOTIC DECISION LINES */}
        {[0,1,2,3].map((i) => (
          <path
            key={i}
            d={`M 200 200 Q ${300 + i*20} ${100 + i*30}, ${400 + i*40} ${200 + i*20}`}
            stroke="rgba(0,240,255,0.25)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="4 6"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;100"
              dur={`${3 + i}s`}
              repeatCount="indefinite"
            />
          </path>
        ))}

        {/* LOOP (CONFUSION) */}
        <path
          d="M 500 200 C 580 140, 650 260, 500 280 C 400 260, 420 150, 500 200"
          stroke="rgba(0,240,255,0.2)"
          strokeWidth="2"
          fill="none"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 500 200;360 500 200"
            dur="12s"
            repeatCount="indefinite"
          />
        </path>

        {/* PARTICLES (DECISIONS YOU DON'T SEE) */}
        {[0,1,2].map(i => (
          <circle key={i} r="3" fill="#00f0ff" opacity="0.7">
            <animateMotion
              dur={`${3+i}s`}
              repeatCount="indefinite"
              path="M 200 200 Q 350 120, 500 200"
            />
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur={`${3+i}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* DISTORTION OVERLAY */}
        <rect
          x="0"
          y="0"
          width="800"
          height="450"
          fill="rgba(0,240,255,0.04)"
          filter="url(#noise)"
          opacity="0.15"
        >
          <animate
            attributeName="opacity"
            values="0;0.15;0"
            dur="6s"
            repeatCount="indefinite"
          />
        </rect>

      </svg>
    </div>
  );
}
