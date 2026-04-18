import { useEffect, useState } from "react";

type NodeItem = {
  id: number;
  label: string;
  x: number;
  y: number;
  active: boolean;
};

const NODES: NodeItem[] = [
  { id: 1, label: "App A",     x: 450, y: 70,  active: true  },
  { id: 2, label: "Service B", x: 690, y: 130, active: true  },
  { id: 3, label: "Platform C",x: 690, y: 290, active: false },
  { id: 4, label: "App D",     x: 450, y: 350, active: true  },
  { id: 5, label: "Service E", x: 210, y: 130, active: false },
];

export function FullControlAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % 6);
    }, 1100);

    return () => clearInterval(interval);
  }, []);

  return (
    <svg viewBox="0 0 900 360" className="w-full h-full">
      <defs>
        <filter id="controlGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id="controlAura">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.26" />
          <stop offset="55%" stopColor="#00f0ff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* user aura */}
      <circle
        cx="450"
        cy="180"
        r={step >= 4 ? 82 : 68}
        fill="url(#controlAura)"
        opacity={step >= 1 ? 1 : 0}
      >
        {step >= 4 && (
          <animate
            attributeName="r"
            values="76;88;76"
            dur="1.8s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* control ring */}
      {step >= 3 && (
        <circle
          cx="450"
          cy="180"
          r="112"
          fill="none"
          stroke="rgba(0,240,255,0.28)"
          strokeWidth="1.5"
        >
          <animate
            attributeName="opacity"
            values="0.18;0.38;0.18"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* user */}
      {step >= 1 && (
        <g filter="url(#controlGlow)">
          <circle cx="450" cy="160" r="12" fill="none" stroke="#00f0ff" strokeWidth="2.5" />
          <line x1="450" y1="172" x2="450" y2="202" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="450" y1="180" x2="434" y2="191" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="450" y1="180" x2="466" y2="191" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="450" y1="202" x2="439" y2="220" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="450" y1="202" x2="461" y2="220" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* connections */}
      {step >= 2 &&
        NODES.map((node) => {
          const isActive = node.active && step >= 4;
          return (
            <g key={`line-${node.id}`}>
              <line
                x1="450"
                y1="180"
                x2={node.x}
                y2={node.y}
                stroke={isActive ? "rgba(0,240,255,0.62)" : "rgba(255,255,255,0.12)"}
                strokeWidth="1.6"
                strokeDasharray="6 6"
              >
                {isActive && (
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-12"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                )}
              </line>

              {isActive && step >= 5 && (
                <circle cx="450" cy="180" r="4" fill="#00f0ff" filter="url(#controlGlow)">
                  <animate attributeName="cx" values={`450;${node.x}`} dur="0.9s" begin={`${node.id * 0.15}s`} repeatCount="indefinite" />
                  <animate attributeName="cy" values={`180;${node.y}`} dur="0.9s" begin={`${node.id * 0.15}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;1;0" dur="0.9s" begin={`${node.id * 0.15}s`} repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}

      {/* nodes */}
      {step >= 2 &&
        NODES.map((node) => {
          const active = node.active && step >= 4;
          return (
            <g key={node.id} transform={`translate(${node.x},${node.y})`}>
              <rect
                x="-22"
                y="-22"
                width="44"
                height="44"
                rx="8"
                fill={active ? "rgba(0,240,255,0.08)" : "rgba(255,255,255,0.02)"}
                stroke={active ? "#00f0ff" : "rgba(255,255,255,0.22)"}
                strokeWidth="2"
                filter={active ? "url(#controlGlow)" : undefined}
              >
                {active && (
                  <animate
                    attributeName="opacity"
                    values="0.75;1;0.75"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                )}
              </rect>

              <rect
                x="-10"
                y="-10"
                width="20"
                height="20"
                rx="4"
                fill={active ? "rgba(0,240,255,0.22)" : "rgba(255,255,255,0.08)"}
                stroke={active ? "rgba(0,240,255,0.7)" : "rgba(255,255,255,0.12)"}
              />

              <text
                x="0"
                y="40"
                textAnchor="middle"
                fill={active ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.32)"}
                fontSize="10"
              >
                {node.label}
              </text>
            </g>
          );
        })}

      {/* pulse ring */}
      {step >= 4 && (
        <circle
          cx="450"
          cy="180"
          r="112"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="2"
          opacity="0.7"
        >
          <animate attributeName="r" values="90;145" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0" dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* label */}
      {step >= 5 && (
        <text
          x="450"
          y="330"
          textAnchor="middle"
          fill="rgba(255,255,255,0.36)"
          fontSize="10"
          letterSpacing="2"
        >
          CONTROL STAYS WITH THE SOURCE
        </text>
      )}
    </svg>
  );
}
