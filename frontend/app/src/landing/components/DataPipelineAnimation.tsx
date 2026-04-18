export function DataPipelineAnimation() {
  return (
    <div className="w-full max-w-[420px] aspect-[16/9] flex items-center justify-center">
      <svg viewBox="0 0 800 450" className="w-full h-full">
        
        <defs>
          <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* HALO */}
        <ellipse cx="400" cy="225" rx="230" ry="130" fill="rgba(255,0,0,0.08)">
          <animate attributeName="rx" values="220;240;220" dur="3s" repeatCount="indefinite" />
          <animate attributeName="ry" values="120;140;120" dur="3s" repeatCount="indefinite" />
        </ellipse>

        {/* USER */}
        <g transform="translate(90,170)" stroke="white" strokeWidth="2">
          <circle cx="30" cy="10" r="10" fill="none" />
          <line x1="30" y1="20" x2="30" y2="50" />
          <line x1="30" y1="30" x2="15" y2="40" />
          <line x1="30" y1="30" x2="45" y2="40" />
          <line x1="30" y1="50" x2="20" y2="70" />
          <line x1="30" y1="50" x2="40" y2="70" />
        </g>

        {/* DOTTED LINE */}
        <line
          x1="150"
          y1="225"
          x2="320"
          y2="225"
          stroke="rgba(255,0,0,0.3)"
          strokeDasharray="6 8"
        />

        {/* MOVING DATA PACKET */}
        <circle r="6" fill="#ff2a2a" filter="url(#redGlow)">
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path="M 150 225 L 320 225"
          />
          <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* SERVER */}
        <g transform="translate(330,150)">
          <rect width="140" height="100" rx="6" fill="#111" stroke="rgba(255,0,0,0.3)" />
          <rect x="0" y="0" width="140" height="20" fill="#1a1a1a" />
          
          {/* blinking data */}
          <rect x="30" y="40" width="10" height="10" fill="#ff2a2a">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
          </rect>
          <rect x="30" y="60" width="10" height="10" fill="#ff2a2a">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.2s" repeatCount="indefinite" />
          </rect>
          <rect x="30" y="80" width="10" height="10" fill="#ff2a2a">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.4s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* PIPELINE */}
        <rect x="500" y="215" width="130" height="12" rx="6" fill="#333" />

        {/* FLOW THROUGH PIPE */}
        <rect width="18" height="10" y="216" fill="#ff2a2a">
          <animate attributeName="x" values="500;610;500" dur="2s" repeatCount="indefinite" />
        </rect>

        {/* RECEIVERS */}
        <g transform="translate(660,160)" stroke="rgba(255,0,0,0.4)">
          <circle cx="0" cy="0" r="10" fill="none" />
          <line x1="0" y1="10" x2="0" y2="30" />
        </g>

        <g transform="translate(700,160)" stroke="rgba(255,0,0,0.4)">
          <circle cx="0" cy="0" r="10" fill="none" />
          <line x1="0" y1="10" x2="0" y2="30" />
        </g>

        {/* MONEY */}
        <text x="640" y="340" fill="#ff2a2a" fontSize="20">
          $
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" repeatCount="indefinite" />
        </text>

        <text x="700" y="340" fill="#ff2a2a" fontSize="20">
          $
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
        </text>

      </svg>
    </div>
  );
}
