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

  for (let i = 0; i < 200; i++) {
    particles.push({
      x: (nextRand() - 0.5) * 320,
      y: 55 + nextRand() * 25,
      z: (nextRand() - 0.5) * 320,
      size: 1.3 + nextRand() * 1.8,
      colorIndex: 2,
    });
  }

  for (let i = 0; i < 300; i++) {
    const tier = i % 3;
    const widthScale = tier === 0 ? 185 : tier === 1 ? 130 : 78;
    const heightBase = tier === 0 ? 35 : tier === 1 ? -5 : -42;
    particles.push({
      x: (nextRand() - 0.5) * widthScale,
      y: heightBase + (nextRand() - 0.5) * 32,
      z: (nextRand() - 0.5) * (widthScale * 0.75),
      size: 1.8 + nextRand() * 2.8,
      colorIndex: tier === 2 ? 0 : tier === 1 ? 1 : 0,
    });
  }

  return particles;
}

export function WorldModelViewport({
  scenes,
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
      tick += 0.007;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const yawRad = ((camera.yaw + Math.sin(tick) * 2.0) * Math.PI) / 180;
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

        const color = activeScene.splatPalette[p.colorIndex] ?? "#ffffff";
        const alpha = Math.min(
          0.85,
          Math.max(0.12, (380 - rz) / 310) *
            (renderMode === "splat" ? 0.95 : 0.45)
        );
        projected.push({
          sx,
          sy,
          zDepth: rz,
          r: Math.max(1.0, p.size * scale * 0.65),
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
      {/* iOS Segmented Scene Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {scenes.map((scene, idx) => {
          const isSelected = idx === selectedSceneIdx;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => selectScene(idx)}
              className={`flex shrink-0 items-center gap-2.5 rounded-2xl p-1.5 pr-3.5 text-left transition-all ${
                isSelected
                  ? "bg-[#1D1D1F] text-white shadow-sm"
                  : "bg-white text-[#1D1D1F] shadow-[0_2px_10px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.05] hover:bg-black/[0.02]"
              }`}
            >
              <img
                src={scene.image}
                alt={scene.name}
                className="h-10 w-12 shrink-0 rounded-xl object-cover"
              />
              <div>
                <div
                  className={`text-xs font-semibold ${
                    isSelected ? "text-white" : "text-[#1D1D1F]"
                  }`}
                >
                  {scene.name}
                </div>
                <div
                  className={`mt-0.5 text-[11px] ${
                    isSelected ? "text-white/70" : "text-[#86868B]"
                  }`}
                >
                  {scene.elevation}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Apple Maps Flyover Canvas Card */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`relative cursor-grab select-none overflow-hidden rounded-[24px] bg-[#1C1C1E] shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06] active:cursor-grabbing ${
          compact ? "h-[260px]" : "h-[360px] md:h-[420px]"
        }`}
      >
        <img
          src={activeScene.image}
          alt={activeScene.name}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            renderMode === "hybrid" ? "opacity-95" : "opacity-25"
          }`}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        <canvas
          ref={canvasRef}
          width={860}
          height={520}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        {/* Apple Maps Top Floating Pill Bar */}
        <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium text-[#1D1D1F] shadow-sm backdrop-blur-xl">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#34C759]" />
            <span className="truncate">3D Flyover · {activeScene.coordinates}</span>
          </div>

          <div className="flex shrink-0 items-center rounded-full bg-black/45 p-0.5 backdrop-blur-xl">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setRenderMode("hybrid");
              }}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                renderMode === "hybrid"
                  ? "bg-white text-[#1D1D1F] shadow-xs"
                  : "text-white/85 hover:text-white"
              }`}
            >
              实景
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setRenderMode("splat");
              }}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                renderMode === "splat"
                  ? "bg-white text-[#1D1D1F] shadow-xs"
                  : "text-white/85 hover:text-white"
              }`}
            >
              点云
            </button>
          </div>
        </div>

        {/* Apple Maps Style Clean White Spatial Pins */}
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
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg transition-all ${
                isActive
                  ? "scale-105 bg-[#007AFF] text-white ring-2 ring-white"
                  : "bg-white/95 text-[#1D1D1F] backdrop-blur-md hover:bg-white"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-white text-[#007AFF]"
                    : "bg-[#F2F2F7] text-[#1D1D1F]"
                }`}
              >
                {idx + 1}
              </span>
              <span className="whitespace-nowrap">{spot.label}</span>
            </button>
          );
        })}

        {/* Bottom Subtle Camera Controls */}
        <div className="absolute inset-x-3.5 bottom-3.5 flex items-center justify-between gap-2 rounded-2xl bg-black/50 px-3 py-1.5 text-white backdrop-blur-xl">
          <div className="truncate text-[11px] tabular-nums text-white/85">
            视角 {camera.yaw}° · 俯仰 {camera.pitch}° · 拖拽画面可环视
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCamera((c) => ({ ...c, yaw: c.yaw - 18 }));
              }}
              className="whitespace-nowrap rounded-lg bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-white/25"
            >
              左转
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCamera({ yaw: 0, pitch: 12, zoom: 1.2 });
              }}
              className="whitespace-nowrap rounded-lg bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-white/25"
            >
              回正
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCamera((c) => ({ ...c, yaw: c.yaw + 18 }));
              }}
              className="whitespace-nowrap rounded-lg bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-white/25"
            >
              右转
            </button>
          </div>
        </div>
      </div>

      {/* Apple Maps Place Card Sheet */}
      <div className="rounded-[24px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.05]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold tracking-wide text-[#007AFF] uppercase">
              精选机位 · {activeHotspot?.label}
            </div>
            <h4 className="mt-0.5 text-base font-bold text-[#1D1D1F]">
              {activeScene.name}
            </h4>
          </div>
          <span className="rounded-full bg-[#F2F2F7] px-2.5 py-1 text-[11px] font-medium text-[#1D1D1F]">
            24mm / 70mm
          </span>
        </div>

        <p className="mt-2 text-[13px] leading-relaxed text-[#3A3A3C]">
          {activeHotspot?.detail}
        </p>

        <div className="mt-3.5 grid grid-cols-1 gap-2 border-t border-black/[0.06] pt-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#F2F2F7]/80 p-3">
            <div className="text-[11px] font-semibold text-[#86868B]">
              最佳游览时段
            </div>
            <p className="mt-0.5 text-xs leading-relaxed font-medium text-[#1D1D1F]">
              {activeScene.bestTime}
            </p>
          </div>
          <div className="rounded-2xl bg-[#F2F2F7]/80 p-3">
            <div className="text-[11px] font-semibold text-[#86868B]">
              预约与入场规则
            </div>
            <p className="mt-0.5 text-xs leading-relaxed font-medium text-[#1D1D1F]">
              {activeScene.bookingRule}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
