export function HowItWorksFlow() {
  return (
    <div className="w-full h-full min-h-[320px] flex items-center justify-center bg-black">
      <svg
        viewBox="0 0 1000 280"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        className="block"
      >
        <defs>
          <radialGradient id="cyanGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* stage labels */}
        <text x="120" y="28" fill="#00f0ff" fontSize="15" fontFamily="Orbitron, monospace" letterSpacing="2">
          STAGE 01
        </text>
        <text x="98" y="56" fill="white" fontSize="22" fontFamily="Inter, Arial, sans-serif">
          Define Permissions
        </text>

        <text x="430" y="28" fill="#00f0ff" fontSize="15" fontFamily="Orbitron, monospace" letterSpacing="2">
          STAGE 02
        </text>
        <text x="405" y="56" fill="white" fontSize="22" fontFamily="Inter, Arial, sans-serif">
          Evaluate Request
        </text>

        <text x="760" y="28" fill="#00f0ff" fontSize="15" fontFamily="Orbitron, monospace" letterSpacing="2">
          STAGE 03
        </text>
        <text x="720" y="56" fill="white" fontSize="22" fontFamily="Inter, Arial, sans-serif">
          Grant & Audit Access
        </text>

        {/* stage 1 orb */}
        <circle cx="150" cy="118" r="28" fill="url(#cyanGlow)" />
        <circle cx="150" cy="118" r="16" fill="#00f0ff">
          <animate attributeName="opacity" values="0.55;1;0.55" dur="1.8s" repeatCount="indefinite" />
        </circle>

        {/* stage 1 permissions panel */}
        <g transform="translate(24,170)">
          <rect x="0" y="0" width="260" height="92" rx="10" fill="rgba(18,18,22,0.96)" stroke="rgba(0,240,255,0.4)" strokeWidth="1.2" />

          <text x="16" y="23" fill="rgba(255,255,255,0.72)" fontSize="13" fontFamily="Inter, Arial, sans-serif">Read</text>
          <text x="16" y="44" fill="rgba(255,255,255,0.72)" fontSize="13" fontFamily="Inter, Arial, sans-serif">Write</text>
          <text x="16" y="65" fill="rgba(255,255,255,0.72)" fontSize="13" fontFamily="Inter, Arial, sans-serif">Execute</text>
          <text x="16" y="86" fill="rgba(255,255,255,0.72)" fontSize="13" fontFamily="Inter, Arial, sans-serif">Admin</text>

          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(204, ${10 + i * 21})`}>
              <rect x="0" y="0" width="40" height="16" rx="8" fill="rgba(0,240,255,0.22)" />
              <circle cy="8" r="6" fill="#00f0ff">
                <animate attributeName="cx" values="12;28;12;28" dur="2.2s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}

          <g transform="translate(204,73)">
            <rect x="0" y="0" width="40" height="16" rx="8" fill="rgba(120,130,150,0.16)" />
            <circle cx="12" cy="8" r="6" fill="rgba(180,185,200,0.65)" />
          </g>
        </g>

        {/* pipeline */}
        <line x1="285" y1="214" x2="710" y2="214" stroke="rgba(0,240,255,0.45)" strokeWidth="2" />

        <circle cy="214" r="6" fill="#00f0ff">
          <animate attributeName="cx" values="285;710" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
        </circle>

        {/* stage 2 engine */}
        <g transform="translate(390,90)">
          <rect x="0" y="0" width="250" height="152" rx="12" fill="rgba(18,18,22,0.96)" stroke="rgba(0,240,255,0.42)" strokeWidth="1.2" />

          <g transform="translate(125,52)">
            <rect x="-12" y="-12" width="24" height="24" fill="#00f0ff">
              <animateTransform attributeName="transform" type="rotate" values="0 0 0;360 0 0" dur="5s" repeatCount="indefinite" />
            </rect>

            <rect x="-34" y="-34" width="68" height="68" rx="8" fill="none" stroke="rgba(0,240,255,0.58)" strokeWidth="2">
              <animateTransform attributeName="transform" type="rotate" values="0 0 0;360 0 0" dur="7s" repeatCount="indefinite" />
            </rect>

            <rect x="-34" y="-34" width="68" height="68" rx="8" fill="none" stroke="rgba(0,240,255,0.32)" strokeWidth="2">
              <animateTransform attributeName="transform" type="rotate" values="0 0 0;-360 0 0" dur="9s" repeatCount="indefinite" />
            </rect>
          </g>

          <line x1="20" y1="88" x2="230" y2="88" stroke="#00f0ff" strokeWidth="2" opacity="0.8">
            <animate attributeName="opacity" values="0.35;1;0.35" dur="1.8s" repeatCount="indefinite" />
          </line>

          <g transform="translate(28,108)">
            {[
              [0, 0], [56, 0], [112, 0], [168, 0],
              [0, 32], [56, 32], [112, 32], [168, 32],
            ].map(([x, y], i) => (
              <rect
                key={i}
                x={x}
                y={y}
                width="46"
                height="22"
                rx="4"
                fill="rgba(0,240,255,0.06)"
                stroke="rgba(0,240,255,0.5)"
                strokeWidth="1"
              >
                <animate attributeName="fill-opacity" values="0.18;0.55;0.18" dur="2.2s" begin={`${i * 0.12}s`} repeatCount="indefinite" />
              </rect>
            ))}
          </g>
        </g>

        {/* stage 3 badge */}
        <g transform="translate(825,88)">
          <rect x="0" y="0" width="64" height="64" fill="rgba(0,240,255,0.08)" stroke="rgba(0,240,255,0.7)" strokeWidth="2" />
          <path d="M 18 34 L 29 45 L 46 24" fill="none" stroke="#00f0ff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="opacity" values="0.55;1;0.55" dur="1.2s" repeatCount="indefinite" />
          </path>
        </g>

        {/* stage 3 audit panel */}
        <g transform="translate(726,176)">
          <rect x="0" y="0" width="230" height="88" rx="10" fill="rgba(18,18,22,0.96)" stroke="rgba(0,240,255,0.42)" strokeWidth="1.2" />
          <circle cx="14" cy="16" r="4" fill="#00f0ff" />
          <text x="26" y="20" fill="rgba(255,255,255,0.72)" fontSize="12" fontFamily="Inter, Arial, sans-serif">
            AUDIT LOG
          </text>

          {[
            ['✓ GRANTED', '#0019'],
            ['✓ GRANTED', '#0018'],
            ['✓ GRANTED', '#0017'],
            ['✕ DENIED', '#0016'],
          ].map(([label, id], i) => (
            <g key={i} transform={`translate(14, ${38 + i * 16})`}>
              <circle cx="0" cy="0" r="3.5" fill={i === 3 ? 'rgba(150,160,180,0.65)' : '#00f0ff'}>
                <animate attributeName="opacity" values="0.35;1;0.35" dur="2s" begin={`${i * 0.18}s`} repeatCount="indefinite" />
              </circle>
              <text x="12" y="4" fill={i === 3 ? 'rgba(150,160,180,0.75)' : '#00f0ff'} fontSize="11.5" fontFamily="Inter, Arial, sans-serif">
                {label}
              </text>
              <text x="168" y="4" fill="rgba(150,160,180,0.75)" fontSize="11.5" fontFamily="Inter, Arial, sans-serif">
                {id}
              </text>
            </g>
          ))}
        </g>

        {/* footer caption */}
        <text
          x="500"
          y="276"
          textAnchor="middle"
          fill="rgba(160,180,220,0.72)"
          fontSize="14"
          letterSpacing="2"
          fontFamily="Orbitron, monospace"
        >
          ACCESS IS EVALUATED, NOT ASSUMED.
        </text>
      </svg>
    </div>
  );
}
