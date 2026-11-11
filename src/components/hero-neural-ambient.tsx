"use client";

import React, { useRef, useEffect } from "react";

export function HeroNeuralAmbient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const render = () => {
      t += 0.006;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = rect.width;
      const h = rect.height;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Apple 风格柔和三色动态环境光斑
      // 1. Apple 经典蓝光斑
      const x1 = w * 0.5 + Math.sin(t * 0.8) * (w * 0.22);
      const y1 = h * 0.45 + Math.cos(t * 0.6) * (h * 0.18);
      const r1 = Math.min(w, h) * 0.55;
      const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1);
      g1.addColorStop(0, "rgba(0, 113, 227, 0.13)");
      g1.addColorStop(0.5, "rgba(0, 113, 227, 0.04)");
      g1.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.arc(x1, y1, r1, 0, Math.PI * 2);
      ctx.fill();

      // 2. 晨曦浅金/琥珀光斑
      const x2 = w * 0.35 + Math.cos(t * 0.7) * (w * 0.2);
      const y2 = h * 0.55 + Math.sin(t * 0.9) * (h * 0.15);
      const r2 = Math.min(w, h) * 0.48;
      const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2);
      g2.addColorStop(0, "rgba(255, 149, 0, 0.08)");
      g2.addColorStop(0.5, "rgba(255, 149, 0, 0.02)");
      g2.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(x2, y2, r2, 0, Math.PI * 2);
      ctx.fill();

      // 3. 极夜靛紫光斑
      const x3 = w * 0.65 + Math.sin(t * 0.5) * (w * 0.18);
      const y3 = h * 0.5 + Math.cos(t * 0.8) * (h * 0.16);
      const r3 = Math.min(w, h) * 0.5;
      const g3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, r3);
      g3.addColorStop(0, "rgba(88, 86, 214, 0.09)");
      g3.addColorStop(0.5, "rgba(88, 86, 214, 0.02)");
      g3.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = g3;
      ctx.beginPath();
      ctx.arc(x3, y3, r3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-90 transition-opacity duration-1000"
    />
  );
}
