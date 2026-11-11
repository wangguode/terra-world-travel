"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import WorldModelSimulator from "@/components/beijing-pulse-world-model";
import { WORLD_DIMENSIONS, WorldDimension } from "@/lib/oasis-world-app-data";
import { useLanguage } from "@/lib/language-context";
import { getTranslation } from "@/lib/i18n";
import { AppleHeader } from "@/components/apple-header";
import { AppleFooter } from "@/components/apple-footer";
import { CopilotDrawer } from "@/components/copilot-drawer";

export default function HomePage() {
  const { lang } = useLanguage();
  const t = getTranslation(lang);

  // 基础沙盒与交互状态
  const [activeWorldId, setActiveWorldId] = useState<string>("voxel-oasis");
  const [activeHour, setActiveHour] = useState<number>(17.5);
  const [snowMode, setSnowMode] = useState<boolean>(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [copiedBibtex, setCopiedBibtex] = useState<boolean>(false);
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);

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
  }, [lang]);

  const toggleFaq = (index: number) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  const handleCopyBibtex = async () => {
    const bibtex = `@article{terra_oasis_2026,
  title={Terra-Oasis: Playable Action-Conditioned Neural World Model Application},
  author={Wang, Guo and Terra World Lab Team},
  journal={arXiv preprint arXiv:2603.01892},
  year={2026}
}`;
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopiedBibtex(true);
      setTimeout(() => setCopiedBibtex(false), 2200);
    } catch {
      setCopiedBibtex(true);
      setTimeout(() => setCopiedBibtex(false), 2200);
    }
  };

  const activeDimension: WorldDimension =
    WORLD_DIMENSIONS.find((d) => d.id === activeWorldId) || WORLD_DIMENSIONS[0];

  const FAQS = [
    {
      q:
        lang === "en"
          ? "How does TERRA-OASIS fundamentally differ from game engines like Unreal or Unity?"
          : "TERRA-OASIS 与传统游戏引擎（Unreal / Unity）的本质区别是什么？",
      a:
        lang === "en"
          ? "Traditional game engines rely on explicit handcrafted 3D meshes, vertex colliders, and discrete ODE physics equations. TERRA-OASIS is an action-conditioned causal world model: every pixel, depth latent, and physical response is predicted autoregressively by a 14B diffusion transformer directly from control vectors."
          : "传统游戏引擎依赖人工制作的三维多边形网格（3D Meshes）、贴图、刚体碰撞盒与硬编码牛顿力学公式。而 TERRA-OASIS 是纯粹的因果生成式世界模型：所有画面、深度潜空间与阻挡反应均由 14B 自回归因果扩散 Transformer 直接根据控制向量实时预测演化。",
    },
    {
      q:
        lang === "en"
          ? "Why can it achieve continuous 60 FPS in standard browsers without local high-end GPUs?"
          : "为什么无需高配置独立显卡即可在普通浏览器中达到 60 FPS 实时推流？",
      a:
        lang === "en"
          ? "TERRA-OASIS leverages edge WebGPU shader computation coupled with distributed cloud inference. Users stream action latents while receiving multi-channel implicit radiances in under 16 milliseconds."
          : "TERRA-OASIS 采用边缘端轻量 WebGPU 着色器与云端分布式推理管线协同的混合架构。用户通过 WebSocket 发送动作潜变量，在 16 毫秒内即可回传多通道隐式辐射场与深度数据，极大降低了终端硬件门槛。",
    },
    {
      q:
        lang === "en"
          ? "How does the model calculate physical collisions and gravity without 3D bounding boxes?"
          : "模型是如何在没有任何三维碰撞盒的情况下计算物理碰撞与重力下坠的？",
      a:
        lang === "en"
          ? "There are zero pre-authored 3D meshes. Through training on massive physical interaction telemetry, the neural network spontaneously internalizes intuitive physics, deducing momentum conservation, buoyancy, and elasticity inside latent space weights."
          : "世界中没有任何预制的三维几何体或离散碰撞盒子。通过在海量运动时空遥测数据上的训练，神经网络自发涌现了「内化直觉物理」，在潜空间参数内部自主推演动量守恒、重力加速度与碰撞弹性。",
    },
    {
      q:
        lang === "en"
          ? "How can robotics and autonomous driving teams integrate this pipeline?"
          : "具身智能机器人与自动驾驶团队如何将该管线接入自己的研发闭环？",
      a:
        lang === "en"
          ? "We provide an open-source WebSocket and gRPC action-conditioning SDK. Simply stream robotic actuator poses ([x, y, z, roll, pitch, yaw]) to receive 720p@60FPS neural sensor feeds for closed-loop Sim-to-Real policy training."
          : "我们提供了开源的 WebSocket 与 gRPC 动作条件注入 SDK。只需持续发送机器人执行器位姿张量（如 [x, y, z, roll, pitch, yaw]），即可实时接收 720p@60FPS 神经传感器数据流，无缝服务于具身智能 Sim-to-Real 闭环仿真。",
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#000000] text-[#f5f5f7] overflow-x-hidden selection:bg-[#0071e3] selection:text-white">
      {/* 1. 单层 Apple 旗舰纯黑毛玻璃导航 */}
      <AppleHeader
        onOpenCopilot={() => setCopilotOpen(true)}
        snowMode={snowMode}
        onToggleSnow={() => setSnowMode(!snowMode)}
      />

      <main className="w-full">
        {/* =========================================================================
            2. Hero Section (Apple Pro 级别电影感巨幅大片，黑底深邃钛金排版)
           ========================================================================= */}
        <section id="hero" className="relative bg-[#000000] pt-20 sm:pt-28 pb-20 sm:pb-32 text-center terra-reveal w-full box-border">
          <div className="mx-auto max-w-5xl px-6 sm:px-8 space-y-6">
            <h1 className="text-[32px] sm:text-[56px] lg:text-[72px] font-semibold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
              {t.hero.headline}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[14px] text-[#2997ff] font-medium">
              <span className="h-2 w-2 rounded-full bg-[#2997ff]" />
              <span>{t.hero.tagline}</span>
            </div>

            <p className="text-[17px] sm:text-[20px] text-[#a1a1a6] max-w-3xl mx-auto leading-relaxed font-normal">
              {t.hero.lead}
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-[15px]">
              <a
                href="#interactive-playground"
                className="rounded-full bg-white px-7 py-3 text-black font-semibold hover:bg-white/90 transition no-underline"
              >
                {t.hero.primaryCta}
              </a>
              <Link
                href="/docs"
                className="rounded-full bg-[#161617] px-7 py-3 text-white font-medium hover:bg-[#1c1c1e] transition no-underline flex items-center gap-1.5"
              >
                <span>{t.hero.docsCta}</span>
                <span>&gt;</span>
              </Link>
              <button
                type="button"
                onClick={() => setCopilotOpen(true)}
                className="text-[#2997ff] hover:underline flex items-center gap-1 font-medium transition cursor-pointer"
              >
                <span>{t.hero.copilotCta}</span>
                <span>&gt;</span>
              </button>
            </div>

            {/* Apple 核心硬核规格矩阵 (Key Specs Matrix) */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="rounded-[24px] bg-[#121214] p-6 sm:p-8 text-center transition hover:bg-[#161617]">
                <div className="text-[36px] sm:text-[48px] font-semibold text-white tracking-tight tnum">
                  {t.specs.modelParam}
                </div>
                <div className="mt-2 text-[14px] text-[#86868b] font-normal">
                  {t.specs.modelDesc}
                </div>
              </div>

              <div className="rounded-[24px] bg-[#121214] p-6 sm:p-8 text-center transition hover:bg-[#161617]">
                <div className="text-[36px] sm:text-[48px] font-semibold text-[#2997ff] tracking-tight tnum">
                  {t.specs.fps}
                </div>
                <div className="mt-2 text-[14px] text-[#86868b] font-normal">
                  {t.specs.fpsDesc}
                </div>
              </div>

              <div className="rounded-[24px] bg-[#121214] p-6 sm:p-8 text-center transition hover:bg-[#161617]">
                <div className="text-[36px] sm:text-[48px] font-semibold text-white tracking-tight tnum">
                  {t.specs.latency}
                </div>
                <div className="mt-2 text-[14px] text-[#86868b] font-normal">
                  {t.specs.latencyDesc}
                </div>
              </div>

              <div className="rounded-[24px] bg-[#121214] p-6 sm:p-8 text-center transition hover:bg-[#161617]">
                <div className="text-[36px] sm:text-[48px] font-semibold text-white tracking-tight tnum">
                  {t.specs.poly}
                </div>
                <div className="mt-2 text-[14px] text-[#86868b] font-normal">
                  {t.specs.polyDesc}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. Apple 标志性交互 Tab 控制器 (Segmented Control & Dimension Switcher)
           ========================================================================= */}
        <section id="interactive-playground" className="relative bg-[#000000] py-16 sm:py-24 terra-reveal w-full box-border">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-[32px] sm:text-[48px] font-semibold text-white tracking-tight leading-[1.08]">
                {t.sandbox.title}
              </h2>
              <p className="text-[16px] sm:text-[18px] text-[#a1a1a6] leading-relaxed">
                {t.sandbox.desc}
              </p>
            </div>

            {/* Apple 经典药丸形 Tab 切换栏 (Segmented Control) */}
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-[#161617] p-1.5 max-w-3xl mx-auto">
              {WORLD_DIMENSIONS.map((dim) => {
                const isActive = dim.id === activeWorldId;
                return (
                  <button
                    key={dim.id}
                    type="button"
                    onClick={() => setActiveWorldId(dim.id)}
                    className={`rounded-full px-5 py-2 text-[14px] font-medium transition cursor-pointer ${
                      isActive
                        ? "bg-white text-black"
                        : "text-[#a1a1a6] hover:text-white"
                    }`}
                  >
                    <span>{dim.name}</span>
                  </button>
                );
              })}
            </div>

            {/* 激活维度的技术规格小胶囊条 */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-[#86868b]">
              <span>Gravity: <strong className="text-white font-medium">{activeDimension.physics.gravity} m/s²</strong></span>
              <span>•</span>
              <span>Causal Window: <strong className="text-white font-medium">{activeDimension.diffusionConfig.causalWindow} frames</strong></span>
              <span>•</span>
              <span>Latent Dim: <strong className="text-white font-medium">{activeDimension.diffusionConfig.latentDim}</strong></span>
              <span>•</span>
              <span>Target: <strong className="text-[#2997ff] font-medium">{activeDimension.diffusionConfig.frameRate} FPS</strong></span>
            </div>

            {/* 实机 3D 模拟器硬件外壳容器 */}
            <div className="rounded-[32px] bg-[#121214] p-4 sm:p-6 w-full box-border">
              <WorldModelSimulator
                activeWorldId={activeWorldId}
                onSelectWorld={setActiveWorldId}
                hour={activeHour}
                onChangeHour={setActiveHour}
                snowMode={snowMode}
              />
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. Apple Bento Grid 四大核心技术支柱 (彻底去除 1、2、3、4 编号，高级硬件排版)
           ========================================================================= */}
        <section id="technological-pillars" className="relative bg-[#000000] py-20 sm:py-28 terra-reveal w-full box-border">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 space-y-12">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-[32px] sm:text-[48px] font-semibold text-white tracking-tight leading-[1.08]">
                {t.pillars.title}
              </h2>
              <p className="text-[17px] sm:text-[19px] text-[#a1a1a6] leading-relaxed">
                {t.pillars.desc}
              </p>
            </div>

            {/* Bento Grid 经典卡片排布 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Pillar 1: Action Conditioning (大跨度主展位) */}
              <div className="md:col-span-7 rounded-[32px] bg-[#121214] p-8 sm:p-12 flex flex-col justify-between space-y-8 transition hover:bg-[#161617]">
                <div className="space-y-3">
                  <h3 className="text-[24px] sm:text-[30px] font-semibold text-white tracking-tight">
                    {t.pillars.pillar1.title}
                  </h3>
                  <div className="text-[14px] text-[#2997ff] font-medium">Real-Time Continuous Ingestion</div>
                  <p className="text-[16px] text-[#d2d2d7] leading-relaxed max-w-xl">
                    {t.pillars.pillar1.desc}
                  </p>
                </div>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px]">
                  <Image
                    src="/images/beijing-pulse/hero-beijing.jpg"
                    alt="Action Conditioning Matrix"
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Pillar 2: Infinite Causal Horizon */}
              <div className="md:col-span-5 rounded-[32px] bg-[#121214] p-8 sm:p-10 flex flex-col justify-between space-y-6 transition hover:bg-[#161617]">
                <div className="space-y-2">
                  <h3 className="text-[20px] sm:text-[22px] lg:text-[26px] font-semibold text-white tracking-tight leading-snug">
                    {t.pillars.pillar2.title}
                  </h3>
                  <div className="text-[13px] text-[#2997ff] font-medium">Autoregressive Memory Anchors</div>
                  <p className="text-[15px] text-[#d2d2d7] leading-relaxed">
                    {t.pillars.pillar2.desc}
                  </p>
                </div>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px]">
                  <Image
                    src="/images/beijing-pulse/forbidden-city.jpg"
                    alt="4D Spatiotemporal Memory Anchors"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Pillar 3: Learned Intuitive Physics */}
              <div className="md:col-span-5 rounded-[32px] bg-[#121214] p-8 sm:p-10 flex flex-col justify-between space-y-6 transition hover:bg-[#161617]">
                <div className="space-y-2">
                  <h3 className="text-[20px] sm:text-[22px] lg:text-[26px] font-semibold text-white tracking-tight leading-snug">
                    {t.pillars.pillar3.title}
                  </h3>
                  <div className="text-[13px] text-[#2997ff] font-medium">Spontaneous Mechanics Emergence</div>
                  <p className="text-[15px] text-[#d2d2d7] leading-relaxed">
                    {t.pillars.pillar3.desc}
                  </p>
                </div>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px]">
                  <Image
                    src="/images/beijing-pulse/temple-of-heaven.jpg"
                    alt="Sun Path and Optics Emergence"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Pillar 4: Neural Perturbation & Self-Healing */}
              <div className="md:col-span-7 rounded-[32px] bg-[#121214] p-8 sm:p-12 flex flex-col justify-between space-y-8 transition hover:bg-[#161617]">
                <div className="space-y-3">
                  <h3 className="text-[24px] sm:text-[30px] font-semibold text-white tracking-tight">
                    {t.pillars.pillar4.title}
                  </h3>
                  <div className="text-[14px] text-[#2997ff] font-medium">Local Noise Dedication & Restoration</div>
                  <p className="text-[16px] text-[#d2d2d7] leading-relaxed max-w-xl">
                    {t.pillars.pillar4.desc}
                  </p>
                </div>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px]">
                  <Image
                    src="/images/beijing-pulse/798.jpg"
                    alt="Neural Voxel Perturbation Dynamics"
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. Sim-to-Real 具身智能遥测与跨端体验 (Embodied Telemetry Showcase)
           ========================================================================= */}
        <section className="relative bg-[#000000] py-20 sm:py-28 terra-reveal w-full box-border">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <h2 className="text-[32px] sm:text-[48px] font-semibold text-white tracking-tight leading-[1.08]">
                  {lang === "en" ? "Bridging the Real-World Sim Gap" : "消除机器人视觉与物理虚实鸿沟"}
                </h2>
                <div className="text-[14px] text-[#2997ff] font-medium">Sim-to-Real Policy Benchmark</div>
                <p className="text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed">
                  {lang === "en"
                    ? "Unitree quadruped robots and bipedal humanoids trained in TERRA-OASIS achieve a 94.2% zero-shot success rate across varied terrain and extreme lighting variations."
                    : "在 TERRA-OASIS 神经潜空间中预训练的四足与双足人形机器人，在真机跨域迁移实验中实现了 94.2% 的高成功率，无需繁琐的真机反复微调。"}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-[14px]">
                  <Link
                    href="/research"
                    className="rounded-full bg-white px-6 py-2.5 text-black font-semibold hover:bg-white/90 transition no-underline"
                  >
                    {lang === "en" ? "Read Benchmark Paper ↗" : "查阅基准论文 ↗"}
                  </Link>
                  <Link
                    href="/docs"
                    className="rounded-full bg-[#161617] px-6 py-2.5 text-white font-medium hover:bg-[#1c1c1e] transition no-underline"
                  >
                    {lang === "en" ? "Explore Telemetry SDK >" : "查看遥测协议 SDK >"}
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 w-full">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[24px]">
                  <Image
                    src="/images/beijing-pulse/summer-palace.jpg"
                    alt="Autonomous Sim-to-Real Testing"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. Developer Hub & Action SDK (对标 Apple Developer 规范生态)
           ========================================================================= */}
        <section id="developer-hub" className="relative bg-[#000000] py-20 sm:py-28 terra-reveal w-full box-border">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-[32px] sm:text-[48px] font-semibold text-white tracking-tight">
                {t.quickstart.title}
              </h2>
              <p className="text-[16px] sm:text-[18px] text-[#a1a1a6] leading-relaxed">
                {t.quickstart.desc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-[28px] bg-[#121214] p-8 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-[20px] font-semibold text-white">{t.quickstart.webTitle}</h3>
                  <p className="text-[15px] text-[#a1a1a6] leading-relaxed">{t.quickstart.webDesc}</p>
                </div>
                <a
                  href="#interactive-playground"
                  className="text-[#2997ff] hover:underline text-[14px] font-medium flex items-center gap-1"
                >
                  <span>{t.quickstart.webBtn}</span>
                </a>
              </div>

              <div className="rounded-[28px] bg-[#121214] p-8 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-[20px] font-semibold text-white">{t.quickstart.sdkTitle}</h3>
                  <pre className="rounded-[16px] bg-[#070707] p-4 text-[13px] text-white/90 overflow-x-auto leading-relaxed">
                    <code>pip install terra-oasis-sdk</code>
                  </pre>
                  <p className="text-[15px] text-[#a1a1a6] leading-relaxed">
                    Connect keyboard or actuator control vectors at 60 FPS via WebSocket streaming.
                  </p>
                </div>
                <Link
                  href="/docs"
                  className="text-[#2997ff] hover:underline text-[14px] font-medium flex items-center gap-1 no-underline"
                >
                  <span>{t.quickstart.sdkBtn}</span>
                </Link>
              </div>

              <div className="rounded-[28px] bg-[#121214] p-8 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-[20px] font-semibold text-white">{t.quickstart.deployTitle}</h3>
                  <p className="text-[15px] text-[#a1a1a6] leading-relaxed">{t.quickstart.deployDesc}</p>
                </div>
                <Link
                  href="/docs"
                  className="text-[#2997ff] hover:underline text-[14px] font-medium flex items-center gap-1 no-underline"
                >
                  <span>{t.quickstart.deployBtn}</span>
                </Link>
              </div>
            </div>

            {/* 开源社区与学术引用条 */}
            <div className="rounded-[28px] bg-[#121214] p-8 sm:p-12 flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <h3 className="text-[22px] font-semibold text-white">{t.quickstart.openSourceTitle}</h3>
                <p className="text-[15px] text-[#a1a1a6] leading-relaxed">{t.quickstart.openSourceDesc}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[14px]">
                <a
                  href="https://github.com/wangguode/terra-world-travel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white px-6 py-2.5 text-black font-semibold hover:bg-white/90 transition no-underline"
                >
                  {t.quickstart.githubBtn}
                </a>
                <button
                  type="button"
                  onClick={handleCopyBibtex}
                  className="rounded-full bg-white/10 px-6 py-2.5 text-white font-medium hover:bg-white/20 transition cursor-pointer"
                >
                  {copiedBibtex ? t.quickstart.bibtexCopied : t.quickstart.copyBibtexBtn}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. FAQ 手风琴常见问答 (Apple 标志性折叠设计)
           ========================================================================= */}
        <section id="faq" className="relative bg-[#000000] py-20 sm:py-28 terra-reveal w-full box-border">
          <div className="mx-auto max-w-5xl px-6 sm:px-8 space-y-10">
            <h2 className="text-[28px] sm:text-[40px] font-semibold text-white tracking-tight">
              {t.faq.title}
            </h2>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => {
                const isOpen = activeFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-[24px] bg-[#121214] p-6 sm:p-8 transition cursor-pointer hover:bg-[#161617]"
                    onClick={() => toggleFaq(idx)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-[18px] sm:text-[20px] font-medium text-white">
                        {faq.q}
                      </h3>
                      <span className="text-[20px] text-[#86868b] shrink-0 font-light">
                        {isOpen ? "−" : "+"}
                      </span>
                    </div>

                    {isOpen && (
                      <p className="mt-4 text-[16px] text-[#d2d2d7] leading-relaxed">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. Footnotes (Apple 官方学术注脚)
           ========================================================================= */}
        <section className="bg-[#000000] py-12 px-6 sm:px-8 text-[13px] text-[#86868b] leading-relaxed w-full box-border">
          <div className="mx-auto max-w-6xl space-y-2">
            <p>1. 14B Causal DiT 深度架构设计与消融实验基准数据已收录于 arXiv:2603.01892 预印本学术论文。</p>
            <p>2. 60 FPS 实时推流需支持 WebGPU 或现代 WebGL 2.0 硬件加速环境之浏览器支持。</p>
            <p>3. 具身智能 Sim-to-Real 迁移基准数据基于 Unitree Go2 四足机器人与 Fourier GR-1 人形机器人 100+ 次实测统计。</p>
            <p>4. TERRA-OASIS 为开源科研空间智能应用项目，模型权重与代码遵循 Apache 2.0 协议发布。</p>
          </div>
        </section>
      </main>

      {/* 9. 全局单层页脚 */}
      <AppleFooter />

      {/* 10. AI 侧边小抽屉 */}
      <CopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
}
