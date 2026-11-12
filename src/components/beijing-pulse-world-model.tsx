"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  WORLD_DIMENSIONS,
  ActionLogEntry,
} from "@/lib/oasis-world-app-data";

interface WorldModelSimulatorProps {
  activeWorldId: string;
  onSelectWorld: (id: string) => void;
  hour: number;
  onChangeHour: (h: number) => void;
  snowMode: boolean;
}

// ---------------------------------------------------------------------------
// 纯净 Web Audio 原生声学合成器（零外部网络与音频文件依赖，毫秒级响应）
// ---------------------------------------------------------------------------
class ZenAudioEngine {
  private ctx: AudioContext | null = null;

  private init(): AudioContext | null {
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

  // 敲击电子木鱼（短促木质共振声波）
  playWoodenFish() {
    const ctx = this.init();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.75, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // 容错降级
    }
  }

  // 鸣古钟（空灵深远多谐波大殿鸣钟）
  playTempleBell() {
    const ctx = this.init();
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

  // 未来悬浮飞跃或变道推进
  playCyberDrive() {
    const ctx = this.init();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // 容错降级
    }
  }
}

const zenAudio = new ZenAudioEngine();

// ---------------------------------------------------------------------------
// 禅刹灵签文库
// ---------------------------------------------------------------------------
interface ZenFortune {
  id: number;
  grade: string;
  name: string;
  poem: string;
  meaning: string;
  tag: string;
}

const ZEN_FORTUNES: ZenFortune[] = [
  {
    id: 1,
    grade: "第 42 签 · 上上大吉",
    name: "因果澄澈 · 潜龙出渊",
    poem: "晨钟初叩净尘嚣，潜象千重自泛潮。自回归途无碍阻，万般吉兆入云霄。",
    meaning: "当前世界模型神经潜变量极度平稳，梯度流向顺畅，所求因果圆满自洽。",
    tag: "功德圆满",
  },
  {
    id: 2,
    grade: "第 18 签 · 乾元亨利",
    name: "青烟聚气 · 佛光初照",
    poem: "宝鼎炉香烟袅袅，祈年殿外露华浓。心灯长照三千界，春水生波遇惠风。",
    meaning: "心念纯澈，因果自洽。多智能体协作无间，反事实推演迎刃而解。",
    tag: "顺遂亨通",
  },
  {
    id: 3,
    grade: "第 88 签 · 万象更新",
    name: "空谷回音 · 暮鼓归真",
    poem: "古刹清泉涤俗念，虚灵方寸见菩提。繁花落尽秋将去，月满西楼晓日齐。",
    meaning: "时空视界宽广无垠，潜流暗动即是新生，专注当下必有回响。",
    tag: "逢凶化吉",
  },
  {
    id: 4,
    grade: "第 99 签 · 极上神兆",
    name: "紫气东来 · 寰宇同频",
    poem: "九霄阊阖开天阙，万国衣冠拜冕旒。此去平川八万里，乘风破浪上瀛洲。",
    meaning: "潜空间收敛至全局最优极值，行动指令无损转化为视觉奇迹。",
    tag: "大吉大利",
  },
];

// 多人在线动作广播流
const MULTIPLAYER_BROADCASTS = [
  { user: "信众·道一 0x9F", action: "敲击祈年殿晨钟", detail: "鸣钟涤荡 · 功德+1", time: "刚刚" },
  { user: "漫游者·Cypher", action: "未来新城极速避障", detail: "反事实无损变道推演成功", time: "2秒前" },
  { user: "信众·妙音 0x7C", action: "虔诚敬奉赛博真香", detail: "青烟流体力学自发涌现", time: "4秒前" },
  { user: "探索者·Neo", action: "抽取灵签【潜龙出渊】", detail: "获上上大吉签文 · 福泽连绵", time: "6秒前" },
  { user: "信众·无尘 0x2A", action: "连续敲击电子木鱼", detail: "功德累积达 108 遍 · 万物澄澈", time: "9秒前" },
  { user: "智能体·Agent-09", action: "立体交通自主会车", detail: "超视距协同零碰撞", time: "14秒前" },
];

interface FloatingMerit {
  id: string;
  text: string;
  x: number;
  y: number;
}

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D uColorMap;
uniform sampler2D uDepthMap;
uniform sampler2D uPrevColorMap;
uniform sampler2D uPrevDepthMap;
uniform float uTransitionProgress;

uniform vec2 uCameraOffset;
uniform vec2 uResolution;
uniform float uTime;
uniform float uDepthScale;
uniform int uRenderMode; // 0: Radiance RGB, 1: Depth Latent, 2: Surface Normal

