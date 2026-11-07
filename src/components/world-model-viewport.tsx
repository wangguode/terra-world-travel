"use client";

import React, { useEffect, useRef, useState } from "react";
import type { SpatialHotspot, WorldModelScene } from "@/lib/corridors-data";

interface WorldModelViewportProps {
  scenes: WorldModelScene[];
  destinationCity: string;
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

  for (let i = 0; i < 220; i++) {
    particles.push({
      x: (nextRand() - 0.5) * 320,
      y: 55 + nextRand() * 25,
      z: (nextRand() - 0.5) * 320,
      size: 1.5 + nextRand() * 2.2,
      colorIndex: 2,
    });
  }

  for (let i = 0; i < 340; i++) {
    const tier = i % 3;
    const widthScale = tier === 0 ? 180 : tier === 1 ? 125 : 75;
    const heightBase = tier === 0 ? 35 : tier === 1 ? -5 : -42;
    particles.push({
      x: (nextRand() - 0.5) * widthScale,
      y: heightBase + (nextRand() - 0.5) * 32,
      z: (nextRand() - 0.5) * (widthScale * 0.75),
      size: 2.0 + nextRand() * 3.4,
      colorIndex: tier === 2 ? 0 : tier === 1 ? 1 : 0,
    });
  }

  for (let i = 0; i < 140; i++) {
    const angle = (i / 140) * Math.PI * 2;
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
      tick += 0.008;
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
          Math.max(0.18, (380 - rz) / 310) * (renderMode === "splat" ? 1 : 0.82)
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
      yaw: Math.max(-75, Math.min(75, Math.round(dragStartRef.current.yaw + dx * 0.35))),
      pitch: Math.max(-15, Math.min(45, Math.round(dragStartRef.current.pitch + dy * 0.25))),
    }));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="bg-[#11161d]">
      {/* Top Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#151c25] px-5 py-4 md:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold text-[#ff5a26]">
            {destinationCity} · 三维高斯点云实景视窗
          </span>
          <span className="text-sm tabular-nums text-[#e4e3df]/80">
            {activeScene.coordinates} · {activeScene.elevation}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRenderMode("hybrid")}
            className={`min-h-[38px] px-4 py-1.5 text-sm font-semibold transition-colors ${
              renderMode === "hybrid"
                ? "bg-[#ff5a26] text-[#0a0a0a]"
                : "bg-[#0d1117] text-[#f5f5f3] hover:bg-[#1e2733]"
            }`}
          >
            实景建筑与点云叠加态
          </button>
          <button
            type="button"
            onClick={() => setRenderMode("splat")}
            className={`min-h-[38px] px-4 py-1.5 text-sm font-semibold transition-colors ${
              renderMode === "splat"
                ? "bg-[#ff5a26] text-[#0a0a0a]"
                : "bg-[#0d1117] text-[#f5f5f3] hover:bg-[#1e2733]"
            }`}
          >
            纯三维高斯点云态
          </button>
        </div>
      </div>

      {/* Scene Switcher Strip with Thumbnail Photographs */}
      <div className="grid grid-cols-1 gap-2 bg-[#0a0a0a] p-2 md:grid-cols-3">
        {scenes.map((scene, idx) => {
          const isSelected = idx === selectedSceneIdx;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => selectScene(idx)}
              className={`terra-motion-card flex items-center gap-4 p-4 text-left ${
                isSelected
                  ? "bg-[#1a2430] text-[#f5f5f3]"
                  : "bg-[#11161d] text-[#e4e3df]/80 hover:bg-[#151c25]"
              }`}
            >
              <img
                src={scene.image}
                alt={scene.name}
                className="h-16 w-24 shrink-0 object-cover"
              />
              <div>
                <div className="text-base font-bold text-[#f5f5f3]">
                  {scene.name}
                </div>
                <div className="mt-1 text-sm text-[#e4e3df]/70">
                  {scene.elevation}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive 3D Viewport Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="relative min-h-[420px] cursor-grab select-none overflow-hidden bg-[#070a0e] active:cursor-grabbing lg:col-span-8 lg:min-h-[520px]"
        >
          <img
            src={activeScene.image}
            alt={activeScene.name}
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              renderMode === "hybrid" ? "opacity-85" : "opacity-15"
            }`}
          />

          <canvas
            ref={canvasRef}
            width={920}
            height={540}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />

          {activeScene.hotspots.map((spot) => {
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
                className={`terra-motion-float absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[#ff5a26] text-[#0a0a0a]"
                    : "bg-[#0a0a0a]/90 text-[#f5f5f3] hover:bg-[#1a2430]"
                }`}
              >
                {spot.label}
              </button>
            );
          })}

          {/* Bottom Camera Telemetry & Controls */}
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 bg-[#0a0a0a]/90 px-5 py-3">
            <div className="text-sm tabular-nums text-[#e4e3df]/90">
              空间镜头参数：水平偏航 {camera.yaw}° · 俯仰 {camera.pitch}° · 焦段{" "}
              {camera.zoom.toFixed(2)}x （按住画面左右拖拽可旋转三维点云）
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCamera((c) => ({ ...c, yaw: c.yaw - 18 }));
                }}
                className="min-h-[34px] bg-[#161e28] px-3 py-1 text-sm text-[#f5f5f3] hover:bg-[#ff5a26] hover:text-[#0a0a0a]"
              >
                左旋视角
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCamera({ yaw: 0, pitch: 12, zoom: 1.2 });
                }}
                className="min-h-[34px] bg-[#161e28] px-3 py-1 text-sm text-[#f5f5f3] hover:bg-[#ff5a26] hover:text-[#0a0a0a]"
              >
                复位中轴
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCamera((c) => ({ ...c, yaw: c.yaw + 18 }));
                }}
                className="min-h-[34px] bg-[#161e28] px-3 py-1 text-sm text-[#f5f5f3] hover:bg-[#ff5a26] hover:text-[#0a0a0a]"
              >
                右旋视角
              </button>
            </div>
          </div>
        </div>

        {/* Right Spatial Inspector Panel */}
        <div className="flex flex-col justify-between bg-[#151c25] p-6 md:p-8 lg:col-span-4">
          <div>
            <h3 className="text-2xl font-bold text-[#f5f5f3]">
              {activeScene.name}
            </h3>
            <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-[#e4e3df]/85">
              {activeScene.spatialSummary}
            </p>

            <div className="mt-6 bg-[#11161d] p-4">
              <div className="text-sm font-semibold text-[#ff5a26]">
                黄金游览窗口
              </div>
              <p className="mt-1 max-w-[62ch] text-base text-[#f5f5f3]">
                {activeScene.bestTime}
              </p>

              <div className="mt-4 text-sm font-semibold text-[#ff5a26]">
                门票与预约铁律
              </div>
              <p className="mt-1 max-w-[62ch] text-base text-[#f5f5f3]">
                {activeScene.bookingRule}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-[#0a0a0a] p-5">
            <div className="text-sm font-semibold text-[#ff5a26]">
              当前选中机位锚点：{activeHotspot?.label}
            </div>
            <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-[#e4e3df]/85">
              {activeHotspot?.detail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
