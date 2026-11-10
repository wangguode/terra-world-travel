"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SCENIC_SPOTS, type ScenicSpot } from "@/lib/beijing-pulse-data";

export interface TimeAnchor {
  id: "dawn" | "noon" | "sunset" | "night";
  label: string;
  hour: number;
  timeString: string;
}

export const TIME_ANCHORS: TimeAnchor[] = [
  { id: "dawn", label: "晨曦", hour: 6.5, timeString: "06:30" },
  { id: "noon", label: "晴空", hour: 12.0, timeString: "12:00" },
  { id: "sunset", label: "金辉", hour: 17.5, timeString: "17:30" },
  { id: "night", label: "蓝调", hour: 20.5, timeString: "20:30" },
];

interface BeijingSpatialViewerProps {
  selectedSpotId?: string;
  onSelectSpot?: (id: string) => void;
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
  varying vec2 vUv;

  void main() {
    // 1. 读取基础深度值（0.0 远景，1.0 近景）
    float rawDepthCurr = texture2D(uDepthMap, vUv).r;
    float rawDepthPrev = texture2D(uPrevDepthMap, vUv).r;
    float rawDepth = mix(rawDepthPrev, rawDepthCurr, uTransitionProgress);
    
    // 2. 4D 动态微风扰动（远景云气与近景微澜轻拂）
    float windOffset = sin(vUv.y * 12.0 + uTime * 0.8) * cos(vUv.x * 10.0 + uTime * 0.6) * 0.0015 * (1.0 - rawDepth * 0.5);
    vec2 dynamicUv = vUv + vec2(windOffset, 0.0);

    // 3. 深度感知视差偏移（近景位移大，远景近乎不动，绝无球面鱼眼拉扯）
    vec2 parallaxOffset = uMouse * (rawDepth * uParallaxScale);
    vec2 displacedUv = clamp(dynamicUv - parallaxOffset, 0.001, 0.999);
    
    // 4. 双场景平滑交叉淡入淡出（Crossfade）
    vec4 colCurr = texture2D(uColorMap, displacedUv);
    vec4 colPrev = texture2D(uPrevColorMap, displacedUv);
    vec4 baseColor = mix(colPrev, colCurr, uTransitionProgress);

    float dCurr = texture2D(uDepthMap, displacedUv).r;
    float dPrev = texture2D(uPrevDepthMap, displacedUv).r;
    float depth = mix(dPrev, dCurr, uTransitionProgress);

    // 5. 从深度图推导微表面法线场（Sobel 边缘微分）并叠加时间微光波动
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
    
    // 琉璃瓦在光照下的微颤波光
    float shimmer = sin(displacedUv.x * 60.0 + uTime * 1.5) * cos(displacedUv.y * 60.0 + uTime * 1.2) * 0.08 * (1.0 - depth);
    vec3 normal = normalize(vec3((dL - dR) * 2.0 + shimmer, (dD - dU) * 2.0, 1.0));

    // 6. 真实太阳向量物理重打光（Lambertian Diffuse + 飞檐高光）
    float diffuse = max(dot(normal, normalize(uSunDirection)), 0.0);
    vec3 lighting = uAmbientColor + (uSunColor * diffuse * uSunIntensity);

    // 7. 深度感知远景大气暮色/晨雾（呼吸感薄雾流动）
    float hazePulse = sin(uTime * 0.4) * 0.04;
    float hazeFactor = (1.0 - depth) * max(0.0, uAtmosphereHaze + hazePulse);
    vec3 litColor = baseColor.rgb * lighting;
    vec3 hazeColor = mix(uAmbientColor * 1.2, uSunColor, 0.4);
    vec3 finalColor = mix(litColor, hazeColor, hazeFactor);

    // 8. 紫禁初雪意境（基于法线朝上分量在琉璃瓦顶积雪）
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
  selectedSpotId: propSpotId,
  onSelectSpot,
  hour: propHour,
  onChangeHour,
  snowMode = false,
}: BeijingSpatialViewerProps) {
  const [internalSpotId, setInternalSpotId] = useState<string>("forbidden-city");
  const [internalHour, setInternalHour] = useState<number>(17.5);
  const [isTimeLapseActive, setIsTimeLapseActive] = useState<boolean>(false);
  const [isLiveSynced, setIsLiveSynced] = useState<boolean>(false);

  const currentSpotId = propSpotId ?? internalSpotId;
  const currentHour = propHour ?? internalHour;

  const currentSpot: ScenicSpot = useMemo(() => {
    return SCENIC_SPOTS.find((s) => s.id === currentSpotId) ?? SCENIC_SPOTS[0];
  }, [currentSpotId]);

  const handleSpotChange = useCallback(
    (id: string) => {
      if (onSelectSpot) {
        onSelectSpot(id);
      } else {
        setInternalSpotId(id);
      }
    },
    [onSelectSpot]
  );

  const handleHourChange = useCallback(
    (newHour: number) => {
      setIsLiveSynced(false);
      if (onChangeHour) {
        onChangeHour(newHour);
      } else {
        setInternalHour(newHour);
      }
    },
    [onChangeHour]
  );

  // 北京真实时间计算（UTC+8）
  const getBeijingHour = (): number => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const beijingDate = new Date(utc + 3600000 * 8);
    return beijingDate.getHours() + beijingDate.getMinutes() / 60;
  };

  const toggleLiveSync = () => {
    if (isLiveSynced) {
      setIsLiveSynced(false);
      return;
    }
    setIsTimeLapseActive(false);
    setIsLiveSynced(true);
    const bjHour = getBeijingHour();
    handleHourChange(bjHour);
  };

  const toggleTimeLapse = () => {
    setIsLiveSynced(false);
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

  // 初始化 Three.js WebGL 神经深度重打光画布
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
    const colorTex = textureLoader.load(currentSpot.image);
    colorTex.colorSpace = THREE.SRGBColorSpace;
    colorTex.minFilter = THREE.LinearFilter;
    colorTex.magFilter = THREE.LinearFilter;

    const depthTex = textureLoader.load(currentSpot.depthMap);
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

      // 更新着色器流体微风时间
      uniformsRef.current.uTime.value = timestamp * 0.001;

      // 4D 动态时光流动（Time-lapse 循环推移）
      if (isTimeLapseRef.current) {
        let nextHour = currentHourRef.current + deltaSec * 0.8;
        if (nextHour > 22.0) {
          nextHour = 5.5;
        }
        currentHourRef.current = nextHour;
        onHourChangeRef.current(nextHour);
      }

      // 场景淡入淡出插值（Crossfade）
      if (transitionProgressRef.current < 1.0) {
        transitionProgressRef.current = Math.min(
          1.0,
          transitionProgressRef.current + deltaSec * 2.2
        );
        uniformsRef.current.uTransitionProgress.value =
          transitionProgressRef.current;
      }

      // 平滑缓动插值
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

  // 切换景点贴图（平滑淡入淡出过渡）
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(currentSpot.image, (colorTex) => {
      colorTex.colorSpace = THREE.SRGBColorSpace;
      colorTex.minFilter = THREE.LinearFilter;

      textureLoader.load(currentSpot.depthMap, (depthTex) => {
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
  }, [currentSpot]);

  // 根据日晷时间（05:00 - 22:00）动态计算三维太阳物理位置与光色
  useEffect(() => {
    // 太阳运动弧线（东升西落）
    // 6.0 = 东方 (+X), 12.0 = 中天 (+Y), 18.0 = 西方 (-X)
    const solarProgress = (currentHour - 6.0) / 12.0; // 0.0 (06:00) 到 1.0 (18:00)
    const solarAngle = solarProgress * Math.PI; // 0 到 PI

    const sunX = Math.cos(solarAngle) * 2.0; // 东面到西面
    const sunY = Math.sin(solarAngle) * 2.5; // 升起高度
    const sunZ = Math.max(0.3, Math.sin(solarAngle) * 1.5); // 前后侧光

    uniformsRef.current.uSunDirection.value.set(sunX, sunY, sunZ);

    // 氛围光与太阳色温过渡
    if (currentHour < 8.0) {
      // 06:00 - 08:00 晨曦（金粉晨光，冷调空气）
      uniformsRef.current.uSunColor.value.setRGB(1.0, 0.85, 0.65);
      uniformsRef.current.uAmbientColor.value.setRGB(0.28, 0.32, 0.42);
      uniformsRef.current.uSunIntensity.value = 1.15;
      uniformsRef.current.uAtmosphereHaze.value = 0.28;
    } else if (currentHour >= 8.0 && currentHour < 15.5) {
      // 08:00 - 15:30 正午晴空（澄澈纯白高光，天高云淡）
      uniformsRef.current.uSunColor.value.setRGB(1.0, 0.98, 0.92);
      uniformsRef.current.uAmbientColor.value.setRGB(0.48, 0.52, 0.58);
      uniformsRef.current.uSunIntensity.value = 1.25;
      uniformsRef.current.uAtmosphereHaze.value = 0.08;
    } else if (currentHour >= 15.5 && currentHour < 19.0) {
      // 15:30 - 19:00 金辉日落（斜阳西照，红墙碎金，暮色苍茫）
      uniformsRef.current.uSunColor.value.setRGB(1.0, 0.55, 0.22);
      uniformsRef.current.uAmbientColor.value.setRGB(0.35, 0.22, 0.25);
      uniformsRef.current.uSunIntensity.value = 1.35;
      uniformsRef.current.uAtmosphereHaze.value = 0.32;
    } else {
      // 19:00 - 24:00 蓝调子夜（深蓝夜幕，静谧月色，微弱轮廓光）
      uniformsRef.current.uSunColor.value.setRGB(0.25, 0.45, 0.85);
      uniformsRef.current.uAmbientColor.value.setRGB(0.12, 0.16, 0.28);
      uniformsRef.current.uSunIntensity.value = 0.55;
      uniformsRef.current.uAtmosphereHaze.value = 0.45;
    }

    uniformsRef.current.uSnowAmount.value = snowMode ? 0.85 : 0.0;
  }, [currentHour, snowMode]);

  // 鼠标交互控制视差
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseTargetRef.current = { x: nx, y: -ny };
  };

  const handleMouseLeave = () => {
    mouseTargetRef.current = { x: 0, y: 0 };
  };

  // 当前所处的四时意境标签
  const currentAtmosphere = useMemo(() => {
    if (currentHour < 8.0) return "清晨 · 晨曦微露";
    if (currentHour < 15.5) return "正午 · 晴空澄澈";
    if (currentHour < 19.0) return "傍晚 · 日落金辉";
    return "子夜 · 蓝调静谧";
  }, [currentHour]);

  const timeString = useMemo(() => {
    const h = Math.floor(currentHour);
    const m = Math.floor((currentHour - h) * 60);
    const sH = h < 10 ? `0${h}` : `${h}`;
    const sM = m < 10 ? `0${m}` : `${m}`;
    return `${sH}:${sM}`;
  }, [currentHour]);

  const currentPoeticNote = useMemo(() => {
    if (currentHour < 8.0) return currentSpot.timeNotes.dawn;
    if (currentHour < 15.5) return currentSpot.timeNotes.noon;
    if (currentHour < 19.0) return currentSpot.timeNotes.sunset;
    return currentSpot.timeNotes.night;
  }, [currentHour, currentSpot]);

  // 真实物理太阳几何与色温计算
  const solarMetrics = useMemo(() => {
    const phi = (39.9 * Math.PI) / 180;
    const delta = (-17.0 * Math.PI) / 180;
    const omega = ((currentHour - 12.0) * 15.0 * Math.PI) / 180;

    const sinAlt =
      Math.sin(phi) * Math.sin(delta) +
      Math.cos(phi) * Math.cos(delta) * Math.cos(omega);
    const altitudeDeg =
      Math.asin(Math.max(-1, Math.min(1, sinAlt))) * (180 / Math.PI);

    let azimuthDeg = 180;
    const cosAlt = Math.cos((altitudeDeg * Math.PI) / 180);
    if (Math.abs(cosAlt) > 0.01) {
      const cosAz =
        (Math.sin((altitudeDeg * Math.PI) / 180) * Math.sin(phi) - Math.sin(delta)) /
        (cosAlt * Math.cos(phi));
      const azRad = Math.acos(Math.max(-1, Math.min(1, cosAz)));
      azimuthDeg =
        currentHour <= 12
          ? 180 - (azRad * 180) / Math.PI
          : 180 + (azRad * 180) / Math.PI;
    }

    let kelvin = 5400;
    if (altitudeDeg < 0) {
      kelvin = 9200;
    } else if (altitudeDeg < 8) {
      kelvin = 2900;
    } else if (altitudeDeg < 25) {
      kelvin = 4600;
    } else {
      kelvin = 5800;
    }

    const altText = altitudeDeg > 0 ? `${altitudeDeg.toFixed(1)}°` : "地平线下";
    const azDir = azimuthDeg < 135 ? "东偏南" : azimuthDeg < 225 ? "正南" : "西偏南";

    return {
      altitude: altText,
      azimuth: `${Math.round(azimuthDeg)}° (${azDir})`,
      kelvin: `${kelvin}K`,
    };
  }, [currentHour]);

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[#0c0c0e]">
      {/* 顶部极简地标名录切换 */}
      <div className="flex flex-wrap items-center justify-between gap-6 px-8 py-5">
        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          {SCENIC_SPOTS.map((spot) => {
            const isSel = spot.id === currentSpotId;
            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => handleSpotChange(spot.id)}
                className={`terra-btn group flex items-center gap-2 text-[14px] transition ${
                  isSel ? "text-white font-semibold" : "text-white/40 hover:text-white/80"
                }`}
              >
                <span>{spot.nameZh}</span>
                {isSel && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c23b3b]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 text-[14px] tnum text-white/40 hidden lg:flex">
          <span>4D 神经深度场 · 真实太阳向量</span>
          <span>{currentSpot.coordinates}</span>
        </div>
      </div>

      {/* 核心无畸变神经空间光影画布 */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[480px] sm:h-[640px] w-full overflow-hidden select-none cursor-crosshair"
      >
        <canvas ref={canvasRef} className="h-full w-full object-cover" />

        {/* 左上角：地标静穆印章 */}
        <div className="absolute top-8 left-8 z-10 max-w-md pointer-events-none">
          <h2 className="text-[36px] font-bold text-white tracking-tight">
            {currentSpot.nameZh}
          </h2>
          <div className="mt-1 text-[14px] text-white/80">
            {currentSpot.locationZh} · {currentAtmosphere}
            {isLiveSynced && " · 真实时空对齐"}
            {isTimeLapseActive && " · 4D延时流转"}
          </div>
        </div>

        {/* 右下角：4D 时空与日晷控制盘 */}
        <div className="absolute bottom-8 right-8 z-10 flex flex-col items-end gap-3 max-w-[90vw]">
          <div className="text-[14px] text-white/50 tnum hidden sm:block">
            <span>太阳高度 {solarMetrics.altitude} · 方位 {solarMetrics.azimuth} · 色温 {solarMetrics.kelvin}</span>
          </div>

          <div className="flex items-center gap-3 text-[14px] text-white/70">
            {/* 4D 动态控制按钮组 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleLiveSync}
                className={`terra-btn rounded-full px-3.5 py-1 text-[14px] font-medium transition ${
                  isLiveSynced
                    ? "bg-[#c23b3b] text-white"
                    : "bg-[#18181b] text-white/70 hover:text-white"
                }`}
              >
                北京实况
              </button>
              <button
                type="button"
                onClick={toggleTimeLapse}
                className={`terra-btn rounded-full px-3.5 py-1 text-[14px] font-medium transition ${
                  isTimeLapseActive
                    ? "bg-white text-black font-semibold"
                    : "bg-[#18181b] text-white/70 hover:text-white"
                }`}
              >
                {isTimeLapseActive ? "定格时光" : "流转时光"}
              </button>
            </div>

            <div className="flex items-center gap-1.5 ml-2">
              <span>日晷时标</span>
              <span className="font-bold text-white tnum">{timeString}</span>
            </div>
          </div>

          {/* 连续时间拖动轨道 */}
          <div className="flex items-center gap-3 w-64 sm:w-80 rounded-full bg-[#18181b] px-4 py-2">
            <input
              type="range"
              min="5.5"
              max="22.0"
              step="0.1"
              value={currentHour}
              onChange={(e) => handleHourChange(parseFloat(e.target.value))}
              className="w-full accent-[#c23b3b] cursor-pointer"
              aria-label="拖动日晷时间"
            />
          </div>

          {/* 四时快捷锚点 */}
          <div className="flex items-center gap-2 rounded-full bg-[#18181b] p-1.5">
            {TIME_ANCHORS.map((anchor) => {
              const isClose = Math.abs(currentHour - anchor.hour) < 1.2;
              return (
                <button
                  key={anchor.id}
                  type="button"
                  onClick={() => handleHourChange(anchor.hour)}
                  className={`terra-btn rounded-full px-3.5 py-1.5 text-[14px] transition ${
                    isClose
                      ? "bg-white text-black font-semibold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <span>{anchor.label}</span>
                  <span className="ml-1 text-[14px] opacity-70 tnum">
                    {anchor.timeString}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 左下角：该时段的岁月静好沉思 */}
        <div className="absolute bottom-8 left-8 z-10 max-w-xl hidden sm:block pointer-events-none">
          <p className="text-[16px] text-white/90 leading-relaxed m-0">
            {currentPoeticNote}
          </p>
        </div>
      </div>
    </div>
  );
}
