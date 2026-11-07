"use client";

import React, { useEffect, useRef, useState } from "react";
import type { SpatialHotspot, WorldModelScene } from "@/lib/corridors-data";

interface WorldModelViewportProps {
  scenes: WorldModelScene[];
  destinationCity: string;
  compact?: boolean;
}

interface SplatParticle {
  x: number;
  y: number;
  z: number;
  size: number;
  colorIndex: number;
}

function createSceneParticles(seedKey: string): SplatParticle[] {
  let seed = 0;
  for (let i = 0; i < seedKey.length; i++) {
    seed = (seed * 31 + seedKey.charCodeAt(i)) % 1000003;
  }
  const nextRand = () => {
    seed = (seed * 16807 + 11) % 2147483647;
    return (seed & 0x7fffffff) / 2147483647;
  };

  const particles: SplatParticle[] = [];

  // Ground plane & volumetric grid
  for (let i = 0; i < 240; i++) {
    particles.push({
      x: (nextRand() - 0.5) * 320,
      y: 55 + nextRand() * 25,
      z: (nextRand() - 0.5) * 320,
      size: 1.4 + nextRand() * 2.2,
      colorIndex: 2,
    });
  }

  // Architectural tiered structure
  for (let i = 0; i < 360; i++) {
    const tier = i % 3;
    const widthScale = tier === 0 ? 185 : tier === 1 ? 130 : 78;
    const heightBase = tier === 0 ? 35 : tier === 1 ? -5 : -42;
    particles.push({
      x: (nextRand() - 0.5) * widthScale,
      y: heightBase + (nextRand() - 0.5) * 32,
      z: (nextRand() - 0.5) * (widthScale * 0.75),
      size: 2.0 + nextRand() * 3.4,
      colorIndex: tier === 2 ? 0 : tier === 1 ? 1 : 0,
    });
  }

  // Surrounding horizon ridge
  for (let i = 0; i < 150; i++) {
    const angle = (i / 150) * Math.PI * 2;
    const radius = 155 + nextRand() * 45;
    particles.push({
      x: Math.cos(angle) * radius,
      y: -30 - Math.abs(Math.sin(angle * 3)) * 55 + (nextRand() - 0.5) * 18,
      z: Math.sin(angle) * radius,
      size: 1.8 + nextRand() * 2.5,
      colorIndex: 1,
    });
  }

  return particles;
}

