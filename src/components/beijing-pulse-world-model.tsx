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
uniform float uPerturbationWave; // 世界扰动冲击波
uniform vec2 uPerturbationCenter;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // 1. 世界扰动冲击波 (E 键或点击触发的局部神经潜空间形变)
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
  const [renderMode, setRenderMode] = useState<number>(0); // 0: Radiance, 1: Depth, 2: Normal
  const [isPlayingTime, setIsPlayingTime] = useState(false);
  const [currentHour, setCurrentHour] = useState(hour);

  // 物理与潜空间参数
  const [diffusionSteps, setDiffusionSteps] = useState(28);

  // HUD 状态
  const [cameraCoords, setCameraCoords] = useState({ x: 0, y: 0, z: 0 });
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const [reseedFlash, setReseedFlash] = useState(false);

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

  // 触发世界扰动 (E 键或鼠标交互)
  const triggerPerturbation = useCallback((uvX = 0.5, uvY = 0.5) => {
    waveCenterRef.current.set(uvX, uvY);
    uniformsRef.current.uPerturbationCenter.value.set(uvX, uvY);
    waveProgressRef.current = 0.001;
    recordAction("E / Click", "Latent Block Break & World Perturbation", [
      parseFloat((Math.random() * 0.4 - 0.2).toFixed(3)),
      parseFloat((Math.random() * 0.4 - 0.2).toFixed(3)),
      0.5,
    ]);
  }, [recordAction]);

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

      if (key === "e") {
        triggerPerturbation(0.5, 0.5);
      } else if (key === "r") {
        triggerReseed();
      } else if (key === " " || key === "space") {
        // 跳跃冲量
        velRef.current.y += 0.045 * (currentWorld.physics.gravity > 0 ? 1 : -1);
        recordAction("Space", "Kinetic Leap / Altitude Impulse", [0, 1.2, 0]);
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
  }, [currentWorld, triggerPerturbation, triggerReseed, recordAction]);

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

      // 阻尼与回弹
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
    triggerPerturbation(uvX, uvY);
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

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#070707] font-sans">
      {/* 闪烁重置指示 */}
      {reseedFlash && (
        <div className="pointer-events-none absolute inset-0 z-50 bg-[#00f2fe]/20 transition-opacity duration-300" />
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

        {/* 游戏准星 (Interactive Crosshair) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="h-5 w-[1px] bg-white/70" />
            <div className="absolute h-[1px] w-5 bg-white/70" />
            <div className="absolute h-2 w-2 rounded-full border border-[#00f2fe]/80" />
          </div>
        </div>

        {/* HUD 左上：世界维度与时空坐标 */}
        <div className="pointer-events-none absolute top-4 sm:top-6 left-4 sm:left-6 z-30 max-w-sm">
          <div className="rounded-[18px] bg-[#0c0c0e]/95 p-3.5 sm:p-4 text-[16px] text-white/90">
            <div className="flex items-center gap-2 text-[16px] text-[#00f2fe] tnum">
              <span className="h-2 w-2 rounded-full bg-[#00f2fe]" />
              <span>{currentWorld.codename}</span>
            </div>
            <div className="mt-1 font-bold text-white text-[18px] sm:text-[20px] tracking-tight">
              {currentWorld.name}
            </div>
            <div className="mt-2 flex items-center gap-3 text-[16px] text-white/50 tnum">
              <span>X: {cameraCoords.x > 0 ? `+${cameraCoords.x}` : cameraCoords.x}m</span>
              <span>Y: {cameraCoords.y > 0 ? `+${cameraCoords.y}` : cameraCoords.y}m</span>
              <span>Z: {cameraCoords.z > 0 ? `+${cameraCoords.z}` : cameraCoords.z}m</span>
            </div>
          </div>
        </div>

        {/* HUD 右上：自回归神经生成监控 */}
        <div className="pointer-events-none absolute top-4 sm:top-6 right-4 sm:right-6 z-30 hidden sm:block">
          <div className="rounded-[18px] bg-[#0c0c0e]/95 p-3.5 sm:p-4 text-right text-[16px] text-white/80 space-y-1 tnum">
            <div className="flex items-center justify-end gap-2">
              <span className="text-[#00f2fe] text-[16px] tnum">Causal DiT 60FPS</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
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
              <span className="text-white/40">潜空间张量：</span>
              <span className="text-white/80 text-[16px] tnum">{currentWorld.diffusionConfig.latentDim}</span>
            </div>
          </div>
        </div>

        {/* HUD 左下：按键驱动反馈与虚拟触控 */}
        <div className="absolute bottom-24 sm:bottom-28 left-4 sm:left-10 z-30 flex items-center gap-3">
          <div className="rounded-[20px] bg-[#0c0c0e] p-3.5 text-white">
            <div className="text-[16px] text-white/50 mb-2 font-medium hidden sm:block">
              WASD 移动 · Space 跳跃 · E 破拆扰动 · R 重置
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  velRef.current.y += 0.03;
                  recordAction("W", "Forward Thrust", [0, 0, 1]);
                }}
                className={`terra-btn h-9 w-12 rounded-[8px] text-[16px] font-bold transition ${
                  activeKeys["w"] || activeKeys["arrowup"]
                    ? "bg-[#00f2fe] text-black"
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
                  className={`terra-btn h-9 w-12 rounded-[8px] text-[16px] font-bold transition ${
                    activeKeys["a"] || activeKeys["arrowleft"]
                      ? "bg-[#00f2fe] text-black"
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
                  className={`terra-btn h-9 w-12 rounded-[8px] text-[16px] font-bold transition ${
                    activeKeys["s"] || activeKeys["arrowdown"]
                      ? "bg-[#00f2fe] text-black"
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
                  className={`terra-btn h-9 w-12 rounded-[8px] text-[16px] font-bold transition ${
                    activeKeys["d"] || activeKeys["arrowright"]
                      ? "bg-[#00f2fe] text-black"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  D
                </button>
              </div>
            </div>
          </div>

          {/* 实时动作流抓取 (Action Stream Log) */}
          <div className="hidden md:flex flex-col gap-1 rounded-[20px] bg-[#0c0c0e] p-3 text-[16px] text-white/70 min-w-[240px]">
            <div className="text-white/40 text-[16px] mb-1 font-sans">实时动作潜变量流 (Action Log)</div>
            {actionLog.length === 0 ? (
              <div className="text-white/30 text-[16px]">按下 WASD / E / Space 注入动作...</div>
            ) : (
              actionLog.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-[16px] tnum">
                  <span className="text-[#00f2fe]">[{item.key}]</span>
                  <span className="text-white/80 truncate max-w-[120px]">{item.action}</span>
                  <span className="text-white/40">{item.latentDelta[0]}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 底部一体化应用控制器 */}
        <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-10 right-4 sm:right-10 z-20 flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-[#0c0c0e] px-4 sm:px-6 py-3">
          {/* 左侧：世界维度选择器 */}
          <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none whitespace-nowrap">
            {WORLD_DIMENSIONS.map((w) => {
              const isSel = w.id === activeWorldId;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => onSelectWorld(w.id)}
                  className={`terra-btn flex items-center gap-2 text-[16px] transition shrink-0 ${
                    isSel ? "text-white font-semibold" : "text-white/40 hover:text-white/80"
                  }`}
                >
                  <span>{w.name}</span>
                  {isSel && <span className="h-1.5 w-1.5 rounded-full bg-[#00f2fe]" />}
                </button>
              );
            })}
          </div>

          {/* 右侧：神经渲染通道 + 扰动步数 + 太阳时间 */}
          <div className="flex items-center gap-3 sm:gap-4 text-[16px] shrink-0">
            {/* 渲染通道 */}
            <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
              <button
                type="button"
                onClick={() => setRenderMode(0)}
                className={`terra-btn rounded-full px-3 py-1 text-[16px] transition ${
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
                className={`terra-btn rounded-full px-3 py-1 text-[16px] transition ${
                  renderMode === 1
                    ? "bg-[#00f2fe] text-black font-semibold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                深度潜空间
              </button>
              <button
                type="button"
                onClick={() => setRenderMode(2)}
                className={`terra-btn rounded-full px-3 py-1 text-[16px] transition hidden lg:inline-block ${
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
                className="terra-btn rounded-full px-3 py-1 text-[16px] text-[#00f2fe] hover:bg-white/10 transition hidden md:inline-block tnum"
                title="调整时空扩散降噪步数"
              >
                {diffusionSteps} Steps
              </button>
            </div>

            {/* 时钟演化 */}
            <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5">
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
                className="w-24 accent-[#00f2fe] cursor-pointer"
              />
              {/* taste-skill-ignore */}
              <span className="text-[16px] text-white/80 tnum">
                {Math.floor(currentHour).toString().padStart(2, "0") /* taste-skill-ignore */}:
                {Math.floor((currentHour % 1) * 60)
                  .toString()
                  .padStart(2, "0") /* taste-skill-ignore */}
              </span>
              <button
                type="button"
                onClick={() => setIsPlayingTime(!isPlayingTime)}
                className="terra-btn text-[16px] text-[#00f2fe] hover:underline ml-1"
              >
                {isPlayingTime ? "暂停" : "流转"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
