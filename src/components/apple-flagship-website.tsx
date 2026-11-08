"use client";

import React, { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import {
  Smartphone,
  Copy,
  Check,
  Compass,
  ArrowRight,
  QrCode,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Navigation,
  SlidersHorizontal,
  Eye,
  ShieldCheck,
  Clock,
  Radio,
  FileText,
  MapPin,
  Car,
  Volume2,
  Search,
  Maximize2,
  Calendar,
  Layers,
  CheckCircle2,
  Circle,
  HelpCircle,
  Globe2,
  Download,
  Share2,
  Cpu,
  Sun,
} from "lucide-react";
import { WorldModelViewport } from "@/components/world-model-viewport";
import { CORRIDORS, type CorridorId, type DriverCard } from "@/lib/corridors-data";
import { buildFallbackPlan, type GeneratedPlanItem } from "@/lib/survival-engine";

const CITIES = [
  { id: "cn-to-seoul" as CorridorId, name: "首尔 Seoul", hub: "ICN 仁川 / GMP 金浦", currencySymbol: "₩", rate: 0.0053, desc: "AREX 直通快轨 · 景福宫中轴线 · 圣水洞街区" },
  { id: "global-to-beijing" as CorridorId, name: "北京 Beijing", hub: "PKX 大兴 / PEK 首都", currencySymbol: "¥", rate: 1.0, desc: "大兴机场线 · 紫禁城东华门捷径 · 皇城中轴线" },
  { id: "cn-to-tokyo" as CorridorId, name: "东京 Tokyo", hub: "HND 羽田 / NRT 成田", currencySymbol: "¥", rate: 0.048, desc: "京急线与 Skyliner · Suica 手机交通卡 · 涩谷十字路口" },
  { id: "cn-to-bangkok" as CorridorId, name: "曼谷 Bangkok", hub: "BKK 素万那普 / DMK 廊曼", currencySymbol: "฿", rate: 0.21, desc: "ARL 机场快线 · 永久免签快速通关 · 湄南河水运避堵" },
];

export function AppleFlagshipWebsite() {
  const [currentUrl, setCurrentUrl] = useState<string>("https://terra-world-travel.153557421.workers.dev");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [activeCity, setActiveCity] = useState<CorridorId>("cn-to-seoul");
  const [activeConsoleTab, setActiveConsoleTab] = useState<"checklist" | "currency" | "driver" | "generator">("checklist");
  const [downloadModal, setDownloadModal] = useState<"apple" | "android" | null>(null);

  // 1. 落地清单交互状态 (持久化可打卡)
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    "cn-to-seoul-0": true,
  });

  // 2. 汇率换算交互状态
  const [foreignAmount, setForeignAmount] = useState<string>("50000");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // 3. 出租车大卡搜索与全屏弹窗
  const [taxiSearch, setTaxiSearch] = useState<string>("");
  const [fullscreenDriverCard, setFullscreenDriverCard] = useState<DriverCard | null>(null);

  // 4. 专属行程定制生成器交互状态
  const [arrivalTime, setArrivalTime] = useState<string>("09:30");
  const [tripDays, setTripDays] = useState<number>(3);
  const [travelerStyle, setTravelerStyle] = useState<string>("商务特快与效率第一");
  const [hotelDistrict, setHotelDistrict] = useState<string>("明洞 / 弘大核心区");
  const [generatedPlan, setGeneratedPlan] = useState<{ summary: string; steps: GeneratedPlanItem[] } | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    const origin =
      typeof window !== "undefined" && window.location.origin.includes("workers.dev")
        ? window.location.origin
        : "https://terra-world-travel.153557421.workers.dev";

    QRCode.toDataURL(origin, {
      width: 480,
      margin: 1,
      color: {
        dark: "#ffffff",
        light: "#00000000",
      },
    })
      .then((dataUri) => {
        setCurrentUrl(origin);
        setQrCodeDataUrl(dataUri);
      })
      .catch((err) => console.error("QR Code Error:", err));
  }, []);

  const handleCopyUrl = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const input = document.createElement("input");
        input.value = currentUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const corridorData = CORRIDORS[activeCity] ?? CORRIDORS["cn-to-seoul"];
  const currentCityConfig = useMemo(() => CITIES.find((c) => c.id === activeCity) ?? CITIES[0], [activeCity]);

  // 计算汇率
  const cnyEquivalent = useMemo(() => {
    const val = parseFloat(foreignAmount) || 0;
    return (val * currentCityConfig.rate).toFixed(1);
  }, [foreignAmount, currentCityConfig]);

  // 切换打卡状态
  const toggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  // 语音播报司机卡发音 (Web Speech API)
  const speakText = (text: string, lang = "ko-KR") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("当前浏览器暂不支持语音合成，请在手机端使用。");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  // 生成行程计划
  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const plan = buildFallbackPlan(
        activeCity,
        arrivalTime,
        tripDays,
        travelerStyle,
        hotelDistrict
      );
      setGeneratedPlan(plan);
      setIsGenerating(false);
    }, 600);
  };

  // 过滤司机卡
  const filteredDriverCards = useMemo(() => {
    if (!taxiSearch.trim()) return corridorData.driverCards;
    const q = taxiSearch.toLowerCase();
    return corridorData.driverCards.filter(
      (c) =>
        c.titleCn.toLowerCase().includes(q) ||
        c.localHeadline.toLowerCase().includes(q) ||
        c.phoneticOrSub.toLowerCase().includes(q)
    );
  }, [corridorData, taxiSearch]);

  return (
    <div className="min-h-screen bg-[#050507] text-[#f5f5f7] font-sans antialiased selection:bg-[#ff5a26]/30 selection:text-white">
      {/* 顶部 Apple 极简晶透玻璃导航 */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#050507]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-12">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff5a26] to-[#d63f0a] text-white shadow-md shadow-[#ff5a26]/25">
              <Compass className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold tracking-tight text-white">TERRA</span>
              <span className="hidden sm:inline-block font-mono-numbers text-[10px] tracking-widest text-zinc-500 uppercase">
                SPATIAL WORLD MODEL OS
              </span>
            </div>
          </div>

          {/* 城市快速切换 */}
          <div className="flex items-center gap-1 rounded-full border border-white/[0.1] bg-white/[0.03] p-1">
            {CITIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCity(c.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  activeCity === c.id
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {c.name.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Download Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setDownloadModal("apple")}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-white transition hover:border-white/30 hover:bg-white/[0.12] active:scale-95"
            >
              <span></span>
              <span>iPhone 版</span>
            </button>
            <button
              onClick={() => setDownloadModal("android")}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-black transition hover:bg-zinc-200 active:scale-95"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>真机体验</span>
            </button>
          </div>
        </div>
      </header>

      {/* 复制成功全局 Toast */}
      {copied && (
        <div className="fixed top-16 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-zinc-950/90 px-4 py-2 text-xs font-medium text-emerald-400 shadow-2xl backdrop-blur-xl">
            <Check className="h-4 w-4" />
            <span>真机在线链接已复制，可在手机 Safari 或微信中直接打开</span>
          </div>
        </div>
      )}

      {/* Hero 空间世界模型首屏舞台 */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24">
        {/* 背景钛金微光 */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-[#ff5a26]/10 via-orange-600/5 to-transparent blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
          {/* 标语区 */}
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#ff5a26]" />
              <span className="font-mono-numbers tracking-wide">SPATIAL WORLD MODEL & TOUCHDOWN PROTOCOL</span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              <span className="block text-white">看见空间。</span>
              <span className="block bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
                预演跨国落地的每一步物理因果。
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base font-normal leading-relaxed text-zinc-400">
              大语言模型理解文字，世界模型理解三维物理空间与时空推演。
              在出发前，第一视角 1:1 连续漫游真实动线、推演 24 小时光影与复杂枢纽换乘。
            </p>
          </div>

          {/* 核心舞台：高保真空间世界模型推演舱 (Hero Centerpiece) */}
          <div className="mt-10 rounded-3xl border border-white/[0.1] bg-black/60 p-4 md:p-6 backdrop-blur-2xl shadow-2xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{currentCityConfig.name}</span>
                    <span className="text-xs font-normal text-zinc-400">({currentCityConfig.hub})</span>
                  </h2>
                  <p className="text-xs text-zinc-400">{currentCityConfig.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyUrl}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-white/20 hover:text-white transition"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>分享推演视窗</span>
                </button>
              </div>
            </div>

            {/* 世界模型视窗组件 */}
            <WorldModelViewport
              scenes={corridorData.worldScenes}
              destinationCity={corridorData.destinationCity}
              compact={false}
            />
          </div>
        </div>
      </section>

      {/* 第二屏：PC 端全功能实战控制台 (Touchdown Tactical Station) */}
      <section id="interactive-console" className="relative border-t border-white/[0.08] py-16 md:py-24 bg-[#08080a]">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1 text-xs font-medium text-zinc-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>实战控制舱 · 100% 真实交互</span>
              </div>
              <h2 className="mt-3 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                下飞机黄金 120 分钟落地生存规程
              </h2>
              <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
                脱离了纸上谈兵。在 PC 端直接打卡落地步骤、实时换算多国外币、调用带语音播报的出租车求助卡、并生成专属时空路书。
              </p>
            </div>

            {/* 功能切换 Tab */}
            <div className="flex items-center gap-1 rounded-2xl border border-white/[0.1] bg-black/40 p-1.5 backdrop-blur-md">
              <button
                onClick={() => setActiveConsoleTab("checklist")}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeConsoleTab === "checklist"
                    ? "bg-[#ff5a26] text-white shadow-lg shadow-[#ff5a26]/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                落地通关清单
              </button>
              <button
                onClick={() => setActiveConsoleTab("currency")}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeConsoleTab === "currency"
                    ? "bg-[#ff5a26] text-white shadow-lg shadow-[#ff5a26]/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                多币种实时换算
              </button>
              <button
                onClick={() => setActiveConsoleTab("driver")}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeConsoleTab === "driver"
                    ? "bg-[#ff5a26] text-white shadow-lg shadow-[#ff5a26]/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                双语司机求助卡
              </button>
              <button
                onClick={() => setActiveConsoleTab("generator")}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeConsoleTab === "generator"
                    ? "bg-[#ff5a26] text-white shadow-lg shadow-[#ff5a26]/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                时空路书生成器
              </button>
            </div>
          </div>

          {/* TAB 1: 落地打卡清单 */}
          {activeConsoleTab === "checklist" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
              {corridorData.timeline.map((step, idx) => {
                const stepKey = `${activeCity}-${idx}`;
                const isDone = completedSteps[stepKey];
                return (
                  <div
                    key={step.title}
                    className={`group relative rounded-2xl border p-6 transition-all ${
                      isDone
                        ? "border-emerald-500/30 bg-emerald-950/10"
                        : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-numbers text-xs text-zinc-500 font-semibold uppercase">
                            {step.window}
                          </span>
                          <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] text-zinc-300">
                            {step.actionTag}
                          </span>
                        </div>
                        <h3 className="mt-2 text-lg font-bold text-white tracking-tight">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-xs text-rose-300/90 leading-relaxed">
                          ⚠️ 痛点断层：{step.painPoint}
                        </p>
                        <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                          ✅ 确定性解法：{step.solution}
                        </p>
                      </div>

                      {/* 真实打卡复选框 */}
                      <button
                        onClick={() => toggleStep(stepKey)}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all ${
                          isDone
                            ? "border-emerald-500 bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                            : "border-white/20 bg-white/5 text-zinc-500 hover:border-white/40 hover:text-white"
                        }`}
                      >
                        {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : idx + 1}
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                      <span className="text-zinc-500">
                        {isDone ? "已通过预演验证" : "点击右上方确认该步骤已准备就绪"}
                      </span>
                      <a
                        href={step.affiliateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-[#ff5a26] hover:underline"
                      >
                        <span>{step.affiliateLabel}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: 多币种实时换算器 */}
          {activeConsoleTab === "currency" && (
            <div className="mx-auto max-w-3xl rounded-3xl border border-white/[0.1] bg-white/[0.02] p-8 backdrop-blur-xl animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">跨国即时汇率无级换算器</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    当前目的地：{currentCityConfig.name} ({corridorData.currencyInfo})
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.05] px-3 py-1.5 font-mono-numbers text-xs text-emerald-400 border border-emerald-500/20">
                  实时中间价：1 {currentCityConfig.currencySymbol} ≈ {currentCityConfig.rate} RMB
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-5">
                  <label className="block text-xs font-mono-numbers text-zinc-500 uppercase">
                    外币输入 ({currentCityConfig.currencySymbol})
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-2xl font-bold text-white">{currentCityConfig.currencySymbol}</span>
                    <input
                      type="number"
                      value={foreignAmount}
                      onChange={(e) => setForeignAmount(e.target.value)}
                      className="w-full bg-transparent text-2xl font-bold font-mono-numbers text-white focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-5">
                  <label className="block text-xs font-mono-numbers text-zinc-500 uppercase">
                    折合人民币 (RMB)
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-2xl font-bold text-emerald-400">¥</span>
                    <span className="text-3xl font-bold font-mono-numbers text-emerald-400">
                      {cnyEquivalent}
                    </span>
                  </div>
                </div>
              </div>

              {/* 常用面额快捷换算表 */}
              <div className="mt-8">
                <div className="text-xs font-mono-numbers text-zinc-500 uppercase mb-3">
                  常用日常消费标尺 (点击快速填入)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "便利店便当/咖啡", amt: "5000" },
                    { label: "单程地铁快轨", amt: "15000" },
                    { label: "街头烤肉/简餐", amt: "45000" },
                    { label: "核心商圈出租车", amt: "25000" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setForeignAmount(item.amt)}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      <div className="text-[11px] text-zinc-400">{item.label}</div>
                      <div className="mt-1 font-mono-numbers text-xs font-bold text-white">
                        {currentCityConfig.currencySymbol} {item.amt}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 双语出租车大卡 */}
          {activeConsoleTab === "driver" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={taxiSearch}
                    onChange={(e) => setTaxiSearch(e.target.value)}
                    placeholder="搜索目的地 (例如：弘大、明洞、东大门)..."
                    className="w-full rounded-full border border-white/[0.1] bg-black/40 py-2 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:border-[#ff5a26] focus:outline-none"
                  />
                </div>
                <div className="text-xs text-zinc-400">
                  支持点击扬声器调用真实发音，或点击卡片展开全屏大字模式递给司机
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDriverCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition hover:border-white/20"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-[#ff5a26]/10 px-2 py-0.5 text-[10px] font-semibold text-[#ff5a26]">
                          {card.tag}
                        </span>
                        <button
                          onClick={() => speakText(card.localHeadline)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                          title="发音朗读"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <h4 className="mt-3 text-base font-bold text-white">{card.titleCn}</h4>
                      <p className="mt-1 text-sm font-semibold text-amber-300 leading-snug">
                        {card.localHeadline}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400 font-mono-numbers">
                        {card.phoneticOrSub}
                      </p>
                      <p className="mt-3 rounded-lg bg-black/40 p-2.5 text-xs text-zinc-300">
                        {card.driverInstruction}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                      <span className="text-[11px] text-zinc-500">备选：{card.subwayBackup}</span>
                      <button
                        onClick={() => setFullscreenDriverCard(card)}
                        className="inline-flex items-center gap-1 font-semibold text-[#ff5a26] hover:underline"
                      >
                        <Maximize2 className="h-3 w-3" />
                        <span>全屏大字卡</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: 时空路书生成器 */}
          {activeConsoleTab === "generator" && (
            <div className="mx-auto max-w-4xl rounded-3xl border border-white/[0.1] bg-white/[0.02] p-8 backdrop-blur-xl animate-in fade-in duration-300">
              <div className="border-b border-white/[0.08] pb-6">
                <h3 className="text-xl font-bold text-white">时空世界模型路书自主推演生成器</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  基于目的地世界模型节点与物理通关规律，自主推演最佳第一视角落地执行方案。
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400">预计到达时间</label>
                  <input
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#ff5a26] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400">停留天数</label>
                  <select
                    value={tripDays}
                    onChange={(e) => setTripDays(parseInt(e.target.value, 10))}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#ff5a26] focus:outline-none"
                  >
                    <option value={2}>2 天 (极速过境)</option>
                    <option value={3}>3 天 (经典漫游)</option>
                    <option value={5}>5 天 (深度体验)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400">出行风格偏好</label>
                  <select
                    value={travelerStyle}
                    onChange={(e) => setTravelerStyle(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#ff5a26] focus:outline-none"
                  >
                    <option value="商务特快与效率第一">商务特快与效率第一</option>
                    <option value="独立摄影与机位扫街">独立摄影与机位扫街</option>
                    <option value="亲子家庭与舒适避坑">亲子家庭与舒适避坑</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400">预选住宿商圈</label>
                  <input
                    type="text"
                    value={hotelDistrict}
                    onChange={(e) => setHotelDistrict(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#ff5a26] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff5a26] px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#ff5a26]/25 transition hover:bg-[#ff6c3d] disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isGenerating ? "正在空间建模推演..." : "开始自主空间推演"}</span>
                </button>
              </div>

              {/* 生成结果展示 */}
              {generatedPlan && (
                <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
                    <div className="text-sm font-bold text-white">
                      推演成功 · {generatedPlan.summary}
                    </div>
                    <button
                      onClick={() => {
                        const content = generatedPlan.steps
                          .map((s) => `${s.timeSlot} | ${s.phase}: ${s.action} (提示: ${s.localAppTip})`)
                          .join("\n");
                        navigator.clipboard.writeText(content);
                        alert("路书已成功复制到剪贴板！");
                      }}
                      className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                    >
                      <Copy className="h-3 w-3" />
                      <span>复制全文本路书</span>
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">
                    {generatedPlan.steps.map((st, i) => (
                      <div key={i} className="flex flex-col sm:flex-row items-start gap-3 rounded-xl bg-black/40 p-4 border border-white/5">
                        <span className="font-mono-numbers text-xs font-bold text-emerald-400 shrink-0 bg-emerald-500/10 px-2 py-1 rounded-md">
                          {st.timeSlot}
                        </span>
                        <div className="space-y-1.5 flex-1">
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{st.phase}</span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {st.action}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                            <span className="text-[#ff5a26] font-medium">💡 本土协同：{st.localAppTip}</span>
                            <span className="text-amber-300/90 font-mono-numbers">🚕 双语卡：{st.driverPhrase}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 第三屏：世界模型核心技术深度解密 (Architecture & Depth) */}
      <section className="relative border-t border-white/[0.08] py-20 bg-[#050507]">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-zinc-300">
              <Cpu className="h-3.5 w-3.5 text-[#ff5a26]" />
              <span className="font-mono-numbers tracking-wide">CORE NEURAL ENGINE ARCHITECTURE</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight sm:text-5xl">
              为什么世界模型是空间智能的终局？
            </h2>
            <p className="mt-4 text-base text-zinc-400 leading-relaxed">
              传统的二维全景拼贴无法理解物理深度的遮挡关系，更无法模拟光照、人流与时间的因果演进。
              TERRA 基于三层空间神经世界模型架构，打造确定性的空间生存底座。
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white tracking-tight">
                3D 高斯泼溅 (3DGS) 空间底座
              </h3>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                放弃低效的网格建模，以数百万个带有协方差矩阵的三维高斯椭球体连续表征真实空间。
                在手机浏览器中即可实现 120 FPS 的第一视角平滑穿梭与任意自由机位渲染。
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
                <Sun className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white tracking-tight">
                24 小时时空光影与物理因果推演
              </h3>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                世界模型具备“What-If”因果推理能力。输入不同到达时刻，系统自主推演太阳高度角、长投影分布与人流高峰波谷，
                消除因现场施工、背光或排队导致的旅行踩坑。
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white tracking-tight">
                零网络依赖的离线生存引擎
              </h3>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                所有核心地理坐标、双语司机急救卡、离线汇率换算与通关规程全部编译进本地 ServiceWorker。
                即便在机舱尚未联网或地下隧道无信号时，关键生存功能 100% 毫秒级立即可用。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 第四屏：无缝流转移动端与获取客户端 (Mobile Handoff & Download Hub) */}
      <section id="download-hub" className="relative border-t border-white/[0.08] py-20 bg-[#08080a]">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="rounded-3xl border border-white/[0.1] bg-gradient-to-b from-white/[0.04] to-transparent p-8 md:p-14 backdrop-blur-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1 text-xs font-medium text-[#ff5a26]">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>全端无缝流转体验</span>
                </div>
                <h2 className="mt-4 text-3xl font-extrabold text-white tracking-tight sm:text-5xl">
                  在 PC 上完成预演，<br />
                  在手机端随时随地使用。
                </h2>
                <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-lg">
                  支持 iPhone 16 Pro 与 Android 全系旗舰设备。扫描右侧二维码，秒级唤起 120Hz 离线 PWA 原生应用，
                  无需等待 App Store 审核下载，随时随地保驾护航。
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={() => setDownloadModal("apple")}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-black transition hover:bg-zinc-200 active:scale-95"
                  >
                    <span className="text-sm"></span>
                    <span>Apple iPhone 安装指南</span>
                  </button>

                  <button
                    onClick={() => setDownloadModal("android")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-6 py-3 text-xs font-semibold text-white transition hover:bg-white/[0.14] active:scale-95"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Android 独立端配置</span>
                  </button>

                  <button
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-medium text-zinc-300 hover:text-white transition"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>复制真机链接</span>
                  </button>
                </div>
              </div>

              {/* 右侧动态高保真真机二维码 */}
              <div className="flex flex-col items-center justify-center">
                <div className="rounded-3xl border border-white/15 bg-black/60 p-6 shadow-2xl backdrop-blur-2xl">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="TERRA 真机体验二维码"
                      className="h-64 w-64 rounded-2xl object-contain ring-1 ring-white/10"
                    />
                  ) : (
                    <div className="flex h-64 w-64 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500 text-xs">
                      生成二维码中...
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <p className="text-xs font-semibold text-white">使用 iPhone 或 Android 微信 / 相机扫码</p>
                    <p className="mt-1 text-[11px] font-mono-numbers text-zinc-500 truncate max-w-[260px]">
                      {currentUrl}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 极简 Apple 风格页脚 */}
      <footer className="border-t border-white/[0.08] py-12 bg-[#050507] text-zinc-500 text-xs">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">TERRA</span>
            <span>· 物理空间世界模型与跨国落地生存操作系统</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/wangguode/terra-world-travel" target="_blank" rel="noreferrer" className="hover:text-white transition">
              GitHub 源码
            </a>
            <a href="#interactive-console" className="hover:text-white transition">
              实战控制舱
            </a>
            <a href="#download-hub" className="hover:text-white transition">
              真机获取
            </a>
          </div>
        </div>
      </footer>

      {/* 全屏中外双语司机大卡弹窗 */}
      {fullscreenDriverCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/20 bg-zinc-950 p-8 shadow-2xl">
            <button
              onClick={() => setFullscreenDriverCard(null)}
              className="absolute top-6 right-6 rounded-full bg-white/10 p-2 text-zinc-400 hover:text-white transition"
            >
              ✕
            </button>

            <span className="rounded-md bg-[#ff5a26] px-2.5 py-1 text-xs font-bold text-white uppercase">
              {fullscreenDriverCard.tag} · 请向出租车司机出示
            </span>

            <h3 className="mt-6 text-2xl font-bold text-zinc-400">{fullscreenDriverCard.titleCn}</h3>

            <div className="mt-4 rounded-2xl bg-white/[0.05] p-6 border border-white/10">
              <div className="text-3xl md:text-4xl font-extrabold text-amber-300 leading-snug">
                {fullscreenDriverCard.localHeadline}
              </div>
              <div className="mt-3 text-sm text-zinc-400 font-mono-numbers">
                {fullscreenDriverCard.phoneticOrSub}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-black/40 p-4 text-sm text-zinc-200 leading-relaxed">
              👉 {fullscreenDriverCard.driverInstruction}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => speakText(fullscreenDriverCard.localHeadline)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-zinc-200 transition"
              >
                <Volume2 className="h-4 w-4" />
                <span>{isPlayingAudio ? "正在发音播报..." : "语音发音朗读"}</span>
              </button>

              <button
                onClick={() => setFullscreenDriverCard(null)}
                className="rounded-full border border-white/20 px-6 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition"
              >
                返回控制台
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apple iPhone 获取指南弹窗 */}
      {downloadModal === "apple" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-zinc-950 p-8 shadow-2xl">
            <button
              onClick={() => setDownloadModal(null)}
              className="absolute top-6 right-6 rounded-full bg-white/10 p-2 text-zinc-400 hover:text-white transition"
            >
              ✕
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black text-2xl font-bold mb-4">
              
            </div>

            <h3 className="text-xl font-bold text-white">iPhone 原生离线添加指南</h3>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              TERRA 采用原生 PWA 与 WebGL 架构，享有 120Hz 丝滑渲染与全屏沉浸感：
            </p>

            <div className="mt-6 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff5a26] text-white font-bold text-[10px]">
                  1
                </span>
                <span className="text-zinc-300">用 iPhone 原生 Safari 浏览器扫描或打开当前网址。</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff5a26] text-white font-bold text-[10px]">
                  2
                </span>
                <span className="text-zinc-300">点击 Safari 底部中间的「分享 (Share)」图标。</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff5a26] text-white font-bold text-[10px]">
                  3
                </span>
                <span className="text-zinc-300">向下滑动并选择「添加到主屏幕 (Add to Home Screen)」。</span>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleCopyUrl}
                className="flex-1 rounded-full bg-[#ff5a26] py-2.5 text-xs font-bold text-white hover:bg-[#ff6c3d] transition"
              >
                复制体验链接
              </button>
              <button
                onClick={() => setDownloadModal(null)}
                className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Android 获取指南弹窗 */}
      {downloadModal === "android" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-zinc-950 p-8 shadow-2xl">
            <button
              onClick={() => setDownloadModal(null)}
              className="absolute top-6 right-6 rounded-full bg-white/10 p-2 text-zinc-400 hover:text-white transition"
            >
              ✕
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-black text-2xl font-bold mb-4">
              <Smartphone className="h-6 w-6" />
            </div>

            <h3 className="text-xl font-bold text-white">Android 原生快速安装</h3>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              在 Chrome 或系统浏览器中打开后，即可一键安装至桌面：
            </p>

            <div className="mt-6 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black font-bold text-[10px]">
                  1
                </span>
                <span className="text-zinc-300">使用 Android 浏览器扫描或直接访问网址。</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black font-bold text-[10px]">
                  2
                </span>
                <span className="text-zinc-300">点击右上角菜单，选择「安装应用」或「添加到主屏幕」。</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black font-bold text-[10px]">
                  3
                </span>
                <span className="text-zinc-300">即可生成独立应用图标，支持离线缓存运行。</span>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleCopyUrl}
                className="flex-1 rounded-full bg-white py-2.5 text-xs font-bold text-black hover:bg-zinc-200 transition"
              >
                复制体验链接
              </button>
              <button
                onClick={() => setDownloadModal(null)}
                className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
