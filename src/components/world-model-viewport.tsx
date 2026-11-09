"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { WorldModelScene } from "@/lib/corridors-data";

interface SpatialAnchor {
  id: string;
  name: string;
  category: string;
  xPct: number;
  yPct: number;
  pos3D: [number, number, number];
  headline: string;
  actionGuide: string;
  localPhrase: string;
  phonetic: string;
}

interface WorldModelViewportProps {
  scenes: WorldModelScene[];
  destinationCity: string;
  cityId: string;
}

const CITY_SPATIAL_ANCHORS: Record<string, SpatialAnchor[]> = {
  "cn-to-seoul": [
    {
      id: "kr-esim-gate",
      name: "落地到达层 · eSIM 信号激活口",
      category: "通信与入境",
      xPct: 28,
      yPct: 42,
      pos3D: [-3, 0.5, 2],
      headline: "出廊桥前关闭飞行模式，原地激活韩国原生 5G",
      actionGuide: "Airalo 或 KT 柜台领取的 eSIM 无需关机，开启数据漫游后 15 秒内自动寻网 LG U+ / SKT。",
      localPhrase: "데이터 로밍이 켜져 있는지 확인해 주세요.",
      phonetic: "Deiteo roming-i kyeojyeo inneunji hwaginhae juseyo.",
    },
    {
      id: "kr-arex-gate",
      name: "B1 交通中心 · AREX 机场快轨闸机",
      category: "直达快线",
      xPct: 62,
      yPct: 56,
      pos3D: [2, -0.2, 0],
      headline: "认准橙色 Express 直达通道，43 分钟直达首尔站",
      actionGuide: "普通列车与直达列车闸机相邻，切勿刷进蓝色普通列车。刷二维码或 WOWPASS 进出站。",
      localPhrase: "서울역 직통열차 개찰구가 어디인가요?",
      phonetic: "Seoul-yeok jiktong-yeolcha gaechalguga eodi-ingayo?",
    },
    {
      id: "kr-taxi-stop",
      name: "1F 外部道路 · 国际出租车落客柱",
      category: "夜间备选",
      xPct: 78,
      yPct: 72,
      pos3D: [4, -1, -3],
      headline: "4D 空间落客柱 5C，支持 Kakao T 与现金结算",
      actionGuide: "夜间航班落地快轨停运时，认准橙色国际出租车（司机支持中英基础交流）。",
      localPhrase: "기사님, 홍대입구역 앞 호텔로 가주세요.",
      phonetic: "Gisanim, Hongdae-ipgu-yeok ap hotello gajuseyo.",
    },
  ],
  "cn-to-tokyo": [
    {
      id: "jp-suica-turnstile",
      name: "羽田/成田京急与 Skyliner 改札口",
      category: "交通过闸",
      xPct: 35,
      yPct: 48,
      pos3D: [-2, 0, 1],
      headline: "Apple 钱包直接刷 Suica / Pasmo 进站",
      actionGuide: "iPhone 钱包提前添加交通卡，碰触蓝色感应区 0.2 秒即刻开闸，无需在售票机排队购票。",
      localPhrase: "改札口はSuicaでそのまま通れますか？",
      phonetic: "Kaisatsuguchi wa Suica de sonomama tooremasu ka?",
    },
    {
      id: "jp-elevator-anchor",
      name: "站台中央 · 大件行李直梯 (Elevator)",
      category: "无障碍动线",
      xPct: 68,
      yPct: 62,
      pos3D: [3, 0.4, -1],
      headline: "东京复杂换乘走廊中的直梯专用动线",
      actionGuide: "推大件行李箱避开换乘阶梯，沿着站台地面黄色盲道直行 30 米即达中央无障碍直梯。",
      localPhrase: "すみません、ホーム行きのエレベーターはどこですか？",
      phonetic: "Sumimasen, hoomu yuki no erebeetaa wa doko desu ka?",
    },
  ],
  "global-to-beijing": [
    {
      id: "bj-daxing-express",
      name: "大兴机场线草桥站快速值机中枢",
      category: "轨道快线",
      xPct: 45,
      yPct: 52,
      pos3D: [0, 0, 0],
      headline: "19 分钟 160km/h 贴地飞驰直抵三环草桥",
      actionGuide: "支持微信乘车码或支付宝直接扫码过闸，草桥站内无缝换乘 10 号线与 19 号线高运量地铁。",
      localPhrase: "师傅，送我到大兴机场快线草桥换乘中心",
      phonetic: "Caoqiao Transit Center · Daxing Airport Express",
    },
  ],
  "cn-to-bangkok": [
    {
      id: "th-arl-station",
      name: "素万那普 B1 层 · 机场快线 ARL 始发站",
      category: "轨道直达",
      xPct: 40,
      yPct: 50,
      pos3D: [-1, 0, 0],
      headline: "45 泰铢直通市中心，避开素坤逸早晚大塞车",
      actionGuide: "自助购票机投入泰铢纸币换取黄色塑料代币（Token），26 分钟直达披耶泰（Phaya Thai）换乘天铁 BTS。",
      localPhrase: "ขอตั๋วรถไฟฟ้าไปพญาไท 1 ใบครับ",
      phonetic: "Khaw tua rot-fai-faa pai Phaya Thai neung bai khrap.",
    },
  ],
};

