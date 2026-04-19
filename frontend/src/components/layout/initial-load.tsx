// frontend/src/components/layout/initial-load.tsx
"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function InitialLoad({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
    >
      {children}
    </motion.div>
  );
}
