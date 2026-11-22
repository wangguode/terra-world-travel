"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";
import { SkySoundEngine } from "@/world/audio";

interface True3DWorldGameProps {
  onToggleSpecs?: () => void;
}

interface SplatPreset {
  id: string;
  label: string;
  title: string;
  url: string;
  scale: number;
  spawn: [number, number, number];
  yaw: number;
  pitch: number;
  orbitCenter: [number, number, number];
  orbitRadius: number;
}

const SPLAT_PRESETS: SplatPreset[] = [
  {
    id: "valley",
    label: "雪山溪谷",
    title: "3DGS 光场 · 阿尔卑斯雪山溪谷",
    url: "/splats/valley.spz",
    scale: 2.6,
    spawn: [0, 0.8, 5.2],
    yaw: 0,
    pitch: -0.02,
    orbitCenter: [0, 0.6, 0],
    orbitRadius: 4.8,
  },
  {
    id: "transit",
    label: "实景铁路",
    title: "3DGS 实景扫描 · 真实铁路机车与轨道",
    url: "/splats/transit-platform.splat",
    scale: 1.8,
    spawn: [0, 0.6, 4.8],
    yaw: 0,
    pitch: -0.04,
    orbitCenter: [0, 0.4, 0],
    orbitRadius: 4.5,
  },
];

