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

  // 1. 落地清单交互状态 (可勾选打卡)
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
    const url =
      typeof window !== "undefined" && window.location.origin.includes("workers.dev")
        ? window.location.origin
        : "https://terra-world-travel.153557421.workers.dev";
    setCurrentUrl(url);

    QRCode.toDataURL(url, {
      width: 420,
      margin: 1,
      color: {
        dark: "#ffffff",
        light: "#00000000",
      },
    })
      .then((dataUri) => setQrCodeDataUrl(dataUri))
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

  // 切换清单打卡勾选
  const toggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  // 生成专属动线
  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      const plan = buildFallbackPlan(activeCity, arrivalTime, tripDays, travelerStyle, hotelDistrict);
      setGeneratedPlan({ summary: plan.summary, steps: plan.steps });
      setIsGenerating(false);
    }, 450);
  };

  // 过滤司机卡
  const filteredDriverCards = useMemo(() => {
    if (!taxiSearch.trim()) return corridorData.driverCards;
    const query = taxiSearch.toLowerCase();
    return corridorData.driverCards.filter(
      (c) =>
        c.titleCn.toLowerCase().includes(query) ||
        c.localHeadline.toLowerCase().includes(query) ||
        c.driverInstruction.toLowerCase().includes(query)
    );
  }, [corridorData, taxiSearch]);

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] font-sans antialiased selection:bg-[#ff5a26]/30 selection:text-white">
      {/* 顶部 Apple 极简晶透玻璃导航 */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-12">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff5a26] to-[#d63f0a] text-white shadow-md shadow-[#ff5a26]/25">
              <Compass className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold tracking-tight text-white">TERRA 3.0</span>
              <span className="hidden sm:inline-block font-mono-numbers text-[10px] tracking-widest text-zinc-500 uppercase">
                SPATIAL WORLD MODEL OS
              </span>
            </div>
          </div>

          {/* Navigation Links (SF Pro Styling) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-tight text-zinc-400">
            <a href="#spatial-stage" className="transition hover:text-white">物理空间世界模型</a>
            <a href="#interactive-console" className="transition hover:text-white">实战功能交互舱</a>
            <a href="#touchdown-timeline" className="transition hover:text-white">黄金 120m 生存法则</a>
            <a href="#download-hub" className="transition hover:text-white">获取客户端</a>
          </nav>

          {/* Download Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDownloadModal("apple")}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-1.5 text-xs font-medium text-white transition hover:border-white/30 hover:bg-white/[0.14] active:scale-95"
            >
              <span></span>
              <span>iPhone 版</span>
            </button>
            <button
              onClick={() => setDownloadModal("android")}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-black transition hover:bg-zinc-200 active:scale-95"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Android 版</span>
            </button>
          </div>
        </div>
      </header>

      {/* 复制成功全局 Toast */}
      {copied && (
        <div className="fixed top-16 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-zinc-950/90 px-4 py-2 text-xs font-medium text-emerald-400 shadow-2xl backdrop-blur-xl">
            <Check className="h-4 w-4" />
            <span>真机体验链接已复制，可在手机微信或 Safari 中直接打开</span>
          </div>
        </div>
      )}

      {/* Hero 首屏：Apple 标志性全景暗黑美学与国际排版 */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-28">
        {/* 背景钛金与橘光微晕 */}
        <div className="pointer-events-none absolute top-1/3 left-1/2 h-[580px] w-[960px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-[#ff5a26]/12 via-orange-600/5 to-transparent blur-[140px]" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#ff5a26]" />
            <span className="font-mono-numbers tracking-wide">SPATIAL INTELLIGENCE & WORLD MODEL · VERSION 3.0</span>
          </div>

          <h1 className="mt-8 text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
            <span className="block text-white">看见空间。</span>
            <span className="block bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
              彻底告别下飞机断网与迷茫。
            </span>
          </h1>

          <p className="mx-auto mt-6 text-sm sm:text-base font-mono-numbers tracking-widest text-[#ff5a26] uppercase">
            Predict Physical Trajectories Before Touchdown
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-base font-normal leading-relaxed text-zinc-400 sm:text-lg">
            大语言模型理解文字，世界模型理解三维物理空间与因果交互。
            在出发前，第一视角 1:1 沉浸漫游首尔、北京、东京与曼谷的真实动线、光影与交通避坑。
          </p>

          {/* 核心双获取入口与交互舱锚点 */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => setDownloadModal("apple")}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-black transition-all hover:bg-zinc-200 active:scale-95 sm:w-auto"
            >
              <span className="text-base"></span>
              <span>获取 Apple iPhone 版</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById("interactive-console");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-8 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white/[0.12] active:scale-95 sm:w-auto"
            >
              <Compass className="h-4 w-4 text-[#ff5a26]" />
              <span>在 PC 端体验完整功能</span>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
            </button>

            <button
              onClick={handleCopyUrl}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-transparent px-6 text-sm font-medium text-zinc-400 transition-all hover:border-white/20 hover:text-white active:scale-95 sm:w-auto"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "已复制链接" : "复制网址"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 模块一：空间世界模型全景展台 (The Spatial World Model Stage) */}
      <section id="spatial-stage" className="relative mx-auto max-w-7xl px-6 lg:px-12 pb-24">
        <div className="overflow-hidden rounded-3xl border border-white/[0.12] bg-gradient-to-b from-zinc-950 to-black p-6 md:p-10 shadow-2xl">
          {/* 城市选择选配器 (Apple Titanium Finishes 风格) */}
          <div className="flex flex-col gap-5 border-b border-white/[0.08] pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-[#ff5a26] uppercase">Spatial World Model Viewport</span>
              <h3 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-white">
                {corridorData.destinationCity} · {corridorData.heroHeadline}
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                空港枢纽：{corridorData.touchdownAirports} ｜ 当地中文求助：{corridorData.emergencyNumber}
              </p>
            </div>

            {/* 极简城市胶囊 Pills */}
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-black/60 p-1.5 backdrop-blur-md">
              {CITIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCity(c.id)}
                  className={`rounded-full px-4 py-2 text-xs transition-all ${
                    activeCity === c.id
                      ? "bg-white text-black shadow-lg font-semibold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* 3D 物理空间世界模型交互大画幅 */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black">
            <WorldModelViewport
              scenes={corridorData.worldScenes}
              destinationCity={corridorData.destinationCity}
              compact={false}
            />
          </div>

          {/* 空间技术三大基石 */}
          <div className="mt-10 grid grid-cols-1 gap-8 border-t border-white/[0.08] pt-8 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Navigation className="h-4 w-4 text-[#ff5a26]" />
                <span>第一视角动线推演</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                沿真实物理通道连续推演机舱到快轨步序，提前看清换乘通道与闸机，避开 90% 拥挤人流。
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <SlidersHorizontal className="h-4 w-4 text-[#ff5a26]" />
                <span>时空孪生滑块对比</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                左右拖动无级滑块，对比白天光照、日落蓝调与历史盛世原貌，所见即所得。
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Eye className="h-4 w-4 text-[#ff5a26]" />
                <span>最佳取景框与人流遮挡预警</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                24mm / 70mm 焦段参考与人流遮挡热力提示，指引最无干扰的拍照机位。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 模块二：PC 端全功能实战交互舱 (The Interactive Operating Console) */}
      <section id="interactive-console" className="relative border-t border-white/[0.08] bg-zinc-950/70 py-24 backdrop-blur-2xl">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="text-center">
            <span className="text-xs font-semibold tracking-widest text-[#ff5a26] uppercase">The Operating Console</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              在电脑大屏上，完整体验全套生存功能。
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400">
              无需猜测。直接在浏览器中交互体验落地通关清单、实时汇率计算器、双语出租车大卡库与专属时空动线定制。
            </p>
          </div>

          {/* 交互控制台主卡片 */}
          <div className="mt-14 overflow-hidden rounded-3xl border border-white/[0.12] bg-gradient-to-b from-zinc-900 via-black to-black shadow-2xl">
            {/* 控制台顶部功能 Tab 切换条 */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-black/60 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">当前走廊：</span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-[#ff5a26] font-medium">
                  {corridorData.destinationCity}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveConsoleTab("checklist")}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    activeConsoleTab === "checklist"
                      ? "bg-white text-black font-semibold shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  落地 120m 清单交互
                </button>
                <button
                  onClick={() => setActiveConsoleTab("currency")}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    activeConsoleTab === "currency"
                      ? "bg-white text-black font-semibold shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  实时汇率与中文救助
                </button>
                <button
                  onClick={() => setActiveConsoleTab("driver")}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    activeConsoleTab === "driver"
                      ? "bg-white text-black font-semibold shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  出租车双语大卡台
                </button>
                <button
                  onClick={() => setActiveConsoleTab("generator")}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    activeConsoleTab === "generator"
                      ? "bg-white text-black font-semibold shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  专属时空动线生成器
                </button>
              </div>
            </div>

            {/* 控制台内容区 */}
            <div className="p-6 md:p-10">
              {/* Tab 1: 落地 120 分钟步序清单交互器 */}
              {activeConsoleTab === "checklist" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-6">
                    <div>
                      <h4 className="text-xl font-bold text-white">下飞机关键通关清单 · {corridorData.destinationCity}</h4>
                      <p className="mt-1 text-xs text-zinc-400">
                        点击圆形复选框可在 PC 端模拟通关进度，状态即时响应。
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>已完成 {Object.values(completedSteps).filter(Boolean).length} / {corridorData.timeline.length} 关键通关步骤</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {corridorData.timeline.map((step, idx) => {
                      const stepKey = `${activeCity}-${idx}`;
                      const isChecked = !!completedSteps[stepKey];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleStep(stepKey)}
                          className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                            isChecked
                              ? "border-emerald-500/30 bg-emerald-950/10"
                              : "border-white/[0.08] bg-zinc-950 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                                isChecked
                                  ? "border-emerald-500 bg-emerald-500 text-black"
                                  : "border-zinc-600 hover:border-zinc-400"
                              }`}
                            >
                              {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                            </button>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono-numbers text-xs text-[#ff5a26] font-semibold">{step.window}</span>
                                <span className={`text-sm font-bold ${isChecked ? "line-through text-zinc-500" : "text-white"}`}>
                                  {step.title}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 leading-relaxed">{step.solution}</p>
                              <div className="pt-2">
                                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-300">
                                  应急核心：{step.actionTag}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: 实时智能汇率换算与官方求助播报 */}
              {activeConsoleTab === "currency" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* 实时汇率计算器 */}
                  <div className="rounded-2xl border border-white/[0.08] bg-zinc-950 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-400 uppercase">Live Currency Converter</span>
                      <span className="text-xs font-mono-numbers text-emerald-400">参考汇率: 1 {currentCityConfig.currencySymbol} ≈ {currentCityConfig.rate} RMB</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-zinc-500">当地货币金额 ({currentCityConfig.currencySymbol})</label>
                      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black px-4 py-3">
                        <span className="text-lg font-bold text-white">{currentCityConfig.currencySymbol}</span>
                        <input
                          type="number"
                          value={foreignAmount}
                          onChange={(e) => setForeignAmount(e.target.value)}
                          className="w-full bg-transparent text-xl font-bold font-mono-numbers text-white outline-none"
                          placeholder="输入金额..."
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">实时折合人民币：</span>
                      <span className="text-2xl font-bold font-mono-numbers text-emerald-400">≈ ¥ {cnyEquivalent} RMB</span>
                    </div>

                    <p className="text-[11px] text-zinc-500">
                      * 汇率根据国际银行间中间价实时折算，适用于机场便利店、交通卡充值与街头换汇核对。
                    </p>
                  </div>

                  {/* 官方中文紧急求助 */}
                  <div className="rounded-2xl border border-white/[0.08] bg-zinc-950 p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#ff5a26] uppercase">24H Emergency Hotline</span>
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-white">官方 24 小时中文应急求助热线</h4>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-3xl font-extrabold font-mono-numbers text-[#ff5a26]">
                          {corridorData.emergencyNumber}
                        </span>
                        <span className="rounded-full border border-[#ff5a26]/30 bg-[#ff5a26]/10 px-2.5 py-0.5 text-[10px] text-[#ff5a26] font-semibold">
                          免费中文翻译接警
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-zinc-400">
                        下机遇到行李丢失、出租车绕路、迷路或纠纷时，使用当地公用电话或漫游手机可直拨。
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsPlayingAudio(true);
                        setTimeout(() => setIsPlayingAudio(false), 3000);
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] py-3 text-xs font-semibold text-white transition hover:bg-white/[0.12] active:scale-95"
                    >
                      <Volume2 className={`h-4 w-4 ${isPlayingAudio ? "text-emerald-400 animate-bounce" : "text-[#ff5a26]"}`} />
                      <span>{isPlayingAudio ? "正在模拟官方中文应急呼叫广播..." : "试听官方中文应急求助播报"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: 出租车双语大卡台 */}
              {activeConsoleTab === "driver" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">『给司机看』全屏双语急救大字卡</h4>
                      <p className="mt-1 text-xs text-zinc-400">点击卡片可直接在 PC 端全屏预览大字卡，支持一键复制地道原生地名。</p>
                    </div>

                    {/* 搜索框 */}
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="text"
                        value={taxiSearch}
                        onChange={(e) => setTaxiSearch(e.target.value)}
                        placeholder="搜索地标、酒店、航站楼..."
                        className="w-full rounded-full border border-white/10 bg-zinc-950 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDriverCards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => setFullscreenDriverCard(card)}
                        className="group cursor-pointer rounded-2xl border border-white/[0.08] bg-zinc-950 p-5 transition-all hover:border-white/20 hover:bg-zinc-900"
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400">
                            {card.titleCn}
                          </span>
                          <Maximize2 className="h-3.5 w-3.5 text-zinc-600 transition group-hover:text-white" />
                        </div>
                        <div className="mt-3 text-lg font-extrabold text-white tracking-wide">{card.localHeadline}</div>
                        <div className="mt-1 text-xs text-zinc-400">{card.phoneticOrSub}</div>
                        <div className="mt-3 border-t border-white/5 pt-2 text-[11px] text-zinc-500">
                          指令：{card.driverInstruction}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: 专属时空动线生成器 */}
              {activeConsoleTab === "generator" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* 左侧配置表单 */}
                  <form onSubmit={handleGeneratePlan} className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-zinc-950 p-6 space-y-4">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#ff5a26]" />
                      <span>定制专属时空落地动线</span>
                    </h4>

                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400">落地抵港时刻</label>
                      <input
                        type="time"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs font-mono-numbers text-white outline-none focus:border-white/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400">行程天数</label>
                      <select
                        value={tripDays}
                        onChange={(e) => setTripDays(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white outline-none focus:border-white/30"
                      >
                        <option value={2}>2 天 · 短途周末过境</option>
                        <option value={3}>3 天 · 核心黄金走廊</option>
                        <option value={5}>5 天 · 深度空间漫游</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400">偏好风格</label>
                      <select
                        value={travelerStyle}
                        onChange={(e) => setTravelerStyle(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white outline-none focus:border-white/30"
                      >
                        <option value="商务特快与效率第一">商务特快 · 避开一切排队</option>
                        <option value="深度探索与视觉打卡">摄影与视觉 · 锁定黄金机位</option>
                        <option value="家庭亲子与平稳优先">家庭亲子 · 直达与无障碍</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400">入住区域 / 首个落脚点</label>
                      <input
                        type="text"
                        value={hotelDistrict}
                        onChange={(e) => setHotelDistrict(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white outline-none focus:border-white/30"
                        placeholder="输入酒店区域或地标..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full rounded-xl bg-[#ff5a26] py-3 text-xs font-semibold text-white shadow-lg shadow-[#ff5a26]/20 transition hover:bg-[#ff6c3b] active:scale-95 disabled:opacity-50"
                    >
                      {isGenerating ? "正在演算物理动线..." : "一键推演专属落地行程"}
                    </button>
                  </form>

                  {/* 右侧实时生成展示 */}
                  <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-zinc-950 p-6">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                      <span className="text-xs font-semibold text-zinc-400 uppercase">Generated Output</span>
                      <span className="text-xs font-mono text-[#ff5a26]">DETERMINISTIC SPATIAL ENGINE</span>
                    </div>

                    {generatedPlan ? (
                      <div className="mt-4 space-y-4">
                        <div className="rounded-xl border border-[#ff5a26]/20 bg-[#ff5a26]/5 p-3.5 text-xs text-zinc-300">
                          {generatedPlan.summary}
                        </div>

                        <div className="space-y-3">
                          {generatedPlan.steps.map((st, i) => (
                            <div key={i} className="rounded-xl border border-white/5 bg-black/60 p-4 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-mono-numbers text-xs font-bold text-[#ff5a26]">{st.timeSlot}</span>
                                <span className="text-xs font-semibold text-white">{st.phase}</span>
                              </div>
                              <p className="text-xs text-zinc-400">{st.action}</p>
                              <div className="pt-1 flex flex-wrap gap-2 text-[10px]">
                                <span className="text-sky-400 font-medium">应用建议：{st.localAppTip}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-16 text-center text-zinc-500 space-y-2">
                        <Compass className="h-8 w-8 mx-auto text-zinc-600" />
                        <p className="text-xs">点击左侧“一键推演专属落地行程”，即可在 PC 端查看逐分逐秒的时空步序方案。</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 模块三：黄金 120 分钟落地生存法则展台 (Touchdown Survival Showcase) */}
      <section id="touchdown-timeline" className="relative border-t border-white/[0.08] py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="text-center">
            <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">Touchdown Gap OS</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              重新定义下飞机黄金 120 分钟
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
              跨国旅行最脆弱的时刻是机舱滑行到酒店落脚的前 120 分钟。严格按物理因果排布，步步为营。
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-4">
            {corridorData.timeline.map((step, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-black/60 p-6 backdrop-blur-md transition-all hover:border-white/20"
              >
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                  <span>PHASE 0{idx + 1}</span>
                  <span className="text-[#ff5a26] font-semibold">{step.window}</span>
                </div>
                <h4 className="mt-4 text-base font-bold text-white">{step.title}</h4>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{step.solution}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                  <Check className="h-3 w-3" />
                  <span>{step.actionTag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 模块四：获取与下载中心 (Sync to iPhone & Android) */}
      <section id="download-hub" className="relative border-t border-white/[0.08] bg-zinc-950/80 py-24 backdrop-blur-2xl">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <span className="text-xs font-semibold tracking-widest text-[#ff5a26] uppercase">Get the Mobile OS</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              将全套空间数据带入手机随身携带
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
              免 App Store 漫长等待。基于独立 PWA 原生技术，添加到主屏幕即可获得 120Hz 独立全屏手感与断网急救能力。
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Apple iPhone 卡片 */}
            <div className="rounded-3xl border border-white/[0.12] bg-gradient-to-b from-zinc-900 to-black p-8 text-center shadow-2xl flex flex-col justify-between">
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black shadow-lg">
                  <span className="text-2xl"></span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">Apple iPhone / iOS</h3>
                <p className="mt-2 text-xs text-zinc-400">支持 iOS 16 ~ iOS 18 灵动岛通知与离线急救卡</p>

                <div className="my-6 flex justify-center">
                  <div className="rounded-2xl border border-white/20 bg-black p-3 shadow-inner">
                    {qrCodeDataUrl && (
                      <img
                        src={qrCodeDataUrl}
                        alt="Apple iOS QR"
                        className="h-44 w-44 object-contain filter invert"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setDownloadModal("apple")}
                  className="w-full rounded-full bg-white py-3 text-xs font-semibold text-black transition hover:bg-zinc-200 active:scale-95"
                >
                  查看 iPhone 安装指引
                </button>
                <p className="text-[11px] text-zinc-500">Safari 扫码 ➔ 分享 ➔ 添加到主屏幕</p>
              </div>
            </div>

            {/* Android 卡片 */}
            <div className="rounded-3xl border border-white/[0.12] bg-gradient-to-b from-zinc-900 to-black p-8 text-center shadow-2xl flex flex-col justify-between">
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff5a26] text-white shadow-lg">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">Android / 安卓手机</h3>
                <p className="mt-2 text-xs text-zinc-400">适配华为鸿蒙、小米澎湃、OPPO/vivo 与三星手机</p>

                <div className="my-6 flex justify-center">
                  <div className="rounded-2xl border border-white/20 bg-black p-3 shadow-inner">
                    {qrCodeDataUrl && (
                      <img
                        src={qrCodeDataUrl}
                        alt="Android QR"
                        className="h-44 w-44 object-contain filter invert"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setDownloadModal("android")}
                  className="w-full rounded-full border border-white/20 bg-white/10 py-3 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-95"
                >
                  查看 Android 安装指引
                </button>
                <p className="text-[11px] text-zinc-500">Chrome / 自带浏览器 ➔ 安装为应用</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apple 极简 Footer */}
      <footer className="border-t border-white/[0.08] bg-black py-10 text-center text-xs text-zinc-600">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TERRA Spatial OS. 专为跨国自由行设计的物理空间世界模型。</p>
          <div className="flex gap-6">
            <span className="text-zinc-500">SF Pro Typography</span>
            <span className="text-zinc-500">离线 PWA 架构</span>
            <span className="text-zinc-500">0 服务器延迟</span>
          </div>
        </div>
      </footer>

      {/* 全屏司机大卡弹窗 (方便司机在电脑/平板/手机上看大字) */}
      {fullscreenDriverCard && (
        <div
          onClick={() => setFullscreenDriverCard(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 backdrop-blur-2xl animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl border border-white/20 bg-zinc-950 p-8 text-center shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-xs font-mono text-[#ff5a26] uppercase">PLEASE SHOW THIS TO THE DRIVER</span>
              <button
                onClick={() => setFullscreenDriverCard(null)}
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-400 hover:text-white"
              >
                关闭 ✕
              </button>
            </div>

            <div className="py-6 space-y-4">
              <span className="text-sm font-semibold text-zinc-400">{fullscreenDriverCard.titleCn}</span>
              <div className="text-3xl md:text-5xl font-black text-white tracking-wide leading-tight">
                {fullscreenDriverCard.localHeadline}
              </div>
              <p className="text-sm font-mono text-zinc-400">{fullscreenDriverCard.phoneticOrSub}</p>
            </div>

            <div className="rounded-xl bg-white/[0.04] p-4 text-xs text-zinc-300">
              指令备忘：{fullscreenDriverCard.driverInstruction}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(fullscreenDriverCard.localHeadline);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="w-full rounded-full bg-white py-3.5 text-xs font-semibold text-black transition hover:bg-zinc-200 active:scale-95"
            >
              复制当地目的地地名
            </button>
          </div>
        </div>
      )}

      {/* 下载指引弹窗 */}
      {downloadModal && (
        <div
          onClick={() => setDownloadModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-white/20 bg-zinc-950 p-6 text-center shadow-2xl"
          >
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-sm font-semibold text-white">
                {downloadModal === "apple" ? " Apple iPhone 使用指南" : "🤖 Android 手机使用指南"}
              </span>
              <button
                onClick={() => setDownloadModal(null)}
                className="rounded-full bg-white/10 p-1 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="my-6 flex justify-center">
              <div className="rounded-2xl border border-white/20 bg-black p-3 shadow-inner">
                {qrCodeDataUrl && (
                  <img
                    src={qrCodeDataUrl}
                    alt="Mobile QR"
                    className="h-52 w-52 object-contain filter invert"
                  />
                )}
              </div>
            </div>

            <div className="text-left space-y-3 text-xs text-zinc-300 rounded-xl bg-white/[0.04] p-4">
              {downloadModal === "apple" ? (
                <>
                  <p>1. 打开 iPhone <strong>自带 Safari 浏览器</strong>，扫描上方二维码（或输入网址）。</p>
                  <p>2. 轻点屏幕底部中央的<strong>“分享”</strong>按钮（方框带向上箭头）。</p>
                  <p>3. 往下滑动并选择<strong>「添加到主屏幕」</strong>，即刻生成独立黑金罗盘 App 图标。</p>
                </>
              ) : (
                <>
                  <p>1. 使用手机自带浏览器或 <strong>Chrome</strong> 扫描上方二维码。</p>
                  <p>2. 点击右上角菜单按钮（三个点）。</p>
                  <p>3. 选择<strong>「添加到主屏幕」</strong>或<strong>「安装应用」</strong>，即可享受全屏原生体验。</p>
                </>
              )}
            </div>

            <button
              onClick={handleCopyUrl}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-semibold text-black shadow-lg transition hover:bg-zinc-200 active:scale-95"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "链接已复制到剪贴板" : "复制当前链接在手机打开"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
