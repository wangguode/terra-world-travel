"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  Smartphone,
  Copy,
  Check,
  Compass,
  ArrowRight,
  Globe2,
  Share2,
  Download,
  Sparkles,
  Plane,
  ShieldCheck,
  Maximize2,
  QrCode,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { WorldModelViewport } from "@/components/world-model-viewport";
import { CORRIDORS, type CorridorId } from "@/lib/corridors-data";

interface AppleShowcaseLandingProps {
  onLaunchStudio?: () => void;
}

export function AppleShowcaseLanding({ onLaunchStudio }: AppleShowcaseLandingProps) {
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [activeCorridor, setActiveCorridor] = useState<CorridorId>("cn-to-seoul");

  useEffect(() => {
    const url = typeof window !== "undefined" ? window.location.href : "https://terra-travel-pro.pages.dev";
    setCurrentUrl(url);
    QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
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

  const corridorData = CORRIDORS[activeCorridor] ?? CORRIDORS["cn-to-seoul"];

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] font-sans antialiased selection:bg-[#ff5a26]/30 selection:text-white">
      {/* 顶部 Apple 极简半透明毛玻璃导航栏 */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff5a26] to-[#d63f0a] text-white shadow-lg shadow-[#ff5a26]/20">
              <Compass className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-wider text-white">TERRA 3.0</span>
              <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium tracking-wide text-zinc-400 sm:inline-block">
                Spatial World Model OS
              </span>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-xs font-medium text-zinc-400 md:flex">
            <a href="#features" className="transition-colors hover:text-white">
              物理空间世界模型
            </a>
            <a href="#corridors" className="transition-colors hover:text-white">
              四大跨国走廊
            </a>
            <a href="#mobile-launch" className="transition-colors hover:text-white">
              手机端真机启动
            </a>
            <a href="#matrix" className="transition-colors hover:text-white">
              落地生存矩阵
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:border-white/30 hover:bg-white/[0.14]"
            >
              <QrCode className="h-3.5 w-3.5 text-[#ff5a26]" />
              <span>手机扫码</span>
            </button>

            {onLaunchStudio && (
              <button
                onClick={onLaunchStudio}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5a26] px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-[#ff5a26]/25 transition-all hover:bg-[#ff7043] active:scale-95"
              >
                <span>探索交互舱</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 复制成功全局 Toast */}
      {copied && (
        <div className="fixed top-16 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-zinc-900/90 px-4 py-2 text-xs font-medium text-emerald-400 shadow-2xl backdrop-blur-md">
            <Check className="h-3.5 w-3.5" />
            <span>专属链接已复制！可在手机微信、备忘录或 Safari 中粘贴打开</span>
          </div>
        </div>
      )}

      {/* Hero 首屏：Apple 级震撼大字与空间感 */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36">
        {/* 背景环形光晕 */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-[#ff5a26]/12 via-orange-500/5 to-transparent blur-[140px]" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff5a26]/30 bg-[#ff5a26]/10 px-3.5 py-1 text-xs font-medium text-[#ff5a26] backdrop-blur-md">
            <Sparkles className="h-3 w-3" />
            <span>重新定义跨国出行的第一视角推演</span>
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="block text-white">物理空间世界模型。</span>
            <span className="block bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
              跨国落地生存操作系统。
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg font-normal leading-relaxed text-zinc-400 sm:text-xl">
            专为跨国自由行打造的实景三维因果交互系统。彻底解决下飞机黄金 120 分钟断网、换汇、打车与地图失效痛点，出发前 1:1 沉浸预演首尔、北京、东京与曼谷核心空间动线。
          </p>

          {/* 核心行动区：手机即刻体验 + 桌面交互舱 */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => {
                const el = document.getElementById("mobile-launch");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#ff5a26] px-8 text-sm font-semibold text-white shadow-xl shadow-[#ff5a26]/30 transition-all hover:bg-[#ff6c3b] hover:shadow-[#ff5a26]/40 active:scale-95 sm:w-auto"
            >
              <Smartphone className="h-4 w-4" />
              <span>在手机真机上立即体验</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={handleCopyUrl}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-6 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white/[0.12] active:scale-95 sm:w-auto"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "链接已复制" : "复制专属体验链接"}</span>
            </button>

            {onLaunchStudio && (
              <button
                onClick={onLaunchStudio}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-6 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:text-white active:scale-95 sm:w-auto"
              >
                <Maximize2 className="h-4 w-4 text-[#ff5a26]" />
                <span>在电脑直接预览</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 模块 1：【手机真机启动中心】 (The Mobile Experience Hub) */}
      <section id="mobile-launch" className="relative border-y border-white/[0.08] bg-zinc-950/70 py-24 backdrop-blur-2xl">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="text-center">
            <span className="text-xs font-semibold tracking-widest text-[#ff5a26] uppercase">Mobile First Innovation</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              真机掏出即用。无需通过 App Store 漫长等待。
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400">
              基于现代 PWA 渐进式原生技术。手机浏览器扫码后一键“添加到主屏幕”，即可拥有 100% 沉浸全屏手感与离线本地运行能力。
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            {/* 左侧：专属高清二维码卡片 */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.12] bg-gradient-to-b from-zinc-900 to-black p-8 text-center shadow-2xl">
                <div className="absolute top-0 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff5a26]/20 blur-3xl" />
                
                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-zinc-300">
                    <QrCode className="h-3 w-3 text-[#ff5a26]" />
                    <span>iPhone / Android 通用真机通道</span>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <div className="relative flex h-64 w-64 items-center justify-center rounded-2xl border border-white/20 bg-black p-4 shadow-2xl">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="TERRA 3.0 Mobile Access QR Code"
                          className="h-full w-full object-contain filter invert"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-zinc-500">
                          <Compass className="h-8 w-8 animate-spin text-[#ff5a26]" />
                          <span className="text-xs">生成专属真机码中...</span>
                        </div>
                      )}
                      {/* 中心微标 */}
                      <div className="pointer-events-none absolute flex h-10 w-10 items-center justify-center rounded-xl bg-black border border-white/20 text-[#ff5a26] shadow-xl">
                        <Compass className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <p className="mt-6 text-sm font-semibold text-white">打开手机微信或相机直接扫码</p>
                  <p className="mt-1 text-xs text-zinc-400">自动检测屏幕并适配满血移动端体验</p>

                  <div className="mt-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2">
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
            </div>

            {/* 右侧：Apple 原生 PWA 安装 3 步操作解剖 */}
            <div className="lg:col-span-7">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/50 p-6 backdrop-blur-md transition-all hover:border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff5a26]/10 text-base font-bold text-[#ff5a26]">
                      01
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white">使用 iPhone Safari 或 Android 浏览器打开</h4>
                      <p className="mt-1 text-sm text-zinc-400">
                        使用系统自带原生浏览器（iPhone 推荐自带 Safari，Android 推荐 Chrome）访问专属链接。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/50 p-6 backdrop-blur-md transition-all hover:border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff5a26]/10 text-base font-bold text-[#ff5a26]">
                      02
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white">点击底部的“分享”按钮 ➔ 选择“添加到主屏幕”</h4>
                      <p className="mt-1 text-sm text-zinc-400">
                        点击 Safari 屏幕底部的分享图标（方形带向上箭头），向下滑动找到并轻点<strong>「添加到主屏幕 (Add to Home Screen)」</strong>。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/50 p-6 backdrop-blur-md transition-all hover:border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-base font-bold text-emerald-400">
                      03
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white">真机桌面图标生成，点开即享 100% 原生全屏</h4>
                      <p className="mt-1 text-sm text-zinc-400">
                        桌面将生成专属黑金罗盘 App 图标。彻底移除浏览器网址栏与底栏，支持断网离线急救与 120Hz 物理回弹触感。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 模块 2：Apple 风格 Bento 特性网格 */}
      <section id="features" className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="text-center">
            <span className="text-xs font-semibold tracking-widest text-[#ff5a26] uppercase">Spatial Intelligence</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              物理空间因果推演。不止于游记。
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400">
              借鉴李飞飞 World Labs 与 3D 高斯点云技术哲学。大语言模型理解文字，世界模型理解“空间遮挡、光影因果与真实动线”。
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Bento 卡片 1（大）：世界模型视窗实景交互 */}
            <div className="overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-b from-zinc-900 to-black p-8 md:col-span-8">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#ff5a26] uppercase">Core Engine</span>
                  <h3 className="mt-1 text-xl font-bold text-white">第一视角空间动线推演与时空对比</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveCorridor("cn-to-seoul")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      activeCorridor === "cn-to-seoul"
                        ? "bg-[#ff5a26] text-white"
                        : "border border-white/10 bg-white/5 text-zinc-400"
                    }`}
                  >
                    首尔景福宫
                  </button>
                  <button
                    onClick={() => setActiveCorridor("global-to-beijing")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      activeCorridor === "global-to-beijing"
                        ? "bg-[#ff5a26] text-white"
                        : "border border-white/10 bg-white/5 text-zinc-400"
                    }`}
                  >
                    北京紫禁城
                  </button>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                <WorldModelViewport
                  scenes={corridorData.worldScenes}
                  destinationCity={corridorData.destinationCity}
                  compact={false}
                />
              </div>
            </div>

            {/* Bento 卡片 2：黄金 120 分钟时间轴 */}
            <div className="flex flex-col justify-between rounded-3xl border border-white/[0.1] bg-gradient-to-b from-zinc-900 to-black p-8 md:col-span-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase">Touchdown Gap</span>
                <h3 className="mt-2 text-xl font-bold text-white">下飞机黄金 120 分钟时间轴</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  从滑行靠桥、eSIM 激活、WOWPASS/Alipay 领卡充值，到跳过成田/仁川长队搭上特急列车，每 15 分钟严格按时空因果排布。
                </p>
              </div>

              <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-black/50 p-4">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>+00m 落地关飞行模式</span>
                  <span className="text-emerald-400">eSIM 激活</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>+35m 边检与交通层</span>
                  <span className="text-[#ff5a26]">直通快轨闸机</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>+60m 酒店直达</span>
                  <span className="text-sky-400">司机双语大字卡</span>
                </div>
              </div>
            </div>

            {/* Bento 卡片 3：出租车双语急救大字卡 */}
            <div className="flex flex-col justify-between rounded-3xl border border-white/[0.1] bg-gradient-to-b from-zinc-900 to-black p-8 md:col-span-6">
              <div>
                <span className="text-xs font-semibold text-[#ff5a26] uppercase">Driver Deck</span>
                <h3 className="mt-2 text-xl font-bold text-white">『给司机看』全屏离线大字卡</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  韩文、日文、泰文高对比度指令卡。手机横屏递给司机，包含地道地名、下车刷卡提示与计价器打表口令。
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-5">
                <div className="text-[10px] tracking-wider text-zinc-500 uppercase">INCHEON TAXI PREVIEW</div>
                <div className="mt-2 text-lg font-bold text-white">기사님, 명동 롯데백화점 앞으로 가주세요.</div>
                <div className="mt-1 text-xs text-zinc-400">师傅您好，请送我到明动乐天百货正门，谢谢！</div>
              </div>
            </div>

            {/* Bento 卡片 4：四大走廊发现中心 */}
            <div className="flex flex-col justify-between rounded-3xl border border-white/[0.1] bg-gradient-to-b from-zinc-900 to-black p-8 md:col-span-6">
              <div>
                <span className="text-xs font-semibold text-sky-400 uppercase">Global Corridors</span>
                <h3 className="mt-2 text-xl font-bold text-white">首尔 · 北京 · 东京 · 曼谷</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  全网独家解剖：东京 Suica 西瓜卡直绑 Apple Pay、北京故宫东华门免排队捷径、曼谷素万那普打车防宰指南。
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                  <span className="text-xs font-semibold text-white">首尔 ICN</span>
                  <span className="block text-[10px] text-zinc-400">仁川空港急行</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                  <span className="text-xs font-semibold text-white">北京 PKX/PEK</span>
                  <span className="block text-[10px] text-zinc-400">皇城中轴线</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                  <span className="text-xs font-semibold text-white">东京 HND/NRT</span>
                  <span className="block text-[10px] text-zinc-400">京急与 Skyliner</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                  <span className="text-xs font-semibold text-white">曼谷 BKK/DMK</span>
                  <span className="block text-[10px] text-zinc-400">免签与轻轨避堵</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 底部全宽大 CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.08] py-28 text-center">
        <div className="relative mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            下一次跨国飞行，从这里开始。
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
            现在打开手机相机扫描上方二维码，或将当前链接发送至您的手机微信，感受 100% 独立原生级跨国生存系统。
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                const el = document.getElementById("mobile-launch");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#ff5a26] px-8 text-sm font-semibold text-white shadow-xl shadow-[#ff5a26]/25 transition hover:bg-[#ff7043] active:scale-95"
            >
              <QrCode className="h-4 w-4" />
              <span>立即扫码体验</span>
            </button>

            {onLaunchStudio && (
              <button
                onClick={onLaunchStudio}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 text-sm font-medium text-white transition hover:bg-white/10 active:scale-95"
              >
                <span>在电脑端直接探索</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Apple 极简页脚 */}
      <footer className="border-t border-white/[0.08] bg-black py-8 text-center text-xs text-zinc-600">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TERRA Spatial World Model OS. 专为出海独立开发者与跨国自由行设计。</p>
          <div className="flex gap-6">
            <span className="text-zinc-500">离线 PWA 架构</span>
            <span className="text-zinc-500">确定性空间引擎</span>
            <span className="text-zinc-500">0 服务器延迟</span>
          </div>
        </div>
      </footer>

      {/* 弹窗：快捷扫码 Modal */}
      {showQrModal && (
        <div
          onClick={() => setShowQrModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-white/15 bg-zinc-950 p-6 text-center shadow-2xl"
          >
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-sm font-semibold text-white">手机扫码启动</span>
              <button
                onClick={() => setShowQrModal(false)}
                className="rounded-full bg-white/10 p-1 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="my-6 flex justify-center">
              <div className="rounded-2xl border border-white/20 bg-black p-3 shadow-inner">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Mobile QR"
                    className="h-56 w-56 object-contain filter invert"
                  />
                ) : (
                  <div className="h-56 w-56 flex items-center justify-center text-zinc-500">
                    加载中...
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-zinc-400">掏出 iPhone 或 Android 相机直接扫码即可使用</p>

            <button
              onClick={handleCopyUrl}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff5a26] py-3 text-xs font-semibold text-white shadow-lg shadow-[#ff5a26]/20 transition hover:bg-[#ff7043]"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "链接已复制到剪贴板" : "复制当前专属链接"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