export default function True3DWorldGame({ onToggleSpecs }: True3DWorldGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeId, setActiveId] = useState<string>("valley");
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [assetState, setAssetState] = useState<"loading" | "ready" | "error">("loading");
  const [renderError, setRenderError] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isCinematic, setIsCinematic] = useState(false);
  const isCinematicRef = useRef(false);
  useEffect(() => {
    isCinematicRef.current = isCinematic;
  }, [isCinematic]);

  const [isMuted, setIsMuted] = useState(true);
  const soundRef = useRef<SkySoundEngine | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fps, setFps] = useState(60);

  const loadPresetRef = useRef<((preset: SplatPreset) => void) | null>(null);
  const loadCustomFileRef = useRef<((file: File) => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      queueMicrotask(() => setRenderError(true));
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0b101b");

    const camera = new THREE.PerspectiveCamera(
      58,
      container.clientWidth / container.clientHeight,
      0.05,
      500
    );

    // World Labs 开源 SparkJS 3D Gaussian Splatting 渲染器
    const spark = new SparkRenderer({ renderer });
    scene.add(spark);

    const splatContainer = new THREE.Group();
    scene.add(splatContainer);

    const sound = new SkySoundEngine();
    soundRef.current = sound;

    let disposed = false;
    const cache = new Map<string, SplatMesh>();
    const customBlobUrls: string[] = [];
    let currentPreset: SplatPreset = SPLAT_PRESETS[0];

    // 平滑自由飞行相机状态
    const camState = {
      pos: new THREE.Vector3(...currentPreset.spawn),
      targetPos: new THREE.Vector3(...currentPreset.spawn),
      yaw: currentPreset.yaw,
      targetYaw: currentPreset.yaw,
      pitch: currentPreset.pitch,
      targetPitch: currentPreset.pitch,
    };

    const showOnly = (key: string) => {
      cache.forEach((mesh, k) => {
        mesh.visible = k === key;
      });
    };

    const loadSplatByKey = (key: string, url: string, preset: SplatPreset) => {
      if (disposed) return;
      currentPreset = preset;
      camState.targetPos.set(...preset.spawn);
      camState.pos.set(...preset.spawn);
      camState.targetYaw = preset.yaw;
      camState.yaw = preset.yaw;
      camState.targetPitch = preset.pitch;
      camState.pitch = preset.pitch;

      if (cache.has(key)) {
        showOnly(key);
        setAssetState("ready");
        return;
      }

      setAssetState("loading");
      showOnly(key);
      try {
        const mesh = new SplatMesh({
          url,
          onLoad: () => {
            if (!disposed && currentPreset.id === key) {
              setAssetState("ready");
            }
          },
        });
        // 标准 OpenCV -> Three.js 坐标系翻转（180° 绕 X 轴）
        mesh.quaternion.set(1, 0, 0, 0);
        mesh.scale.setScalar(preset.scale);
        mesh.position.set(0, 0, 0);
        splatContainer.add(mesh);
        cache.set(key, mesh);
        // 兜底：部分格式 onLoad 回调时机不同，2.2s 后自动就绪
        setTimeout(() => {
          if (!disposed && currentPreset.id === key) {
            setAssetState("ready");
          }
        }, 2200);
      } catch (err) {
        console.warn("SparkJS SplatMesh load error:", err);
        if (!disposed) setAssetState("error");
      }
    };

    loadPresetRef.current = (preset) => {
      setCustomTitle(null);
      loadSplatByKey(preset.id, preset.url, preset);
    };

    loadCustomFileRef.current = (file) => {
      const blobUrl = URL.createObjectURL(file);
      customBlobUrls.push(blobUrl);
      const customKey = `custom-${Date.now()}`;
      const customPreset: SplatPreset = {
        id: customKey,
        label: "自定义",
        title: `自定义 3DGS · ${file.name}`,
        url: blobUrl,
        scale: 2.2,
        spawn: [0, 0.8, 5.0],
        yaw: 0,
        pitch: -0.02,
        orbitCenter: [0, 0.5, 0],
        orbitRadius: 4.5,
      };
      setActiveId(customKey);
      setCustomTitle(customPreset.title);
      loadSplatByKey(customKey, blobUrl, customPreset);
    };

    // 首屏直接加载真实雪山溪谷 3DGS 光场
    loadSplatByKey(SPLAT_PRESETS[0].id, SPLAT_PRESETS[0].url, SPLAT_PRESETS[0]);

    // 键盘与鼠标交互
    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (k === "c") setIsCinematic((v) => !v);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      delete keys[e.key.toLowerCase()];
    };
    const onBlur = () => {
      for (const k of Object.keys(keys)) delete keys[k];
    };

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button, a, input")) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      camState.targetYaw -= (e.clientX - lastX) * 0.0042;
      camState.targetPitch = Math.max(
        -0.75,
        Math.min(0.75, camState.targetPitch - (e.clientY - lastY) * 0.0036)
      );
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onPointerUp = () => {
      dragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const fwd = new THREE.Vector3(
        -Math.sin(camState.yaw) * Math.cos(camState.pitch),
        Math.sin(camState.pitch),
        -Math.cos(camState.yaw) * Math.cos(camState.pitch)
      );
      camState.targetPos.addScaledVector(fwd, -e.deltaY * 0.006);
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", onResize);
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    let animId = 0;
    let elapsed = 0;
    let lastTime = performance.now();
    let fpsFrames = 0;
    let fpsAcc = 0;

    const lookVec = new THREE.Vector3();

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += dt;

      fpsFrames++;
      fpsAcc += dt;
      if (fpsAcc >= 0.6) {
        setFps(Math.round(fpsFrames / fpsAcc));
        fpsFrames = 0;
        fpsAcc = 0;
      }

      if (isCinematicRef.current) {
        const [cx, cy, cz] = currentPreset.orbitCenter;
        const r = currentPreset.orbitRadius;
        const angle = Math.sin(elapsed * 0.28) * 0.85;
        camera.position.set(
          cx + Math.sin(angle) * r,
          cy + 0.35 + Math.sin(elapsed * 0.45) * 0.45,
          cz + Math.cos(angle) * r
        );
        camera.lookAt(cx, cy, cz);
      } else {
        const speed = (keys["shift"] ? 6.8 : 3.2) * dt;
        const forward = new THREE.Vector3(
          -Math.sin(camState.yaw) * Math.cos(camState.pitch),
          Math.sin(camState.pitch),
          -Math.cos(camState.yaw) * Math.cos(camState.pitch)
        );
        const right = new THREE.Vector3(Math.cos(camState.yaw), 0, -Math.sin(camState.yaw));

        let moving = false;
        if (keys["w"] || keys["arrowup"]) {
          camState.targetPos.addScaledVector(forward, speed);
          moving = true;
        }
        if (keys["s"] || keys["arrowdown"]) {
          camState.targetPos.addScaledVector(forward, -speed);
          moving = true;
        }
        if (keys["a"] || keys["arrowleft"]) {
          camState.targetPos.addScaledVector(right, -speed);
          moving = true;
        }
        if (keys["d"] || keys["arrowright"]) {
          camState.targetPos.addScaledVector(right, speed);
          moving = true;
        }
        if (keys["e"] || keys[" "] || keys["space"]) {
          camState.targetPos.y += speed * 0.75;
          moving = true;
        }
        if (keys["q"]) {
          camState.targetPos.y -= speed * 0.75;
          moving = true;
        }

        // 柔性边界限制，防止飞出光场有效范围
        camState.targetPos.clampLength(0, 18);

        const damp = Math.min(1, dt * 8.5);
        camState.pos.lerp(camState.targetPos, damp);
        camState.yaw += (camState.targetYaw - camState.yaw) * damp;
        camState.pitch += (camState.targetPitch - camState.pitch) * damp;

        camera.position.copy(camState.pos);
        lookVec.set(
          -Math.sin(camState.yaw) * Math.cos(camState.pitch),
          Math.sin(camState.pitch),
          -Math.cos(camState.yaw) * Math.cos(camState.pitch)
        );
        camera.lookAt(camState.pos.x + lookVec.x, camState.pos.y + lookVec.y, camState.pos.z + lookVec.z);

        sound.updateFlightSpeed(moving ? (keys["shift"] ? 1.0 : 0.45) : 0.12);
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("wheel", onWheel);
      loadPresetRef.current = null;
      loadCustomFileRef.current = null;
      customBlobUrls.forEach((u) => URL.revokeObjectURL(u));
      sound.dispose();
      renderer.dispose();
    };
  }, []);

  const handleSelectPreset = (preset: SplatPreset) => {
    setActiveId(preset.id);
    loadPresetRef.current?.(preset);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file && /\.(spz|splat|ply|ksplat)$/i.test(file.name)) {
      loadCustomFileRef.current?.(file);
    }
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

  const currentPreset = SPLAT_PRESETS.find((p) => p.id === activeId);
  const displayTitle = customTitle ?? currentPreset?.title ?? "SparkJS 3DGS 真实光场";

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingFile(true);
      }}
      onDragLeave={() => setIsDraggingFile(false)}
      onDrop={handleDrop}
      className="relative h-[calc(100dvh-48px)] min-h-[580px] w-full overflow-hidden select-none bg-[#0b101b] font-sans"
    >
      <canvas ref={canvasRef} className="h-full w-full cursor-grab active:cursor-grabbing touch-none block" />

      <input
        ref={fileInputRef}
        type="file"
        accept=".spz,.splat,.ply,.ksplat"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) loadCustomFileRef.current?.(f);
        }}
      />

      {renderError && (
        <div role="alert" className="absolute inset-0 z-50 flex items-center justify-center bg-[#0b101b] p-8 text-center text-white">
          <p>无法启动 WebGL 2 渲染器，请在浏览器设置中启用硬件加速后重试。</p>
        </div>
      )}

      {isDraggingFile && (
        <div className="pointer-events-none absolute inset-4 z-40 flex items-center justify-center rounded-3xl border-2 border-dashed border-sky-400 bg-slate-950/75 backdrop-blur-md">
          <div className="text-center text-white">
            <div className="text-lg font-semibold">松开即可加载您的真实 3DGS 世界</div>
            <div className="mt-1 text-xs text-white/65">支持 World Labs .spz / Polycam .ply / Luma .splat</div>
          </div>
        </div>
      )}

      {/* 左上角：极简光场遥测状态 */}
      <div
        role="status"
        className="pointer-events-none absolute top-3 left-3 sm:top-4 sm:left-4 z-20 rounded-2xl border border-white/15 bg-slate-950/60 px-3 py-2 sm:px-4 sm:py-2.5 text-white backdrop-blur-md"
      >
        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium tracking-wider text-sky-300">
          <span className={`h-1.5 w-1.5 rounded-full ${assetState === "ready" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
          <span>{assetState === "loading" ? "正在解码 3DGS 光场…" : displayTitle}</span>
        </div>
        <div className="mt-1 hidden sm:flex items-center gap-3 text-[11px] text-white/65 tabular-nums">
          <span>SparkJS 3DGS</span>
          <span className="text-emerald-400">{fps} FPS</span>
        </div>
      </div>

      {/* 顶部居中：真实光场世界切换药丸 */}
      <div className="absolute top-14 left-3 sm:top-4 sm:left-1/2 sm:-translate-x-1/2 z-20 flex items-center gap-1 rounded-full border border-white/15 bg-slate-950/65 p-1 backdrop-blur-md">
        {SPLAT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] sm:text-[12px] transition cursor-pointer ${
              activeId === preset.id
                ? "bg-[#0071e3] text-white font-medium"
                : "text-white/70 hover:text-white"
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
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full border border-sky-400/50 bg-slate-950/75 px-3 py-1.5 text-[11px] sm:text-[12px] font-medium text-sky-200 backdrop-blur-md hover:bg-slate-900/90 transition cursor-pointer"
          title="支持导入 World Labs Marble (.spz)、Polycam (.ply)、Luma (.splat)"
        >
          导入 .spz
        </button>
        <button
          type="button"
          onClick={() => setIsCinematic((v) => !v)}
          className={`hidden sm:inline-flex rounded-full border px-3 py-1.5 text-[12px] font-medium backdrop-blur-md transition cursor-pointer ${
            isCinematic
              ? "border-amber-400 bg-amber-400 text-slate-950"
              : "border-white/20 bg-slate-950/60 text-white hover:bg-slate-900/80"
          }`}
        >
          {isCinematic ? "巡航中" : "电影巡航"}
        </button>
        <button
          type="button"
          onClick={toggleSound}
          className="hidden md:inline-flex rounded-full border border-white/20 bg-slate-950/60 px-3 py-1.5 text-[12px] text-white backdrop-blur-md hover:bg-slate-900/80 transition cursor-pointer"
        >
          {isMuted ? "音效关" : "音效开"}
        </button>
        {onToggleSpecs && (
          <button
            type="button"
            onClick={onToggleSpecs}
            className="hidden lg:inline-flex rounded-full border border-white/20 bg-slate-950/60 px-3 py-1.5 text-[12px] text-white backdrop-blur-md hover:bg-slate-900/80 transition cursor-pointer"
          >
            世界模型文献
          </button>
        )}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded-full border border-white/20 bg-slate-950/60 px-3 py-1.5 text-[11px] sm:text-[12px] text-white backdrop-blur-md hover:bg-slate-900/80 transition cursor-pointer"
        >
          {isFullscreen ? "退出" : "全屏"}
        </button>
      </div>

      {/* 底部居中：一行极简操作提示 */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 z-20 max-w-[92vw] truncate rounded-full border border-white/15 bg-slate-950/55 px-4 py-1.5 text-[11px] sm:text-[12px] text-white/80 backdrop-blur-md">
        WASD 漫游 · Q/E 升降 · Shift 加速 · 滚轮缩放 · 鼠标拖拽环视 · 支持直接拖入 .spz / .ply 文件
      </div>
    </div>
  );
}
