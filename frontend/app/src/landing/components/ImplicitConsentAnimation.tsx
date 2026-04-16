export function ImplicitConsentAnimation() {
  return (
    <div className="w-full max-w-[420px] aspect-[16/9] flex items-center justify-center">
      <svg viewBox="0 0 800 450" className="w-full h-full">
        <defs>
          <radialGradient id="implicitGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff2a2a" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ff2a2a" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="800" height="450" fill="transparent" />
        <ellipse cx="400" cy="220" rx="250" ry="150" fill="url(#implicitGlow)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite" />
        </ellipse>

        {/* person */}
        <g transform="translate(78,152)" stroke="rgba(255,255,255,0.8)" fill="none">
          <circle cx="40" cy="25" r="15" strokeWidth="2" />
          <path d="M 40 40 L 40 75" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 40 50 L 25 60 M 40 50 L 55 60" strokeWidth="2" strokeLinecap="round" />
          <path d="M 40 75 L 30 105 M 40 75 L 50 105" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* panel */}
        <g transform="translate(250,40)">
          <rect
            x="0"
            y="0"
            width="360"
            height="330"
            rx="18"
            fill="rgba(16,16,18,0.88)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.2"
          />
          <rect
            x="0"
            y="0"
            width="360"
            height="330"
            rx="18"
            fill="none"
            stroke="rgba(255,42,42,0.12)"
            strokeWidth="1"
          />

          <text
            x="24"
            y="38"
            fill="rgba(255,255,255,0.95)"
            fontSize="18"
            fontFamily="Inter, Arial, sans-serif"
          >
            Terms and Conditions
          </text>

          <line
            x1="0"
            y1="56"
            x2="360"
            y2="56"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />

          {/* scrolling text block */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 -18; 0 0"
              dur="4s"
              repeatCount="indefinite"
            />
            <g opacity="0.42" fontFamily="monospace" fontSize="10" fill="rgba(190,198,210,0.72)">
              <text x="22" y="92">modifications you further agree to indemnify and</text>
              <text x="22" y="112">hold harmless the company its affiliates partners</text>
              <text x="22" y="132">and subsidiaries from any claims damages or</text>
              <text x="22" y="152">liabilities arising from the use misuse or</text>
              <text x="22" y="172">exploitation of your data and you acknowledge that</text>
              <text x="22" y="192">data security cannot be guaranteed and breaches may occur</text>
              <text x="22" y="212">without liability to the company additional terms</text>
              <text x="22" y="232">may apply including mandatory arbitration clauses</text>
              <text x="22" y="252">class action waivers governing law provisions and</text>
              <text x="22" y="272">forum selection restrictions that may limit your</text>
              <text x="22" y="292">legal remedies and by proceeding you confirm that</text>
              <text x="22" y="312">you have read understood and voluntarily agreed</text>
            </g>
          </g>

          {/* checkbox row */}
          <g transform="translate(22,336)">
            <rect x="0" y="0" width="22" height="22" rx="5" fill="#ff3a3a">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" repeatCount="indefinite" />
            </rect>

            <path
              d="M 6 11 L 10 15 L 16 7"
              stroke="white"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" />
            </path>

            <text
              x="34"
              y="16"
              fill="rgba(255,255,255,0.95)"
              fontSize="16"
              fontFamily="Inter, Arial, sans-serif"
            >
              I agree to the terms
            </text>
          </g>

          {/* accept button pulses */}
          <g transform="translate(22,374)">
            <rect x="0" y="0" width="316" height="44" rx="12" fill="#d90000">
              <animate attributeName="fill-opacity" values="0.82;1;0.82" dur="1.1s" repeatCount="indefinite" />
            </rect>
            <text
              x="158"
              y="28"
              textAnchor="middle"
              fill="white"
              fontSize="18"
              fontWeight="600"
              fontFamily="Inter, Arial, sans-serif"
            >
              Accept
            </text>
          </g>
        </g>

        {/* escaping checkbox with obvious movement */}
        <g transform="translate(470,396)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 12 -16; 0 0"
              dur="1.4s"
              repeatCount="indefinite"
            />
            <rect
              x="0"
              y="0"
              width="26"
              height="26"
              rx="4"
              fill="none"
              stroke="#ff3a3a"
              strokeWidth="2"
            />
          </g>

          <circle cx="-2" cy="33" r="2.2" fill="#ff3a3a">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="8" cy="40" r="2" fill="#ff3a3a">
            <animate attributeName="opacity" values="0.15;0.8;0.15" dur="1.2s" begin="0.15s" repeatCount="indefinite" />
          </circle>
          <circle cx="20" cy="46" r="1.8" fill="#ff3a3a">
            <animate attributeName="opacity" values="0.1;0.6;0.1" dur="1.2s" begin="0.3s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
}
