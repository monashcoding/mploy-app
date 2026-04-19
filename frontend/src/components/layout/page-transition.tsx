// frontend/src/components/layout/page-transition.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavigationTransition } from "./navigation-transition";

const EASE = [0.19, 1, 0.22, 1] as [number, number, number, number];
const MIN_OVERLAY_MS = 620;
const SLIDE_VW = 40;

const PAGE_ORDER: Record<string, number> = {
  "/": 0,
  "/jobs": 1,
};

function orderOf(path: string): number {
  if (PAGE_ORDER[path] !== undefined) return PAGE_ORDER[path];
  if (path.startsWith("/jobs")) return 1;
  return 0;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prev = useRef(pathname);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [overlayActive, setOverlayActive] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [slideKey, setSlideKey] = useState(0);

  useEffect(() => {
    if (pathname === prev.current) return;
    const dir: 1 | -1 =
      orderOf(pathname) >= orderOf(prev.current) ? 1 : -1;
    prev.current = pathname;
    setDirection(dir);

    // Immediately hide content and show overlay
    setHidden(true);
    setOverlayActive(true);

    // After overlay duration, hide overlay and slide content in
    const t = window.setTimeout(() => {
      setOverlayActive(false);
      setHidden(false);
      setSlideKey((k) => k + 1);
    }, MIN_OVERLAY_MS);

    return () => window.clearTimeout(t);
  }, [pathname]);

  const enterX = `${direction * SLIDE_VW}vw`;

  return (
    <div className="relative overflow-x-hidden">
      {hidden ? (
        // Content exists in DOM (so Next.js is happy) but invisible
        <div style={{ visibility: "hidden", position: "absolute" }}>
          {children}
        </div>
      ) : (
        <motion.div
          key={slideKey}
          initial={slideKey > 0 ? { x: enterX, opacity: 0 } : false}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            x: { duration: 0.5, ease: EASE },
            opacity: { duration: 0.3, ease: EASE },
          }}
        >
          {children}
        </motion.div>
      )}

      <AnimatePresence>
        {overlayActive && <NavigationTransition direction={direction} />}
      </AnimatePresence>
    </div>
  );
}
