"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  BeijingSpatialWorldModel,
} from "@/components/beijing-pulse-world-model";
import {
  STUDIO_PRESETS,
  DEPLOYMENT_SNIPPETS,
  type WorldStudioPreset,
} from "@/lib/reactor-studio-data";

export function AppleFlagshipWebsite() {
  const [currentUrl, setCurrentUrl] = useState<string>(
    "https://terra-world-travel.153557421.workers.dev"
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [activePresetId, setActivePresetId] = useState<string>("neo-dynasty");
  const [activeHour, setActiveHour] = useState<number>(17.5);
  const [snowMode, setSnowMode] = useState<boolean>(false);

  useEffect(() => {
    const nodes = document.querySelectorAll(".terra-reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.08 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const origin =
      typeof window !== "undefined" && window.location.origin.includes("workers.dev")
        ? window.location.origin
        : "https://terra-world-travel.153557421.workers.dev";

    QRCode.toDataURL(origin, {
      width: 400,
      margin: 1,
      color: {
        dark: "#070707",
        light: "#f5f5f7",
      },
    })
      .then((dataUri) => {
        setCurrentUrl(origin);
        setQrCodeDataUrl(dataUri);
      })
      .catch(() => {});
  }, []);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    }
  };

  const handleTeleportToPreset = (presetId: string) => {
    setActivePresetId(presetId);
    const el = document.getElementById("spatial-stage");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-[#09090b] text-[#f5f5f7]">
      {/* 顶部 Studio 顶栏 */}
      <header className="absolute top-0 left-0 right-0 z-40 bg-transparent py-4 sm:py-5 pointer-events-none">
        <div className="mx-auto max-w-7xl flex w-full items-center justify-between gap-4 px-5 sm:px-10">
          <a
            href="#spatial-stage"
            className="pointer-events-auto flex items-center gap-2.5 text-[16px] sm:text-[18px] font-bold tracking-tight text-white no-underline"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#00f2fe]" />
            <span>REACTOR // LINGBOT WORLD 2</span>
            <span className="text-[16px] font-normal text-white/40 tracking-wider hidden lg:inline">
              Interactive 14B Causal Studio
            </span>
          </a>

          <nav
            aria-label="主导航"
            className="pointer-events-auto flex items-center gap-3 sm:gap-6 text-[16px]"
          >
            <a
              href="#spatial-stage"
              className="text-white/70 hover:text-white no-underline transition hidden lg:inline"
            >
              实时视界
            </a>
            <a
              href="#prompt-composer"
              className="text-white/70 hover:text-white no-underline transition hidden lg:inline"
            >
              预设画廊
            </a>
            <a
              href="#deployment-guide"
              className="text-white/70 hover:text-white no-underline transition hidden lg:inline"
            >
              开源部署
            </a>
            <a
              href="#commercial-scenarios"
              className="text-white/70 hover:text-white no-underline transition hidden lg:inline"
            >
              商业方案
            </a>
            <button
              type="button"
              onClick={() => setSnowMode(!snowMode)}
              className={`terra-btn rounded-full px-3.5 py-1.5 text-[16px] font-medium transition hidden sm:inline-block ${
                snowMode
                  ? "bg-[#00f2fe] text-black"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {snowMode ? "已覆严寒" : "气候模拟"}
            </button>
            <a
              href="https://github.com/Robbyant/lingbot-world-v2"
              target="_blank"
              rel="noopener noreferrer"
              className="terra-btn rounded-full bg-white px-4 sm:px-5 py-1.5 text-[16px] font-semibold text-black no-underline hover:bg-white/90"
            >
              GitHub 仓库
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* 核心第一屏：Reactor 风格全屏实时交互工作台 */}
        <section id="spatial-stage" className="relative w-full h-[100dvh] overflow-hidden bg-[#09090b]">
          <div className="absolute top-20 sm:top-24 left-5 right-5 sm:right-auto sm:left-10 z-40 max-w-2xl pointer-events-auto bg-[#09090b]/60 sm:bg-transparent rounded-[16px] p-3 sm:p-0">
            <h1 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight leading-tight">
              LingBot-World 2.0 // 动作驱动交互式世界模型
            </h1>
            <p className="mt-2 text-[16px] sm:text-[18px] text-white/80 leading-relaxed m-0 tnum">
              轻按键盘 WASD 实时漫游探索 · 14B 因果生成无尽时空
            </p>
          </div>

          <BeijingSpatialWorldModel
            activePresetId={activePresetId}
            onSelectPreset={setActivePresetId}
            hour={activeHour}
            onChangeHour={setActiveHour}
            snowMode={snowMode}
          />
        </section>

        {/* 核心第二屏：分层动态 Prompt 组合器与预设画廊 */}
        <section id="prompt-composer" className="bg-[#0c0c0e] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight">
                分层动态提示词与世界预设
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">
                对标 Reactor 官方架构，采用基础环境层、镜头契约层与动作事件层动态组合，点击一键载入上方交互视界。
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {STUDIO_PRESETS.map((preset: WorldStudioPreset) => (
                <article
                  key={preset.id}
                  className="terra-reveal rounded-[24px] bg-[#141416] p-6 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01]"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[18px]">
                      <Image
                        src={preset.image}
                        alt={preset.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-white/5 px-3 py-1 text-[16px] text-[#00f2fe] font-medium">
                        {preset.category}
                      </span>
                      <span className="text-[16px] text-white/40 uppercase">
                        {preset.cameraContract}
                      </span>
                    </div>

                    <h3 className="mt-3 text-[20px] font-bold text-white tracking-tight">
                      {preset.name}
                    </h3>

                    <p className="mt-2 text-[16px] text-white/70 leading-relaxed">
                      {preset.basePrompt}
                    </p>

                    <div className="mt-4 bg-white/5 rounded-[16px] p-3.5 space-y-1.5 text-[16px] tnum">
                      <div className="flex justify-between">
                        <span className="text-white/40">光影时空：</span>
                        <span className="text-white font-medium">{preset.physicsProfile.lighting}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">物理动力学：</span>
                        <span className="text-white font-medium">{preset.physicsProfile.gravity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">流式推流：</span>
                        <span className="text-[#00f2fe] font-medium">{preset.physicsProfile.fps}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3">
                    <button
                      type="button"
                      onClick={() => handleTeleportToPreset(preset.id)}
                      className="terra-btn w-full rounded-full bg-white/10 py-2.5 text-[16px] font-medium text-white hover:bg-white/20 transition"
                    >
                      在 Studio 中载入生成 ↑
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 核心第三屏：开源技术架构与本地部署终端 */}
        <section id="deployment-guide" className="bg-[#09090b] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight">
                开源部署与推理管线
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">
                完全对标 GitHub 开源仓库 Robbyant/lingbot-world-v2，支持 SGLang 分布式张量并行与 WebSockets 交互动作推流。
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {DEPLOYMENT_SNIPPETS.map((snippet) => (
                <div
                  key={snippet.title}
                  className="rounded-[24px] bg-[#121214] p-6 terra-reveal flex flex-col justify-between overflow-hidden"
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center justify-between text-[16px] text-white/40 pb-3">
                      <span className="font-semibold text-white">{snippet.title}</span>
                      <span className="uppercase text-[16px]">{snippet.language}</span>
                    </div>
                    <pre className="mt-4 text-[16px] text-white/80 font-mono overflow-x-auto leading-relaxed p-3.5 bg-black/40 rounded-[12px] max-w-full">
                      <code>{snippet.code}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 核心第四屏：商业应用场景与客户画像全景 */}
        <section id="commercial-scenarios" className="bg-[#0c0c0e] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight">
                商业应用与受众客户全景
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">
                对标 Reactor.inc 云端平台商业模式，明确面向受众、目标客户与变现闭环。
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 核心受众画像 */}
              <div className="rounded-[28px] bg-[#121214] p-8 terra-reveal space-y-6">
                <h3 className="text-[20px] sm:text-[24px] font-bold text-white tracking-tight">
                  面向的受众与使用者
                </h3>
                
                <div className="space-y-4 text-[16px] leading-relaxed">
                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">次世代开放世界与游戏开发者</div>
                    <div className="text-white/70 mt-1">
                      无需耗费数月编写物理引擎和搭建三维建模资产，通过提示词与首帧直接生成可玩的世界关卡与沙盒原型。
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">具身智能机器人训练团队</div>
                    <div className="text-white/70 mt-1">
                      通过动作条件驱动持续合成长程、多视角、符合真实动力学因果规律的交互视频流，解决 Sim-to-Real 数据匮乏。
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">互动影视与空间叙事创作者</div>
                    <div className="text-white/70 mt-1">
                      观众不再是单向被动观看影片，而是可以随时拿起按键走入场景，直接影响剧情与环境的时空走向。
                    </div>
                  </div>
                </div>
              </div>

              {/* 商业化与变现模式 */}
              <div className="rounded-[28px] bg-[#121214] p-8 terra-reveal space-y-6">
                <h3 className="text-[20px] sm:text-[24px] font-bold text-white tracking-tight">
                  商业变现与落地模式
                </h3>

                <div className="space-y-4 text-[16px] leading-relaxed">
                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">云端交互时长按秒计费</div>
                    <div className="text-white/70 mt-1">
                      基于 WebSocket 低延迟推流，向个人创作者和独立工作室按秒/按分钟收取云端多卡 GPU 实时推理点数。
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">企业级专属集群私有化部署</div>
                    <div className="text-white/70 mt-1">
                      为大厂游戏工作室和主机厂智驾团队提供本地私有集群部署套件，保证核心数据安全与独占算力带宽。
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">实时动作流交互 API 订阅</div>
                    <div className="text-white/70 mt-1">
                      对外开放低延迟动作注入与视频帧返回的标准 REST/WebSocket SDK，赋能第三方应用接入世界模型底座。
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 体验与离线伴侣 */}
            <div className="mt-10 rounded-[32px] bg-[#121214] p-8 sm:p-14 terra-reveal">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                  <h3 className="text-[24px] sm:text-[32px] font-bold text-white tracking-tight">
                    在移动设备上启动交互工作台
                  </h3>
                  <p className="mt-4 text-[16px] sm:text-[18px] text-white/70 leading-relaxed max-w-xl">
                    支持在任意移动浏览器中通过触控方向键体验 LingBot-World 2.0 实时因果流式生成，随时随地探索交互时空。
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="terra-btn rounded-full bg-white px-7 py-3 text-[16px] font-bold text-black hover:bg-white/90 transition"
                    >
                      {copiedLink ? "已复制引擎访问网址" : "复制网址到移动端"}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <div className="rounded-3xl bg-white p-6 text-center">
                    {qrCodeDataUrl ? (
                      <Image
                        src={qrCodeDataUrl}
                        alt="手机扫码体验"
                        width={200}
                        height={200}
                        unoptimized
                        className="h-48 w-48 rounded-xl object-contain mx-auto"
                      />
                    ) : (
                      <div className="h-48 w-48 rounded-xl bg-gray-100 flex items-center justify-center text-black/50 text-[16px]">
                        加载二维码中
                      </div>
                    )}
                    <p className="mt-3 text-[16px] font-medium text-[#070707]">
                      手机扫码 · 即刻交互
                    </p>
                    <p className="text-[16px] text-[#070707]/60">
                      支持 iOS 与 Android 触控漫游
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#09090b] py-12 text-center text-[16px] text-white/40">
        <div className="mx-auto max-w-7xl px-5 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 REACTOR.INC & ROBBYANT // LINGBOT-WORLD 2.0 STUDIO.</p>
          <p>Real-Time Action-Conditioned 14B Causal World Model Engine.</p>
        </div>
      </footer>
    </div>
  );
}
