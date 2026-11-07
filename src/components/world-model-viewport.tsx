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

  for (let i = 0; i < 180; i++) {
    particles.push({
      x: (nextRand() - 0.5) * 320,
      y: 55 + nextRand() * 25,
      z: (nextRand() - 0.5) * 320,
      size: 1.3 + nextRand() * 1.8,
      colorIndex: 2,
    });
  }

  for (let i = 0; i < 280; i++) {
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

  // HUD telemetry readout (throttled updates, never blocks pointer drag)
  const [hudAngles, setHudAngles] = useState({ yaw: -12, pitch: 10 });

  // High-frequency 120Hz mutable refs for butter-smooth damped camera physics
  const targetCamRef = useRef({ yaw: -12, pitch: 10, zoom: 1.15 });
  const currentCamRef = useRef({ yaw: -12, pitch: 10, zoom: 1.15 });
  const renderModeRef = useRef<"hybrid" | "splat">("hybrid");
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, yaw: -12, pitch: 10 });
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const lastMoveRef = useRef({ x: 0, y: 0, t: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    renderModeRef.current = renderMode;
  }, [renderMode]);

  useEffect(() => {
    const nextScene = scenes[0];
    setSelectedSceneIdx(0);
    if (nextScene?.hotspots[0]) {
      const preset = nextScene.hotspots[0].cameraPreset;
      setActiveHotspot(nextScene.hotspots[0]);
      targetCamRef.current = { ...preset };
      setHudAngles({ yaw: preset.yaw, pitch: preset.pitch });
    }
  }, [scenes]);

  const selectScene = (idx: number) => {
    const nextScene = scenes[idx] ?? scenes[0];
    setSelectedSceneIdx(idx);
    const firstSpot = nextScene.hotspots[0];
    if (firstSpot) {
      setActiveHotspot(firstSpot);
      targetCamRef.current = { ...firstSpot.cameraPreset };
      setHudAngles({
        yaw: firstSpot.cameraPreset.yaw,
        pitch: firstSpot.cameraPreset.pitch,
      });
    }
  };

  const flyToPreset = (preset: { yaw: number; pitch: number; zoom: number }) => {
    velocityRef.current = { vx: 0, vy: 0 };
    targetCamRef.current = { ...preset };
    setHudAngles({ yaw: Math.round(preset.yaw), pitch: Math.round(preset.pitch) });
  };

  // Single persistent rAF loop per scene — zero teardown during pointer dragging!
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const particles = createSceneParticles(activeScene.id);
    const projected = particles.map(() => ({
      sx: 0,
      sy: 0,
      zDepth: 0,
      r: 1,
      color: "#ffffff",
      alpha: 0.5,
      visible: false,
    }));

    let animId = 0;
    let tick = 0;
    let frameCount = 0;

    const render = () => {
      tick += 0.008;
      frameCount += 1;

      // Apply momentum inertia when finger lifts
      if (!isDraggingRef.current) {
        if (
          Math.abs(velocityRef.current.vx) > 0.02 ||
          Math.abs(velocityRef.current.vy) > 0.02
        ) {
          targetCamRef.current.yaw = Math.max(
            -75,
            Math.min(75, targetCamRef.current.yaw + velocityRef.current.vx)
          );
          targetCamRef.current.pitch = Math.max(
            -15,
            Math.min(45, targetCamRef.current.pitch + velocityRef.current.vy)
          );
          velocityRef.current.vx *= 0.92;
          velocityRef.current.vy *= 0.92;
        }
      }

      // Smooth spring lerp towards target camera
      const cur = currentCamRef.current;
      const tgt = targetCamRef.current;
      cur.yaw += (tgt.yaw - cur.yaw) * 0.14;
      cur.pitch += (tgt.pitch - cur.pitch) * 0.14;
      cur.zoom += (tgt.zoom - cur.zoom) * 0.14;

      // Subtle GPU parallax on background photo for authentic 2.5D/3D spatial depth
      if (imgRef.current) {
        const px = (-cur.yaw * 0.22).toFixed(2);
        const py = (-cur.pitch * 0.18).toFixed(2);
        imgRef.current.style.transform = `scale(1.08) translate3d(${px}px, ${py}px, 0)`;
      }

      // Update HUD text at ~6Hz so React never bottlenecks 120Hz canvas
      if (frameCount % 12 === 0) {
        const ry = Math.round(cur.yaw);
        const rp = Math.round(cur.pitch);
        setHudAngles((prev) =>
          prev.yaw === ry && prev.pitch === rp ? prev : { yaw: ry, pitch: rp }
        );
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const yawRad = ((cur.yaw + Math.sin(tick) * 1.6) * Math.PI) / 180;
      const pitchRad = (cur.pitch * Math.PI) / 180;
      const cosY = Math.cos(yawRad);
      const sinY = Math.sin(yawRad);
      const cosP = Math.cos(pitchRad);
      const sinP = Math.sin(pitchRad);

      const fov = 340 * cur.zoom;
      const isSplatOnly = renderModeRef.current === "splat";

      let count = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const rx = p.x * cosY - p.z * sinY;
        const rz1 = p.x * sinY + p.z * cosY;
        const ry = p.y * cosP - rz1 * sinP;
        const rz = p.y * sinP + rz1 * cosP + 290;

        if (rz <= 30) continue;
        const scale = fov / rz;
        const slot = projected[count++];
        slot.sx = w / 2 + rx * scale;
        slot.sy = h * 0.54 + ry * scale;
        slot.zDepth = rz;
        slot.r = Math.max(1.0, p.size * scale * 0.65);
        slot.color = activeScene.splatPalette[p.colorIndex] ?? "#ffffff";
        slot.alpha = Math.min(
          0.85,
          Math.max(0.12, (380 - rz) / 310) * (isSplatOnly ? 0.95 : 0.45)
        );
      }

      for (let i = 0; i < count; i++) {
        const pt = projected[i];
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
  }, [activeScene]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    velocityRef.current = { vx: 0, vy: 0 };
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: targetCamRef.current.yaw,
      pitch: targetCamRef.current.pitch,
    };
    lastMoveRef.current = {
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(8, now - lastMoveRef.current.t);
    const vx = ((e.clientX - lastMoveRef.current.x) / dt) * 4.2;
    const vy = ((e.clientY - lastMoveRef.current.y) / dt) * 2.8;
    velocityRef.current = { vx, vy };
    lastMoveRef.current = { x: e.clientX, y: e.clientY, t: now };

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    targetCamRef.current.yaw = Math.max(
      -75,
      Math.min(75, dragStartRef.current.yaw + dx * 0.32)
    );
    targetCamRef.current.pitch = Math.max(
      -15,
      Math.min(45, dragStartRef.current.pitch + dy * 0.22)
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    isDraggingRef.current = false;
  };

  return (
    <div className="space-y-3">
      {/* iOS Segmented Scene Selector Pills */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {scenes.map((scene, idx) => {
          const isSelected = idx === selectedSceneIdx;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => selectScene(idx)}
              className={`flex shrink-0 items-center gap-2.5 rounded-2xl p-1.5 pr-3.5 text-left transition-all duration-200 active:scale-[0.97] ${
                isSelected
                  ? "bg-[#1D1D1F] text-white shadow-sm"
                  : "bg-white text-[#1D1D1F] shadow-[0_2px_10px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.05] hover:bg-black/[0.02]"
              }`}
            >
              <img
                src={scene.image}
                alt={scene.name}
                loading="eager"
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

      {/* Apple Maps Flyover Canvas Card with Touch-Action None for Smooth Drag */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative cursor-grab touch-none select-none overflow-hidden rounded-[24px] bg-[#1C1C1E] shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06] active:cursor-grabbing ${
          compact ? "h-[260px]" : "h-[360px] md:h-[420px]"
        }`}
      >
        <img
          ref={imgRef}
          src={activeScene.image}
          alt={activeScene.name}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover will-change-transform transition-opacity duration-300 ${
            renderMode === "hybrid" ? "opacity-95" : "opacity-25"
          }`}
          style={{ transform: "scale(1.08)" }}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        <canvas
          ref={canvasRef}
          width={760}
          height={460}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        {/* Apple Maps Top Floating Pill Bar */}
        <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate rounded-full bg-white/88 px-3 py-1 text-[11px] font-medium text-[#1D1D1F] shadow-sm backdrop-blur-xl">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#34C759]" />
            <span className="truncate">3D Flyover · {activeScene.coordinates}</span>
          </div>

          <div className="flex shrink-0 items-center rounded-full bg-black/45 p-0.5 backdrop-blur-xl">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setRenderMode("hybrid");
              }}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium transition-all active:scale-95 ${
                renderMode === "hybrid"
                  ? "bg-white text-[#1D1D1F] shadow-xs"
                  : "text-white/85 hover:text-white"
              }`}
            >
              实景
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setRenderMode("splat");
              }}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium transition-all active:scale-95 ${
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
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setActiveHotspot(spot);
                flyToPreset(spot.cameraPreset);
              }}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg transition-all duration-200 active:scale-95 ${
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
            视角 {hudAngles.yaw}° · 俯仰 {hudAngles.pitch}° · 滑动环视惯性阻尼
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                flyToPreset({
                  ...targetCamRef.current,
                  yaw: Math.max(-75, targetCamRef.current.yaw - 22),
                });
              }}
              className="whitespace-nowrap rounded-lg bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white transition-transform active:scale-95 hover:bg-white/25"
            >
              左转
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                flyToPreset({ yaw: 0, pitch: 12, zoom: 1.2 });
              }}
              className="whitespace-nowrap rounded-lg bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white transition-transform active:scale-95 hover:bg-white/25"
            >
              回正
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                flyToPreset({
                  ...targetCamRef.current,
                  yaw: Math.min(75, targetCamRef.current.yaw + 22),
                });
              }}
              className="whitespace-nowrap rounded-lg bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white transition-transform active:scale-95 hover:bg-white/25"
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
