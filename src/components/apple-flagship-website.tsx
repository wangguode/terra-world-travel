"use client";

import React, { useState, useEffect } from "react";
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
  Shield,
  Clock,
  Radio,
  FileText,
  MapPin,
  Car,
  Download,
  Apple,
} from "lucide-react";
import { WorldModelViewport } from "@/components/world-model-viewport";
import { CORRIDORS, type CorridorId } from "@/lib/corridors-data";

const CITIES = [
  { id: "cn-to-seoul" as CorridorId, name: "首尔 Seoul", hub: "ICN 仁川 / GMP 金浦", desc: "景福宫中轴线 · 圣水洞街区 · AREX 快轨" },
  { id: "global-to-beijing" as CorridorId, name: "北京 Beijing", hub: "PKX 大兴 / PEK 首都", desc: "紫禁城筒子河捷径 · 景山日落 · 皇城中轴线" },
  { id: "cn-to-tokyo" as CorridorId, name: "东京 Tokyo", hub: "HND 羽田 / NRT 成田", desc: "涩谷十字路口 · Suica 手机交通卡 · 京急线" },
  { id: "cn-to-bangkok" as CorridorId, name: "曼谷 Bangkok", hub: "BKK 素万那普 / DMK 廊曼", desc: "湄南河水运 · 永久免签快速通关 · 轻轨避堵" },
];