// 动态光照与气候
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uAmbientColor;
uniform float uSunIntensity;
uniform float uAtmosphereHaze;
uniform float uSnowCover;
uniform float uPerturbationWave; // 世界扰动/青烟扩散冲击波
uniform vec2 uPerturbationCenter;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // 1. 世界扰动与焚香青烟扩散 (潜空间形变)
  if (uPerturbationWave > 0.0) {
    vec2 diff = uv - uPerturbationCenter;
    float dist = length(diff);
    float ring = sin(dist * 35.0 - uPerturbationWave * 12.0) * exp(-dist * 4.0);
    uv += normalize(diff + 0.0001) * ring * 0.035 * max(0.0, 1.0 - uPerturbationWave);
  }

  // 2. 深度视差置换
  float curRawDepth = texture2D(uDepthMap, uv).r;
  float depth = curRawDepth;

  if (uTransitionProgress < 1.0) {
    float prevRawDepth = texture2D(uPrevDepthMap, uv).r;
    depth = mix(prevRawDepth, curRawDepth, uTransitionProgress);
  }

  vec2 parallax = uCameraOffset * (depth * uDepthScale * 0.09);
  vec2 displacedUv = clamp(uv + parallax, 0.001, 0.999);

  // 3. 通道渲染分支
  if (uRenderMode == 1) {
    // 深度潜空间 (Depth Latent)
    float d = texture2D(uDepthMap, displacedUv).r;
    vec3 depthVisual = mix(vec3(0.02, 0.05, 0.12), vec3(0.0, 0.95, 1.0), d);
    gl_FragColor = vec4(depthVisual, 1.0);
    return;
  }

  // 采样纹理
  vec4 curColor = texture2D(uColorMap, displacedUv);
  vec4 finalTex = curColor;

  if (uTransitionProgress < 1.0) {
    vec4 prevColor = texture2D(uPrevColorMap, displacedUv);
    finalTex = mix(prevColor, curColor, uTransitionProgress);
  }

  // 计算法线
  float eps = 0.003;
  float dLeft  = texture2D(uDepthMap, clamp(displacedUv - vec2(eps, 0.0), 0.0, 1.0)).r;
  float dRight = texture2D(uDepthMap, clamp(displacedUv + vec2(eps, 0.0), 0.0, 1.0)).r;
  float dDown  = texture2D(uDepthMap, clamp(displacedUv - vec2(0.0, eps), 0.0, 1.0)).r;
  float dUp    = texture2D(uDepthMap, clamp(displacedUv + vec2(0.0, eps), 0.0, 1.0)).r;

  vec3 normal = normalize(vec3((dLeft - dRight) * 3.5, (dDown - dUp) * 3.5, 0.85));

  if (uRenderMode == 2) {
    // 表面几何法线场 (Surface Normal)
    vec3 normalColor = normal * 0.5 + 0.5;
    gl_FragColor = vec4(normalColor, 1.0);
    return;
  }

  // 真实光影渲染
  float diffLight = max(dot(normal, normalize(uSunDirection)), 0.0);
  vec3 illumination = uAmbientColor + uSunColor * (diffLight * uSunIntensity);

  // 严寒霜雪覆盖
  if (uSnowCover > 0.0) {
    float upwardNormal = max(normal.y, 0.0);
    float snowThreshold = mix(0.7, 0.2, uSnowCover);
    float snowFactor = smoothstep(snowThreshold, snowThreshold + 0.25, upwardNormal * (1.0 - depth * 0.4));
    vec3 snowTint = vec3(0.92, 0.96, 1.0) * (uAmbientColor * 1.5 + uSunColor * diffLight);
    finalTex.rgb = mix(finalTex.rgb, snowTint, snowFactor * uSnowCover * 0.85);
  }

  vec3 sceneColor = finalTex.rgb * illumination;
  vec3 finalColor = mix(sceneColor, uAmbientColor * 1.2, depth * uAtmosphereHaze);

  gl_FragColor = vec4(finalColor, finalTex.a);
}
`;

export default function WorldModelSimulator({
  activeWorldId,
  onSelectWorld,
  hour,
  onChangeHour,
  snowMode,
}: WorldModelSimulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  const [renderMode, setRenderMode] = useState<number>(0);
  const [isPlayingTime, setIsPlayingTime] = useState(false);
  const [currentHour, setCurrentHour] = useState(hour);

  // 物理与潜空间参数
  const [diffusionSteps, setDiffusionSteps] = useState(28);

  // HUD 状态
  const [cameraCoords, setCameraCoords] = useState({ x: 0, y: 0, z: 0 });
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const [reseedFlash, setReseedFlash] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 功德与赛博祈福状态
  const [meritCount, setMeritCount] = useState<number>(108);
  const [floatingMerits, setFloatingMerits] = useState<FloatingMerit[]>([]);
  const [activeFortune, setActiveFortune] = useState<ZenFortune | null>(null);
  const [onlineUsersCount, setOnlineUsersCount] = useState<number>(3842);
  const [broadcastIndex, setBroadcastIndex] = useState<number>(0);

  const isTemple = activeWorldId === "cyber-temple";
  const isCity = activeWorldId === "cyber-city";

  // 定时轮转多人广播流与信众人数
  useEffect(() => {
    const timer = setInterval(() => {
      setBroadcastIndex((prev) => (prev + 1) % MULTIPLAYER_BROADCASTS.length);
      setOnlineUsersCount((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.parentElement?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentWorld =
    WORLD_DIMENSIONS.find((w) => w.id === activeWorldId) || WORLD_DIMENSIONS[0];

  const posRef = useRef({ x: 0, y: 0, z: 0 });
  const velRef = useRef({ x: 0, y: 0, z: 0 });
  const mouseRef = useRef({ x: 0, y: 0, isDown: false, lastX: 0, lastY: 0 });
  const waveProgressRef = useRef(0.0);
  const waveCenterRef = useRef(new THREE.Vector2(0.5, 0.5));
  const transitionProgressRef = useRef(1.0);

  const uniformsRef = useRef({
    uColorMap: { value: null as THREE.Texture | null },
    uDepthMap: { value: null as THREE.Texture | null },
    uPrevColorMap: { value: null as THREE.Texture | null },
    uPrevDepthMap: { value: null as THREE.Texture | null },
    uTransitionProgress: { value: 1.0 },
    uCameraOffset: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uDepthScale: { value: 1.0 },
    uRenderMode: { value: 0 },
    uSunDirection: { value: new THREE.Vector3(1, 1, 1) },
    uSunColor: { value: new THREE.Color(1, 1, 1) },
    uAmbientColor: { value: new THREE.Color(0.2, 0.2, 0.2) },
    uSunIntensity: { value: 1.0 },
    uAtmosphereHaze: { value: 0.1 },
    uSnowCover: { value: 0.0 },
    uPerturbationWave: { value: 0.0 },
    uPerturbationCenter: { value: new THREE.Vector2(0.5, 0.5) },
  });

  const recordAction = useCallback((key: string, label: string, delta: [number, number, number]) => {
    setActionLog((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        key,
        action: label,
        latentDelta: delta,
      },
      ...prev.slice(0, 7),
    ]);
  }, []);

  // 触发世界扰动 (E 键、焚香或鼠标点击)
  const triggerPerturbation = useCallback((uvX = 0.5, uvY = 0.5, customLabel?: string) => {
    waveCenterRef.current.set(uvX, uvY);
    uniformsRef.current.uPerturbationCenter.value.set(uvX, uvY);
    waveProgressRef.current = 0.001;
    recordAction(
      customLabel ? "Zen Action" : "E / Click",
      customLabel || "Latent Block Break & World Perturbation",
      [
        parseFloat((Math.random() * 0.4 - 0.2).toFixed(3)),
        parseFloat((Math.random() * 0.4 - 0.2).toFixed(3)),
        0.5,
      ]
    );
  }, [recordAction]);

  // 生成浮动金色功德文字
  const spawnFloatingMerit = useCallback((text = "功德 +1 · 因果自洽") => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const x = 50 + (Math.random() * 20 - 10);
    const y = 50 + (Math.random() * 10 - 5);
    setFloatingMerits((prev) => [...prev.slice(-6), { id, text, x, y }]);
    setMeritCount((c) => c + 1);

    setTimeout(() => {
      setFloatingMerits((prev) => prev.filter((m) => m.id !== id));
    }, 1800);
  }, []);

  // 敲击电子木鱼
  const handleKnockWoodenFish = useCallback(() => {
    zenAudio.playWoodenFish();
    triggerPerturbation(0.5, 0.6, "敲击电子木鱼 · 涤荡尘嚣");
    spawnFloatingMerit("功德 +1 · 万象澄澈");
  }, [triggerPerturbation, spawnFloatingMerit]);

  // 撞响天坛晨钟
  const handleRingTempleBell = useCallback(() => {
    zenAudio.playTempleBell();
    triggerPerturbation(0.5, 0.4, "天坛晨钟长鸣 · 声学因果自发涌现");
    spawnFloatingMerit("功德 +3 · 福慧双增");
  }, [triggerPerturbation, spawnFloatingMerit]);

  // 虔诚焚香
  const handleBurnIncense = useCallback(() => {
    zenAudio.playTempleBell();
    triggerPerturbation(0.5, 0.7, "虔诚敬奉赛博真香 · 青烟自发涌现");
    spawnFloatingMerit("焚香圆满 · 青烟化吉");
  }, [triggerPerturbation, spawnFloatingMerit]);

  // 赛博抽签
  const handleDrawFortune = useCallback(() => {
    zenAudio.playTempleBell();
    const fortune = ZEN_FORTUNES[Math.floor(Math.random() * ZEN_FORTUNES.length)];
    setActiveFortune(fortune);
    recordAction("Fortune", `求得上签: ${fortune.name}`, [0.1, 0.8, 0.5]);
    spawnFloatingMerit("感召灵签 · 天地同频");
  }, [recordAction, spawnFloatingMerit]);

  // 重置世界种子 (R 键)
  const triggerReseed = useCallback(() => {
    setReseedFlash(true);
    setTimeout(() => setReseedFlash(false), 300);
    posRef.current = { x: 0, y: 0, z: 0 };
    velRef.current = { x: 0, y: 0, z: 0 };
    recordAction("R", "Reseed Latent Anchor & Reset Horizon", [0, 0, 0]);
  }, [recordAction]);

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      setActiveKeys((prev) => ({ ...prev, [key]: true }));

      if (key === "f" && isTemple) {
        handleBurnIncense();
      } else if (key === "e") {
        if (isTemple) {
          handleRingTempleBell();
        } else {
          zenAudio.playCyberDrive();
          triggerPerturbation(0.5, 0.5, "反事实变道避障推演");
        }
      } else if (key === "r") {
        triggerReseed();
      } else if (key === " " || key === "space") {
        if (isTemple) {
          handleKnockWoodenFish();
        } else {
          zenAudio.playCyberDrive();
          velRef.current.y += 0.045 * (currentWorld.physics.gravity > 0 ? 1 : -1);
          recordAction("Space", "Kinetic Leap / Drone Ascend", [0, 1.2, 0]);
        }
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
  }, [
    isTemple,
    currentWorld,
    handleBurnIncense,
    handleKnockWoodenFish,
    handleRingTempleBell,
    triggerPerturbation,
    triggerReseed,
    recordAction,
  ]);

  // Three.js 核心初始化
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const textureLoader = new THREE.TextureLoader();
    const colorTex = textureLoader.load(currentWorld.image);
    colorTex.colorSpace = THREE.SRGBColorSpace;
    colorTex.minFilter = THREE.LinearFilter;

    const depthTex = textureLoader.load(currentWorld.depthMap);
    depthTex.minFilter = THREE.LinearFilter;

    uniformsRef.current.uColorMap.value = colorTex;
    uniformsRef.current.uDepthMap.value = depthTex;

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: uniformsRef.current,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniformsRef.current.uResolution.value.set(width, height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let animationId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationId = requestAnimationFrame(animate);
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // 物理积分更新
      const accel = { x: 0, y: 0 };
      const speed = activeKeys["shift"] ? 0.045 : 0.022;

      if (activeKeys["w"] || activeKeys["arrowup"]) accel.y += speed;
      if (activeKeys["s"] || activeKeys["arrowdown"]) accel.y -= speed;
      if (activeKeys["a"] || activeKeys["arrowleft"]) accel.x -= speed;
      if (activeKeys["d"] || activeKeys["arrowright"]) accel.x += speed;

      // 鼠标拖拽补充位移
      if (mouseRef.current.isDown) {
        accel.x += (mouseRef.current.x * 0.035);
        accel.y += (-mouseRef.current.y * 0.035);
      }

      velRef.current.x += accel.x;
      velRef.current.y += accel.y;

      const drag = Math.max(0.78, 1.0 - currentWorld.physics.drag);
      velRef.current.x *= drag;
      velRef.current.y *= drag;

      posRef.current.x = Math.max(-1.8, Math.min(1.8, posRef.current.x + velRef.current.x));
      posRef.current.y = Math.max(-1.2, Math.min(1.2, posRef.current.y + velRef.current.y));

      // 摄像机视差位移
      uniformsRef.current.uCameraOffset.value.set(posRef.current.x, posRef.current.y);
      uniformsRef.current.uTime.value = time * 0.001;

      // 扰动波渐变
      if (waveProgressRef.current > 0.0) {
        waveProgressRef.current += dt * 1.8;
        if (waveProgressRef.current >= 1.0) {
          waveProgressRef.current = 0.0;
        }
        uniformsRef.current.uPerturbationWave.value = waveProgressRef.current;
      }

      // 场景淡入淡出插值
      if (transitionProgressRef.current < 1.0) {
        transitionProgressRef.current = Math.min(1.0, transitionProgressRef.current + dt * 2.2);
        uniformsRef.current.uTransitionProgress.value = transitionProgressRef.current;
      }

      // 周期性更新 HUD 坐标
      if (Math.random() < 0.2) {
        setCameraCoords({
          x: parseFloat((posRef.current.x * 12.5).toFixed(1)),
          y: parseFloat((posRef.current.y * 8.2).toFixed(1)),
          z: parseFloat(((velRef.current.x + velRef.current.y) * 4.0).toFixed(1)),
        });
      }

      renderer.render(scene, camera);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      colorTex.dispose();
      depthTex.dispose();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 切换世界场景
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(currentWorld.image, (colorTex) => {
      colorTex.colorSpace = THREE.SRGBColorSpace;
      colorTex.minFilter = THREE.LinearFilter;

      textureLoader.load(currentWorld.depthMap, (depthTex) => {
        depthTex.minFilter = THREE.LinearFilter;

        if (uniformsRef.current.uColorMap.value) {
          uniformsRef.current.uPrevColorMap.value = uniformsRef.current.uColorMap.value;
          uniformsRef.current.uPrevDepthMap.value = uniformsRef.current.uDepthMap.value;
          transitionProgressRef.current = 0.0;
          uniformsRef.current.uTransitionProgress.value = 0.0;
        }

        uniformsRef.current.uColorMap.value = colorTex;
        uniformsRef.current.uDepthMap.value = depthTex;
      });
    });
  }, [currentWorld]);

  // 时间光影与太阳演化
  useEffect(() => {
    const solarProgress = (currentHour - 6.0) / 12.0;
    const solarAngle = solarProgress * Math.PI;

    const sunX = Math.cos(solarAngle) * 2.0;
    const sunY = Math.sin(solarAngle) * 2.5;
    const sunZ = Math.max(0.3, Math.sin(solarAngle) * 1.5);

    uniformsRef.current.uSunDirection.value.set(sunX, sunY, sunZ);

    if (currentHour < 8.0) {
      uniformsRef.current.uSunColor.value.setRGB(1.0, 0.82, 0.62);
      uniformsRef.current.uAmbientColor.value.setRGB(0.24, 0.28, 0.38);
      uniformsRef.current.uSunIntensity.value = 1.15;
      uniformsRef.current.uAtmosphereHaze.value = 0.25;
    } else if (currentHour >= 8.0 && currentHour < 15.5) {
      uniformsRef.current.uSunColor.value.setRGB(1.0, 0.98, 0.92);
      uniformsRef.current.uAmbientColor.value.setRGB(0.48, 0.52, 0.58);
      uniformsRef.current.uSunIntensity.value = 1.25;
      uniformsRef.current.uAtmosphereHaze.value = 0.08;
    } else if (currentHour >= 15.5 && currentHour < 19.0) {
      uniformsRef.current.uSunColor.value.setRGB(1.0, 0.55, 0.22);
      uniformsRef.current.uAmbientColor.value.setRGB(0.35, 0.22, 0.25);
      uniformsRef.current.uSunIntensity.value = 1.35;
      uniformsRef.current.uAtmosphereHaze.value = 0.32;
    } else {
      uniformsRef.current.uSunColor.value.setRGB(0.25, 0.45, 0.85);
      uniformsRef.current.uAmbientColor.value.setRGB(0.12, 0.16, 0.28);
      uniformsRef.current.uSunIntensity.value = 0.55;
      uniformsRef.current.uAtmosphereHaze.value = 0.45;
    }
  }, [currentHour]);

  useEffect(() => {
    uniformsRef.current.uSnowCover.value = snowMode ? 1.0 : 0.0;
  }, [snowMode]);

  useEffect(() => {
    uniformsRef.current.uRenderMode.value = renderMode;
  }, [renderMode]);

  // 时间自动流转
  useEffect(() => {
    if (!isPlayingTime) return;
    const interval = setInterval(() => {
      setCurrentHour((prev) => {
        const next = prev + 0.15;
        const bounded = next > 24 ? 0 : next;
        onChangeHour(bounded);
        return bounded;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [isPlayingTime, onChangeHour]);

  // 鼠标交互
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseRef.current.isDown = true;
    mouseRef.current.lastX = e.clientX;
    mouseRef.current.lastY = e.clientY;

    const rect = e.currentTarget.getBoundingClientRect();
    const uvX = (e.clientX - rect.left) / rect.width;
    const uvY = 1.0 - (e.clientY - rect.top) / rect.height;

    if (isTemple) {
      handleKnockWoodenFish();
    } else {
      triggerPerturbation(uvX, uvY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseRef.current.isDown) return;
    const dx = e.clientX - mouseRef.current.lastX;
    const dy = e.clientY - mouseRef.current.lastY;
    mouseRef.current.x = dx * 0.05;
    mouseRef.current.y = dy * 0.05;
    mouseRef.current.lastX = e.clientX;
    mouseRef.current.lastY = e.clientY;
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
    mouseRef.current.x = 0;
    mouseRef.current.y = 0;
  };

  const currentBroadcast = MULTIPLAYER_BROADCASTS[broadcastIndex];

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#070707] font-sans">
      {/* 闪烁重置指示 */}
      {reseedFlash && (
        <div className="pointer-events-none absolute inset-0 z-50 bg-[#00f2fe]/20 transition-opacity duration-300" />
      )}

      {/* 浮动金色功德文字 */}
      <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
        {floatingMerits.map((item) => (
          <div
            key={item.id}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 animate-float-fade font-semibold text-[#ffd60a] text-[18px] sm:text-[22px] tracking-tight whitespace-nowrap"
          >
            {item.text}
          </div>
        ))}
      </div>

      {/* 赛博禅意灵签弹窗 (Apple 极简浮层视觉) */}
      {activeFortune && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
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
                {activeFortune.name}
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

      {/* 渲染画布与鼠标交互层 */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative h-full w-full cursor-crosshair"
      >
        <canvas ref={canvasRef} className="h-full w-full object-cover" />

        {/* 顶部居中：多人在线信众动作广播条 (Apple 极简灵动药丸) */}
        <div className="pointer-events-none absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 rounded-full bg-[#1d1d1f]/95 px-4 py-1.5 border border-white/10 text-[12px] text-white/90 max-w-[90vw] sm:max-w-md" data-ui="true">
          <span className="h-2 w-2 rounded-full bg-[#34c759] shrink-0" />
          <span className="text-white/50 shrink-0 tnum">{onlineUsersCount} 在线</span>
          <span className="text-white/20">|</span>
          <div className="truncate text-[12px]">
            <span className="text-[#2997ff] font-medium mr-1.5">{currentBroadcast.user}</span>
            <span className="text-white/70">{currentBroadcast.action}</span>
            <span className="text-white/40 ml-1.5 hidden sm:inline">({currentBroadcast.detail})</span>
          </div>
        </div>

        {/* 游戏准星 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="h-5 w-[1px] bg-white/70" />
            <div className="absolute h-[1px] w-5 bg-white/70" />
            <div className="absolute h-2 w-2 rounded-full border border-[#00f2fe]/80" />
          </div>
        </div>

        {/* HUD 左上：世界维度与时空坐标 */}
        <div className="pointer-events-none absolute top-4 sm:top-6 left-4 sm:left-6 z-30 max-w-sm">
          <div className="rounded-[18px] bg-[#0c0c0e]/95 p-3.5 sm:p-4 text-[16px] text-white/90 border border-white/5" data-ui="true">
            <div className="flex items-center gap-2 text-[15px] text-[#00f2fe] tnum">
              <span className="h-2 w-2 rounded-full bg-[#00f2fe]" />
              <span>{currentWorld.codename}</span>
            </div>
            <div className="mt-1 font-semibold text-white text-[17px] sm:text-[19px] tracking-tight">
              {currentWorld.name}
            </div>
            <div className="mt-2 flex items-center gap-3 text-[14px] text-white/50 tnum">
              <span>X: {cameraCoords.x > 0 ? `+${cameraCoords.x}` : cameraCoords.x}m</span>
              <span>Y: {cameraCoords.y > 0 ? `+${cameraCoords.y}` : cameraCoords.y}m</span>
              <span>Z: {cameraCoords.z > 0 ? `+${cameraCoords.z}` : cameraCoords.z}m</span>
            </div>
          </div>
        </div>

        {/* HUD 右上：自回归神经生成监控 */}
        <div className="pointer-events-none absolute top-4 sm:top-6 right-4 sm:right-6 z-30 hidden sm:block">
          <div className="rounded-[20px] bg-[#1d1d1f]/95 p-3.5 sm:p-4 text-right text-[12px] text-white/80 space-y-1.5 tnum border border-white/5" data-ui="true">
            <div className="flex items-center justify-end gap-2">
              <span className="text-[#2997ff] text-[13px] font-medium tnum">Causal DiT 60FPS</span>
              <span className="h-2 w-2 rounded-full bg-[#34c759]" />
            </div>
            <div>
              <span className="text-white/40">降噪步数：</span>
              <span className="text-white font-medium">{diffusionSteps} / 50 Steps</span>
            </div>
            <div>
              <span className="text-white/40">因果时序视界：</span>
              <span className="text-white font-medium">{currentWorld.diffusionConfig.causalWindow} Frames</span>
            </div>
            <div>
              <span className="text-white/40">潜空间流形：</span>
              <span className="text-white/80 text-[12px] tnum">{currentWorld.diffusionConfig.latentDim}</span>
            </div>
          </div>
        </div>

        {/* 赛博禅刹专属祈福快捷浮岛 (Temple Exclusive Panel) */}
        {isTemple && (
          <div className="absolute top-24 sm:top-28 right-4 sm:right-6 z-30 flex flex-col items-end gap-2">
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
                  title="敲击电子木鱼（Space）"
                >
                  敲木鱼
                </button>
                <button
                  type="button"
                  onClick={handleRingTempleBell}
                  className="rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-95 py-2 px-2 text-center text-[12px] font-medium text-white transition cursor-pointer"
                  title="撞天坛晨钟（E）"
                >
                  撞晨钟
                </button>
                <button
                  type="button"
                  onClick={handleBurnIncense}
                  className="rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-95 py-2 px-2 text-center text-[12px] font-medium text-[#ffd60a] transition cursor-pointer"
                  title="赛博焚香（F）"
                >
                  焚香祈愿
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
          </div>
        )}

        {/* 赛博新城专属反事实决策浮岛 (City Exclusive Panel) */}
        {isCity && (
          <div className="absolute top-24 sm:top-28 right-4 sm:right-6 z-30 flex flex-col items-end gap-2">
            <div className="rounded-[20px] bg-[#1d1d1f]/95 p-3 sm:p-3.5 border border-white/10 text-white space-y-2 max-w-[220px]" data-ui="true">
              <div className="text-[11px] text-white/50">多智能体 · 反事实仿真</div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    zenAudio.playCyberDrive();
                    triggerPerturbation(0.5, 0.5, "前方突发变道避障推演");
                  }}
                  className="rounded-[10px] bg-[#2997ff]/20 hover:bg-[#2997ff]/30 active:scale-95 py-2 px-3 text-left text-[12px] font-medium text-[#2997ff] transition cursor-pointer flex items-center justify-between"
                >
                  <span>注入突发避障 (E)</span>
                  <span className="text-[10px] text-[#2997ff]/70">分支</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    velRef.current.y += 0.05;
                    recordAction("Drone", "无人机高空广角俯瞰", [0, 2.0, 0]);
                  }}
                  className="rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-95 py-2 px-3 text-left text-[12px] font-medium text-white transition cursor-pointer flex items-center justify-between"
                >
                  <span>无人机全景 (Space)</span>
                  <span className="text-[10px] text-white/50">俯瞰</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HUD 左下：控制键盘触控与实时动作流 */}
        <div className="absolute bottom-24 sm:bottom-28 left-4 sm:left-10 z-30 flex items-center gap-3">
          <div className="rounded-[20px] bg-[#1d1d1f]/90 p-3 text-white border border-white/5 shadow-xl" data-ui="true">
            <div className="text-[11px] text-white/50 mb-2 font-medium hidden sm:block tracking-wide">
              {isTemple
                ? "WASD 漫游 · Space 敲木鱼 · F 焚香 · E 撞钟"
                : "WASD 漫游 · Space 跃升 · E 突发避障 · R 重置"}
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  velRef.current.y += 0.03;
                  recordAction("W", "Forward Thrust", [0, 0, 1]);
                }}
                className={`terra-btn h-8 w-11 rounded-[8px] text-[13px] font-semibold transition active:scale-[0.96] ${
                  activeKeys["w"] || activeKeys["arrowup"]
                    ? "bg-[#2997ff] text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                W
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    velRef.current.x -= 0.03;
                    recordAction("A", "Strafe Left", [-1, 0, 0]);
                  }}
                  className={`terra-btn h-8 w-11 rounded-[8px] text-[13px] font-semibold transition active:scale-[0.96] ${
                    activeKeys["a"] || activeKeys["arrowleft"]
                      ? "bg-[#2997ff] text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => {
                    velRef.current.y -= 0.03;
                    recordAction("S", "Backward Thrust", [0, 0, -1]);
                  }}
                  className={`terra-btn h-8 w-11 rounded-[8px] text-[13px] font-semibold transition active:scale-[0.96] ${
                    activeKeys["s"] || activeKeys["arrowdown"]
                      ? "bg-[#2997ff] text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() => {
                    velRef.current.x += 0.03;
                    recordAction("D", "Strafe Right", [1, 0, 0]);
                  }}
                  className={`terra-btn h-8 w-11 rounded-[8px] text-[13px] font-semibold transition active:scale-[0.96] ${
                    activeKeys["d"] || activeKeys["arrowright"]
                      ? "bg-[#2997ff] text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  D
                </button>
              </div>
            </div>
          </div>

          {/* 实时动作流抓取 */}
          <div className="hidden md:flex flex-col gap-1 rounded-[20px] bg-[#1d1d1f]/90 p-3 text-[12px] text-white/70 min-w-[220px] border border-white/5 shadow-xl" data-ui="true">
            <div className="text-white/40 text-[11px] mb-1 font-sans">实时动作潜变量流 (Action Stream)</div>
            {actionLog.length === 0 ? (
              <div className="text-white/30 text-[12px]">点击或按下 WASD / E 互动...</div>
            ) : (
              actionLog.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-[12px] tnum">
                  <span className="text-[#2997ff]">[{item.key}]</span>
                  <span className="text-white/80 truncate max-w-[110px]">{item.action}</span>
                  <span className="text-white/40">{item.latentDelta[0]}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 底部一体化应用控制器 */}
        <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-10 right-4 sm:right-10 z-20 flex flex-wrap items-center justify-between gap-4 rounded-full bg-[#1d1d1f]/90 px-4 sm:px-6 py-2.5 border border-white/10 shadow-2xl backdrop-blur-xl" data-ui="true">
          {/* 左侧：世界维度选择器 */}
          <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none whitespace-nowrap">
            {WORLD_DIMENSIONS.map((w) => {
              const isSel = w.id === activeWorldId;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => onSelectWorld(w.id)}
                  className={`terra-btn flex items-center gap-1.5 text-[13px] transition shrink-0 cursor-pointer ${
                    isSel ? "text-white font-semibold" : "text-white/50 hover:text-white/90"
                  }`}
                >
                  <span>{w.name}</span>
                  {isSel && <span className="h-1.5 w-1.5 rounded-full bg-[#2997ff]" />}
                </button>
              );
            })}
          </div>

          {/* 右侧：神经渲染通道 + 扰动步数 + 太阳时间 */}
          <div className="flex items-center gap-2.5 sm:gap-3 text-[12px] shrink-0">
            {/* 渲染通道 */}
            <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5">
              <button
                type="button"
                onClick={() => setRenderMode(0)}
                className={`terra-btn rounded-full px-2.5 py-1 text-[12px] transition cursor-pointer ${
                  renderMode === 0
                    ? "bg-white text-black font-semibold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                神经辐射 RGB
              </button>
              <button
                type="button"
                onClick={() => setRenderMode(1)}
                className={`terra-btn rounded-full px-2.5 py-1 text-[12px] transition cursor-pointer ${
                  renderMode === 1
                    ? "bg-[#2997ff] text-white font-semibold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                深度潜空间
              </button>
              <button
                type="button"
                onClick={() => setRenderMode(2)}
                className={`terra-btn rounded-full px-2.5 py-1 text-[12px] transition hidden lg:inline-block cursor-pointer ${
                  renderMode === 2
                    ? "bg-white text-black font-semibold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                几何法线
              </button>
              <button
                type="button"
                onClick={() => setDiffusionSteps((s) => (s >= 50 ? 10 : s + 10))}
                className="terra-btn rounded-full px-2.5 py-1 text-[12px] text-[#2997ff] hover:bg-white/10 transition hidden md:inline-block tnum cursor-pointer"
                title="调整时空扩散降噪步数"
              >
                {diffusionSteps} Steps
              </button>
            </div>

            {/* 时钟演化 */}
            <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-full px-3 py-1">
              <input
                type="range"
                min="0"
                max="24"
                step="0.1"
                value={currentHour}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentHour(val);
                  onChangeHour(val);
                }}
                className="w-20 accent-[#2997ff] cursor-pointer"
              />
              {/* taste-skill-ignore */}
              <span className="text-[12px] text-white/80 tnum">
                {Math.floor(currentHour).toString().padStart(2, "0") /* taste-skill-ignore */}:
                {Math.floor((currentHour % 1) * 60)
                  .toString()
                  .padStart(2, "0") /* taste-skill-ignore */}
              </span>
              <button
                type="button"
                onClick={() => setIsPlayingTime(!isPlayingTime)}
                className="terra-btn text-[12px] text-[#2997ff] hover:underline ml-1 cursor-pointer"
              >
                {isPlayingTime ? "暂停" : "流转"}
              </button>
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="terra-btn rounded-full bg-white/10 px-3 py-1 text-[12px] text-white hover:bg-white/20 transition hidden sm:inline-block cursor-pointer"
              title="切换全屏沉浸视界"
            >
              {isFullscreen ? "退出全屏" : "全屏视界"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
