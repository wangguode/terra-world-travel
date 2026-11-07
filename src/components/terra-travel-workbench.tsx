"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CORRIDORS,
  CORRIDOR_METAS,
  UPCOMING_CITIES,
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

const STORAGE_KEY = "terra_ios_state_v5";

// Crisp SF Symbol-style SVG Icons
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

function renderAppSquircleIcon(appName: string, index: number) {
  if (appName.includes("Naver Map")) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] bg-[#03C75A] text-lg font-black text-white shadow-xs">
        N
      </div>
    );
  }
  if (appName.includes("Kakao") || appName.includes("Suica")) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] bg-[#FAE100] text-lg font-black text-[#371D1E] shadow-xs">
        {appName.includes("Suica") ? "S" : "T"}
      </div>
    );
  }
  if (appName.includes("CatchTable") || appName.includes("Grab")) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] bg-[#00B14F] text-lg font-black text-white shadow-xs">
        G
      </div>
    );
  }
  if (appName.includes("Papago") || appName.includes("Yahoo")) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] bg-[#FF0033] text-base font-black text-white shadow-xs">
        Y!
      </div>
    );
  }
  if (appName.includes("高德") || appName.includes("Apple")) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] bg-[#007AFF] text-base font-black text-white shadow-xs">
        导
      </div>
    );
  }
  if (appName.includes("滴滴") || appName.includes("支付宝")) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] bg-[#FF6600] text-base font-black text-white shadow-xs">
        滴
      </div>
    );
  }
  const colors = ["bg-[#007AFF]", "bg-[#34C759]", "bg-[#5856D6]", "bg-[#FF9500]"];
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] ${
        colors[index % colors.length]
      } text-base font-bold text-white shadow-xs`}
    >
      {appName.slice(0, 1)}
    </div>
  );
}

export function TerraTravelWorkbench() {
  const [corridorId, setCorridorId] = useState<CorridorId>("cn-to-seoul");
  const corridor = CORRIDORS[corridorId] ?? CORRIDORS["cn-to-seoul"];
  const currentCorridorMeta =
    CORRIDOR_METAS.find((m) => m.id === corridorId) ?? CORRIDOR_METAS[0];

  const [studioLayout, setStudioLayout] = useState<StudioLayout>("app-studio");
  const [activeTab, setActiveTab] = useState<MobileTab>("today");

  // Global Corridor Discovery Sheet State
  const [showCorridorDiscovery, setShowCorridorDiscovery] = useState(false);
  const [corridorSearch, setCorridorSearch] = useState("");
  const [corridorFilter, setCorridorFilter] = useState<
    "all" | "visa-free" | "asia"
  >("all");
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({
    SIN: 3842,
    KIX: 2950,
    CDG: 2410,
    LHR: 1890,
  });

  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    "cn-to-seoul-0": true,
    "global-to-beijing-0": true,
  });
  const [expandedAppIdx, setExpandedAppIdx] = useState<number | null>(0);

  // FX state
  const [krwInput, setKrwInput] = useState<string>("15000");
  const [usdInput, setUsdInput] = useState<string>("50");
  const [jpyInput, setJpyInput] = useState<string>("3000");
  const [thbInput, setThbInput] = useState<string>("500");

  // Taxi filter & voice state
  const [taxiSearch, setTaxiSearch] = useState("");
  const [speakingCardId, setSpeakingCardId] = useState<string | null>(null);
  const [fullscreenDriverCard, setFullscreenDriverCard] =
    useState<DriverCard | null>(null);
  const [showTodayStoryModal, setShowTodayStoryModal] = useState(false);

  // iOS Dynamic Island Capsule Toast
  const [islandToast, setIslandToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Per-tab scroll position memory
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const tabScrollMapRef = useRef<Record<MobileTab, number>>({
    today: 0,
    world3d: 0,
    taxi: 0,
    apps: 0,
    "ai-pro": 0,
  });

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

  const triggerIslandToast = (msg: string) => {
    setIslandToast(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setIslandToast(null);
    }, 2200);
  };

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        corridorId?: CorridorId;
        completedSteps?: Record<string, boolean>;
        isProUnlocked?: boolean;
        krwInput?: string;
        usdInput?: string;
        jpyInput?: string;
        thbInput?: string;
      };
      if (parsed.corridorId && CORRIDORS[parsed.corridorId]) {
        setCorridorId(parsed.corridorId);
      }
      if (parsed.completedSteps) {
        setCompletedSteps(parsed.completedSteps);
      }
      if (typeof parsed.isProUnlocked === "boolean") {
        setIsProUnlocked(parsed.isProUnlocked);
      }
      if (parsed.krwInput) setKrwInput(parsed.krwInput);
      if (parsed.usdInput) setUsdInput(parsed.usdInput);
      if (parsed.jpyInput) setJpyInput(parsed.jpyInput);
      if (parsed.thbInput) setThbInput(parsed.thbInput);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          corridorId,
          completedSteps,
          isProUnlocked,
          krwInput,
          usdInput,
          jpyInput,
          thbInput,
        })
      );
    } catch {
      // ignore
    }
  }, [corridorId, completedSteps, isProUnlocked, krwInput, usdInput, jpyInput, thbInput]);

  const handleSelectTab = (nextTab: MobileTab) => {
    const container = scrollContainerRef.current;
    if (nextTab === activeTab) {
      container?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (container) {
      tabScrollMapRef.current[activeTab] = container.scrollTop;
    }
    setActiveTab(nextTab);
    window.requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop =
          tabScrollMapRef.current[nextTab] ?? 0;
      }
    });
  };

  const handleSwitchCorridor = (nextId: CorridorId) => {
    if (nextId === corridorId) {
      setShowCorridorDiscovery(false);
      return;
    }
    setCorridorId(nextId);
    setShowCorridorDiscovery(false);
    setTaxiSearch("");
    setAiSteps([]);
    setAiSummary(null);

    const targetMeta = CORRIDOR_METAS.find((m) => m.id === nextId);
    triggerIslandToast(`已切换至 ${targetMeta?.city ?? nextId}`);

    if (nextId === "cn-to-seoul") {
      setHotelArea("弘大入口 / 延南洞");
      setTravelerStyle("首次赴韩 · 景福宫韩服与圣水洞探店");
    } else if (nextId === "global-to-beijing") {
      setHotelArea("东城王府井 / 什刹海");
      setTravelerStyle("首次抵京 · 故宫中轴线与胡同铜锅涮肉");
    } else if (nextId === "cn-to-tokyo") {
      setHotelArea("新宿南口 / 涩谷");
      setTravelerStyle("东京首访 · 涩谷十字路口与歌舞伎町夜景");
    } else if (nextId === "cn-to-bangkok") {
      setHotelArea("暹罗商圈 / 素坤逸");
      setTravelerStyle("曼谷度假 · 郑王庙日落与米其林夜市探店");
    }
  };

  const handleVoteCity = (code: string, cityName: string) => {
    setVoteCounts((prev) => ({
      ...prev,
      [code]: (prev[code] ?? 1000) + 1,
    }));
    triggerIslandToast(`已为你心仪的【${cityName}】投出宝贵一票！`);
  };

  const toggleTimelineStep = (idx: number) => {
    const key = `${corridorId}-${idx}`;
    const nextVal = !completedSteps[key];
    setCompletedSteps((prev) => ({ ...prev, [key]: nextVal }));
    triggerIslandToast(nextVal ? "已完成该准备节点" : "已重置状态");
  };

  const completedCount = corridor.timeline.filter(
    (_, idx) => completedSteps[`${corridorId}-${idx}`]
  ).length;

  const handleSpeakDriverCard = (card: DriverCard) => {
    let lang = "ko-KR";
    if (corridorId === "global-to-beijing") lang = "zh-CN";
    else if (corridorId === "cn-to-tokyo") lang = "ja-JP";
    else if (corridorId === "cn-to-bangkok") lang = "th-TH";

    triggerIslandToast("正在播报当地语音司机口令...");
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(card.localHeadline);
    utterance.lang = lang;
    utterance.rate = 0.92;
    setSpeakingCardId(card.id);
    utterance.onend = () => setSpeakingCardId(null);
    utterance.onerror = () => setSpeakingCardId(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyPhrase = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
    triggerIslandToast("已复制当地原生地名，可直接粘贴搜索");
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
      triggerIslandToast("专属时空行程已生成");
    } catch {
      setAiSummary("已切换至本地离线生存引擎生成方案。");
    } finally {
      setAiLoading(false);
    }
  };

  const filteredDriverCards = corridor.driverCards.filter((c) => {
    if (!taxiSearch.trim()) return true;
    const q = taxiSearch.toLowerCase();
    return (
      c.titleCn.toLowerCase().includes(q) ||
      c.tag.toLowerCase().includes(q) ||
      c.localHeadline.toLowerCase().includes(q) ||
      c.phoneticOrSub.toLowerCase().includes(q)
    );
  });

  const filteredCorridorMetas = CORRIDOR_METAS.filter((m) => {
    if (corridorFilter === "visa-free" && !m.visaTag.includes("免签")) return false;
    if (corridorFilter === "asia" && m.region !== "asia") return false;
    if (!corridorSearch.trim()) return true;
    const q = corridorSearch.toLowerCase();
    return (
      m.city.toLowerCase().includes(q) ||
      m.country.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q)
    );
  });

  // Authentic Apple App Store (iOS 18 HIG) Screen with Dynamic Corridor Discovery
  const renderMobileAppScreen = (
    osVariant: "ios" | "android" = "ios",
    attachScrollRef = false
  ) => {
    const isSeoul = corridorId === "cn-to-seoul";
    const isBeijing = corridorId === "global-to-beijing";
    const isTokyo = corridorId === "cn-to-tokyo";
    const isBangkok = corridorId === "cn-to-bangkok";

    let fxDisplay = "";
    if (isSeoul) {
      fxDisplay = `≈ ¥ ${((Number(krwInput) || 0) * 0.0053).toFixed(1)} RMB`;
    } else if (isBeijing) {
      fxDisplay = `≈ ¥ ${((Number(usdInput) || 0) * 7.22).toFixed(1)} CNY`;
    } else if (isTokyo) {
      fxDisplay = `≈ ¥ ${((Number(jpyInput) || 0) * 0.0478).toFixed(1)} RMB`;
    } else if (isBangkok) {
      fxDisplay = `≈ ¥ ${((Number(thbInput) || 0) * 0.215).toFixed(1)} RMB`;
    }

    const tabTitles: Record<MobileTab, { kicker: string; title: string }> = {
      today: {
        kicker: `FIRST TOUCHDOWN · ${currentCorridorMeta.city}`,
        title: "Today",
      },
      world3d: {
        kicker: "SPATIAL WORLD MODEL · 空间预演",
        title: "实景 3D",
      },
      taxi: {
        kicker: "PASSBOOK · 离线双语语音卡",
        title: "打车卡",
      },
      apps: {
        kicker: "ESSENTIALS · 当地国民软件",
        title: "必备应用",
      },
      "ai-pro": {
        kicker: "INTELLIGENCE · 空间动线定制",
        title: "专属定制",
      },
    };

    const currentHeader = tabTitles[activeTab];

    return (
      <div className="relative flex h-full w-full flex-col bg-[#F2F2F7] text-[#1D1D1F] select-none">
        {/* iOS Status Bar + Dynamic Island Capsule */}
        <div className="shrink-0 bg-[#F2F2F7]/90 px-6 pt-3 pb-2 backdrop-blur-xl z-20">
          <div className="relative flex items-center justify-between text-[12px] font-semibold tracking-tight text-[#1D1D1F]">
            <span>9:41</span>
            {osVariant === "ios" ? (
              <div
                className={`flex items-center justify-center gap-2 rounded-full bg-black text-white shadow-sm transition-all duration-300 ${
                  islandToast
                    ? "h-[28px] px-4 text-[11px] font-medium"
                    : "h-[24px] w-[108px] px-3 text-[10px] font-medium justify-between"
                }`}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#34C759]" />
                <span className="truncate">
                  {islandToast ? islandToast : currentCorridorMeta.code}
                </span>
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

          {/* Apple App Store Header: Large Title + Scalable Corridor Discovery Trigger Pill */}
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <div className="text-[11px] font-semibold tracking-wider text-[#86868B] uppercase">
                {currentHeader.kicker}
              </div>
              <h1 className="text-[30px] leading-[1.1] font-bold tracking-tight text-[#1D1D1F]">
                {currentHeader.title}
              </h1>
            </div>

            {/* Scalable Global Corridor Selector Pill */}
            <button
              type="button"
              onClick={() => setShowCorridorDiscovery(true)}
              className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#1D1D1F] shadow-xs ring-1 ring-black/[0.08] transition-all duration-150 active:scale-95 hover:bg-[#F2F2F7]"
            >
              <span className="text-sm">{currentCorridorMeta.flag}</span>
              <span>{currentCorridorMeta.city.split(" ")[0]}</span>
              <span className="rounded bg-[#F2F2F7] px-1 py-0.2 text-[10px] font-semibold text-[#86868B]">
                {currentCorridorMeta.code}
              </span>
              <span className="text-[10px] text-[#86868B]">▼</span>
            </button>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div
          ref={attachScrollRef ? scrollContainerRef : undefined}
          className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-4 pt-2 pb-24"
        >
          <div
            key={`${corridorId}-${activeTab}`}
            className="ios-tab-enter space-y-4"
          >
            {/* ================= TAB 1: TODAY ================= */}
            {activeTab === "today" && (
              <>
                <div
                  onClick={() => setShowTodayStoryModal(true)}
                  className="group relative h-[296px] w-full cursor-pointer overflow-hidden rounded-[26px] bg-[#1C1C1E] shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-transform duration-300 active:scale-[0.98]"
                >
                  <img
                    src={corridor.worldScenes[0]?.image}
                    alt={corridor.destinationCity}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75" />

                  <div className="absolute inset-x-5 top-4 flex items-start justify-between">
                    <div>
                      <div className="text-[11px] font-semibold tracking-wider text-white/80 uppercase">
                        落地首日生存指南 · {currentCorridorMeta.country}
                      </div>
                      <h2 className="mt-0.5 text-[24px] leading-tight font-bold tracking-tight text-white">
                        {currentCorridorMeta.city.split(" ")[0]} 落地黄金 120 分钟
                      </h2>
                    </div>
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                      专题
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-black/45 px-4 py-3.5 backdrop-blur-2xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#007AFF] text-sm font-bold text-white shadow-xs">
                        {currentCorridorMeta.code}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-white">
                          {currentCorridorMeta.highlights.join(" · ")}
                        </div>
                        <div className="text-[11px] text-white/70">
                          已完成 {completedCount}/{corridor.timeline.length} 项关键通关步骤
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTab("world3d");
                      }}
                      className="shrink-0 rounded-full bg-white/25 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-md transition-all active:scale-95 hover:bg-white/35"
                    >
                      3D 预演
                    </button>
                  </div>
                </div>

                {/* 2-Column iOS 18 Widgets: Offline FX Calculator & Emergency Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[22px] bg-white p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#86868B]">
                        离线汇率换算
                      </span>
                      <span className="text-[10px] font-medium text-[#007AFF]">
                        {currentCorridorMeta.code}
                      </span>
                    </div>

                    <div className="mt-1.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-medium text-[#86868B]">
                          {isSeoul ? "₩" : isTokyo ? "¥" : isBangkok ? "฿" : "$"}
                        </span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={
                            isSeoul
                              ? krwInput
                              : isTokyo
                              ? jpyInput
                              : isBangkok
                              ? thbInput
                              : usdInput
                          }
                          onChange={(e) => {
                            const v = e.target.value;
                            if (isSeoul) setKrwInput(v);
                            else if (isTokyo) setJpyInput(v);
                            else if (isBangkok) setThbInput(v);
                            else setUsdInput(v);
                          }}
                          className="w-full bg-transparent text-lg font-bold tracking-tight text-[#1D1D1F] outline-none"
                        />
                      </div>
                      <div className="text-sm font-semibold text-[#007AFF]">
                        {fxDisplay}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between rounded-[22px] bg-white p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#86868B]">
                        官方中文救援
                      </span>
                      <span className="h-2 w-2 rounded-full bg-[#34C759]" />
                    </div>
                    <div className="my-1">
                      <div className="text-lg font-bold tracking-tight text-[#1D1D1F]">
                        {corridor.emergencyNumber.split(" ")[0]}
                      </div>
                      <div className="text-[11px] text-[#86868B]">
                        24小时中文翻译救援
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectTab("taxi")}
                      className="w-full rounded-full bg-[#F2F2F7] py-1 text-[11px] font-semibold text-[#007AFF] transition-transform active:scale-95 hover:bg-[#E5E5EA]"
                    >
                      打开打车卡 →
                    </button>
                  </div>
                </div>

                {/* Touchdown Checklist */}
                <div className="rounded-[24px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <h3 className="text-base font-bold text-[#1D1D1F]">
                        下飞机通关清单 · {currentCorridorMeta.city.split(" ")[0]}
                      </h3>
                      <p className="text-xs text-[#86868B]">
                        轻点圆圈记录进度，状态离线自动保存
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
                          className="flex cursor-pointer items-start gap-3 py-3.5 transition-opacity active:opacity-70 first:pt-2 last:pb-1"
                        >
                          <button
                            type="button"
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                              isDone
                                ? "scale-105 border-[#007AFF] bg-[#007AFF] text-white"
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
                              className={`text-[14px] font-semibold transition-colors ${
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
                            className="mt-1 shrink-0 rounded-full bg-[#F2F2F7] px-3.5 py-1.5 text-xs font-bold text-[#007AFF] transition-all active:scale-95 hover:bg-[#E5E5EA]"
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

            {/* ================= TAB 2: 实景 3D (WORLD MODEL TRIPLE VALUE) ================= */}
            {activeTab === "world3d" && (
              <div className="space-y-3.5">
                <WorldModelViewport
                  scenes={corridor.worldScenes}
                  destinationCity={corridor.destinationCity}
                  compact
                />

                {isBeijing && (
                  <div className="rounded-[24px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#1D1D1F]">
                        北京中轴高清实拍机位图鉴
                      </h3>
                      <span className="text-xs text-[#86868B]">左右滑动</span>
                    </div>
                    <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
                      {beijingAttractions.map((item) => (
                        <div
                          key={item.id}
                          className="w-40 shrink-0 overflow-hidden rounded-2xl bg-[#F2F2F7] ring-1 ring-black/[0.04]"
                        >
                          <img
                            src={`/images/beijing-pulse/${item.image.replace("assets/", "")}`}
                            alt={item.name.zh}
                            loading="lazy"
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

            {/* ================= TAB 3: 打车卡 ================= */}
            {activeTab === "taxi" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-2xl bg-[#E5E5EA]/80 px-3.5 py-2">
                  <svg
                    className="h-4 w-4 shrink-0 text-[#86868B]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    value={taxiSearch}
                    onChange={(e) => setTaxiSearch(e.target.value)}
                    placeholder={`搜索 ${currentCorridorMeta.city.split(" ")[0]} 热门地标或交通枢纽...`}
                    className="w-full bg-transparent text-xs font-medium text-[#1D1D1F] placeholder-[#86868B] outline-none"
                  />
                  {taxiSearch && (
                    <button
                      type="button"
                      onClick={() => setTaxiSearch("")}
                      className="text-xs font-bold text-[#86868B]"
                    >
                      清除
                    </button>
                  )}
                </div>

                {filteredDriverCards.map((card, index) => {
                  const isSpeaking = speakingCardId === card.id;
                  return (
                    <div
                      key={card.id}
                      className="overflow-hidden rounded-[24px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.05]"
                    >
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
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold text-white transition-all active:scale-95 ${
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
                            className="rounded-full bg-[#F2F2F7] px-4 py-2.5 text-xs font-semibold text-[#1D1D1F] transition-transform active:scale-95 hover:bg-[#E5E5EA]"
                          >
                            全屏出示
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyPhrase(card.localHeadline)}
                            className="rounded-full bg-[#F2F2F7] px-3.5 py-2.5 text-xs font-semibold text-[#007AFF] transition-transform active:scale-95 hover:bg-[#E5E5EA]"
                          >
                            复制
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= TAB 4: 必备应用 ================= */}
            {activeTab === "apps" && (
              <div className="space-y-4">
                <div className="rounded-[24px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                  <div className="pb-2">
                    <div className="text-[11px] font-semibold tracking-wider text-[#007AFF] uppercase">
                      ESSENTIAL APPS · {currentCorridorMeta.country}
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
                          <div
                            onClick={() =>
                              setExpandedAppIdx(isExpanded ? null : idx)
                            }
                            className="flex cursor-pointer items-center gap-3.5"
                          >
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
                              className="shrink-0 rounded-full bg-[#F2F2F7] px-4 py-1.5 text-xs font-bold text-[#007AFF] transition-all active:scale-95 hover:bg-[#E5E5EA]"
                            >
                              {isExpanded ? "收起" : "指南"}
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="ios-tab-enter mt-3 space-y-1.5 rounded-2xl bg-[#F2F2F7]/80 p-3 text-xs leading-relaxed text-[#3A3A3C]">
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

                <div className="rounded-[24px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                  <h3 className="text-base font-bold text-[#1D1D1F]">
                    推荐住宿片区 · {currentCorridorMeta.city.split(" ")[0]}
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

            {/* ================= TAB 5: 专属定制 ================= */}
            {activeTab === "ai-pro" && (
              <div className="space-y-4">
                <div className="rounded-[24px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                  <div className="text-[11px] font-semibold tracking-wider text-[#007AFF] uppercase">
                    TRIP PLANNER · {currentCorridorMeta.code}
                  </div>
                  <h3 className="mt-0.5 text-lg font-bold text-[#1D1D1F]">
                    生成分时段落地动线
                  </h3>

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
                      className="mt-3.5 w-full rounded-full bg-[#007AFF] py-3 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.98] hover:bg-[#0071E3] disabled:opacity-60"
                    >
                      {aiLoading ? "正在通过百炼引擎生成..." : "生成定制动线"}
                    </button>
                  </form>

                  {aiLoading && (
                    <div className="mt-4 space-y-2.5 border-t border-black/[0.06] pt-3">
                      <div className="h-3 w-36 animate-pulse rounded-full bg-[#E5E5EA]" />
                      <div className="h-14 w-full animate-pulse rounded-2xl bg-[#F2F2F7]" />
                    </div>
                  )}

                  {!aiLoading && aiSummary && (
                    <div className="ios-tab-enter mt-4 space-y-2 border-t border-black/[0.06] pt-3">
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
                            口令：{st.driverPhrase}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-[24px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-wider text-[#86868B] uppercase">
                      TERRA+ 离线通行证
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProUnlocked(true);
                        triggerIslandToast("已恢复购买");
                      }}
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
                    onClick={() => {
                      setIsProUnlocked(true);
                      triggerIslandToast("已通过 Apple Pay 订阅");
                    }}
                    className="mt-3.5 w-full rounded-full bg-[#1D1D1F] py-3 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    {isProUnlocked ? "已解锁 TERRA+ 全部权益" : "通过 Apple Pay 订阅"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Translucent Tab Bar */}
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
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-0.5 transition-all duration-150 active:scale-90 ${
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
      <div className="h-dvh w-full lg:hidden">
        {renderMobileAppScreen("ios", true)}
      </div>

      {/* 2. Desktop Apple Design Studio (>= 1024px) */}
      <div className="hidden min-h-dvh flex-col lg:flex">
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
                  iOS 18 全球走廊发现中心 · 空间世界模型与跨国落地指南
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Scalable Global Corridor Trigger Pill on Desktop */}
              <button
                type="button"
                onClick={() => setShowCorridorDiscovery(true)}
                className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#1D1D1F] shadow-xs ring-1 ring-black/[0.08] transition-all duration-150 active:scale-95 hover:bg-[#F2F2F7]"
              >
                <span className="text-base">{currentCorridorMeta.flag}</span>
                <span>{currentCorridorMeta.city}</span>
                <span className="rounded bg-[#F2F2F7] px-1.5 py-0.5 text-[10px] font-semibold text-[#86868B]">
                  {currentCorridorMeta.code}
                </span>
                <span className="text-xs text-[#86868B]">切换城市 ▼</span>
              </button>

              <div className="flex items-center rounded-full bg-[#E5E5EA] p-0.5">
                <button
                  type="button"
                  onClick={() => setStudioLayout("app-studio")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
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
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
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
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
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

        <main className="mx-auto flex-1 w-full max-w-[1380px] px-8 py-8">
          {studioLayout === "app-studio" && (
            <div className="grid grid-cols-12 items-start gap-10">
              <div className="col-span-5 flex flex-col items-center">
                <div className="relative h-[840px] w-[408px] overflow-hidden rounded-[54px] border-[10px] border-[#1D1D1F] bg-[#F2F2F7] shadow-[0_24px_70px_rgba(0,0,0,0.12)] ring-1 ring-black/10">
                  {renderMobileAppScreen("ios", true)}
                </div>
              </div>

              <div className="col-span-7 space-y-6">
                <div className="rounded-[28px] bg-white p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-b from-[#007AFF] to-[#0051D5] text-2xl font-bold text-white shadow-md">
                        T
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#007AFF]">
                          全球城市走廊 · {currentCorridorMeta.country} · {currentCorridorMeta.visaTag}
                        </div>
                        <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-[#1D1D1F]">
                          TERRA — {currentCorridorMeta.city}
                        </h2>
                        <p className="mt-1 text-sm text-[#86868B]">
                          {corridor.heroSubheadline}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCorridorDiscovery(true)}
                      className="shrink-0 rounded-full bg-[#007AFF] px-5 py-2 text-xs font-bold text-white transition-all active:scale-95 hover:bg-[#0071E3]"
                    >
                      切换全球城市 🌐
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-4 divide-x divide-black/[0.06] border-y border-black/[0.06] py-3 text-center">
                    <div>
                      <div className="text-[10px] font-semibold text-[#86868B]">
                        全球走廊
                      </div>
                      <div className="mt-0.5 text-base font-bold text-[#1D1D1F]">
                        4 开通 + 4 筹备
                      </div>
                      <div className="text-[10px] text-[#86868B]">实时投票扩展</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-[#86868B]">
                        世界模型应用
                      </div>
                      <div className="mt-0.5 text-base font-bold text-[#1D1D1F]">
                        3 大实战场景
                      </div>
                      <div className="text-[10px] text-[#86868B]">动线/时空/机位</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-[#86868B]">
                        语音引擎
                      </div>
                      <div className="mt-0.5 text-base font-bold text-[#1D1D1F]">
                        韩/日/泰/中
                      </div>
                      <div className="text-[10px] text-[#86868B]">离线双语 TTS</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-[#86868B]">
                        架构定位
                      </div>
                      <div className="mt-0.5 text-base font-bold text-[#1D1D1F]">
                        iOS 18 原生
                      </div>
                      <div className="text-[10px] text-[#86868B]">Capacitor 就绪</div>
                    </div>
                  </div>

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
                        onClick={() => handleSelectTab(t.id)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
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

                <div className="rounded-[28px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#86868B]">
                        3D SPATIAL WORLD MODEL · 空间世界模型视窗
                      </div>
                      <h3 className="text-lg font-bold text-[#1D1D1F]">
                        {corridor.destinationCity}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCorridorDiscovery(true)}
                      className="rounded-full bg-[#F2F2F7] px-3.5 py-1.5 text-xs font-semibold text-[#007AFF] hover:bg-[#E5E5EA]"
                    >
                      更多全球城市 ➔
                    </button>
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
                  {renderMobileAppScreen("ios", true)}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-3 text-xs font-semibold text-[#86868B]">
                  Android Flagship · Material You
                </div>
                <div className="relative h-[840px] w-[408px] overflow-hidden rounded-[36px] border-[8px] border-[#2C2C2E] bg-[#F2F2F7] shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
                  {renderMobileAppScreen("android", false)}
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
                      GLOBAL TRAVEL COMMAND DECK
                    </div>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1D1D1F]">
                      {corridor.heroHeadline}
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#3A3A3C]">
                      {corridor.heroSubheadline}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCorridorDiscovery(true)}
                    className="rounded-full bg-[#007AFF] px-6 py-2.5 text-xs font-bold text-white shadow-xs"
                  >
                    选择全球目的地 🌐
                  </button>
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

      {/* ================= GLOBAL CORRIDOR & CITY DISCOVERY SHEET MODAL ================= */}
      {showCorridorDiscovery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-md"
          onClick={() => setShowCorridorDiscovery(false)}
        >
          <div
            className="ios-tab-enter max-h-[88vh] w-full max-w-xl overflow-hidden rounded-[32px] bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/[0.06] p-5 pb-4">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#007AFF] uppercase">
                  GLOBAL DESTINATIONS
                </span>
                <h3 className="text-xl font-bold text-[#1D1D1F]">
                  全球旅游城市与跨国走廊
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCorridorDiscovery(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F7] text-xs font-bold text-[#86868B] transition-transform active:scale-95"
              >
                ✕
              </button>
            </div>

            {/* Search + Filter Pill Row */}
            <div className="p-5 pb-3 space-y-3 bg-[#F9F9FB]">
              <div className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2 ring-1 ring-black/[0.08]">
                <svg
                  className="h-4 w-4 shrink-0 text-[#86868B]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={corridorSearch}
                  onChange={(e) => setCorridorSearch(e.target.value)}
                  placeholder="搜索全球城市、国家或机场三字码 (如 HND / BKK / 巴黎)..."
                  className="w-full bg-transparent text-xs font-medium text-[#1D1D1F] placeholder-[#86868B] outline-none"
                />
                {corridorSearch && (
                  <button
                    type="button"
                    onClick={() => setCorridorSearch("")}
                    className="text-xs font-bold text-[#86868B]"
                  >
                    清除
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {[
                  { id: "all" as const, label: "全部走廊" },
                  { id: "visa-free" as const, label: "免签特快" },
                  { id: "asia" as const, label: "亚洲直飞" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCorridorFilter(f.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      corridorFilter === f.id
                        ? "bg-[#1D1D1F] text-white"
                        : "bg-white text-[#86868B] ring-1 ring-black/[0.06] hover:bg-[#F2F2F7]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable City Cards List */}
            <div className="no-scrollbar flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <div className="text-xs font-bold text-[#86868B] mb-2.5">
                  已上线跨国生存走廊 ({filteredCorridorMetas.length})
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {filteredCorridorMetas.map((meta) => {
                    const isSelected = meta.id === corridorId;
                    return (
                      <div
                        key={meta.id}
                        onClick={() => handleSwitchCorridor(meta.id)}
                        className={`cursor-pointer rounded-2xl p-3.5 transition-all duration-200 active:scale-[0.98] ${
                          isSelected
                            ? "bg-[#007AFF]/8 ring-2 ring-[#007AFF]"
                            : "bg-[#F2F2F7] hover:bg-[#E5E5EA]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{meta.flag}</span>
                            <div>
                              <div className="text-sm font-bold text-[#1D1D1F]">
                                {meta.city}
                              </div>
                              <div className="text-[10px] text-[#86868B]">
                                {meta.country} · {meta.code}
                              </div>
                            </div>
                          </div>
                          <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[#007AFF] shadow-2xs">
                            {meta.visaTag}
                          </span>
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {meta.highlights.map((h) => (
                            <span
                              key={h}
                              className="rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] text-[#3A3A3C]"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Cities & Community Voting Section */}
              <div className="border-t border-black/[0.06] pt-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="text-xs font-bold text-[#86868B]">
                    正在筹备与用户投票榜 (即将上线)
                  </div>
                  <span className="text-[10px] text-[#007AFF]">
                    轻点一键投票加速上线
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {UPCOMING_CITIES.map((c) => (
                    <div
                      key={c.code}
                      className="flex items-center justify-between rounded-2xl bg-[#F9F9FB] p-3 ring-1 ring-black/[0.04]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{c.flag}</span>
                        <div>
                          <div className="text-xs font-bold text-[#1D1D1F]">
                            {c.city}
                          </div>
                          <div className="text-[10px] text-[#86868B]">
                            {c.tag}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleVoteCity(c.code, c.city.split(" ")[0])
                        }
                        className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#007AFF] shadow-2xs ring-1 ring-black/[0.06] transition-transform active:scale-95"
                      >
                        👍 {voteCounts[c.code] ?? c.votes}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Dismiss */}
            <div className="p-4 border-t border-black/[0.06] bg-[#F9F9FB] flex items-center justify-between">
              <span className="text-xs text-[#86868B]">
                有想去的新城市？欢迎在社区投票
              </span>
              <button
                type="button"
                onClick={() => setShowCorridorDiscovery(false)}
                className="rounded-full bg-[#1D1D1F] px-5 py-2 text-xs font-semibold text-white"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Modal */}
      {showTodayStoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
          onClick={() => setShowTodayStoryModal(false)}
        >
          <div
            className="ios-tab-enter max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-[32px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-60 w-full">
              <img
                src={corridor.worldScenes[0]?.image}
                alt={corridor.destinationCity}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
              <button
                type="button"
                onClick={() => setShowTodayStoryModal(false)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-xs font-bold text-white backdrop-blur-md"
              >
                ✕
              </button>
              <div className="absolute inset-x-6 bottom-5">
                <div className="text-xs font-semibold text-white/80">
                  {corridor.touchdownAirports}
                </div>
                <h3 className="mt-0.5 text-2xl font-bold text-white">
                  {corridor.heroHeadline}
                </h3>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <p className="text-sm leading-relaxed text-[#3A3A3C]">
                {corridor.heroSubheadline}
              </p>
              <div className="rounded-2xl bg-[#F2F2F7] p-4 text-xs space-y-2 text-[#1D1D1F]">
                <div>
                  <span className="font-semibold text-[#86868B]">货币结算：</span>
                  {corridor.currencyInfo}
                </div>
                <div>
                  <span className="font-semibold text-[#86868B]">电源规格：</span>
                  {corridor.plugType}
                </div>
                <div>
                  <span className="font-semibold text-[#86868B]">紧急援助：</span>
                  {corridor.emergencyNumber}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTodayStoryModal(false)}
                className="w-full rounded-full bg-[#007AFF] py-3 text-xs font-semibold text-white active:scale-[0.98]"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Taxi Pass */}
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
              className="rounded-full bg-[#F2F2F7] px-4 py-2 text-xs font-bold text-[#1D1D1F] active:scale-95"
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
                className="flex items-center gap-2 rounded-full bg-[#007AFF] px-7 py-3.5 text-base font-semibold text-white active:scale-95"
              >
                <IconSpeakerWave />
                <span>语音播报给司机听</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleCopyPhrase(fullscreenDriverCard.localHeadline)
                }
                className="rounded-full bg-[#F2F2F7] px-7 py-3.5 text-base font-semibold text-[#1D1D1F] active:scale-95"
              >
                复制当地地址
              </button>
            </div>
          </div>

          <div className="text-sm text-[#86868B]">
            {fullscreenDriverCard.subwayBackup}
          </div>
        </div>
      )}
    </div>
  );
}