function computeSolarParams(hour: number) {
  if (hour < 8.5) {
    return {
      kelvin: "4300K",
      label: "清晨冷光",
      skyColor: 0x1a2638,
      gridColor: "#38bdf8",
      elevation: "8°",
    };
  }
  if (hour < 16.0) {
    return {
      kelvin: "6500K",
      label: "正午澄澈",
      skyColor: 0x141e2c,
      gridColor: "#60a5fa",
      elevation: "64°",
    };
  }
  if (hour < 19.0) {
    return {
      kelvin: "3100K",
      label: "日落金辉",
      skyColor: 0x331c14,
      gridColor: "#ff6b3d",
      elevation: "18°",
    };
  }
  return {
    kelvin: "2700K",
    label: "夜间蓝调",
    skyColor: 0x070b14,
    gridColor: "#38bdf8",
    elevation: "-12°",
  };
}

export function WorldModelViewport({
  scenes,
  destinationCity,
  cityId,
}: WorldModelViewportProps) {
  const [activeMode, setActiveMode] = useState<"spatial" | "twin">("spatial");
  const [selectedSceneIdx] = useState(0);
  const [hour, setHour] = useState<number>(17.5);
  const [activeAnchor, setActiveAnchor] = useState<SpatialAnchor | null>(null);
  const [isCruising, setIsCruising] = useState<boolean>(false);
  const [speaking, setSpeaking] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeStateRef = useRef<{
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

  const activeScene = scenes[selectedSceneIdx] ?? scenes[0];
  const anchors = useMemo(() => {
    return CITY_SPATIAL_ANCHORS[cityId] ?? CITY_SPATIAL_ANCHORS["cn-to-seoul"];
  }, [cityId]);

  const solar = useMemo(() => computeSolarParams(hour), [hour]);

  // 初始化 Three.js 激光点云与空间网格
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 480;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.04);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.5);

    const particleCount = 18000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color("#ff6b3d");

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * 5.0;
      const x = Math.cos(angle) * radius;
      const z = (Math.random() - 0.5) * 14.0;
      const y = (Math.random() - 0.2) * 3.5;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const lum = 0.4 + Math.random() * 0.6;
      colors[i * 3] = baseColor.r * lum;
      colors[i * 3 + 1] = baseColor.g * lum;
      colors[i * 3 + 2] = baseColor.b * lum;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const gridHelper = new THREE.GridHelper(24, 24, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    const scanGeo = new THREE.RingGeometry(0.2, 0.28, 48);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const scanPlane = new THREE.Mesh(scanGeo, scanMat);
    scanPlane.rotation.x = -Math.PI / 2;
    scanPlane.position.y = -0.48;
    scene.add(scanPlane);

    const camTarget = new THREE.Vector3(0, 0.6, 0);
    const camPos = new THREE.Vector3(0, 1.2, 5.5);

    threeStateRef.current = {
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
      const state = threeStateRef.current;
      if (!state) return;

      ringScale += 0.025;
      if (ringScale > 12) ringScale = 0.5;
      state.scanPlane.scale.set(ringScale, ringScale, 1);
      (state.scanPlane.material as THREE.MeshBasicMaterial).opacity = Math.max(
        0,
        0.6 * (1 - ringScale / 12)
      );

      state.camera.position.lerp(state.camPos, 0.05);
      state.camera.lookAt(state.camTarget);

      state.renderer.render(state.scene, state.camera);
      state.frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvas || !threeStateRef.current) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      threeStateRef.current.camera.aspect = w / h;
      threeStateRef.current.camera.updateProjectionMatrix();
      threeStateRef.current.renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (threeStateRef.current) {
        cancelAnimationFrame(threeStateRef.current.frameId);
        threeStateRef.current.renderer.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!threeStateRef.current) return;
    const { points, scene, scanPlane } = threeStateRef.current;
    const col = new THREE.Color(solar.gridColor);
    const pos = points.geometry.attributes.position;
    const colors = points.geometry.attributes.color;

    for (let i = 0; i < pos.count; i++) {
      const lum = 0.4 + Math.random() * 0.6;
      colors.setXYZ(i, col.r * lum, col.g * lum, col.b * lum);
    }
    colors.needsUpdate = true;
    (scanPlane.material as THREE.MeshBasicMaterial).color.set(col);
    scene.fog = new THREE.FogExp2(solar.skyColor, 0.04);
  }, [solar]);

  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !threeStateRef.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };

    const { camPos } = threeStateRef.current;
    camPos.x += dx * 0.01;
    camPos.y = Math.max(0.2, Math.min(3.0, camPos.y - dy * 0.01));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleSelectAnchor = (anchor: SpatialAnchor) => {
    setActiveAnchor(anchor);
    if (!threeStateRef.current) return;
    const { camPos, camTarget } = threeStateRef.current;
    camPos.set(anchor.pos3D[0] * 0.6, anchor.pos3D[1] + 1.0, anchor.pos3D[2] + 2.4);
    camTarget.set(anchor.pos3D[0], anchor.pos3D[1], anchor.pos3D[2]);
  };

  const handleToggleCruise = () => {
    if (isCruising) {
      setIsCruising(false);
      if (threeStateRef.current) {
        threeStateRef.current.camPos.set(0, 1.2, 5.5);
        threeStateRef.current.camTarget.set(0, 0.6, 0);
      }
      return;
    }
    setIsCruising(true);
    let step = 0;
    const cruiseInterval = setInterval(() => {
      if (!isCruising && step > 0) {
        clearInterval(cruiseInterval);
        return;
      }
      const targetAnchor = anchors[step % anchors.length];
      if (targetAnchor) {
        handleSelectAnchor(targetAnchor);
      }
      step++;
      if (step >= anchors.length * 2) {
        clearInterval(cruiseInterval);
        setIsCruising(false);
      }
    }, 4200);
  };

  const speakPhrase = (phrase: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(phrase);
    u.rate = 0.9;
    setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-3xl bg-[#0a0a0f]"
    >
      {/* 顶部极简科技 HUD 栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#14141e] px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b3d]" />
          <span className="text-[18px] font-bold text-white">
            {destinationCity} · 空间世界模型视窗
          </span>
          <span className="rounded-full bg-white/10 px-3 py-0.5 text-[14px] text-white/70 tnum">
            {activeScene.coordinates}
          </span>
        </div>

        {/* 模式切换 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMode("spatial")}
            className={`terra-btn rounded-full px-4 py-1.5 text-[14px] font-semibold ${
              activeMode === "spatial"
                ? "bg-[#ff6b3d] text-[#050508]"
                : "bg-white/10 text-white/80"
            }`}
          >
            4D 体素点云模式
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("twin")}
            className={`terra-btn rounded-full px-4 py-1.5 text-[14px] font-semibold ${
              activeMode === "twin"
                ? "bg-[#ff6b3d] text-[#050508]"
                : "bg-white/10 text-white/80"
            }`}
          >
            实景空间孪生模式
          </button>
          <button
            type="button"
            onClick={handleToggleCruise}
            className={`terra-btn rounded-full px-4 py-1.5 text-[14px] font-semibold ${
              isCruising
                ? "bg-white text-black"
                : "bg-white/10 text-white"
            }`}
          >
            {isCruising ? "正在动线巡航..." : "第一视角动线推演"}
          </button>
        </div>
      </div>

      {/* 核心三维交互画布舞台 */}
      <div
        className="relative h-[480px] sm:h-[560px] w-full cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
            activeMode === "spatial" ? "opacity-100" : "opacity-30"
          }`}
        />

        {activeMode === "twin" && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
            style={{
              backgroundImage: `url(${activeScene.image})`,
            }}
          />
        )}

        {/* 空间物理悬浮锚点 */}
        {anchors.map((anc) => {
          const isSelected = activeAnchor?.id === anc.id;
          return (
            <button
              key={anc.id}
              type="button"
              onClick={() => handleSelectAnchor(anc)}
              style={{ left: `${anc.xPct}%`, top: `${anc.yPct}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[14px] font-medium transition-transform duration-200 ${
                isSelected
                  ? "bg-[#ff6b3d] text-[#050508] scale-105"
                  : "bg-[#14141e] text-white/90"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isSelected ? "bg-[#050508]" : "bg-[#ff6b3d]"
                }`}
              />
              <span>{anc.name}</span>
            </button>
          );
        })}

        {/* 左下角：空间世界模型第一视角物理 HUD */}
        <div className="absolute bottom-6 left-6 z-10 max-w-sm rounded-2xl bg-[#14141e] p-5">
          <div className="flex items-center justify-between text-[14px] text-white/60">
            <span>空间物理体素状态</span>
            <span className="text-[#ff6b3d] tnum">{solar.elevation} 仰角</span>
          </div>
          <div className="mt-1 text-[18px] font-bold text-white">
            {activeAnchor ? activeAnchor.headline : "鼠标拖拽 360° 空间环顾 · 沿动线穿行"}
          </div>
          <p className="mt-1.5 mb-0 text-[14px] text-white/70">
            {activeAnchor
              ? activeAnchor.actionGuide
              : "点击空间悬浮锚点或时间轴，提前在数字孪生空间走通每一道出站闸机与换乘动线。"}
          </p>

          {activeAnchor && (
            <div className="mt-3 flex items-center justify-between pt-2">
              <span className="text-[14px] text-white/80 tnum">
                {activeAnchor.phonetic}
              </span>
              <button
                type="button"
                onClick={() => speakPhrase(activeAnchor.localPhrase)}
                className="terra-btn rounded-full bg-white/10 px-3 py-1 text-[14px] text-white"
              >
                {speaking ? "朗读中..." : "播放母语发音"}
              </button>
            </div>
          )}
        </div>

        {/* 右下角：24h 太阳光影孪生因果滑块 */}
        <div className="absolute bottom-6 right-6 z-10 w-72 rounded-2xl bg-[#14141e] p-5">
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-white/60">太阳时空因果模拟</span>
            <span className="font-bold text-[#ff6b3d] tnum">
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
            className="mt-3 w-full accent-[#ff6b3d] cursor-pointer"
          />

          <div className="mt-2 flex justify-between text-[12px] text-white/50 tnum">
            <span>06:00 晨曦</span>
            <span>12:00 正午</span>
            <span>17:30 日落</span>
            <span>22:00 夜调</span>
          </div>
        </div>
      </div>
    </div>
  );
}
