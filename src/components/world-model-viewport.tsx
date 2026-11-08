"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Compass,
  Sun,
  Moon,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Eye,
  Layers,
  ChevronRight,
  Maximize2,
  Sparkles,
} from "lucide-react";
import type {
  SpatialHotspot,
  WorldModelScene,
  TrajectoryWaypoint,
} from "@/lib/corridors-data";

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

type SpatialFeatureMode = "trajectory" | "temporal" | "explore";

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

  // 天空与远景穹顶粒子
  for (let i = 0; i < 220; i++) {
    particles.push({
      x: (nextRand() - 0.5) * 360,
      y: 60 + nextRand() * 30,
      z: (nextRand() - 0.5) * 360,
      size: 1.2 + nextRand() * 1.8,
      colorIndex: 2,
    });
  }

  // 建筑与地面实体特征点云
  for (let i = 0; i < 340; i++) {
    const tier = i % 3;
    const widthScale = tier === 0 ? 190 : tier === 1 ? 140 : 85;
    const heightBase = tier === 0 ? 35 : tier === 1 ? -5 : -45;
    particles.push({
      x: (nextRand() - 0.5) * widthScale,
      y: heightBase + (nextRand() - 0.5) * 36,
      z: (nextRand() - 0.5) * (widthScale * 0.75),
      size: 1.6 + nextRand() * 3.0,
      colorIndex: tier === 2 ? 0 : tier === 1 ? 1 : 0,
    });
  }

  return particles;
}

// 物理太阳光影与色温计算
function calculateSolarLighting(hour: number) {
  // hour: 6.0 ~ 23.0
  let elevation = 0;
  let kelvin = 5500;
  let filterCss = "";
  let lightDescription = "";

  if (hour < 6.5) {
    // 黎明晨曦 (06:00 - 06:30)
    elevation = 2 + (hour - 6.0) * 8;
    kelvin = 3200;
    filterCss = "brightness(0.75) contrast(1.1) saturate(1.2) hue-rotate(-15deg)";
    lightDescription = "晨曦破晓 · 低角侧光，建筑长投影拉伸，空气透光度极高";
  } else if (hour < 9.0) {
    // 清晨柔光 (06:30 - 09:00)
    elevation = 6 + (hour - 6.5) * 12;
    kelvin = 4200;
    filterCss = "brightness(0.92) contrast(1.05) saturate(1.15)";
    lightDescription = "清晨柔和侧顺光 · 建筑细部质感分明，晨间客流低谷最佳取景";
  } else if (hour < 16.5) {
    // 正午高照 (09:00 - 16:30)
    const middayOffset = Math.abs(hour - 12.5);
    elevation = 68 - middayOffset * 8;
    kelvin = 6200;
    filterCss = "brightness(1.06) contrast(1.12) saturate(1.05)";
    lightDescription = "高照顶光 · 色温纯净通透，阴影收缩于建筑基座，视野纵深最远";
  } else if (hour < 19.0) {
    // 黄金日落 (16:30 - 19:00) Golden Hour
    elevation = Math.max(1, 18 - (hour - 16.5) * 7);
    kelvin = 2800;
    filterCss = "brightness(0.95) contrast(1.25) saturate(1.4) sepia(0.25) hue-rotate(-10deg)";
    lightDescription = "黄金时刻 (Golden Hour) · 暖金落日漫射，飞檐与天际线轮廓光绝美";
  } else {
    // 蓝调与暗夜 (19:00 - 23:00) Blue Hour / Night
    elevation = -5 - (hour - 19.0) * 3;
    kelvin = 8500;
    filterCss = "brightness(0.55) contrast(1.35) saturate(1.3) hue-rotate(25deg)";
    lightDescription = "蓝调与深夜 · 城市霓虹泛光与历史建筑泛光照明交织，极具赛博氛围";
  }

  return { elevation: Math.round(elevation), kelvin, filterCss, lightDescription };
}

