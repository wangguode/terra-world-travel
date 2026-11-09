"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { SCENIC_SPOTS, type ScenicSpot } from "@/lib/beijing-pulse-data";

export type TimeOfDay = "dawn" | "noon" | "sunset" | "night";

interface LightingSetting {
  id: TimeOfDay;
  label: string;
  clockTime: string;
  atmosphereName: string;
  filterStyle: string;
  scrimTone: string;
}

const LIGHTING_SETTINGS: LightingSetting[] = [
  {
    id: "dawn",
    label: "晨曦",
    clockTime: "06:30",
    atmosphereName: "清晨·薄光初露",
    filterStyle: "sepia(0.18) saturate(1.12) brightness(1.02) contrast(1.02)",
    scrimTone: "rgba(255, 200, 150, 0.08)",
  },
  {
    id: "noon",
    label: "晴空",
    clockTime: "12:00",
    atmosphereName: "正午·高天澄澈",
    filterStyle: "contrast(1.05) brightness(1.04) saturate(1.05)",
    scrimTone: "rgba(0, 0, 0, 0.05)",
  },
  {
    id: "sunset",
    label: "金辉",
    clockTime: "17:30",
    atmosphereName: "日落·满城碎金",
    filterStyle:
      "sepia(0.36) saturate(1.28) hue-rotate(-15deg) brightness(0.96) contrast(1.06)",
    scrimTone: "rgba(255, 120, 40, 0.12)",
  },
  {
    id: "night",
    label: "蓝调",
    clockTime: "21:00",
    atmosphereName: "夜幕·静谧子夜",
    filterStyle:
      "brightness(0.72) contrast(1.12) saturate(0.85) hue-rotate(185deg)",
    scrimTone: "rgba(10, 25, 60, 0.25)",
  },
];

interface BeijingSpatialViewerProps {
  selectedSpotId?: string;
  onSelectSpot?: (id: string) => void;
  selectedTime?: TimeOfDay;
  onSelectTime?: (time: TimeOfDay) => void;
}

export function BeijingSpatialWorldModel({
  selectedSpotId: propSpotId,
  onSelectSpot,
  selectedTime: propTime,
  onSelectTime,
}: BeijingSpatialViewerProps) {
  const [internalSpotId, setInternalSpotId] = useState<string>("forbidden-city");
  const [internalTime, setInternalTime] = useState<TimeOfDay>("sunset");

  const currentSpotId = propSpotId ?? internalSpotId;
  const currentTime = propTime ?? internalTime;

  const currentSpot: ScenicSpot = useMemo(() => {
    return SCENIC_SPOTS.find((s) => s.id === currentSpotId) ?? SCENIC_SPOTS[0];
  }, [currentSpotId]);

  const currentLighting: LightingSetting = useMemo(() => {
    return (
      LIGHTING_SETTINGS.find((l) => l.id === currentTime) ?? LIGHTING_SETTINGS[2]
    );
  }, [currentTime]);

  const handleSpotChange = (id: string) => {
    if (onSelectSpot) {
      onSelectSpot(id);
    } else {
      setInternalSpotId(id);
    }
  };

  const handleTimeChange = (time: TimeOfDay) => {
    if (onSelectTime) {
      onSelectTime(time);
    } else {
      setInternalTime(time);
    }
  };

  // 2.5D 平滑视差响应（保真光学透视，杜绝球面拉伸变形）
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [parallaxOffset, setParallaxOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setParallaxOffset({
      x: nx * 14,
      y: ny * 14,
    });
  };

  const handleMouseLeave = () => {
    setParallaxOffset({ x: 0, y: 0 });
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[#0c0c0e]">
      {/* 顶部极简地标名录切换：安静、纯净 */}
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

        <div className="text-[14px] tnum text-white/40 hidden lg:block">
          {currentSpot.coordinates}
        </div>
      </div>

      {/* 核心真实无畸变时空视窗 */}
      <div
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[480px] sm:h-[640px] w-full overflow-hidden select-none cursor-crosshair"
      >
        {/* 背景真实高清画质（保真光学透视，杜绝球面拉伸变形） */}
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0) scale(1.04)`,
          }}
        >
          <Image
            src={currentSpot.image}
            alt={currentSpot.nameZh}
            fill
            sizes="100vw"
            priority
            className="object-cover object-center transition-[filter] duration-700 ease-in-out"
            style={{
              filter: currentLighting.filterStyle,
            }}
          />

          {/* 纯净自然天光氛围微调 */}
          <div
            className="absolute inset-0 transition-opacity duration-700 ease-in-out pointer-events-none"
            style={{
              backgroundColor: currentLighting.scrimTone,
            }}
          />
        </div>

        {/* 左上角：地标宁静印章 */}
        <div className="absolute top-8 left-8 z-10 max-w-md">
          <h2 className="text-[32px] sm:text-[44px] font-bold text-white tracking-tight">
            {currentSpot.nameZh}
          </h2>
          <div className="mt-1 text-[14px] text-white/80">
            {currentSpot.locationZh} · {currentLighting.atmosphereName}
          </div>
        </div>

        {/* 右下角：流转时钟控制（极简触感刻度） */}
        <div className="absolute bottom-8 right-8 z-10 flex flex-col items-end gap-3">
          <div className="text-[14px] text-white/50 tracking-wider">
            光影时序流转
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#18181b] p-1.5">
            {LIGHTING_SETTINGS.map((setting) => {
              const isSel = setting.id === currentTime;
              return (
                <button
                  key={setting.id}
                  type="button"
                  onClick={() => handleTimeChange(setting.id)}
                  className={`terra-btn rounded-full px-4 py-1.5 text-[14px] transition ${
                    isSel
                      ? "bg-white text-black font-semibold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <span>{setting.label}</span>
                  <span className="ml-1 text-[13px] opacity-70 tnum">
                    {setting.clockTime}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 左下角：该时段的一抹静思 */}
        <div className="absolute bottom-8 left-8 z-10 max-w-xl hidden sm:block">
          <p className="text-[16px] text-white/90 leading-relaxed m-0">
            {currentSpot.timeNotes[currentTime]}
          </p>
        </div>
      </div>
    </div>
  );
}
