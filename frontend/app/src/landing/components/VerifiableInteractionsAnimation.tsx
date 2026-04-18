import { useEffect, useState } from "react";

type RecordItem = {
  id: number;
  ts: string;
};

export function VerifiableInteractionsAnimation() {
  const [step, setStep] = useState(0);
  const [records, setRecords] = useState<RecordItem[]>([
    { id: 1, ts: "12:41:02" },
    { id: 2, ts: "12:41:07" },
    { id: 3, ts: "12:41:11" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => {
        const next = (s + 1) % 4;

        if (next === 0) {
          const now = new Date();
          const ts = now.toTimeString().slice(0, 8);
          setRecords((prev) => [...prev.slice(-3), { id: Date.now(), ts }]);
        }

        return next;
      });
    }, 1100);

    return () => clearInterval(interval);
  }, []);

  const latestIndex = records.length - 1;

  return (
    <svg viewBox="0 0 900 360" className="w-full h-full">
      <defs>
        <filter id="verifyGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* USER */}
      <g transform="translate(110,180)">
        <circle r="34" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.7)" />
        <circle cx="0" cy="-8" r="8" fill="white" />
        <path d="M-16 20 Q0 2 16 20" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* REQUEST CHIP */}
      <g opacity={step >= 0 ? 1 : 0}>
        <rect
          x={step === 0 ? 170 : step === 1 ? 240 : step === 2 ? 310 : 310}
          y="155"
          width="130"
          height="50"
          rx="12"
          fill="rgba(0,240,255,0.08)"
          stroke="rgba(0,240,255,0.45)"
          filter="url(#verifyGlow)"
        />
        <text
          x={step === 0 ? 235 : step === 1 ? 305 : step === 2 ? 375 : 375}
          y="175"
          textAnchor="middle"
          fill="#00f0ff"
          fontSize="11"
        >
          ACCESS REQUEST
        </text>
        <text
          x={step === 0 ? 235 : step === 1 ? 305 : step === 2 ? 375 : 375}
          y="192"
          textAnchor="middle"
          fill="rgba(255,255,255,0.5)"
          fontSize="9"
        >
          verified event
        </text>
      </g>

      {/* LINE USER -> ENGINE */}
      <line
        x1="145"
        y1="180"
        x2="315"
        y2="180"
        stroke="rgba(0,240,255,0.24)"
        strokeWidth="2"
        strokeDasharray="6 6"
      >
        <animate attributeName="stroke-dashoffset" values="0;-12" dur="1s" repeatCount="indefinite" />
      </line>

      {/* ENGINE */}
      <g transform="translate(450,180)">
        <rect
          x="-85"
          y="-90"
          width="170"
          height="180"
          rx="18"
          fill="rgba(10,20,28,0.88)"
          stroke={step >= 1 ? "#00f0ff" : "rgba(0,240,255,0.28)"}
        />
        <text x="0" y="-62" textAnchor="middle" fill="#00f0ff" fontSize="11">
          VERIFY
        </text>

        {/* mini grid */}
        {Array.from({ length: 9 }).map((_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const active = step === 1 || step === 2;
          return (
            <rect
              key={i}
              x={-48 + col * 34}
              y={-28 + row * 34}
              width="22"
              height="22"
              rx="5"
              fill={active ? "rgba(0,240,255,0.18)" : "rgba(0,240,255,0.05)"}
              stroke={active ? "rgba(0,240,255,0.65)" : "rgba(0,240,255,0.18)"}
            >
              {active && (
                <animate
                  attributeName="opacity"
                  values="0.35;1;0.35"
                  dur="0.8s"
                  begin={`${i * 0.08}s`}
                  repeatCount="indefinite"
                />
              )}
            </rect>
          );
        })}

        {/* scan line */}
        {(step === 1 || step === 2) && (
          <line x1="-58" y1="-18" x2="58" y2="-18" stroke="#00f0ff" strokeWidth="2" filter="url(#verifyGlow)">
            <animate attributeName="y1" values="-18;48;-18" dur="1s" repeatCount="indefinite" />
            <animate attributeName="y2" values="-18;48;-18" dur="1s" repeatCount="indefinite" />
          </line>
        )}
      </g>

      {/* ENGINE -> LEDGER */}
      <line
        x1="535"
        y1="180"
        x2="675"
        y2="180"
        stroke="rgba(0,240,255,0.2)"
        strokeWidth="2"
      />
      {(step === 2 || step === 3) && (
        <circle cx="535" cy="180" r="4" fill="#00f0ff" filter="url(#verifyGlow)">
          <animate attributeName="cx" values="535;675" dur="0.7s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;1;0" dur="0.7s" repeatCount="indefinite" />
        </circle>
      )}

      {/* LEDGER PANEL */}
      <g transform="translate(770,180)">
        <text x="0" y="-104" textAnchor="middle" fill="rgba(255,255,255,0.36)" fontSize="10" letterSpacing="2">
          AUDIT LEDGER
        </text>

        {records.map((r, idx) => {
          const y = -65 + idx * 42;
          const isLatest = idx === latestIndex && step === 3;
          return (
            <g key={r.id} transform={`translate(0,${y})`}>
              <rect
                x="-82"
                y="-14"
                width="164"
                height="30"
                rx="10"
                fill="rgba(0,240,255,0.06)"
                stroke={isLatest ? "rgba(0,240,255,0.75)" : "rgba(0,240,255,0.24)"}
              >
                {isLatest && (
                  <animate attributeName="opacity" values="0.65;1;0.65" dur="1.2s" repeatCount="indefinite" />
                )}
              </rect>

              <circle cx="-58" cy="1" r="8" fill="rgba(0,240,255,0.12)" stroke="#00f0ff" />
              <path d="M-61 1 l3 3 l6 -7" fill="none" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              <text x="-38" y="-1" fill="white" fontSize="9" opacity="0.7">
                VERIFIED
              </text>
              <text x="-38" y="10" fill="white" fontSize="8" opacity="0.35">
                {r.ts}
              </text>

              {/* hash bars */}
              <rect x="38" y="-6" width="4" height="12" rx="2" fill="rgba(0,240,255,0.3)" />
              <rect x="45" y="-8" width="4" height="16" rx="2" fill="rgba(0,240,255,0.45)" />
              <rect x="52" y="-5" width="4" height="10" rx="2" fill="rgba(0,240,255,0.6)" />
              <rect x="59" y="-9" width="4" height="18" rx="2" fill="rgba(0,240,255,0.78)" />
            </g>
          );
        })}
      </g>

      {/* FOOTNOTE */}
      <text x="450" y="330" textAnchor="middle" fill="rgba(255,255,255,0.28)" fontSize="10" letterSpacing="2">
        EVERY INTERACTION LEAVES EVIDENCE
      </text>
    </svg>
  );
}
