"use client";

import React, { useState } from "react";
import {
  CORRIDORS,
  type CorridorId,
  type DriverCard,
} from "@/lib/corridors-data";
import { WorldModelViewport } from "@/components/world-model-viewport";
import beijingAttractions from "@/lib/beijing-pulse-attractions.json";

interface AiStep {
  timeSlot: string;
  phase: string;
  action: string;
  localAppTip: string;
  driverPhrase: string;
}

type StudioLayout = "app-studio" | "dual-phone" | "pc-wide";
type MobileTab = "today" | "world3d" | "taxi" | "apps" | "ai-pro";

// Crisp SF Symbol-style SVG Icons (zero emoji clutter)
function IconToday({ active }: { active: boolean }) {
  return (
    <svg
      className="h-[22px] w-[22px]"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={active ? "2" : "1.75"}
    >
      <rect x="4" y="3" width="16" height="18" rx="3.5" />
      <path
        d="M8 8h8M8 12h8M8 16h5"
        stroke={active ? "#ffffff" : "currentColor"}
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSpatial({ active }: { active: boolean }) {
  return (
    <svg
      className="h-[22px] w-[22px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? "2.1" : "1.75"}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3L4 7.5v9L12 21l8-4.5v-9L12 3z" />
      <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
    </svg>
  );
}

function IconWalletPass({ active }: { active: boolean }) {
  return (
    <svg
      className="h-[22px] w-[22px]"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path
        d="M3 10h18"
        stroke={active ? "#ffffff" : "currentColor"}
        strokeWidth="1.75"
      />
    </svg>
  );
}

function IconAppsGrid({ active }: { active: boolean }) {
  return (
    <svg
      className="h-[22px] w-[22px]"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </svg>
  );
}

function IconSparkle({ active }: { active: boolean }) {
  return (
    <svg
      className="h-[22px] w-[22px]"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l2.2 6.3L20.5 11.5l-6.3 2.2L12 20l-2.2-6.3L3.5 11.5l6.3-2.2L12 3z" />
    </svg>
  );
}

function IconSpeakerWave() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

// Custom iOS Squircle App Icon generator for Local Champion Apps
function renderAppSquircleIcon(appName: string, index: number) {
  if (appName.includes("Naver Map")) {
    return (
      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[14px] bg-[#03C75A] text-lg font-black text-white shadow-xs">
        N
      </div>
    );
  }
  if (appName.includes("Kakao")) {
    return (
      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[14px] bg-[#FAE100] text-lg font-black text-[#371D1E] shadow-xs">
        T
      </div>
    );
  }
  if (appName.includes("CatchTable")) {
    return (
      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[14px] bg-[#FF3D00] text-lg font-black text-white shadow-xs">
        C
      </div>
    );
  }
  if (appName.includes("Papago")) {
    return (
      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[14px] bg-[#00A8FF] text-lg font-black text-white shadow-xs">
        P
      </div>
    );
  }
  if (appName.includes("高德") || appName.includes("Apple")) {
    return (
      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[14px] bg-[#007AFF] text-base font-black text-white shadow-xs">
        导
      </div>
    );
  }
  if (appName.includes("滴滴") || appName.includes("支付宝")) {
    return (
      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[14px] bg-[#FF6600] text-base font-black text-white shadow-xs">
        滴
      </div>
    );
  }
  const colors = ["bg-[#007AFF]", "bg-[#34C759]", "bg-[#5856D6]", "bg-[#FF9500]"];
  return (
    <div
      className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-[14px] ${
        colors[index % colors.length]
      } text-base font-bold text-white shadow-xs`}
    >
      {appName.slice(0, 1)}
    </div>
  );
}

export function TerraTravelWorkbench() {
  const [corridorId, setCorridorId] = useState<CorridorId>("cn-to-seoul");
  const corridor = CORRIDORS[corridorId];

  const [studioLayout, setStudioLayout] = useState<StudioLayout>("app-studio");
  const [activeTab, setActiveTab] = useState<MobileTab>("today");

  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    "cn-to-seoul-0": true,
    "global-to-beijing-0": true,
  });
  const [expandedAppIdx, setExpandedAppIdx] = useState<number | null>(0);

  const [krwInput, setKrwInput] = useState<string>("15000");
  const [usdInput, setUsdInput] = useState<string>("50");

  const [speakingCardId, setSpeakingCardId] = useState<string | null>(null);
  const [fullscreenDriverCard, setFullscreenDriverCard] =
    useState<DriverCard | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isProUnlocked, setIsProUnlocked] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<
    "single" | "annual" | "lifetime"
  >("lifetime");
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const [arrivalTime, setArrivalTime] = useState("14:30");
  const [days, setDays] = useState(4);
  const [hotelArea, setHotelArea] = useState("弘大入口 / 延南洞");
  const [travelerStyle, setTravelerStyle] = useState(
    "首次赴韩 · 景福宫韩服与圣水洞探店"
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  const [aiSteps, setAiSteps] = useState<AiStep[]>([]);

  const handleSwitchCorridor = (nextId: CorridorId) => {
    setCorridorId(nextId);
    setAiSteps([]);
    setAiSummary(null);
    if (nextId === "cn-to-seoul") {
      setHotelArea("弘大入口 / 延南洞");
      setTravelerStyle("首次赴韩 · 景福宫韩服与圣水洞探店");
    } else {
      setHotelArea("东城王府井 / 什刹海");
      setTravelerStyle("首次抵京 · 故宫中轴线与胡同铜锅涮肉");
    }
  };

  const toggleTimelineStep = (idx: number) => {
    const key = `${corridorId}-${idx}`;
    setCompletedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = corridor.timeline.filter(
    (_, idx) => completedSteps[`${corridorId}-${idx}`]
  ).length;

  const handleSpeakDriverCard = (card: DriverCard) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(card.localHeadline);
    utterance.lang = corridorId === "cn-to-seoul" ? "ko-KR" : "zh-CN";
    utterance.rate = 0.92;
    setSpeakingCardId(card.id);
    utterance.onend = () => setSpeakingCardId(null);
    utterance.onerror = () => setSpeakingCardId(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyPhrase = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  const handleGenerateAiPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const res = await fetch("/api/survival-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corridorId,
          arrivalTime,
          days,
          hotelArea,
          travelerStyle,
        }),
      });
      const data = (await res.json()) as {
        summary?: string;
        provider?: string;
        steps?: AiStep[];
      };
      setAiSummary(data.summary ?? null);
      setAiProvider(data.provider ?? "qwen-plus");
      setAiSteps(Array.isArray(data.steps) ? data.steps : []);
    } catch {
      setAiSummary("已切换至本地离线生存引擎生成方案。");
    } finally {
      setAiLoading(false);
    }
  };

  // Authentic Apple App Store (iOS 18 HIG) Screen
  const renderMobileAppScreen = (osVariant: "ios" | "android" = "ios") => {
    const isSeoul = corridorId === "cn-to-seoul";
    const cnyFromKrw = ((Number(krwInput) || 0) * 0.0053).toFixed(1);
    const cnyFromUsd = ((Number(usdInput) || 0) * 7.22).toFixed(1);

    const tabTitles: Record<MobileTab, { kicker: string; title: string }> = {
      today: {
        kicker: isSeoul ? "FIRST TOUCHDOWN · 首尔仁川" : "FIRST TOUCHDOWN · 北京皇城",
        title: "Today",
      },
      world3d: {
        kicker: "APPLE MAPS FLYOVER · 空间预演",
        title: "实景 3D",
      },
      taxi: {
        kicker: "PASSBOOK · 离线双语语音卡",
        title: "打车卡",
      },
      apps: {
        kicker: "ESSENTIALS · 本土国民级软件",
        title: "必备应用",
      },
      "ai-pro": {
        kicker: "INTELLIGENCE · 私人行程与离线包",
        title: "专属定制",
      },
    };

    const currentHeader = tabTitles[activeTab];

    return (
      <div className="relative flex h-full w-full flex-col bg-[#F2F2F7] text-[#1D1D1F] select-none">
        {/* iOS Status Bar + Minimal Dynamic Island */}
        <div className="shrink-0 bg-[#F2F2F7]/90 px-6 pt-3 pb-2 backdrop-blur-xl">
          <div className="flex items-center justify-between text-[12px] font-semibold tracking-tight text-[#1D1D1F]">
            <span>9:41</span>
            {osVariant === "ios" ? (
              <div className="flex h-[24px] w-[108px] items-center justify-between rounded-full bg-black px-3 text-[10px] font-medium text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34C759]" />
                <span>{isSeoul ? "ICN T2" : "PKX"}</span>
              </div>
            ) : (
              <div className="h-3 w-3 rounded-full bg-black/80" />
            )}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              <span>5G</span>
              <div className="flex h-3 w-5 items-center rounded-[3px] border border-[#1D1D1F]/40 p-0.5">
                <div className="h-full w-full rounded-[1.5px] bg-[#1D1D1F]" />
              </div>
            </div>
          </div>

          {/* Apple App Store Large Title Bar + Segmented City Switcher */}
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <div className="text-[11px] font-semibold tracking-wider text-[#86868B] uppercase">
                {currentHeader.kicker}
              </div>
              <h1 className="text-[30px] leading-[1.1] font-bold tracking-tight text-[#1D1D1F]">
                {currentHeader.title}
              </h1>
            </div>

            {/* iOS Standard UISegmentedControl for Seoul / Beijing */}
            <div className="flex items-center rounded-full bg-[#E5E5EA] p-0.5">
              <button
                type="button"
                onClick={() => handleSwitchCorridor("cn-to-seoul")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  isSeoul
                    ? "bg-white text-[#1D1D1F] shadow-xs"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                首尔
              </button>
              <button
                type="button"
                onClick={() => handleSwitchCorridor("global-to-beijing")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  !isSeoul
                    ? "bg-white text-[#1D1D1F] shadow-xs"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                北京
              </button>
            </div>
          </div>
        </div>

        {/* Main Scrollable App Store Content Area */}
        <div className="flex-1 space-y-4 overflow-y-auto px-4 pt-2 pb-24">
          {/* ================= TAB 1: TODAY (APP STORE EDITORIAL FEED) ================= */}
          {activeTab === "today" && (
            <>
              {/* App Store "Today" Full-Bleed Editorial Hero Card */}
              <div className="relative h-[300px] w-full overflow-hidden rounded-[26px] bg-[#1C1C1E] shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
                <img
                  src={corridor.worldScenes[0]?.image}
                  alt={corridor.destinationCity}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/75" />

                {/* Top Editorial Kicker */}
                <div className="absolute inset-x-5 top-4">
                  <div className="text-[11px] font-semibold tracking-wider text-white/80 uppercase">
                    落地首日生存指南
                  </div>
                  <h2 className="mt-0.5 text-[24px] leading-tight font-bold tracking-tight text-white">
                    {isSeoul
                      ? "仁川落地黄金 120 分钟"
                      : "北京抵京黄金 120 分钟"}
                  </h2>
                </div>

                {/* Bottom App Store Frosted Glass Dock */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-black/45 px-4 py-3.5 backdrop-blur-2xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#007AFF] text-sm font-bold text-white shadow-xs">
                      {isSeoul ? "ICN" : "PKX"}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-white">
                        {isSeoul
                          ? "eSIM · WOWPASS · 机场快轨"
                          : "外卡绑支付宝 · 东华门捷径"}
                      </div>
                      <div className="text-[11px] text-white/70">
                        已完成 {completedCount}/{corridor.timeline.length} 项关键准备
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("world3d")}
                    className="shrink-0 rounded-full bg-white/25 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-md transition-colors hover:bg-white/35"
                  >
                    3D 预演
                  </button>
                </div>
              </div>

              {/* 2-Column iOS 18 Widgets: Offline FX Calculator & Emergency Info */}
              <div className="grid grid-cols-2 gap-3">
                {/* Left Widget: Clean Apple Calculator / FX Widget */}
                <div className="rounded-[22px] bg-white p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#86868B]">
                      离线汇率换算
                    </span>
                    <span className="text-[10px] font-medium text-[#007AFF]">
                      实时
                    </span>
                  </div>
                  {isSeoul ? (
                    <div className="mt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-medium text-[#86868B]">₩</span>
                        <input
                          type="number"
                          value={krwInput}
                          onChange={(e) => setKrwInput(e.target.value)}
                          className="w-full bg-transparent text-lg font-bold tracking-tight text-[#1D1D1F] outline-none"
                        />
                      </div>
                      <div className="mt-1 border-t border-black/[0.06] pt-1.5 text-sm font-semibold text-[#007AFF]">
                        ≈ ¥ {cnyFromKrw} RMB
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-medium text-[#86868B]">$</span>
                        <input
                          type="number"
                          value={usdInput}
                          onChange={(e) => setUsdInput(e.target.value)}
                          className="w-full bg-transparent text-lg font-bold tracking-tight text-[#1D1D1F] outline-none"
                        />
                      </div>
                      <div className="mt-1 border-t border-black/[0.06] pt-1.5 text-sm font-semibold text-[#007AFF]">
                        ≈ ¥ {cnyFromUsd} CNY
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Widget: Clean iOS Assistance Widget */}
                <div className="flex flex-col justify-between rounded-[22px] bg-white p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#86868B]">
                      官方中文救援
                    </span>
                    <span className="h-2 w-2 rounded-full bg-[#34C759]" />
                  </div>
                  <div className="my-1">
                    <div className="text-lg font-bold tracking-tight text-[#1D1D1F]">
                      {isSeoul ? "1330 热线" : "12345 热线"}
                    </div>
                    <div className="text-[11px] text-[#86868B]">
                      {isSeoul ? "24小时中文翻译" : "多语种市民服务"}
                    </div>
                  </div>
                  <div className="border-t border-black/[0.06] pt-1.5 text-[11px] font-medium text-[#1D1D1F]">
                    {isSeoul ? "插座：两圆孔 220V" : "支付：支付宝外卡直刷"}
                  </div>
                </div>
              </div>

              {/* Apple Grouped Checklist Card: 4 Touchdown Steps */}
              <div className="rounded-[24px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#1D1D1F]">
                      下飞机通关清单
                    </h3>
                    <p className="text-xs text-[#86868B]">
                      轻点圆圈记录进度，按时间顺序完成
                    </p>
                  </div>
                  <span className="rounded-full bg-[#F2F2F7] px-2.5 py-1 text-xs font-semibold text-[#1D1D1F]">
                    {completedCount}/{corridor.timeline.length}
                  </span>
                </div>

                <div className="divide-y divide-black/[0.06]">
                  {corridor.timeline.map((step, idx) => {
                    const isDone = !!completedSteps[`${corridorId}-${idx}`];
                    return (
                      <div
                        key={step.title}
                        onClick={() => toggleTimelineStep(idx)}
                        className="flex cursor-pointer items-start gap-3 py-3.5 transition-colors first:pt-2 last:pb-1"
                      >
                        <button
                          type="button"
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                            isDone
                              ? "border-[#007AFF] bg-[#007AFF] text-white"
                              : "border-[#C7C7CC] bg-white"
                          }`}
                        >
                          {isDone && (
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 12 12"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M2.5 6l2.5 2.5 4.5-5" />
                            </svg>
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-medium text-[#86868B]">
                            {step.window}
                          </div>
                          <div
                            className={`text-[14px] font-semibold ${
                              isDone
                                ? "text-[#86868B] line-through"
                                : "text-[#1D1D1F]"
                            }`}
                          >
                            {step.title}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-[#3A3A3C]">
                            {step.solution}
                          </p>
                        </div>

                        <a
                          href={step.affiliateUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 shrink-0 rounded-full bg-[#F2F2F7] px-3.5 py-1.5 text-xs font-bold text-[#007AFF] transition-colors hover:bg-[#E5E5EA]"
                        >
                          获取
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ================= TAB 2: 实景 3D (APPLE MAPS FLYOVER) ================= */}
          {activeTab === "world3d" && (
            <div className="space-y-3.5">
              <WorldModelViewport
                scenes={corridor.worldScenes}
                destinationCity={corridor.destinationCity}
                compact
              />

              {!isSeoul && (
                <div className="rounded-[24px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#1D1D1F]">
                      北京地标实拍图鉴
                    </h3>
                    <span className="text-xs text-[#86868B]">左右滑动</span>
                  </div>
                  <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                    {beijingAttractions.map((item) => (
                      <div
                        key={item.id}
                        className="w-40 shrink-0 overflow-hidden rounded-2xl bg-[#F2F2F7] ring-1 ring-black/[0.04]"
                      >
                        <img
                          src={`/images/beijing-pulse/${item.image.replace("assets/", "")}`}
                          alt={item.name.zh}
                          className="h-24 w-full object-cover"
                        />
                        <div className="p-2.5">
                          <div className="text-xs font-bold text-[#1D1D1F]">
                            {item.name.zh}
                          </div>
                          <div className="mt-0.5 text-[11px] text-[#86868B]">
                            {item.transport.zh}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: 打车卡 (APPLE WALLET PASSES) ================= */}
          {activeTab === "taxi" && (
            <div className="space-y-3">
              {corridor.driverCards.map((card, index) => {
                const isSpeaking = speakingCardId === card.id;
                return (
                  <div
                    key={card.id}
                    className="overflow-hidden rounded-[24px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.05]"
                  >
                    {/* Apple Wallet Pass Top Strip */}
                    <div className="flex items-center justify-between border-b border-black/[0.05] bg-[#F9F9FB] px-4 py-2.5">
                      <span className="text-[11px] font-semibold text-[#86868B]">
                        {card.tag}
                      </span>
                      <span className="text-[11px] font-medium text-[#AEAEB2]">
                        PASS 0{index + 1}
                      </span>
                    </div>

                    <div className="p-4">
                      <div className="text-xs font-medium text-[#86868B]">
                        {card.titleCn}
                      </div>
                      <div className="mt-1 text-[20px] leading-snug font-bold tracking-tight text-[#1D1D1F]">
                        {card.localHeadline}
                      </div>
                      <div className="mt-1 text-xs text-[#86868B]">
                        {card.phoneticOrSub}
                      </div>

                      <div className="mt-3 rounded-2xl bg-[#F2F2F7] px-3 py-2 text-xs text-[#3A3A3C]">
                        {card.driverInstruction}
                      </div>

                      <div className="mt-3.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSpeakDriverCard(card)}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold text-white transition-all ${
                            isSpeaking
                              ? "bg-[#34C759]"
                              : "bg-[#007AFF] hover:bg-[#0071E3]"
                          }`}
                        >
                          <IconSpeakerWave />
                          <span>{isSpeaking ? "正在播报..." : "语音播报"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFullscreenDriverCard(card)}
                          className="rounded-full bg-[#F2F2F7] px-4 py-2.5 text-xs font-semibold text-[#1D1D1F] hover:bg-[#E5E5EA]"
                        >
                          全屏出示
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyPhrase(card.id, card.localHeadline)
                          }
                          className="rounded-full bg-[#F2F2F7] px-3.5 py-2.5 text-xs font-semibold text-[#007AFF] hover:bg-[#E5E5EA]"
                        >
                          {copiedId === card.id ? "已复制" : "复制"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ================= TAB 4: 必备应用 (APP STORE CHARTS LAYOUT) ================= */}
          {activeTab === "apps" && (
            <div className="space-y-4">
              {/* Authentic App Store "Must-Have Apps" Grouped Card */}
              <div className="rounded-[24px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                <div className="pb-2">
                  <div className="text-[11px] font-semibold tracking-wider text-[#007AFF] uppercase">
                    ESSENTIAL APPS
                  </div>
                  <h3 className="text-lg font-bold text-[#1D1D1F]">
                    当地必装软件与中文配置
                  </h3>
                </div>

                <div className="divide-y divide-black/[0.06]">
                  {corridor.appMatrix.map((app, idx) => {
                    const isExpanded = expandedAppIdx === idx;
                    return (
                      <div key={app.category} className="py-3.5 last:pb-1">
                        <div className="flex items-center gap-3.5">
                          {renderAppSquircleIcon(app.localChampion, idx)}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[15px] font-semibold text-[#1D1D1F]">
                              {app.localChampion}
                            </div>
                            <div className="truncate text-xs text-[#86868B]">
                              {app.category} · 替代 {app.originApp.split("/")[0]}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedAppIdx(isExpanded ? null : idx)
                            }
                            className="shrink-0 rounded-full bg-[#F2F2F7] px-4 py-1.5 text-xs font-bold text-[#007AFF] transition-colors hover:bg-[#E5E5EA]"
                          >
                            {isExpanded ? "收起" : "指南"}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="mt-3 space-y-1.5 rounded-2xl bg-[#F2F2F7]/80 p-3 text-xs leading-relaxed text-[#3A3A3C]">
                            <div>
                              <span className="font-semibold text-[#1D1D1F]">
                                为什么换：
                              </span>
                              {app.whyItFails}
                            </div>
                            <div>
                              <span className="font-semibold text-[#007AFF]">
                                中文设置：
                              </span>
                              {app.setupGuide}
                            </div>
                            <div className="text-[#86868B]">
                              贴士：{app.proTip}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clean Apple Maps Stay District Recommendations */}
              <div className="rounded-[24px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  推荐住宿片区
                </h3>
                <div className="mt-3 divide-y divide-black/[0.06]">
                  {corridor.stayDistricts.map((stay) => (
                    <div key={stay.name} className="py-3 first:pt-1 last:pb-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#1D1D1F]">
                          {stay.name}
                        </span>
                        <span className="text-xs font-semibold text-[#007AFF]">
                          {stay.priceRange}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-[#3A3A3C]">
                        {stay.vibe}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#86868B]">
                        {stay.transitAccess}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: 专属定制 (APPLE INTELLIGENCE & STOREKIT) ================= */}
          {activeTab === "ai-pro" && (
            <div className="space-y-4">
              {/* iOS Settings-Style Grouped Form for AI Itinerary */}
              <div className="rounded-[24px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                <div className="text-[11px] font-semibold tracking-wider text-[#007AFF] uppercase">
                  TRIP PLANNER
                </div>
                <h3 className="mt-0.5 text-lg font-bold text-[#1D1D1F]">
                  生成分时段落地行程
                </h3>
                <p className="mt-0.5 text-xs text-[#86868B]">
                  根据你的航班时间与住宿商圈，定制首日接驳与游览路线。
                </p>

                <form onSubmit={handleGenerateAiPlan} className="mt-3">
                  <div className="divide-y divide-black/[0.06] overflow-hidden rounded-2xl bg-[#F2F2F7]/80 px-3.5">
                    <div className="flex items-center justify-between py-2.5">
                      <label className="text-xs font-medium text-[#86868B]">
                        落地时间
                      </label>
                      <input
                        type="text"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        className="w-32 bg-transparent text-right text-xs font-semibold text-[#1D1D1F] outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <label className="text-xs font-medium text-[#86868B]">
                        停留天数
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value) || 3)}
                        className="w-20 bg-transparent text-right text-xs font-semibold text-[#1D1D1F] outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <label className="text-xs font-medium text-[#86868B]">
                        住宿区域
                      </label>
                      <input
                        type="text"
                        value={hotelArea}
                        onChange={(e) => setHotelArea(e.target.value)}
                        className="w-44 bg-transparent text-right text-xs font-semibold text-[#1D1D1F] outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <label className="text-xs font-medium text-[#86868B]">
                        偏好重点
                      </label>
                      <input
                        type="text"
                        value={travelerStyle}
                        onChange={(e) => setTravelerStyle(e.target.value)}
                        className="w-48 bg-transparent text-right text-xs font-semibold text-[#1D1D1F] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="mt-3.5 w-full rounded-full bg-[#007AFF] py-3 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#0071E3]"
                  >
                    {aiLoading ? "正在生成专属路线..." : "生成定制路线"}
                  </button>
                </form>

                {aiSummary && (
                  <div className="mt-4 space-y-2 border-t border-black/[0.06] pt-3">
                    <div className="text-xs font-semibold text-[#007AFF]">
                      已生成定制方案 ({aiProvider})
                    </div>
                    <p className="text-xs leading-relaxed text-[#3A3A3C]">
                      {aiSummary}
                    </p>
                    {aiSteps.map((st, i) => (
                      <div
                        key={i}
                        className="rounded-2xl bg-[#F2F2F7] p-3 text-xs"
                      >
                        <div className="font-semibold text-[#1D1D1F]">
                          {st.timeSlot} · {st.phase}
                        </div>
                        <div className="mt-1 text-[#3A3A3C]">{st.action}</div>
                        <div className="mt-1 text-[11px] text-[#007AFF]">
                          司机口令：{st.driverPhrase}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clean Apple App Store Subscription / StoreKit 2 Sheet */}
              <div className="rounded-[24px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider text-[#86868B] uppercase">
                    TERRA+ 离线通行证
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsProUnlocked(true)}
                    className="text-xs font-medium text-[#007AFF]"
                  >
                    恢复购买
                  </button>
                </div>
                <h3 className="mt-0.5 text-base font-bold text-[#1D1D1F]">
                  解锁全城离线地图与无限语音包
                </h3>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { id: "single" as const, name: "单城买断", price: "¥18", note: "永久有效" },
                    { id: "annual" as const, name: "年度通行", price: "¥48", note: "含全部城市" },
                    { id: "lifetime" as const, name: "终身会员", price: "¥68", note: "一次付费" },
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`rounded-2xl p-2.5 text-left transition-all ${
                        selectedPlan === plan.id
                          ? "bg-[#007AFF]/8 ring-2 ring-[#007AFF]"
                          : "bg-[#F2F2F7] ring-1 ring-black/[0.04]"
                      }`}
                    >
                      <div className="text-[11px] font-medium text-[#86868B]">
                        {plan.name}
                      </div>
                      <div className="mt-0.5 text-base font-bold text-[#1D1D1F]">
                        {plan.price}
                      </div>
                      <div className="text-[10px] text-[#007AFF]">
                        {plan.note}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsProUnlocked(true)}
                  className="mt-3.5 w-full rounded-full bg-[#1D1D1F] py-3 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {isProUnlocked ? "已解锁 TERRA+ 全部权益" : "通过 Apple Pay 订阅"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Authentic iOS 18 Translucent Frosted Bottom Tab Bar */}
        <div className="absolute inset-x-0 bottom-0 z-20 border-t border-black/[0.06] bg-white/85 px-2 pt-1.5 pb-2.5 backdrop-blur-2xl">
          <div className="grid grid-cols-5">
            {[
              { id: "today" as const, label: "Today", renderIcon: IconToday },
              { id: "world3d" as const, label: "实景 3D", renderIcon: IconSpatial },
              { id: "taxi" as const, label: "打车卡", renderIcon: IconWalletPass },
              { id: "apps" as const, label: "应用", renderIcon: IconAppsGrid },
              { id: "ai-pro" as const, label: "定制", renderIcon: IconSparkle },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-0.5 transition-colors ${
                    isActive
                      ? "text-[#007AFF]"
                      : "text-[#8E8E93] hover:text-[#1D1D1F]"
                  }`}
                >
                  {tab.renderIcon({ active: isActive })}
                  <span className="mt-1 text-[10px] font-medium">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mx-auto mt-2 h-1 w-32 rounded-full bg-black/20" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-dvh bg-[#F5F5F7] text-[#1D1D1F]">
      {/* 1. Real Mobile Viewport (< 1024px): 100% Native Fullscreen */}
      <div className="h-dvh w-full lg:hidden">{renderMobileAppScreen("ios")}</div>

      {/* 2. Desktop Apple Design Studio (>= 1024px) */}
      <div className="hidden min-h-dvh flex-col lg:flex">
        {/* Minimalist Apple Glass Top Navigation */}
        <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4 px-8 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#007AFF] text-sm font-bold text-white shadow-xs">
                T
              </div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-base font-bold tracking-tight text-[#1D1D1F]">
                  TERRA
                </span>
                <span className="text-xs font-medium text-[#86868B]">
                  iOS 18 App Store 设计规范 · 跨国落地指南与空间地图
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Segmented Studio Switcher */}
              <div className="flex items-center rounded-full bg-[#E5E5EA] p-0.5">
                <button
                  type="button"
                  onClick={() => setStudioLayout("app-studio")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    studioLayout === "app-studio"
                      ? "bg-white text-[#1D1D1F] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  iPhone 16 Pro 预览
                </button>
                <button
                  type="button"
                  onClick={() => setStudioLayout("dual-phone")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    studioLayout === "dual-phone"
                      ? "bg-white text-[#1D1D1F] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  iOS 与 Android 对比
                </button>
                <button
                  type="button"
                  onClick={() => setStudioLayout("pc-wide")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    studioLayout === "pc-wide"
                      ? "bg-white text-[#1D1D1F] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  iPad / 桌面宽屏
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Studio Stage */}
        <main className="mx-auto flex-1 w-full max-w-[1380px] px-8 py-8">
          {studioLayout === "app-studio" && (
            <div className="grid grid-cols-12 items-start gap-10">
              {/* Left Column: Clean Natural Titanium iPhone 16 Pro */}
              <div className="col-span-5 flex flex-col items-center">
                <div className="relative h-[840px] w-[408px] overflow-hidden rounded-[54px] border-[10px] border-[#1D1D1F] bg-[#F2F2F7] shadow-[0_24px_70px_rgba(0,0,0,0.12)] ring-1 ring-black/10">
                  {renderMobileAppScreen("ios")}
                </div>
              </div>

              {/* Right Column: Clean Apple App Store Product Page & Large 3D Map */}
              <div className="col-span-7 space-y-6">
                {/* Apple App Store Web Listing Header */}
                <div className="rounded-[28px] bg-white p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-b from-[#007AFF] to-[#0051D5] text-2xl font-bold text-white shadow-md">
                        T
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#007AFF]">
                          旅行与空间导航 · 编辑精选
                        </div>
                        <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-[#1D1D1F]">
                          TERRA — 跨国落地指南
                        </h2>
                        <p className="mt-1 text-sm text-[#86868B]">
                          首尔与北京黄金120分钟通关 · 离线双语出租车发声卡 · 3D 机位预演
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPaywallModal(true)}
                      className="shrink-0 rounded-full bg-[#007AFF] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0071E3]"
                    >
                      App 内购买 · ¥18 起
                    </button>
                  </div>

                  {/* Clean Apple App Store Metadata Strip */}
                  <div className="mt-6 grid grid-cols-4 divide-x divide-black/[0.06] border-y border-black/[0.06] py-3 text-center">
                    <div>
                      <div className="text-[10px] font-semibold text-[#86868B]">
                        评分
                      </div>
                      <div className="mt-0.5 text-base font-bold text-[#1D1D1F]">
                        4.9
                      </div>
                      <div className="text-[10px] text-[#86868B]">★★★★★</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-[#86868B]">
                        类别
                      </div>
                      <div className="mt-0.5 text-base font-bold text-[#1D1D1F]">
                        旅游
                      </div>
                      <div className="text-[10px] text-[#86868B]">导航与生存</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-[#86868B]">
                        语音引擎
                      </div>
                      <div className="mt-0.5 text-base font-bold text-[#1D1D1F]">
                        韩 / 中
                      </div>
                      <div className="text-[10px] text-[#86868B]">离线 TTS 播报</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-[#86868B]">
                        兼容性
                      </div>
                      <div className="mt-0.5 text-base font-bold text-[#1D1D1F]">
                        iOS / Android
                      </div>
                      <div className="text-[10px] text-[#86868B]">Capacitor 原生</div>
                    </div>
                  </div>

                  {/* Quick Tab Switcher synced with iPhone on the left */}
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-xs font-medium text-[#86868B]">
                      联动切换左侧手机视图：
                    </span>
                    {[
                      { id: "today" as const, label: "Today 落地清单" },
                      { id: "world3d" as const, label: "实景 3D 视窗" },
                      { id: "taxi" as const, label: "Wallet 打车卡" },
                      { id: "apps" as const, label: "必备应用榜" },
                      { id: "ai-pro" as const, label: "行程定制与内购" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTab(t.id)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                          activeTab === t.id
                            ? "bg-[#1D1D1F] text-white"
                            : "bg-[#F2F2F7] text-[#1D1D1F] hover:bg-[#E5E5EA]"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Large Synced 3D Flyover Card */}
                <div className="rounded-[28px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#86868B]">
                        3D FLYOVER · 空间地标预演
                      </div>
                      <h3 className="text-lg font-bold text-[#1D1D1F]">
                        {corridor.destinationCity}
                      </h3>
                    </div>

                    <div className="flex items-center rounded-full bg-[#F2F2F7] p-0.5">
                      <button
                        type="button"
                        onClick={() => handleSwitchCorridor("cn-to-seoul")}
                        className={`rounded-full px-3.5 py-1 text-xs font-semibold ${
                          corridorId === "cn-to-seoul"
                            ? "bg-white text-[#1D1D1F] shadow-xs"
                            : "text-[#86868B]"
                        }`}
                      >
                        首尔 Seoul
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchCorridor("global-to-beijing")}
                        className={`rounded-full px-3.5 py-1 text-xs font-semibold ${
                          corridorId === "global-to-beijing"
                            ? "bg-white text-[#1D1D1F] shadow-xs"
                            : "text-[#86868B]"
                        }`}
                      >
                        北京 Beijing
                      </button>
                    </div>
                  </div>

                  <WorldModelViewport
                    scenes={corridor.worldScenes}
                    destinationCity={corridor.destinationCity}
                  />
                </div>
              </div>
            </div>
          )}

          {studioLayout === "dual-phone" && (
            <div className="flex flex-wrap items-start justify-center gap-12">
              <div className="flex flex-col items-center">
                <div className="mb-3 text-xs font-semibold text-[#86868B]">
                  iPhone 16 Pro · iOS 18
                </div>
                <div className="relative h-[840px] w-[408px] overflow-hidden rounded-[54px] border-[10px] border-[#1D1D1F] bg-[#F2F2F7] shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
                  {renderMobileAppScreen("ios")}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-3 text-xs font-semibold text-[#86868B]">
                  Android Flagship · Material You
                </div>
                <div className="relative h-[840px] w-[408px] overflow-hidden rounded-[36px] border-[8px] border-[#2C2C2E] bg-[#F2F2F7] shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
                  {renderMobileAppScreen("android")}
                </div>
              </div>
            </div>
          )}

          {studioLayout === "pc-wide" && (
            <div className="space-y-6">
              <div className="rounded-[28px] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[#007AFF]">
                      IPAD & DESKTOP VIEW
                    </div>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1D1D1F]">
                      {corridor.heroHeadline}
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#3A3A3C]">
                      {corridor.heroSubheadline}
                    </p>
                  </div>
                </div>
              </div>

              <WorldModelViewport
                scenes={corridor.worldScenes}
                destinationCity={corridor.destinationCity}
              />
            </div>
          )}
        </main>
      </div>

      {/* Fullscreen Taxi Pass Display */}
      {fullscreenDriverCard && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-between bg-white p-8 md:p-16"
          onClick={() => setFullscreenDriverCard(null)}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[#F2F2F7] px-4 py-1.5 text-xs font-semibold text-[#86868B]">
              {fullscreenDriverCard.tag}
            </span>
            <button
              type="button"
              onClick={() => setFullscreenDriverCard(null)}
              className="rounded-full bg-[#F2F2F7] px-4 py-2 text-xs font-bold text-[#1D1D1F]"
            >
              完成
            </button>
          </div>

          <div
            className="my-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-medium text-[#86868B]">
              {fullscreenDriverCard.titleCn}
            </div>
            <div className="text-4xl leading-tight font-bold tracking-tight text-[#1D1D1F] md:text-6xl">
              {fullscreenDriverCard.localHeadline}
            </div>
            <div className="text-xl font-medium text-[#007AFF]">
              {fullscreenDriverCard.phoneticOrSub}
            </div>
            <div className="rounded-3xl bg-[#F2F2F7] p-6 text-lg text-[#3A3A3C]">
              {fullscreenDriverCard.driverInstruction}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSpeakDriverCard(fullscreenDriverCard)}
                className="flex items-center gap-2 rounded-full bg-[#007AFF] px-7 py-3.5 text-base font-semibold text-white"
              >
                <IconSpeakerWave />
                <span>语音播报给司机听</span>
              </button>
            </div>
          </div>

          <div className="text-sm text-[#86868B]">
            {fullscreenDriverCard.subwayBackup}
          </div>
        </div>
      )}

      {/* Clean Apple StoreKit Sheet Modal */}
      {showPaywallModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
          onClick={() => setShowPaywallModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#86868B]">
                App Store 内购预览
              </span>
              <button
                type="button"
                onClick={() => setShowPaywallModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F2F2F7] text-xs font-bold text-[#86868B]"
              >
                ✕
              </button>
            </div>
            <h3 className="mt-3 text-xl font-bold text-[#1D1D1F]">
              TERRA+ 全球离线通行证
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#86868B]">
              一次解锁首尔与北京全部 3D 离线地标、真人韩语出租车播报及无限次行程定制。
            </p>
            <button
              type="button"
              onClick={() => {
                setIsProUnlocked(true);
                setShowPaywallModal(false);
              }}
              className="mt-5 w-full rounded-full bg-[#007AFF] py-3 text-xs font-semibold text-white"
            >
              使用 Apple Pay 订阅 (¥28)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
