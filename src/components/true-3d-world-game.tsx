"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { SkySoundEngine } from "@/world/audio";

interface True3DWorldGameProps {
  onToggleSpecs?: () => void;
}

interface EarthPreset {
  id: string;
  label: string;
  title: string;
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  exaggeration: number;
}

const EARTH_PRESETS: EarthPreset[] = [
  {
    id: "matterhorn",
    label: "马特洪峰",
    title: "真实地球 · 瑞士阿尔卑斯马特洪峰",
    center: [7.6586, 45.9763],
    zoom: 13.3,
    pitch: 76,
    bearing: -32,
    exaggeration: 1.35,
  },
  {
    id: "manhattan",
    label: "纽约曼哈顿",
    title: "真实地球 · 纽约曼哈顿 3D 天际线",
    center: [-73.9855, 40.7484],
    zoom: 15.3,
    pitch: 68,
    bearing: 24,
    exaggeration: 1.1,
  },
  {
    id: "fuji",
    label: "日本富士山",
    title: "真实地球 · 日本富士山 3D 火山地貌",
    center: [138.7274, 35.3606],
    zoom: 12.6,
    pitch: 71,
    bearing: 118,
    exaggeration: 1.35,
  },
  {
    id: "hongkong",
    label: "香港维港",
    title: "真实地球 · 香港维多利亚港与太平山",
    center: [114.1694, 22.2855],
    zoom: 14.9,
    pitch: 68,
    bearing: -18,
    exaggeration: 1.25,
  },
  {
    id: "zhangjiajie",
    label: "张家界",
    title: "真实地球 · 湖南张家界天门山绝壁",
    center: [110.4785, 29.051],
    zoom: 13.4,
    pitch: 75,
    bearing: 38,
    exaggeration: 1.45,
  },
  {
    id: "kyoto",
    label: "京都清水寺",
    title: "真实地球 · 日本京都东山古刹",
    center: [135.785, 34.9949],
    zoom: 15.2,
    pitch: 66,
    bearing: 72,
    exaggeration: 1.3,
  },
];

