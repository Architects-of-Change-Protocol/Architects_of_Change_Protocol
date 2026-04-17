export function HowItWorksFlow() {
  const intakeBars = [0, 1, 2];
  const outputRows = [0, 1, 2, 3];

  return (
    <svg
      viewBox="0 0 900 300"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Input / source */}
      <g transform="translate(80,150)">
        <rect
          x="-60"
          y="-50"
          width="120"
          height="100"
          rx="10"
          fill="rgba(20,20,30,0.8)"
          stroke="rgba(0,240,255,0.2)"
        />

        {intakeBars.map((i) => (
          <rect
            key={i}
            x="-40"
            y={-25 + i * 20}
            width="60"
            height="10"
            rx="5"
            fill="#00f0ff"
            opacity="0.2"
          >
            <animate
              attributeName="opacity"
              values="0.2;1;0.2"
              dur="2s"
              begin={`${i * 0.6}s`}
              repeatCount="indefinite"
            />
          </rect>
        ))}
      </g>

      {/* Flow line */}
      <line
        x1="150"
        y1="150"
        x2="750"
        y2="150"
        stroke="#00f0ff"
        strokeWidth="1"
        opacity="0.3"
      />

      {/* Moving signal */}
      <circle cx="150" cy="150" r="4" fill="#00f0ff">
        <animate
          attributeName="cx"
          values="150;750"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Processing / engine */}
      <g transform="translate(450,150)">
        <rect
          x="-80"
          y="-60"
          width="160"
          height="120"
          rx="12"
          fill="rgba(20,20,30,0.9)"
          stroke="rgba(0,240,255,0.3)"
        />

        <rect x="-10" y="-10" width="20" height="20" fill="#00f0ff">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="4s"
            repeatCount="indefinite"
          />
        </rect>

        <line
          x1="-60"
          y1="-30"
          x2="60"
          y2="-30"
          stroke="#00f0ff"
          strokeWidth="1"
        >
          <animate
            attributeName="y1"
            values="-30;30;-30"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            values="-30;30;-30"
            dur="2s"
            repeatCount="indefinite"
          />
        </line>
      </g>

      {/* Output / verified results */}
      <g transform="translate(750,150)">
        {outputRows.map((i) => (
          <g key={i}>
            <rect
              x="-40"
              y={-40 + i * 20}
              width="80"
              height="12"
              rx="4"
              fill="rgba(0,240,255,0.1)"
              stroke="#00f0ff"
              opacity="0"
            >
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur="2.5s"
                begin={`${i * 0.5}s`}
                repeatCount="indefinite"
              />
            </rect>

            <text
              x="-24"
              y={-34 + i * 20}
              fill="#00f0ff"
              fontSize="10"
              textAnchor="middle"
              dominantBaseline="middle"
              opacity="0"
            >
              ✓
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur="2.5s"
                begin={`${i * 0.5}s`}
                repeatCount="indefinite"
              />
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
