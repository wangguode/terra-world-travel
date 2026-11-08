"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  Smartphone,
  Copy,
  Check,
  Compass,
  ArrowRight,
  Maximize2,
  QrCode,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Navigation,
  Layers,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { WorldModelViewport } from "@/components/world-model-viewport";
import { CORRIDORS, type CorridorId } from "@/lib/corridors-data";

interface AppleShowcaseLandingProps {
  onLaunchStudio?: () => void;
}

const CITIES = [
  { id: "cn-to-seoul" as CorridorId, name: "首尔", hub: "ICN 仁川", landmark: "景福宫光化门 · 3DGS 动线推演" },
  { id: "global-to-beijing" as CorridorId, name: "北京", hub: "PKX/PEK", landmark: "紫禁城中轴线 · 时空孪生对比" },
  { id: "cn-to-tokyo" as CorridorId, name: "东京", hub: "HND/NRT", landmark: "涩谷十字路口 · 空间避坑视角" },
  { id: "cn-to-bangkok" as CorridorId, name: "曼谷", hub: "BKK/DMK", landmark: "湄南河水运 · 落地防宰动线" },
];

export function AppleShowcaseLanding({ onLaunchStudio }: AppleShowcaseLandingProps) {
  const [currentUrl, setCurrentUrl] = useState<string>("https://terra-world-travel.153557421.workers.dev");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [activeCity, setActiveCity] = useState<CorridorId>("cn-to-seoul");

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
      {/* 顶部 Apple 极简晶透悬浮导航 */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff5a26] to-[#d63f0a] text-white shadow-md shadow-[#ff5a26]/20">
              <Compass className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">TERRA</span>
              <span className="text-[11px] font-medium text-zinc-500 tracking-wider">3.0 SPATIAL OS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyUrl}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:text-white active:scale-95"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "链接已复制" : "复制网址"}</span>
            </button>

            {onLaunchStudio && (
              <button
                onClick={onLaunchStudio}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black transition hover:bg-zinc-200 active:scale-95"
              >
                <span>探索桌面全景舱</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 复制成功浮动胶囊 */}
      {copied && (
        <div className="fixed top-16 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-zinc-950/90 px-4 py-2 text-xs font-medium text-emerald-400 shadow-2xl backdrop-blur-xl">
            <Check className="h-4 w-4" />
            <span>真机链接已复制到剪贴板，可粘贴至微信或 Safari 打开</span>
          </div>
        </div>
      )}

      {/* Hero 首屏：Apple 级震撼大字与物理空间感 */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-36 md:pb-28">
        {/* 背景微光 */}
        <div className="pointer-events-none absolute top-1/3 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-[#ff5a26]/12 via-orange-600/5 to-transparent blur-[120px]" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1 text-xs font-medium text-zinc-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#ff5a26]" />
            <span>物理空间因果推演 · 重新定义下飞机黄金 120 分钟</span>
          </div>

          <h1 className="mt-8 text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl">
            <span className="block text-white">看见空间。</span>
            <span className="block bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
              而不是脑补路线。
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base font-normal leading-relaxed text-zinc-400 sm:text-lg">
            大语言模型理解语言，世界模型理解三维物理空间与因果交互。
            在出发前，第一视角 1:1 沉浸漫游首尔、北京、东京与曼谷的真实动线与光影变迁。
          </p>

          {/* 核心双 CTA */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => {
                const el = document.getElementById("mobile-experience");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-white px-8 text-sm font-semibold text-black transition-all hover:bg-zinc-200 active:scale-95 sm:w-auto"
            >
              <Smartphone className="h-4 w-4" />
              <span>在 iPhone / Android 上启动</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {onLaunchStudio && (
              <button
                onClick={onLaunchStudio}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 text-sm font-medium text-white transition-all hover:border-white/30 hover:bg-white/[0.12] active:scale-95 sm:w-auto"
              >
                <Maximize2 className="h-4 w-4 text-[#ff5a26]" />
                <span>进入桌面全景交互舱</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 空间世界模型视窗：全屏舞台 (The Spatial Stage) */}
      <section className="relative mx-auto max-w-6xl px-6 pb-28">
        <div className="overflow-hidden rounded-3xl border border-white/[0.12] bg-gradient-to-b from-zinc-950 to-black p-6 md:p-8 shadow-2xl">
          {/* 顶部城市选择器（像苹果选机型/颜色一样极简高贵） */}
          <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-[#ff5a26] uppercase">Spatial World Model Engine</span>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">
                {corridorData.destinationCity} · {corridorData.heroHeadline}
              </h3>
            </div>

            {/* 城市切换 Pills */}
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-black/60 p-1.5 backdrop-blur-md">
              {CITIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCity(c.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    activeCity === c.id
                      ? "bg-white text-black shadow-md font-semibold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* 实时 3D 空间世界模型组件视窗 */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black">
            <WorldModelViewport
              scenes={corridorData.worldScenes}
              destinationCity={corridorData.destinationCity}
              compact={false}
            />
          </div>

          {/* 底部三大空间能力说明 */}
          <div className="mt-8 grid grid-cols-1 gap-6 border-t border-white/[0.08] pt-8 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Navigation className="h-4 w-4 text-[#ff5a26]" />
                <span>第一视角动线推演</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                沿真实物理通道推演到达步序，提前看清换乘通道与闸机，避开 90% 拥挤人流。
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <SlidersHorizontal className="h-4 w-4 text-[#ff5a26]" />
                <span>时空孪生滑块对比</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                左右拖动无级滑块，对比白天光照、日落蓝调与历史盛世原貌，所见即所得。
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
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

      {/* 核心转化专区：【在 iPhone / Android 上启动】 */}
      <section id="mobile-experience" className="relative border-t border-white/[0.08] bg-zinc-950/60 py-24 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <span className="text-xs font-semibold tracking-widest text-[#ff5a26] uppercase">Native Experience</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              掏出手机。感受真正的真机应用。
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
              免 App Store 漫长下载与审核。基于独立 PWA 原生技术，添加到主屏幕即可获得 120Hz 独立全屏手感。
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 items-center gap-10 md:grid-cols-12">
            {/* 二维码展示卡片 */}
            <div className="md:col-span-6 flex justify-center">
              <div className="relative w-full max-w-sm rounded-3xl border border-white/[0.15] bg-gradient-to-b from-zinc-900 via-black to-black p-8 text-center shadow-2xl">
                <div className="flex justify-center">
                  <div className="relative flex h-60 w-60 items-center justify-center rounded-2xl border border-white/20 bg-black p-4 shadow-inner">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="TERRA Mobile QR Code"
                        className="h-full w-full object-contain filter invert"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-zinc-500">
                        <Compass className="h-6 w-6 animate-spin text-[#ff5a26]" />
                        <span className="text-xs">加载真机码...</span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-black text-[#ff5a26] shadow-xl">
                      <Compass className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm font-semibold text-white">使用 iPhone 或 Android 相机扫码</p>
                <p className="mt-1 text-xs text-zinc-400">自动进入移动端专属生存系统</p>

                <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="w-full bg-transparent px-2 text-xs font-mono text-zinc-300 outline-none"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20 active:scale-95"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "已复制" : "复制"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Apple 原生三步添加到主屏幕指示 */}
            <div className="md:col-span-6 space-y-4">
              <div className="rounded-2xl border border-white/[0.08] bg-black/60 p-6 backdrop-blur-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ff5a26]/10 text-sm font-bold text-[#ff5a26]">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">使用 iPhone Safari 扫码打开</h4>
                    <p className="mt-1 text-xs text-zinc-400">
                      使用 iOS 原生 Safari 浏览器访问本网址（Android 请使用 Chrome）。
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-black/60 p-6 backdrop-blur-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ff5a26]/10 text-sm font-bold text-[#ff5a26]">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">点击底部分享 ➔「添加到主屏幕」</h4>
                    <p className="mt-1 text-xs text-zinc-400">
                      轻点 Safari 屏幕下方的“分享”图标（方形带向上箭头），选择“添加到主屏幕”。
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-black/60 p-6 backdrop-blur-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-sm font-bold text-emerald-400">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">全屏原生无边框 App 就绪</h4>
                    <p className="mt-1 text-xs text-zinc-400">
                      桌面上将生成黑色罗盘图标，彻底去除浏览器地址栏，支持离线语音急救卡。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 极简 Apple 风格 Footer */}
      <footer className="border-t border-white/[0.08] bg-black py-10 text-center text-xs text-zinc-600">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TERRA Spatial OS. 专为跨国自由行设计的物理空间世界模型。</p>
          <div className="flex gap-6">
            <span className="text-zinc-500">离线 PWA 架构</span>
            <span className="text-zinc-500">120Hz 触控阻尼</span>
            <span className="text-zinc-500">0 服务器延迟</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
