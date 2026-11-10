"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  BeijingSpatialWorldModel,
} from "@/components/beijing-pulse-world-model";
import {
  WORLD_PRESETS,
  LINGBOT_VERSIONS,
  type WorldPreset,
} from "@/lib/lingbot-data";

export function AppleFlagshipWebsite() {
  const [currentUrl, setCurrentUrl] = useState<string>(
    "https://terra-world-travel.153557421.workers.dev"
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [activePresetId, setActivePresetId] = useState<string>("imperial-palace");
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
    <div className="min-h-[100dvh] bg-[#070707] text-[#f5f5f7]">
      {/* 顶部极简透明悬浮 Topbar */}
      <header className="absolute top-0 left-0 right-0 z-40 bg-transparent py-4 sm:py-5 pointer-events-none">
        <div className="flex w-full items-center justify-between gap-4 px-6 sm:px-10">
          <a
            href="#spatial-stage"
            className="pointer-events-auto flex items-center gap-2 text-[16px] sm:text-[18px] font-bold tracking-tight text-white no-underline"
          >
            <span className="h-2 w-2 rounded-full bg-[#c23b3b]" />
            <span>LINGBOT-WORLD // REACTOR PLAYGROUND</span>
            <span className="text-[16px] font-normal text-white/40 tracking-wider hidden sm:inline">
              灵波交互式世界模型
            </span>
          </a>

          <nav
            aria-label="主导航"
            className="pointer-events-auto flex items-center gap-4 sm:gap-8 text-[16px]"
          >
            <a
              href="#spatial-stage"
              className="text-white/70 hover:text-white no-underline transition hidden md:inline"
            >
              动作交互视界
            </a>
            <a
              href="#technology-matrix"
              className="text-white/70 hover:text-white no-underline transition hidden md:inline"
            >
              核心技术架构
            </a>
            <a
              href="#commercial-scenarios"
              className="text-white/70 hover:text-white no-underline transition hidden md:inline"
            >
              商业场景与受众
            </a>
            <button
              type="button"
              onClick={() => setSnowMode(!snowMode)}
              className={`terra-btn rounded-full px-3.5 sm:px-4 py-1.5 text-[16px] font-medium transition ${
                snowMode
                  ? "bg-[#c23b3b] text-white"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {snowMode ? "已覆初雪" : "严苛环境模拟"}
            </button>
            <a
              href="#commercial-scenarios"
              className="terra-btn rounded-full bg-white px-4 sm:px-5 py-1.5 text-[16px] font-semibold text-[#070707] no-underline hover:bg-white/90"
            >
              开发者接入
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* 核心第一屏：LingBot-World 实时动作生成交互游乐场 */}
        <section id="spatial-stage" className="relative w-full h-[100dvh] overflow-hidden bg-[#070707]">
          <div className="absolute top-20 sm:top-24 left-6 right-6 sm:right-auto sm:left-10 z-40 max-w-2xl pointer-events-auto bg-[#070707]/60 sm:bg-transparent rounded-[16px] p-3 sm:p-0">
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

        {/* 核心第二屏：核心技术矩阵与版本演进 */}
        <section id="technology-matrix" className="bg-[#0c0c0e] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight">
                LingBot-World 核心架构与演进
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">
                彻底告别传统 AI 视频的静态片段生成模式，开启端到端因果注意力与实时可玩视界时代。
              </p>
            </div>

            {/* 版本对比：1.0 vs 2.0 Infinity */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-[24px] bg-[#141416] p-8 terra-reveal flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/5 px-3 py-1 text-[16px] text-white/60">
                      {LINGBOT_VERSIONS["1.0"].badge}
                    </span>
                    <span className="text-[16px] text-white/40 tnum">Baseline Prototype</span>
                  </div>
                  <h3 className="mt-4 text-[24px] font-bold text-white tracking-tight">
                    {LINGBOT_VERSIONS["1.0"].title}
                  </h3>
                  <p className="mt-2 text-[16px] text-white/70 leading-relaxed">
                    {LINGBOT_VERSIONS["1.0"].descriptionZh}
                  </p>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4 bg-white/5 rounded-[16px] p-4 text-[16px] tnum">
                    <div>
                      <div className="text-white/40">模型规模</div>
                      <div className="text-white font-medium">{LINGBOT_VERSIONS["1.0"].parameterCount}</div>
                    </div>
                    <div>
                      <div className="text-white/40">渲染性能</div>
                      <div className="text-white font-medium">{LINGBOT_VERSIONS["1.0"].fps}</div>
                    </div>
                    <div>
                      <div className="text-white/40">生成持续性</div>
                      <div className="text-white font-medium">{LINGBOT_VERSIONS["1.0"].durationCapability}</div>
                    </div>
                    <div>
                      <div className="text-white/40">内核算法</div>
                      <div className="text-white font-medium">{LINGBOT_VERSIONS["1.0"].architecture}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] bg-[#18181c] p-8 terra-reveal flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#c23b3b]/20 px-3 py-1 text-[16px] text-[#ff7a7a] font-medium">
                      {LINGBOT_VERSIONS["2.0"].badge}
                    </span>
                    <span className="text-[16px] text-white/40 tnum">Flagship Production</span>
                  </div>
                  <h3 className="mt-4 text-[24px] font-bold text-white tracking-tight">
                    {LINGBOT_VERSIONS["2.0"].title}
                  </h3>
                  <p className="mt-2 text-[16px] text-white/70 leading-relaxed">
                    {LINGBOT_VERSIONS["2.0"].descriptionZh}
                  </p>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4 bg-white/5 rounded-[16px] p-4 text-[16px] tnum">
                    <div>
                      <div className="text-white/40">模型规模</div>
                      <div className="text-white font-medium">{LINGBOT_VERSIONS["2.0"].parameterCount}</div>
                    </div>
                    <div>
                      <div className="text-white/40">渲染性能</div>
                      <div className="text-[#34c759] font-medium">{LINGBOT_VERSIONS["2.0"].fps} · 720p HD</div>
                    </div>
                    <div>
                      <div className="text-white/40">生成持续性</div>
                      <div className="text-white font-medium">{LINGBOT_VERSIONS["2.0"].durationCapability}</div>
                    </div>
                    <div>
                      <div className="text-white/40">双智能体机制</div>
                      <div className="text-white font-medium">Pilot + Director Agents</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 世界预设卡片库 */}
            <div className="mt-16">
              <h3 className="text-[24px] font-bold text-white tracking-tight">
                交互世界初始化预设 (World Presets)
              </h3>
              <p className="mt-2 text-[16px] text-white/60">
                支持以实景摄影或提示词一键初始化三维世界，点击即可在上方交互视界中加载探索。
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {WORLD_PRESETS.map((preset: WorldPreset) => (
                  <article
                    key={preset.id}
                    className="rounded-[20px] bg-[#141416] p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden rounded-[16px]">
                        <Image
                          src={preset.image}
                          alt={preset.nameZh}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-3 text-[16px] text-white/50">{preset.tag}</div>
                      <h4 className="mt-1 text-[20px] font-bold text-white tracking-tight">
                        {preset.nameZh}
                      </h4>
                      <p className="mt-2 text-[16px] text-white/70 leading-relaxed">
                        {preset.descriptionZh}
                      </p>
                    </div>

                    <div className="mt-4 pt-2">
                      <button
                        type="button"
                        onClick={() => handleTeleportToPreset(preset.id)}
                        className="terra-btn w-full rounded-full bg-white/10 py-2.5 text-[16px] font-medium text-white hover:bg-white/20 transition"
                      >
                        在游乐场中载入生成 ↑
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 核心第三屏：商业模式、受众画像与 Reactor 平台服务 */}
        <section id="commercial-scenarios" className="bg-[#070707] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
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
                    在移动设备上启动交互游乐场
                  </h3>
                  <p className="mt-4 text-[16px] sm:text-[18px] text-white/70 leading-relaxed max-w-xl">
                    支持在任意手机浏览器中通过触摸方向键体验 LingBot-World 2.0 实时因果流式生成，随时随地探索交互时空。
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

      <footer className="bg-[#070707] py-12 text-center text-[16px] text-white/40">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 LINGBOT-WORLD // Reactor.inc Playground & Robbyant Open Source.</p>
          <p>Real-Time Action-Conditioned 14B Causal World Model.</p>
        </div>
      </footer>
    </div>
  );
}
