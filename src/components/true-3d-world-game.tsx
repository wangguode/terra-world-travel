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
  subtitle: string;
  title: string;
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  exaggeration: number;
  isOrbit?: boolean;
}

type AtmosphereTheme = "day" | "golden";

const SKY_THEMES: Record<AtmosphereTheme, maplibregl.SkySpecification> = {
  day: {
    "sky-color": "#0d2d5e",
    "sky-horizon-blend": 0.58,
    "horizon-color": "#c9e0f5",
    "horizon-fog-blend": 0.9,
    "fog-color": "#bfd8f0",
    "fog-ground-blend": 0.35,
    "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 1, 7, 0],
  },
  golden: {
    "sky-color": "#1a2444",
    "sky-horizon-blend": 0.68,
    "horizon-color": "#f2b885",
    "horizon-fog-blend": 0.88,
    "fog-color": "#d89c78",
    "fog-ground-blend": 0.38,
    "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 1, 7, 0],
  },
};

const EARTH_PRESETS: EarthPreset[] = [
  {
    id: "globe",
    label: "太空地球",
    subtitle: "ORBITAL GLOBE · REAL SATELLITE",
    title: "真实地球 · 轨道卫星全景",
    center: [104.2, 31.5],
    zoom: 2.15,
    pitch: 16,
    bearing: -8,
    exaggeration: 1.25,
    isOrbit: true,
  },
  {
    id: "matterhorn",
    label: "马特洪峰",
    subtitle: "SWISS ALPS · 4,478M DEM",
    title: "真实地球 · 瑞士阿尔卑斯马特洪峰",
    center: [7.6586, 45.9763],
    zoom: 13.3,
    pitch: 75,
    bearing: -32,
    exaggeration: 1.38,
  },
  {
    id: "manhattan",
    label: "纽约曼哈顿",
    subtitle: "MANHATTAN · 3D SKYLINE",
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
    subtitle: "MT. FUJI · VOLCANIC CONE",
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
    subtitle: "VICTORIA HARBOUR · 3D CITY",
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
    subtitle: "ZHANGJIAJIE · KARST PEAKS",
    title: "真实地球 · 湖南张家界天门山绝壁",
    center: [110.4785, 29.051],
    zoom: 13.4,
    pitch: 73,
    bearing: 38,
    exaggeration: 1.45,
  },
];

