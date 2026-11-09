"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { WorldModelScene } from "@/lib/corridors-data";

interface WorldModelViewportProps {
  scenes: WorldModelScene[];
  destinationCity: string;
}

interface SplatCameraPose {
  pos: [number, number, number];
  lookAt: [number, number, number];
  title: string;
  advice: string;
}

const SPLAT_WAYPOINTS: SplatCameraPose[] = [
  {
    pos: [-3.0, 0.1, 3.75],
    lookAt: [0, 0, 0],
    title: "第一站 · 月台落客点与车头方向辨认",
    advice: "下车后先在月台立柱旁停三秒，核对车厢朝向与出站扶梯指示牌，切勿盲目跟着人群反方向出闸。",
  },
  {
    pos: [-5.0, 0.5, 1.0],
    lookAt: [1.0, 0, -1.0],
    title: "第二站 · 沿站台中段走廊向前",
    advice: "避开列车门正对的拥挤队列，从外侧宽敞步道快步走向换乘连廊，节省约 10 分钟排队时间。",
  },
  {
    pos: [-4.5, 0.4, -1.5],
    lookAt: [0, 0, -5.0],
    title: "第三站 · 抵达出站走廊与刷卡点",
    advice: "提前在手机钱包调出交通卡或准备好 IC 卡，经过宽通道无障碍闸机直接推行李出站。",
  },
];

function computeSolarTint(hour: number): {
  r: number;
  g: number;
  b: number;
  elevation: number;
  kelvin: number;
  cssFilter: string;
  label: string;
  advice: string;
} {
  if (hour < 8.5) {
    return {
      r: 0.92,
      g: 0.95,
      b: 1.08,
      elevation: Math.round(8 + (hour - 6) * 8),
      kelvin: 4300,
      cssFilter: "brightness(0.92) contrast(1.06) saturate(1.08)",
      label: "清晨柔光",
      advice: "空气通透、旅行团尚未入场，侧顺光下建筑立面细节清楚，是最从容的拍照与通关时段。",
    };
  }
  if (hour < 16.0) {
    return {
      r: 1.0,
      g: 1.0,
      b: 1.0,
      elevation: Math.round(64 - Math.abs(hour - 12.5) * 6),
      kelvin: 6000,
      cssFilter: "brightness(1.04) contrast(1.08)",
      label: "正午顶光",
      advice: "日照充足、视野最远，但户外反差较大，建议优先安排室内展馆、地下换乘或买手店街区。",
    };
  }
  if (hour < 19.0) {
    return {
      r: 1.12,
      g: 0.92,
      b: 0.76,
      elevation: Math.max(3, Math.round(22 - (hour - 16) * 6)),
      kelvin: 3100,
      cssFilter: "brightness(0.96) contrast(1.16) saturate(1.26) sepia(0.18)",
      label: "日落金辉",
      advice: "夕阳低角度漫射，宫殿飞檐、河岸佛塔与街区红砖墙呈现暖金色轮廓光，是全天最佳出片时刻。",
    };
  }
  return {
    r: 0.72,
    g: 0.82,
    b: 1.12,
    elevation: -8,
    kelvin: 7800,
    cssFilter: "brightness(0.68) contrast(1.22) saturate(1.18)",
    label: "夜间蓝调",
    advice: "夜景灯光亮起，请留意机场快线末班车时间，提前保存好全屏双语司机卡以备夜间打车返程。",
  };
}

function formatClock(val: number): string {
  const h = Math.floor(val);
  const m = Math.round((val - h) * 60);
  const mm = m === 0 ? "00" : m < 10 ? `0${m}` : String(m);
  return `${h}:${mm}`;
}

