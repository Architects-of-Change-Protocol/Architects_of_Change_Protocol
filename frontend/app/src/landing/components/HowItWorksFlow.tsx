import { motion } from "motion/react";

export function HowItWorksFlow() {
  return (
    <svg viewBox="0 0 900 300" className="w-full h-full">
      
      {/* === STAGE 1: PERMISSIONS === */}
      <g transform="translate(80,150)">
        
        {/* Panel */}
        <rect
          x="-60"
          y="-50"
          width="120"
          height="100"
          rx="10"
          fill="rgba(20,20,30,0.8)"
          stroke="rgba(0,240,255,0.2)"
        />

        {/* Toggles */}
        {[0, 1, 2].map((i) => (
          <motion.rect
            key={i}
            x="-40"
            y={-25 + i * 20}
            width="60"
            height="10"
            rx="5"
            fill="#00f0ff"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              delay: i * 0.6,
              duration: 2,
              repeat: Infinity,
            }}
          />
        ))}
      </g>

      {/* === FLOW LINE === */}
      <motion.line
        x1="150"
        y1="150"
        x2="750"
        y2="150"
        stroke="#00f0ff"
        strokeWidth="1"
        opacity="0.3"
      />

      {/* === MOVING REQUEST PULSE === */}
      <motion.circle
        r="4"
        fill="#00f0ff"
        initial={{ cx: 150 }}
        animate={{ cx: 750 }}
        cy="150"
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* === STAGE 2: ENGINE === */}
      <g transform="translate(450,150)">
        
        {/* Engine Box */}
        <rect
          x="-80"
          y="-60"
          width="160"
          height="120"
          rx="12"
          fill="rgba(20,20,30,0.9)"
          stroke="rgba(0,240,255,0.3)"
        />

        {/* Rotating Core */}
        <motion.rect
          width="20"
          height="20"
          x="-10"
          y="-10"
          fill="#00f0ff"
          animate={{ rotate: 360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Scan Line */}
        <motion.line
          x1="-60"
          x2="60"
          y1="-30"
          y2="-30"
          stroke="#00f0ff"
          strokeWidth="1"
          animate={{ y1: [-30, 30, -30], y2: [-30, 30, -30] }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </g>

      {/* === STAGE 3: AUDIT LOG === */}
      <g transform="translate(750,150)">
        
        {[0, 1, 2, 3].map((i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.5,
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          >
            <rect
              x="-40"
              y={-40 + i * 20}
              width="80"
              height="12"
              rx="4"
              fill="rgba(0,240,255,0.1)"
              stroke="#00f0ff"
            />

            {/* Check */}
            <text
              x="-30"
              y={-32 + i * 20}
              fill="#00f0ff"
              fontSize="10"
            >
              ✓
            </text>
          </motion.g>
        ))}
      </g>
    </svg>
  );
}
