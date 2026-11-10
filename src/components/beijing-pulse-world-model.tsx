"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { WORLD_MODEL_DOMAINS, type WorldModelDomain } from "@/lib/world-model-catalog";

export type RenderMode = "radiance" | "depth" | "normals";
export type CameraPreset = "frontal" | "top" | "flank";

interface WorldModelViewerProps {
  activeDomainId?: string;
  onSelectDomain?: (id: string) => void;
  hour?: number;
  onChangeHour?: (hour: number) => void;
  snowMode?: boolean;
}

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uColorMap;
  uniform sampler2D uPrevColorMap;
  uniform sampler2D uDepthMap;
  uniform sampler2D uPrevDepthMap;
  uniform float uTransitionProgress;
  uniform vec2 uMouse;
  uniform float uParallaxScale;
  uniform vec3 uSunDirection;
  uniform vec3 uSunColor;
  uniform vec3 uAmbientColor;
  uniform float uSunIntensity;
  uniform float uAtmosphereHaze;
  uniform float uSnowAmount;
  uniform float uTime;
  uniform int uRenderMode; // 0: Radiance, 1: Neural Depth, 2: Surface Normals
  varying vec2 vUv;

  void main() {
    float rawDepthCurr = texture2D(uDepthMap, vUv).r;
    float rawDepthPrev = texture2D(uPrevDepthMap, vUv).r;
    float rawDepth = mix(rawDepthPrev, rawDepthCurr, uTransitionProgress);
    
    float windOffset = sin(vUv.y * 12.0 + uTime * 0.8) * cos(vUv.x * 10.0 + uTime * 0.6) * 0.0015 * (1.0 - rawDepth * 0.5);
    vec2 dynamicUv = vUv + vec2(windOffset, 0.0);

    vec2 parallaxOffset = uMouse * (rawDepth * uParallaxScale);
    vec2 displacedUv = clamp(dynamicUv - parallaxOffset, 0.001, 0.999);
    
    vec4 colCurr = texture2D(uColorMap, displacedUv);
    vec4 colPrev = texture2D(uPrevColorMap, displacedUv);
    vec4 baseColor = mix(colPrev, colCurr, uTransitionProgress);

    float dCurr = texture2D(uDepthMap, displacedUv).r;
    float dPrev = texture2D(uPrevDepthMap, displacedUv).r;
    float depth = mix(dPrev, dCurr, uTransitionProgress);

    vec2 texel = vec2(1.0 / 512.0, 1.0 / 320.0);
    float dLCurr = texture2D(uDepthMap, displacedUv - vec2(texel.x, 0.0)).r;
    float dRCurr = texture2D(uDepthMap, displacedUv + vec2(texel.x, 0.0)).r;
    float dDCurr = texture2D(uDepthMap, displacedUv - vec2(0.0, texel.y)).r;
    float dUCurr = texture2D(uDepthMap, displacedUv + vec2(0.0, texel.y)).r;

    float dLPrev = texture2D(uPrevDepthMap, displacedUv - vec2(texel.x, 0.0)).r;
    float dRPrev = texture2D(uPrevDepthMap, displacedUv + vec2(texel.x, 0.0)).r;
    float dDPrev = texture2D(uPrevDepthMap, displacedUv - vec2(0.0, texel.y)).r;
    float dUPrev = texture2D(uPrevDepthMap, displacedUv + vec2(0.0, texel.y)).r;

    float dL = mix(dLPrev, dLCurr, uTransitionProgress);
    float dR = mix(dRPrev, dRCurr, uTransitionProgress);
    float dD = mix(dDPrev, dDCurr, uTransitionProgress);
    float dU = mix(dUPrev, dUCurr, uTransitionProgress);
    
    float shimmer = sin(displacedUv.x * 60.0 + uTime * 1.5) * cos(displacedUv.y * 60.0 + uTime * 1.2) * 0.08 * (1.0 - depth);
    vec3 normal = normalize(vec3((dL - dR) * 2.0 + shimmer, (dD - dU) * 2.0, 1.0));

    if (uRenderMode == 1) {
      vec3 depthCol = mix(vec3(0.04, 0.08, 0.28), vec3(0.98, 0.82, 0.32), depth);
      gl_FragColor = vec4(depthCol, 1.0);
      return;
    }

    if (uRenderMode == 2) {
      vec3 normalCol = normal * 0.5 + 0.5;
      gl_FragColor = vec4(normalCol, 1.0);
      return;
    }

    float diffuse = max(dot(normal, normalize(uSunDirection)), 0.0);
    vec3 lighting = uAmbientColor + (uSunColor * diffuse * uSunIntensity);

    float hazePulse = sin(uTime * 0.4) * 0.04;
    float hazeFactor = (1.0 - depth) * max(0.0, uAtmosphereHaze + hazePulse);
    vec3 litColor = baseColor.rgb * lighting;
    vec3 hazeColor = mix(uAmbientColor * 1.2, uSunColor, 0.4);
    vec3 finalColor = mix(litColor, hazeColor, hazeFactor);

    if (uSnowAmount > 0.01) {
      float upwardness = max(normal.y, 0.0);
      float snowMask = smoothstep(0.15, 0.75, upwardness) * uSnowAmount;
      vec3 snowColor = vec3(0.94, 0.96, 1.0) * (uAmbientColor * 1.5 + uSunColor * diffuse * 0.8);
      finalColor = mix(finalColor, snowColor, snowMask * 0.85);
    }

    gl_FragColor = vec4(finalColor, baseColor.a);
  }
