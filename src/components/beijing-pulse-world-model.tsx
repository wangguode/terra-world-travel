"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ATTRACTIONS } from "@/lib/beijing-pulse-data";

interface BeijingWorldModelProps {
  initialAttractionId?: string;
  onClose?: () => void;
}

function computeSolarParams(hour: number) {
  if (hour < 8.5) {
    return {
      kelvin: "4300K",
      label: "清晨晨曦",
      skyColor: 0x1a2638,
      gridColor: "#c23b3b",
      elevation: "12° 侧顺光",
      description: "低角度柔光打在红墙与琉璃瓦上，反差适中，建筑轮廓与游人最少",
    };
  }
  if (hour < 16.0) {
    return {
      kelvin: "6500K",
      label: "正午澄澈",
      skyColor: 0x141e2c,
      gridColor: "#eab308",
      elevation: "62° 顶光",
      description: "日照最充沛，金瓦反光强烈，适合室内殿宇陈列与殿外广角全景",
    };
  }
  if (hour < 19.0) {
    return {
      kelvin: "3100K",
      label: "日落金辉 (Golden Hour)",
      skyColor: 0x331c14,
      gridColor: "#f97316",
      elevation: "16° 暖金漫射",
      description: "夕阳将飞檐斗拱与角楼水面染成暖金，是全天最佳出片机位时段",
    };
  }
  return {
    kelvin: "2700K",
    label: "夜间蓝调",
    skyColor: 0x070b14,
    gridColor: "#38bdf8",
    elevation: "-8° 景观照明",
    description: "古建筑夜间轮廓灯亮起，蓝调天光与红墙灯影交织",
  };
}

