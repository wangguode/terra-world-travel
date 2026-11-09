"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ATTRACTIONS } from "@/lib/beijing-pulse-data";

interface BeijingSpatialViewerProps {
  initialAttractionId?: string;
  onClose?: () => void;
}

interface LightingMode {
  id: string;
  label: string;
  time: string;
  color: number;
  intensity: number;
  tip: string;
}

const LIGHTING_MODES: LightingMode[] = [
  {
    id: "dawn",
    label: "清晨晨曦",
    time: "06:30",
    color: 0xffd8b3,
    intensity: 1.1,
    tip: "斜阳初升，低角度柔光勾勒建筑立面，游客最少、空气清透",
  },
  {
    id: "noon",
    label: "正午澄澈",
    time: "12:00",
    color: 0xffffff,
    intensity: 1.25,
    tip: "顶光充足、红墙金瓦反差鲜明，视野最辽阔",
  },
  {
    id: "sunset",
    label: "日落金辉",
    time: "17:30",
    color: 0xffaa55,
    intensity: 1.15,
    tip: "夕阳低角度漫射，飞檐与水面呈现暖金轮廓，全天最佳摄影时段",
  },
  {
    id: "night",
    label: "夜间蓝调",
    time: "20:00",
    color: 0x6688cc,
    intensity: 0.75,
    tip: "天幕转为深蓝，古建轮廓灯亮起，静谧庄重",
  },
];

export function BeijingSpatialWorldModel({
  initialAttractionId = "forbidden-city",
  onClose,
}: BeijingSpatialViewerProps) {
  const [selectedId, setSelectedId] = useState<string>(initialAttractionId);
  const [lightModeId, setLightModeId] = useState<string>("sunset");

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

  const currentAttraction = useMemo(() => {
    return ATTRACTIONS.find((a) => a.id === selectedId) ?? ATTRACTIONS[0];
  }, [selectedId]);

  const currentLighting = useMemo(() => {
    return LIGHTING_MODES.find((l) => l.id === lightModeId) ?? LIGHTING_MODES[2];
  }, [lightModeId]);

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

    // 全景球模型
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

      autoRot += 0.03;
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

  // 切换光影时更新材质色调
  useEffect(() => {
    if (!threeRef.current) return;
    const mat = threeRef.current.mesh.material as THREE.MeshBasicMaterial;
    mat.color.setHex(currentLighting.color);
  }, [currentLighting]);

  // 鼠标与触屏拖拽 360° 环顾
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

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0c0c0e]">
      {/* 顶部控制栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141418] px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c23b3b]" />
          <span className="text-[18px] font-bold text-white">
            {currentAttraction.name.zh} · 360° 实景空间漫游
          </span>
          <span className="text-[14px] text-white/60">
            按住鼠标自由拖拽环顾四周
          </span>
        </div>

        {/* 快速切换地标 */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-full bg-white/10 px-4 py-1.5 text-[14px] font-medium text-white focus:outline-none"
          >
            {ATTRACTIONS.map((a) => (
              <option key={a.id} value={a.id} className="bg-[#141418] text-white">
                {a.name.zh}
              </option>
            ))}
          </select>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="terra-btn rounded-full bg-white/10 px-3 py-1.5 text-[14px] text-white"
            >
              关闭
            </button>
          )}
        </div>
      </div>

      {/* 核心 360° 三维空间环顾视窗 */}
      <div
        className="relative h-[480px] sm:h-[560px] w-full cursor-grab active:cursor-grabbing select-none touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <canvas ref={canvasRef} className="h-full w-full" />

        {/* 左下角：当前地标极简资讯 */}
        <div className="absolute bottom-6 left-6 z-10 max-w-sm rounded-2xl bg-[#141418]/90 p-5">
          <div className="text-[18px] font-bold text-white">
            {currentAttraction.name.zh}
          </div>
          <div className="mt-1 text-[14px] text-white/70">
            {currentAttraction.description.zh}
          </div>
          <div className="mt-3 flex items-center justify-between text-[14px] text-white/60">
            <span>门票：{currentAttraction.ticket.zh}</span>
            <span>开放：{currentAttraction.hours.zh}</span>
          </div>
        </div>

        {/* 右下角：时光光影四时切换 */}
        <div className="absolute bottom-6 right-6 z-10 rounded-2xl bg-[#141418]/90 p-4">
          <div className="text-[14px] font-semibold text-white/70 mb-2">
            所见即所得 · 光影时段：
          </div>

          <div className="grid grid-cols-2 gap-2">
            {LIGHTING_MODES.map((mode) => {
              const isSel = mode.id === lightModeId;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setLightModeId(mode.id)}
                  className={`terra-btn rounded-xl px-3 py-1.5 text-[14px] font-medium transition ${
                    isSel
                      ? "bg-[#c23b3b] text-white font-bold"
                      : "bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 max-w-[220px] text-[14px] text-white/60 leading-tight">
            {currentLighting.tip}
          </div>
        </div>
      </div>
    </div>
  );
}
