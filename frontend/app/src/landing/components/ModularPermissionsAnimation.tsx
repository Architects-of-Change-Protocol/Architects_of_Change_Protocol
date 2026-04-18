export function ModularPermissionsAnimation() {
  return (
    <div className="w-full max-w-[470px] aspect-[16/9] flex items-center justify-center">
      <svg viewBox="0 0 900 500" className="w-full h-full">
        <defs>
          <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
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

        <rect width="900" height="500" fill="transparent" />

        {/* ambient halo */}
        <ellipse cx="455" cy="250" rx="260" ry="160" fill="rgba(0,240,255,0.06)">
          <animate attributeName="rx" values="250;270;250" dur="4s" repeatCount="indefinite" />
          <animate attributeName="ry" values="150;168;150" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.45;0.75;0.45" dur="4s" repeatCount="indefinite" />
        </ellipse>

        {/* USER */}
        <g transform="translate(135,170)" stroke="rgba(255,255,255,0.9)" fill="none">
          <circle cx="0" cy="0" r="18" strokeWidth="2" />
          <line x1="0" y1="18" x2="0" y2="72" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="0" y1="36" x2="-24" y2="56" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="36" x2="24" y2="56" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="72" x2="-16" y2="118" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="72" x2="16" y2="118" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* LEFT CONNECTION */}
        <line
          x1="175"
          y1="250"
          x2="305"
          y2="250"
          stroke="rgba(0,240,255,0.18)"
          strokeWidth="2"
          strokeDasharray="7 8"
        />

        <circle r="5" fill="#00f0ff" filter="url(#cyanGlow)">
          <animateMotion dur="2.2s" repeatCount="indefinite" path="M 175 250 L 305 250" />
          <animate attributeName="opacity" values="0;1;1;0" dur="2.2s" repeatCount="indefinite" />
        </circle>

        {/* MAIN PANEL */}
        <g transform="translate(320,132)">
          <rect
            x="0"
            y="0"
            width="250"
            height="235"
            rx="18"
            fill="rgba(15,18,24,0.96)"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="1.5"
          />
          <rect
            x="0"
            y="0"
            width="250"
            height="235"
            rx="18"
            fill="none"
            stroke="rgba(0,240,255,0.16)"
            filter="url(#cyanGlow)"
          />
          <text
            x="24"
            y="28"
            fill="#00f0ff"
            fontSize="12"
            fontWeight="700"
            letterSpacing="2"
          >
            PERMISSIONS
          </text>

          {/* TILE 1 */}
          <g transform="translate(20,52)">
            <rect x="0" y="0" width="95" height="62" rx="12" fill="rgba(0,240,255,0.14)" stroke="rgba(0,240,255,0.45)">
              <animate attributeName="fill-opacity" values="0.10;0.18;0.10" dur="4s" repeatCount="indefinite" />
            </rect>
            <text x="12" y="22" fill="#00f0ff" fontSize="11">Profile Data</text>
            <rect x="12" y="36" width="34" height="16" rx="8" fill="#00f0ff" />
            <circle cx="38" cy="44" r="5" fill="#0a0a0a">
              <animate attributeName="cx" values="18;18;38;38;38;18" dur="8s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* TILE 2 */}
          <g transform="translate(135,52)">
            <rect x="0" y="0" width="95" height="62" rx="12" fill="rgba(0,240,255,0.14)" stroke="rgba(0,240,255,0.45)">
              <animate attributeName="fill-opacity" values="0.10;0.10;0.18;0.10" dur="8s" repeatCount="indefinite" />
            </rect>
            <text x="12" y="22" fill="#00f0ff" fontSize="11">Financial</text>
            <rect x="12" y="36" width="34" height="16" rx="8" fill="#00f0ff" />
            <circle cx="18" cy="44" r="5" fill="#0a0a0a">
              <animate attributeName="cx" values="18;18;18;38;38;38;18" dur="8s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* TILE 3 */}
          <g transform="translate(20,132)">
            <rect x="0" y="0" width="95" height="62" rx="12" fill="rgba(0,240,255,0.14)" stroke="rgba(0,240,255,0.45)">
              <animate attributeName="fill-opacity" values="0.10;0.10;0.10;0.18;0.10" dur="8s" repeatCount="indefinite" />
            </rect>
            <text x="12" y="22" fill="#00f0ff" fontSize="11">Location</text>
            <rect x="12" y="36" width="34" height="16" rx="8" fill="#00f0ff" />
            <circle cx="18" cy="44" r="5" fill="#0a0a0a">
              <animate attributeName="cx" values="18;18;18;18;38;38;18" dur="8s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* TILE 4 */}
          <g transform="translate(135,132)">
            <rect x="0" y="0" width="95" height="62" rx="12" fill="rgba(0,240,255,0.14)" stroke="rgba(0,240,255,0.45)">
              <animate attributeName="fill-opacity" values="0.10;0.10;0.10;0.10;0.18;0.10" dur="8s" repeatCount="indefinite" />
            </rect>
            <text x="12" y="22" fill="#00f0ff" fontSize="11">Contacts</text>
            <rect x="12" y="36" width="34" height="16" rx="8" fill="#00f0ff" />
            <circle cx="18" cy="44" r="5" fill="#0a0a0a">
              <animate attributeName="cx" values="18;18;18;18;18;38;18" dur="8s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>

        {/* RIGHT SIDE CONNECTION LINES */}
        <line x1="570" y1="205" x2="760" y2="150" stroke="rgba(0,240,255,0.42)" strokeWidth="1.6" />
        <line x1="570" y1="230" x2="760" y2="225" stroke="rgba(0,240,255,0.42)" strokeWidth="1.6" />
        <line x1="570" y1="275" x2="760" y2="305" stroke="rgba(0,240,255,0.42)" strokeWidth="1.6" />
        <line x1="570" y1="320" x2="760" y2="385" stroke="rgba(0,240,255,0.42)" strokeWidth="1.6" />

        {/* TRAVELING PULSES */}
        <circle r="4" fill="#00f0ff" filter="url(#softGlow)">
          <animateMotion dur="8s" repeatCount="indefinite" path="M 570 205 L 760 150" />
          <animate attributeName="opacity" values="0;1;0;0;0;0" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle r="4" fill="#00f0ff" filter="url(#softGlow)">
          <animateMotion dur="8s" repeatCount="indefinite" path="M 570 230 L 760 225" />
          <animate attributeName="opacity" values="0;0;1;0;0;0" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle r="4" fill="#00f0ff" filter="url(#softGlow)">
          <animateMotion dur="8s" repeatCount="indefinite" path="M 570 275 L 760 305" />
          <animate attributeName="opacity" values="0;0;0;1;0;0" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle r="4" fill="#00f0ff" filter="url(#softGlow)">
          <animateMotion dur="8s" repeatCount="indefinite" path="M 570 320 L 760 385" />
          <animate attributeName="opacity" values="0;0;0;0;1;0" dur="8s" repeatCount="indefinite" />
        </circle>

        {/* DESTINATION NODES */}
        <g transform="translate(780,150)">
          <circle cx="0" cy="0" r="16" fill="rgba(0,240,255,0.18)" stroke="rgba(255,255,255,0.22)" />
          <circle cx="0" cy="0" r="5" fill="#00f0ff">
            <animate attributeName="opacity" values="0;1;0;0;0;0" dur="8s" repeatCount="indefinite" />
          </circle>
        </g>

        <g transform="translate(780,225)">
          <circle cx="0" cy="0" r="16" fill="rgba(0,240,255,0.18)" stroke="rgba(255,255,255,0.22)" />
          <circle cx="0" cy="0" r="5" fill="#00f0ff">
            <animate attributeName="opacity" values="0;0;1;0;0;0" dur="8s" repeatCount="indefinite" />
          </circle>
        </g>

        <g transform="translate(780,305)">
          <circle cx="0" cy="0" r="16" fill="rgba(0,240,255,0.18)" stroke="rgba(255,255,255,0.22)" />
          <circle cx="0" cy="0" r="5" fill="#00f0ff">
            <animate attributeName="opacity" values="0;0;0;1;0;0" dur="8s" repeatCount="indefinite" />
          </circle>
        </g>

        <g transform="translate(780,385)">
          <circle cx="0" cy="0" r="16" fill="rgba(0,240,255,0.18)" stroke="rgba(255,255,255,0.22)" />
          <circle cx="0" cy="0" r="5" fill="#00f0ff">
            <animate attributeName="opacity" values="0;0;0;0;1;0" dur="8s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* LABEL */}
        <text
          x="450"
          y="468"
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="14"
          letterSpacing="3"
        >
          ACCESS IS MODULAR, NOT ALL-OR-NOTHING
        </text>
      </svg>
    </div>
  );
}