export default function True3DWorldGame({ onToggleSpecs }: True3DWorldGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapHostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const soundRef = useRef<SkySoundEngine | null>(null);

  const [activeId, setActiveId] = useState<string>("matterhorn");
  const [ready, setReady] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const [isCinematic, setIsCinematic] = useState(true);
  const isCinematicRef = useRef(true);
  useEffect(() => {
    isCinematicRef.current = isCinematic;
  }, [isCinematic]);

  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [telemetry, setTelemetry] = useState({
    lat: "45.976°N",
    lon: "7.659°E",
    pitch: 76,
    fps: 60,
  });

  useEffect(() => {
    const host = mapHostRef.current;
    if (!host) return;

    let map: maplibregl.Map;
    try {
      // 指定静态托管的独立 Worker，避免 Next.js webpack 打包内联 Blob Worker 失效
      maplibregl.setWorkerUrl("/vendor/maplibre-gl-worker.js");
      const initial = EARTH_PRESETS[0];
      map = new maplibregl.Map({
        container: host,
        center: initial.center,
        zoom: initial.zoom,
        pitch: initial.pitch,
        bearing: initial.bearing,
        maxPitch: 85,
        attributionControl: false,
        style: {
          version: 8,
          sources: {
            satellite: {
              type: "raster",
              tiles: [
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              ],
              tileSize: 256,
              maxzoom: 18,
              attribution: "Esri World Imagery",
            },
            terrainDem: {
              type: "raster-dem",
              tiles: [
                "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
              ],
              encoding: "terrarium",
              tileSize: 256,
              maxzoom: 14,
            },
            openmaptiles: {
              type: "vector",
              url: "https://tiles.openfreemap.org/planet",
            },
          },
          sky: {
            "sky-color": "#1c4e8f",
            "sky-horizon-blend": 0.62,
            "horizon-color": "#d4e6f7",
            "horizon-fog-blend": 0.92,
            "fog-color": "#cce0f3",
            "fog-ground-blend": 0.35,
          },
          layers: [
            {
              id: "earth-atmosphere-bg",
              type: "background",
              paint: {
                "background-color": "#cce0f3",
              },
            },
            {
              id: "satellite-layer",
              type: "raster",
              source: "satellite",
              minzoom: 0,
              maxzoom: 22,
            },
            {
              id: "real-3d-buildings",
              type: "fill-extrusion",
              source: "openmaptiles",
              "source-layer": "building",
              minzoom: 13.8,
              paint: {
                "fill-extrusion-color": [
                  "interpolate",
                  ["linear"],
                  ["coalesce", ["get", "render_height"], 12],
                  0,
                  "#8a949e",
                  40,
                  "#a8b4c0",
                  120,
                  "#c9d5e2",
                  260,
                  "#e8f0f8",
                ],
                "fill-extrusion-height": ["coalesce", ["get", "render_height"], 12],
                "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
                "fill-extrusion-opacity": 0.94,
                "fill-extrusion-vertical-gradient": true,
              },
            },
          ],
          terrain: {
            source: "terrainDem",
            exaggeration: initial.exaggeration,
          },
        },
      });
    } catch {
      queueMicrotask(() => setRenderError(true));
      return;
    }

    mapRef.current = map;
    const sound = new SkySoundEngine();
    soundRef.current = sound;

    map.on("load", () => {
      setReady(true);
    });

    // 用户手动拖拽或滚轮时自动暂停电影巡航，交还自由控制权
    const stopAutoOnInteract = () => {
      if (isCinematicRef.current) {
        setIsCinematic(false);
      }
    };
    map.on("dragstart", stopAutoOnInteract);
    map.on("wheel", stopAutoOnInteract);

    // 键盘飞行控制（WASD 航拍移动、Q/E 俯仰、Shift 加速、C 切换巡航）
    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (k === "c") {
        setIsCinematic((v) => !v);
      } else if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        if (isCinematicRef.current) setIsCinematic(false);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      delete keys[e.key.toLowerCase()];
    };
    const onBlur = () => {
      for (const k of Object.keys(keys)) delete keys[k];
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    let animId = 0;
    let lastTime = performance.now();
    let fpsFrames = 0;
    let fpsAcc = 0;
    let measuredFps = 60;

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      fpsFrames++;
      fpsAcc += dt;
      if (fpsAcc >= 0.5) {
        measuredFps = Math.round(fpsFrames / fpsAcc);
        fpsFrames = 0;
        fpsAcc = 0;
        const c = map.getCenter();
        setTelemetry({
          lat: `${Math.abs(c.lat).toFixed(3)}°${c.lat >= 0 ? "N" : "S"}`,
          lon: `${Math.abs(c.lng).toFixed(3)}°${c.lng >= 0 ? "E" : "W"}`,
          pitch: Math.round(map.getPitch()),
          fps: measuredFps,
        });
      }

      if (isCinematicRef.current && !map.isMoving()) {
        map.setBearing(map.getBearing() + dt * 5.2);
      } else {
        const panSpeed = (keys["shift"] ? 520 : 240) * dt;
        let dx = 0;
        let dy = 0;
        if (keys["w"] || keys["arrowup"]) dy -= panSpeed;
        if (keys["s"] || keys["arrowdown"]) dy += panSpeed;
        if (keys["a"] || keys["arrowleft"]) dx -= panSpeed;
        if (keys["d"] || keys["arrowright"]) dx += panSpeed;
        if (dx !== 0 || dy !== 0) {
          map.panBy([dx, dy], { animate: false });
          sound.updateFlightSpeed(keys["shift"] ? 1.0 : 0.45);
        } else {
          sound.updateFlightSpeed(0.12);
        }
        if (keys["q"]) map.setPitch(Math.max(15, map.getPitch() - 35 * dt));
        if (keys["e"]) map.setPitch(Math.min(85, map.getPitch() + 35 * dt));
      }
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      sound.dispose();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const flyToPreset = (preset: EarthPreset) => {
    setActiveId(preset.id);
    const map = mapRef.current;
    if (!map) return;
    map.setTerrain({ source: "terrainDem", exaggeration: preset.exaggeration });
    map.flyTo({
      center: preset.center,
      zoom: preset.zoom,
      pitch: preset.pitch,
      bearing: preset.bearing,
      duration: 2400,
      essential: true,
    });
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundRef.current?.setMuted(next);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentPreset = EARTH_PRESETS.find((p) => p.id === activeId) ?? EARTH_PRESETS[0];

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100dvh-48px)] min-h-[580px] w-full overflow-hidden select-none bg-[#c8dcf0] font-sans"
    >
      <div ref={mapHostRef} className="h-full w-full" />

      {renderError && (
        <div role="alert" className="absolute inset-0 z-50 flex items-center justify-center bg-[#0b1526] p-8 text-center text-white">
          <p>无法启动真实地球 WebGL 渲染器，请启用浏览器硬件加速后重试。</p>
        </div>
      )}

      {/* 左上角：真实地球 GPS 遥测 */}
      <div
        role="status"
        className="pointer-events-none absolute top-3 left-3 sm:top-4 sm:left-4 z-20 rounded-2xl border border-white/15 bg-slate-950/65 px-3 py-2 sm:px-4 sm:py-2.5 text-white backdrop-blur-md"
      >
        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium tracking-wider text-sky-300">
          <span className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
          <span>{ready ? currentPreset.title : "正在加载真实卫星 3D 地形…"}</span>
        </div>
        <div className="mt-1 hidden sm:flex items-center gap-3 text-[11px] text-white/70 tabular-nums">
          <span>{telemetry.lat}</span>
          <span>{telemetry.lon}</span>
          <span>倾角 {telemetry.pitch}°</span>
          <span className="text-emerald-400">{telemetry.fps} FPS</span>
        </div>
      </div>

      {/* 顶部居中：全球真实地标一键飞行传送 */}
      <div className="absolute top-14 left-3 right-3 sm:right-auto sm:top-4 sm:left-1/2 sm:-translate-x-1/2 z-20 flex items-center gap-1 overflow-x-auto rounded-full border border-white/15 bg-slate-950/70 p-1 backdrop-blur-md no-scrollbar">
        {EARTH_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => flyToPreset(preset)}
            className={`whitespace-nowrap rounded-full px-2.5 sm:px-3 py-1 text-[11px] sm:text-[12px] transition cursor-pointer ${
              activeId === preset.id
                ? "bg-[#0071e3] text-white font-medium"
                : "text-white/75 hover:text-white"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* 右上角：精简功能胶囊 */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setIsCinematic((v) => !v)}
          className={`rounded-full border px-3 py-1.5 text-[11px] sm:text-[12px] font-medium backdrop-blur-md transition cursor-pointer ${
            isCinematic
              ? "border-amber-400 bg-amber-400 text-slate-950"
              : "border-white/20 bg-slate-950/70 text-white hover:bg-slate-900/90"
          }`}
        >
          {isCinematic ? "巡航中" : "航拍巡航"}
        </button>
        <button
          type="button"
          onClick={toggleSound}
          className="hidden md:inline-flex rounded-full border border-white/20 bg-slate-950/70 px-3 py-1.5 text-[12px] text-white backdrop-blur-md hover:bg-slate-900/90 transition cursor-pointer"
        >
          {isMuted ? "风声关" : "风声开"}
        </button>
        {onToggleSpecs && (
          <button
            type="button"
            onClick={onToggleSpecs}
            className="hidden lg:inline-flex rounded-full border border-white/20 bg-slate-950/70 px-3 py-1.5 text-[12px] text-white backdrop-blur-md hover:bg-slate-900/90 transition cursor-pointer"
          >
            世界模型文献
          </button>
        )}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded-full border border-white/20 bg-slate-950/70 px-3 py-1.5 text-[11px] sm:text-[12px] text-white backdrop-blur-md hover:bg-slate-900/90 transition cursor-pointer"
        >
          {isFullscreen ? "退出" : "全屏"}
        </button>
      </div>

      {/* 底部居中：极简操作提示与真实数据源署名 */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 z-20 max-w-[92vw] truncate rounded-full border border-white/15 bg-slate-950/60 px-4 py-1.5 text-[11px] sm:text-[12px] text-white/85 backdrop-blur-md">
        WASD 航拍漫游 · Q/E 调整倾角 · 右键拖拽 3D 环视 · 滚轮缩放 · Esri 真实卫星影像 &amp; AWS 3D 高程
      </div>
    </div>
  );
}
