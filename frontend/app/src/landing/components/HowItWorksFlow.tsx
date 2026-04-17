export function HowItWorksFlow() {
  return (
    <div className="w-full h-full min-h-[340px] flex items-center justify-center bg-black">
      <svg
        viewBox="0 0 1260 360"
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

        <text x="95" y="30" fill="#00f0ff" fontSize="15" fontFamily="Orbitron, monospace" letterSpacing="2">
          STAGE 01
        </text>
        <text x="68" y="60" fill="white" fontSize="22" fontFamily="Inter, Arial, sans-serif">
          Define Permissions
        </text>

        <text x="485" y="30" fill="#00f0ff" fontSize="15" fontFamily="Orbitron, monospace" letterSpacing="2">
          STAGE 02
        </text>
        <text x="438" y="60" fill="white" fontSize="22" fontFamily="Inter, Arial, sans-serif">
          Evaluate Request
        </text>

        <text x="930" y="30" fill="#00f0ff" fontSize="15" fontFamily="Orbitron, monospace" letterSpacing="2">
          STAGE 03
        </text>
        <text x="870" y="60" fill="white" fontSize="22" fontFamily="Inter, Arial, sans-serif">
          Grant &amp; Audit Access
        </text>

        {/* stage 1 orb */}
        <circle cx="145" cy="122" r="30" fill="url(#cyanGlow)" />
        <circle cx="145" cy="122" r="17" fill="#00f0ff">
          <animate attributeName="opacity" values="0.55;1;0.55" dur="1.8s" repeatCount="indefinite" />
        </circle>

        {/* stage 1 permissions panel */}
        <g transform="translate(12,166)">
          <rect
            x="0"
            y="0"
            width="310"
            height="112"
            rx="12"
            fill="rgba(18,18,22,0.96)"
            stroke="rgba(0,240,255,0.4)"
            strokeWidth="1.2"
          />

          <text x="16" y="25" fill="rgba(255,255,255,0.72)" fontSize="13" fontFamily="Inter, Arial, sans-serif">
            Read
          </text>
          <text x="16" y="50" fill="rgba(255,255,255,0.72)" fontSize="13" fontFamily="Inter, Arial, sans-serif">
            Write
          </text>
          <text x="16" y="75" fill="rgba(255,255,255,0.72)" fontSize="13" fontFamily="Inter, Arial, sans-serif">
            Execute
          </text>
          <text x="16" y="100" fill="rgba(255,255,255,0.72)" fontSize="13" fontFamily="Inter, Arial, sans-serif">
            Admin
          </text>

          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(244, ${10 + i * 25})`}>
              <rect x="0" y="0" width="46" height="18" rx="9" fill="rgba(0,240,255,0.22)" />
              <circle cy="9" r="6.5" fill="#00f0ff">
                <animate attributeName="cx" values="14;32;14;32" dur="2.2s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}

          <g transform="translate(244,85)">
            <rect x="0" y="0" width="46" height="18" rx="9" fill="rgba(120,130,150,0.16)" />
            <circle cx="14" cy="9" r="6.5" fill="rgba(180,185,200,0.65)" />
          </g>
        </g>

        {/* pipeline */}
        <line x1="322" y1="222" x2="930" y2="222" stroke="rgba(0,240,255,0.45)" strokeWidth="2" />

        <circle cy="222" r="6" fill="#00f0ff">
          <animate attributeName="cx" values="322;930" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
        </circle>

        {/* stage 2 engine - expanded and relaxed */}
        <g transform="translate(410,90)">
          <rect
            x="0"
            y="0"
            width="390"
            height="198"
            rx="14"
            fill="rgba(18,18,22,0.96)"
            stroke="rgba(0,240,255,0.42)"
            strokeWidth="1.2"
          />

          <g transform="translate(195,58)">
            <rect x="-12" y="-12" width="24" height="24" fill="#00f0ff">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0;360 0 0"
                dur="5s"
                repeatCount="indefinite"
              />
            </rect>

            <rect
              x="-40"
              y="-40"
              width="80"
              height="80"
              rx="8"
              fill="none"
              stroke="rgba(0,240,255,0.58)"
              strokeWidth="2"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0;360 0 0"
                dur="7s"
                repeatCount="indefinite"
              />
            </rect>

            <rect
              x="-40"
              y="-40"
              width="80"
              height="80"
              rx="8"
              fill="none"
              stroke="rgba(0,240,255,0.32)"
              strokeWidth="2"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0;-360 0 0"
                dur="9s"
                repeatCount="indefinite"
              />
            </rect>
          </g>

          <line x1="28" y1="100" x2="362" y2="100" stroke="#00f0ff" strokeWidth="2" opacity="0.8">
            <animate attributeName="opacity" values="0.35;1;0.35" dur="1.8s" repeatCount="indefinite" />
          </line>

          <g transform="translate(34,126)">
            {[
              [0, 0], [82, 0], [164, 0], [246, 0],
              [0, 44], [82, 44], [164, 44], [246, 44],
            ].map(([x, y], i) => (
              <rect
                key={i}
                x={x}
                y={y}
                width="64"
                height="28"
                rx="4"
                fill="rgba(0,240,255,0.06)"
                stroke="rgba(0,240,255,0.5)"
                strokeWidth="1"
              >
                <animate
                  attributeName="fill-opacity"
                  values="0.18;0.55;0.18"
                  dur="2.2s"
                  begin={`${i * 0.12}s`}
                  repeatCount="indefinite"
                />
              </rect>
            ))}
          </g>
        </g>

        {/* stage 3 badge */}
        <g transform="translate(1040,92)">
          <rect
            x="0"
            y="0"
            width="72"
            height="72"
            fill="rgba(0,240,255,0.08)"
            stroke="rgba(0,240,255,0.7)"
            strokeWidth="2"
          />
          <path
            d="M 20 37 L 32 49 L 52 24"
            fill="none"
            stroke="#00f0ff"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <animate attributeName="opacity" values="0.55;1;0.55" dur="1.2s" repeatCount="indefinite" />
          </path>
        </g>

        {/* stage 3 audit panel */}
        <g transform="translate(870,180)">
          <rect
            x="0"
            y="0"
            width="360"
            height="118"
            rx="12"
            fill="rgba(18,18,22,0.96)"
            stroke="rgba(0,240,255,0.42)"
            strokeWidth="1.2"
          />
          <circle cx="16" cy="18" r="4.5" fill="#00f0ff" />
          <text x="30" y="22" fill="rgba(255,255,255,0.72)" fontSize="12.5" fontFamily="Inter, Arial, sans-serif">
            AUDIT LOG
          </text>

          {[
            ['✓ GRANTED', '#0019'],
            ['✓ GRANTED', '#0018'],
            ['✓ GRANTED', '#0017'],
            ['✕ DENIED', '#0016'],
          ].map(([label, id], i) => (
            <g key={i} transform={`translate(16, ${42 + i * 20})`}>
              <circle cx="0" cy="0" r="3.5" fill={i === 3 ? 'rgba(150,160,180,0.65)' : '#00f0ff'}>
                <animate attributeName="opacity" values="0.35;1;0.35" dur="2s" begin={`${i * 0.18}s`} repeatCount="indefinite" />
              </circle>
              <text
                x="12"
                y="4"
                fill={i === 3 ? 'rgba(150,160,180,0.75)' : '#00f0ff'}
                fontSize="12"
                fontFamily="Inter, Arial, sans-serif"
              >
                {label}
              </text>
              <text
                x="282"
                y="4"
                fill="rgba(150,160,180,0.75)"
                fontSize="12"
                fontFamily="Inter, Arial, sans-serif"
              >
                {id}
              </text>
            </g>
          ))}
        </g>

        {/* footer caption */}
        <text
          x="670"
          y="346"
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
