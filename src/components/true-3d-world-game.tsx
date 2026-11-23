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

const LIGHT_THEMES: Record<AtmosphereTheme, maplibregl.LightSpecification> = {
  day: {
    anchor: "map",
    color: "#fff7ea",
    intensity: 0.48,
    position: [1.5, 135, 38],
  },
  golden: {
    anchor: "map",
    color: "#ffba75",
    intensity: 0.68,
    position: [1.65, 250, 16],
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
    zoom: 13.8,
    pitch: 76,
    bearing: -32,
    exaggeration: 1.38,
  },
  {
    id: "manhattan",
    label: "纽约曼哈顿",
    subtitle: "MANHATTAN · 3D SKYLINE",
    title: "真实地球 · 纽约曼哈顿 3D 天际线",
    center: [-73.9855, 40.7484],
    zoom: 15.8,
    pitch: 72,
    bearing: 24,
    exaggeration: 1.1,
  },
  {
    id: "fuji",
    label: "日本富士山",
    subtitle: "MT. FUJI · VOLCANIC CONE",
    title: "真实地球 · 日本富士山 3D 火山地貌",
    center: [138.7274, 35.3606],
    zoom: 12.9,
    pitch: 72,
    bearing: 118,
    exaggeration: 1.35,
  },
  {
    id: "hongkong",
    label: "香港维港",
    subtitle: "VICTORIA HARBOUR · 3D CITY",
    title: "真实地球 · 香港维多利亚港与太平山",
    center: [114.1694, 22.2855],
    zoom: 15.4,
    pitch: 70,
    bearing: -18,
    exaggeration: 1.25,
  },
  {
    id: "zhangjiajie",
    label: "张家界",
    subtitle: "ZHANGJIAJIE · KARST PEAKS",
    title: "真实地球 · 湖南张家界天门山绝壁",
    center: [110.4785, 29.051],
    zoom: 13.8,
    pitch: 74,
    bearing: 38,
    exaggeration: 1.45,
  },
];

// 根据缩放级别估算当前相机相对地面的高度（米）
function estimateAltitudeMeters(zoom: number, lat: number): number {
  const metersPerPixel = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
  return Math.max(18, Math.round(metersPerPixel * 260));
}

