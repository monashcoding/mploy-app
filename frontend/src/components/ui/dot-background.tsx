// frontend/src/components/ui/dot-background.tsx
"use client";

import { useEffect, useRef } from 'react';

export default function DotBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 }); // Start mouse off-screen

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    // Handle resize
    const resize = () => {
      const { devicePixelRatio: ratio = 1 } = window;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(ratio, ratio);
    };

    resize();
    window.addEventListener('resize', resize);

    // Grid configuration
    const GRID_SIZE = 25;
    const DOT_SIZE = 1;
    const CURSOR_RADIUS = 100;

    // Create grid of dots
    const dots: { x: number; y: number }[] = [];
    const rows = Math.ceil(canvas.height / GRID_SIZE);
    const cols = Math.ceil(canvas.width / GRID_SIZE);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        dots.push({
          x: j * GRID_SIZE,
          y: i * GRID_SIZE,
        });
      }
    }

    // Handle mouse movement - attach to window instead of canvas
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }; // Move mouse off-screen
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    let animationFrameId: number;

    function animate() {
      if (ctx == null || canvas == null) return
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach(dot => {
        const dx = dot.x - mouseRef.current.x;
        const dy = dot.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let opacity = 0.08; // Lower base opacity
        if (distance < CURSOR_RADIUS) {
          opacity = 0.08 + (1 - distance / CURSOR_RADIUS) * 0.3;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
      <canvas
          ref={canvasRef}
          className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-background"
      />
  );
}