export function BeijingSpatialWorldModel({
  initialAttractionId = "forbidden-city",
  onClose,
}: BeijingWorldModelProps) {
  const [selectedId, setSelectedId] = useState<string>(initialAttractionId);
  const [activeMode, setActiveMode] = useState<"spatial" | "twin">("spatial");
  const [hour, setHour] = useState<number>(17.5);
  const [activeAnchorIdx, setActiveAnchorIdx] = useState<number>(0);
  const [isCruising, setIsCruising] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    points: THREE.Points;
    scanPlane: THREE.Mesh;
    gridHelper: THREE.GridHelper;
    frameId: number;
    camTarget: THREE.Vector3;
    camPos: THREE.Vector3;
  } | null>(null);

  const currentAttraction = useMemo(() => {
    return ATTRACTIONS.find((a) => a.id === selectedId) ?? ATTRACTIONS[0];
  }, [selectedId]);

  const solar = useMemo(() => computeSolarParams(hour), [hour]);

  // 初始化 Three.js 激光雷达体素与空间网格
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
    scene.fog = new THREE.FogExp2(0x070707, 0.035);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 5.8);

    // 构建中轴线与古建空间体素点云
    const particleCount = 20000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color("#c23b3b");

    for (let i = 0; i < particleCount; i++) {
      // 模拟故宫大殿台基、中轴中庭与长城脊线的几何形态
      const isStructure = Math.random() > 0.4;
      let x = 0;
      let y = 0;
      let z = 0;

      if (isStructure) {
        // 大殿台基与立柱
        x = (Math.random() - 0.5) * 8.0;
        z = (Math.random() - 0.5) * 12.0;
        y = Math.random() * 2.8;
      } else {
        // 广场地表与远景山峦
        x = (Math.random() - 0.5) * 18.0;
        z = (Math.random() - 0.5) * 20.0;
        y = (Math.random() - 0.3) * 0.4;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const lum = 0.35 + Math.random() * 0.65;
      colors[i * 3] = baseColor.r * lum;
      colors[i * 3 + 1] = baseColor.g * lum;
      colors[i * 3 + 2] = baseColor.b * lum;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.048,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 空间激光网格
    const gridHelper = new THREE.GridHelper(30, 30, 0xc23b3b, 0x1f1f1f);
    gridHelper.position.y = -0.3;
    scene.add(gridHelper);

    // 激光雷达扩散扫描环
    const scanGeo = new THREE.RingGeometry(0.3, 0.42, 64);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0xc23b3b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const scanPlane = new THREE.Mesh(scanGeo, scanMat);
    scanPlane.rotation.x = -Math.PI / 2;
    scanPlane.position.y = -0.28;
    scene.add(scanPlane);

    const camTarget = new THREE.Vector3(0, 0.8, 0);
    const camPos = new THREE.Vector3(0, 1.4, 5.8);

    threeRef.current = {
      renderer,
      scene,
      camera,
      points,
      scanPlane,
      gridHelper,
      frameId: 0,
      camTarget,
      camPos,
    };

    let ringScale = 1.0;

    const animate = () => {
      const state = threeRef.current;
      if (!state) return;

      ringScale += 0.03;
      if (ringScale > 15) ringScale = 0.6;
      state.scanPlane.scale.set(ringScale, ringScale, 1);
      (state.scanPlane.material as THREE.MeshBasicMaterial).opacity = Math.max(
        0,
        0.65 * (1 - ringScale / 15)
      );

      state.camera.position.lerp(state.camPos, 0.05);
      state.camera.lookAt(state.camTarget);

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
  }, []);

  // 太阳光影变化时实时着色
  useEffect(() => {
    if (!threeRef.current) return;
    const { points, scene, scanPlane } = threeRef.current;
    const col = new THREE.Color(solar.gridColor);
    const pos = points.geometry.attributes.position;
    const colors = points.geometry.attributes.color;

    for (let i = 0; i < pos.count; i++) {
      const lum = 0.35 + Math.random() * 0.65;
      colors.setXYZ(i, col.r * lum, col.g * lum, col.b * lum);
    }
    colors.needsUpdate = true;
    (scanPlane.material as THREE.MeshBasicMaterial).color.set(col);
    scene.fog = new THREE.FogExp2(solar.skyColor, 0.035);
  }, [solar]);

  // 鼠标拖拽 360° 环顾
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

    const { camPos } = threeRef.current;
    camPos.x += dx * 0.012;
    camPos.y = Math.max(0.4, Math.min(3.5, camPos.y - dy * 0.012));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // 聚焦到指定空间锚点
  const handleSelectAnchor = (idx: number) => {
    setActiveAnchorIdx(idx);
    const anchor = currentAttraction.spatialModel.anchors[idx];
    if (!anchor || !threeRef.current) return;
    const { camPos, camTarget } = threeRef.current;
    camPos.set(anchor.pos[0] * 0.7, anchor.pos[1] + 1.2, anchor.pos[2] + 2.5);
    camTarget.set(anchor.pos[0], anchor.pos[1], anchor.pos[2]);
  };

  // 第一人称动线巡航
  const handleToggleCruise = () => {
    if (isCruising) {
      setIsCruising(false);
      if (threeRef.current) {
        threeRef.current.camPos.set(0, 1.4, 5.8);
        threeRef.current.camTarget.set(0, 0.8, 0);
      }
      return;
    }
    setIsCruising(true);
    let step = 0;
    const anchors = currentAttraction.spatialModel.anchors;
    const interval = setInterval(() => {
      if (!isCruising && step > 0) {
        clearInterval(interval);
        return;
      }
      handleSelectAnchor(step % anchors.length);
      step++;
      if (step >= anchors.length * 2) {
        clearInterval(interval);
        setIsCruising(false);
      }
    }, 4500);
  };

  const activeAnchor = currentAttraction.spatialModel.anchors[activeAnchorIdx];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0c0c0e]">
      {/* 顶部控制栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141418] px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c23b3b]" />
          <span className="text-[18px] font-bold text-[#f5f5f0]">
            {currentAttraction.name.zh} · 4D 空间世界模型
          </span>
          <span className="rounded-full bg-white/10 px-3 py-0.5 text-[14px] text-white/70 tnum">
            {currentAttraction.coordinates} · {currentAttraction.elevation}
          </span>
        </div>

        {/* 模式选择与景点快速切换 */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setActiveAnchorIdx(0);
            }}
            className="rounded-full bg-white/10 px-4 py-1.5 text-[14px] font-medium text-white focus:outline-none"
          >
            {ATTRACTIONS.map((a) => (
              <option key={a.id} value={a.id} className="bg-[#141418] text-white">
                {a.name.zh} ({a.name.en})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setActiveMode("spatial")}
            className={`terra-btn rounded-full px-4 py-1.5 text-[14px] font-semibold ${
              activeMode === "spatial"
                ? "bg-[#c23b3b] text-white"
                : "bg-white/10 text-white/80"
            }`}
          >
            4D 体素点云
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("twin")}
            className={`terra-btn rounded-full px-4 py-1.5 text-[14px] font-semibold ${
              activeMode === "twin"
                ? "bg-[#c23b3b] text-white"
                : "bg-white/10 text-white/80"
            }`}
          >
            实景空间孪生
          </button>

          <button
            type="button"
            onClick={handleToggleCruise}
            className={`terra-btn rounded-full px-4 py-1.5 text-[14px] font-semibold ${
              isCruising ? "bg-white text-black" : "bg-white/10 text-white"
            }`}
          >
            {isCruising ? "正在动线巡航..." : "第一人称动线漫游"}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="terra-btn rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 text-[14px] text-white"
            >
              关闭
            </button>
          )}
        </div>
      </div>

      {/* 核心三维交互画布 */}
      <div
        className="relative h-[520px] sm:h-[600px] w-full cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
            activeMode === "spatial" ? "opacity-100" : "opacity-35"
          }`}
        />

        {activeMode === "twin" && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
            style={{ backgroundImage: `url(${currentAttraction.image})` }}
          />
        )}

        {/* 空间物理实体锚点 */}
        <div className="absolute top-6 left-6 z-20 flex flex-wrap gap-2">
          {currentAttraction.spatialModel.anchors.map((anc, idx) => {
            const isSel = idx === activeAnchorIdx;
            return (
              <button
                key={anc.id}
                type="button"
                onClick={() => handleSelectAnchor(idx)}
                className={`terra-btn rounded-full px-4 py-1.5 text-[14px] font-medium transition ${
                  isSel
                    ? "bg-[#c23b3b] text-white"
                    : "bg-[#141418]/90 text-white/80 hover:bg-white/10"
                }`}
              >
                <span>{anc.title}</span>
              </button>
            );
          })}
        </div>

        {/* 左下角：空间实体具身向导 HUD */}
        <div className="absolute bottom-6 left-6 z-10 max-w-md rounded-2xl bg-[#141418]/95 p-5">
          <div className="flex items-center justify-between text-[14px] text-white/60">
            <span>空间物理体素状态</span>
            <span className="text-[#c23b3b] tnum font-semibold">{solar.elevation}</span>
          </div>

          <div className="mt-1 text-[18px] font-bold text-white">
            {activeAnchor ? activeAnchor.title : "第一视角 360° 空间穿透"}
          </div>

          <p className="mt-1.5 mb-0 text-[14px] text-white/80 leading-relaxed">
            {activeAnchor
              ? activeAnchor.tip
              : "在 3D 空间中预先走通最佳游览动线与机位视角。"}
          </p>

          <div className="mt-3 pt-2 text-[14px] text-white/60">
            最佳时段推演：{currentAttraction.spatialModel.recommendedReason}
          </div>
        </div>

        {/* 右下角：24h 太阳光影因果引擎滑块 */}
        <div className="absolute bottom-6 right-6 z-10 w-72 rounded-2xl bg-[#141418]/95 p-5">
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-white/60">太阳时空光影模拟</span>
            <span className="font-bold text-[#c23b3b] tnum">
              {solar.label} · {solar.kelvin}
            </span>
          </div>

          <input
            type="range"
            min={6}
            max={22}
            step={0.5}
            value={hour}
            onChange={(e) => setHour(parseFloat(e.target.value))}
            className="mt-3 w-full accent-[#c23b3b] cursor-pointer"
          />

          <div className="mt-2 flex justify-between text-[14px] text-white/50 tnum">
            <span>06:00 晨曦</span>
            <span>12:00 正午</span>
            <span>17:30 金辉</span>
            <span>22:00 蓝调</span>
          </div>

          <p className="mt-2.5 mb-0 text-[14px] text-white/70">
            {solar.description}
          </p>
        </div>
      </div>
    </div>
  );
}