export function WorldModelViewport({
  scenes,
  destinationCity,
}: WorldModelViewportProps) {
  const [viewSource, setViewSource] = useState<"splat3d" | "landmark">("splat3d");
  const [selectedSceneIdx, setSelectedSceneIdx] = useState(0);
  const activeScene = scenes[selectedSceneIdx] ?? scenes[0];

  const [stepIdx, setStepIdx] = useState(0);
  const [autoWalk, setAutoWalk] = useState(false);
  const [hour, setHour] = useState<number>(17.5);
  const [splatStatus, setSplatStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [splatCount, setSplatCount] = useState<number>(500000);
  const [yawDeg, setYawDeg] = useState<number>(0);
  const [pitchDeg, setPitchDeg] = useState<number>(0);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const poseTargetRef = useRef<{
    pos: [number, number, number];
    lookAt: [number, number, number];
    yawOffset: number;
    pitchOffset: number;
  }>({
    pos: [...SPLAT_WAYPOINTS[0].pos],
    lookAt: [...SPLAT_WAYPOINTS[0].lookAt],
    yawOffset: 0,
    pitchOffset: 0,
  });
  const solarRef = useRef(computeSolarTint(17.5));
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, yaw: 0, pitch: 0 });

  const solar = useMemo(() => computeSolarTint(hour), [hour]);

  useEffect(() => {
    solarRef.current = solar;
  }, [solar]);

  const jumpToStep = (idx: number) => {
    const wp = SPLAT_WAYPOINTS[idx] ?? SPLAT_WAYPOINTS[0];
    setStepIdx(idx);
    poseTargetRef.current = {
      pos: [...wp.pos],
      lookAt: [...wp.lookAt],
      yawOffset: 0,
      pitchOffset: 0,
    };
    setYawDeg(0);
    setPitchDeg(0);
  };

  useEffect(() => {
    if (!autoWalk) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => {
        const next = (prev + 1) % SPLAT_WAYPOINTS.length;
        const wp = SPLAT_WAYPOINTS[next];
        if (wp) {
          poseTargetRef.current = {
            pos: [...wp.pos],
            lookAt: [...wp.lookAt],
            yawOffset: 0,
            pitchOffset: 0,
          };
        }
        return next;
      });
    }, 3400);
    return () => window.clearInterval(timer);
  }, [autoWalk]);

  useEffect(() => {
    let disposed = false;
    let stopLoop = () => {};

    (async () => {
      try {
        const THREE = await import("three");
        const { SparkRenderer, SplatMesh } = await import("@sparkjsdev/spark");
        const host = hostRef.current;
        if (!host || disposed) return;

        const width = Math.max(320, host.clientWidth);
        const height = Math.max(260, host.clientHeight);

        const renderer = new THREE.WebGLRenderer({
          antialias: false,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height);
        host.innerHTML = "";
        host.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(58, width / height, 0.05, 800);
        const spark = new SparkRenderer({ renderer });
        scene.add(spark);

        const mesh = new SplatMesh({ url: "/splats/transit-platform.splat" });
        mesh.quaternion.set(1, 0, 0, 0);
        scene.add(mesh);

        const curPos = new THREE.Vector3(...SPLAT_WAYPOINTS[0].pos);
        const curLook = new THREE.Vector3(...SPLAT_WAYPOINTS[0].lookAt);
        camera.position.copy(curPos);
        camera.lookAt(curLook);

        const onResize = () => {
          if (!host || disposed) return;
          const nw = Math.max(320, host.clientWidth);
          const nh = Math.max(260, host.clientHeight);
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        };
        window.addEventListener("resize", onResize);

        await mesh.initialized;
        if (disposed) {
          window.removeEventListener("resize", onResize);
          renderer.dispose();
          return;
        }

        setSplatCount(mesh.numSplats || 500000);
        setSplatStatus("ready");

        let frame = 0;
        renderer.setAnimationLoop(() => {
          frame += 1;
          const tgt = poseTargetRef.current;
          const targetPosVec = new THREE.Vector3(
            tgt.pos[0],
            tgt.pos[1],
            tgt.pos[2]
          );

          const baseDx = tgt.lookAt[0] - tgt.pos[0];
          const baseDy = tgt.lookAt[1] - tgt.pos[1];
          const baseDz = tgt.lookAt[2] - tgt.pos[2];
          const yawRad = (tgt.yawOffset * Math.PI) / 180;
          const pitchRad = (tgt.pitchOffset * Math.PI) / 180;
          const cosY = Math.cos(yawRad);
          const sinY = Math.sin(yawRad);
          const rotX = baseDx * cosY - baseDz * sinY;
          const rotZ = baseDx * sinY + baseDz * cosY;
          const rotY = baseDy + Math.tan(pitchRad) * 2.2;

          const targetLookVec = new THREE.Vector3(
            tgt.pos[0] + rotX,
            tgt.pos[1] + rotY,
            tgt.pos[2] + rotZ
          );

          curPos.lerp(targetPosVec, 0.08);
          curLook.lerp(targetLookVec, 0.12);
          camera.position.copy(curPos);
          camera.lookAt(curLook);

          const s = solarRef.current;
          mesh.recolor.setRGB(s.r, s.g, s.b);

          if (frame % 10 === 0) {
            setYawDeg(Math.round(tgt.yawOffset));
            setPitchDeg(Math.round(tgt.pitchOffset));
          }

          renderer.render(scene, camera);
        });

        stopLoop = () => {
          window.removeEventListener("resize", onResize);
          renderer.setAnimationLoop(null);
          renderer.dispose();
        };
      } catch {
        if (!disposed) {
          setSplatStatus("fallback");
        }
      }
    })();

    return () => {
      disposed = true;
      stopLoop();
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: poseTargetRef.current.yawOffset,
      pitch: poseTargetRef.current.pitchOffset,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    poseTargetRef.current.yawOffset = Math.max(
      -55,
      Math.min(55, dragStartRef.current.yaw + dx * 0.22)
    );
    poseTargetRef.current.pitchOffset = Math.max(
      -25,
      Math.min(25, dragStartRef.current.pitch - dy * 0.16)
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    isDraggingRef.current = false;
  };

  const currentWaypoint = SPLAT_WAYPOINTS[stepIdx] ?? SPLAT_WAYPOINTS[0];
  const cityWaypoints = activeScene.trajectoryWaypoints ?? [];

  return (
    <div className="rounded-2xl bg-[#141418] p-5 sm:p-7">
      {/* 顶栏：模式切换与实时状态 */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setViewSource("splat3d")}
            className={`terra-btn rounded-full px-5 py-2 text-[18px] font-semibold ${
              viewSource === "splat3d"
                ? "bg-[#ff6b3d] text-[#0a0a0c]"
                : "bg-[#1e1e24] text-[#f5f5f7]"
            }`}
          >
            3D 高斯实景扫描舱 (50万体素)
          </button>
          <button
            type="button"
            onClick={() => setViewSource("landmark")}
            className={`terra-btn rounded-full px-5 py-2 text-[18px] font-semibold ${
              viewSource === "landmark"
                ? "bg-[#ff6b3d] text-[#0a0a0c]"
                : "bg-[#1e1e24] text-[#f5f5f7]"
            }`}
          >
            {destinationCity} 地标动线预演
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[18px] text-[#f5f5f7] tnum">
          <span>
            World Labs Spark ({splatCount.toLocaleString()} 高斯点)
          </span>
          <span>
            偏航 {yawDeg}° / 俯仰 {pitchDeg}°
          </span>
        </div>
      </div>

      {/* 3D 视窗主体 */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative h-[440px] sm:h-[540px] w-full cursor-grab overflow-hidden rounded-xl bg-[#0a0a0c] select-none touch-none active:cursor-grabbing"
      >
        <div
          ref={hostRef}
          className={`absolute inset-0 h-full w-full ${
            viewSource === "splat3d" && splatStatus === "ready"
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        />

        {viewSource === "splat3d" && splatStatus !== "ready" && (
          <img
            src="/splats/transit-platform-poster.jpg"
            alt="交通枢纽站台三维高斯泼溅实景扫描"
            width={1280}
            height={720}
            style={{ filter: solar.cssFilter }}
            className="h-full w-full object-cover"
          />
        )}

        {viewSource === "landmark" && (
          <img
            src={activeScene.image}
            alt={activeScene.name}
            width={1280}
            height={720}
            style={{
              filter: solar.cssFilter,
              transform: `scale(1.06) translate3d(${(-yawDeg * 0.35).toFixed(1)}px, ${(-pitchDeg * 0.25).toFixed(1)}px, 0)`,
            }}
            className="h-full w-full object-cover"
          />
        )}

        {/* 左上角状态角标 */}
        <div className="pointer-events-none absolute top-4 left-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#0a0a0c] px-4 py-1.5 text-[18px] font-medium text-[#f5f5f7] tnum">
            {viewSource === "splat3d"
              ? splatStatus === "ready"
                ? "实时 3DGS 渲染 · 按住画面拖动可 360° 环顾"
                : "正在加载 500,000 个三维高斯基元..."
              : `${activeScene.name} · ${activeScene.coordinates}`}
          </span>
          <span className="rounded-full bg-[#0a0a0c] px-4 py-1.5 text-[18px] text-[#f5f5f7] tnum">
            {formatClock(hour)} {solar.label} ({solar.kelvin}K)
          </span>
        </div>

        {/* 底部动线控制面板 */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute inset-x-4 bottom-4 rounded-xl bg-[#0a0a0c]/95 p-4 text-[#f5f5f7]"
        >
          {viewSource === "splat3d" ? (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="m-0 text-[18px] font-semibold">
                  {currentWaypoint.title}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {SPLAT_WAYPOINTS.map((wp, idx) => (
                    <button
                      key={wp.title}
                      type="button"
                      onClick={() => {
                        setAutoWalk(false);
                        jumpToStep(idx);
                      }}
                      className={`terra-btn rounded-full px-3.5 py-1 text-[18px] font-semibold tnum ${
                        stepIdx === idx
                          ? "bg-[#ff6b3d] text-[#0a0a0c]"
                          : "bg-[#1e1e24] text-[#f5f5f7]"
                      }`}
                    >
                      节点 {idx + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAutoWalk((v) => !v)}
                    className={`terra-btn rounded-full px-4 py-1 text-[18px] font-semibold ${
                      autoWalk
                        ? "bg-white text-[#0a0a0c]"
                        : "bg-[#1e1e24] text-[#f5f5f7]"
                    }`}
                  >
                    {autoWalk ? "暂停漫游" : "自动走一遍"}
                  </button>
                </div>
              </div>
              <p className="m-0 max-w-[60ch] text-[18px] text-[#d4d4dc]">
                {currentWaypoint.advice}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="m-0 text-[18px] font-semibold">
                  {activeScene.name} · {cityWaypoints[stepIdx]?.title ?? activeScene.elevation}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {scenes.map((sc, idx) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => {
                        setSelectedSceneIdx(idx);
                        setStepIdx(0);
                      }}
                      className={`terra-btn rounded-full px-3.5 py-1 text-[18px] font-semibold ${
                        selectedSceneIdx === idx
                          ? "bg-[#ff6b3d] text-[#0a0a0c]"
                          : "bg-[#1e1e24] text-[#f5f5f7]"
                      }`}
                    >
                      {sc.name}
                    </button>
                  ))}
                </div>
              </div>
              <p className="m-0 max-w-[60ch] text-[18px] text-[#d4d4dc]">
                {cityWaypoints[stepIdx]?.hint ?? activeScene.spatialSummary}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 下方：24小时时段光照推演条 + 贴心避坑提示 */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="terra-hour-slider" className="text-[18px] font-semibold text-[#f5f5f7]">
              拖动时间看光照变化：{formatClock(hour)} ({solar.label} · 仰角 {solar.elevation}°)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "清晨 07:00", val: 7.0 },
                { label: "正午 12:30", val: 12.5 },
                { label: "日落 17:30", val: 17.5 },
                { label: "夜间 20:30", val: 20.5 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setHour(preset.val)}
                  className={`terra-btn rounded-full px-3 py-1 text-[18px] font-semibold tnum ${
                    Math.abs(hour - preset.val) < 0.3
                      ? "bg-[#ff6b3d] text-[#0a0a0c]"
                      : "bg-[#1e1e24] text-[#f5f5f7]"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <input
            id="terra-hour-slider"
            type="range"
            min="6.0"
            max="22.0"
            step="0.25"
            value={hour}
            onChange={(e) => setHour(parseFloat(e.target.value))}
            aria-label="时段光照推演滑块"
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#0a0a0c] accent-[#ff6b3d]"
          />
          <p className="mt-2 mb-0 max-w-[60ch] text-[18px] text-[#d4d4dc]">
            {solar.advice}
          </p>
        </div>

        <div className="lg:col-span-5">
          <p className="m-0 text-[18px] font-semibold text-[#f5f5f7]">
            {activeScene.name} · 预约与最佳时段提醒
          </p>
          <p className="mt-1 mb-0 max-w-[56ch] text-[18px] text-[#d4d4dc]">
            最佳时段：{activeScene.bestTime}
          </p>
          <p className="mt-1 mb-0 max-w-[56ch] text-[18px] text-[#f5f5f7]">
            贴心提醒：{activeScene.bookingRule}
          </p>
        </div>
      </div>
    </div>
  );
}
