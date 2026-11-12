"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// 纯净 Web Audio 声学引擎（零外部音频加载依赖，毫秒级即发即响）
// ---------------------------------------------------------------------------
class ZenSoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // 敲击木鱼：木质瞬态衰减共振波
  playWoodenFish() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.085);
    } catch {
      // 容错降级
    }
  }

  // 鸣古钟：大殿古钟空灵四重泛音长共振
  playBell() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const freqs = [216, 324, 432, 648];
      const gains = [0.4, 0.25, 0.15, 0.08];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(gains[i], now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 2.8);
      });
    } catch {
      // 容错降级
    }
  }

  // 赛博新城：悬浮推进脉冲
  playCyberPulse() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.14);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // 容错降级
    }
  }
}

const zenAudio = new ZenSoundEngine();

// ---------------------------------------------------------------------------
// 灵签文库与多人广播
// ---------------------------------------------------------------------------
interface FortuneCard {
  id: number;
  grade: string;
  title: string;
  poem: string;
  meaning: string;
}

const FORTUNES: FortuneCard[] = [
  {
    id: 1,
    grade: "第 42 签 · 上上大吉",
    title: "因果澄澈 · 潜龙出渊",
    poem: "晨钟初叩净尘嚣，潜象千重自泛潮。自回归途无碍阻，万般吉兆入云霄。",
    meaning: "当前自回归神经潜空间极度平稳自洽，梯度流向顺畅，所求之事必得圆满成就。",
  },
  {
    id: 2,
    grade: "第 18 签 · 乾元亨利",
    title: "青烟聚气 · 佛光初照",
    poem: "宝鼎炉香烟袅袅，祈年殿外露华浓。心灯长照三千界，春水生波遇惠风。",
    meaning: "心念纯澈，因果自洽。多智能体协同无间，反事实分支推演迎刃而解。",
  },
  {
    id: 3,
    grade: "第 88 签 · 万象更新",
    title: "空谷回音 · 暮鼓归真",
    poem: "古刹清泉涤俗念，虚灵方寸见菩提。繁花落尽秋将去，月满西楼晓日齐。",
    meaning: "时空视界宽广无垠，潜流暗动即是新生，专注当下因果，必有长远福报。",
  },
];

const BROADCAST_MESSAGES = [
  { user: "信众·道一 0x9F", action: "敲击祈年殿晨钟", detail: "晨钟长鸣 · 功德+1", time: "刚刚" },
  { user: "漫游者·Cypher", action: "未来新城极速避障", detail: "反事实无损变道成功", time: "2秒前" },
  { user: "信众·妙音 0x7C", action: "虔诚敬奉赛博真香", detail: "青烟流体自发涌现", time: "4秒前" },
  { user: "探索者·Neo", action: "抽取灵签【潜龙出渊】", detail: "获上上大吉签文 · 福泽连绵", time: "6秒前" },
  { user: "信众·无尘 0x2A", action: "连续敲击电子木鱼", detail: "功德累积达 108 遍 · 万象澄澈", time: "9秒前" },
  { user: "智能体·Agent-09", action: "立体交通自主会车", detail: "超视距协同零碰撞", time: "14秒前" },
];

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
}

