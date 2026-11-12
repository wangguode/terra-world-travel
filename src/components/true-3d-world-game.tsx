"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// 纯净 Web Audio 原生声学引擎（零外部网络依赖，毫秒级即发即响）
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

      gain.gain.setValueAtTime(0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.085);
    } catch {
      // 降级
    }
  }

  // 撞响古钟：大殿晨钟空灵四重非谐泛音长共振
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
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 3.0);
      });
    } catch {
      // 降级
    }
  }

  // 赛博新城推进音
  playCyberPulse() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.15);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // 降级
    }
  }
}

const zenAudio = new ZenSoundEngine();

// ---------------------------------------------------------------------------
// 灵签与同屏信众广播
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
  { user: "智能体·Agent-09", action: "高架桥协同换道", detail: "超视距协同零碰撞", time: "14秒前" },
];

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
}

// ---------------------------------------------------------------------------
// 辅助纹理生成器 (纯程序化 Canvas，零网络加载依赖)
// ---------------------------------------------------------------------------
function createBuildingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#0a0f1d";
  ctx.fillRect(0, 0, 128, 256);

  for (let y = 8; y < 256; y += 12) {
    for (let x = 8; x < 128; x += 14) {
      const rand = Math.random();
      if (rand > 0.45) {
        ctx.fillStyle = rand > 0.8 ? "#ffd60a" : rand > 0.6 ? "#00f2fe" : "#ffffff";
        ctx.fillRect(x, y, 8, 7);
      } else {
        ctx.fillStyle = "#05070e";
        ctx.fillRect(x, y, 8, 7);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createZenStoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#2c3038";
  ctx.fillRect(0, 0, 256, 256);

  // 石砖勾缝
  ctx.strokeStyle = "#1b1d22";
  ctx.lineWidth = 3;
  for (let i = 0; i <= 256; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  return tex;
}

interface True3DWorldGameProps {
  onToggleSpecs?: () => void;
}

export default function True3DWorldGame({ onToggleSpecs }: True3DWorldGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 维度模式：'temple' 赛博禅刹 | 'city' 未来新城
  const [worldMode, setWorldMode] = useState<"temple" | "city">("temple");

  // 状态机
  const [meritCount, setMeritCount] = useState<number>(108);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [activeFortune, setActiveFortune] = useState<FortuneCard | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(3842);
  const [broadcastIdx, setBroadcastIdx] = useState<number>(0);
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  const [cameraCoords, setCameraCoords] = useState({ x: 0, y: 1.8, z: 12.0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 3D 引用追踪
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const templeGroupRef = useRef<THREE.Group | null>(null);
  const cityGroupRef = useRef<THREE.Group | null>(null);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const petalParticlesRef = useRef<THREE.Points | null>(null);
  const bellMeshRef = useRef<THREE.Mesh | null>(null);
  const bellSwingRef = useRef(0);
  const woodenFishMeshRef = useRef<THREE.Mesh | null>(null);
  const woodenFishBounceRef = useRef(0);
  const vehiclesRef = useRef<Array<{ mesh: THREE.Mesh; speed: number; axis: "x" | "z"; limit: number }>>([]);
  const flyingCarsRef = useRef<Array<{ mesh: THREE.Mesh; speed: number; radius: number; angle: number; height: number }>>([]);
  const avatarMeshesRef = useRef<THREE.Group[]>([]);

  // 真正的游戏角色移动与物理参数 (Player Character Controller)
  const playerRef = useRef({
    pos: new THREE.Vector3(0, 1.8, 14.0),
    vel: new THREE.Vector3(0, 0, 0),
    yaw: 0,
    pitch: -0.06,
    isGrounded: true,
    bobbing: 0,
  });

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
    const y = 48 + (Math.random() * 10 - 5);
    setFloatingTexts((prev) => [...prev.slice(-5), { id, text, x, y }]);
    setMeritCount((c) => c + 1);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1800);
  }, []);

  // 敲木鱼
  const handleKnockWoodenFish = useCallback(() => {
    zenAudio.playWoodenFish();
    woodenFishBounceRef.current = 1.0;
    spawnFloatingText("功德 +1 · 万象澄澈");
  }, [spawnFloatingText]);

  // 撞晨钟
  const handleRingBell = useCallback(() => {
    zenAudio.playBell();
    bellSwingRef.current = 1.0;
    spawnFloatingText("晨钟长鸣 · 功德 +3");
  }, [spawnFloatingText]);

  // 敬真香
  const handleBurnIncense = useCallback(() => {
    zenAudio.playBell();
    spawnFloatingText("赛博焚香 · 青烟化吉");
  }, [spawnFloatingText]);

  // 抽灵签
  const handleDrawFortune = useCallback(() => {
    zenAudio.playBell();
    const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    setActiveFortune(fortune);
    spawnFloatingText("感召灵签 · 天地同频");
  }, [spawnFloatingText]);

  // 未来新城突发避障
  const handleTriggerAvoidance = useCallback(() => {
    zenAudio.playCyberPulse();
    spawnFloatingText("反事实避障 · 无损变道推演");
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

  // 键盘与移动控制监听
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
          // 跳跃冲量
          if (playerRef.current.isGrounded) {
            playerRef.current.vel.y = 8.5;
            playerRef.current.isGrounded = false;
          }
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
  // Three.js 核心 3D 世界构建（自然山峦风景 + 禅刹殿宇群 + 赛博霓虹城）
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. 渲染器配置
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // 2. 场景与透视相机
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#181424");
    scene.fog = new THREE.FogExp2("#181424", 0.008);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      62,
      container.clientWidth / container.clientHeight,
      0.1,
      450
    );
    camera.position.set(0, 1.8, 14.0);
    cameraRef.current = camera;

    // 3. 全局夕阳暖金照明
    const ambientLight = new THREE.AmbientLight(0xffdec7, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffaa5e, 2.2);
    sunLight.position.set(30, 45, 20);
    scene.add(sunLight);

    // =========================================================================
    // 维度 1：【赛博禅刹 · 壮阔群山庭院与古刹殿群】 (Cyber Zen Temple & Scenery)
    // =========================================================================
    const templeGroup = new THREE.Group();
    templeGroupRef.current = templeGroup;
    scene.add(templeGroup);

    // 1.1 天空与远山剪影 (Sky & Distant Mountains)
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x1c1a2e,
      roughness: 0.9,
    });
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const dist = 110 + (i % 3) * 25;
      const mHeight = 35 + (i % 5) * 12;
      const mGeo = new THREE.ConeGeometry(30 + (i % 4) * 8, mHeight, 5);
      const mMesh = new THREE.Mesh(mGeo, mountainMat);
      mMesh.position.set(Math.cos(angle) * dist, mHeight / 2 - 4, Math.sin(angle) * dist);
      templeGroup.add(mMesh);
    }

    // 1.2 禅刹青石地砖广场 (带防滑纹理)
    const stoneTex = createZenStoneTexture();
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const groundMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      roughness: 0.8,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    templeGroup.add(groundMesh);

    // 1.3 汉白玉大殿台基 (三层须弥座与雕栏)
    const baseGeo = new THREE.BoxGeometry(26, 1.4, 20);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xedeef0, roughness: 0.35 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, 0.7, -4);
    templeGroup.add(baseMesh);

    // 汉白玉石阶
    const stairGeo = new THREE.BoxGeometry(8, 0.7, 4);
    const stairMesh = new THREE.Mesh(stairGeo, baseMat);
    stairMesh.position.set(0, 0.35, 7.5);
    templeGroup.add(stairMesh);

    // 1.4 大殿朱红立柱阵列 (12 根金顶红柱)
    const pillarGeo = new THREE.CylinderGeometry(0.42, 0.46, 6.5, 16);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xa12020, roughness: 0.45 });
    const pillarCoords = [
      [-10, 4.2, 3], [-5, 4.2, 3], [5, 4.2, 3], [10, 4.2, 3],
      [-10, 4.2, -4], [-5, 4.2, -4], [5, 4.2, -4], [10, 4.2, -4],
      [-10, 4.2, -11], [-5, 4.2, -11], [5, 4.2, -11], [10, 4.2, -11],
    ];
    pillarCoords.forEach(([x, y, z]) => {
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.position.set(x, y, z);
      templeGroup.add(p);
    });

    // 1.5 重檐金琉璃庑殿顶 (金色双层大屋脊)
    const roof1Geo = new THREE.ConeGeometry(19, 4.8, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xdf8a14, roughness: 0.3, metalness: 0.35 });
    const roof1 = new THREE.Mesh(roof1Geo, roofMat);
    roof1.position.set(0, 9.2, -4);
    roof1.rotation.y = Math.PI / 4;
    templeGroup.add(roof1);

    // 1.6 殿前青铜大香炉 (三足两耳鼎，带呼吸香火)
    const censerGeo = new THREE.CylinderGeometry(1.4, 1.0, 1.6, 16);
    const censerMat = new THREE.MeshStandardMaterial({ color: 0x3d4e42, metalness: 0.85, roughness: 0.35 });
    const censer = new THREE.Mesh(censerGeo, censerMat);
    censer.position.set(0, 2.0, 5.0);
    templeGroup.add(censer);

    // 香炉三炷真香
    for (let i = -1; i <= 1; i++) {
      const stickGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.8, 8);
      const stickMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
      const stick = new THREE.Mesh(stickGeo, stickMat);
      stick.position.set(i * 0.3, 2.9, 5.0);
      templeGroup.add(stick);
    }

    // 香炉青烟流体粒子 (向上流动旋转扩散)
    const smokeCount = 140;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      smokePos[i * 3 + 0] = (Math.random() - 0.5) * 0.5;
      smokePos[i * 3 + 1] = 2.8 + Math.random() * 4.5;
      smokePos[i * 3 + 2] = 5.0 + (Math.random() - 0.5) * 0.5;
    }
    smokeGeo.setAttribute("position", new THREE.BufferAttribute(smokePos, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0xbfd8f5,
      size: 0.35,
      transparent: true,
      opacity: 0.7,
    });
    const smokePoints = new THREE.Points(smokeGeo, smokeMat);
    smokeParticlesRef.current = smokePoints;
    templeGroup.add(smokePoints);

    // 1.7 庭院落花粒子系统 (随风飘扬的粉色花瓣)
    const petalCount = 180;
    const petalGeo = new THREE.BufferGeometry();
    const petalPos = new Float32Array(petalCount * 3);
    for (let i = 0; i < petalCount; i++) {
      petalPos[i * 3 + 0] = (Math.random() - 0.5) * 70;
      petalPos[i * 3 + 1] = 0.5 + Math.random() * 18;
      petalPos[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }
    petalGeo.setAttribute("position", new THREE.BufferAttribute(petalPos, 3));
    const petalMat = new THREE.PointsMaterial({
      color: 0xffb7c5,
      size: 0.22,
      transparent: true,
      opacity: 0.8,
    });
    const petalPoints = new THREE.Points(petalGeo, petalMat);
    petalParticlesRef.current = petalPoints;
    templeGroup.add(petalPoints);

    // 1.8 庭院风景：苍劲迎客松树群与石灯笼长廊
    const treeTrunkGeo = new THREE.CylinderGeometry(0.3, 0.55, 4.5, 8);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x422a18, roughness: 0.9 });
    const treeLeavesGeo = new THREE.ConeGeometry(2.8, 4.2, 7);
    const treeLeavesMat = new THREE.MeshStandardMaterial({ color: 0x1f542f, roughness: 0.6 });

    const treePositions = [
      [-14, 2.2, 10], [-18, 2.2, 0], [-15, 2.2, -10],
      [14, 2.2, 10], [18, 2.2, 0], [15, 2.2, -10],
      [-8, 2.2, 22], [8, 2.2, 22],
    ];
    treePositions.forEach(([tx, ty, tz]) => {
      const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
      trunk.position.set(tx, ty, tz);
      const leaves = new THREE.Mesh(treeLeavesGeo, treeLeavesMat);
      leaves.position.set(tx, ty + 3.2, tz);
      templeGroup.add(trunk);
      templeGroup.add(leaves);
    });

    // 石灯笼阵列 (带暖金烛光)
    const lanternGeo = new THREE.CylinderGeometry(0.25, 0.35, 1.6, 6);
    const lanternMat = new THREE.MeshStandardMaterial({ color: 0x8a8f96, roughness: 0.6 });
    const lanternPositions = [
      [-4.5, 0.8, 12], [4.5, 0.8, 12],
      [-4.5, 0.8, 6], [4.5, 0.8, 6],
      [-4.5, 0.8, 0], [4.5, 0.8, 0],
    ];
    lanternPositions.forEach(([lx, ly, lz]) => {
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(lx, ly, lz);
      const lanternLight = new THREE.PointLight(0xffa834, 1.2, 4.5);
      lanternLight.position.set(lx, ly + 0.9, lz);
      templeGroup.add(lantern);
      templeGroup.add(lanternLight);
    });

    // 1.9 庭院碧波放生池与拱桥
    const pondGeo = new THREE.CylinderGeometry(8, 8, 0.3, 24);
    const pondMat = new THREE.MeshStandardMaterial({
      color: 0x0f4d54,
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.88,
    });
    const pondMesh = new THREE.Mesh(pondGeo, pondMat);
    pondMesh.position.set(-18, 0.1, 15);
    templeGroup.add(pondMesh);

    // 1.10 中央紫檀木鱼台与立体 3D 电子木鱼
    const tableGeo = new THREE.BoxGeometry(2.2, 1.2, 1.4);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x382012, roughness: 0.7 });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(0, 1.8, 8.2);
    templeGroup.add(tableMesh);

    const fishGeo = new THREE.SphereGeometry(0.42, 16, 12);
    fishGeo.scale(1.25, 0.78, 1.05);
    const fishMat = new THREE.MeshStandardMaterial({ color: 0xd4873b, roughness: 0.35, metalness: 0.25 });
    const fishMesh = new THREE.Mesh(fishGeo, fishMat);
    fishMesh.position.set(0, 2.55, 8.2);
    woodenFishMeshRef.current = fishMesh;
    templeGroup.add(fishMesh);

    // 1.11 悬挂天坛晨钟 (铜金大钟)
    const bellGeo = new THREE.CylinderGeometry(0.55, 0.95, 2.1, 16);
    const bellMat = new THREE.MeshStandardMaterial({ color: 0x8a6e35, metalness: 0.85, roughness: 0.3 });
    const bellMesh = new THREE.Mesh(bellGeo, bellMat);
    bellMesh.position.set(-7.5, 5.2, 3.5);
    bellMeshRef.current = bellMesh;
    templeGroup.add(bellMesh);

    // 1.12 同屏在线信众化身 (Multiplayer Devotee Avatars)
    const avatarGroup1 = new THREE.Group();
    const avatarBody1 = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.3, 1.2, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x2997ff, roughness: 0.4, metalness: 0.2 })
    );
    avatarBody1.position.y = 1.0;
    avatarGroup1.add(avatarBody1);
    avatarGroup1.position.set(-2.5, 0, 7.5);
    templeGroup.add(avatarGroup1);

    const avatarGroup2 = new THREE.Group();
    const avatarBody2 = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.3, 1.2, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0xffd60a, roughness: 0.4, metalness: 0.2 })
    );
    avatarBody2.position.y = 1.0;
    avatarGroup2.add(avatarBody2);
    avatarGroup2.position.set(2.8, 0, 6.8);
    templeGroup.add(avatarGroup2);
    avatarMeshesRef.current = [avatarGroup1, avatarGroup2];

    // =========================================================================
    // 维度 2：【未来中枢 · 赛博立体都市与霓虹天际线】 (Cyber City 3D)
    // =========================================================================
    const cityGroup = new THREE.Group();
    cityGroupRef.current = cityGroup;
    cityGroup.visible = false;
    scene.add(cityGroup);

    // 2.1 赛博网格与多车道深色沥青路面
    const cityGroundGeo = new THREE.PlaneGeometry(240, 240);
    const cityGroundMat = new THREE.MeshStandardMaterial({ color: 0x05070c, roughness: 0.3, metalness: 0.7 });
    const cityGround = new THREE.Mesh(cityGroundGeo, cityGroundMat);
    cityGround.rotation.x = -Math.PI / 2;
    cityGroup.add(cityGround);

    const cityGrid = new THREE.GridHelper(240, 60, 0x00f2fe, 0x172238);
    cityGrid.position.y = 0.02;
    cityGroup.add(cityGrid);

    // 2.2 程序化生成 64 栋高低错落摩天大厦与全息广告灯带
    const buildingTex = createBuildingTexture();
    const bMat = new THREE.MeshStandardMaterial({
      map: buildingTex,
      roughness: 0.35,
      metalness: 0.5,
    });

    for (let x = -90; x <= 90; x += 24) {
      for (let z = -90; z <= 90; z += 24) {
        if (Math.abs(x) < 14 && Math.abs(z) < 14) continue; // 留出中央十字大道
        const h = 24 + Math.random() * 65;
        const w = 11 + Math.random() * 7;
        const bGeo = new THREE.BoxGeometry(w, h, w);
        const bMesh = new THREE.Mesh(bGeo, bMat);
        bMesh.position.set(x, h / 2, z);
        cityGroup.add(bMesh);

        // 楼顶红色航空警示信标
        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xff3b30 })
        );
        beacon.position.set(x, h + 0.3, z);
        cityGroup.add(beacon);
      }
    }

    // 2.3 双层高架立体交通桥廊 (Skybridges)
    const bridgeGeo = new THREE.BoxGeometry(160, 1.2, 5.5);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x1b2333, metalness: 0.6, roughness: 0.3 });
    const bridge1 = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge1.position.set(0, 12, -20);
    cityGroup.add(bridge1);

    const bridge2 = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge2.position.set(0, 12, 20);
    cityGroup.add(bridge2);

    // 2.4 地面高速穿行光轨车流 (Light-Trail Vehicles)
    const vehicles: Array<{ mesh: THREE.Mesh; speed: number; axis: "x" | "z"; limit: number }> = [];
    const carGeo = new THREE.BoxGeometry(1.2, 0.5, 2.4);

    for (let i = 0; i < 24; i++) {
      const isRed = i % 2 === 0;
      const carMat = new THREE.MeshBasicMaterial({ color: isRed ? 0xff2d55 : 0x00f2fe });
      const car = new THREE.Mesh(carGeo, carMat);
      const lane = (i % 4 - 1.5) * 4.2;
      car.position.set(lane, 0.3, (Math.random() - 0.5) * 160);
      cityGroup.add(car);
      vehicles.push({
        mesh: car,
        speed: (12 + Math.random() * 16) * (isRed ? -1 : 1),
        axis: "z",
        limit: 85,
      });
    }
    vehiclesRef.current = vehicles;

    // 2.5 高空巡航悬浮飞车 (Flying Vehicles in Sky)
    const flyingCars: Array<{ mesh: THREE.Mesh; speed: number; radius: number; angle: number; height: number }> = [];
    for (let i = 0; i < 6; i++) {
      const fCar = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.6, 3.6),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xffd60a : 0x2997ff })
      );
      cityGroup.add(fCar);
      flyingCars.push({
        mesh: fCar,
        speed: 0.4 + Math.random() * 0.3,
        radius: 40 + i * 10,
        angle: (i / 6) * Math.PI * 2,
        height: 18 + i * 4,
      });
    }
    flyingCarsRef.current = flyingCars;

    // 视口尺寸响应
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // 鼠标与触控 360° 自由旋转视角 (FPS Camera Look)
    const handleMouseDown = (e: MouseEvent) => {
      isPointerDownRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerDownRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      playerRef.current.yaw -= dx * 0.0035;
      playerRef.current.pitch = Math.max(-0.65, Math.min(0.65, playerRef.current.pitch - dy * 0.0035));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isPointerDownRef.current = false;
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // -------------------------------------------------------------------------
    // 渲染主循环 (60 FPS Game Loop: 真实物理、人物移动与粒子动画)
    // -------------------------------------------------------------------------
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // 1. 真实人物行走与物理运动 (WASD Smooth Walk & Sprint)
      const forward = new THREE.Vector3(
        -Math.sin(playerRef.current.yaw),
        0,
        -Math.cos(playerRef.current.yaw)
      );
      const right = new THREE.Vector3(
        Math.cos(playerRef.current.yaw),
        0,
        -Math.sin(playerRef.current.yaw)
      );

      const moveSpeed = (activeKeys["shift"] ? 11.0 : 5.8) * dt;
      const moveDir = new THREE.Vector3(0, 0, 0);

      if (activeKeys["w"] || activeKeys["arrowup"]) moveDir.add(forward);
      if (activeKeys["s"] || activeKeys["arrowdown"]) moveDir.addScaledVector(forward, -1);
      if (activeKeys["a"] || activeKeys["arrowleft"]) moveDir.addScaledVector(right, -1);
      if (activeKeys["d"] || activeKeys["arrowright"]) moveDir.add(right);

      const isWalking = moveDir.lengthSq() > 0.001;
      if (isWalking) {
        moveDir.normalize();
        playerRef.current.pos.addScaledVector(moveDir, moveSpeed);
        playerRef.current.bobbing += dt * 9.5;
      }

      // 重力与下落
      if (!playerRef.current.isGrounded) {
        playerRef.current.vel.y -= 22.0 * dt;
        playerRef.current.pos.y += playerRef.current.vel.y * dt;
        if (playerRef.current.pos.y <= 1.8) {
          playerRef.current.pos.y = 1.8;
          playerRef.current.vel.y = 0;
          playerRef.current.isGrounded = true;
        }
      }

      // 摄像机头部呼吸晃动 (Head Bobbing)
      const bobOffset = isWalking ? Math.sin(playerRef.current.bobbing) * 0.045 : 0;
      camera.position.set(
        playerRef.current.pos.x,
        playerRef.current.pos.y + bobOffset,
        playerRef.current.pos.z
      );

      // 视线朝向计算
      const targetLook = new THREE.Vector3()
        .copy(camera.position)
        .add(
          new THREE.Vector3(
            -Math.sin(playerRef.current.yaw) * Math.cos(playerRef.current.pitch),
            Math.sin(playerRef.current.pitch),
            -Math.cos(playerRef.current.yaw) * Math.cos(playerRef.current.pitch)
          )
        );
      camera.lookAt(targetLook);

      // 2. 香炉青烟粒子动画
      if (smokeParticlesRef.current) {
        const posAttr = smokeParticlesRef.current.geometry.attributes.position;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < smokeCount; i++) {
          arr[i * 3 + 1] += dt * 0.95;
          arr[i * 3 + 0] += Math.sin(arr[i * 3 + 1] * 2.2) * dt * 0.28;
          if (arr[i * 3 + 1] > 7.5) {
            arr[i * 3 + 1] = 2.8;
            arr[i * 3 + 0] = (Math.random() - 0.5) * 0.35;
          }
        }
        posAttr.needsUpdate = true;
      }

      // 3. 庭院落花粒子动画 (自然风向飘零)
      if (petalParticlesRef.current) {
        const pAttr = petalParticlesRef.current.geometry.attributes.position;
        const pArr = pAttr.array as Float32Array;
        for (let i = 0; i < petalCount; i++) {
          pArr[i * 3 + 1] -= dt * 0.8;
          pArr[i * 3 + 0] += Math.sin(time + i) * dt * 0.4;
          if (pArr[i * 3 + 1] < 0.2) {
            pArr[i * 3 + 1] = 16.0;
            pArr[i * 3 + 0] = (Math.random() - 0.5) * 70;
          }
        }
        pAttr.needsUpdate = true;
      }

      // 4. 木鱼敲击受力形变动画
      if (woodenFishMeshRef.current && woodenFishBounceRef.current > 0) {
        woodenFishBounceRef.current = Math.max(0, woodenFishBounceRef.current - dt * 6.5);
        const s = 1.0 - woodenFishBounceRef.current * 0.2;
        woodenFishMeshRef.current.scale.set(1.25 * s, 0.78 * s, 1.05 * s);
      }

      // 5. 晨钟受撞摇摆动画
      if (bellMeshRef.current && bellSwingRef.current > 0) {
        bellSwingRef.current = Math.max(0, bellSwingRef.current - dt * 1.6);
        bellMeshRef.current.rotation.z = Math.sin(time * 12.0) * bellSwingRef.current * 0.22;
      }

      // 6. 信众化身微呼吸动效
      avatarMeshesRef.current.forEach((av, idx) => {
        av.position.y = Math.sin(time * 2.0 + idx) * 0.05;
      });

      // 7. 赛博城市车流与飞车穿梭
      vehiclesRef.current.forEach((car) => {
        car.mesh.position.z += car.speed * dt;
        if (car.mesh.position.z > car.limit) car.mesh.position.z = -car.limit;
        if (car.mesh.position.z < -car.limit) car.mesh.position.z = car.limit;
      });

      flyingCarsRef.current.forEach((fc) => {
        fc.angle += fc.speed * dt * 0.5;
        fc.mesh.position.set(
          Math.cos(fc.angle) * fc.radius,
          fc.height + Math.sin(fc.angle * 2.0) * 1.5,
          Math.sin(fc.angle) * fc.radius
        );
        fc.mesh.rotation.y = -fc.angle + Math.PI / 2;
      });

      // 周期性更新 HUD 坐标
      if (Math.random() < 0.25) {
        setCameraCoords({
          x: parseFloat(playerRef.current.pos.x.toFixed(1)),
          y: parseFloat(playerRef.current.pos.y.toFixed(1)),
          z: parseFloat(playerRef.current.pos.z.toFixed(1)),
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

    if (worldMode === "temple") {
      playerRef.current.pos.set(0, 1.8, 14.0);
      playerRef.current.yaw = 0;
      playerRef.current.pitch = -0.06;
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color("#181424");
        sceneRef.current.fog = new THREE.FogExp2("#181424", 0.008);
      }
    } else {
      playerRef.current.pos.set(0, 1.8, 22.0);
      playerRef.current.yaw = 0;
      playerRef.current.pitch = -0.04;
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color("#05070e");
        sceneRef.current.fog = new THREE.FogExp2("#05070e", 0.009);
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
                    playerRef.current.pos.y = 28.0;
                    playerRef.current.pitch = -0.55;
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

        {/* 左下角：WASD 平滑行走控制盘与触控响应 */}
        <div className="absolute bottom-6 left-4 sm:left-8 z-30 flex items-center gap-3">
          <div className="rounded-[20px] bg-[#1d1d1f]/95 p-3 text-white border border-white/5" data-ui="true">
            <div className="text-[11px] text-white/50 mb-2 font-medium hidden sm:block tracking-wide">
              {worldMode === "temple"
                ? "WASD 平滑漫游 · Shift 奔跑 · Space 敲木鱼 · 鼠标旋转视角"
                : "WASD 平滑驾驶 · Shift 加速 · Space 跳跃 · 鼠标旋转视角"}
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const fwd = new THREE.Vector3(
                    -Math.sin(playerRef.current.yaw),
                    0,
                    -Math.cos(playerRef.current.yaw)
                  );
                  playerRef.current.pos.addScaledVector(fwd, 1.8);
                }}
                className={`terra-btn h-8 w-11 rounded-[8px] text-[13px] font-semibold transition cursor-pointer ${
                  activeKeys["w"] || activeKeys["arrowup"] ? "bg-[#2997ff] text-white" : "bg-white/10 text-white/70"
                }`}
              >
                W
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const right = new THREE.Vector3(
                      Math.cos(playerRef.current.yaw),
                      0,
                      -Math.sin(playerRef.current.yaw)
                    );
                    playerRef.current.pos.addScaledVector(right, -1.8);
                  }}
                  className={`terra-btn h-8 w-11 rounded-[8px] text-[13px] font-semibold transition cursor-pointer ${
                    activeKeys["a"] || activeKeys["arrowleft"] ? "bg-[#2997ff] text-white" : "bg-white/10 text-white/70"
                  }`}
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fwd = new THREE.Vector3(
                      -Math.sin(playerRef.current.yaw),
                      0,
                      -Math.cos(playerRef.current.yaw)
                    );
                    playerRef.current.pos.addScaledVector(fwd, -1.8);
                  }}
                  className={`terra-btn h-8 w-11 rounded-[8px] text-[13px] font-semibold transition cursor-pointer ${
                    activeKeys["s"] || activeKeys["arrowdown"] ? "bg-[#2997ff] text-white" : "bg-white/10 text-white/70"
                  }`}
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const right = new THREE.Vector3(
                      Math.cos(playerRef.current.yaw),
                      0,
                      -Math.sin(playerRef.current.yaw)
                    );
                    playerRef.current.pos.addScaledVector(right, 1.8);
                  }}
                  className={`terra-btn h-8 w-11 rounded-[8px] text-[13px] font-semibold transition cursor-pointer ${
                    activeKeys["d"] || activeKeys["arrowright"] ? "bg-[#2997ff] text-white" : "bg-white/10 text-white/70"
                  }`}
                >
                  D
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 灵签弹窗 (Apple 极简磨砂卡片) */}
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
