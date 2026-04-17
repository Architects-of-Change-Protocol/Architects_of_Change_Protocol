export function HowItWorksFlow() {
  return (
    <div className="w-full h-full min-h-[320px] flex items-center justify-center bg-black">
      <svg
        viewBox="0 0 1200 340"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        className="block"
      >
        <defs>
          <radialGradient id="cyanGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* debug frame */}
        <rect x="0" y="0" width="1200" height="340" fill="transparent" />
        <rect x="2" y="2" width="1196" height="336" fill="none" stroke="rgba(255,255,0,0.55)" strokeWidth="2" />

        {/* stage labels */}
        <text x="150" y="34" fill="#00f0ff" fontSize="18" fontFamily="Orbitron, monospace" letterSpacing="2">
          STAGE 01
        </text>
        <text x="145" y="70" fill="white" fontSize="26" fontFamily="Inter, Arial, sans-serif">
          Define Permissions
        </text>

        <text x="510" y="34" fill="#00f0ff" fontSize="18" fontFamily="Orbitron, monospace" letterSpacing="2">
          STAGE 02
        </text>
        <text x="470" y="70" fill="white" fontSize="26" fontFamily="Inter, Arial, sans-serif">
          Evaluate Request
        </text>

        <text x="920" y="34" fill="#00f0ff" fontSize="18" fontFamily="Orbitron, monospace" letterSpacing="2">
          STAGE 03
        </text>
        <text x="870" y="70" fill="white" fontSize="26" fontFamily="Inter, Arial, sans-serif">
          Grant & Audit Access
        </text>

        {/* left orb */}
        <circle cx="180" cy="145" r="34" fill="url(#cyanGlow)" />
        <circle cx="180" cy="145" r="20" fill="#00f0ff">
          <animate attributeName="opacity" values="0.55;1;0.55" dur="1.8s" repeatCount="indefinite" />
        </circle>

        {/* left permissions panel */}
        <g transform="translate(40,200)">
          <rect x="0" y="0" width="300" height="132" rx="12" fill="rgba(18,18,22,0.95)" stroke="rgba(0,240,255,0.45)" strokeWidth="1.5" />
          <text x="18" y="28" fill="rgba(255,255,255,0.75)" fontSize="14" fontFamily="Inter, Arial, sans-serif">Read</text>
          <text x="18" y="58" fill="rgba(255,255,255,0.75)" fontSize="14" fontFamily="Inter, Arial, sans-serif">Write</text>
          <text x="18" y="88" fill="rgba(255,255,255,0.75)" fontSize="14" fontFamily="Inter, Arial, sans-serif">Execute</text>
          <text x="18" y="118" fill="rgba(255,255,255,0.75)" fontSize="14" fontFamily="Inter, Arial, sans-serif">Admin</text>

          {/* toggles */}
          <g transform="translate(246,16)">
            <rect x="0" y="0" width="40" height="20" rx="10" fill="rgba(0,240,255,0.25)" />
            <circle cx="26" cy="10" r="8" fill="#00f0ff">
              <animate attributeName="cx" values="14;26;14;26" dur="2.2s" repeatCount="indefinite" />
            </circle>
          </g>
          <g transform="translate(246,46)">
            <rect x="0" y="0" width="40" height="20" rx="10" fill="rgba(0,240,255,0.25)" />
            <circle cx="26" cy="10" r="8" fill="#00f0ff">
              <animate attributeName="cx" values="14;26;14;26" dur="2.2s" begin="0.25s" repeatCount="indefinite" />
            </circle>
          </g>
          <g transform="translate(246,76)">
            <rect x="0" y="0" width="40" height="20" rx="10" fill="rgba(0,240,255,0.25)" />
            <circle cx="26" cy="10" r="8" fill="#00f0ff">
              <animate attributeName="cx" values="14;26;14;26" dur="2.2s" begin="0.5s" repeatCount="indefinite" />
            </circle>
          </g>
          <g transform="translate(246,106)">
            <rect x="0" y="0" width="40" height="20" rx="10" fill="rgba(120,130,150,0.18)" />
            <circle cx="14" cy="10" r="8" fill="rgba(180,185,200,0.65)" />
          </g>
        </g>

        {/* main pipeline line */}
        <line x1="340" y1="245" x2="850" y2="245" stroke="rgba(0,240,255,0.45)" strokeWidth="2" />

        {/* moving pulse */}
        <circle cy="245" r="7" fill="#00f0ff">
          <animate attributeName="cx" values="340;850" dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
        </circle>

        {/* center engine */}
        <g transform="translate(510,110)">
          <rect x="0" y="0" width="300" height="210" rx="14" fill="rgba(18,18,22,0.96)" stroke="rgba(0,240,255,0.45)" strokeWidth="1.5" />

          {/* glow line */}
          <line x1="18" y1="108" x2="282" y2="108" stroke="#00f0ff" strokeWidth="2" opacity="0.8">
            <animate attributeName="opacity" values="0.35;1;0.35" dur="1.8s" repeatCount="indefinite" />
          </line>

          {/* rotating geometry */}
          <g transform="translate(150,70)">
            <rect x="-16" y="-16" width="32" height="32" fill="#00f0ff">
              <animateTransform attributeName="transform" type="rotate" values="0 0 0;360 0 0" dur="5s" repeatCount="indefinite" />
            </rect>

            <rect x="-42" y="-42" width="84" height="84" rx="10" fill="none" stroke="rgba(0,240,255,0.6)" strokeWidth="2">
              <animateTransform attributeName="transform" type="rotate" values="0 0 0;360 0 0" dur="7s" repeatCount="indefinite" />
            </rect>

            <rect x="-42" y="-42" width="84" height="84" rx="10" fill="none" stroke="rgba(0,240,255,0.35)" strokeWidth="2">
              <animateTransform attributeName="transform" type="rotate" values="0 0 0;-360 0 0" dur="9s" repeatCount="indefinite" />
            </rect>
          </g>

          {/* lower blocks */}
          <g transform="translate(36,146)">
            {[
              [0, 0], [74, 0], [148, 0], [222, 0],
              [0, 44], [74, 44], [148, 44], [222, 44],
            ].map(([x, y], i) => (
              <rect
                key={i}
                x={x}
                y={y}
                width="62"
                height="28"
                rx="4"
                fill="rgba(0,240,255,0.06)"
                stroke="rgba(0,240,255,0.55)"
                strokeWidth="1.2"
              >
                <animate attributeName="fill-opacity" values="0.18;0.55;0.18" dur="2.2s" begin={`${i * 0.12}s`} repeatCount="indefinite" />
              </rect>
            ))}
          </g>
        </g>

        {/* right check badge */}
        <g transform="translate(1010,110)">
          <rect x="0" y="0" width="74" height="74" fill="rgba(0,240,255,0.08)" stroke="rgba(0,240,255,0.7)" strokeWidth="2" />
          <path d="M 22 40 L 34 52 L 53 28" fill="none" stroke="#00f0ff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="opacity" values="0.55;1;0.55" dur="1.2s" repeatCount="indefinite" />
          </path>
        </g>

        {/* audit log panel */}
        <g transform="translate(882,216)">
          <rect x="0" y="0" width="270" height="126" rx="12" fill="rgba(18,18,22,0.96)" stroke="rgba(0,240,255,0.45)" strokeWidth="1.5" />
          <circle cx="18" cy="20" r="5" fill="#00f0ff" />
          <text x="32" y="25" fill="rgba(255,255,255,0.72)" fontSize="14" fontFamily="Inter, Arial, sans-serif">
            AUDIT LOG
          </text>

          {[
            ['✓ GRANTED', '#0019'],
            ['✓ GRANTED', '#0018'],
            ['✓ GRANTED', '#0017'],
            ['✓ GRANTED', '#0016'],
            ['✕ DENIED', '#0015'],
          ].map(([label, id], i) => (
            <g key={i} transform={`translate(16, ${42 + i * 22})`}>
              <circle cx="0" cy="0" r="4" fill={i === 4 ? 'rgba(150,160,180,0.6)' : '#00f0ff'}>
                <animate attributeName="opacity" values="0.35;1;0.35" dur="2s" begin={`${i * 0.18}s`} repeatCount="indefinite" />
              </circle>
              <text x="14" y="5" fill={i === 4 ? 'rgba(150,160,180,0.75)' : '#00f0ff'} fontSize="13" fontFamily="Inter, Arial, sans-serif">
                {label}
              </text>
              <text x="212" y="5" fill="rgba(150,160,180,0.75)" fontSize="13" fontFamily="Inter, Arial, sans-serif">
                {id}
              </text>
            </g>
          ))}
        </g>

        {/* footer caption */}
        <text
          x="600"
          y="334"
          textAnchor="middle"
          fill="rgba(160,180,220,0.72)"
          fontSize="16"
          letterSpacing="2"
          fontFamily="Orbitron, monospace"
        >
          ACCESS IS EVALUATED, NOT ASSUMED.
        </text>
      </svg>
    </div>
  );
}
