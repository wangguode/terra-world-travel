"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
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

  // 基础沙盒状态
  const [activeWorldId, setActiveWorldId] = useState<string>("voxel-oasis");
  const [activeHour, setActiveHour] = useState<number>(17.5);
  const [snowMode, setSnowMode] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedBibtex, setCopiedBibtex] = useState<boolean>(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // AI Copilot 侧边抽屉状态 (用户核心要求：点击弹出抽屉而不是切整页)
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

  useEffect(() => {
    const origin =
      typeof window !== "undefined" && window.location.origin.includes("workers.dev")
        ? window.location.origin
        : "https://terra-world-travel.153557421.workers.dev";

    QRCode.toDataURL(origin, {
      width: 220,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => {
        setQrCodeDataUrl(url);
        setCurrentUrl(origin);
      })
      .catch((err) => console.error("QR Code Error:", err));
  }, []);

  const handleCopyUrl = async () => {
    const url = currentUrl || "https://terra-world-travel.153557421.workers.dev";
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    }
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
      setTimeout(() => setCopiedBibtex(false), 2400);
    } catch {
      setCopiedBibtex(true);
      setTimeout(() => setCopiedBibtex(false), 2400);
    }
  };

  const handleSelectDimension = (worldId: string) => {
    setActiveWorldId(worldId);
    const el = document.getElementById("interactive-playground");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const toggleFaq = (index: number) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  const FAQS = [
    {
      q:
        lang === "en"
          ? "How does TERRA-OASIS fundamentally differ from game engines (Unreal/Unity)?"
          : "TERRA-OASIS 与传统游戏引擎（Unreal / Unity）的本质区别是什么？",
      a:
        lang === "en"
          ? "Traditional engines rely on handcrafted 3D polygonal meshes, UV textures, and pre-programmed physics equations. TERRA-OASIS is a pure generative world model. Every frame is predicted on-the-fly by a 14B Causal DiT directly from past actions and emergent intuitive physics."
          : "传统游戏引擎依赖人工制作的 3D 几何网格（Meshes）、纹理贴图、光照烘焙和手工物理碰撞体。而 TERRA-OASIS 是纯粹的自回归生成式世界模型。它无需预设三维网格，每帧画面由 14B 因果扩散 Transformer 直接根据前序动作与时空记忆实时预测生成，从底层重构了交互式虚拟世界的呈现方式。",
    },
    {
      q:
        lang === "en"
          ? "Why can it achieve 60 FPS in browsers without local high-end GPUs?"
          : "为什么在浏览器中无需高端 GPU 就能达到 60 FPS 实时推流？",
      a:
        lang === "en"
          ? "TERRA-OASIS leverages a hybrid architecture combining cloud-distributed causal diffusion inference pipelines with a lightweight WebGL client, streaming action latents and multi-channel implicit neural radiances in under 16ms."
          : "TERRA-OASIS 采用云端分布式因果扩散推理管线与现代浏览器轻量 WebGL 客户端结合的混合架构。模型将用户按键转化为连续动作潜变量注入骨干，同时在边缘端利用轻量化着色器进行多通道隐式渲染（RGB辐射场、深度潜空间与法线通道），大幅降低了终端运行门槛。",
    },
    {
      q:
        lang === "en"
          ? "How does the model evaluate collisions and gravity without 3D meshes?"
          : "世界模型是如何判断障碍物碰撞与重力下坠的？世界里有真实的 3D 网格吗？",
      a:
        lang === "en"
          ? "There are zero pre-authored 3D meshes or rigid colliders. The model learns 'intuitive physics' implicitly through training on massive spatial interaction telemetry. It spontaneously understands impenetrability, gravitational acceleration, and fluid buoyancy."
          : "世界中没有任何预先制作的三维网格（3D Meshes）或离散碰撞盒子。模型在海量高精度物理交互与空间数据训练中，自主学会了「内化直觉物理（Learned Intuitive Physics）」。它理解墙壁无法穿透、悬空物体会下落、水体具有浮力，因此能够在神经网络参数内部直接计算因果阻挡与重力积分。",
    },
    {
      q:
        lang === "en"
          ? "How can developers integrate TERRA-OASIS into robotics or games?"
          : "如何将 TERRA-OASIS 动作流接入自己的游戏或具身智能机器人研发管线？",
      a:
        lang === "en"
          ? "We provide a WebSocket action-conditioning SDK. Simply stream control vectors ([x, y, z, roll, pitch, yaw]) to receive 720p@60FPS neural frames and depth maps for closed-loop Sim-to-Real simulation."
          : "TERRA-OASIS 提供了基于 WebSocket 的标准动作条件注入 SDK。任何第三方系统只需持续发送按键或执行器位姿张量（如 [x, y, z, roll, pitch, yaw]），服务端即可实时回传 720p@60FPS 神经渲染帧与隐式深度场，可无缝用于具身智能 Sim-to-Real 闭环仿真或交互游戏制作。",
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#000000] text-[#f5f5f7]">
      {/* 1. 单层规范 Apple 旗舰导航 (统一解决用户指出的双层重复问题) */}
      <AppleHeader
        onOpenCopilot={() => setCopilotOpen(true)}
        snowMode={snowMode}
        onToggleSnow={() => setSnowMode(!snowMode)}
      />

      <main>
        {/* 2. Apple 经典居中大片感 Hero Section */}
        <section id="hero" className="relative bg-[#000000] pt-16 sm:pt-24 pb-20 sm:pb-28 text-center">
          <div className="mx-auto max-w-5xl px-5 sm:px-10">
            <div className="space-y-4 terra-reveal">
              <div className="text-[17px] sm:text-[19px] font-semibold text-[#f5f5f7] tracking-tight">
                {t.hero.tagline}
              </div>

              <h1 className="text-[28px] sm:text-[50px] lg:text-[68px] font-semibold text-[#f5f5f7] tracking-tight leading-[1.08] max-w-4xl mx-auto">
                {t.hero.headline}
              </h1>

              <p className="mt-4 text-[17px] sm:text-[20px] text-[#d2d2d7] max-w-2xl mx-auto leading-relaxed tnum font-normal">
                {t.hero.lead}
              </p>

              <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-[16px]">
                <a
                  href="#interactive-playground"
                  className="rounded-full bg-[#0071e3] px-6 py-2.5 text-white hover:bg-[#0077ed] transition no-underline font-medium"
                >
                  {t.hero.primaryCta}
                </a>
                <Link
                  href="/docs"
                  className="text-[#2997ff] hover:underline flex items-center gap-1 font-medium transition no-underline"
                >
                  <span>{t.hero.docsCta}</span>
                  <span>&gt;</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setCopilotOpen(true)}
                  className="text-[#2997ff] hover:underline flex items-center gap-1 font-medium transition"
                >
                  <span>{t.hero.copilotCta}</span>
                  <span>&gt;</span>
                </button>
              </div>
            </div>

            {/* Apple 规格矩阵 (Key Specs Matrix) */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="rounded-[24px] bg-[#161617] p-6 sm:p-8 text-center terra-reveal">
                <div className="text-[36px] sm:text-[48px] font-semibold text-white tracking-tight tnum">
                  {t.specs.modelParam}
                </div>
                <div className="mt-2 text-[14px] text-[#a1a1a6] font-normal">
                  {t.specs.modelDesc}
                </div>
              </div>

              <div className="rounded-[24px] bg-[#161617] p-6 sm:p-8 text-center terra-reveal">
                <div className="text-[36px] sm:text-[48px] font-semibold text-[#2997ff] tracking-tight tnum">
                  {t.specs.fps}
                </div>
                <div className="mt-2 text-[14px] text-[#a1a1a6] font-normal">
                  {t.specs.fpsDesc}
                </div>
              </div>

              <div className="rounded-[24px] bg-[#161617] p-6 sm:p-8 text-center terra-reveal">
                <div className="text-[36px] sm:text-[48px] font-semibold text-white tracking-tight tnum">
                  {t.specs.latency}
                </div>
                <div className="mt-2 text-[14px] text-[#a1a1a6] font-normal">
                  {t.specs.latencyDesc}
                </div>
              </div>

              <div className="rounded-[24px] bg-[#161617] p-6 sm:p-8 text-center terra-reveal">
                <div className="text-[36px] sm:text-[48px] font-semibold text-white tracking-tight tnum">
                  {t.specs.poly}
                </div>
                <div className="mt-2 text-[14px] text-[#a1a1a6] font-normal">
                  {t.specs.polyDesc}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 在线交互沙盒官方体验区 (Apple Style Sandbox) */}
        <section id="interactive-playground" className="relative bg-[#000000] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-3xl terra-reveal">
              <h2 className="text-[28px] sm:text-[40px] font-semibold text-white tracking-tight">
                {t.sandbox.title}
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed">
                {t.sandbox.desc}
              </p>
            </div>

            {/* 视窗硬件级外壳容器 */}
            <div className="mt-8 rounded-[28px] bg-[#161617] p-2 sm:p-3 terra-reveal">
              <div className="relative w-full h-[65vh] sm:h-[75vh] min-h-[480px] rounded-[22px] overflow-hidden bg-black">
                <WorldModelSimulator
                  activeWorldId={activeWorldId}
                  onSelectWorld={setActiveWorldId}
                  hour={activeHour}
                  onChangeHour={setActiveHour}
                  snowMode={snowMode}
                />
              </div>

              {/* 视窗下方快捷操作指南条 */}
              <div className="mt-3 px-3 py-2 flex flex-wrap items-center justify-between gap-4 text-[14px] text-[#a1a1a6]">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div>
                    <span className="rounded-[6px] bg-white/10 px-2 py-0.5 text-white font-medium mr-1.5">
                      {t.sandbox.controls.wasd}
                    </span>
                    <span>{t.sandbox.controls.wasdLabel}</span>
                  </div>
                  <div>
                    <span className="rounded-[6px] bg-white/10 px-2 py-0.5 text-white font-medium mr-1.5">
                      {t.sandbox.controls.space}
                    </span>
                    <span>{t.sandbox.controls.spaceLabel}</span>
                  </div>
                  <div>
                    <span className="rounded-[6px] bg-white/10 px-2 py-0.5 text-[#2997ff] font-medium mr-1.5">
                      {t.sandbox.controls.eKey}
                    </span>
                    <span>{t.sandbox.controls.eKeyLabel}</span>
                  </div>
                  <div>
                    <span className="rounded-[6px] bg-white/10 px-2 py-0.5 text-white font-medium mr-1.5">
                      {t.sandbox.controls.rKey}
                    </span>
                    <span>{t.sandbox.controls.rKeyLabel}</span>
                  </div>
                </div>

                <div className="text-[14px] text-[#a1a1a6]">
                  {t.sandbox.controls.note}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 四大核心技术支柱 (Apple Bento Grid 风格重塑，解决 1、2、3、4 啰嗦与排版问题) */}
        <section id="technological-pillars" className="bg-[#000000] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[28px] sm:text-[40px] font-semibold text-white tracking-tight">
                {t.pillars.title}
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed">
                {t.pillars.desc}
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* 卡片 1 */}
              <div className="rounded-[28px] bg-[#161617] p-8 sm:p-10 space-y-3 terra-reveal">
                <h3 className="text-[22px] sm:text-[24px] font-semibold text-white tracking-tight">
                  {t.pillars.pillar1.title}
                </h3>
                <p className="text-[16px] text-[#d2d2d7] leading-relaxed">
                  {t.pillars.pillar1.desc}
                </p>
              </div>

              {/* 卡片 2 */}
              <div className="rounded-[28px] bg-[#161617] p-8 sm:p-10 space-y-3 terra-reveal">
                <h3 className="text-[22px] sm:text-[24px] font-semibold text-white tracking-tight">
                  {t.pillars.pillar2.title}
                </h3>
                <p className="text-[16px] text-[#d2d2d7] leading-relaxed">
                  {t.pillars.pillar2.desc}
                </p>
              </div>

              {/* 卡片 3 */}
              <div className="rounded-[28px] bg-[#161617] p-8 sm:p-10 space-y-3 terra-reveal">
                <h3 className="text-[22px] sm:text-[24px] font-semibold text-white tracking-tight">
                  {t.pillars.pillar3.title}
                </h3>
                <p className="text-[16px] text-[#d2d2d7] leading-relaxed">
                  {t.pillars.pillar3.desc}
                </p>
              </div>

              {/* 卡片 4 */}
              <div className="rounded-[28px] bg-[#161617] p-8 sm:p-10 space-y-3 terra-reveal">
                <h3 className="text-[22px] sm:text-[24px] font-semibold text-white tracking-tight">
                  {t.pillars.pillar4.title}
                </h3>
                <p className="text-[16px] text-[#d2d2d7] leading-relaxed">
                  {t.pillars.pillar4.desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. 五大沙盒世界维度画廊 */}
        <section id="world-dimensions" className="bg-[#000000] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-2xl">
              <h2 className="text-[28px] sm:text-[40px] font-semibold text-white tracking-tight">
                {t.dimensions.title}
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed">
                {t.dimensions.desc}
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {WORLD_DIMENSIONS.map((world: WorldDimension) => (
                <article
                  key={world.id}
                  className="rounded-[28px] bg-[#161617] p-6 sm:p-7 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01]"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[20px]">
                      <Image
                        src={world.image}
                        alt={world.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-white/5 px-3 py-1 text-[13px] text-[#2997ff] font-medium">
                        {world.category}
                      </span>
                      <span className="text-[13px] text-[#a1a1a6] tnum">
                        {world.codename}
                      </span>
                    </div>

                    <h3 className="mt-3 text-[20px] font-semibold text-white tracking-tight">
                      {world.name}
                    </h3>

                    <p className="mt-2 text-[15px] text-[#d2d2d7] leading-relaxed">
                      {world.description}
                    </p>

                    <div className="mt-4 bg-[#1d1d1f] rounded-[18px] p-4 space-y-2 text-[14px] tnum">
                      <div className="flex justify-between">
                        <span className="text-[#a1a1a6]">{lang === "en" ? "Gravity:" : "动力学重力："}</span>
                        <span className="text-white font-medium">{world.physics.gravity} m/s²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a1a1a6]">{lang === "en" ? "Causal Horizon:" : "因果时序窗口："}</span>
                        <span className="text-white font-medium">{world.diffusionConfig.causalWindow} Frames</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a1a1a6]">{lang === "en" ? "Stream Framerate:" : "流式刷新率："}</span>
                        <span className="text-[#2997ff] font-medium">{world.diffusionConfig.frameRate} FPS (720p)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSelectDimension(world.id)}
                      className="w-full rounded-full bg-white/10 py-2.5 text-[14px] font-medium text-white hover:bg-white/15 transition"
                    >
                      {t.dimensions.loadBtn}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6. 开发者接入与快速开始 */}
        <section id="quickstart" className="bg-[#000000] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-2xl">
              <h2 className="text-[28px] sm:text-[40px] font-semibold text-white tracking-tight">
                {t.quickstart.title}
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed">
                {t.quickstart.desc}
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-[28px] bg-[#161617] p-8 space-y-4 flex flex-col justify-between terra-reveal">
                <div>
                  <div className="text-[18px] font-semibold text-white">
                    {t.quickstart.webTitle}
                  </div>
                  <p className="mt-2 text-[15px] text-[#d2d2d7] leading-relaxed">
                    {t.quickstart.webDesc}
                  </p>
                </div>
                <div>
                  <a href="#interactive-playground" className="text-[#2997ff] text-[15px] font-medium hover:underline flex items-center gap-1 no-underline">
                    <span>{t.quickstart.webBtn}</span>
                  </a>
                </div>
              </div>

              <div className="rounded-[28px] bg-[#161617] p-8 space-y-4 flex flex-col justify-between terra-reveal">
                <div>
                  <div className="text-[18px] font-semibold text-white">
                    {t.quickstart.sdkTitle}
                  </div>
                  <pre className="mt-2 text-[13px] text-white/90 p-4 bg-[#1d1d1f] rounded-[16px] overflow-x-auto leading-relaxed">
                    <code>{`import terra_oasis as oasis

client = oasis.connect("wss://api.terra.ai")
stream = client.stream_world(dim="voxel")
stream.send_action({"key": "W", "pitch": 0.1})`}</code>
                  </pre>
                </div>
                <div>
                  <Link
                    href="/docs?sec=action-protocol"
                    className="text-[#2997ff] text-[15px] font-medium hover:underline flex items-center gap-1 no-underline"
                  >
                    <span>{t.quickstart.sdkBtn}</span>
                  </Link>
                </div>
              </div>

              <div className="rounded-[28px] bg-[#161617] p-8 space-y-4 flex flex-col justify-between terra-reveal">
                <div>
                  <div className="text-[18px] font-semibold text-white">
                    {t.quickstart.deployTitle}
                  </div>
                  <p className="mt-2 text-[15px] text-[#d2d2d7] leading-relaxed">
                    {t.quickstart.deployDesc}
                  </p>
                </div>
                <div>
                  <Link
                    href="/docs?sec=cluster-deploy"
                    className="text-[#2997ff] text-[15px] font-medium hover:underline flex items-center gap-1 no-underline"
                  >
                    <span>{t.quickstart.deployBtn}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 开源仓库与学术引用 */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 rounded-[28px] bg-[#161617] p-8 sm:p-10">
                <h3 className="text-[22px] sm:text-[28px] font-semibold text-white tracking-tight">
                  {t.quickstart.openSourceTitle}
                </h3>
                <p className="mt-3 text-[15px] sm:text-[16px] text-[#d2d2d7] leading-relaxed">
                  {t.quickstart.openSourceDesc}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="https://github.com/wangguode/terra-world-travel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white px-6 py-2.5 text-[15px] font-semibold text-black no-underline hover:bg-white/90 transition"
                  >
                    {t.quickstart.githubBtn}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyBibtex}
                    className="rounded-full bg-white/10 px-6 py-2.5 text-[15px] font-medium text-white hover:bg-white/15 transition"
                  >
                    {copiedBibtex ? t.quickstart.bibtexCopied : t.quickstart.copyBibtexBtn}
                  </button>
                </div>
              </div>

              {/* BibTeX 引用块 */}
              <div className="lg:col-span-6 rounded-[28px] bg-[#161617] p-8">
                <div className="flex items-center justify-between text-[14px] text-[#a1a1a6] pb-3">
                  <span className="font-medium text-white">BibTeX Citation</span>
                  <span className="text-[13px] text-[#a1a1a6]">arXiv:2603.01892</span>
                </div>
                <pre className="mt-2 text-[13px] text-white/90 overflow-x-auto leading-relaxed p-4 bg-[#1d1d1f] rounded-[16px]">
                  <code>{`@article{terra_oasis_2026,
  title={Terra-Oasis: Playable Action-Conditioned
         Neural World Model Application},
  author={Wang, Guo and Terra World Lab Team},
  journal={arXiv preprint arXiv:2603.01892},
  year={2026}
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* 7. 常见问题解答 (FAQ) */}
        <section id="faq" className="bg-[#000000] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-2xl">
              <h2 className="text-[28px] sm:text-[40px] font-semibold text-white tracking-tight">
                {t.faq.title}
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed">
                {t.faq.desc}
              </p>
            </div>

            <div className="mt-12 space-y-4 max-w-4xl">
              {FAQS.map((faq, index) => {
                const isOpen = activeFaqIndex === index;
                return (
                  <div
                    key={faq.q}
                    className="rounded-[24px] bg-[#161617] p-6 sm:p-7 transition terra-reveal"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between text-left gap-4"
                    >
                      <span className="text-[17px] sm:text-[19px] font-semibold text-white tracking-tight">
                        {faq.q}
                      </span>
                      <span className="text-[20px] text-[#2997ff] shrink-0">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="mt-4 text-[15px] sm:text-[16px] text-[#d2d2d7] leading-relaxed pt-3">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 移动端快速扫码体验 */}
            <div className="mt-14 rounded-[32px] bg-[#161617] p-8 sm:p-14">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                  <h3 className="text-[24px] sm:text-[32px] font-semibold text-white tracking-tight">
                    {t.mobile.title}
                  </h3>
                  <p className="mt-4 text-[16px] text-[#d2d2d7] leading-relaxed max-w-xl">
                    {t.mobile.desc}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="rounded-full bg-white px-6 py-2.5 text-[15px] font-semibold text-black hover:bg-white/90 transition"
                    >
                      {copiedLink ? t.mobile.urlCopied : t.mobile.copyUrlBtn}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <div className="rounded-[24px] bg-white p-6 text-center">
                    {qrCodeDataUrl ? (
                      <Image
                        src={qrCodeDataUrl}
                        alt="Mobile QR Code"
                        width={200}
                        height={200}
                        unoptimized
                        className="h-48 w-48 rounded-xl object-contain mx-auto"
                      />
                    ) : (
                      <div className="h-48 w-48 rounded-xl bg-gray-100 flex items-center justify-center text-black/50 text-[14px]">
                        Generating QR Code...
                      </div>
                    )}
                    <div className="mt-3 text-[13px] font-medium text-black">
                      {t.mobile.scanLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. 右下角快捷 AI 唤起悬浮按钮 */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          type="button"
          onClick={() => setCopilotOpen(true)}
          className="rounded-full bg-[#0071e3] p-3.5 sm:px-5 sm:py-3 text-white font-medium flex items-center gap-2 hover:bg-[#0077ed] transition"
          title="Open World Model AI Copilot Drawer"
        >
          <span className="h-2 w-2 rounded-full bg-white" />
          <span className="text-[14px] hidden sm:inline">AI Copilot</span>
        </button>
      </div>

      {/* 9. 全局通用 Apple 页脚 */}
      <AppleFooter />

      {/* 10. AI 侧边小抽屉 (Slide-over Drawer) */}
      <CopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
}
