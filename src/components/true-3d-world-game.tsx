"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import {
  createCliffTexture,
  createCloudSpriteTexture,
  createGlowSpriteTexture,
  createWaterfallTexture,
} from "@/world/textures";
import { createSkyAtmosphere } from "@/world/atmosphere";
import { buildSkySanctuaryWorld } from "@/world/environment";
import { createSkyGlider } from "@/world/glider";
import { SkySoundEngine } from "@/world/audio";

interface True3DWorldGameProps {
  onToggleSpecs?: () => void;
}

export default function True3DWorldGame({ onToggleSpecs }: True3DWorldGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [ready, setReady] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const [isAutopilot, setIsAutopilot] = useState(false);
  const isAutopilotRef = useRef(false);
  useEffect(() => {
    isAutopilotRef.current = isAutopilot;
  }, [isAutopilot]);

  const [isMuted, setIsMuted] = useState(true);
  const soundRef = useRef<SkySoundEngine | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ringsPassed, setRingsPassed] = useState(0);
  const [hudStats, setHudStats] = useState({ alt: 36, spd: 26, fps: 60 });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      queueMicrotask(() => setRenderError(true));
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      56,
      container.clientWidth / container.clientHeight,
      0.5,
      2000
    );

    // 1. 电影级黄金暮色苍穹与三点布光
    const atmosphere = createSkyAtmosphere(scene);

    // 2. 100% 程序化材质与《云海浮空仙刹》世界
    const cliffTex = createCliffTexture();
    const cloudTex = createCloudSpriteTexture();
    const waterfallTex = createWaterfallTexture();
    const glowTex = createGlowSpriteTexture();

    const world = buildSkySanctuaryWorld(cliffTex, cloudTex, waterfallTex, glowTex);
    scene.add(world.group);

    // 3. 东方灵韵滑翔飞行器
    const glider = createSkyGlider(glowTex);
    scene.add(glider.group);
    scene.add(glider.trailMesh);

    // 4. 克制的电影级辉光后期管线（仅点亮瀑布、金顶、银杏、灵气环与尾焰）
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.42,
      0.55,
      0.78
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // 5. 纯 Web Audio 声学引擎
    const sound = new SkySoundEngine();
    soundRef.current = sound;

    // 飞行动力学状态（出生在主浮空仙岛南侧云端，正对七层金顶古塔与第 1 道灵气环）
    const flight = {
      pos: new THREE.Vector3(0, 36, 128),
      yaw: 0,
      pitch: -0.04,
      roll: 0,
      speed: 24,
      boostTimer: 0,
      camOrbitYaw: 0,
      camOrbitPitch: 0,
    };

    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (k === "c") {
        setIsAutopilot((prev) => !prev);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      delete keys[e.key.toLowerCase()];
    };
    const onBlur = () => {
      for (const k of Object.keys(keys)) delete keys[k];
    };

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button, a")) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      flight.camOrbitYaw -= (e.clientX - lastX) * 0.004;
      flight.camOrbitPitch = Math.max(-0.45, Math.min(0.45, flight.camOrbitPitch + (e.clientY - lastY) * 0.003));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onPointerUp = () => {
      dragging = false;
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", onResize);
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    queueMicrotask(() => setReady(true));

    let animId = 0;
    let elapsed = 0;
    let lastTime = performance.now();
    let fpsFrames = 0;
    let fpsAcc = 0;
    let measuredFps = 60;
    let passedCount = 0;

    const camTargetPos = new THREE.Vector3();
    const camLookTarget = new THREE.Vector3();
    const tailWorldPos = new THREE.Vector3();

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += dt;

      fpsFrames++;
      fpsAcc += dt;
      if (fpsAcc >= 0.5) {
        measuredFps = Math.round(fpsFrames / fpsAcc);
        fpsFrames = 0;
        fpsAcc = 0;
        setHudStats({
          alt: Math.round(flight.pos.y + 80),
          spd: Math.round(flight.speed * 3.6),
          fps: measuredFps,
        });
      }

      world.update(dt, elapsed);

      const boosting = !!keys["shift"] || flight.boostTimer > 0;
      if (flight.boostTimer > 0) flight.boostTimer = Math.max(0, flight.boostTimer - dt);

      if (isAutopilotRef.current) {
        // 电影级自动巡航：沿主塔与浮空瀑布大环线优雅盘旋
        const orbitR = 108;
        const a = elapsed * 0.22;
        const nextX = Math.sin(a) * orbitR;
        const nextZ = Math.cos(a) * orbitR;
        const nextY = 38 + Math.sin(a * 2.0) * 14;
        flight.yaw = Math.atan2(flight.pos.x - nextX, flight.pos.z - nextZ);
        flight.pitch = Math.cos(a * 2.0) * 0.14;
        flight.roll = -0.32;
        flight.pos.set(nextX, nextY, nextZ);
        flight.speed = 32;
      } else {
        const turnInput = (keys["a"] || keys["arrowleft"] ? 1 : 0) - (keys["d"] || keys["arrowright"] ? 1 : 0);
        const pitchInput = (keys["s"] || keys["arrowdown"] ? 1 : 0) - (keys["w"] || keys["arrowup"] ? 1 : 0);
        const climbInput = keys[" "] || keys["space"] ? 1 : 0;

        flight.yaw += turnInput * 1.45 * dt;
        const targetPitch = Math.max(-0.55, Math.min(0.55, flight.pitch + (pitchInput * 1.15 + climbInput * 0.7) * dt));
        flight.pitch = targetPitch * (1 - dt * 0.65); // 自然回正
        const targetRoll = turnInput * 0.58;
        flight.roll += (targetRoll - flight.roll) * Math.min(1, dt * 6);

        const targetSpeed = boosting ? 54 : 26;
        flight.speed += (targetSpeed - flight.speed) * Math.min(1, dt * 4);

        const forward = new THREE.Vector3(
          -Math.sin(flight.yaw) * Math.cos(flight.pitch),
          Math.sin(flight.pitch),
          -Math.cos(flight.yaw) * Math.cos(flight.pitch)
        );
        flight.pos.addScaledVector(forward, flight.speed * dt);

        // 柔和边界回归与云海最低高度保护
        flight.pos.y = Math.max(-35, Math.min(175, flight.pos.y));
        const distFromCenter = Math.hypot(flight.pos.x, flight.pos.z);
        if (distFromCenter > 360) {
          const pull = (360 / distFromCenter);
          flight.pos.x *= pull;
          flight.pos.z *= pull;
        }
      }

      // 更新飞行器姿态与发光尾迹
      glider.group.position.copy(flight.pos);
      glider.group.rotation.order = "YXZ";
      glider.group.rotation.set(flight.pitch, flight.yaw, flight.roll);

      tailWorldPos.set(0, 0, 1.9).applyMatrix4(glider.group.matrixWorld);
      glider.updateTrail(tailWorldPos, boosting);

      // 动态 FOV 速度感
      const targetFov = boosting ? 67 : 56;
      if (Math.abs(camera.fov - targetFov) > 0.05) {
        camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 5);
        camera.updateProjectionMatrix();
      }

      // 丝滑弹簧追尾相机（支持鼠标拖拽临时环视）
      if (!dragging) {
        flight.camOrbitYaw *= Math.pow(0.92, dt * 60);
        flight.camOrbitPitch *= Math.pow(0.92, dt * 60);
      }
      const camYaw = flight.yaw + flight.camOrbitYaw;
      const camDist = boosting ? 14.5 : 12.2;
      camTargetPos.set(
        flight.pos.x + Math.sin(camYaw) * camDist,
        flight.pos.y + 3.4 + flight.camOrbitPitch * 8,
        flight.pos.z + Math.cos(camYaw) * camDist
      );
      camera.position.lerp(camTargetPos, Math.min(1, dt * 6.5));
      camLookTarget.set(
        flight.pos.x - Math.sin(flight.yaw) * 18,
        flight.pos.y + 1.2 + Math.sin(flight.pitch) * 10,
        flight.pos.z - Math.cos(flight.yaw) * 18
      );
      camera.lookAt(camLookTarget);

      // 检测穿过灵气光环
      world.rings.forEach((ring, idx) => {
        if (!ring.passed && flight.pos.distanceTo(ring.position) < 12.5) {
          ring.passed = true;
          passedCount++;
          setRingsPassed(passedCount);
          flight.boostTimer = 1.6;
          const mat = ring.mesh.material as THREE.MeshStandardMaterial;
          mat.color.setHex(0x63f5b8);
          mat.emissive.setHex(0x10b981);
          sound.playRingChime(idx);
          setToast(`穿过灵气光环 (${passedCount}/${world.rings.length}) · 灵风加速`);
          setTimeout(() => setToast(null), 1800);
        }
      });

      sound.updateFlightSpeed((flight.speed - 20) / 34);
      composer.render();
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      sound.dispose();
      atmosphere.dispose();
      cliffTex.dispose();
      cloudTex.dispose();
      waterfallTex.dispose();
      glowTex.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundRef.current?.setMuted(next);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100dvh-48px)] min-h-[580px] w-full overflow-hidden select-none bg-[#0e1c3a] font-sans"
    >
      <canvas ref={canvasRef} className="h-full w-full cursor-grab active:cursor-grabbing touch-none block" />

      {renderError && (
        <div role="alert" className="absolute inset-0 z-50 flex items-center justify-center bg-[#0e1c3a] p-8 text-center text-white">
          <p>无法启动 WebGL 3D 渲染器，请启用浏览器硬件加速后重试。</p>
        </div>
      )}

      {/* 左上角：极简克制标题与遥测 */}
      <div
        role="status"
        className="pointer-events-none absolute top-3 left-3 sm:top-4 sm:left-4 z-20 rounded-2xl border border-white/15 bg-slate-950/55 px-3 py-2 sm:px-4 sm:py-2.5 text-white backdrop-blur-md"
      >
        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium tracking-widest text-amber-300/90 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>{ready ? "TERRA-OASIS · 云海浮空仙刹" : "正在构建云海世界…"}</span>
        </div>
        <div className="mt-1 hidden sm:flex items-center gap-3 text-[12px] text-white/75 tabular-nums">
          <span>ALT {hudStats.alt}m</span>
          <span>SPD {hudStats.spd} km/h</span>
          <span className="text-emerald-400">{hudStats.fps} FPS</span>
        </div>
      </div>

      {/* 右上角：精简功能胶囊 + 光环计数（移动端下移避免与左上角重叠） */}
      <div className="absolute top-14 left-3 sm:left-auto sm:top-4 sm:right-4 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2">
        <div className="rounded-full border border-amber-300/30 bg-slate-950/60 px-3 py-1.5 text-[12px] font-medium text-amber-200 backdrop-blur-md tabular-nums">
          灵环 {ringsPassed}/7
        </div>
        <button
          type="button"
          onClick={() => setIsAutopilot((v) => !v)}
          className={`rounded-full border px-3 py-1.5 text-[12px] font-medium backdrop-blur-md transition cursor-pointer ${
            isAutopilot
              ? "border-amber-400 bg-amber-400 text-slate-950"
              : "border-white/20 bg-slate-950/60 text-white hover:bg-slate-900/80"
          }`}
        >
          {isAutopilot ? "电影巡航中" : "电影巡航"}
        </button>
        <button
          type="button"
          onClick={toggleSound}
          className="rounded-full border border-white/20 bg-slate-950/60 px-3 py-1.5 text-[12px] text-white backdrop-blur-md hover:bg-slate-900/80 transition cursor-pointer"
        >
          {isMuted ? "音效关" : "音效开"}
        </button>
        {onToggleSpecs && (
          <button
            type="button"
            onClick={onToggleSpecs}
            className="hidden sm:inline-flex rounded-full border border-white/20 bg-slate-950/60 px-3 py-1.5 text-[12px] text-white backdrop-blur-md hover:bg-slate-900/80 transition cursor-pointer"
          >
            世界模型文献
          </button>
        )}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded-full border border-white/20 bg-slate-950/60 px-3 py-1.5 text-[12px] text-white backdrop-blur-md hover:bg-slate-900/80 transition cursor-pointer"
        >
          {isFullscreen ? "退出" : "全屏"}
        </button>
      </div>

      {/* 穿过光环极简提示 */}
      {toast && (
        <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 z-30 rounded-full border border-amber-300/40 bg-slate-950/75 px-4 py-1.5 text-sm font-medium text-amber-200 backdrop-blur-md shadow-lg">
          {toast}
        </div>
      )}

      {/* 底部居中：极简一行操作提示 */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-full border border-white/15 bg-slate-950/50 px-4 py-1.5 text-[11px] sm:text-[12px] text-white/80 backdrop-blur-md">
        W/S 俯仰 · A/D 转向 · Space 爬升 · Shift 灵气加速 · C 巡航 · 鼠标拖拽环视
      </div>
    </div>
  );
}