export function WorldModelViewport({
  scenes,
  destinationCity,
  compact = false,
}: WorldModelViewportProps) {
  const [selectedSceneIdx, setSelectedSceneIdx] = useState(0);
  const activeScene = scenes[selectedSceneIdx] ?? scenes[0];

  const [activeHotspot, setActiveHotspot] = useState<SpatialHotspot>(
    activeScene.hotspots[0]
  );
  const [renderMode, setRenderMode] = useState<"hybrid" | "splat">("hybrid");
  const [camera, setCamera] = useState({ yaw: -12, pitch: 10, zoom: 1.15 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, yaw: 0, pitch: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const nextScene = scenes[0];
    setSelectedSceneIdx(0);
    if (nextScene?.hotspots[0]) {
      setActiveHotspot(nextScene.hotspots[0]);
      setCamera(nextScene.hotspots[0].cameraPreset);
    }
  }, [scenes]);

  const selectScene = (idx: number) => {
    const nextScene = scenes[idx] ?? scenes[0];
    setSelectedSceneIdx(idx);
    const firstSpot = nextScene.hotspots[0];
    if (firstSpot) {
      setActiveHotspot(firstSpot);
      setCamera(firstSpot.cameraPreset);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles = createSceneParticles(activeScene.id);
    let animId = 0;
    let tick = 0;

    const render = () => {
      tick += 0.009;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const yawRad = ((camera.yaw + Math.sin(tick) * 2.5) * Math.PI) / 180;
      const pitchRad = (camera.pitch * Math.PI) / 180;
      const cosY = Math.cos(yawRad);
      const sinY = Math.sin(yawRad);
      const cosP = Math.cos(pitchRad);
      const sinP = Math.sin(pitchRad);

      const fov = 340 * camera.zoom;
      const projected: Array<{
        sx: number;
        sy: number;
        zDepth: number;
        r: number;
        color: string;
        alpha: number;
      }> = [];

      for (const p of particles) {
        const rx = p.x * cosY - p.z * sinY;
        const rz1 = p.x * sinY + p.z * cosY;
        const ry = p.y * cosP - rz1 * sinP;
        const rz = p.y * sinP + rz1 * cosP + 290;

        if (rz <= 30) continue;
        const scale = fov / rz;
        const sx = w / 2 + rx * scale;
        const sy = h * 0.54 + ry * scale;

        const color = activeScene.splatPalette[p.colorIndex] ?? "#ff5a26";
        const alpha = Math.min(
          0.92,
          Math.max(0.18, (380 - rz) / 310) * (renderMode === "splat" ? 1 : 0.78)
        );
        projected.push({
          sx,
          sy,
          zDepth: rz,
          r: Math.max(1.2, p.size * scale * 0.72),
          color,
          alpha,
        });
      }

      projected.sort((a, b) => b.zDepth - a.zDepth);

      for (const pt of projected) {
        ctx.beginPath();
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.alpha;
        ctx.arc(pt.sx, pt.sy, pt.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(animId);
  }, [activeScene, camera, renderMode]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: camera.yaw,
      pitch: camera.pitch,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setCamera((prev) => ({
      ...prev,
      yaw: Math.max(
        -75,
        Math.min(75, Math.round(dragStartRef.current.yaw + dx * 0.35))
      ),
      pitch: Math.max(
        -15,
        Math.min(45, Math.round(dragStartRef.current.pitch + dy * 0.25))
      ),
    }));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-3">
      {/* Horizontal Apple Maps Flyover Scene Carousel */}
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {scenes.map((scene, idx) => {
          const isSelected = idx === selectedSceneIdx;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => selectScene(idx)}
              className={`group flex shrink-0 items-center gap-2.5 rounded-2xl border p-2 pr-3.5 text-left transition-all ${
                isSelected
                  ? "border-[#ff5a26] bg-gradient-to-r from-[#ff5a26]/20 to-[#1c2533] shadow-lg shadow-[#ff5a26]/10"
                  : "border-white/10 bg-[#141a23]/90 hover:border-white/25"
              }`}
            >
              <img
                src={scene.image}
                alt={scene.name}
                className="h-11 w-14 shrink-0 rounded-xl object-cover"
              />
              <div>
                <div className="text-xs font-bold text-white">{scene.name}</div>
                <div className="mt-0.5 text-[11px] text-white/60">
                  {scene.elevation}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive 3D Flyover Canvas Card */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`relative cursor-grab select-none overflow-hidden rounded-3xl border border-white/15 bg-[#070a0f] shadow-2xl active:cursor-grabbing ${
          compact ? "h-[285px]" : "h-[380px] md:h-[460px]"
        }`}
      >
        <img
          src={activeScene.image}
          alt={activeScene.name}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            renderMode === "hybrid" ? "opacity-85" : "opacity-20"
          }`}
        />

        {/* Vignette gradient for HUD legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/80" />

        <canvas
          ref={canvasRef}
          width={860}
          height={520}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        {/* Top Floating Glass HUD */}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate rounded-full border border-white/15 bg-black/65 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-md">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
            <span className="truncate">3D Flyover · {activeScene.coordinates}</span>
          </div>

          <div className="flex shrink-0 items-center rounded-full border border-white/15 bg-black/65 p-0.5 backdrop-blur-md">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setRenderMode("hybrid");
              }}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                renderMode === "hybrid"
                  ? "bg-[#ff5a26] text-black"
                  : "text-white/75 hover:text-white"
              }`}
            >
              实景融合
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setRenderMode("splat");
              }}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                renderMode === "splat"
                  ? "bg-[#ff5a26] text-black"
                  : "text-white/75 hover:text-white"
              }`}
            >
              高斯点云
            </button>
          </div>
        </div>

        {/* Interactive Spatial Pins */}
        {activeScene.hotspots.map((spot, idx) => {
          const isActive = activeHotspot?.id === spot.id;
          return (
            <button
              key={spot.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveHotspot(spot);
                setCamera(spot.cameraPreset);
              }}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              className={`terra-motion-float absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-xl backdrop-blur-md transition-all ${
                isActive
                  ? "scale-105 border-white/60 bg-[#ff5a26] text-black shadow-[#ff5a26]/40"
                  : "border-white/25 bg-black/75 text-white hover:bg-black/90"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black ${
                  isActive ? "bg-black text-[#ff5a26]" : "bg-[#ff5a26] text-black"
                }`}
              >
                {idx + 1}
              </span>
              <span>{spot.label}</span>
            </button>
          );
        })}

        {/* Bottom Floating Camera Gimbal Bar */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-2xl border border-white/15 bg-black/70 px-3 py-2 backdrop-blur-md">
          <div className="truncate text-[10px] tabular-nums text-white/80">
            偏航 <strong className="text-white">{camera.yaw}°</strong> · 俯仰{" "}
            <strong className="text-white">{camera.pitch}°</strong> ·{" "}
            <span className="text-amber-300">单指拖拽3D旋转</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCamera((c) => ({ ...c, yaw: c.yaw - 18 }));
              }}
              className="whitespace-nowrap rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold text-white hover:bg-[#ff5a26] hover:text-black"
            >
              ↺ 左旋
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCamera({ yaw: 0, pitch: 12, zoom: 1.2 });
              }}
              className="whitespace-nowrap rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold text-white hover:bg-[#ff5a26] hover:text-black"
            >
              中轴
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCamera((c) => ({ ...c, yaw: c.yaw + 18 }));
              }}
              className="whitespace-nowrap rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold text-white hover:bg-[#ff5a26] hover:text-black"
            >
              右旋 ↻
            </button>
          </div>
        </div>
      </div>

      {/* iOS 18 Frosted Bottom Sheet Inspector */}
      <div className="rounded-3xl border border-white/12 bg-gradient-to-b from-[#18202c] to-[#11161f] p-4 shadow-xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#ff5a26]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#ff7a4d]">
              📍 当前选中机位：{activeHotspot?.label}
            </span>
            <h4 className="mt-1 text-base font-bold text-white">
              {activeScene.name}
            </h4>
          </div>
          <span className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
            出片率 99% · 24mm/70mm
          </span>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-white/85">
          {activeHotspot?.detail}
        </p>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-black/35 p-3">
            <div className="text-[11px] font-bold text-amber-400">
              ⏰ 黄金光线与换岗时间
            </div>
            <p className="mt-1 text-xs leading-relaxed text-white/80">
              {activeScene.bestTime}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/35 p-3">
            <div className="text-[11px] font-bold text-sky-400">
              🎫 免排队与门票铁律
            </div>
            <p className="mt-1 text-xs leading-relaxed text-white/80">
              {activeScene.bookingRule}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