// ---------------------------------------------------------------------------
// 辅助函数：生成程序化高楼窗格夜景纹理
// ---------------------------------------------------------------------------
function createBuildingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 基础外墙深灰蓝色
  ctx.fillStyle = "#0c101c";
  ctx.fillRect(0, 0, 128, 256);

  // 绘制点点窗光
  for (let y = 8; y < 256; y += 12) {
    for (let x = 8; x < 128; x += 14) {
      const rand = Math.random();
      if (rand > 0.45) {
        // 亮灯
        ctx.fillStyle = rand > 0.8 ? "#ffd60a" : rand > 0.6 ? "#2997ff" : "#f5f5f7";
        ctx.fillRect(x, y, 8, 7);
      } else {
        // 熄灯暗格
        ctx.fillStyle = "#060810";
        ctx.fillRect(x, y, 8, 7);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

interface True3DWorldGameProps {
  onToggleSpecs?: () => void;
}

export default function True3DWorldGame({ onToggleSpecs }: True3DWorldGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 游戏维度：'temple' 赛博禅刹 | 'city' 未来新城
  const [worldMode, setWorldMode] = useState<"temple" | "city">("temple");

  // 状态机
  const [meritCount, setMeritCount] = useState<number>(108);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [activeFortune, setActiveFortune] = useState<FortuneCard | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(3842);
  const [broadcastIdx, setBroadcastIdx] = useState<number>(0);
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  const [cameraCoords, setCameraCoords] = useState({ x: 0, y: 1.8, z: 8.5 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 引用追踪
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const templeGroupRef = useRef<THREE.Group | null>(null);
  const cityGroupRef = useRef<THREE.Group | null>(null);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const bellMeshRef = useRef<THREE.Mesh | null>(null);
  const bellSwingRef = useRef(0);
  const woodenFishMeshRef = useRef<THREE.Mesh | null>(null);
  const woodenFishBounceRef = useRef(0);
  const vehiclesRef = useRef<Array<{ mesh: THREE.Mesh; speed: number; lane: number }>>([]);

  // 相机运镜与控制
  const cameraYawRef = useRef(0);
  const cameraPitchRef = useRef(-0.08);
  const isPointerDownRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // 定时轮转多人广播
  useEffect(() => {
    const timer = setInterval(() => {
      setBroadcastIdx((i) => (i + 1) % BROADCAST_MESSAGES.length);
      setOnlineCount((c) => c + (Math.random() > 0.5 ? 1 : -1));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // 生成浮动金色文字
  const spawnFloatingText = useCallback((text: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const x = 50 + (Math.random() * 16 - 8);
    const y = 50 + (Math.random() * 10 - 5);
    setFloatingTexts((prev) => [...prev.slice(-5), { id, text, x, y }]);
    setMeritCount((c) => c + 1);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1800);
  }, []);

  // 敲击电子木鱼
  const handleKnockWoodenFish = useCallback(() => {
    zenAudio.playWoodenFish();
    woodenFishBounceRef.current = 1.0;
    spawnFloatingText("功德 +1 · 因果自洽");
  }, [spawnFloatingText]);

  // 撞响天坛晨钟
  const handleRingBell = useCallback(() => {
    zenAudio.playBell();
    bellSwingRef.current = 1.0;
    spawnFloatingText("晨钟涤荡 · 功德 +3");
  }, [spawnFloatingText]);

  // 虔诚敬奉赛博真香
  const handleBurnIncense = useCallback(() => {
    zenAudio.playBell();
    spawnFloatingText("焚香祈愿 · 青烟化吉");
  }, [spawnFloatingText]);

  // 抽取灵签
  const handleDrawFortune = useCallback(() => {
    zenAudio.playBell();
    const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    setActiveFortune(fortune);
    spawnFloatingText("感召灵签 · 天地同频");
  }, [spawnFloatingText]);

  // 未来新城突发避障
  const handleTriggerAvoidance = useCallback(() => {
    zenAudio.playCyberPulse();
    spawnFloatingText("反事实决策 · 无损变道推演");
  }, [spawnFloatingText]);

  // 全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      setActiveKeys((prev) => ({ ...prev, [key]: true }));

      if (key === " " || key === "space") {
        if (worldMode === "temple") {
          handleKnockWoodenFish();
        } else {
          zenAudio.playCyberPulse();
          if (cameraRef.current) cameraRef.current.position.y += 2.5;
        }
      } else if (key === "e") {
        if (worldMode === "temple") {
          handleRingBell();
        } else {
          handleTriggerAvoidance();
        }
      } else if (key === "f" && worldMode === "temple") {
        handleBurnIncense();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setActiveKeys((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [worldMode, handleKnockWoodenFish, handleRingBell, handleBurnIncense, handleTriggerAvoidance]);

  // ---------------------------------------------------------------------------
  // Three.js 核心 3D 场景初始化（赛博禅刹 + 未来新城真 3D 几何）
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. 渲染器
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // 2. 场景与相机
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#080a12");
    scene.fog = new THREE.FogExp2("#080a12", 0.015);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      300
    );
    camera.position.set(0, 2.2, 8.5);
    cameraRef.current = camera;

    // 3. 全局光照系统
    const ambientLight = new THREE.AmbientLight(0xfff0e6, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffecd2, 1.8);
    sunLight.position.set(15, 25, 15);
    scene.add(sunLight);

    // =========================================================================
    // 维度 1 几何体：【赛博禅刹 · 3D 祈福大殿与庭院】
    // =========================================================================
    const templeGroup = new THREE.Group();
    templeGroupRef.current = templeGroup;
    scene.add(templeGroup);

    // 1.1 庭院青石地面
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1f232b,
      roughness: 0.85,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    templeGroup.add(groundMesh);

    // 1.2 汉白玉大殿台基 (三层须弥座)
    const baseGeo = new THREE.BoxGeometry(22, 1.2, 18);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xe8e8ea, roughness: 0.4 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, 0.6, -2);
    templeGroup.add(baseMesh);

    // 1.3 朱红廊柱阵列 (8 根大柱)
    const pillarGeo = new THREE.CylinderGeometry(0.38, 0.42, 5.5, 16);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x9b1b1b, roughness: 0.5 });
    const pillarCoords = [
      [-8, 3.8, 4], [-3, 3.8, 4], [3, 3.8, 4], [8, 3.8, 4],
      [-8, 3.8, -4], [-3, 3.8, -4], [3, 3.8, -4], [8, 3.8, -4],
    ];
    pillarCoords.forEach(([x, y, z]) => {
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.position.set(x, y, z - 2);
      templeGroup.add(p);
    });

    // 1.4 大殿金黄琉璃瓦重檐殿顶
    const roofGeo1 = new THREE.ConeGeometry(15, 3.8, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xd98218, roughness: 0.35, metalness: 0.3 });
    const roof1 = new THREE.Mesh(roofGeo1, roofMat);
    roof1.position.set(0, 7.8, -2);
    roof1.rotation.y = Math.PI / 4;
    templeGroup.add(roof1);

    // 1.5 殿前青铜大香炉 (三足两耳宝鼎)
    const censerGeo = new THREE.CylinderGeometry(1.2, 0.9, 1.4, 16);
    const censerMat = new THREE.MeshStandardMaterial({ color: 0x3d4e42, metalness: 0.8, roughness: 0.4 });
    const censer = new THREE.Mesh(censerGeo, censerMat);
    censer.position.set(0, 1.9, 3.2);
    templeGroup.add(censer);

    // 香炉内三炷高香 (带微红呼吸光点)
    for (let i = -1; i <= 1; i++) {
      const stickGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.6, 8);
      const stickMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
      const stick = new THREE.Mesh(stickGeo, stickMat);
      stick.position.set(i * 0.25, 2.7, 3.2);
      templeGroup.add(stick);
    }

    // 1.6 香炉青烟流体粒子系统
    const smokeCount = 120;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      smokePos[i * 3 + 0] = (Math.random() - 0.5) * 0.4;
      smokePos[i * 3 + 1] = 2.6 + Math.random() * 3.5;
      smokePos[i * 3 + 2] = 3.2 + (Math.random() - 0.5) * 0.4;
    }
    smokeGeo.setAttribute("position", new THREE.BufferAttribute(smokePos, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0xbfd8f5,
      size: 0.28,
      transparent: true,
      opacity: 0.65,
    });
    const smokeParticles = new THREE.Points(smokeGeo, smokeMat);
    smokeParticlesRef.current = smokeParticles;
    templeGroup.add(smokeParticles);

    // 1.7 殿前紫檀木鱼台与三维电子木鱼
    const tableGeo = new THREE.BoxGeometry(1.8, 1.1, 1.2);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.7 });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(0, 1.75, 5.2);
    templeGroup.add(tableMesh);

    // 3D 电子木鱼 (精巧椭球体)
    const fishGeo = new THREE.SphereGeometry(0.38, 16, 12);
    fishGeo.scale(1.2, 0.75, 1.0);
    const fishMat = new THREE.MeshStandardMaterial({ color: 0xc87d32, roughness: 0.35, metalness: 0.2 });
    const fishMesh = new THREE.Mesh(fishGeo, fishMat);
    fishMesh.position.set(0, 2.45, 5.2);
    woodenFishMeshRef.current = fishMesh;
    templeGroup.add(fishMesh);

    // 1.8 殿檐侧方悬挂青铜晨钟
    const bellGeo = new THREE.CylinderGeometry(0.45, 0.85, 1.8, 16);
    const bellMat = new THREE.MeshStandardMaterial({ color: 0x8a6e35, metalness: 0.85, roughness: 0.3 });
    const bellMesh = new THREE.Mesh(bellGeo, bellMat);
    bellMesh.position.set(-5.5, 4.5, 2.5);
    bellMeshRef.current = bellMesh;
    templeGroup.add(bellMesh);

    // 殿内暖金神圣光源
    const innerLight = new THREE.PointLight(0xffa834, 3.5, 18);
    innerLight.position.set(0, 4.0, -1.5);
    templeGroup.add(innerLight);

    // =========================================================================
    // 维度 2 几何体：【未来中枢 · 3D 赛博数字新城】
    // =========================================================================
    const cityGroup = new THREE.Group();
    cityGroupRef.current = cityGroup;
    cityGroup.visible = false;
    scene.add(cityGroup);

    // 2.1 赛博沥青街道地面 (带深邃科技感网格)
    const cityGroundGeo = new THREE.PlaneGeometry(160, 160);
    const cityGroundMat = new THREE.MeshStandardMaterial({ color: 0x07090e, roughness: 0.3, metalness: 0.6 });
    const cityGround = new THREE.Mesh(cityGroundGeo, cityGroundMat);
    cityGround.rotation.x = -Math.PI / 2;
    cityGroup.add(cityGround);

    // 街道发光标线
    const gridHelper = new THREE.GridHelper(160, 40, 0x00f2fe, 0x1f293d);
    gridHelper.position.y = 0.02;
    cityGroup.add(gridHelper);

    // 2.2 程序化生成 48 栋赛博摩天大楼
    const buildingTex = createBuildingTexture();
    const buildingMat = new THREE.MeshStandardMaterial({
      map: buildingTex,
      roughness: 0.4,
      metalness: 0.5,
    });

    const buildingPositions: Array<[number, number, number, number, number]> = [];
    for (let x = -60; x <= 60; x += 20) {
      for (let z = -60; z <= 60; z += 20) {
        if (Math.abs(x) < 12 && Math.abs(z) < 12) continue; // 留出中央主干道
        const h = 18 + Math.random() * 45;
        const w = 9 + Math.random() * 5;
        buildingPositions.push([x, h / 2, z, w, h]);
      }
    }

    buildingPositions.forEach(([bx, by, bz, bw, bh]) => {
      const bGeo = new THREE.BoxGeometry(bw, bh, bw);
      const bMesh = new THREE.Mesh(bGeo, buildingMat);
      bMesh.position.set(bx, by, bz);
      cityGroup.add(bMesh);

      // 大厦顶部红色航标警示频闪灯
      const beaconGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(bx, bh + 0.3, bz);
      cityGroup.add(beacon);
    });

    // 2.3 街道自主巡航车流 (红白光轨小车)
    const vehicles: Array<{ mesh: THREE.Mesh; speed: number; lane: number }> = [];
    const carGeo = new THREE.BoxGeometry(0.8, 0.4, 1.8);
    for (let i = 0; i < 16; i++) {
      const isRed = i % 2 === 0;
      const carMat = new THREE.MeshBasicMaterial({ color: isRed ? 0xff2d55 : 0x00f2fe });
      const car = new THREE.Mesh(carGeo, carMat);
      const laneX = isRed ? -3.5 : 3.5;
      car.position.set(laneX, 0.25, (Math.random() - 0.5) * 80);
      cityGroup.add(car);
      vehicles.push({
        mesh: car,
        speed: (0.18 + Math.random() * 0.15) * (isRed ? -1 : 1),
        lane: laneX,
      });
    }
    vehiclesRef.current = vehicles;

    // 调整视口大小
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // 鼠标拖拽运镜逻辑
    const handleMouseDown = (e: MouseEvent) => {
      isPointerDownRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerDownRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      cameraYawRef.current -= dx * 0.0035;
      cameraPitchRef.current = Math.max(-0.6, Math.min(0.6, cameraPitchRef.current - dy * 0.0035));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isPointerDownRef.current = false;
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // -------------------------------------------------------------------------
    // 渲染主循环 (60 FPS Game Loop)
    // -------------------------------------------------------------------------
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);

      // 1. 摄像机物理运动积分 (WASD)
      const forward = new THREE.Vector3(
        -Math.sin(cameraYawRef.current),
        0,
        -Math.cos(cameraYawRef.current)
      );
      const right = new THREE.Vector3(
        Math.cos(cameraYawRef.current),
        0,
        -Math.sin(cameraYawRef.current)
      );

      const moveSpeed = (activeKeys["shift"] ? 12.0 : 6.0) * delta;
      if (activeKeys["w"] || activeKeys["arrowup"]) camera.position.addScaledVector(forward, moveSpeed);
      if (activeKeys["s"] || activeKeys["arrowdown"]) camera.position.addScaledVector(forward, -moveSpeed);
      if (activeKeys["a"] || activeKeys["arrowleft"]) camera.position.addScaledVector(right, -moveSpeed);
      if (activeKeys["d"] || activeKeys["arrowright"]) camera.position.addScaledVector(right, moveSpeed);

      // 摄像机旋转目标
      const lookTarget = new THREE.Vector3()
        .copy(camera.position)
        .add(
          new THREE.Vector3(
            -Math.sin(cameraYawRef.current) * Math.cos(cameraPitchRef.current),
            Math.sin(cameraPitchRef.current),
            -Math.cos(cameraYawRef.current) * Math.cos(cameraPitchRef.current)
          )
        );
      camera.lookAt(lookTarget);

      // 2. 香炉青烟粒子向上飘散回环
      if (smokeParticles && smokeParticles.geometry.attributes.position) {
        const posAttr = smokeParticles.geometry.attributes.position;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < smokeCount; i++) {
          arr[i * 3 + 1] += delta * 0.9;
          arr[i * 3 + 0] += Math.sin(arr[i * 3 + 1] * 2.5) * delta * 0.25;
          if (arr[i * 3 + 1] > 6.2) {
            arr[i * 3 + 1] = 2.6;
            arr[i * 3 + 0] = (Math.random() - 0.5) * 0.3;
          }
        }
        posAttr.needsUpdate = true;
      }

      // 3. 木鱼受敲击弹性形变动画
      if (woodenFishMeshRef.current && woodenFishBounceRef.current > 0) {
        woodenFishBounceRef.current = Math.max(0, woodenFishBounceRef.current - delta * 6.0);
        const s = 1.0 - woodenFishBounceRef.current * 0.18;
        woodenFishMeshRef.current.scale.set(1.2 * s, 0.75 * s, 1.0 * s);
      }

      // 4. 古钟撞击摇摆动画
      if (bellMeshRef.current && bellSwingRef.current > 0) {
        bellSwingRef.current = Math.max(0, bellSwingRef.current - delta * 1.5);
        bellMeshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 12) * bellSwingRef.current * 0.22;
      }

      // 5. 赛博城市车流流动
      vehiclesRef.current.forEach((car) => {
        car.mesh.position.z += car.speed * delta * 24.0;
        if (car.mesh.position.z > 60) car.mesh.position.z = -60;
        if (car.mesh.position.z < -60) car.mesh.position.z = 60;
      });

      // 周期性更新 HUD 坐标
      if (Math.random() < 0.25) {
        setCameraCoords({
          x: parseFloat(camera.position.x.toFixed(1)),
          y: parseFloat(camera.position.y.toFixed(1)),
          z: parseFloat(camera.position.z.toFixed(1)),
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [activeKeys]);

  // 响应维度切换
  useEffect(() => {
    if (templeGroupRef.current) templeGroupRef.current.visible = worldMode === "temple";
    if (cityGroupRef.current) cityGroupRef.current.visible = worldMode === "city";

    // 重置视角到各场景最佳观赏点
    if (cameraRef.current) {
      if (worldMode === "temple") {
        cameraRef.current.position.set(0, 2.2, 8.5);
        cameraYawRef.current = 0;
        cameraPitchRef.current = -0.08;
      } else {
        cameraRef.current.position.set(0, 3.8, 18.0);
        cameraYawRef.current = 0;
        cameraPitchRef.current = -0.05;
      }
    }
  }, [worldMode]);

  const currentMsg = BROADCAST_MESSAGES[broadcastIdx];

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden select-none bg-[#070707] font-sans">
      {/* 3D 渲染主画布 */}
      <div ref={containerRef} className="relative h-full w-full cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="h-full w-full object-cover" />

        {/* 屏幕准星 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-[1px] bg-white/60" />
          <div className="absolute h-[1px] w-4 bg-white/60" />
          <div className="absolute h-2 w-2 rounded-full border border-[#2997ff]/80" />
        </div>

        {/* 浮动金色功德文字 */}
        <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
          {floatingTexts.map((item) => (
            <div
              key={item.id}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 animate-float-fade font-semibold text-[#ffd60a] text-[20px] sm:text-[24px] tracking-tight whitespace-nowrap"
            >
              {item.text}
            </div>
          ))}
        </div>

        {/* 顶部居中：Apple 极简灵动药丸 (双模切换 + 在线信众广播) */}
        <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3 rounded-full bg-[#1d1d1f]/95 px-3 sm:px-4 py-1.5 border border-white/10 text-[12px] text-white max-w-[94vw] sm:max-w-2xl" data-ui="true">
          {/* 双模一键切换胶囊 */}
          <div className="flex items-center gap-1 bg-white/10 rounded-full p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setWorldMode("temple")}
              className={`terra-btn rounded-full px-3 py-1 text-[12px] transition cursor-pointer ${
                worldMode === "temple"
                  ? "bg-[#2997ff] text-white font-semibold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              赛博禅刹
            </button>
            <button
              type="button"
              onClick={() => setWorldMode("city")}
              className={`terra-btn rounded-full px-3 py-1 text-[12px] transition cursor-pointer ${
                worldMode === "city"
                  ? "bg-[#2997ff] text-white font-semibold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              未来新城
            </button>
          </div>

          <span className="text-white/20 hidden sm:inline">|</span>

          {/* 在线人数与动作广播 */}
          <div className="flex items-center gap-2 truncate text-[12px]">
            <span className="h-2 w-2 rounded-full bg-[#34c759] shrink-0" />
            <span className="text-white/50 shrink-0 tnum">{onlineCount} 在线</span>
            <span className="text-white/30 hidden md:inline">·</span>
            <div className="truncate hidden md:block">
              <span className="text-[#2997ff] font-medium mr-1.5">{currentMsg.user}</span>
              <span className="text-white/80">{currentMsg.action}</span>
              <span className="text-white/40 ml-1.5">({currentMsg.detail})</span>
            </div>
          </div>
        </div>

        {/* 左上角：世界维度与 3D 摄像机坐标 */}
        <div className="pointer-events-none absolute top-4 sm:top-6 left-4 sm:left-6 z-30 max-w-xs">
          <div className="rounded-[18px] bg-[#0c0c0e]/95 p-3.5 sm:p-4 text-white border border-white/5" data-ui="true">
            <div className="flex items-center gap-2 text-[13px] text-[#2997ff] tnum">
              <span className="h-2 w-2 rounded-full bg-[#2997ff]" />
              <span>{worldMode === "temple" ? "TERRA-CYBER-TEMPLE" : "TERRA-CYBER-CITY"}</span>
            </div>
            <div className="mt-1 font-semibold text-white text-[17px] tracking-tight">
              {worldMode === "temple" ? "赛博禅刹 · 祈福大殿" : "未来中枢 · 赛博新城"}
            </div>
            <div className="mt-2 flex items-center gap-2.5 text-[12px] text-white/50 tnum">
              <span>X: {cameraCoords.x}m</span>
              <span>Y: {cameraCoords.y}m</span>
              <span>Z: {cameraCoords.z}m</span>
              <span className="text-[#34c759]">60 FPS</span>
            </div>
          </div>
        </div>

        {/* 右上角：专属互动浮岛 (禅刹祈福 / 新城避障) */}
        <div className="absolute top-20 sm:top-24 right-4 sm:right-6 z-30 flex flex-col items-end gap-2">
          {worldMode === "temple" ? (
            <div className="rounded-[20px] bg-[#1d1d1f]/95 p-3 sm:p-3.5 border border-white/10 text-white space-y-2.5 max-w-[210px]" data-ui="true">
              <div className="flex items-center justify-between text-[11px] text-white/50">
                <span>赛博禅修 · 功德积攒</span>
                <span className="text-[#ffd60a] font-semibold tnum">{meritCount}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handleKnockWoodenFish}
                  className="rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-95 py-2 px-2 text-center text-[12px] font-medium text-white transition cursor-pointer"
                  title="敲击电子木鱼（Space / 点击）"
                >
                  敲木鱼
                </button>
                <button
                  type="button"
                  onClick={handleRingBell}
                  className="rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-95 py-2 px-2 text-center text-[12px] font-medium text-white transition cursor-pointer"
                  title="撞响天坛晨钟（E 键）"
                >
                  撞晨钟
                </button>
                <button
                  type="button"
                  onClick={handleBurnIncense}
                  className="rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-95 py-2 px-2 text-center text-[12px] font-medium text-[#ffd60a] transition cursor-pointer"
                  title="敬奉赛博真香（F 键）"
                >
                  敬真香
                </button>
                <button
                  type="button"
                  onClick={handleDrawFortune}
                  className="rounded-[10px] bg-[#2997ff]/20 hover:bg-[#2997ff]/30 active:scale-95 py-2 px-2 text-center text-[12px] font-medium text-[#2997ff] transition cursor-pointer"
                  title="感召灵签"
                >
                  抽灵签
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-[20px] bg-[#1d1d1f]/95 p-3 sm:p-3.5 border border-white/10 text-white space-y-2 max-w-[220px]" data-ui="true">
              <div className="text-[11px] text-white/50">多智能体 · 决策推演</div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={handleTriggerAvoidance}
                  className="rounded-[10px] bg-[#2997ff]/20 hover:bg-[#2997ff]/30 active:scale-95 py-2 px-3 text-left text-[12px] font-medium text-[#2997ff] transition cursor-pointer flex items-center justify-between"
                >
                  <span>注入突发避障 (E)</span>
                  <span className="text-[10px] text-[#2997ff]/70">反事实</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    zenAudio.playCyberPulse();
                    if (cameraRef.current) cameraRef.current.position.y += 15.0;
                  }}
                  className="rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-95 py-2 px-3 text-left text-[12px] font-medium text-white transition cursor-pointer flex items-center justify-between"
                >
                  <span>无人机俯瞰 (Space)</span>
                  <span className="text-[10px] text-white/50">高空</span>
                </button>
              </div>
            </div>
          )}

          {/* 切换全屏与文档链接 */}
          <div className="flex items-center gap-2">
            {onToggleSpecs && (
              <button
                type="button"
                onClick={onToggleSpecs}
                className="rounded-full bg-white/10 hover:bg-white/20 px-3 py-1 text-[11px] text-white transition cursor-pointer"
              >
                世界模型文献
              </button>
            )}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-full bg-white/10 hover:bg-white/20 px-3 py-1 text-[11px] text-white transition cursor-pointer"
            >
              {isFullscreen ? "退出全屏" : "全屏"}
            </button>
          </div>
        </div>

        {/* 左下角：WASD 控制与按键提示 */}
        <div className="absolute bottom-6 left-4 sm:left-8 z-30 flex items-center gap-3">
          <div className="rounded-[20px] bg-[#1d1d1f]/95 p-3 text-white border border-white/5" data-ui="true">
            <div className="text-[11px] text-white/50 mb-2 font-medium hidden sm:block tracking-wide">
              {worldMode === "temple"
                ? "WASD 漫游 · Space 敲木鱼 · E 撞钟 · 鼠标旋转视角"
                : "WASD 运镜 · Space 跃升 · E 避障 · 鼠标旋转视角"}
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (cameraRef.current) cameraRef.current.position.z -= 1.0;
                }}
                className={`terra-btn h-8 w-11 rounded-[8px] text-[13px] font-semibold transition ${
                  activeKeys["w"] || activeKeys["arrowup"] ? "bg-[#2997ff] text-white" : "bg-white/10 text-white/70"
                }`}
              >
                W
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (cameraRef.current) cameraRef.current.position.x -= 1.0;
                  }}
                  className={`terra-btn h-8 w-11 rounded-[8px] text-[13px] font-semibold transition ${
                    activeKeys["a"] || activeKeys["arrowleft"] ? "bg-[#2997ff] text-white" : "bg-white/10 text-white/70"
                  }`}
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (cameraRef.current) cameraRef.current.position.z += 1.0;
                  }}
                  className={`terra-btn h-8 w-11 rounded-[8px] text-[13px] font-semibold transition ${
                    activeKeys["s"] || activeKeys["arrowdown"] ? "bg-[#2997ff] text-white" : "bg-white/10 text-white/70"
                  }`}
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (cameraRef.current) cameraRef.current.position.x += 1.0;
                  }}
                  className={`terra-btn h-8 w-11 rounded-[8px] text-[13px] font-semibold transition ${
                    activeKeys["d"] || activeKeys["arrowright"] ? "bg-[#2997ff] text-white" : "bg-white/10 text-white/70"
                  }`}
                >
                  D
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 灵签弹窗 (Apple 极简浮层视觉) */}
        {activeFortune && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
            <div
              className="w-full max-w-md rounded-[28px] bg-[#1d1d1f] p-6 sm:p-8 text-white space-y-5 border border-white/10 animate-fade-in"
              data-ui="true"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#ffd60a]/15 px-3 py-1 text-[12px] font-semibold text-[#ffd60a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ffd60a]" />
                  <span>{activeFortune.grade}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveFortune(null)}
                  className="rounded-full bg-white/10 h-7 px-3 flex items-center justify-center text-[12px] text-white/70 hover:bg-white/20 hover:text-white transition cursor-pointer"
                >
                  关闭
                </button>
              </div>

              <div className="space-y-1 text-center py-2">
                <div className="text-[13px] text-[#2997ff] font-medium tracking-widest">
                  赛博禅刹 · 灵签推演
                </div>
                <h3 className="text-[26px] font-semibold text-white tracking-tight">
                  {activeFortune.title}
                </h3>
              </div>

              <div className="rounded-[18px] bg-white/5 p-4 text-center leading-relaxed text-[#ffd60a] text-[15px] font-medium">
                “{activeFortune.poem}”
              </div>

              <div className="space-y-2 text-[14px] text-white/70 leading-relaxed">
                <div className="text-white/40 text-[12px]">【卦象解析】</div>
                <div>{activeFortune.meaning}</div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[12px] text-white/40">累计功德：{meritCount}</span>
                <button
                  type="button"
                  onClick={handleDrawFortune}
                  className="rounded-full bg-[#2997ff] px-5 py-2 text-[13px] font-medium text-white hover:bg-[#0077ed] transition cursor-pointer"
                >
                  再求一签
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
