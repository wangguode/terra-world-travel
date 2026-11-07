"use client";

import React, { useState } from "react";
import {
  CORRIDORS,
  type CorridorId,
  type DriverCard,
} from "@/lib/corridors-data";
import { WorldModelViewport } from "@/components/world-model-viewport";

interface AiStep {
  timeSlot: string;
  phase: string;
  action: string;
  localAppTip: string;
  driverPhrase: string;
}

export function TerraTravelWorkbench() {
  const [corridorId, setCorridorId] = useState<CorridorId>("cn-to-seoul");
  const corridor = CORRIDORS[corridorId];

  const [fullscreenDriverCard, setFullscreenDriverCard] =
    useState<DriverCard | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [arrivalTime, setArrivalTime] = useState("14:30");
  const [days, setDays] = useState(4);
  const [hotelArea, setHotelArea] = useState("弘大入口 / 延南洞");
  const [travelerStyle, setTravelerStyle] = useState(
    "首次自由行 · 3D地标机位与地道烤肉咖啡"
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

  const handleCopyPhrase = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore clipboard errors
    }
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="min-h-dvh overflow-x-clip bg-[#0a0a0a] text-[#f5f5f3]">
      {/* Sticky Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0d1117]">
        <div className="terra-wrap flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-base font-bold text-[#f5f5f3]">
              TERRA 跨国落地生存与空间世界模型
            </span>
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            <a
              href="#touchdown-120"
              className="text-sm font-medium text-[#e4e3df]/85 transition-colors hover:text-[#ff5a26]"
            >
              黄金时间轴
            </a>
            <a
              href="#world-model-3d"
              className="text-sm font-medium text-[#e4e3df]/85 transition-colors hover:text-[#ff5a26]"
            >
              三维世界模型
            </a>
            <a
              href="#app-matrix"
              className="text-sm font-medium text-[#e4e3df]/85 transition-colors hover:text-[#ff5a26]"
            >
              本土软件映射
            </a>
            <a
              href="#driver-cards"
              className="text-sm font-medium text-[#e4e3df]/85 transition-colors hover:text-[#ff5a26]"
            >
              出租车大字卡
            </a>
            <a
              href="#ai-copilot"
              className="text-sm font-medium text-[#e4e3df]/85 transition-colors hover:text-[#ff5a26]"
            >
              定制动线引擎
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => handleSwitchCorridor("cn-to-seoul")}
              className={`min-h-[38px] whitespace-nowrap px-3 py-1.5 text-sm font-semibold transition-colors ${
                corridorId === "cn-to-seoul"
                  ? "bg-[#ff5a26] text-[#0a0a0a]"
                  : "bg-[#17202b] text-[#f5f5f3] hover:bg-[#1f2b3a]"
              }`}
            >
              首尔 Seoul
            </button>
            <button
              type="button"
              onClick={() => handleSwitchCorridor("global-to-beijing")}
              className={`min-h-[38px] whitespace-nowrap px-3 py-1.5 text-sm font-semibold transition-colors ${
                corridorId === "global-to-beijing"
                  ? "bg-[#ff5a26] text-[#0a0a0a]"
                  : "bg-[#17202b] text-[#f5f5f3] hover:bg-[#1f2b3a]"
              }`}
            >
              北京 Beijing
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* CHAPTER 01: OBSIDIAN HERO & LIVE SPATIAL FOOTAGE */}
        <section className="bg-[#0a0a0a] py-12 md:py-20">
          <div className="terra-wrap">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
              <div className="terra-motion-card lg:col-span-6">
                <h1 className="text-[44px] leading-[1.06] font-bold tracking-tight text-[#f5f5f3] md:text-[62px] lg:text-[96px]">
                  {corridor.heroHeadline}
                </h1>
                <p className="mt-6 max-w-[62ch] text-2xl leading-snug text-[#f5f5f3]">
                  专为跨国自由行打造的黄金 120 分钟落地生存指南与三维高斯点云实景漫游平台。
                </p>
                <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-[#e4e3df]/85">
                  {corridor.heroSubheadline}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#world-model-3d"
                    className="inline-flex min-h-[46px] items-center bg-[#ff5a26] px-6 py-3 text-sm font-bold text-[#0a0a0a] transition-opacity hover:opacity-90"
                  >
                    启动三维世界模型漫游
                  </a>
                  <a
                    href="#driver-cards"
                    className="inline-flex min-h-[46px] items-center bg-[#17202b] px-6 py-3 text-sm font-semibold text-[#f5f5f3] transition-colors hover:bg-[#202c3b]"
                  >
                    打开出租车司机双语急救卡
                  </a>
                </div>

                {/* Vital Signs Strip */}
                <dl className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="bg-[#11161d] p-4">
                    <dt className="text-sm text-[#e4e3df]/70">落地机场枢纽</dt>
                    <dd className="mt-1 text-base font-semibold text-[#f5f5f3]">
                      {corridor.touchdownAirports}
                    </dd>
                  </div>
                  <div className="bg-[#11161d] p-4">
                    <dt className="text-sm text-[#e4e3df]/70">
                      多语种紧急翻译与旅游热线
                    </dt>
                    <dd className="mt-1 text-base font-semibold text-[#ff5a26]">
                      {corridor.emergencyNumber}
                    </dd>
                  </div>
                  <div className="bg-[#11161d] p-4">
                    <dt className="text-sm text-[#e4e3df]/70">货币与核心支付</dt>
                    <dd className="mt-1 text-sm text-[#f5f5f3]">
                      {corridor.currencyInfo}
                    </dd>
                  </div>
                  <div className="bg-[#11161d] p-4">
                    <dt className="text-sm text-[#e4e3df]/70">插座与电压标准</dt>
                    <dd className="mt-1 text-sm text-[#f5f5f3]">
                      {corridor.plugType}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Hero Media Column: Looping WebM Footage + Dual Corridor Scenic Previews */}
              <div className="terra-motion-card space-y-4 lg:col-span-6">
                <div className="relative overflow-hidden bg-[#11161d]">
                  <video
                    src="/images/spatial-scan-loop.webm"
                    poster="/images/spatial-scan-poster.jpg"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-80 w-full object-cover opacity-90 md:h-[420px]"
                  />
                  <div className="bg-[#151c25] px-4 py-3 text-sm text-[#e4e3df]">
                    实时空间重建流：{corridor.destinationCity} · 机场快轨与核心景区三维测绘
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#11161d]">
                    <img
                      src={corridor.worldScenes[0]?.image}
                      alt={corridor.worldScenes[0]?.name}
                      className="h-32 w-full object-cover"
                    />
                    <div className="p-3 text-sm font-medium text-[#f5f5f3]">
                      {corridor.worldScenes[0]?.name}
                    </div>
                  </div>
                  <div className="bg-[#11161d]">
                    <img
                      src={corridor.worldScenes[1]?.image}
                      alt={corridor.worldScenes[1]?.name}
                      className="h-32 w-full object-cover"
                    />
                    <div className="p-3 text-sm font-medium text-[#f5f5f3]">
                      {corridor.worldScenes[1]?.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER 02: WARM STONE — GOLDEN 120-MINUTE TOUCHDOWN SURVIVAL TIMELINE */}
        <section
          id="touchdown-120"
          className="bg-[#e4e3df] py-16 text-[#111111] md:py-24"
        >
          <div className="terra-wrap">
            <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
              <h2 className="text-2xl font-bold tracking-tight text-[#111111] md:text-[62px] md:leading-[1.08]">
                黄金 120 分钟落地时间轴
              </h2>
              <p className="max-w-[62ch] text-base text-[#111111]/85">
                按机舱门开启后的真实分钟级动线编排：彻底解决落地断网、换汇被坑、走错机场快轨闸机与打不到车四大跨国焦虑。
              </p>
            </div>

            {/* Editorial Alternating Timeline Strips (not identical boxed card rows) */}
            <ol className="space-y-8">
              {corridor.timeline.map((step) => (
                <li
                  key={step.title}
                  className="terra-motion-card grid grid-cols-1 gap-6 bg-[#d5d3cd] p-6 md:grid-cols-12 md:items-center md:p-8"
                >
                  <div className="md:col-span-4">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                  <div className="md:col-span-8">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#6e1e04]">
                        {step.window}
                      </span>
                      <span className="bg-[#c2bfb8] px-3 py-1 text-sm font-semibold text-[#111111]">
                        {step.actionTag}
                      </span>
                    </div>

                    <h3 className="mt-2 text-2xl font-bold text-[#111111]">
                      {step.title}
                    </h3>

                    <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-[#6e1e04]">
                      痛点预警：{step.painPoint}
                    </p>
                    <p className="mt-2 max-w-[62ch] text-base leading-relaxed text-[#111111]">
                      标准动作：{step.solution}
                    </p>

                    <div className="mt-5">
                      <a
                        href={step.affiliateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-[40px] items-center bg-[#111111] px-5 py-2 text-sm font-semibold text-[#f5f5f3] transition-colors hover:bg-[#6e1e04]"
                      >
                        {step.affiliateLabel}
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CHAPTER 03: DEEP SPATIAL SLATE — WEB 3D GAUSSIAN WORLD MODEL */}
        <section id="world-model-3d" className="bg-[#0a0a0a] py-16 md:py-24">
          <div className="terra-wrap">
            <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
              <h2 className="text-2xl font-bold tracking-tight text-[#f5f5f3] md:text-[62px] md:leading-[1.08]">
                三维高斯世界模型漫游舱
              </h2>
              <p className="max-w-[62ch] text-base text-[#e4e3df]/85">
                告别平面图文攻略。在出发前直接进入首尔与北京核心地标的三维高斯点云空间，按住画面拖拽旋转视角，点击实景锚点查看最佳摄影焦段与免排队入口。
              </p>
            </div>

            <WorldModelViewport
              key={corridor.id}
              scenes={corridor.worldScenes}
              destinationCity={corridor.destinationCity}
            />
          </div>
        </section>

        {/* CHAPTER 04: WARM STONE — LOCAL APP EQUIVALENCE LEDGER & STAY DISTRICTS */}
        <section
          id="app-matrix"
          className="bg-[#e4e3df] py-16 text-[#111111] md:py-24"
        >
          <div className="terra-wrap">
            <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
              <h2 className="text-2xl font-bold tracking-tight text-[#111111] md:text-[62px] md:leading-[1.08]">
                本土必装软件与住宿选区
              </h2>
              <p className="max-w-[62ch] text-base text-[#111111]/85">
                把你在国内习惯的『高德、滴滴、大众点评、微信支付』一键映射为当地真正好用的国民级工具，并按机场直达率严选三大住宿片区。
              </p>
            </div>

            {/* Editorial Ledger Table Layout for App Mapping */}
            <div className="space-y-4">
              {corridor.appMatrix.map((item) => (
                <div
                  key={item.category}
                  className="terra-motion-card grid grid-cols-1 gap-4 bg-[#d5d3cd] p-6 lg:grid-cols-12 lg:items-center"
                >
                  <div className="lg:col-span-3">
                    <div className="text-sm font-bold text-[#6e1e04]">
                      {item.category}
                    </div>
                    <div className="mt-1 text-sm text-[#111111]/75 line-through">
                      原习惯：{item.originApp}
                    </div>
                    <div className="mt-1 text-2xl font-bold text-[#111111]">
                      {item.localChampion}
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <p className="max-w-[62ch] text-sm font-semibold text-[#6e1e04]">
                      失效原因：{item.whyItFails}
                    </p>
                    <p className="mt-2 max-w-[62ch] text-base text-[#111111]">
                      配置向导：{item.setupGuide}
                    </p>
                  </div>

                  <div className="bg-[#e4e3df] p-4 lg:col-span-4">
                    <p className="max-w-[62ch] text-sm text-[#111111]">
                      实战技巧：{item.proTip}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stay Districts Feature Split */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-[#111111]">
                首次落地黄金住宿片区对比
              </h3>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                {corridor.stayDistricts.map((dist) => (
                  <div
                    key={dist.name}
                    className="terra-motion-card flex flex-col justify-between bg-[#d5d3cd] p-6"
                  >
                    <div>
                      <div className="text-sm font-bold tabular-nums text-[#6e1e04]">
                        参考预算：{dist.priceRange}
                      </div>
                      <h4 className="mt-2 text-2xl font-bold text-[#111111]">
                        {dist.name}
                      </h4>
                      <p className="mt-2 max-w-[62ch] text-sm font-semibold text-[#111111]/85">
                        {dist.vibe}
                      </p>
                      <p className="mt-3 max-w-[62ch] text-sm text-[#111111]/85">
                        交通连接：{dist.transitAccess}
                      </p>
                    </div>
                    <p className="mt-4 max-w-[62ch] bg-[#e4e3df] p-3 text-sm font-medium text-[#111111]">
                      推荐人群：{dist.bestFor}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER 05: SHOW-TO-DRIVER EMERGENCY CARDS & BAILIAN QWEN-PLUS AI COPILOT */}
        <section id="driver-cards" className="bg-[#11161d] py-16 md:py-24">
          <div className="terra-wrap">
            <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
              <h2 className="text-2xl font-bold tracking-tight text-[#f5f5f3] md:text-[62px] md:leading-[1.08]">
                出租车司机双语急救大字卡
              </h2>
              <p className="max-w-[62ch] text-base text-[#e4e3df]/85">
                在街头拦出租车或向店员问路时无需开口说外语：点击任意地点即可全屏放大高对比度母语指令，或一键复制韩文与中文地址粘贴至打车软件。
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {corridor.driverCards.map((card) => (
                <div
                  key={card.id}
                  className="terra-motion-card flex flex-col justify-between bg-[#0a0a0a] p-6"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-base font-bold text-[#f5f5f3]">
                        {card.titleCn}
                      </span>
                      <span className="text-sm font-semibold text-[#ff5a26]">
                        {card.tag}
                      </span>
                    </div>

                    <div className="mt-4 bg-[#17202b] p-4">
                      <p className="max-w-[62ch] text-2xl font-bold leading-snug text-[#f5f5f3]">
                        {card.localHeadline}
                      </p>
                      <p className="mt-2 max-w-[62ch] text-sm text-[#e4e3df]/75">
                        {card.phoneticOrSub}
                      </p>
                    </div>
                    <p className="mt-3 max-w-[62ch] text-sm text-[#e4e3df]/85">
                      附加说明：{card.driverInstruction}
                    </p>
                    <p className="mt-2 max-w-[62ch] text-sm font-medium text-[#ff5a26]">
                      {card.subwayBackup}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFullscreenDriverCard(card)}
                      className="min-h-[38px] bg-[#ff5a26] px-4 py-1.5 text-sm font-bold text-[#0a0a0a] hover:opacity-90"
                    >
                      全屏放大给司机看
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyPhrase(card.id, card.localHeadline)
                      }
                      className="min-h-[38px] bg-[#17202b] px-3.5 py-1.5 text-sm font-semibold text-[#f5f5f3] hover:bg-[#222f3f]"
                    >
                      {copiedId === card.id ? "已复制地址 OK" : "复制地址文本"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Custom Touchdown Route Generator (Powered by Bailian qwen-plus) */}
            <div id="ai-copilot" className="mt-16 bg-[#0a0a0a] p-6 md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
                <h3 className="text-2xl font-bold text-[#f5f5f3]">
                  百炼智能引擎：定制专属落地动线
                </h3>
                <span className="bg-[#17202b] px-3 py-1 text-sm font-semibold text-[#ff5a26]">
                  阿里云百炼 Qwen-Plus 实时驱动
                </span>
              </div>

              <form
                onSubmit={handleGenerateAiPlan}
                className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-4"
              >
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm text-[#e4e3df]/85">
                    航班预计落地时间
                  </span>
                  <input
                    type="text"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="min-h-[42px] bg-[#17202b] px-3 py-2 text-base tabular-nums text-[#f5f5f3]"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm text-[#e4e3df]/85">
                    停留天数
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value) || 4)}
                    className="min-h-[42px] bg-[#17202b] px-3 py-2 text-base tabular-nums text-[#f5f5f3]"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm text-[#e4e3df]/85">计划住宿区域</span>
                  <input
                    type="text"
                    value={hotelArea}
                    onChange={(e) => setHotelArea(e.target.value)}
                    className="min-h-[42px] bg-[#17202b] px-3 py-2 text-base text-[#f5f5f3]"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm text-[#e4e3df]/85">
                    旅行偏好与诉求
                  </span>
                  <input
                    type="text"
                    value={travelerStyle}
                    onChange={(e) => setTravelerStyle(e.target.value)}
                    className="min-h-[42px] bg-[#17202b] px-3 py-2 text-base text-[#f5f5f3]"
                  />
                </label>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 md:col-span-4">
                  <p className="max-w-[62ch] text-sm text-[#e4e3df]/75">
                    点击生成后将实时调用百炼平台 qwen-plus 模型，输出含当地打车韩文与中文指令的分步落地方案。
                  </p>
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="min-h-[44px] bg-[#ff5a26] px-6 py-2.5 text-sm font-bold text-[#0a0a0a] transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {aiLoading
                      ? "正在通过百炼 qwen-plus 生成专属动线..."
                      : "生成 AI 定制落地生存方案"}
                  </button>
                </div>
              </form>

              {aiSteps.length > 0 && (
                <div className="mt-8 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="max-w-[62ch] text-base font-semibold text-[#ff5a26]">
                      {aiSummary}
                    </p>
                    <span className="text-sm text-[#e4e3df]/70">
                      引擎来源：{aiProvider}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {aiSteps.map((st, idx) => (
                      <div key={idx} className="bg-[#11161d] p-5">
                        <div className="text-sm font-bold text-[#ff5a26]">
                          {st.timeSlot} · {st.phase}
                        </div>
                        <p className="mt-2 max-w-[62ch] text-base text-[#f5f5f3]">
                          {st.action}
                        </p>
                        <p className="mt-3 max-w-[62ch] text-sm text-[#e4e3df]/85">
                          软件锦囊：{st.localAppTip}
                        </p>
                        <div className="mt-3 bg-[#0a0a0a] p-3 text-sm font-semibold text-[#ff5a26]">
                          给司机看：{st.driverPhrase}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] py-12">
        <div className="terra-wrap flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-base font-bold text-[#f5f5f3]">
              TERRA 跨国落地生存与三维空间漫游开源平台
            </div>
            <p className="mt-1 max-w-[62ch] text-sm text-[#e4e3df]/70">
              融合 testUi-1 北京地标数字资产与首尔跨国生存指南 · 支持三维高斯点云视窗与百炼 Qwen-Plus 引擎。
            </p>
          </div>
          <div className="text-sm text-[#e4e3df]/70">
            MIT 开源许可 · 首尔与北京双城旗舰版
          </div>
        </div>
      </footer>

      {/* Fullscreen Show-to-Driver Modal */}
      {fullscreenDriverCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/95 p-6"
          onClick={() => setFullscreenDriverCard(null)}
        >
          <div
            className="w-full max-w-3xl bg-[#17202b] p-8 md:p-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4">
              <span className="text-sm font-semibold text-[#ff5a26]">
                出租车司机全屏指示卡
              </span>
              <button
                type="button"
                onClick={() => setFullscreenDriverCard(null)}
                className="min-h-[38px] bg-[#0a0a0a] px-4 py-1 text-sm font-semibold text-[#f5f5f3]"
              >
                关闭窗口
              </button>
            </div>

            <div className="mt-6 text-base text-[#e4e3df]">
              {fullscreenDriverCard.titleCn}
            </div>
            <div className="mt-4 text-2xl font-bold leading-snug text-[#f5f5f3] md:text-[62px] md:leading-[1.12]">
              {fullscreenDriverCard.localHeadline}
            </div>
            <div className="mt-6 text-base font-semibold text-[#ff5a26]">
              {fullscreenDriverCard.driverInstruction}
            </div>
            <div className="mt-2 text-sm text-[#e4e3df]/75">
              {fullscreenDriverCard.subwayBackup}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
