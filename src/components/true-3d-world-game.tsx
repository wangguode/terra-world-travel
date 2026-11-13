"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createTempleArchitecture } from "@/lib/temple-architecture";
import { createCityArchitecture } from "@/lib/city-architecture";

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
      // 容错降级
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
      // 容错降级
    }
  }

  // 禅茶清润水流音
  playTeaPour() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(1240, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // 容错降级
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
      // 容错降级
    }
  }
}

const zenAudio = new ZenSoundEngine();

// ---------------------------------------------------------------------------
// 灵签文库与信众广播
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
    title: "金尊佛光 · 潜龙出渊",
    poem: "晨钟初叩净尘嚣，潜象千重自泛潮。自回归途无碍阻，万般吉兆入云霄。",
    meaning: "当前自回归神经潜空间极度平稳自洽，梯度流向顺畅，所求之事必得圆满成就。",
  },
  {
    id: 2,
    grade: "第 18 签 · 乾元亨利",
    title: "禅茶一味 · 佛光初照",
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
  { user: "信众·若雪", action: "在佛前焚香祈福", detail: "香火袅袅 · 功德+1", time: "刚刚" },
  { user: "僧人·慧明", action: "大殿内撞响晨钟", detail: "钟鸣梵音 · 涤荡万象", time: "2秒前" },
  { user: "漫游者·Cypher", action: "写实街区高架避障", detail: "反事实无损变道成功", time: "4秒前" },
  { user: "探索者·子墨", action: "茶馆小憩品茗禅思", detail: "心神澄澈 · 福慧双增", time: "7秒前" },
  { user: "信众·无尘", action: "连续敲击电子木鱼", detail: "功德累积达 108 遍", time: "9秒前" },
  { user: "智能体·Agent-09", action: "立体空中交通巡航", detail: "超视距协同零碰撞", time: "14秒前" },
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

function createZenStoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#323740";
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = "#20242b";
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

  // 维度模式：'temple' 灵山寺院 | 'city' 写实街区
  const [worldMode, setWorldMode] = useState<"temple" | "city">("temple");
  const worldModeRef = useRef<"temple" | "city">(worldMode);
  useEffect(() => {
    worldModeRef.current = worldMode;
  }, [worldMode]);

  // 状态机
  const [meritCount, setMeritCount] = useState<number>(108);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [activeFortune, setActiveFortune] = useState<FortuneCard | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(3842);
  const [broadcastIdx, setBroadcastIdx] = useState<number>(0);
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  const activeKeysRef = useRef<Record<string, boolean>>({});
  const [renderError, setRenderError] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [cameraCoords, setCameraCoords] = useState({ x: 0, y: 1.8, z: 12.0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCinematic, setIsCinematic] = useState(false);
  const isCinematicRef = useRef(false);
  useEffect(() => {
    isCinematicRef.current = isCinematic;
  }, [isCinematic]);

  // 3D 引用追踪
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const dustParticlesRef = useRef<THREE.Points | null>(null);
  const templeGroupRef = useRef<THREE.Group | null>(null);
  const cityGroupRef = useRef<THREE.Group | null>(null);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const teaSmokeRef = useRef<THREE.Points | null>(null);
  const petalParticlesRef = useRef<THREE.Points | null>(null);
  const cloudsRef = useRef<THREE.Group[]>([]);
  const buddhaHaloRef = useRef<THREE.Mesh | null>(null);
  const bellMeshRef = useRef<THREE.Mesh | null>(null);
  const bellSwingRef = useRef(0);
  const woodenFishMeshRef = useRef<THREE.Mesh | null>(null);
  const woodenFishBounceRef = useRef(0);
  const monkGroupRef = useRef<THREE.Group | null>(null);
  const maidenGroupRef = useRef<THREE.Group | null>(null);
  const [templeAssetState, setTempleAssetState] = useState<"loading" | "ready" | "error">("loading");
  const [templeProgress, setTempleProgress] = useState(0);
  const [templeView, setTempleView] = useState<"real" | "concept">("real");
  const setTempleViewRef = useRef<((mode: "real" | "concept") => void) | null>(null);
  const [measuredFps, setMeasuredFps] = useState(0);

  const templeSpawnRef = useRef(new THREE.Vector3(0, 3, 65));
  const citySpawnRef = useRef(new THREE.Vector3(0, 1.8, 14));
  const cityYawRef = useRef(0);
  const loadCityRef = useRef<(() => void) | null>(null);
  const [cityAssetState, setCityAssetState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [cityProgress, setCityProgress] = useState(0);
  const vehiclesRef = useRef<Array<{ mesh: THREE.Mesh; speed: number; limit: number }>>([]);
  const flyingCarsRef = useRef<Array<{ mesh: THREE.Mesh; speed: number; radius: number; angle: number; height: number }>>([]);

  // 角色动力学控制器
  const playerRef = useRef({
    pos: new THREE.Vector3(0, 3, 65),
    vel: new THREE.Vector3(0, 0, 0),
    yaw: 0,
    pitch: -0.06,
    isGrounded: true,
    bobbing: 0,
  });

  const isPointerDownRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const jumpToView = (view: "overview" | "gate" | "hall" | "buddha") => {
    setIsCinematic(false);
    const concept = view === "buddha";
    setTempleView(concept ? "concept" : "real");
    setTempleViewRef.current?.(concept ? "concept" : "real");
    const positions = { overview: [38, 63, 86], gate: [0, 37, 46], hall: [14, 56, 12], buddha: [0, 13, -57] };
    const [x,y,z] = positions[view];
    playerRef.current.pos.set(x,y,z);
    playerRef.current.yaw = view === "overview" ? .36 : view === "hall" ? .45 : 0;
    playerRef.current.pitch = view === "overview" ? -.12 : view === "buddha" ? .18 : view === "hall" ? .1 : .18;
  };

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
    spawnFloatingText("赛博焚香 · 佛光普照");
  }, [spawnFloatingText]);

  // 品禅茶
  const handleDrinkTea = useCallback(() => {
    zenAudio.playTeaPour();
    spawnFloatingText("禅茶一味 · 功德 +5");
  }, [spawnFloatingText]);

  // 抽灵签
  const handleDrawFortune = useCallback(() => {
    zenAudio.playBell();
    const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    setActiveFortune(fortune);
    spawnFloatingText("感召灵签 · 天地同频");
  }, [spawnFloatingText]);

  // 写实街区突发避障
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
      activeKeysRef.current = { ...activeKeysRef.current, [key]: true };
      setActiveKeys((prev) => ({ ...prev, [key]: true }));

      if (key === " " || key === "space") {
        if (worldMode === "temple") {
          handleKnockWoodenFish();
        } else {
          zenAudio.playCyberPulse();
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
      } else if (key === "t" && worldMode === "temple") {
        handleDrinkTea();
      } else if (key === "c") {
        setIsCinematic((prev) => {
          const next = !prev;
          spawnFloatingText(next ? "开启电影级全景运镜" : "退出电影运镜 · 恢复自由漫游");
          return next;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      delete activeKeysRef.current[key];
      setActiveKeys((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    };

    const handleBlur = () => {
      activeKeysRef.current = {};
      setActiveKeys({});
    };
    window.addEventListener("blur", handleBlur);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [worldMode, handleKnockWoodenFish, handleRingBell, handleBurnIncense, handleDrinkTea, handleTriggerAvoidance, spawnFloatingText]);

  // ---------------------------------------------------------------------------
  // Three.js 核心 3D 世界构建（大佛、僧人、汉服美女、禅茶馆、群山与白云）
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. 渲染器（电影级 ACES 调色 + PCF 硬件软阴影）
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      const fallbackFrame = requestAnimationFrame(() => setRenderError(true));
      return () => cancelAnimationFrame(fallbackFrame);
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 640 ? 1.25 : 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;

    // 2. 场景与相机（电影 54mm 黄金视场角与深邃暮色雾霭）
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#b4c3c8");
    scene.fog = new THREE.FogExp2("#b4c3c8", 0.0018);
    sceneRef.current = scene;
    let disposed = false;
    const environmentGenerator = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const fallbackEnvironment = environmentGenerator.fromScene(room);
    room.dispose();
    scene.environment = fallbackEnvironment.texture;
    let hdrEnvironment: THREE.WebGLRenderTarget | undefined;
    let skyTexture: THREE.Texture | undefined;
    new HDRLoader().load("/environments/venice-sunset-1k.hdr", (texture) => {
      if (disposed) { texture.dispose(); return; }
      hdrEnvironment = environmentGenerator.fromEquirectangular(texture);
      scene.environment = hdrEnvironment.texture;
      scene.environmentIntensity = 0.9;
      // The HDR is retained by PMREM only; a neutral sky keeps the scan and
      // authored additions under the same atmosphere.
      texture.mapping = THREE.EquirectangularReflectionMapping;
      skyTexture = texture;
      scene.background = texture;
      scene.backgroundBlurriness = .12;
    }, undefined, () => { /* Keep the local PMREM fallback if HDR is unavailable. */ });

    const camera = new THREE.PerspectiveCamera(
      54,
      container.clientWidth / container.clientHeight,
      0.1,
      600
    );
    camera.position.set(0, 3, 65);
    cameraRef.current = camera;

    // 3. 全局光照系统与动态物理软阴影
    const ambientLight = new THREE.AmbientLight(0xffeedb, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffe0b5, 3.0);
    sunLight.position.set(45, 60, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 180;
    sunLight.shadow.camera.left = -45;
    sunLight.shadow.camera.right = 45;
    sunLight.shadow.camera.top = 45;
    sunLight.shadow.camera.bottom = -45;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.radius = 2.2;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xb4d2e8, 0x796958, 1.6);
    scene.add(hemiLight);

    // 4. 后期处理 UnrealBloomPass 电影级辉光管线
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.16, // strength
      0.4,  // radius
      1.15  // threshold
    );
    composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);
    composerRef.current = composer;

    // =========================================================================
    // 维度 1：【灵山寺院全景大世界】 (Buddha, Temple, Mountains, Clouds, NPCs)
    // =========================================================================
    const templeGroup = new THREE.Group();
    templeGroupRef.current = templeGroup;
    scene.add(templeGroup);

    // Distant terrain uses smooth silhouettes and atmospheric depth, not snow cones.
    cloudsRef.current = [];
    const mountainMaterial = new THREE.MeshStandardMaterial({ color: 0x74827a, roughness: 1 });
    for (let i = 0; i < 12; i++) {
      const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 16), mountainMaterial);
      const angle = (i / 12) * Math.PI * 2;
      hill.position.set(Math.cos(angle) * 185, -18, Math.sin(angle) * 185);
      hill.scale.set(80, 30 + (i % 4) * 10, 75);
      templeGroup.add(hill);
    }

    // 1.3 禅刹地面青石板广场 (接收逼真物理软阴影)
    const stoneTex = createZenStoneTexture();
    const groundGeo = new THREE.PlaneGeometry(320, 360);
    const groundMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.8, metalness: 0.1 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    templeGroup.add(groundMesh);

    // Detailed timber architecture replaces the former cone-shaped hall.
    const precinct = createTempleArchitecture();
    templeGroup.add(precinct);

    // 电影级空气神圣金光微粒 (Cinematic Golden Dust Motes / Spirit Particles)
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3 + 0] = (Math.random() - 0.5) * 45;
      dustPos[i * 3 + 1] = 0.5 + Math.random() * 9.5;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 35;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xffe680,
      size: 0.04,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    dustParticlesRef.current = dustPoints;
    templeGroup.add(dustPoints);

    // =========================================================================
    // GLTF 高保真开源大模型加载系统 (零外部依赖，本地 WASM Draco 极速解码)
    // =========================================================================
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    // =========================================================================
    // 1.6 核心圣物：【真实金尊大佛 (The Golden Buddha)】
    // =========================================================================
    const buddhaGroup = new THREE.Group();
    buddhaGroup.position.set(0, 1.6, -28);

    // 多层金雕莲花宝座 (Lotus Throne)
    const lotusBase = new THREE.Mesh(
      new THREE.CylinderGeometry(3.6, 4.2, 1.3, 24),
      new THREE.MeshStandardMaterial({ color: 0xc98728, metalness: 0.85, roughness: 0.28 })
    );
    buddhaGroup.add(lotusBase);

    // 默认即显几何体（极速呈现，待 GLB 加载完毕后平滑隐退）
    const mockBuddhaMesh = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd23f,
      metalness: 0.85,
      roughness: 0.22,
    });
    const legs = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.9, 12), goldMat);
    legs.position.y = 1.0;
    mockBuddhaMesh.add(legs);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.7, 2.6, 12), goldMat);
    torso.position.y = 2.6;
    mockBuddhaMesh.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 16), goldMat);
    head.position.y = 4.4;
    mockBuddhaMesh.add(head);
    const ushnisha = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), goldMat);
    ushnisha.position.y = 5.2;
    mockBuddhaMesh.add(ushnisha);
    buddhaGroup.add(mockBuddhaMesh);

    // 加载真实历史雕塑 3D 结跏趺坐大佛 (Sitting Buddha GLB)
    gltfLoader.load(
      "/models/sitting-buddha.glb",
      (gltf) => {
        const buddha = gltf.scene;
        const box = new THREE.Box3().setFromObject(buddha);
        const size = new THREE.Vector3();
        box.getSize(size);
        const targetH = 6.8;
        const s = targetH / Math.max(size.y, 0.001);
        buddha.scale.setScalar(s);
        buddha.position.set(0, 0.65, 0);
        buddha.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.castShadow = true;
            m.receiveShadow = true;
            // Preserve authored material; environment lighting provides the highlights.

          }
        });
        buddhaGroup.add(buddha);
        // Outdoor monumental Tathagata on the north terrace, with an open vista.
        const greatBuddha = buddha.clone(true);
        const statueBounds = new THREE.Box3().setFromObject(greatBuddha);
        greatBuddha.scale.multiplyScalar(40 / Math.max(statueBounds.getSize(new THREE.Vector3()).y, 0.001));
        const raisedBounds = new THREE.Box3().setFromObject(greatBuddha);
        const raisedCenter = raisedBounds.getCenter(new THREE.Vector3());
        greatBuddha.rotation.y = Math.PI;
        greatBuddha.position.set(-raisedCenter.x, 8.2 - raisedBounds.min.y, -91 - raisedCenter.z);
        greatBuddha.name = "Monumental Buddha";
        templeGroup.add(greatBuddha);
        mockBuddhaMesh.visible = false;
      },
      undefined,
      (err) => console.warn("sitting-buddha load fallback:", err)
    );

    // 佛像脑后悬浮旋转的自发光金色佛光光环 (Latent Halo)
    const haloGeo = new THREE.TorusGeometry(2.6, 0.06, 16, 48);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xffea78,
      emissive: 0xffd60a,
      emissiveIntensity: 0.15,
      roughness: 0.2,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 4.6, -0.6);
    halo.visible = false;
    buddhaHaloRef.current = halo;
    buddhaGroup.add(halo);

    // 大佛金光点光源
    const buddhaLight = new THREE.PointLight(0xffba3b, 4.8, 24);
    buddhaLight.position.set(0, 4.8, 1.5);
    buddhaGroup.add(buddhaLight);

    templeGroup.add(buddhaGroup);

    // =========================================================================
    // 1.8 人文生灵：【和尚僧侣 NPC (Buddhist Monk)】
    // =========================================================================
    const monkGroup = new THREE.Group();
    monkGroup.position.set(-3.2, 0, 7.8);
    monkGroupRef.current = monkGroup;

    const mockMonkMesh = new THREE.Group();
    const monkRobe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.44, 1.5, 10),
      new THREE.MeshStandardMaterial({ color: 0x8a5220, roughness: 0.8 })
    );
    monkRobe.position.y = 0.9;
    mockMonkMesh.add(monkRobe);
    const monkHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xf5cfb3, roughness: 0.5 })
    );
    monkHead.position.y = 1.8;
    mockMonkMesh.add(monkHead);
    const monkHands = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.25, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xf5cfb3 })
    );
    monkHands.position.set(0, 1.15, 0.35);
    mockMonkMesh.add(monkHands);
    monkGroup.add(mockMonkMesh);

    // 加载真实 3D 黄袍和尚僧人模型 (Monk GLB)
    gltfLoader.load(
      "/models/monk-kaykit.glb",
      (gltf) => {
        const monk = gltf.scene;
        const box = new THREE.Box3().setFromObject(monk);
        const size = new THREE.Vector3();
        box.getSize(size);
        const s = 1.95 / Math.max(size.y, 0.001);
        monk.scale.setScalar(s);
        monk.position.set(0, 0, 0);
        monk.rotation.y = Math.PI;
        monk.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        monkGroup.add(monk);
        mockMonkMesh.visible = false;
      },
      undefined,
      (err) => console.warn("monk load fallback:", err)
    );

    templeGroup.add(monkGroup);

    // =========================================================================
    // 1.9 人文生灵：【汉服美女香客 NPC (Hanfu Devotee)】
    // =========================================================================
    const maidenGroup = new THREE.Group();
    maidenGroup.position.set(3.2, 0, 7.2);
    maidenGroupRef.current = maidenGroup;

    const mockMaidenMesh = new THREE.Group();
    const maidenSkirt = new THREE.Mesh(
      new THREE.ConeGeometry(0.52, 1.45, 12),
      new THREE.MeshStandardMaterial({ color: 0xdb4d6d, roughness: 0.6 })
    );
    maidenSkirt.position.y = 0.8;
    mockMaidenMesh.add(maidenSkirt);
    const maidenUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.32, 0.6, 10),
      new THREE.MeshStandardMaterial({ color: 0xfef4f4, roughness: 0.5 })
    );
    maidenUpper.position.y = 1.35;
    mockMaidenMesh.add(maidenUpper);
    const maidenHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.21, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffdfd0, roughness: 0.4 })
    );
    maidenHead.position.y = 1.8;
    mockMaidenMesh.add(maidenHead);
    const maidenHair = new THREE.Mesh(
      new THREE.SphereGeometry(0.23, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 })
    );
    maidenHair.position.set(0, 1.9, -0.05);
    mockMaidenMesh.add(maidenHair);
    maidenGroup.add(mockMaidenMesh);

    // 加载真实 3D 翩跹古典美女仕女塑像 (Dancing Bodhisattva / Maiden GLB)
    gltfLoader.load(
      "/models/bodhisattva-dancing.glb",
      (gltf) => {
        const maiden = gltf.scene;
        const box = new THREE.Box3().setFromObject(maiden);
        const size = new THREE.Vector3();
        box.getSize(size);
        const s = 1.95 / Math.max(size.y, 0.001);
        maiden.scale.setScalar(s);
        maiden.position.set(0, 0, 0);
        maiden.rotation.y = -Math.PI * 0.25;
        maiden.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.castShadow = true;
            m.receiveShadow = true;
            m.material = new THREE.MeshStandardMaterial({
              color: 0xfbe6d6,
              roughness: 0.45,
              metalness: 0.12,
            });
          }
        });
        maidenGroup.add(maiden);
        mockMaidenMesh.visible = false;
      },
      undefined,
      (err) => console.warn("maiden load fallback:", err)
    );

    templeGroup.add(maidenGroup);

    // =========================================================================
    // 1.10 自然胜境：【真实 3D 菩提古树与翠色垂柳 (Bodhi Tree & Willow)】
    // =========================================================================
    gltfLoader.load(
      "/models/bodhi-tree.glb",
      (gltf) => {
        const tree = gltf.scene;
        const box = new THREE.Box3().setFromObject(tree);
        const size = new THREE.Vector3();
        box.getSize(size);
        const s = 15.0 / Math.max(size.y, 0.001);
        tree.scale.setScalar(s);
        tree.position.set(22, 0, 16);
        tree.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        templeGroup.add(tree);
      },
      undefined,
      (err) => console.warn("bodhi-tree load fallback:", err)
    );

    gltfLoader.load(
      "/models/willow.glb",
      (gltf) => {
        const willow = gltf.scene;
        const box = new THREE.Box3().setFromObject(willow);
        const size = new THREE.Vector3();
        box.getSize(size);
        const s = 12.0 / Math.max(size.y, 0.001);
        willow.scale.setScalar(s);
        willow.position.set(-18, 0, 16);
        willow.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        templeGroup.add(willow);
      },
      undefined,
      (err) => console.warn("willow load fallback:", err)
    );

    // =========================================================================
    // 1.11 人文景观：【古韵禅茶馆 (Zen Teahouse)】
    // =========================================================================
    const teahouseGroup = new THREE.Group();
    teahouseGroup.position.set(18, 0, 8);

    // 茶亭木质地板台基与柱廊
    const teaFloor = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.5, 9),
      new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 0.8 })
    );
    teaFloor.position.y = 0.25;
    teahouseGroup.add(teaFloor);

    // 茶亭攒尖顶
    const teaRoof = new THREE.Mesh(
      new THREE.ConeGeometry(7.5, 3.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x3d424a, roughness: 0.6 })
    );
    teaRoof.position.y = 4.8;
    teahouseGroup.add(teaRoof);

    // 默认茶亭案几与真实 3D 茶桌模型加载
    const mockTeaTable = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.85, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x2e1a0e, roughness: 0.7 })
    );
    mockTeaTable.position.set(0, 0.85, 0);
    teahouseGroup.add(mockTeaTable);

    gltfLoader.load(
      "/models/table.glb",
      (gltf) => {
        const table = gltf.scene;
        const box = new THREE.Box3().setFromObject(table);
        const size = new THREE.Vector3();
        box.getSize(size);
        const s = 1.4 / Math.max(size.y, 0.001);
        table.scale.setScalar(s);
        table.position.set(0, 0.35, 0);
        table.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        teahouseGroup.add(table);
        mockTeaTable.visible = false;
      },
      undefined,
      (err) => console.warn("table load fallback:", err)
    );

    // 案几上的紫砂茶壶
    const teapot = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0x6e2c16, roughness: 0.4, metalness: 0.2 })
    );
    teapot.position.set(-0.5, 1.45, 0);
    teahouseGroup.add(teapot);

    // 品茗茶盏
    for (let c = 0; c < 2; c++) {
      const teacup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.05, 0.1, 8),
        new THREE.MeshStandardMaterial({ color: 0x7da494, roughness: 0.3 })
      );
      teacup.position.set(0.2 + c * 0.4, 1.35, 0);
      teahouseGroup.add(teacup);
    }

    // 茶香袅袅升腾热气粒子 (Tea Steam Particles)
    const teaSmokeCount = 45;
    const teaSmokeGeo = new THREE.BufferGeometry();
    const teaSmokePos = new Float32Array(teaSmokeCount * 3);
    for (let i = 0; i < teaSmokeCount; i++) {
      teaSmokePos[i * 3 + 0] = (Math.random() - 0.5) * 0.2;
      teaSmokePos[i * 3 + 1] = 1.5 + Math.random() * 1.5;
      teaSmokePos[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }
    teaSmokeGeo.setAttribute("position", new THREE.BufferAttribute(teaSmokePos, 3));
    const teaSmokeMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.14,
      transparent: true,
      opacity: 0.55,
    });
    const teaSmokePoints = new THREE.Points(teaSmokeGeo, teaSmokeMat);
    teaSmokeRef.current = teaSmokePoints;
    teahouseGroup.add(teaSmokePoints);

    templeGroup.add(teahouseGroup);

    // 1.10 殿前青铜大香炉 (带真香与香火青烟)
    const censerGeo = new THREE.CylinderGeometry(1.4, 1.0, 1.6, 16);
    const censerMat = new THREE.MeshStandardMaterial({ color: 0x3d4e42, metalness: 0.85, roughness: 0.35 });
    const censer = new THREE.Mesh(censerGeo, censerMat);
    censer.position.set(0, 2.0, -17.0);
    templeGroup.add(censer);

    for (let i = -1; i <= 1; i++) {
      const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 1.8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff3b30 })
      );
      stick.position.set(i * 0.3, 2.9, -17.0);
      templeGroup.add(stick);
    }

    // 香炉青烟粒子
    const smokeCount = 140;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      smokePos[i * 3 + 0] = (Math.random() - 0.5) * 0.5;
      smokePos[i * 3 + 1] = 2.8 + Math.random() * 4.5;
      smokePos[i * 3 + 2] = -17.0 + (Math.random() - 0.5) * 0.5;
    }
    smokeGeo.setAttribute("position", new THREE.BufferAttribute(smokePos, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0xbfd8f5,
      size: 0.08,
      transparent: true,
      opacity: 0.25,
    });
    const smokePoints = new THREE.Points(smokeGeo, smokeMat);
    smokeParticlesRef.current = smokePoints;
    templeGroup.add(smokePoints);

    // 1.11 飘零落花粒子
    const petalCount = 45;
    const petalGeo = new THREE.BufferGeometry();
    const petalPos = new Float32Array(petalCount * 3);
    for (let i = 0; i < petalCount; i++) {
      petalPos[i * 3 + 0] = (Math.random() - 0.5) * 80;
      petalPos[i * 3 + 1] = 0.5 + Math.random() * 18;
      petalPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    petalGeo.setAttribute("position", new THREE.BufferAttribute(petalPos, 3));
    const petalMat = new THREE.PointsMaterial({
      color: 0xffb7c5,
      size: 0.035,
      transparent: true,
      opacity: 0.85,
    });
    const petalPoints = new THREE.Points(petalGeo, petalMat);
    petalParticlesRef.current = petalPoints;
    templeGroup.add(petalPoints);

    // 1.12 迎客松树林与石灯长廊
    const treeTrunkGeo = new THREE.CylinderGeometry(0.32, 0.58, 4.8, 8);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2516, roughness: 0.9 });
    const treeLeavesGeo = new THREE.IcosahedronGeometry(2.6, 2);
    const treeLeavesMat = new THREE.MeshStandardMaterial({ color: 0x1b4a28, roughness: 0.6 });

    const treePositions = [
      [-15, 2.4, 10], [-19, 2.4, 0], [-16, 2.4, -10],
      [15, 2.4, 16], [22, 2.4, 0], [16, 2.4, -10],
      [-9, 2.4, 24], [9, 2.4, 24],
    ];
    treePositions.forEach(([tx, ty, tz]) => {
      const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
      trunk.position.set(tx, ty, tz);
      const leaves = new THREE.Mesh(treeLeavesGeo, treeLeavesMat);
      leaves.position.set(tx, ty + 3.4, tz);
      templeGroup.add(trunk);
      templeGroup.add(leaves);
    });

    // 石灯笼
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

    // 1.13 中央紫檀木鱼台与立体 3D 电子木鱼
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

    // 1.14 悬挂天坛晨钟
    const bellGeo = new THREE.CylinderGeometry(0.55, 0.95, 2.1, 16);
    const bellMat = new THREE.MeshStandardMaterial({ color: 0x8a6e35, metalness: 0.85, roughness: 0.3 });
    const bellMesh = new THREE.Mesh(bellGeo, bellMat);
    bellMesh.position.set(-7.5, 5.2, 3.5);
    bellMeshRef.current = bellMesh;
    templeGroup.add(bellMesh);

    // Load the complete photographed Chinese temple; the architectural preview
    // remains usable while its geometry/atlas arrive from this same origin.
    const templeManager = new THREE.LoadingManager();
    templeManager.setURLModifier((url) => renderer.capabilities.maxTextureSize < 8192 || window.innerWidth < 640 ? url.replace("temple-atlas-8k.jpg", "temple-atlas-4k.jpg") : url);
    templeManager.onProgress = (_url, loaded, total) => {
      if (!disposed) setTempleProgress(Math.round(loaded / total * 100));
    };
    const templeLoader = new GLTFLoader(templeManager);
    templeLoader.load("/models/jiaoshan-temple/temple.gltf", (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const dimensions = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = 150 / Math.max(dimensions.x, dimensions.z);
      model.scale.multiplyScalar(scale);
      model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale - 16);
      model.name = "Jiaoshan Dinghui Temple · Metazeon · CC BY 4.0";
      model.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          object.castShadow = true;
          object.receiveShadow = true;
          const mesh = object as THREE.Mesh;
          const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          if (material instanceof THREE.MeshStandardMaterial) {
            mesh.material = new THREE.MeshBasicMaterial({ map: material.map, color: 0xffffff, side: THREE.DoubleSide });
            material.dispose();
          }
        }
      });
      const conceptObjects = [...templeGroup.children];
      templeGroup.add(model);
      setTempleViewRef.current = (mode) => {
        for (const child of conceptObjects) child.visible = mode === "concept";
        model.visible = mode === "real";
      };
      setTempleViewRef.current("real");
      templeSpawnRef.current.set(38, 63, 86);
      if (worldModeRef.current === "temple") {
        playerRef.current.pos.copy(templeSpawnRef.current);
        playerRef.current.pitch = -0.12;
        playerRef.current.yaw = .36;
      }

      setTempleAssetState("ready");
    }, undefined, (error) => {
      if (!disposed) { console.warn("Scanned temple unavailable; keeping architectural preview", error); setTempleAssetState("error"); }
    });

    // =========================================================================
    // 维度 2：【未来中枢 · 赛博立体都市与霓虹天际线】 (Cyber City 3D)
    // =========================================================================
    const cityGroup = new THREE.Group();
    cityGroupRef.current = cityGroup;
    cityGroup.visible = false;
    scene.add(cityGroup);

    const cityPreview = createCityArchitecture();
    cityGroup.add(cityPreview);
    let cityRequested = false;
    const cityManager = new THREE.LoadingManager();
    cityManager.onProgress = (_url, loaded, total) => {
      if (!disposed) setCityProgress(Math.round(loaded / total * 100));
    };
    const cityLoader = new GLTFLoader(cityManager).setDRACOLoader(dracoLoader);
    loadCityRef.current = () => {
      if (cityRequested || disposed) return;
      cityRequested = true;
      setCityAssetState("loading");
      cityLoader.load("/models/bistro/Bistro.gltf", (gltf) => {
        if (disposed) {
          gltf.scene.traverse((object) => {
            const mesh = object as THREE.Mesh;
            mesh.geometry?.dispose();
            const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
            for (const material of materials) {
              for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
              material.dispose();
            }
          });
          return;
        }
        const model = gltf.scenes.find((candidate) => candidate.name === "Exterior") ?? gltf.scene;
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());

        const scale = 1;
        model.scale.multiplyScalar(scale);
        model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale - 4);
        const interior = model.getObjectByName("BistroInterior");
        if (interior) interior.visible = false;
        model.updateMatrixWorld(true);
        const authoredCamera = model.getObjectByName("Camera");
        if (authoredCamera) {
          authoredCamera.getWorldPosition(citySpawnRef.current);
          const view = authoredCamera.getWorldDirection(new THREE.Vector3());
          cityYawRef.current = Math.atan2(-view.x, -view.z);
        } else citySpawnRef.current.set(0, 1.8, 14);
        if (worldModeRef.current === "city") {
          playerRef.current.pos.copy(citySpawnRef.current); playerRef.current.yaw = cityYawRef.current;
        }
        model.traverse((object) => {
          if ((object as THREE.Light).isLight) (object as THREE.Light).intensity = 0;
          if ((object as THREE.Mesh).isMesh) {
            object.castShadow = true;
            object.receiveShadow = true;
            const mesh = object as THREE.Mesh;
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const material of materials) if (material instanceof THREE.MeshStandardMaterial) {
              material.aoMapIntensity = 0.12;
              material.envMapIntensity = 1.8;
              material.metalness = Math.min(material.metalness, 0.45);
            }
          }
        });
        model.name = "Amazon Bistro · CC BY 4.0";
        cityGroup.add(model);
        cityPreview.visible = false;
        vehiclesRef.current.forEach(({mesh}) => { mesh.visible = false; });
        setCityAssetState("ready");
      }, undefined, (error) => {
        if (!disposed) { console.warn("Bistro unavailable; keeping lightweight street", error); setCityAssetState("error"); }
      });
    };

    // 地面高速穿行光轨车流
    const vehicles: Array<{ mesh: THREE.Mesh; speed: number; limit: number }> = [];
    const carGeo = new THREE.BoxGeometry(1.2, 0.5, 2.4);

    for (let i = 0; i < 12; i++) {
      const isRed = i % 2 === 0;
      const carMat = new THREE.MeshStandardMaterial({ color: isRed ? 0x6b2526 : 0x7f898f, metalness: 0.65, roughness: 0.28 });
      const car = new THREE.Mesh(carGeo, carMat);
      const lane = isRed ? -10 : 10;
      car.position.set(lane, 0.3, (Math.random() - 0.5) * 160);
      cityGroup.add(car);
      vehicles.push({
        mesh: car,
        speed: (12 + Math.random() * 16) * (isRed ? -1 : 1),
        limit: 85,
      });
    }
    vehiclesRef.current = vehicles;

    flyingCarsRef.current = [];

    // 视口尺寸响应
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      if (composerRef.current) {
        composerRef.current.setSize(width, height);
      }
    };
    window.addEventListener("resize", handleResize);

    // 鼠标与触控 360° 自由旋转视角
    const handleMouseDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button, a, input, [data-ui]")) return;
      isPointerDownRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: PointerEvent) => {
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

    container.addEventListener("pointerdown", handleMouseDown);
    window.addEventListener("pointermove", handleMouseMove);
    window.addEventListener("pointerup", handleMouseUp);
    window.addEventListener("pointercancel", handleMouseUp);

    // -------------------------------------------------------------------------
    // 渲染主循环 (60 FPS 完整角色漫游物理、白云飘移、佛光旋转)
    // -------------------------------------------------------------------------
    let animId: number;
    const clock = new THREE.Timer();

    let fpsFrames = 0;
    let fpsElapsed = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock.update();
      const dt = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsed();
      renderer.toneMappingExposure = worldModeRef.current === "city" ? 1.5 : 0.95;
      fpsFrames++; fpsElapsed += dt;
      if (fpsElapsed >= 1) { setMeasuredFps(Math.round(fpsFrames / fpsElapsed)); fpsFrames = 0; fpsElapsed = 0; }

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

      const keys = activeKeysRef.current;
      const moveSpeed = (keys["shift"] ? 11.0 : 5.8) * dt;
      const moveDir = new THREE.Vector3(0, 0, 0);

      if (keys["w"] || keys["arrowup"]) moveDir.add(forward);
      if (keys["s"] || keys["arrowdown"]) moveDir.addScaledVector(forward, -1);
      if (keys["a"] || keys["arrowleft"]) moveDir.addScaledVector(right, -1);
      if (keys["d"] || keys["arrowright"]) moveDir.add(right);

      const isWalking = moveDir.lengthSq() > 0.001;
      if (isWalking) {
        moveDir.normalize();
        playerRef.current.pos.addScaledVector(moveDir, moveSpeed);
        playerRef.current.bobbing += dt * 9.5;
      }

      // 重力跳跃与下落
      if (!playerRef.current.isGrounded) {
        playerRef.current.vel.y -= 22.0 * dt;
        playerRef.current.pos.y += playerRef.current.vel.y * dt;
        if (playerRef.current.pos.y <= 1.8) {
          playerRef.current.pos.y = 1.8;
          playerRef.current.vel.y = 0;
          playerRef.current.isGrounded = true;
        }
      }

      // 电影级运镜 vs 第一人称自由漫游
      if (isCinematicRef.current) {
        // 电影级航拍环绕运镜 (Cinematic Director Crane/Drone Shot)
        const orbitRadius = worldModeRef.current === "temple" ? 100 : 35;
        const orbitSpeed = 0.12;
        const cx = Math.sin(time * orbitSpeed) * orbitRadius;
        const cz = Math.cos(time * orbitSpeed) * orbitRadius + (worldModeRef.current === "temple" ? -1.0 : 4.0);
        const cy = worldModeRef.current === "temple" ? 65 + Math.sin(time * .1) * 12 : 12;
        camera.position.set(cx, cy, cz);
        if (worldModeRef.current === "temple") {
          camera.lookAt(0, 55, -16);
        } else {
          camera.lookAt(0, 3.8, 0);
        }
      } else {
        // 第一人称自由漫游头部呼吸晃动
        const bobOffset = isWalking ? Math.sin(playerRef.current.bobbing) * 0.045 : 0;
        camera.position.set(
          playerRef.current.pos.x,
          playerRef.current.pos.y + bobOffset,
          playerRef.current.pos.z
        );

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
      }

      // 2. 白云随风飘移系统
      cloudsRef.current.forEach((cloud, idx) => {
        cloud.position.x += dt * (1.2 + (idx % 3) * 0.4);
        if (cloud.position.x > 90) {
          cloud.position.x = -90;
        }
      });

      // 3. 佛光光环缓缓自转与呼吸发光
      if (buddhaHaloRef.current) {
        buddhaHaloRef.current.rotation.z += dt * 0.35;
      }

      // 4. 和尚与仕女自然呼吸与轻微摆动
      if (monkGroupRef.current) {
        monkGroupRef.current.position.y = Math.sin(time * 2.2) * 0.03;
      }
      if (maidenGroupRef.current) {
        maidenGroupRef.current.position.y = Math.sin(time * 2.4 + 1.0) * 0.035;
      }

      // 5. 香炉青烟与茶香水汽粒子
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

      if (teaSmokeRef.current) {
        const tAttr = teaSmokeRef.current.geometry.attributes.position;
        const tArr = tAttr.array as Float32Array;
        for (let i = 0; i < teaSmokeCount; i++) {
          tArr[i * 3 + 1] += dt * 0.6;
          tArr[i * 3 + 0] += Math.sin(tArr[i * 3 + 1] * 3.0) * dt * 0.15;
          if (tArr[i * 3 + 1] > 2.8) {
            tArr[i * 3 + 1] = 1.45;
            tArr[i * 3 + 0] = (Math.random() - 0.5) * 0.15;
          }
        }
        tAttr.needsUpdate = true;
      }

      // 6. 飘零落花
      if (petalParticlesRef.current) {
        const pAttr = petalParticlesRef.current.geometry.attributes.position;
        const pArr = pAttr.array as Float32Array;
        for (let i = 0; i < petalCount; i++) {
          pArr[i * 3 + 1] -= dt * 0.8;
          pArr[i * 3 + 0] += Math.sin(time + i) * dt * 0.4;
          if (pArr[i * 3 + 1] < 0.2) {
            pArr[i * 3 + 1] = 16.0;
            pArr[i * 3 + 0] = (Math.random() - 0.5) * 80;
          }
        }
        pAttr.needsUpdate = true;
      }

      // 7. 木鱼与晨钟动效
      if (woodenFishMeshRef.current && woodenFishBounceRef.current > 0) {
        woodenFishBounceRef.current = Math.max(0, woodenFishBounceRef.current - dt * 6.5);
        const s = 1.0 - woodenFishBounceRef.current * 0.2;
        woodenFishMeshRef.current.scale.set(1.25 * s, 0.78 * s, 1.05 * s);
      }

      if (bellMeshRef.current && bellSwingRef.current > 0) {
        bellSwingRef.current = Math.max(0, bellSwingRef.current - dt * 1.6);
        bellMeshRef.current.rotation.z = Math.sin(time * 12.0) * bellSwingRef.current * 0.22;
      }

      // 8. 赛博城市车流与高空飞车
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

      // 10. 电影级神圣空气浮尘微粒轻柔涌动
      if (dustParticlesRef.current) {
        const dAttr = dustParticlesRef.current.geometry.attributes.position;
        const dArr = dAttr.array as Float32Array;
        const dCount = 80;
        for (let i = 0; i < dCount; i++) {
          dArr[i * 3 + 1] -= dt * 0.16;
          dArr[i * 3 + 0] += Math.sin(time * 0.5 + i) * dt * 0.16;
          if (dArr[i * 3 + 1] < 0.25) {
            dArr[i * 3 + 1] = 9.5;
            dArr[i * 3 + 0] = (Math.random() - 0.5) * 45;
          }
        }
        dAttr.needsUpdate = true;
      }

      // 周期性更新 HUD 坐标
      if (Math.random() < 0.25) {
        setCameraCoords({
          x: parseFloat(playerRef.current.pos.x.toFixed(1)),
          y: parseFloat(playerRef.current.pos.y.toFixed(1)),
          z: parseFloat(playerRef.current.pos.z.toFixed(1)),
        });
      }

      if (composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointerdown", handleMouseDown);
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("pointerup", handleMouseUp);
      window.removeEventListener("pointercancel", handleMouseUp);
      cancelAnimationFrame(animId);
      loadCityRef.current = null;
      dracoLoader.dispose();
      disposed = true;
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        for (const material of materials) {
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
          material.dispose();
        }
      });
      fallbackEnvironment.dispose();
      hdrEnvironment?.dispose();
      environmentGenerator.dispose();
      skyTexture?.dispose();
      setTempleViewRef.current = null;
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  // 响应维度切换
  useEffect(() => {
    if (templeGroupRef.current) templeGroupRef.current.visible = worldMode === "temple";
    if (cityGroupRef.current) cityGroupRef.current.visible = worldMode === "city";

    if (worldMode === "temple") {
      playerRef.current.pos.copy(templeSpawnRef.current);
      playerRef.current.yaw = 0;
      playerRef.current.pitch = -.12;
      playerRef.current.yaw = .36;
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color("#b4c3c8");
        sceneRef.current.fog = new THREE.FogExp2("#b4c3c8", 0.0018);
      }
    } else {
      loadCityRef.current?.();
      playerRef.current.pos.copy(citySpawnRef.current);
      playerRef.current.yaw = cityYawRef.current;
      playerRef.current.pitch = -0.04;
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color("#b4c3c8");
        sceneRef.current.fog = new THREE.FogExp2("#b4c3c8", 0.004);
      }
    }
  }, [worldMode]);

  const currentMsg = BROADCAST_MESSAGES[broadcastIdx];

  return (
    <div className="relative h-[calc(100dvh-48px)] min-h-[600px] w-full overflow-hidden select-none bg-[#070707] font-sans">
      {/* 3D 渲染主画布 */}
      <div ref={containerRef} className="relative h-full w-full cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="h-full w-full touch-none object-cover" />
        {renderError && (
          <div role="alert" className="absolute inset-0 z-50 flex items-center justify-center bg-[#111] p-8 text-center text-white">
            <p>无法启动三维场景。请在浏览器设置中启用硬件加速，或使用支持 WebGL 2 的新版 Chrome、Edge 或 Safari 后重试。</p>
          </div>
        )}

        {worldMode === "temple" && (
          <nav aria-label="寺院导览" className="absolute bottom-14 left-3 right-3 z-30 flex justify-center gap-2 sm:bottom-7 sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
            {([['overview','实景总览'],['gate','塔院山门'],['hall','古塔细节'],['buddha','灵山布局草案']] as const).map(([view,label]) => <button key={view} onClick={() => jumpToView(view)} className="min-h-10 rounded-full border border-white/25 bg-black/65 px-3 text-xs text-white backdrop-blur hover:bg-black/85">{label}</button>)}
          </nav>
        )}
        {worldMode === "temple" && (
          <div className="absolute bottom-1 left-3 z-30 max-w-[calc(100%-1.5rem)] rounded-lg bg-black/70 px-2 py-1 text-[9px] sm:text-xs text-white sm:bottom-6 sm:left-auto sm:right-6" role="status">
            {templeAssetState === "loading" ? `实景塔院加载中 · ${templeProgress}% · 桌面约 56 MB` : templeAssetState === "ready" ? templeView === "real" ? "焦山定慧寺塔院扫描 · 8K 原始分辨率贴图 · CC BY 4.0" : "灵山布局草案 · 程序化场景，尚未达到写实目标" : "实景模型加载失败，显示建筑预览；刷新可重试"}
            {templeAssetState === "ready" && <a href="/models/jiaoshan-temple/credits.txt" target="_blank" rel="noreferrer" className="ml-2 underline">Metazeon · Amazon · 素材署名</a>}
          </div>
        )}
        {worldMode === "city" && (
          <div className="absolute bottom-1 left-3 z-30 max-w-[calc(100%-1.5rem)] rounded-lg bg-black/70 px-2 py-1 text-[9px] sm:text-xs text-white sm:bottom-6 sm:left-auto sm:right-6" role="status">
            {cityAssetState === "loading" ? `写实街区加载中 · ${cityProgress}% · 首次约 80 MB` : cityAssetState === "ready" ? "Amazon Lumberyard Bistro · CC BY 4.0 · 写实示范街区" : cityAssetState === "error" ? "精细场景加载失败，正在显示轻量街区；刷新可重试" : "轻量街区预览"}
            {cityAssetState === "ready" && <a href="https://github.com/neftaly/bistro-gltf" target="_blank" rel="noreferrer" className="ml-2 underline">素材署名</a>}
          </div>
        )}

        {/* 电影级镜头边缘暗角与焦外晕影 (Radial Vignette) */}
        {/* taste-skill-ignore */}<div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.22)_100%)]" />

        {/* 电影宽银幕上下遮幅 (Cinematic 2.39:1 Letterbox) */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-20 bg-black/95 transition-[height] duration-700 ease-out ${
            isCinematic ? "h-8 sm:h-12" : "h-0"
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-black/95 transition-[height] duration-700 ease-out ${
            isCinematic ? "h-8 sm:h-12" : "h-0"
          }`}
        />

        {/* 屏幕准星（电影运镜时自动淡出） */}
        {!isCinematic && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500">
            <div className="h-4 w-[1px] bg-white/60" />
            <div className="absolute h-[1px] w-4 bg-white/60" />
            <div className="absolute h-2 w-2 rounded-full border border-[#2997ff]/80" />
          </div>
        )}

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
        <div className="absolute top-3 sm:top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3 rounded-full bg-[#1d1d1f]/95 px-3 sm:px-4 py-1.5 border border-white/10 text-[12px] text-white max-w-[94vw] sm:max-w-2xl" data-ui="true">
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
              灵山寺院
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
              写实街区
            </button>
          </div>

          <span className="text-white/20 hidden sm:inline">|</span>

          {/* 在线人数与动作广播 */}
          <div className="hidden sm:flex items-center gap-2 truncate text-[12px]">
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
        <div className="pointer-events-none absolute top-16 sm:top-6 left-3 sm:left-6 z-30 max-w-xs">
          <div className="rounded-[18px] bg-[#0c0c0e]/85 p-2.5 sm:p-4 text-white border border-white/5" data-ui="true">
            <div className="hidden sm:flex items-center gap-2 text-[13px] text-[#2997ff] tnum">
              <span className="h-2 w-2 rounded-full bg-[#2997ff]" />
              <span>{worldMode === "temple" ? "TERRA-CYBER-TEMPLE" : "TERRA-CYBER-CITY"}</span>
            </div>
            <div className="mt-1 font-semibold text-white text-[13px] sm:text-[17px] tracking-tight">
              {worldMode === "temple" ? templeView === "real" ? "焦山定慧寺 · 实景塔院" : "灵山意象 · 布局草案" : "写实街区 · Bistro"}
            </div>
            <div className="mt-2 hidden sm:flex items-center gap-2.5 text-[12px] text-white/50 tnum">
              <span>X: {cameraCoords.x}m</span>
              <span>Y: {cameraCoords.y}m</span>
              <span>Z: {cameraCoords.z}m</span>
              <span className="text-[#34c759]">{measuredFps || "—"} FPS</span>
            </div>
          </div>
        </div>

        <button type="button" onClick={() => setShowMobileActions((value) => !value)} className="absolute right-3 top-16 z-40 min-h-11 rounded-full border border-white/20 bg-black/75 px-4 text-sm text-white sm:hidden">{showMobileActions ? "收起" : worldMode === "temple" ? "祈福互动" : "街区互动"}</button>
        {/* 右上角：专属互动浮岛 (禅刹祈福 / 新城避障) */}
        <div className={`absolute top-28 sm:top-24 right-3 sm:right-6 z-30 flex-col items-end gap-2 ${showMobileActions ? "flex" : "hidden sm:flex"}`}>
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
                  onClick={handleDrinkTea}
                  className="rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-95 py-2 px-2 text-center text-[12px] font-medium text-[#34c759] transition cursor-pointer"
                  title="禅茶馆品茗（T 键）"
                >
                  品禅茶
                </button>
                <button
                  type="button"
                  onClick={handleDrawFortune}
                  className="col-span-2 rounded-[10px] bg-[#2997ff]/20 hover:bg-[#2997ff]/30 active:scale-95 py-2 px-2 text-center text-[12px] font-medium text-[#2997ff] transition cursor-pointer"
                  title="感召灵签"
                >
                  佛前感召灵签
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

          {/* 电影运镜切换 / 全屏 / 文献 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsCinematic((prev) => {
                  const next = !prev;
                  spawnFloatingText(next ? "开启电影级全景运镜 (按 C 切换)" : "恢复自由漫游 (按 C 切换)");
                  return next;
                });
              }}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                isCinematic
                  ? "bg-[#ff9f0a] text-black font-semibold"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title="一键开启/退出电影级航拍运镜（快捷键 C）"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <span>{isCinematic ? "电影运镜中" : "电影运镜"}</span>
            </button>
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
        <div className="absolute bottom-28 sm:bottom-6 left-3 sm:left-8 z-30 flex items-center gap-3">
          <div className="rounded-[20px] bg-[#1d1d1f]/95 p-3 text-white border border-white/5" data-ui="true">
            <div className="text-[11px] text-white/50 mb-2 font-medium hidden sm:block tracking-wide">
              {worldMode === "temple"
                ? "WASD 漫游 · Space 敲木鱼 · F 敬香 · T 品茶 · E 撞钟"
                : "WASD 驾驶 · Shift 加速 · Space 跳跃 · E 避障"}
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
                  大雄宝殿 · 金佛灵签推演
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
