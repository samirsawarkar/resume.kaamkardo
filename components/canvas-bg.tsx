"use client";

import { useEffect, useRef } from "react";

/**
 * Pure box-grid animated canvas background.
 * - 40px grid squares
 * - Pulsing dots at every 4th intersection (160px apart)
 * - Center vignette for content readability
 * No particles, no text, no formulas.
 */
export default function CanvasBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = window.innerWidth;
    let H = window.innerHeight;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener("resize", resize);

    const GRID = 40;
    let t = 0;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const draw = () => {
      t++;
      const dark = document.documentElement.classList.contains("dark");
      const bgColor = dark ? "#0A0A0A" : "#FFFFFF";

      // ── Fill background ─────────────────────────────────────────
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);

      // ── Box Grid (40px squares) ──────────────────────────────────
      ctx.strokeStyle = dark
        ? "rgba(255,255,255,0.055)"
        : "rgba(0,0,0,0.055)";
      ctx.lineWidth = 1;

      for (let x = 0; x <= W; x += GRID) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y <= H; y += GRID) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // ── Pulsing intersection dots (every 4th = every 160px) ──────
      for (let x = 0; x <= W; x += GRID * 4) {
        for (let y = 0; y <= H; y += GRID * 4) {
          const pulse =
            0.5 + 0.5 * Math.sin(t * 0.025 + x * 0.04 + y * 0.04);
          const radius = 0.8 + pulse * 1.6; // 0.8 → 2.4 px
          const alpha = dark
            ? 0.04 + pulse * 0.16 // 0.04 → 0.20 in dark
            : 0.04 + pulse * 0.12; // 0.04 → 0.16 in light

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = dark
            ? `rgba(255,255,255,${alpha})`
            : `rgba(0,0,0,${alpha})`;
          ctx.fill();
        }
      }

      // ── Center radial vignette ───────────────────────────────────
      // Transparent center → bg-color edges at 68% opacity
      // Protects readability of central content
      const vigR = dark ? 10 : 255;
      const vig = ctx.createRadialGradient(
        W / 2, H / 2, H * 0.08,
        W / 2, H / 2, H * 0.82
      );
      vig.addColorStop(0, `rgba(${vigR},${vigR},${vigR},0)`);
      vig.addColorStop(1, `rgba(${vigR},${vigR},${vigR},0.68)`);
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      animId = reducedMotion ? -1 : requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
