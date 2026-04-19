// frontend/src/components/ui/dot-background.tsx
"use client";

import { useEffect, useRef } from "react";
import { transitionState } from "@/lib/transition-state";

const GRID_SIZE = 25;
const DOT_SIZE = 1;
const CURSOR_RADIUS = 100;
const SWEEP_DURATION = 1000;
const MAX_STRETCH = 220;
const MAX_SHIFT = 80;
const WAVE_WIDTH = 0.55;
const YELLOW_CHANCE = 0;

function seededRandom(index: number, salt: number): number {
  const x = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function easeIn(t: number): number {
  return t * t * t;
}

function smoothstep(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

export default function DotBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;

    interface Dot {
      x: number;
      y: number;
      isYellow: boolean;
      stretchMult: number;
      shiftMult: number;
    }

    let dots: Dot[] = [];

    const rebuild = () => {
      const { devicePixelRatio: ratio = 1 } = window;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const cols = Math.ceil(w / GRID_SIZE) + 1;
      const rows = Math.ceil(h / GRID_SIZE) + 1;
      dots = [];
      let idx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            x: c * GRID_SIZE,
            y: r * GRID_SIZE,
            isYellow: seededRandom(idx, 7) < YELLOW_CHANCE,
            stretchMult: 0.5 + seededRandom(idx, 8) * 1.0,
            shiftMult: 0.5 + seededRandom(idx, 9) * 1.0,
          });
          idx++;
        }
      }
    };

    rebuild();
    window.addEventListener("resize", rebuild);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    let animId: number;

    function animate(now: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      // Check if a transition sweep is active
      const { active, direction, startTime } = transitionState;
      let linearProgress = 0;
      let easedProgress = 0;
      let wavePos = -999;
      let sweepActive = false;

      if (active) {
        const elapsed = now - startTime;
        linearProgress = Math.min(elapsed / SWEEP_DURATION, 1.0);
        easedProgress = easeIn(linearProgress);
        const totalTravel = 1 + WAVE_WIDTH * 2;
        wavePos = direction === 1
          ? -WAVE_WIDTH + easedProgress * totalTravel
          : 1 + WAVE_WIDTH - easedProgress * totalTravel;
        sweepActive = linearProgress < 1.0;

        if (!sweepActive) {
          transitionState.active = false;
        }
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const dot of dots) {
        // Cursor glow (always active)
        const dx = dot.x - mx;
        const dy = dot.y - my;
        const cursorDist = Math.sqrt(dx * dx + dy * dy);
        let cursorBrightness = 0;
        if (cursorDist < CURSOR_RADIUS) {
          cursorBrightness = (1 - cursorDist / CURSOR_RADIUS) * 0.3;
        }

        ctx.beginPath();

        if (sweepActive) {
          const dotNorm = dot.x / w;
          const dist = Math.abs(dotNorm - wavePos);
          const influence = smoothstep(1 - dist / WAVE_WIDTH);

          const stretch = influence * MAX_STRETCH * dot.stretchMult;
          const shift = influence * MAX_SHIFT * direction * dot.shiftMult;

          if (stretch > 2) {
            // This dot is stretched into a line
            const lineH = 1.5;
            const sx = dot.x + shift - (direction === 1 ? stretch * 0.3 : stretch * 0.7);
            const sy = dot.y - lineH / 2;
            const r = lineH / 2;

            ctx.moveTo(sx + r, sy);
            ctx.lineTo(sx + stretch - r, sy);
            ctx.arcTo(sx + stretch, sy, sx + stretch, sy + r, r);
            ctx.lineTo(sx + stretch, sy + lineH - r);
            ctx.arcTo(sx + stretch, sy + lineH, sx + stretch - r, sy + lineH, r);
            ctx.lineTo(sx + r, sy + lineH);
            ctx.arcTo(sx, sy + lineH, sx, sy + lineH - r, r);
            ctx.lineTo(sx, sy + r);
            ctx.arcTo(sx, sy, sx + r, sy, r);

            // Stay the same gray tone as the dots — don't brighten
            const a = 0.08 + influence * 0.04;
            ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
          } else {
            // Dot with a slight nudge
            ctx.arc(dot.x + shift * 0.3, dot.y, DOT_SIZE, 0, Math.PI * 2);
            const a = 0.08 + cursorBrightness;
            ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
          }
        } else {
          // Normal dot rendering
          ctx.arc(dot.x, dot.y, DOT_SIZE, 0, Math.PI * 2);
          const a = 0.08 + cursorBrightness;
          ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
        }

        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    }

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", rebuild);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-background"
    />
  );
}
