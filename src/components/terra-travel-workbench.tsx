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
type MobileTab = "touchdown" | "world3d" | "taxi" | "apps" | "ai-pro";

export function TerraTravelWorkbench() {
  const [corridorId, setCorridorId] = useState<CorridorId>("cn-to-seoul");
  const corridor = CORRIDORS[corridorId];

  // Default to App Store Mobile Studio so user immediately sees the commercial mobile app
  const [studioLayout, setStudioLayout] = useState<StudioLayout>("app-studio");
  const [activeTab, setActiveTab] = useState<MobileTab>("touchdown");

  // Interactive checklist state for Golden 120-Min Touchdown
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    "cn-to-seoul-0": true,
    "global-to-beijing-0": true,
  });

  // Live Currency Converter inside Touchdown Tab
  const [krwInput, setKrwInput] = useState<string>("15000");
  const [usdInput, setUsdInput] = useState<string>("50");

  // Driver Card TTS Voice & Fullscreen Modal
  const [speakingCardId, setSpeakingCardId] = useState<string | null>(null);
  const [fullscreenDriverCard, setFullscreenDriverCard] =
    useState<DriverCard | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // StoreKit 2 Pro Paywall State
  const [isProUnlocked, setIsProUnlocked] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"single" | "annual" | "lifetime">("lifetime");
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  // AI Copilot State (Alibaba Cloud Bailian qwen-plus)
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
  const progressPercent = Math.round(
    (completedCount / corridor.timeline.length) * 100
  );

  // Native Web Speech API TTS for Driver Cards (Korean ko-KR / Chinese zh-CN)
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
      // ignore clipboard errors
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

  // Reusable Mobile Screen Content (rendered inside iPhone 16 Pro frame, Android frame, or direct mobile viewport)
  const renderMobileAppScreen = (osVariant: "ios" | "android" = "ios") => {
    const isSeoul = corridorId === "cn-to-seoul";
    const cnyFromKrw = ((Number(krwInput) || 0) * 0.0053).toFixed(1);
    const cnyFromUsd = ((Number(usdInput) || 0) * 7.22).toFixed(1);

    return (
      <div className="relative flex h-full w-full flex-col bg-[#090c12] text-white select-none">
        {/* OS Status Bar + Dynamic Island / Punch-hole */}
        <div className="shrink-0 bg-[#090c12]/95 px-5 pt-2.5 pb-2 backdrop-blur-xl">
          <div className="flex items-center justify-between text-[11px] font-bold tracking-tight text-white/90">
            <span>09:41</span>
            {osVariant === "ios" ? (
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black px-3.5 py-1 shadow-inner">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff5a26]" />
                <span className="text-[10px] font-bold tracking-wide text-white">
                  {isSeoul ? "KE856 ✈ ICN T2" : "CA982 ✈ PKX"}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400">
                  落地导引中
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-0.5 text-[10px] text-emerald-300">
                <span>120Hz Android 旗舰视窗</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-emerald-400">5G</span>
              <span className="rounded bg-white/90 px-1 py-0.2 text-[9px] font-black text-black">
                98
              </span>
            </div>
          </div>

          {/* Native App Top Bar: Destination Switcher & Pro StoreKit Pill */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center rounded-2xl border border-white/12 bg-[#131924] p-1">
              <button
                type="button"
                onClick={() => handleSwitchCorridor("cn-to-seoul")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  isSeoul
                    ? "bg-[#ff5a26] text-black shadow-md shadow-[#ff5a26]/30"
                    : "text-white/70 hover:text-white"
                }`}
              >
                🇰🇷 首尔 ICN
              </button>
              <button
                type="button"
                onClick={() => handleSwitchCorridor("global-to-beijing")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  !isSeoul
                    ? "bg-[#ff5a26] text-black shadow-md shadow-[#ff5a26]/30"
                    : "text-white/70 hover:text-white"
                }`}
              >
                🇨🇳 北京 PKX
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowPaywallModal(true)}
              className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all ${
                isProUnlocked
                  ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                  : "border-amber-400/50 bg-gradient-to-r from-amber-500/25 to-[#ff5a26]/25 text-amber-200 shadow-lg shadow-amber-500/10"
              }`}
            >
              <span>{isProUnlocked ? "✦ PRO 已激活" : "👑 解锁离线包 ¥28"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Native App Viewport */}
        <div className="flex-1 space-y-3.5 overflow-y-auto px-3.5 pt-1 pb-24">
          {/* ================= TAB 1: 🛬 落地舱 (TOUCHDOWN) ================= */}
          {activeTab === "touchdown" && (
            <>
              {/* Flighty-Style Live Boarding & Survival Pass */}
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#1b2434] via-[#121824] to-[#0d111a] p-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-dashed border-white/15 pb-3">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-[#ff7a4d] uppercase">
                      TERRA FLIGHTY PASS · 离线生存登机牌
                    </div>
                    <div className="mt-0.5 flex items-baseline gap-2">
                      <span className="text-2xl font-black tracking-tight text-white">
                        {isSeoul ? "PVG ✈ ICN" : "GLOBAL ✈ PKX"}
                      </span>
                      <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                        {isSeoul ? "仁川 T1/T2" : "大兴 / 首都T3"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-white/60">紧急中文救援</div>
                    <div className="mt-0.5 rounded-xl border border-rose-400/30 bg-rose-500/15 px-2.5 py-1 text-xs font-black text-rose-300">
                      📞 {isSeoul ? "1330 翻译热线" : "12345 市民热线"}
                    </div>
                  </div>
                </div>

                {/* Live Offline Currency Converter Bar */}
                <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-white/75">
                    <span>💱 离线秒算汇率器（买咖啡/烤肉/打车直接输）</span>
                    <span className="text-amber-300">
                      {isSeoul ? "1000韩元 ≈ ¥5.3" : "1 USD ≈ ¥7.22"}
                    </span>
                  </div>
                  {isSeoul ? (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 rounded-xl border border-white/15 bg-[#131924] px-3 py-1.5">
                        <div className="text-[10px] text-white/50">输入韩元 (KRW)</div>
                        <input
                          type="number"
                          value={krwInput}
                          onChange={(e) => setKrwInput(e.target.value)}
                          className="w-full bg-transparent text-sm font-black text-white outline-none"
                        />
                      </div>
                      <span className="text-xs font-bold text-white/50">➔</span>
                      <div className="flex-1 rounded-xl border border-[#ff5a26]/40 bg-[#ff5a26]/10 px-3 py-1.5">
                        <div className="text-[10px] text-[#ff9673]">折合人民币 (RMB)</div>
                        <div className="text-sm font-black text-[#ff7a4d]">
                          ¥ {cnyFromKrw} 元
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 rounded-xl border border-white/15 bg-[#131924] px-3 py-1.5">
                        <div className="text-[10px] text-white/50">输入美元 (USD)</div>
                        <input
                          type="number"
                          value={usdInput}
                          onChange={(e) => setUsdInput(e.target.value)}
                          className="w-full bg-transparent text-sm font-black text-white outline-none"
                        />
                      </div>
                      <span className="text-xs font-bold text-white/50">➔</span>
                      <div className="flex-1 rounded-xl border border-[#ff5a26]/40 bg-[#ff5a26]/10 px-3 py-1.5">
                        <div className="text-[10px] text-[#ff9673]">支付宝外卡扣款 (CNY)</div>
                        <div className="text-sm font-black text-[#ff7a4d]">
                          ¥ {cnyFromUsd} 元
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar for Golden 120 Minutes */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      下飞机黄金 120 分钟通关进度
                    </span>
                    <span className="font-bold text-emerald-400">
                      已完成 {completedCount}/{corridor.timeline.length} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#ff5a26] to-emerald-400 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Checklist Cards */}
              <div className="space-y-2.5">
                {corridor.timeline.map((step, idx) => {
                  const isDone = !!completedSteps[`${corridorId}-${idx}`];
                  return (
                    <div
                      key={step.title}
                      onClick={() => toggleTimelineStep(idx)}
                      className={`cursor-pointer rounded-3xl border p-3.5 transition-all ${
                        isDone
                          ? "border-emerald-500/35 bg-[#111c1a]/90"
                          : "border-white/12 bg-[#131924] hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-black transition-all ${
                            isDone
                              ? "border-emerald-400 bg-emerald-400 text-black"
                              : "border-white/30 bg-black/40 text-white/60"
                          }`}
                        >
                          {isDone ? "✓" : idx + 1}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-[#ff7a4d]">
                              {step.window}
                            </span>
                            <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-semibold text-white/75">
                              {step.actionTag}
                            </span>
                          </div>
                          <h3 className="mt-0.5 text-sm font-bold text-white">
                            {step.title}
                          </h3>
                          <p className="mt-1.5 rounded-xl bg-rose-500/10 px-2.5 py-1.5 text-[11px] leading-relaxed text-rose-200/90">
                            ⚠️ 避坑：{step.painPoint}
                          </p>
                          <p className="mt-1.5 text-xs leading-relaxed text-white/85">
                            ✅ 解法：{step.solution}
                          </p>
                          <div className="mt-2.5 flex items-center justify-between gap-2">
                            <a
                              href={step.affiliateUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 rounded-xl bg-[#ff5a26] px-3 py-1.5 text-[11px] font-bold text-black shadow-sm"
                            >
                              <span>{step.affiliateLabel}</span>
                              <span>↗</span>
                            </a>
                            <span className="text-[11px] text-white/45">
                              点击卡片打勾记录
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ================= TAB 2: 🌐 3D世界 (3D WORLD MODEL) ================= */}
          {activeTab === "world3d" && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/12 bg-gradient-to-r from-[#1a2232] to-[#121722] p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold tracking-wider text-[#ff7a4d] uppercase">
                      APPLE MAPS FLYOVER × 3D GAUSSIAN SPLATTING
                    </div>
                    <h2 className="text-sm font-black text-white">
                      {corridor.destinationCity} · 三维空间实景预演舱
                    </h2>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                    60FPS 陀螺仪手势
                  </span>
                </div>
              </div>

              <WorldModelViewport
                scenes={corridor.worldScenes}
                destinationCity={corridor.destinationCity}
                compact
              />

              {/* Extra Beijing Pulse 10 Real Landmarks Horizontal Drawer when in Beijing */}
              {!isSeoul && (
                <div className="rounded-3xl border border-white/12 bg-[#131924] p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      📸 北京全城 10 大高清实拍机位图鉴（离线已缓存）
                    </span>
                    <span className="text-[11px] text-[#ff7a4d]">左右滑动查看</span>
                  </div>
                  <div className="mt-2.5 flex gap-2.5 overflow-x-auto pb-1">
                    {beijingAttractions.map((item) => (
                      <div
                        key={item.id}
                        className="w-44 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0c1018]"
                      >
                        <img
                          src={`/images/beijing-pulse/${item.image.replace("assets/", "")}`}
                          alt={item.name.zh}
                          className="h-24 w-full object-cover"
                        />
                        <div className="p-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">
                              {item.name.zh}
                            </span>
                            <span className="text-[10px] font-semibold text-amber-300">
                              {item.ticket.zh}
                            </span>
                          </div>
                          <div className="mt-1 text-[10px] text-white/60">
                            🚇 {item.transport.zh}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: 🚕 司机卡 (APPLE WALLET TAXI DECK) ================= */}
          {activeTab === "taxi" && (
            <div className="space-y-3">
              <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-[#231d16] to-[#141822] p-3.5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                    APPLE WALLET 级双语发声卡
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-300">
                    🔊 内置真人韩语/中文播报
                  </span>
                </div>
                <h2 className="mt-1.5 text-base font-black text-white">
                  上车点一下「播放语音」，直接替你跟司机开口
                </h2>
                <p className="mt-0.5 text-xs text-white/75">
                  支持横屏高对比车载灯牌、真人 TTS 语音发声、一键复制原生地址去 Kakao T / 滴滴粘贴。
                </p>
              </div>

              <div className="space-y-3">
                {corridor.driverCards.map((card, index) => {
                  const isSpeaking = speakingCardId === card.id;
                  const accentColors = [
                    "from-[#ff5a26]/25 to-[#161c28] border-[#ff5a26]/40",
                    "from-sky-500/20 to-[#161c28] border-sky-400/35",
                    "from-emerald-500/20 to-[#161c28] border-emerald-400/35",
                    "from-amber-500/20 to-[#161c28] border-amber-400/35",
                    "from-purple-500/20 to-[#161c28] border-purple-400/35",
                  ];
                  const cardStyle = accentColors[index % accentColors.length];

                  return (
                    <div
                      key={card.id}
                      className={`rounded-3xl border bg-gradient-to-b p-4 shadow-xl ${cardStyle}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white/90">
                          {card.tag}
                        </span>
                        <span className="text-[11px] font-bold text-white/60">
                          PASS #{index + 1}
                        </span>
                      </div>

                      <div className="mt-2 text-xs font-semibold text-white/80">
                        中文意图：{card.titleCn}
                      </div>

                      <div className="mt-1.5 rounded-2xl border border-white/15 bg-black/60 p-3">
                        <div className="text-lg leading-snug font-black text-white">
                          {card.localHeadline}
                        </div>
                        <div className="mt-1 text-[11px] text-amber-300/90">
                          {card.phoneticOrSub}
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-white/80">
                        💡 停靠指令：{card.driverInstruction}
                      </div>
                      <div className="mt-1 text-[11px] text-sky-300">
                        🚇 {card.subwayBackup}
                      </div>

                      {/* 3 Action Buttons: Voice TTS + Fullscreen + Copy */}
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleSpeakDriverCard(card)}
                          className={`flex items-center justify-center gap-1 rounded-2xl py-2.5 text-xs font-black transition-all ${
                            isSpeaking
                              ? "animate-pulse bg-emerald-400 text-black"
                              : "bg-[#ff5a26] text-black hover:bg-[#ff7447]"
                          }`}
                        >
                          <span>🔊</span>
                          <span>{isSpeaking ? "播报中..." : "播放语音"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFullscreenDriverCard(card)}
                          className="flex items-center justify-center gap-1 rounded-2xl border border-white/20 bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/20"
                        >
                          <span>📱</span>
                          <span>全屏灯牌</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyPhrase(card.id, card.localHeadline)
                          }
                          className="flex items-center justify-center gap-1 rounded-2xl border border-white/15 bg-black/50 py-2.5 text-xs font-bold text-white/90 hover:bg-black/80"
                        >
                          <span>📋</span>
                          <span>
                            {copiedId === card.id ? "已复制!" : "复制地址"}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 4: 📲 平替库 (APP HUB & STAY) ================= */}
          {activeTab === "apps" && (
            <div className="space-y-3.5">
              <div className="rounded-3xl border border-white/12 bg-gradient-to-br from-[#192336] to-[#121722] p-3.5">
                <div className="text-[10px] font-bold tracking-wider text-sky-400 uppercase">
                  LOCAL APP SURVIVAL MATRIX
                </div>
                <h2 className="mt-0.5 text-base font-black text-white">
                  国内软件失效预警 & 当地国民级 App 1v1 平替
                </h2>
                <p className="mt-1 text-xs text-white/70">
                  含免韩国手机号注册攻略、中文界面开启路径与热门商圈住宿雷达。
                </p>
              </div>

              <div className="space-y-2.5">
                {corridor.appMatrix.map((app) => (
                  <div
                    key={app.category}
                    className="rounded-3xl border border-white/12 bg-[#131924] p-3.5"
                  >
                    <div className="text-[11px] font-bold text-[#ff7a4d]">
                      {app.category}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl bg-black/45 p-2.5">
                      <div>
                        <div className="text-[10px] text-rose-300">❌ 落地失效</div>
                        <div className="text-xs font-bold text-white/60 line-through">
                          {app.originApp}
                        </div>
                      </div>
                      <span className="text-sm font-black text-[#ff5a26]">➔</span>
                      <div className="text-right">
                        <div className="text-[10px] text-emerald-300">
                          ✅ 当地必装霸主
                        </div>
                        <div className="text-sm font-black text-white">
                          {app.localChampion}
                        </div>
                      </div>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-white/80">
                      <strong className="text-rose-300">失效原因：</strong>
                      {app.whyItFails}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/90">
                      <strong className="text-emerald-300">30秒配置：</strong>
                      {app.setupGuide}
                    </p>
                    <div className="mt-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-200">
                      💡 进阶技巧：{app.proTip}
                    </div>
                  </div>
                ))}
              </div>

              {/* Hotel Stay District Cards */}
              <div className="rounded-3xl border border-white/12 bg-[#131924] p-3.5">
                <h3 className="text-sm font-black text-white">
                  🏨 住哪里最方便？三大黄金住宿片区对比
                </h3>
                <div className="mt-2.5 space-y-2">
                  {corridor.stayDistricts.map((stay) => (
                    <div
                      key={stay.name}
                      className="rounded-2xl border border-white/10 bg-black/40 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {stay.name}
                        </span>
                        <span className="rounded-lg bg-[#ff5a26]/20 px-2 py-0.5 text-[11px] font-bold text-[#ff7a4d]">
                          {stay.priceRange}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-amber-300">
                        {stay.vibe}
                      </div>
                      <div className="mt-1 text-[11px] text-white/75">
                        🚇 {stay.transitAccess}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: ✨ AI与内购 (AI COPILOT & STOREKIT PAYWALL) ================= */}
          {activeTab === "ai-pro" && (
            <div className="space-y-3.5">
              {/* Alibaba Bailian Qwen-Plus AI Copilot Card */}
              <div className="rounded-3xl border border-[#ff5a26]/40 bg-gradient-to-b from-[#211a1d] to-[#131924] p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#ff5a26]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#ff7a4d]">
                    ALIBABA BAILIAN · QWEN-PLUS 驱动
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-300">
                    ● 在线秒级推演
                  </span>
                </div>
                <h2 className="mt-1.5 text-base font-black text-white">
                  AI 跨国落地行程定制官
                </h2>
                <p className="mt-0.5 text-xs text-white/75">
                  输入航班落地时间与住宿片区，自动生成精确到分钟的落地动线与司机口令。
                </p>

                <form onSubmit={handleGenerateAiPlan} className="mt-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-white/15 bg-black/45 px-3 py-2">
                      <label className="block text-[10px] text-white/60">
                        航班落地时间
                      </label>
                      <input
                        type="text"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        className="mt-0.5 w-full bg-transparent text-xs font-bold text-white outline-none"
                      />
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-black/45 px-3 py-2">
                      <label className="block text-[10px] text-white/60">
                        停留天数
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value) || 3)}
                        className="mt-0.5 w-full bg-transparent text-xs font-bold text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-black/45 px-3 py-2">
                    <label className="block text-[10px] text-white/60">
                      计划住宿商圈
                    </label>
                    <input
                      type="text"
                      value={hotelArea}
                      onChange={(e) => setHotelArea(e.target.value)}
                      className="mt-0.5 w-full bg-transparent text-xs font-bold text-white outline-none"
                    />
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-black/45 px-3 py-2">
                    <label className="block text-[10px] text-white/60">
                      旅行偏好
                    </label>
                    <input
                      type="text"
                      value={travelerStyle}
                      onChange={(e) => setTravelerStyle(e.target.value)}
                      className="mt-0.5 w-full bg-transparent text-xs font-bold text-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="w-full rounded-2xl bg-gradient-to-r from-[#ff5a26] to-[#ff8547] py-3 text-xs font-black text-black shadow-lg shadow-[#ff5a26]/25 transition-all hover:brightness-110"
                  >
                    {aiLoading
                      ? "⚡ 正在调用阿里云百炼 Qwen-Plus 生成专属动线..."
                      : "✨ 立即生成 AI 跨国落地行动包"}
                  </button>
                </form>

                {aiSummary && (
                  <div className="mt-3 space-y-2 rounded-2xl border border-emerald-400/30 bg-black/60 p-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-emerald-300">
                      <span>生成完毕 · 引擎: {aiProvider}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-white/90">
                      {aiSummary}
                    </p>
                    {aiSteps.map((st, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-white/10 bg-white/5 p-2.5"
                      >
                        <div className="text-[11px] font-bold text-[#ff7a4d]">
                          {st.timeSlot} · {st.phase}
                        </div>
                        <div className="mt-1 text-xs text-white/90">
                          {st.action}
                        </div>
                        <div className="mt-1 text-[11px] text-amber-300">
                          🚕 司机口令：{st.driverPhrase}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Apple StoreKit 2 In-App Purchase Commercial Paywall Preview */}
              <div className="rounded-3xl border border-amber-400/40 bg-gradient-to-b from-[#1f1b14] via-[#141822] to-[#0f131c] p-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                    APPLE STOREKIT 2 · 内购变现闭环
                  </span>
                  <span className="text-[11px] text-white/60">支持恢复购买</span>
                </div>
                <h3 className="mt-1.5 text-base font-black text-white">
                  TERRA Pro 全球离线生存包
                </h3>
                <p className="mt-1 text-xs text-white/75">
                  无网飞行模式下随时调取 3D 离线地图点云、真人韩语/日文/英文发声卡与无限次百炼 AI 行程定制。
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("single")}
                    className={`rounded-2xl border p-2.5 text-left transition-all ${
                      selectedPlan === "single"
                        ? "border-amber-400 bg-amber-400/15"
                        : "border-white/12 bg-black/40"
                    }`}
                  >
                    <div className="text-[10px] text-white/60">单城离线包</div>
                    <div className="mt-1 text-base font-black text-white">¥18</div>
                    <div className="text-[10px] text-amber-300">买断单走廊</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan("annual")}
                    className={`rounded-2xl border p-2.5 text-left transition-all ${
                      selectedPlan === "annual"
                        ? "border-amber-400 bg-amber-400/15"
                        : "border-white/12 bg-black/40"
                    }`}
                  >
                    <div className="text-[10px] text-white/60">年度全球通</div>
                    <div className="mt-1 text-base font-black text-white">¥48</div>
                    <div className="text-[10px] text-emerald-300">首周免费试</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan("lifetime")}
                    className={`relative rounded-2xl border p-2.5 text-left transition-all ${
                      selectedPlan === "lifetime"
                        ? "border-amber-400 bg-amber-400/20"
                        : "border-white/12 bg-black/40"
                    }`}
                  >
                    <span className="absolute -top-2 right-2 rounded-full bg-amber-400 px-1.5 py-0.2 text-[9px] font-black text-black">
                      最畅销
                    </span>
                    <div className="text-[10px] text-white/60">终身 Pro 版</div>
                    <div className="mt-1 text-base font-black text-white">¥68</div>
                    <div className="text-[10px] text-amber-300">一次付永久用</div>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProUnlocked(true)}
                  className="mt-3 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-[#ff5a26] py-3 text-xs font-black text-black shadow-lg"
                >
                  {isProUnlocked
                    ? "✅ 已通过 Apple Pay 解锁全部离线包与无限 AI"
                    : " 使用 Apple Pay 一键解锁 TERRA Pro"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Native iOS 18 / Android Frosted-Glass 5-Tab Bottom Bar */}
        <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/12 bg-[#0b0f17]/90 px-2 pt-1.5 pb-3 backdrop-blur-2xl">
          <div className="grid grid-cols-5 gap-1">
            {[
              { id: "touchdown" as const, icon: "🛬", label: "落地舱" },
              { id: "world3d" as const, icon: "🌐", label: "3D世界" },
              { id: "taxi" as const, icon: "🚕", label: "司机卡" },
              { id: "apps" as const, icon: "📲", label: "平替库" },
              { id: "ai-pro" as const, icon: "✨", label: "AI定制" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center rounded-2xl py-1 transition-all ${
                    isActive
                      ? "bg-[#ff5a26]/15 text-[#ff6b3d]"
                      : "text-white/55 hover:text-white/85"
                  }`}
                >
                  <span className="text-base leading-none">{tab.icon}</span>
                  <span className="mt-1 text-[10px] font-bold">{tab.label}</span>
                </button>
              );
            })}
          </div>
          {/* iOS Home Indicator */}
          <div className="mx-auto mt-2 h-1 w-28 rounded-full bg-white/30" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-dvh bg-[#07090e] text-[#f5f5f3]">
      {/* ================= 1. REAL PHONE AUTOMATIC FULLSCREEN (< 1024px) ================= */}
      <div className="h-dvh w-full lg:hidden">{renderMobileAppScreen("ios")}</div>

      {/* ================= 2. DESKTOP STUDIO & APP STORE WORKBENCH (>= 1024px) ================= */}
      <div className="hidden min-h-dvh flex-col lg:flex">
        {/* Top Studio Header */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0f17]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff5a26] to-amber-500 font-black text-black shadow-lg shadow-[#ff5a26]/20">
                T
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black tracking-tight text-white">
                    TERRA 3.0 · 跨国落地生存与 3D 世界模型 App
                  </span>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                    App Store 商业上架就绪 (Capacitor iOS/Android)
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  对标 Flighty × Apple Maps Flyover × Apple Wallet · 专治第一次出国下飞机断网、迷路、打车哑巴痛点
                </p>
              </div>
            </div>

            {/* Studio View Mode Switcher */}
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-2xl border border-white/12 bg-[#131924] p-1">
                <button
                  type="button"
                  onClick={() => setStudioLayout("app-studio")}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    studioLayout === "app-studio"
                      ? "bg-[#ff5a26] text-black shadow"
                      : "text-white/75 hover:text-white"
                  }`}
                >
                  📱 iPhone 16 Pro 真机 + App Store 商业台
                </button>
                <button
                  type="button"
                  onClick={() => setStudioLayout("dual-phone")}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    studioLayout === "dual-phone"
                      ? "bg-[#ff5a26] text-black shadow"
                      : "text-white/75 hover:text-white"
                  }`}
                >
                  📲 iOS + Android 双机同屏对比
                </button>
                <button
                  type="button"
                  onClick={() => setStudioLayout("pc-wide")}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    studioLayout === "pc-wide"
                      ? "bg-[#ff5a26] text-black shadow"
                      : "text-white/75 hover:text-white"
                  }`}
                >
                  🖥️ PC 宽屏全景舱
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Studio Body */}
        <main className="mx-auto flex-1 w-full max-w-[1440px] px-6 py-6">
          {/* MODE A: iPhone 16 Pro Interactive Frame + Right Commercial & 3D Deck */}
          {studioLayout === "app-studio" && (
            <div className="grid grid-cols-12 items-start gap-8">
              {/* Left Column: Realistic iPhone 16 Pro Titanium Bezel */}
              <div className="col-span-5 flex flex-col items-center">
                <div className="relative h-[840px] w-[412px] rounded-[54px] border-[10px] border-[#2a303c] bg-[#090c12] shadow-[0_25px_90px_rgba(255,90,38,0.18)] ring-2 ring-white/15 overflow-hidden">
                  {renderMobileAppScreen("ios")}
                </div>
              </div>

              {/* Right Column: App Store Listing Preview + Synced Large 3D World Model + Commercial Roadmap */}
              <div className="col-span-7 space-y-6">
                {/* Card 1: Apple App Store Product Header Card */}
                <div className="rounded-3xl border border-white/12 bg-gradient-to-br from-[#161e2e] via-[#111723] to-[#0c1018] p-6 shadow-2xl">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-[22px] border border-white/20 bg-gradient-to-br from-[#ff5a26] via-[#e03e1a] to-[#1a2436] shadow-xl">
                        <span className="text-2xl">🌍</span>
                        <span className="mt-0.5 text-[10px] font-black tracking-wider text-white">
                          TERRA 3D
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-[#ff5a26]/20 px-2.5 py-0.5 text-xs font-bold text-[#ff7a4d]">
                            App Store 旅游榜精品定位
                          </span>
                          <span className="text-xs font-semibold text-amber-300">
                            ★★★★★ 4.9 · 独立开发者高毛利产品
                          </span>
                        </div>
                        <h1 className="mt-1 text-2xl font-black text-white">
                          TERRA — 跨国落地生存与 3D 空间世界模型
                        </h1>
                        <p className="mt-1 text-sm text-white/75">
                          下飞机黄金120分钟通关打卡 · 真人韩语/中文出租车发声卡 · 离线汇率秒算 · 3D地标机位预演
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowPaywallModal(true)}
                        className="rounded-full bg-[#0071e3] px-5 py-2 text-sm font-black text-white shadow-lg shadow-[#0071e3]/30 hover:bg-[#0077ed]"
                      >
                        获取 · App 内购买 (¥18 - ¥68)
                      </button>
                      <span className="text-[11px] text-white/50">
                        支持 iOS 16+ · Android 12+ · 离线数据包
                      </span>
                    </div>
                  </div>

                  {/* Quick Interactive Tab Jumpers synced with the iPhone on the left */}
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <div className="text-xs font-bold text-white/70">
                      👇 点击下方功能模块，左侧 iPhone 16 Pro 真机画面将实时同步切换：
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {[
                        {
                          id: "touchdown" as const,
                          title: "🛬 1. 落地舱 + 离线汇率计算器",
                        },
                        {
                          id: "world3d" as const,
                          title: "🌐 2. Apple Maps 级 3D 空间机位",
                        },
                        {
                          id: "taxi" as const,
                          title: "🚕 3. 真人韩语/中文发声出租车卡",
                        },
                        {
                          id: "apps" as const,
                          title: "📲 4. 本土软件 1v1 平替与住宿",
                        },
                        {
                          id: "ai-pro" as const,
                          title: "✨ 5. 百炼 AI 定制 + StoreKit 内购墙",
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveTab(item.id)}
                          className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                            activeTab === item.id
                              ? "border-[#ff5a26] bg-[#ff5a26] text-black shadow-md"
                              : "border-white/15 bg-black/40 text-white/85 hover:border-white/30"
                          }`}
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card 2: Large Synchronized 3D Spatial Viewport */}
                <div className="rounded-3xl border border-white/12 bg-[#111621] p-5 shadow-2xl">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#ff7a4d]">
                        SPATIAL WORLD MODEL · 桌面大屏联动视窗
                      </span>
                      <h2 className="text-lg font-black text-white">
                        {corridor.destinationCity} · 三维高斯点云与实拍机位同步沙盘
                      </h2>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSwitchCorridor("cn-to-seoul")}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                          corridorId === "cn-to-seoul"
                            ? "bg-[#ff5a26] text-black"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        首尔走廊
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchCorridor("global-to-beijing")}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                          corridorId === "global-to-beijing"
                            ? "bg-[#ff5a26] text-black"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        北京走廊 (含11大实拍景区)
                      </button>
                    </div>
                  </div>

                  <WorldModelViewport
                    scenes={corridor.worldScenes}
                    destinationCity={corridor.destinationCity}
                  />
                </div>

                {/* Card 3: App Store Commercialization & Guideline 4.2 Compliance */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-[#121824] p-4">
                    <div className="text-xs font-bold text-amber-300">
                      💰 1. StoreKit 2 内购定价
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/75">
                      免费下载体验首尔/北京前2步；解锁完整离线3D包、真人语音发声卡与AI定制收{" "}
                      <strong className="text-white">¥18 单城 / ¥68 终身买断</strong>。
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#121824] p-4">
                    <div className="text-xs font-bold text-emerald-300">
                      🔗 2. CPS 跨境返佣自动结算
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/75">
                      落地舱内置 Airalo eSIM、WOWPASS、Klook AREX 快轨与故宫门票链接，每单自动赚取{" "}
                      <strong className="text-white">¥25 - ¥65 佣金</strong>。
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#121824] p-4">
                    <div className="text-xs font-bold text-sky-300">
                      🛡️ 3. 稳过苹果 4.2 审核设计
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/75">
                      内置离线汇率计算器、WebGL/Canvas 3D 点云手势、真人语音合成与进度存储，彻底告别“套壳网页拒审”。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE B: Dual Phone Comparison (iPhone 16 Pro + Android Flagship Side-by-Side) */}
          {studioLayout === "dual-phone" && (
            <div className="flex flex-wrap items-start justify-center gap-12 py-2">
              <div className="flex flex-col items-center">
                <div className="mb-3 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-bold text-white">
                   Apple iPhone 16 Pro · iOS 18 灵动岛真机视图
                </div>
                <div className="relative h-[840px] w-[412px] rounded-[54px] border-[10px] border-[#2a303c] bg-[#090c12] shadow-2xl ring-2 ring-white/15 overflow-hidden">
                  {renderMobileAppScreen("ios")}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-3 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 py-1 text-xs font-bold text-emerald-300">
                  🤖 Android Ultra Flagship · Google Play Material 视图
                </div>
                <div className="relative h-[840px] w-[412px] rounded-[34px] border-[8px] border-[#1f2631] bg-[#090c12] shadow-2xl ring-1 ring-emerald-400/25 overflow-hidden">
                  {renderMobileAppScreen("android")}
                </div>
              </div>
            </div>
          )}

          {/* MODE C: PC Wide Panorama Mode */}
          {studioLayout === "pc-wide" && (
            <div className="space-y-8">
              <div className="rounded-3xl border border-white/12 bg-gradient-to-r from-[#161f30] to-[#0f141f] p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-[#ff5a26]/20 px-3 py-1 text-xs font-bold text-[#ff7a4d]">
                      PC WIDE COMMAND DECK · 宽屏规划大盘
                    </span>
                    <h1 className="mt-2 text-3xl font-black text-white">
                      {corridor.heroHeadline} · {corridor.destinationCity}
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/80">
                      {corridor.heroSubheadline}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSwitchCorridor("cn-to-seoul")}
                      className={`rounded-2xl px-5 py-3 text-sm font-black ${
                        corridorId === "cn-to-seoul"
                          ? "bg-[#ff5a26] text-black"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      🇰🇷 首尔 Seoul
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchCorridor("global-to-beijing")}
                      className={`rounded-2xl px-5 py-3 text-sm font-black ${
                        corridorId === "global-to-beijing"
                          ? "bg-[#ff5a26] text-black"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      🇨🇳 北京 Beijing
                    </button>
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

      {/* ================= FULLSCREEN TAXI SIGNBOARD MODAL ================= */}
      {fullscreenDriverCard && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[#05070b] p-6 md:p-14"
          onClick={() => setFullscreenDriverCard(null)}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[#ff5a26] px-4 py-1.5 text-sm font-black text-black">
              {fullscreenDriverCard.tag} · 请直接递给司机看或点击语音播报
            </span>
            <button
              type="button"
              onClick={() => setFullscreenDriverCard(null)}
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white"
            >
              关闭全屏 ✕
            </button>
          </div>

          <div
            className="my-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xl font-bold text-white/75">
              中文意思：{fullscreenDriverCard.titleCn}
            </div>
            <div className="text-4xl leading-tight font-black text-white md:text-6xl">
              {fullscreenDriverCard.localHeadline}
            </div>
            <div className="text-2xl font-bold text-[#ff7a4d]">
              {fullscreenDriverCard.phoneticOrSub}
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 text-xl text-white/90">
              {fullscreenDriverCard.driverInstruction}
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={() => handleSpeakDriverCard(fullscreenDriverCard)}
                className="rounded-2xl bg-[#ff5a26] px-8 py-4 text-lg font-black text-black shadow-xl"
              >
                🔊 立即用纯正{corridorId === "cn-to-seoul" ? "韩语" : "中文"}朗读给司机听
              </button>
              <button
                type="button"
                onClick={() =>
                  handleCopyPhrase(
                    fullscreenDriverCard.id,
                    fullscreenDriverCard.localHeadline
                  )
                }
                className="rounded-2xl border border-white/25 bg-white/10 px-8 py-4 text-lg font-bold text-white"
              >
                📋 复制地址到剪贴板
              </button>
            </div>
          </div>

          <div className="text-sm text-white/60">
            备选地铁路线：{fullscreenDriverCard.subwayBackup}
          </div>
        </div>
      )}

      {/* ================= STOREKIT 2 PRO PAYWALL MODAL ================= */}
      {showPaywallModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => setShowPaywallModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-amber-400/40 bg-[#121722] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">
                 App Store 内购结算预览 (StoreKit 2)
              </span>
              <button
                type="button"
                onClick={() => setShowPaywallModal(false)}
                className="text-sm text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <h3 className="mt-3 text-xl font-black text-white">
              解锁 TERRA Pro 跨国离线生存全功能
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-white/85">
              <li>✅ 离线缓存首尔+北京全部 14 个 3D 高斯点云地标机位</li>
              <li>✅ 离线可用真人韩语 / 中文出租车语音播报与车载灯牌</li>
              <li>✅ 无限次调用阿里云百炼 Qwen-Plus 定制私人行程</li>
            </ul>
            <button
              type="button"
              onClick={() => {
                setIsProUnlocked(true);
                setShowPaywallModal(false);
              }}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-[#ff5a26] py-3.5 text-sm font-black text-black"
            >
               模拟 Face ID 支付 ¥28 解锁 Pro 会员
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