`;

export function BeijingSpatialWorldModel({
  activeDomainId: propDomainId,
  onSelectDomain,
  hour: propHour,
  onChangeHour,
  snowMode = false,
}: WorldModelViewerProps) {
  const [internalDomainId, setInternalDomainId] = useState<string>("autonomous-driving");
  const [internalHour, setInternalHour] = useState<number>(17.5);
  const [isTimeLapseActive, setIsTimeLapseActive] = useState<boolean>(false);
  const [renderMode, setRenderMode] = useState<RenderMode>("radiance");
  const [activePreset, setActivePreset] = useState<CameraPreset>("frontal");

  const currentDomainId = propDomainId ?? internalDomainId;
  const currentHour = propHour ?? internalHour;

  const currentDomain: WorldModelDomain = useMemo(() => {
    return WORLD_MODEL_DOMAINS.find((d) => d.id === currentDomainId) ?? WORLD_MODEL_DOMAINS[0];
  }, [currentDomainId]);

  const handleDomainChange = useCallback(
    (id: string) => {
      if (onSelectDomain) {
        onSelectDomain(id);
      } else {
        setInternalDomainId(id);
      }
    },
    [onSelectDomain]
  );

  const handleHourChange = useCallback(
    (newHour: number) => {
      if (onChangeHour) {
        onChangeHour(newHour);
      } else {
        setInternalHour(newHour);
      }
    },
    [onChangeHour]
  );

  const toggleTimeLapse = () => {
    setIsTimeLapseActive((prev) => !prev);
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const uniformsRef = useRef<{
    uColorMap: { value: THREE.Texture | null };
    uPrevColorMap: { value: THREE.Texture | null };
    uDepthMap: { value: THREE.Texture | null };
    uPrevDepthMap: { value: THREE.Texture | null };
    uTransitionProgress: { value: number };
    uMouse: { value: THREE.Vector2 };
    uParallaxScale: { value: number };
    uSunDirection: { value: THREE.Vector3 };
    uSunColor: { value: THREE.Color };
    uAmbientColor: { value: THREE.Color };
    uSunIntensity: { value: number };
    uAtmosphereHaze: { value: number };
    uSnowAmount: { value: number };
    uTime: { value: number };
    uRenderMode: { value: number };
  }>({
    uColorMap: { value: null },
    uPrevColorMap: { value: null },
    uDepthMap: { value: null },
    uPrevDepthMap: { value: null },
    uTransitionProgress: { value: 1.0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uParallaxScale: { value: 0.035 },
    uSunDirection: { value: new THREE.Vector3(1, 0.5, 0.5) },
    uSunColor: { value: new THREE.Color(1, 0.8, 0.6) },
    uAmbientColor: { value: new THREE.Color(0.2, 0.2, 0.25) },
    uSunIntensity: { value: 1.0 },
    uAtmosphereHaze: { value: 0.2 },
    uSnowAmount: { value: 0.0 },
    uTime: { value: 0.0 },
    uRenderMode: { value: 0 },
  });

  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const transitionProgressRef = useRef<number>(1.0);

  const isTimeLapseRef = useRef<boolean>(isTimeLapseActive);
  const currentHourRef = useRef<number>(currentHour);
  const onHourChangeRef = useRef<(h: number) => void>(handleHourChange);

  useEffect(() => {
    isTimeLapseRef.current = isTimeLapseActive;
  }, [isTimeLapseActive]);

  useEffect(() => {
    currentHourRef.current = currentHour;
  }, [currentHour]);

  useEffect(() => {
    onHourChangeRef.current = handleHourChange;
  }, [handleHourChange]);

  useEffect(() => {
    const modeIdx = renderMode === "depth" ? 1 : renderMode === "normals" ? 2 : 0;
    uniformsRef.current.uRenderMode.value = modeIdx;
  }, [renderMode]);

  const setCameraPreset = (preset: CameraPreset) => {
    setActivePreset(preset);
    if (preset === "frontal") {
      mouseTargetRef.current = { x: 0, y: 0 };
    } else if (preset === "top") {
      mouseTargetRef.current = { x: 0, y: 0.28 };
    } else if (preset === "flank") {
      mouseTargetRef.current = { x: -0.32, y: -0.1 };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const textureLoader = new THREE.TextureLoader();
    const colorTex = textureLoader.load(currentDomain.previewImage);
    colorTex.colorSpace = THREE.SRGBColorSpace;
    colorTex.minFilter = THREE.LinearFilter;
    colorTex.magFilter = THREE.LinearFilter;

    const depthTex = textureLoader.load(currentDomain.depthMap);
    depthTex.minFilter = THREE.LinearFilter;
    depthTex.magFilter = THREE.LinearFilter;

    uniformsRef.current.uColorMap.value = colorTex;
    uniformsRef.current.uPrevColorMap.value = colorTex;
    uniformsRef.current.uDepthMap.value = depthTex;
    uniformsRef.current.uPrevDepthMap.value = depthTex;
    uniformsRef.current.uTransitionProgress.value = 1.0;

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: uniformsRef.current,
      depthTest: false,
      depthWrite: false,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    const handleResize = () => {
      if (!canvas) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let animationId = 0;
    let lastTimestamp = performance.now();

    const animate = (timestamp: number) => {
      const deltaSec = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;

      uniformsRef.current.uTime.value = timestamp * 0.001;

      if (isTimeLapseRef.current) {
        let nextHour = currentHourRef.current + deltaSec * 0.8;
        if (nextHour > 22.0) {
          nextHour = 5.5;
        }
        currentHourRef.current = nextHour;
        onHourChangeRef.current(nextHour);
      }

      if (transitionProgressRef.current < 1.0) {
        transitionProgressRef.current = Math.min(
          1.0,
          transitionProgressRef.current + deltaSec * 2.2
        );
        uniformsRef.current.uTransitionProgress.value =
          transitionProgressRef.current;
      }

      currentMouseRef.current.x +=
        (mouseTargetRef.current.x - currentMouseRef.current.x) * 0.08;
      currentMouseRef.current.y +=
        (mouseTargetRef.current.y - currentMouseRef.current.y) * 0.08;

      uniformsRef.current.uMouse.value.set(
        currentMouseRef.current.x,
        currentMouseRef.current.y
      );

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
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

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(currentDomain.previewImage, (colorTex) => {
      colorTex.colorSpace = THREE.SRGBColorSpace;
      colorTex.minFilter = THREE.LinearFilter;

      textureLoader.load(currentDomain.depthMap, (depthTex) => {
        depthTex.minFilter = THREE.LinearFilter;

        if (uniformsRef.current.uColorMap.value) {
          uniformsRef.current.uPrevColorMap.value =
            uniformsRef.current.uColorMap.value;
          uniformsRef.current.uPrevDepthMap.value =
            uniformsRef.current.uDepthMap.value;
          transitionProgressRef.current = 0.0;
          uniformsRef.current.uTransitionProgress.value = 0.0;
        }

        uniformsRef.current.uColorMap.value = colorTex;
        uniformsRef.current.uDepthMap.value = depthTex;
      });
    });
  }, [currentDomain]);

  useEffect(() => {
    const solarProgress = (currentHour - 6.0) / 12.0;
    const solarAngle = solarProgress * Math.PI;

    const sunX = Math.cos(solarAngle) * 2.0;
    const sunY = Math.sin(solarAngle) * 2.5;
    const sunZ = Math.max(0.3, Math.sin(solarAngle) * 1.5);

    uniformsRef.current.uSunDirection.value.set(sunX, sunY, sunZ);

    if (currentHour < 8.0) {
      uniformsRef.current.uSunColor.value.setRGB(1.0, 0.85, 0.65);
      uniformsRef.current.uAmbientColor.value.setRGB(0.28, 0.32, 0.42);
      uniformsRef.current.uSunIntensity.value = 1.15;
      uniformsRef.current.uAtmosphereHaze.value = 0.28;
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

    uniformsRef.current.uSnowAmount.value = snowMode ? 0.85 : 0.0;
  }, [currentHour, snowMode]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseTargetRef.current = { x: nx, y: -ny };
  };

  const handleMouseLeave = () => {
    if (activePreset === "frontal") {
      mouseTargetRef.current = { x: 0, y: 0 };
    }
  };

  const timeString = useMemo(() => {
    const h = Math.floor(currentHour);
    const m = Math.floor((currentHour - h) * 60);
    const sH = h < 10 ? `0${h}` : `${h}`;
    const sM = m < 10 ? `0${m}` : `${m}`;
    return `${sH}:${sM}`;
  }, [currentHour]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#070707]">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-full w-full overflow-hidden select-none cursor-crosshair"
      >
        <canvas ref={canvasRef} className="h-full w-full object-cover" />

        {/* 右上侧：世界模型引擎专业遥测看板 (Engine Telemetry) */}
        <div className="absolute top-24 sm:top-28 right-6 sm:right-10 z-30 hidden md:block pointer-events-none">
          <div className="rounded-[16px] bg-[#121214] p-3 text-right text-[14px] text-white/60 tnum space-y-1">
            <div>
              <span className="text-white/40">Engine: </span>
              <span className="text-white font-medium">World Model 2.0 WebGL</span>
            </div>
            <div>
              <span className="text-white/40">Sim Domain: </span>
              <span className="text-white font-medium">{currentDomain.nameEn}</span>
            </div>
            <div>
              <span className="text-white/40">Render Mode: </span>
              <span className="text-white font-medium uppercase">{renderMode}</span>
            </div>
            <div>
              <span className="text-white/40">Performance: </span>
              <span className="text-[#34c759] font-medium">60 FPS · 16ms</span>
            </div>
          </div>
        </div>

        {/* 一体化精密开源世界模型控制底栏 (World Model Deck) */}
        <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-10 right-6 sm:right-10 z-20 flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-[#0c0c0e] px-6 py-3.5">
          {/* 左侧：四大世界模型领域仿真切换 */}
          <div className="flex flex-wrap items-center gap-4">
            {WORLD_MODEL_DOMAINS.map((domain) => {
              const isSel = domain.id === currentDomainId;
              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => handleDomainChange(domain.id)}
                  className={`terra-btn flex items-center gap-1.5 text-[14px] transition ${
                    isSel ? "text-white font-semibold" : "text-white/40 hover:text-white/80"
                  }`}
                >
                  <span>{domain.nameZh}</span>
                  {isSel && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c23b3b]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* 右侧：渲染模式切换 + 运镜机位 + 物理时标 */}
          <div className="flex flex-wrap items-center gap-5 text-[14px]">
            <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
              <button
                type="button"
                onClick={() => setRenderMode("radiance")}
                className={`terra-btn rounded-full px-3 py-1 text-[14px] transition ${
                  renderMode === "radiance"
                    ? "bg-[#c23b3b] text-white font-medium"
                    : "text-white/60 hover:text-white"
                }`}
              >
                辐射场
              </button>
              <button
                type="button"
                onClick={() => setRenderMode("depth")}
                className={`terra-btn rounded-full px-3 py-1 text-[14px] transition ${
                  renderMode === "depth"
                    ? "bg-[#c23b3b] text-white font-medium"
                    : "text-white/60 hover:text-white"
                }`}
              >
                深度图
              </button>
              <button
                type="button"
                onClick={() => setRenderMode("normals")}
                className={`terra-btn rounded-full px-3 py-1 text-[14px] transition ${
                  renderMode === "normals"
                    ? "bg-[#c23b3b] text-white font-medium"
                    : "text-white/60 hover:text-white"
                }`}
              >
                法线场
              </button>
            </div>

            <div className="hidden xl:flex items-center gap-1 bg-white/5 rounded-full p-1">
              <button
                type="button"
                onClick={() => setCameraPreset("frontal")}
                className={`terra-btn rounded-full px-2.5 py-1 text-[14px] transition ${
                  activePreset === "frontal"
                    ? "bg-white/20 text-white font-medium"
                    : "text-white/50 hover:text-white"
                }`}
              >
                主视
              </button>
              <button
                type="button"
                onClick={() => setCameraPreset("top")}
                className={`terra-btn rounded-full px-2.5 py-1 text-[14px] transition ${
                  activePreset === "top"
                    ? "bg-white/20 text-white font-medium"
                    : "text-white/50 hover:text-white"
                }`}
              >
                俯瞰
              </button>
              <button
                type="button"
                onClick={() => setCameraPreset("flank")}
                className={`terra-btn rounded-full px-2.5 py-1 text-[14px] transition ${
                  activePreset === "flank"
                    ? "bg-white/20 text-white font-medium"
                    : "text-white/50 hover:text-white"
                }`}
              >
                侧掠
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5.5"
                max="22.0"
                step="0.1"
                value={currentHour}
                onChange={(e) => handleHourChange(parseFloat(e.target.value))}
                className="w-24 sm:w-32 accent-[#c23b3b] cursor-pointer"
                aria-label="拖动时空环境"
              />
              <span className="font-bold text-white tnum">{timeString}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTimeLapse}
                className={`terra-btn rounded-full px-3 py-1 text-[14px] font-medium transition ${
                  isTimeLapseActive
                    ? "bg-white text-black font-semibold"
                    : "bg-white/10 text-white/70 hover:text-white"
                }`}
              >
                {isTimeLapseActive ? "定格" : "流转"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
