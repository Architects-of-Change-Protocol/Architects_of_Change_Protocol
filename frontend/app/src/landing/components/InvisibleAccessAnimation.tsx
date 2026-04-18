export function InvisibleAccessAnimation() {
  return (
    <div className="w-full max-w-[470px] aspect-[16/9] flex items-center justify-center">
      <svg viewBox="0 0 800 450" className="w-full h-full">
        <defs>
          <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="shadowBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>

        <rect width="800" height="450" fill="transparent" />

        {/* vault ambient glow */}
        <ellipse cx="410" cy="220" rx="150" ry="105" fill="rgba(0,240,255,0.08)">
          <animate attributeName="rx" values="145;158;145" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="ry" values="100;110;100" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.55;0.85;0.55" dur="3.2s" repeatCount="indefinite" />
        </ellipse>

        {/* user */}
        <g transform="translate(160,145)" stroke="rgba(255,255,255,0.9)" fill="none">
          <circle cx="0" cy="0" r="18" strokeWidth="2" />
          <line x1="0" y1="18" x2="0" y2="72" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="0" y1="36" x2="-24" y2="56" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="36" x2="24" y2="56" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="72" x2="-16" y2="118" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="72" x2="16" y2="118" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* vault */}
        <g transform="translate(350,115)">
          {/* top face */}
          <path
            d="M 60 20 L 104 42 L 60 64 L 16 42 Z"
            stroke="rgba(255,255,255,0.58)"
            strokeWidth="1.5"
            fill="rgba(0,240,255,0.10)"
            filter="url(#cyanGlow)"
          />
          {/* left face */}
          <path
            d="M 16 42 L 16 112 L 60 136 L 60 64 Z"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.4"
            fill="rgba(0,240,255,0.05)"
          />
          {/* right face */}
          <path
            d="M 60 64 L 60 136 L 104 112 L 104 42 Z"
            stroke="rgba(255,255,255,0.48)"
            strokeWidth="1.4"
            fill="rgba(0,240,255,0.08)"
            filter="url(#cyanGlow)"
          />

          {/* lock */}
          <circle cx="60" cy="88" r="8" stroke="rgba(255,255,255,0.82)" strokeWidth="1.5" fill="none" />
          <rect x="54" y="92" width="12" height="10" stroke="rgba(255,255,255,0.82)" strokeWidth="1.5" fill="none" />

          {/* subtle pulse on vault */}
          <circle cx="60" cy="88" r="26" fill="rgba(0,240,255,0.06)">
            <animate attributeName="r" values="22;30;22" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.45;0.2" dur="2.8s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* shadow figure right */}
        <g transform="translate(585,142)">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="585 142;578 142;585 142;590 142;585 142"
            dur="8s"
            repeatCount="indefinite"
          />
          <ellipse cx="25" cy="18" rx="12" ry="15" fill="rgba(20,20,30,0.92)" />
          <path
            d="M 25 34 L 25 74 L 12 98 M 25 74 L 38 98 M 25 48 L 8 60 M 25 48 L 42 60"
            stroke="rgba(32,32,42,0.86)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            filter="url(#shadowBlur)"
          />
          <circle cx="20" cy="15" r="2.4" fill="#ff2a2a" filter="url(#redGlow)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="30" cy="15" r="2.4" fill="#ff2a2a" filter="url(#redGlow)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" begin="0.12s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* shadow figure left/back */}
        <g transform="translate(282,170)">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="282 170;288 170;282 170;276 170;282 170"
            dur="9s"
            repeatCount="indefinite"
          />
          <ellipse cx="22" cy="15" rx="11" ry="14" fill="rgba(20,20,30,0.88)" />
          <path
            d="M 22 29 L 22 64 L 10 88 M 22 64 L 34 88 M 22 42 L 7 54 M 22 42 L 37 54"
            stroke="rgba(32,32,42,0.78)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            filter="url(#shadowBlur)"
          />
          <circle cx="18" cy="13" r="2" fill="#ff2a2a" filter="url(#redGlow)">
            <animate attributeName="opacity" values="0.65;1;0.65" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="26" cy="13" r="2" fill="#ff2a2a" filter="url(#redGlow)">
            <animate attributeName="opacity" values="0.65;1;0.65" dur="2s" begin="0.16s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* extraction stream 1 */}
        <path
          d="M 408 223 Q 505 200 585 160"
          stroke="rgba(255,42,42,0.34)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 6"
        />
        <circle r="4" fill="#ff2a2a" filter="url(#redGlow)">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path="M 408 223 Q 505 200 585 160"
          />
          <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* extraction stream 2 */}
        <path
          d="M 392 230 Q 330 205 285 185"
          stroke="rgba(255,42,42,0.24)"
          strokeWidth="1.6"
          fill="none"
          strokeDasharray="4 8"
        />
        <circle r="3.2" fill="#ff2a2a" filter="url(#redGlow)">
          <animateMotion
            dur="3.6s"
            begin="1s"
            repeatCount="indefinite"
            path="M 392 230 Q 330 205 285 185"
          />
          <animate attributeName="opacity" values="0;1;1;0" dur="3.6s" begin="1s" repeatCount="indefinite" />
        </circle>

        {/* watching eye */}
        <g transform="translate(600,86)">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 20 14;4 20 14;-4 20 14;0 20 14"
            dur="6s"
            repeatCount="indefinite"
          />
          <ellipse cx="20" cy="14" rx="18" ry="12" stroke="#ff2a2a" strokeWidth="1.5" fill="none" opacity="0.42" />
          <circle cx="20" cy="14" r="6" fill="#ff2a2a" opacity="0.86" filter="url(#redGlow)" />
          <circle cx="20" cy="14" r="3" fill="#ff6666" />
        </g>

        {/* subtle glitch sweep */}
        <rect x="0" y="0" width="800" height="450" fill="url(#none)" opacity="0">
          <animate attributeName="opacity" values="0;0;0.08;0;0" dur="10s" repeatCount="indefinite" />
        </rect>
        <rect x="0" y="0" width="800" height="450" fill="rgba(255,42,42,0.06)">
          <animate attributeName="opacity" values="0;0;0.05;0;0" dur="10s" repeatCount="indefinite" />
          <animate attributeName="x" values="-6;3;-2;0;0" dur="0.35s" begin="7.7s" repeatCount="indefinite" />
        </rect>
      </svg>
    </div>
  );
}