export default function True3DWorldGame({ onToggleSpecs }: True3DWorldGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapHostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const soundRef = useRef<SkySoundEngine | null>(null);

  const [activeId, setActiveId] = useState<string>("globe");
  const activeIdRef = useRef<string>("globe");
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const [atmosphere, setAtmosphere] = useState<AtmosphereTheme>("day");
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
    lat: "31.500°N",
    lon: "104.200°E",
    zoom: "2.2x",
    fps: 60,
  });

  useEffect(() => {
    const host = mapHostRef.current;
    if (!host) return;

    let map: maplibregl.Map;
    try {
      // 指定静态托管的独立 Worker，兼容 Next.js 静态导出与 Cloudflare 边缘部署
      maplibregl.setWorkerUrl("/vendor/maplibre-gl-worker.js");
      const initial = EARTH_PRESETS[0];
      map = new maplibregl.Map({
        container: host,
        center: initial.center,
        zoom: initial.zoom,
        pitch: initial.pitch,
        bearing: initial.bearing,
        maxPitch: 82,
        attributionControl: false,
        style: {
          version: 8,
          projection: {
            type: "globe",
          },
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
          sky: SKY_THEMES.day,
          layers: [
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
          lat: `${Math.abs(c.lat).toFixed(2)}°${c.lat >= 0 ? "N" : "S"}`,
          lon: `${Math.abs(c.lng).toFixed(2)}°${c.lng >= 0 ? "E" : "W"}`,
          zoom: `${map.getZoom().toFixed(1)}x`,
          fps: measuredFps,
        });
      }

      if (isCinematicRef.current && !map.isMoving()) {
        if (activeIdRef.current === "globe" || map.getZoom() < 4.5) {
          // 太空轨道视角：地球缓慢优雅自转
          const c = map.getCenter();
          map.setCenter([c.lng + dt * 2.4, c.lat]);
        } else {
          // 低空航拍视角：围绕地标 360° 环绕飞行
          map.setBearing(map.getBearing() + dt * 5.0);
        }
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
        if (keys["q"]) map.setPitch(Math.max(10, map.getPitch() - 35 * dt));
        if (keys["e"]) map.setPitch(Math.min(82, map.getPitch() + 35 * dt));
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
      duration: preset.isOrbit ? 2200 : 2600,
      essential: true,
    });
  };

  const toggleAtmosphere = () => {
    const next: AtmosphereTheme = atmosphere === "day" ? "golden" : "day";
    setAtmosphere(next);
    mapRef.current?.setSky(SKY_THEMES[next]);
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
      className="relative h-[100dvh] min-h-[640px] w-full overflow-hidden select-none bg-[#030712] font-sans"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 45%, rgba(28, 78, 155, 0.28) 0%, rgba(5, 10, 22, 0.96) 62%, #02050c 100%)",
      }}
    >
      {/* 深空微弱星点底纹（仅在 Globe 太空视野周围显现） */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 14% 22%, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 28% 76%, rgba(190,220,255,0.7), transparent), radial-gradient(1.5px 1.5px at 78% 18%, rgba(255,255,255,0.85), transparent), radial-gradient(1px 1px at 86% 64%, rgba(210,235,255,0.65), transparent), radial-gradient(1px 1px at 62% 84%, rgba(255,255,255,0.6), transparent), radial-gradient(1.2px 1.2px at 42% 14%, rgba(255,255,255,0.7), transparent)",
        }}
      />

      {/* MapLibre GL v6 3D 真实地球画布 */}
      <div ref={mapHostRef} className="relative z-10 h-full w-full" />

      {/* 顶部与底部柔暗渐晕，让悬浮导航与航空 HUD 具备影院级对比度 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-[#030712]/75 via-[#030712]/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-36 bg-gradient-to-t from-[#030712]/85 via-[#030712]/35 to-transparent"
      />

      {renderError && (
        <div role="alert" className="absolute inset-0 z-50 flex items-center justify-center bg-[#030712] p-8 text-center text-white">
          <p>无法启动真实地球 WebGL 渲染器，请启用浏览器硬件加速后重试。</p>
        </div>
      )}

      {/* 太空模式下的极简影院标题引导（不遮挡地球，仅左上轻盈排版） */}
      {currentPreset.isOrbit && (
        <div className="pointer-events-none absolute top-28 left-5 sm:top-24 sm:left-10 z-20 max-w-md space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-sky-300 uppercase backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>REAL-WORLD 3D EARTH ENGINE</span>
          </div>
          <h1 className="text-[28px] sm:text-[42px] font-semibold tracking-tight text-white leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            从太空轨道，一秒俯冲真实地球
          </h1>
          <p className="hidden sm:block text-[14px] text-white/70 leading-relaxed">
            零 API Key · Esri 全球卫星实景 × AWS 3D 数字高程 × OpenFreeMap 3D 城市建筑。点击下方地标，即刻开启 60 FPS 低空航拍。
          </p>
        </div>
      )}

      {/* 左下角：航空级实时遥测面板 */}
      <div
        role="status"
        className="pointer-events-none absolute bottom-20 left-4 sm:bottom-6 sm:left-8 z-20 rounded-2xl border border-white/12 bg-[#060b16]/65 px-3.5 py-2.5 text-white backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-wider text-white/95">
          <span className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
          <span>{ready ? currentPreset.title : "正在连接全球卫星与 3D 高程…"}</span>
        </div>
        <div className="mt-1 hidden sm:flex items-center gap-3 text-[11px] text-white/60 font-mono tabular-nums">
          <span>{telemetry.lat}</span>
          <span>{telemetry.lon}</span>
          <span>ZOOM {telemetry.zoom}</span>
          <span className="text-emerald-400">{telemetry.fps} FPS</span>
        </div>
      </div>

      {/* 底部居中：行星与全球真实地标航拍切换台 */}
      <div className="absolute bottom-5 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:bottom-6 z-20 flex items-center gap-1 overflow-x-auto rounded-full border border-white/15 bg-[#060b16]/75 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl no-scrollbar">
        {EARTH_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => flyToPreset(preset)}
            className={`whitespace-nowrap rounded-full px-3 sm:px-3.5 py-1.5 text-[12px] transition cursor-pointer ${
              activeId === preset.id
                ? "bg-white text-[#060b16] font-semibold shadow-sm"
                : "text-white/75 hover:text-white hover:bg-white/10"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* 右下角：极简影院工具条（巡航 / 光影 / 风声 / 文献 / 全屏） */}
      <div className="absolute top-16 right-4 sm:top-auto sm:bottom-6 sm:right-8 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsCinematic((v) => !v)}
          className={`rounded-full border px-3 py-1.5 text-[11px] sm:text-[12px] font-medium backdrop-blur-xl transition cursor-pointer ${
            isCinematic
              ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300"
              : "border-white/15 bg-[#060b16]/70 text-white/80 hover:text-white"
          }`}
        >
          {isCinematic ? "巡航中" : "巡航"}
        </button>
        <button
          type="button"
          onClick={toggleAtmosphere}
          className="rounded-full border border-white/15 bg-[#060b16]/70 px-3 py-1.5 text-[11px] sm:text-[12px] text-white/85 backdrop-blur-xl hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          {atmosphere === "day" ? "晴空" : "日落"}
        </button>
        <button
          type="button"
          onClick={toggleSound}
          className="hidden xl:inline-flex rounded-full border border-white/15 bg-[#060b16]/70 px-3 py-1.5 text-[12px] text-white/80 backdrop-blur-xl hover:text-white transition cursor-pointer"
        >
          {isMuted ? "风声关" : "风声开"}
        </button>
        {onToggleSpecs && (
          <button
            type="button"
            onClick={onToggleSpecs}
            className="hidden xl:inline-flex rounded-full border border-white/15 bg-[#060b16]/70 px-3 py-1.5 text-[12px] text-white/80 backdrop-blur-xl hover:text-white transition cursor-pointer"
          >
            文献图谱 ↓
          </button>
        )}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded-full border border-white/15 bg-[#060b16]/70 px-3 py-1.5 text-[11px] sm:text-[12px] text-white/85 backdrop-blur-xl hover:text-white transition cursor-pointer"
        >
          {isFullscreen ? "退出" : "全屏"}
        </button>
      </div>
    </div>
  );
}