export function WorldModelViewport({
  scenes,
  destinationCity,
  compact = false,
}: WorldModelViewportProps) {
  const [selectedSceneIdx, setSelectedSceneIdx] = useState(0);
  const activeScene = scenes[selectedSceneIdx] ?? scenes[0];

  const [activeFeatureMode, setActiveFeatureMode] = useState<SpatialFeatureMode>("trajectory");

  // 1. 动线推演状态
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isAutoCruising, setIsAutoCruising] = useState(false);

  // 2. 24小时物理光影时空演变滑块 (默认下午 17:30 黄金时刻)
  const [simulatedHour, setSimulatedHour] = useState<number>(17.5);

  // 3. 历史孪生滑块对比位置 (0-100%)
  const [splitPos, setSplitPos] = useState(50);
  const [renderMode, setRenderMode] = useState<"hybrid" | "splat">("hybrid");

  // 陀螺仪遥测角度
  const [hudAngles, setHudAngles] = useState({ yaw: -12, pitch: 10 });

  // 120Hz 物理相机与动画状态
  const targetCamRef = useRef({ yaw: -12, pitch: 10, zoom: 1.15 });
  const currentCamRef = useRef({ yaw: -12, pitch: 10, zoom: 1.15 });
  const renderModeRef = useRef<"hybrid" | "splat">("hybrid");
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, yaw: -12, pitch: 10 });
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const lastMoveRef = useRef({ x: 0, y: 0, t: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const waypoints = useMemo(() => {
    return (
      activeScene.trajectoryWaypoints ?? [
        {
          step: 1,
          title: "核心到达与换乘口",
          hint: "第一视角沿无障碍指示直行，避开拥挤旅行团通道",
          cameraPreset: { yaw: -24, pitch: 6, zoom: 1.1 },
        },
        {
          step: 2,
          title: "中轴全景观察机位",
          hint: "空间模型标定最佳机位，建筑对称度与景深完美",
          cameraPreset: { yaw: 0, pitch: 12, zoom: 1.25 },
        },
        {
          step: 3,
          title: "快速出站与接驳通道",
          hint: "右转直通出租车乘车点与外币兑换机，节省15分钟",
          cameraPreset: { yaw: 24, pitch: 8, zoom: 1.18 },
        },
      ]
    );
  }, [activeScene]);

  const temporal = useMemo(() => {
    return (
      activeScene.temporalComparison ?? {
        labelA: "盛世原貌 / 历史数字复原",
        labelB: "现代实景 / 空间实测点云",
        descA: "严格基于历史营造则例构建的数字原貌，斗拱飞檐雕梁画栋重现辉煌盛景。",
        descB: "2026 年现代高斯点云精准扫描实景，历经风雨修缮的历史沉淀与现代城市共生。",
      }
    );
  }, [activeScene]);

  const solarInfo = useMemo(() => calculateSolarLighting(simulatedHour), [simulatedHour]);

  useEffect(() => {
    renderModeRef.current = renderMode;
  }, [renderMode]);

  const handleSceneSelect = (idx: number) => {
    setSelectedSceneIdx(idx);
    setActiveStepIdx(0);
    setIsAutoCruising(false);
    const nextScene = scenes[idx] ?? scenes[0];
    if (nextScene?.hotspots[0]) {
      const preset = nextScene.hotspots[0].cameraPreset;
      targetCamRef.current = { ...preset };
      setHudAngles({ yaw: preset.yaw, pitch: preset.pitch });
    }
  };

  const flyToPreset = (preset: { yaw: number; pitch: number; zoom: number }) => {
    velocityRef.current = { vx: 0, vy: 0 };
    targetCamRef.current = { ...preset };
    setHudAngles({ yaw: Math.round(preset.yaw), pitch: Math.round(preset.pitch) });
  };

  const handleStepJump = (idx: number, wp: TrajectoryWaypoint) => {
    setActiveStepIdx(idx);
    flyToPreset(wp.cameraPreset);
  };

  // 连续自动运镜巡航逻辑
  useEffect(() => {
    if (!isAutoCruising) return;

    const interval = setInterval(() => {
      setActiveStepIdx((prev) => {
        const next = (prev + 1) % waypoints.length;
        const targetWp = waypoints[next];
        if (targetWp) {
          flyToPreset(targetWp.cameraPreset);
        }
        return next;
      });
    }, 3600);

    return () => clearInterval(interval);
  }, [isAutoCruising, waypoints]);

  // 120Hz 连续物理相机运镜与高斯点云粒子渲染
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
    }));

    let animId = 0;
    let tick = 0;
    let frameCount = 0;

    const render = () => {
      tick += 0.008;
      frameCount += 1;

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

      // 相机平滑插值 (Camera Trajectory Smoothing)
      const cur = currentCamRef.current;
      const tgt = targetCamRef.current;
      cur.yaw += (tgt.yaw - cur.yaw) * 0.12;
      cur.pitch += (tgt.pitch - cur.pitch) * 0.12;
      cur.zoom += (tgt.zoom - cur.zoom) * 0.12;

      // 背景微视差映射
      if (imgRef.current) {
        const px = (-cur.yaw * 0.26).toFixed(2);
        const py = (-cur.pitch * 0.2).toFixed(2);
        imgRef.current.style.transform = `scale(${cur.zoom * 1.05}) translate3d(${px}px, ${py}px, 0)`;
      }

      if (frameCount % 8 === 0) {
        const ry = Math.round(cur.yaw);
        const rp = Math.round(cur.pitch);
        setHudAngles((prev) =>
          prev.yaw === ry && prev.pitch === rp ? prev : { yaw: ry, pitch: rp }
        );
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const yawRad = ((cur.yaw + Math.sin(tick) * 1.2) * Math.PI) / 180;
      const pitchRad = (cur.pitch * Math.PI) / 180;
      const cosY = Math.cos(yawRad);
      const sinY = Math.sin(yawRad);
      const cosP = Math.cos(pitchRad);
      const sinP = Math.sin(pitchRad);

      const fov = 350 * cur.zoom;
      const isSplatOnly = renderModeRef.current === "splat";

      let count = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const rx = p.x * cosY - p.z * sinY;
        const rz1 = p.x * sinY + p.z * cosY;
        const ry = p.y * cosP - rz1 * sinP;
        const rz = p.y * sinP + rz1 * cosP + 290;

        if (rz <= 25) continue;
        const scale = fov / rz;
        const slot = projected[count++];
        slot.sx = w / 2 + rx * scale;
        slot.sy = h * 0.52 + ry * scale;
        slot.zDepth = rz;
        slot.r = Math.max(1.1, p.size * scale * 0.7);
        slot.color = activeScene.splatPalette[p.colorIndex] ?? "#ffffff";
        slot.alpha = Math.min(
          0.9,
          Math.max(0.15, (390 - rz) / 320) * (isSplatOnly ? 0.95 : 0.45)
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

  // 鼠标与触控拖拽监听
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

  // 格式化模拟时间 (e.g. 17.5 -> 17:30)
  const formatSimTime = (val: number) => {
    const hours = Math.floor(val);
    const minutes = Math.round((val - hours) * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* 1. 核心世界模型模式控制切换器 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-1 rounded-xl bg-white/[0.05] p-1 border border-white/[0.08]">
          <button
            type="button"
            onClick={() => {
              setActiveFeatureMode("trajectory");
              setIsAutoCruising(false);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeFeatureMode === "trajectory"
                ? "bg-white text-black shadow-md shadow-white/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>第一视角空间动线推演</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFeatureMode("temporal");
              setIsAutoCruising(false);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeFeatureMode === "temporal"
                ? "bg-white text-black shadow-md shadow-white/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sun className="h-3.5 w-3.5 text-amber-400" />
            <span>24h 时空光影与物理孪生</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFeatureMode("explore");
              setIsAutoCruising(false);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeFeatureMode === "explore"
                ? "bg-white text-black shadow-md shadow-white/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>3D 高斯点云自由漫游</span>
          </button>
        </div>

        {/* 场景选择标签 */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {scenes.map((scene, idx) => {
            const isSelected = idx === selectedSceneIdx;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => handleSceneSelect(idx)}
                className={`group flex shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-left transition-all ${
                  isSelected
                    ? "border-[#ff5a26] bg-[#ff5a26]/10 text-white shadow-sm shadow-[#ff5a26]/10"
                    : "border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <img
                  src={scene.image}
                  alt={scene.name}
                  className="h-6 w-9 shrink-0 rounded-md object-cover ring-1 ring-white/10"
                />
                <div className="text-left">
                  <div className="text-xs font-medium leading-none">{scene.name}</div>
                  <div className="text-[10px] font-mono-numbers text-zinc-500 mt-0.5">{scene.elevation}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 主三维世界模型视窗舞台 (World Model Canvas Stage) */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`group relative cursor-grab touch-none select-none overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0c0c0e] shadow-2xl active:cursor-grabbing ${
          compact ? "h-[320px]" : "h-[440px] md:h-[520px]"
        }`}
      >
        {/* 背景高保真摄影与时空光影着色层 */}
        <img
          ref={imgRef}
          src={activeScene.image}
          alt={activeScene.name}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover will-change-transform transition-opacity duration-300 ${
            renderMode === "hybrid" ? "opacity-95" : "opacity-25"
          }`}
          style={{
            transform: "scale(1.1)",
            filter:
              activeFeatureMode === "temporal"
                ? solarInfo.filterCss
                : undefined,
          }}
        />

        {/* 历史时空孪生滑块对比层 (Temporal Spatiotemporal Twin Overlay) */}
        {activeFeatureMode === "temporal" && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{ width: `${splitPos}%`, borderRight: "2px solid #ff5a26" }}
          >
            <div
              className="absolute inset-0 h-full w-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${activeScene.image})`,
                filter: "sepia(0.8) contrast(1.2) brightness(0.85) hue-rotate(-20deg)",
                transform: "scale(1.1)",
              }}
            >
              <div className="absolute top-14 left-4 rounded-md border border-amber-500/30 bg-black/80 px-2.5 py-1 text-[10px] font-mono-numbers font-medium text-amber-400 backdrop-blur-md">
                {temporal.labelA}
              </div>
            </div>
          </div>
        )}

        {/* 3D 高斯点云动态投影画布 (3DGS Splat Canvas) */}
        <canvas
          ref={canvasRef}
          width={920}
          height={560}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        {/* 顶部专业 HUD 遥测仪表盘 */}
        <div className="absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/75 px-3 py-1 text-[11px] font-mono-numbers text-white backdrop-blur-xl shadow-lg">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-zinc-200">
              {activeFeatureMode === "trajectory"
                ? `航路动线推演 · 航点 ${activeStepIdx + 1}/${waypoints.length}`
                : activeFeatureMode === "temporal"
                ? `物理光影孪生 · ${formatSimTime(simulatedHour)} (${solarInfo.elevation}° Elev / ${solarInfo.kelvin}K)`
                : `3D 自由漫游 · ${activeScene.coordinates}`}
            </span>
          </div>

          {/* 渲染模式与遥测参数 */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] font-mono-numbers text-zinc-400 backdrop-blur-md">
              <span>YAW: {hudAngles.yaw}°</span>
              <span className="text-zinc-600">|</span>
              <span>PITCH: {hudAngles.pitch}°</span>
              <span className="text-zinc-600">|</span>
              <span>SPLAT: 1.42M</span>
            </div>

            <div className="flex shrink-0 items-center rounded-full border border-white/10 bg-black/70 p-0.5 backdrop-blur-xl">
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setRenderMode("hybrid");
                }}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${
                  renderMode === "hybrid"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                实景混合
              </button>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setRenderMode("splat");
                }}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${
                  renderMode === "splat"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                3D 高斯点云
              </button>
            </div>
          </div>
        </div>

        {/* 模式 1：动线巡航浮层提示与自动播放控制器 */}
        {activeFeatureMode === "trajectory" && (
          <div className="pointer-events-none absolute inset-x-4 bottom-5 flex flex-col items-center">
            <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-2xl border border-white/15 bg-black/85 p-3.5 text-white backdrop-blur-xl shadow-2xl max-w-lg w-full">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#ff5a26] px-2 py-0.5 text-[10px] font-mono-numbers font-bold text-white uppercase">
                    STEP {activeStepIdx + 1}
                  </span>
                  <span className="text-sm font-bold text-white tracking-tight">
                    {waypoints[activeStepIdx]?.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAutoCruising(!isAutoCruising)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    isAutoCruising
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                      : "border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {isAutoCruising ? (
                    <>
                      <Pause className="h-3 w-3" />
                      <span>正在巡航</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      <span>自动运镜巡航</span>
                    </>
                  )}
                </button>
              </div>

              <p className="w-full text-xs text-zinc-300 leading-relaxed">
                {waypoints[activeStepIdx]?.hint}
              </p>

              {/* 节点步进进度条 */}
              <div className="flex w-full gap-1.5 pt-1">
                {waypoints.map((wp, idx) => (
                  <button
                    key={wp.step}
                    type="button"
                    onClick={() => handleStepJump(idx, wp)}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      idx === activeStepIdx
                        ? "bg-[#ff5a26]"
                        : "bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 模式 2：24小时物理时空演化与光影推演控制条 */}
        {activeFeatureMode === "temporal" && (
          <div className="pointer-events-auto absolute inset-x-4 bottom-5 flex flex-col items-center">
            <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-black/85 p-4 text-white backdrop-blur-xl shadow-2xl max-w-xl w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">
                    24小时太阳高度角与环境光影演算
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono-numbers text-xs">
                  <span className="rounded bg-white/10 px-2 py-0.5 text-amber-300 font-semibold">
                    {formatSimTime(simulatedHour)}
                  </span>
                  <span className="text-zinc-400">
                    高度角: {solarInfo.elevation}° | 色温: {solarInfo.kelvin}K
                  </span>
                </div>
              </div>

              {/* 时间滑块 */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono-numbers text-zinc-500">06:00 晨</span>
                <input
                  type="range"
                  min="6.0"
                  max="23.0"
                  step="0.25"
                  value={simulatedHour}
                  onChange={(e) => setSimulatedHour(parseFloat(e.target.value))}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-[#ff5a26]"
                />
                <span className="text-[11px] font-mono-numbers text-zinc-500">23:00 夜</span>
              </div>

              <div className="flex items-start gap-2 border-t border-white/10 pt-2 text-[11px] text-zinc-300">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#ff5a26] mt-0.5" />
                <span>{solarInfo.lightDescription}</span>
              </div>

              {/* 历史原貌对比分割线滑块 */}
              <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-zinc-400">
                <span>历史原貌 ({splitPos}%)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitPos}
                  onChange={(e) => setSplitPos(parseInt(e.target.value, 10))}
                  className="mx-2 h-1.5 w-32 cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-amber-500"
                />
                <span>现代实景 ({100 - splitPos}%)</span>
              </div>
            </div>
          </div>
        )}

        {/* 模式 3：3D 自由漫游操控指南 */}
        {activeFeatureMode === "explore" && (
          <div className="pointer-events-none absolute inset-x-4 bottom-5 flex justify-center">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/75 px-4 py-2 text-xs text-zinc-300 backdrop-blur-xl">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
              <span>按住鼠标左键或在屏幕滑动可 360° 旋转俯仰视角，滚轮可平滑推进距离</span>
            </div>
          </div>
        )}
      </div>

      {/* 底部场景空间与避坑硬核摘要 (Apple Pro Card) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
          <div className="text-[11px] font-mono-numbers text-zinc-500 uppercase tracking-wider">
            Spatial Anchor 空间基准
          </div>
          <div className="mt-1 text-xs font-semibold text-white">{activeScene.name}</div>
          <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
            {activeScene.spatialSummary}
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
          <div className="text-[11px] font-mono-numbers text-zinc-500 uppercase tracking-wider">
            Optimal Window 最佳光线与时段
          </div>
          <div className="mt-1 text-xs font-semibold text-emerald-400">{activeScene.bestTime}</div>
          <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
            世界模型已预先计算人群流量波峰波谷与太阳方位角，建议按预演时段前往。
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
          <div className="text-[11px] font-mono-numbers text-zinc-500 uppercase tracking-wider">
            Rule & Booking 通关预约避坑
          </div>
          <div className="mt-1 text-xs font-semibold text-amber-400">{activeScene.bookingRule}</div>
          <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
            避免现场因未预约或支付不支持而受阻，提前在控制台中完成离线备忘。
          </p>
        </div>
      </div>
    </div>
  );
}
