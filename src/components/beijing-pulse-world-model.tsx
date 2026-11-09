"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ATTRACTIONS, type Attraction } from "@/lib/beijing-pulse-data";

export interface LightingMode {
  id: "dawn" | "noon" | "sunset" | "night";
  label: string;
  time: string;
  color: number;
  intensity: number;
  tip: string;
}

export const LIGHTING_MODES: LightingMode[] = [
  {
    id: "dawn",
    label: "清晨晨曦",
    time: "06:30",
    color: 0xffd8b3,
    intensity: 1.1,
    tip: "低角度柔金晨光，古建飞檐立体勾勒，空气最清透",
  },
  {
    id: "noon",
    label: "正午澄澈",
    time: "12:00",
    color: 0xffffff,
    intensity: 1.25,
    tip: "顶光充足，红墙金瓦与蓝琉璃对比鲜明，视野最辽阔",
  },
  {
    id: "sunset",
    label: "日落金辉",
    time: "17:30",
    color: 0xffaa55,
    intensity: 1.15,
    tip: "夕阳漫射暖金光晕，水面与殿顶金瓦交相辉映，最佳摄影时段",
  },
  {
    id: "night",
    label: "夜间蓝调",
    time: "20:00",
    color: 0x6688cc,
    intensity: 0.75,
    tip: "深邃蓝调夜幕，古建轮廓灯亮起，静谧庄重",
  },
];

interface BeijingSpatialViewerProps {
  selectedId?: string;
  onSelectAttraction?: (id: string) => void;
  lightModeId?: "dawn" | "noon" | "sunset" | "night";
  onSelectLightMode?: (modeId: "dawn" | "noon" | "sunset" | "night") => void;
}