// 将 0..360 航向角格式化为方位字母
function headingToCardinal(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const normalized = ((deg % 360) + 360) % 360;
  return dirs[Math.round(normalized / 45) % 8];
}

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

  // 巡航模式 vs 自由驾驶模式（FPS 物理惯性移动）
  const [isCinematic, setIsCinematic] = useState(true);
  const isCinematicRef = useRef(true);
  useEffect(() => {
    isCinematicRef.current = isCinematic;
  }, [isCinematic]);

  const [isPilotMode, setIsPilotMode] = useState(false);
  const isPilotModeRef = useRef(false);
  useEffect(() => {
    isPilotModeRef.current = isPilotMode;
  }, [isPilotMode]);

  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [telemetry, setTelemetry] = useState({
    lat: "31.50°N",
    lon: "104.20°E",
    agl: 12000,
    groundElev: 0,
    speedKmh: 0,
    heading: 0,
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
        maxPitch: 83,
        attributionControl: false,
        style: {
          version: 8,
          projection: {
            type: "globe",
          },
          light: LIGHT_THEMES.day,
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
                  "#7f8a96",
                  40,
                  "#9eaab8",
                  120,
                  "#c3d0de",
                  260,
                  "#e6eff8",
                ],
                "fill-extrusion-height": ["coalesce", ["get", "render_height"], 12],
                "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
                "fill-extrusion-opacity": 0.95,
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

    // 自由驾驶模式下，左键拖拽直接自由环顾 360° 视角（像真游戏视角转动）
    let isLooking = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (!isPilotModeRef.current || e.button !== 0) return;
      isLooking = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isLooking || !isPilotModeRef.current) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      map.setBearing(map.getBearing() - dx * 0.28);
      map.setPitch(Math.max(12, Math.min(83, map.getPitch() - dy * 0.22)));
    };
    const onPointerUp = () => {
      isLooking = false;
    };

    host.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const stopAutoOnInteract = () => {
      if (isCinematicRef.current) {
        setIsCinematic(false);
      }
    };
    map.on("dragstart", stopAutoOnInteract);
    map.on("wheel", stopAutoOnInteract);

    // 物理惯性速度状态
    const physics = {
      velForward: 0, // 前后速度 (米/秒)
      velRight: 0, // 左右横向速度 (米/秒)
      velZoom: 0, // 垂直高度缩放速度
      velYaw: 0, // Q/E 键盘旋转速度 (度/秒)
    };

    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        e.preventDefault();
      }
      keys[k] = true;

      if (k === "c") {
        setIsCinematic((v) => !v);
      } else if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        if (isCinematicRef.current) setIsCinematic(false);
        if (!isPilotModeRef.current && map.getZoom() >= 10) {
          setIsPilotMode(true);
          map.dragPan.disable();
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      delete keys[e.key.toLowerCase()];
    };
    const onBlur = () => {
      for (const k of Object.keys(keys)) delete keys[k];
      isLooking = false;
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

      const currentZoom = map.getZoom();
      const center = map.getCenter();
      const bearing = map.getBearing();

      if (isCinematicRef.current && !map.isMoving()) {
        physics.velForward *= 0.85;
        physics.velRight *= 0.85;
        if (activeIdRef.current === "globe" || currentZoom < 4.5) {
          map.setCenter([center.lng + dt * 2.2, center.lat]);
        } else {
          map.setBearing(bearing + dt * 4.8);
        }
      } else if (!map.isMoving()) {
        // 根据当前离地高度自动适配移动速度（低空街道如真人/无人机，高空如喷气机）
        const aglEst = estimateAltitudeMeters(currentZoom, center.lat);
        const baseMaxSpeed = Math.max(24, Math.min(480, aglEst * 0.42));
        const maxSpeed = keys["shift"] ? baseMaxSpeed * 2.4 : baseMaxSpeed;
        const accel = maxSpeed * 3.6;
        const damping = Math.exp(-5.2 * dt);

        let forwardInput = 0;
        let rightInput = 0;
        if (keys["w"] || keys["arrowup"]) forwardInput += 1;
        if (keys["s"] || keys["arrowdown"]) forwardInput -= 1;
        if (keys["d"] || keys["arrowright"]) rightInput += 1;
        if (keys["a"] || keys["arrowleft"]) rightInput -= 1;

        if (forwardInput !== 0) {
          physics.velForward = Math.max(
            -maxSpeed,
            Math.min(maxSpeed, physics.velForward + forwardInput * accel * dt)
          );
        } else {
          physics.velForward *= damping;
          if (Math.abs(physics.velForward) < 0.2) physics.velForward = 0;
        }

        if (rightInput !== 0) {
          physics.velRight = Math.max(
            -maxSpeed * 0.8,
            Math.min(maxSpeed * 0.8, physics.velRight + rightInput * accel * 0.85 * dt)
          );
        } else {
          physics.velRight *= damping;
          if (Math.abs(physics.velRight) < 0.2) physics.velRight = 0;
        }

        // Q / E 平滑左右偏航转向
        const yawInput = (keys["e"] ? 1 : 0) - (keys["q"] ? 1 : 0);
        if (yawInput !== 0) {
          physics.velYaw = Math.max(-65, Math.min(65, physics.velYaw + yawInput * 190 * dt));
        } else {
          physics.velYaw *= damping;
          if (Math.abs(physics.velYaw) < 0.1) physics.velYaw = 0;
        }

        // Space 上升（拉远 zoom） / F 贴地下降（拉近 zoom，限制最高 17.6 防止钻入地形）
        const vertInput = (keys["f"] ? 1 : 0) - (keys[" "] ? 1 : 0);
        if (vertInput !== 0) {
          physics.velZoom = Math.max(-1.6, Math.min(1.6, physics.velZoom + vertInput * 4.5 * dt));
        } else {
          physics.velZoom *= damping;
          if (Math.abs(physics.velZoom) < 0.005) physics.velZoom = 0;
        }

        // 应用真实地球球面位移（沿当前准星朝向 bearing）
        const hasMove =
          Math.abs(physics.velForward) > 0.1 ||
          Math.abs(physics.velRight) > 0.1 ||
          Math.abs(physics.velYaw) > 0.05 ||
          Math.abs(physics.velZoom) > 0.003;

        if (hasMove) {
          const rad = (bearing * Math.PI) / 180;
          const northMeters = (physics.velForward * Math.cos(rad) - physics.velRight * Math.sin(rad)) * dt;
          const eastMeters = (physics.velForward * Math.sin(rad) + physics.velRight * Math.cos(rad)) * dt;

          const cosLat = Math.max(0.15, Math.cos((center.lat * Math.PI) / 180));
          const nextLat = Math.max(-82, Math.min(82, center.lat + northMeters / 111320));
          const nextLng = center.lng + eastMeters / (111320 * cosLat);
          const nextZoom = Math.max(2.0, Math.min(17.6, currentZoom + physics.velZoom * dt));
          const nextBearing = bearing + physics.velYaw * dt;

          map.jumpTo({
            center: [nextLng, nextLat],
            zoom: nextZoom,
            bearing: nextBearing,
          });
        }

        const speedNorm = Math.min(
          1.0,
          Math.hypot(physics.velForward, physics.velRight) / Math.max(30, baseMaxSpeed * 1.6)
        );
        sound.updateFlightSpeed(0.12 + speedNorm * 0.88);
      }

      // 实时刷新航空遥测仪表
      fpsFrames++;
      fpsAcc += dt;
      if (fpsAcc >= 0.25) {
        measuredFps = Math.round(fpsFrames / fpsAcc);
        fpsFrames = 0;
        fpsAcc = 0;
        const c = map.getCenter();
        const z = map.getZoom();
        const elev = map.queryTerrainElevation(c) ?? 0;
        const speedMps = Math.hypot(physics.velForward, physics.velRight);
        const hdg = Math.round(((map.getBearing() % 360) + 360) % 360);
        setTelemetry({
          lat: `${Math.abs(c.lat).toFixed(3)}°${c.lat >= 0 ? "N" : "S"}`,
          lon: `${Math.abs(c.lng).toFixed(3)}°${c.lng >= 0 ? "E" : "W"}`,
          agl: estimateAltitudeMeters(z, c.lat),
          groundElev: Math.max(0, Math.round(elev)),
          speedKmh: Math.round(speedMps * 3.6),
          heading: hdg,
          fps: measuredFps,
        });
      }
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      host.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      sound.dispose();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const flyToPreset = (preset: EarthPreset, enterPilot = false) => {
    setActiveId(preset.id);
    const map = mapRef.current;
    if (!map) return;

    if (preset.isOrbit) {
      setIsPilotMode(false);
      map.dragPan.enable();
      setIsCinematic(true);
    } else if (enterPilot) {
      setIsCinematic(false);
      setIsPilotMode(true);
      map.dragPan.disable();
    }

    map.setTerrain({ source: "terrainDem", exaggeration: preset.exaggeration });
    map.flyTo({
      center: preset.center,
      zoom: preset.zoom,
      pitch: preset.pitch,
      bearing: preset.bearing,
      duration: preset.isOrbit ? 2200 : 2500,
      essential: true,
    });
  };

  // 一键进入 / 退出真实第一人称自由驾驶漫游
  const togglePilotMode = () => {
    const map = mapRef.current;
    if (!map) return;

    if (isPilotMode) {
      setIsPilotMode(false);
      map.dragPan.enable();
      return;
    }

    // 如果当前还在太空地球，自动俯冲降落到马特洪峰并进入自由驾驶
    if (activeId === "globe" || map.getZoom() < 10) {
      flyToPreset(EARTH_PRESETS[1], true);
      return;
    }

    setIsCinematic(false);
    setIsPilotMode(true);
    map.dragPan.disable();
  };

  const toggleAtmosphere = () => {
    const next: AtmosphereTheme = atmosphere === "day" ? "golden" : "day";
    setAtmosphere(next);
    mapRef.current?.setSky(SKY_THEMES[next]);
    mapRef.current?.setLight(LIGHT_THEMES[next]);
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
      className={`relative h-[100dvh] min-h-[640px] w-full overflow-hidden select-none bg-[#030712] font-sans ${
        isPilotMode ? "cursor-crosshair" : "cursor-grab"
      }`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 45%, rgba(28, 78, 155, 0.28) 0%, rgba(5, 10, 22, 0.96) 62%, #02050c 100%)",
      }}
    >
      {/* 深空星点底纹 */}
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

      {/* 顶/底轻暗角渐晕 */}
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

      {/* 自由驾驶模式：顶部航空方向罗盘 + 屏幕中央极简微准星 */}
      {isPilotMode && (
        <>
          <div
            aria-label="Flight Compass"
            className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full border border-emerald-400/25 bg-[#060b16]/75 px-4 py-1.5 text-[11px] font-mono text-white/90 backdrop-blur-xl"
          >
            <span className="text-emerald-400 font-semibold">
              HDG {String(telemetry.heading).padStart(3, "0")}° {headingToCardinal(telemetry.heading)}
            </span>
            <span className="text-white/25">|</span>
            <span>SPD {telemetry.speedKmh} km/h</span>
            <span className="hidden sm:inline text-white/25">|</span>
            <span className="hidden sm:inline text-sky-300">AGL {telemetry.agl} m</span>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center opacity-55"
          >
            <div className="relative h-7 w-7">
              <span className="absolute left-1/2 top-0 h-2 w-[1px] -translate-x-1/2 bg-white" />
              <span className="absolute left-1/2 bottom-0 h-2 w-[1px] -translate-x-1/2 bg-white" />
              <span className="absolute top-1/2 left-0 w-2 h-[1px] -translate-y-1/2 bg-white" />
              <span className="absolute top-1/2 right-0 w-2 h-[1px] -translate-y-1/2 bg-white" />
              <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400" />
            </div>
          </div>
        </>
      )}

      {/* 太空模式下的极简影院标题引导 */}
      {currentPreset.isOrbit && !isPilotMode && (
        <div className="pointer-events-none absolute top-28 left-5 sm:top-24 sm:left-10 z-20 max-w-md space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-sky-300 uppercase backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>REAL-WORLD 3D EARTH ENGINE</span>
          </div>
          <h1 className="text-[28px] sm:text-[42px] font-semibold tracking-tight text-white leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            从太空轨道，一秒俯冲真实地球
          </h1>
          <p className="hidden sm:block text-[14px] text-white/70 leading-relaxed">
            支持第一人称物理惯性自由飞行：鼠标拖拽 360° 环顾视角，WASD 沿准星穿行真实雪峰与摩天楼群，Space / F 自由升降。
          </p>
        </div>
      )}

      {/* 左下角：航空级实时遥测面板 */}
      <div
        role="status"
        className="pointer-events-none absolute bottom-20 left-4 sm:bottom-6 sm:left-8 z-20 rounded-2xl border border-white/12 bg-[#060b16]/70 px-3.5 py-2.5 text-white backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-wider text-white/95">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              ready ? (isPilotMode ? "bg-sky-400" : "bg-emerald-400") : "bg-amber-400 animate-pulse"
            }`}
          />
          <span>
            {!ready
              ? "正在连接全球卫星与 3D 高程…"
              : isPilotMode
                ? `自由驾驶 · ${currentPreset.label}`
                : currentPreset.title}
          </span>
        </div>
        <div className="mt-1 hidden sm:flex items-center gap-3 text-[11px] text-white/60 font-mono tabular-nums">
          <span>{telemetry.lat}</span>
          <span>{telemetry.lon}</span>
          {!currentPreset.isOrbit && <span>地面海拔 {telemetry.groundElev}m</span>}
          <span className="text-emerald-400">{telemetry.fps} FPS</span>
        </div>
      </div>

      {/* 底部居中：行星与全球真实地标航拍切换台 */}
      <div className="absolute bottom-5 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:bottom-6 z-20 flex flex-col items-center gap-2">
        {isPilotMode && (
          <div className="pointer-events-none hidden md:block rounded-full border border-white/10 bg-[#060b16]/65 px-3.5 py-1 text-[11px] text-white/75 backdrop-blur-md">
            按住左键拖拽环顾视角 · WASD 惯性穿行 · Q/E 转向 · Space 上升 / F 贴地 · Shift 加速
          </div>
        )}
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/15 bg-[#060b16]/75 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl no-scrollbar">
          {EARTH_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => flyToPreset(preset, isPilotMode)}
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
      </div>

      {/* 右下角：自由驾驶切换 + 极简影院工具条 */}
      <div className="absolute top-16 right-4 sm:top-auto sm:bottom-6 sm:right-8 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={togglePilotMode}
          className={`rounded-full border px-3.5 py-1.5 text-[11px] sm:text-[12px] font-semibold backdrop-blur-xl transition cursor-pointer ${
            isPilotMode
              ? "border-sky-400 bg-sky-400 text-[#040812] shadow-[0_0_20px_rgba(56,189,248,0.45)]"
              : "border-emerald-400/50 bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25"
          }`}
        >
          {isPilotMode ? "退出驾驶" : "自由驾驶"}
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