export function AppleFlagshipWebsite() {
  const [currentUrl, setCurrentUrl] = useState<string>("https://terra-world-travel.153557421.workers.dev");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [activeCity, setActiveCity] = useState<CorridorId>("cn-to-seoul");
  const [downloadModal, setDownloadModal] = useState<"apple" | "android" | null>(null);

  useEffect(() => {
    const url =
      typeof window !== "undefined" && window.location.origin.includes("workers.dev")
        ? window.location.origin
        : "https://terra-world-travel.153557421.workers.dev";
    setCurrentUrl(url);

    QRCode.toDataURL(url, {
      width: 400,
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

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] font-sans antialiased selection:bg-[#ff5a26]/30 selection:text-white">
      {/* 顶部 Apple 极简晶透玻璃导航 */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-12">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff5a26] to-[#d63f0a] text-white shadow-md shadow-[#ff5a26]/20">
              <Compass className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">TERRA</span>
              <span className="text-[11px] font-medium text-zinc-500 tracking-wider">3.0 SPATIAL OS</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
            <a href="#spatial-stage" className="transition hover:text-white">物理空间世界模型</a>
            <a href="#touchdown" className="transition hover:text-white">落地 120 分钟生存</a>
            <a href="#features" className="transition hover:text-white">本土平替与急救卡</a>
            <a href="#download" className="transition hover:text-white">获取手机客户端</a>
          </nav>

          {/* Download Buttons in Nav */}
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
            <span>官方体验链接已复制，可在手机微信或浏览器中直接粘贴使用</span>
          </div>
        </div>
      )}

      {/* Hero 首屏：Apple 官网标志性旗舰暗黑视觉 */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-28">
        {/* 背景光影 */}
        <div className="pointer-events-none absolute top-1/3 left-1/2 h-[550px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-[#ff5a26]/12 via-orange-600/5 to-transparent blur-[140px]" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#ff5a26]" />
            <span>三维空间物理因果推演 · 专为跨国自由行量身打造</span>
          </div>

          <h1 className="mt-8 text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl">
            <span className="block text-white">看见空间。</span>
            <span className="block bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
              彻底告别下飞机断网与迷茫。
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base font-normal leading-relaxed text-zinc-400 sm:text-lg">
            大语言模型理解文字，世界模型理解三维物理空间与因果交互。
            在出发前，第一视角 1:1 沉浸漫游首尔、北京、东京与曼谷的真实动线、光影与交通避坑。
          </p>

          {/* 核心双下载/获取入口 */}
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
              onClick={() => setDownloadModal("android")}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-8 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white/[0.12] active:scale-95 sm:w-auto"
            >
              <Smartphone className="h-4 w-4 text-[#ff5a26]" />
              <span>获取 Android 版</span>
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

      {/* 空间世界模型视窗：全屏展台 (The Spatial Stage) */}
      <section id="spatial-stage" className="relative mx-auto max-w-7xl px-6 lg:px-12 pb-28">
        <div className="overflow-hidden rounded-3xl border border-white/[0.12] bg-gradient-to-b from-zinc-950 to-black p-6 md:p-10 shadow-2xl">
          {/* 城市选择选配器 (Apple Titanium Finishes 风格) */}
          <div className="flex flex-col gap-5 border-b border-white/[0.08] pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-[#ff5a26] uppercase">Spatial World Model Viewport</span>
              <h3 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-white">
                {corridorData.destinationCity} · {corridorData.heroHeadline}
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                空港枢纽：{corridorData.touchdownAirports} ｜ 当地求助：{corridorData.emergencyNumber}
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
                沿真实通道连续推演机舱到快轨步序，提前看清换乘通道与闸机，避开 90% 拥挤人流。
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

      {/* 黄金 120 分钟落地生存时间轴 (Touchdown Survival Showcase) */}
      <section id="touchdown" className="relative border-t border-white/[0.08] bg-zinc-950/40 py-24 backdrop-blur-xl">
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

      {/* Bento 特性专区：急救卡 & 本土平替 */}
      <section id="features" className="py-24 md:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="text-center">
            <span className="text-xs font-semibold tracking-widest text-[#ff5a26] uppercase">Essential Tools</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              语言不通？拿手机直接给当地人看。
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
              支持中韩、中日、中泰高对比度离线大字卡，与全套本土 App 映射矩阵。
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* 左侧：给司机看大字卡展示 */}
            <div className="md:col-span-7 rounded-3xl border border-white/[0.1] bg-gradient-to-b from-zinc-900 to-black p-8 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#ff5a26] uppercase">Driver Deck Preview</span>
                <span className="text-[10px] text-zinc-500 font-mono">OFFLINE CARDS</span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-white">『给司机看』全屏双语出租车急救卡</h3>
              <p className="mt-2 text-xs text-zinc-400">
                出机场直接递给出租车司机。包含地道韩文/日文/泰文地名、下车刷卡提示与计价器打表口令。
              </p>

              <div className="mt-6 space-y-3">
                {corridorData.driverCards.slice(0, 2).map((card, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                    <div className="text-xs font-semibold text-zinc-400">{card.titleCn}</div>
                    <div className="mt-2 text-xl font-extrabold text-white tracking-wide">{card.localHeadline}</div>
                    <div className="mt-1 text-xs text-zinc-400">{card.phoneticOrSub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧：本土 App 平替矩阵 */}
            <div className="md:col-span-5 rounded-3xl border border-white/[0.1] bg-gradient-to-b from-zinc-900 to-black p-8 shadow-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-sky-400 uppercase">Local App Mapping</span>
                <h3 className="mt-2 text-xl font-bold text-white">本土必装 App 平替矩阵</h3>
                <p className="mt-2 text-xs text-zinc-400">
                  出国后 Google 地图可能失效、微信支付受限。系统为您精准映射当地人每天使用的原生平替。
                </p>

                <div className="mt-6 space-y-3">
                  {corridorData.appMatrix.slice(0, 3).map((app, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                      <div>
                        <div className="text-xs font-bold text-white">{app.localChampion}</div>
                        <div className="text-[10px] text-zinc-400">{app.category}</div>
                      </div>
                      <div className="text-right">
                        <span className="rounded-full border border-[#ff5a26]/30 bg-[#ff5a26]/10 px-2 py-0.5 text-[10px] font-semibold text-[#ff5a26]">
                          原用习惯: {app.originApp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <span className="text-[11px] text-zinc-500">手机端支持离线语音播报与一键复制</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 获取与下载专区 (Download & Mobile Experience) */}
      <section id="download" className="relative border-t border-white/[0.08] bg-zinc-950/80 py-24 backdrop-blur-2xl">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <span className="text-xs font-semibold tracking-widest text-[#ff5a26] uppercase">Get the Mobile OS</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              即刻获取手机客户端
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
              免 App Store 漫长等待。基于独立 PWA 原生技术，添加到主屏幕即可获得 120Hz 独立全屏手感。
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
            <span className="text-zinc-500">离线 PWA 架构</span>
            <span className="text-zinc-500">120Hz 触控手感</span>
            <span className="text-zinc-500">0 服务器延迟</span>
          </div>
        </div>
      </footer>

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