export function BeijingSpatialWorldModel({
  selectedId: propSelectedId,
  onSelectAttraction,
  lightModeId: propLightModeId,
  onSelectLightMode,
}: BeijingSpatialViewerProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string>("forbidden-city");
  const [internalLightModeId, setInternalLightModeId] = useState<"dawn" | "noon" | "sunset" | "night">("sunset");

  const currentSelectedId = propSelectedId ?? internalSelectedId;
  const currentLightModeId = propLightModeId ?? internalLightModeId;

  const handleSelectAttraction = (id: string) => {
    if (onSelectAttraction) {
      onSelectAttraction(id);
    } else {
      setInternalSelectedId(id);
    }
  };

  const handleSelectLightMode = (mode: "dawn" | "noon" | "sunset" | "night") => {
    if (onSelectLightMode) {
      onSelectLightMode(mode);
    } else {
      setInternalLightModeId(mode);
    }
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    mesh: THREE.Mesh;
    light: THREE.AmbientLight;
    frameId: number;
    lon: number;
    lat: number;
    targetLon: number;
    targetLat: number;
  } | null>(null);

  const currentAttraction: Attraction = useMemo(() => {
    return ATTRACTIONS.find((a) => a.id === currentSelectedId) ?? ATTRACTIONS[0];
  }, [currentSelectedId]);

  const currentLighting: LightingMode = useMemo(() => {
    return LIGHTING_MODES.find((l) => l.id === currentLightModeId) ?? LIGHTING_MODES[2];
  }, [currentLightModeId]);

  // 初始化真实 360° 全景空间球
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth || 960;
    const height = canvas.clientHeight || 540;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0);

    // 全景球体模型：内表面反向映射
    const geometry = new THREE.SphereGeometry(50, 60, 40);
    geometry.scale(-1, 1, 1);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(currentAttraction.image);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const light = new THREE.AmbientLight(currentLighting.color, currentLighting.intensity);
    scene.add(light);

    threeRef.current = {
      renderer,
      scene,
      camera,
      mesh,
      light,
      frameId: 0,
      lon: 0,
      lat: 0,
      targetLon: 0,
      targetLat: 0,
    };

    let autoRot = 0;

    const animate = () => {
      const state = threeRef.current;
      if (!state) return;

      autoRot += 0.025;
      state.lon += (state.targetLon + autoRot - state.lon) * 0.05;
      state.lat += (state.targetLat - state.lat) * 0.05;

      const phi = THREE.MathUtils.degToRad(90 - state.lat);
      const theta = THREE.MathUtils.degToRad(state.lon);

      const targetX = 50 * Math.sin(phi) * Math.cos(theta);
      const targetY = 50 * Math.cos(phi);
      const targetZ = 50 * Math.sin(phi) * Math.sin(theta);

      state.camera.lookAt(targetX, targetY, targetZ);
      state.renderer.render(state.scene, state.camera);
      state.frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvas || !threeRef.current) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      threeRef.current.camera.aspect = w / h;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (threeRef.current) {
        cancelAnimationFrame(threeRef.current.frameId);
        threeRef.current.renderer.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 切换景点时无缝换贴图
  useEffect(() => {
    if (!threeRef.current) return;
    const loader = new THREE.TextureLoader();
    loader.load(currentAttraction.image, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      if (threeRef.current) {
        (threeRef.current.mesh.material as THREE.MeshBasicMaterial).map = tex;
        (threeRef.current.mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
      }
    });
  }, [currentAttraction]);

  // 切换光影时更新材质色调与环境光
  useEffect(() => {
    if (!threeRef.current) return;
    const mat = threeRef.current.mesh.material as THREE.MeshBasicMaterial;
    mat.color.setHex(currentLighting.color);
    threeRef.current.light.color.setHex(currentLighting.color);
    threeRef.current.light.intensity = currentLighting.intensity;
  }, [currentLighting]);

  // 鼠标与触控拖拽 360° 环顾
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !threeRef.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };

    threeRef.current.targetLon -= dx * 0.18;
    threeRef.current.targetLat = Math.max(
      -60,
      Math.min(60, threeRef.current.targetLat + dy * 0.18)
    );
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !threeRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - lastMouse.current.x;
    const dy = e.touches[0].clientY - lastMouse.current.y;
    lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    threeRef.current.targetLon -= dx * 0.18;
    threeRef.current.targetLat = Math.max(
      -60,
      Math.min(60, threeRef.current.targetLat + dy * 0.18)
    );
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const featuredNav = ATTRACTIONS.slice(0, 6);

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[#0c0c0e]">
      {/* 顶部控制栏：地标横滑胶囊条 */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141418] px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          {featuredNav.map((a) => {
            const isSel = a.id === currentSelectedId;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => handleSelectAttraction(a.id)}
                className={`terra-btn rounded-full px-4 py-1.5 text-[14px] font-medium transition ${
                  isSel
                    ? "bg-[#c23b3b] text-white font-bold"
                    : "bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                {a.name.zh}
              </button>
            );
          })}
        </div>

        {/* 完整 10 处地标下拉切换 */}
        <div className="flex items-center gap-2">
          <select
            value={currentSelectedId}
            onChange={(e) => handleSelectAttraction(e.target.value)}
            className="rounded-full bg-white/10 px-4 py-1.5 text-[14px] font-medium text-white focus:outline-none"
            aria-label="选择全部地标"
          >
            {ATTRACTIONS.map((a) => (
              <option key={a.id} value={a.id} className="bg-[#141418] text-white">
                {a.name.zh} ({a.districtZh})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 核心 360° 三维空间环顾视窗 */}
      <div
        className="relative h-[500px] sm:h-[620px] w-full cursor-grab active:cursor-grabbing select-none touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <canvas ref={canvasRef} className="h-full w-full" />

        {/* 左上角 HUD：地标坐标与时空状态 */}
        <div className="absolute top-6 left-6 z-10 max-w-md rounded-2xl bg-[#070707]/80 p-4">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[#ff6b6b]">
            <span className="h-2 w-2 rounded-full bg-[#c23b3b]" />
            360° 实景时空漫游
          </div>
          <div className="mt-1 text-[22px] font-bold text-white">
            {currentAttraction.name.zh}
          </div>
          <div className="mt-0.5 text-[14px] text-white/60">
            {currentAttraction.coordinates} · {currentAttraction.elevation}
          </div>
        </div>

        {/* 左下角 HUD：人文意境一句话提炼 */}
        <div className="absolute bottom-6 left-6 z-10 max-w-md rounded-2xl bg-[#070707]/80 p-4 hidden sm:block">
          <p className="text-[14px] text-white/90 leading-relaxed m-0">
            “{currentAttraction.essence}”
          </p>
        </div>

        {/* 右下角 HUD：四时光影切换器 */}
        <div className="absolute bottom-6 right-6 z-10 rounded-2xl bg-[#070707]/85 p-4">
          <div className="text-[14px] font-semibold text-white/70 mb-2.5">
            四时光影变幻：
          </div>

          <div className="grid grid-cols-2 gap-2">
            {LIGHTING_MODES.map((mode) => {
              const isSel = mode.id === currentLightModeId;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleSelectLightMode(mode.id)}
                  className={`terra-btn rounded-xl px-3 py-1.5 text-[14px] font-medium transition ${
                    isSel
                      ? "bg-[#c23b3b] text-white font-bold"
                      : "bg-white/10 text-white/80 hover:bg-white/15"
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 max-w-[240px] text-[14px] text-white/60 leading-tight">
            {currentLighting.tip}
          </div>
        </div>
      </div>
    </div>
  );
}
