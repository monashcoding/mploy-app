// frontend/src/components/layout/navigation-transition.tsx
"use client";

import { motion } from "framer-motion";
import { IconArrowRight, IconArrowLeft } from "@tabler/icons-react";

interface Props {
  direction: 1 | -1;
}

const LINE_COUNT = 14;
const ARROW_SIZE = 240;
const EASE = [0.19, 1, 0.22, 1] as const;

function pseudoRandom(index: number, salt: number): number {
  const x = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function NavigationTransition({ direction }: Props) {
  const Arrow = direction === 1 ? IconArrowRight : IconArrowLeft;
  const startLeft = direction === 1 ? "-20vw" : "100vw";
  const endLeft = direction === 1 ? "100vw" : "-20vw";
  const animationName =
    direction === 1 ? "mploy-rush-right" : "mploy-rush-left";

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: EASE }}
    >
      {Array.from({ length: LINE_COUNT }).map((_, i) => (
        <SpeedLine key={i} index={i} direction={direction} />
      ))}

      <motion.div
        className="pointer-events-none"
        style={{
          position: "fixed",
          top: `calc(50vh - ${ARROW_SIZE / 2}px)`,
        }}
        initial={{ left: startLeft, opacity: 0 }}
        animate={{ left: endLeft, opacity: [0, 1, 1, 0] }}
        transition={{
          left: {
            duration: 1.05,
            ease: EASE,
            repeat: Infinity,
          },
          opacity: {
            duration: 1.05,
            ease: "linear",
            repeat: Infinity,
            times: [0, 0.2, 0.8, 1],
          },
        }}
      >
        <Arrow
          size={ARROW_SIZE}
          stroke={2.6}
          className="text-white"
          style={{ filter: "drop-shadow(0 6px 22px rgba(0,0,0,0.4))" }}
        />
      </motion.div>

      <style>{`
        @keyframes mploy-rush-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(110vw); }
        }
        @keyframes mploy-rush-left {
          from { transform: translateX(100vw); }
          to { transform: translateX(-110%); }
        }
      `}</style>

      <style>{`.mploy-line-${direction === 1 ? "r" : "l"} { animation-name: ${animationName}; }`}</style>
    </motion.div>
  );
}

function SpeedLine({
  index,
  direction,
}: {
  index: number;
  direction: 1 | -1;
}) {
  const top = index * (100 / LINE_COUNT) + pseudoRandom(index, 1) * 1.5;
  const width = 36 + pseudoRandom(index, 2) * 44;
  const height = 2 + Math.floor(pseudoRandom(index, 3) * 2);
  const duration = 0.45 + pseudoRandom(index, 4) * 0.2;
  // Max delay 0.15s so all lines appear almost immediately — no late stragglers
  const delay = pseudoRandom(index, 5) * 0.15;
  const opacity = 0.25 + pseudoRandom(index, 6) * 0.35;

  return (
    <div
      className={direction === 1 ? "mploy-line-r" : "mploy-line-l"}
      style={{
        position: "fixed",
        top: `${top}vh`,
        left: 0,
        width: `${width}vw`,
        height,
        borderRadius: 999,
        willChange: "transform",
        animationDuration: `${duration}s`,
        animationTimingFunction: "linear",
        animationDelay: `${delay}s`,
        animationIterationCount: 1,
        animationFillMode: "forwards",
        background: `linear-gradient(${
          direction === 1 ? "to right" : "to left"
        }, transparent 0%, rgba(255,226,47,${opacity}) 45%, rgba(255,226,47,${opacity}) 55%, transparent 100%)`,
      }}
    />
  );
}
