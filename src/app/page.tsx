"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WorldModelSimulator from "@/components/beijing-pulse-world-model";
import { useLanguage } from "@/lib/language-context";
import { AppleHeader } from "@/components/apple-header";
import { AppleFooter } from "@/components/apple-footer";
import { CopilotDrawer } from "@/components/copilot-drawer";
import { AppleStoryGallery } from "@/components/apple-story-gallery";
import { WorldModelKnowledgeGraph } from "@/components/world-model-knowledge-graph";
import { PaperReaderDrawer } from "@/components/paper-reader-drawer";
import { ECOSYSTEM_STORIES } from "@/lib/apple-job-creation-data";
import { WORLD_MODEL_PAPERS_100, WorldModelPaper } from "@/lib/world-model-papers-100";

export default function HomePage() {
  const router = useRouter();
  const { lang } = useLanguage();

  // 3D 模拟器状态
  const [activeWorldId, setActiveWorldId] = useState<string>("voxel-oasis");
  const [activeHour, setActiveHour] = useState<number>(17.5);
  const [snowMode, setSnowMode] = useState<boolean>(false);

  // AI 助手抽屉与知识库联动状态
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [copilotQuery, setCopilotQuery] = useState<string>("");

  // 图谱当前选中的论文 (默认展示首篇 Oasis 核心世界模型，并在下方直接 Markdown 阅读)
  const [selectedPaper, setSelectedPaper] = useState<WorldModelPaper>(WORLD_MODEL_PAPERS_100[0]);

  // 论文深度阅读抽屉状态 (可选)
  const [readingPaper, setReadingPaper] = useState<WorldModelPaper | null>(null);
  const [readerOpen, setReaderOpen] = useState<boolean>(false);

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

  const handleSelectPaperFromGraph = (paper: WorldModelPaper) => {
    setSelectedPaper(paper);
    setReadingPaper(paper);
    const el = document.getElementById("paper-markdown-reader");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAskAiAboutPaper = (paperTitle: string) => {
    setReaderOpen(false);
    setCopilotQuery(
      lang === "en"
        ? `Explain the core architecture, mathematical breakthrough, and impact of "${paperTitle}"`
        : `深度解析论文《${paperTitle}》的核心架构机制、数学突破与技术价值`
    );
    setCopilotOpen(true);
  };

  return (
    <div className="min-h-[100dvh] bg-white text-[#1d1d1f] overflow-x-hidden selection:bg-[#0071e3] selection:text-white">
      {/* 1. 单层规范 Apple 旗舰全局导航 (白昼磨砂玻璃，带知识图谱一级链接) */}
      <AppleHeader
        onOpenCopilot={() => {
          setCopilotQuery("");
          setCopilotOpen(true);
        }}
        snowMode={snowMode}
        onToggleSnow={() => setSnowMode(!snowMode)}
      />

      <main className="w-full">
        {/* =========================================================================
            2. Hero Section (Apple 官方风格巨幅 Hero，白色纯净背景)
           ========================================================================= */}
        <section className="relative bg-white pt-16 sm:pt-24 pb-16 sm:pb-24 terra-reveal w-full box-border">
          <div className="mx-auto max-w-5xl px-6 sm:px-8 text-center space-y-6">
            <h1 className="text-[30px] sm:text-[60px] lg:text-[76px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.08] max-w-4xl mx-auto">
              {lang === "en"
                ? "14B Parameters. Limitless Potential."
                : "140 亿参数神经因果模型，更多可能的起点。"}
            </h1>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-1.5 text-[14px] font-medium text-[#1d1d1f]">
              <span className="h-2 w-2 rounded-full bg-[#0071e3]" />
              <span>TERRA-OASIS Spatial Ecosystem</span>
            </div>

            <p className="text-[17px] sm:text-[20px] text-[#515154] max-w-3xl mx-auto leading-relaxed font-normal">
              {lang === "en"
                ? "Across robotics, spatial computing, and interactive virtual worlds, TERRA contributes fundamentally to the next era of embodied physical intelligence. By uniting 3D Gaussian radiance fields with causal autoregressive diffusion, we provide researchers and creators with a real-time world foundation."
                : "在具身机器人、空间计算与交互式虚拟时空中，TERRA 从底层推动空间智能的产业落地。通过将 3D 高斯点云辐射场与自回归因果扩散 Transformer 深度融合，我们为全球开发者与科研同行提供即时运行的世界模型底座。"}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[15px]">
              <a
                href="#interactive-playground"
                className="rounded-full bg-[#0071e3] px-7 py-3 text-white font-medium hover:bg-[#0077ed] transition no-underline"
              >
                {lang === "en" ? "Explore Live Simulation" : "在线体验世界模型"}
              </a>
              <a
                href="#knowledge-graph"
                className="rounded-full bg-[#f5f5f7] px-7 py-3 text-[#1d1d1f] font-medium hover:bg-[#e8e8ed] transition no-underline"
              >
                {lang === "en" ? "Interactive Knowledge Graph" : "交互式知识图谱"}
              </a>
              <Link
                href="/docs"
                className="text-[#0071e3] hover:underline flex items-center gap-1 font-medium transition no-underline"
              >
                <span>{lang === "en" ? "Developer Documentation" : "查阅开发者文档"}</span>
                <span>&gt;</span>
              </Link>
            </div>
          </div>

          {/* Hero 底部实机画面展示及专业注脚 */}
          <div className="mt-14 mx-auto max-w-6xl px-6 sm:px-8">
            <div className="relative aspect-[16/9] w-full min-h-[360px] sm:min-h-[460px] overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#f5f5f7]">
              <Image
                src="/images/beijing-pulse/hero-beijing.jpg"
                alt="Embodied Robotics Field Laboratory"
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 80vw"
                className="object-cover"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between text-[14px] text-[#515154] px-2">
              <p className="font-medium text-[#1d1d1f]">
                4D Spatiotemporal Neural Simulation Field
              </p>
              <p className="text-[#515154]">
                Continuous Action-Conditioned Causal Inference Engine
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. Big Impact Numbers (Apple 风格浅灰大数字核心指标区)
           ========================================================================= */}
        <section className="bg-[#f5f5f7] py-20 sm:py-28 terra-reveal w-full box-border">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 space-y-16">
            <div className="text-center space-y-3">
              <h2 className="text-[56px] sm:text-[84px] lg:text-[104px] font-semibold text-[#1d1d1f] tracking-tight leading-none tnum">
                {lang === "en" ? "14 Billion" : "140 亿"}
              </h2>
              <p className="text-[19px] sm:text-[23px] text-[#515154] font-medium max-w-xl mx-auto">
                {lang === "en"
                  ? "Causal latent parameters powering physical spatial intelligence"
                  : "驱动物理空间因果智能的神经潜空间参数规模"}
              </p>
            </div>

            {/* 3 个大型指标徽章 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-[28px] bg-white p-8 sm:p-10 space-y-4">
                <div className="text-[40px] sm:text-[48px] font-semibold text-[#0071e3] tracking-tight tnum">
                  60 FPS
                </div>
                <div className="text-[18px] font-semibold text-[#1d1d1f]">
                  {lang === "en" ? "Continuous Neural Streaming" : "全双工连续神经推流"}
                </div>
                <p className="text-[15px] sm:text-[16px] text-[#515154] leading-relaxed">
                  {lang === "en"
                    ? "Eliminating latent structural collapse through temporal sliding attention windows and dual-agent anchors."
                    : "通过时序滑动注意力窗口与双智能体记忆锚点，彻底突破自回归视频模型长程坍塌魔咒。"}
                </p>
              </div>

              <div className="rounded-[28px] bg-white p-8 sm:p-10 space-y-4">
                <div className="text-[40px] sm:text-[48px] font-semibold text-[#1d1d1f] tracking-tight tnum">
                  &lt; 16 ms
                </div>
                <div className="text-[18px] font-semibold text-[#1d1d1f]">
                  {lang === "en" ? "Action-to-Photon Latency" : "动作到光子极速响应"}
                </div>
                <p className="text-[15px] sm:text-[16px] text-[#515154] leading-relaxed">
                  {lang === "en"
                    ? "WebGPU client-side shader decoding delivers instant WASD control response without local high-end hardware."
                    : "轻量化 WebGPU 边缘端着色器解码，赋予用户在普通浏览器中即开即玩的超低延迟响应。"}
                </p>
              </div>

              <div className="rounded-[28px] bg-white p-8 sm:p-10 space-y-4">
                <div className="text-[40px] sm:text-[48px] font-semibold text-[#0071e3] tracking-tight tnum">
                  94.2%
                </div>
                <div className="text-[18px] font-semibold text-[#1d1d1f]">
                  {lang === "en" ? "Zero-Shot Sim-to-Real" : "真机无微调迁移成功率"}
                </div>
                <p className="text-[15px] sm:text-[16px] text-[#515154] leading-relaxed">
                  {lang === "en"
                    ? "Conditioned directly on continuous robotic actuator commands, closing the visual and physical simulation gap."
                    : "直接基于机器人连续执行器动作向量推演动态环境，消除传统合成渲染与现实的虚实鸿沟。"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. Interactive World Model Knowledge Graph (核心新增：100+ 篇文献可交互知识图谱)
           ========================================================================= */}
        <section id="knowledge-graph" className="bg-white py-20 sm:py-28 terra-reveal w-full box-border">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 space-y-10">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[13px] font-medium text-[#0071e3]">
                <span>100+ Papers Indexed</span>
                <span>·</span>
                <span>Interactive Force-Directed Graph</span>
              </div>
              <h2 className="text-[32px] sm:text-[44px] lg:text-[52px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.08]">
                {lang === "en"
                  ? "Explore the World Model Universe"
                  : "探索世界模型前沿学术星空与知识图谱。"}
              </h2>
              <p className="text-[16px] sm:text-[18px] text-[#515154] leading-relaxed">
                {lang === "en"
                  ? "Explore the interconnected citation and concept universe of 100+ milestone world model papers (2024–2026). Drag nodes, zoom in, click any node to read the full paper, or ask Copilot AI for technical breakdowns."
                  : "探索 2024 至 2026 年间由 Google DeepMind、OpenAI、NVIDIA、Wayve 及顶尖名校构建的世界模型学术演进图谱。自由拖拽节点、缩放画布，点击任意节点直接阅读论文全文，并可一键呼起 AI 智能问答。"}
              </p>
            </div>

            {/* 知识图谱画布视窗 */}
            <WorldModelKnowledgeGraph
              onSelectPaper={handleSelectPaperFromGraph}
              selectedPaperId={selectedPaper.id}
            />

            {/* 选中文献精炼卡片 (Apple 官方发布风格，点击一键跳转至专属学术长文页面) */}
            <div className="pt-6">
              <div className="rounded-[28px] bg-[#f5f5f7] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition">
                <div className="space-y-3 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-[12px]">
                    <span className="rounded-full bg-white px-3 py-0.5 font-semibold text-[#0071e3]">
                      {lang === "en" ? selectedPaper.categoryNameEn : selectedPaper.categoryNameZh}
                    </span>
                    <span className="text-[#86868b]">{selectedPaper.venue} · {selectedPaper.year}</span>
                    <span className="text-[#86868b]">·</span>
                    <span className="text-[#515154] font-medium">{selectedPaper.org}</span>
                  </div>

                  <h3 className="text-[20px] sm:text-[24px] font-semibold text-[#1d1d1f] tracking-tight leading-snug">
                    {lang === "en" ? selectedPaper.title : selectedPaper.titleZh}
                  </h3>

                  <p className="text-[14px] text-[#515154] leading-relaxed line-clamp-2 font-normal">
                    {selectedPaper.highlight}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => router.push(`/research?paper=${selectedPaper.id}`)}
                    className="rounded-full bg-[#0071e3] px-5 py-2 text-[13px] font-medium text-white hover:bg-[#0077ed] transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{lang === "en" ? "Read Publication Article" : "研读学术长文"}</span>
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAskAiAboutPaper(selectedPaper.title)}
                    className="rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition cursor-pointer"
                  >
                    {lang === "en" ? "Ask AI" : "咨询 AI"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. Ecosystem Stories (生态落地故事轮播画廊)
           ========================================================================= */}
        <section id="ecosystem-pillars" className="bg-[#f5f5f7] py-20 sm:py-28 terra-reveal w-full box-border">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 space-y-12">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-[32px] sm:text-[44px] lg:text-[50px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.08]">
                {lang === "en"
                  ? "Expanding the World Model Ecosystem"
                  : "放大世界模型生态，托起千千万万个数字时空。"}
              </h2>
              <div className="text-[44px] sm:text-[56px] font-semibold text-[#0071e3] tracking-tight tnum">
                {lang === "en" ? "2.5M+ Global Explorers" : "250 多万"}
              </div>
              <p className="text-[17px] sm:text-[19px] text-[#515154] leading-relaxed font-normal">
                {lang === "en"
                  ? "From historical architectural preservation to quadruped robot field inspections, researchers and indie studios build upon TERRA's open foundation."
                  : "从千年古建筑数字化保护，到工业巡检四足机器人实战演练，全球研究机构与独立团队正基于 TERRA 开源生态开辟前所未有的时空应用。"}
              </p>
            </div>

            {/* Apple 经典可交互 DotNav + PaddleNav 故事画廊 */}
            <AppleStoryGallery stories={ECOSYSTEM_STORIES} />
          </div>
        </section>

        {/* =========================================================================
            6. Interactive 3D Simulator (感受我们的世界模型：剧场级实机沙盒)
           ========================================================================= */}
        <section id="interactive-playground" className="bg-white py-20 sm:py-28 terra-reveal w-full box-border">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 space-y-10">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-[32px] sm:text-[44px] lg:text-[52px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.08]">
                {lang === "en"
                  ? "Intuitive Physics Playground"
                  : "亲历自发涌现的直觉物理世界模型。"}
              </h2>

              <div className="flex items-center gap-2 text-[14px] text-[#0062c4] font-medium">
                <span>Three.js Engine</span>
                <span>·</span>
                <span className="text-[#333336]">WebGL 2.0 Shaders</span>
                <span>·</span>
                <span className="text-[#333336]">60 FPS Action Feed</span>
              </div>

              <p className="text-[16px] sm:text-[18px] text-[#515154] leading-relaxed">
                {lang === "en"
                  ? "Take control using WASD keys for dynamic camera motion, press E to trigger procedural neural latent shockwaves, and slide the celestial controller to evolve daylight."
                  : "键盘 WASD 键平滑走行动力学，E 键触发局部潜空间形变冲击波，滑动时间轴实时感受北京古建与现代园区的天光云影演变。"}
              </p>
            </div>

            {/* 实机运行的 3D 模拟器外壳 */}
            <div className="rounded-[32px] bg-[#121214] p-4 sm:p-6 w-full box-border text-white">
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
            7. Real-World Deployments (真实物理世界工业实践)
           ========================================================================= */}
        <section className="bg-[#f5f5f7] py-20 sm:py-28 terra-reveal w-full box-border">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 space-y-12">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-[32px] sm:text-[44px] lg:text-[50px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.08]">
                {lang === "en"
                  ? "Bridging Simulation to the Physical World"
                  : "从前沿理论，到物理世界的真实落地。"}
              </h2>
              <p className="text-[17px] sm:text-[19px] text-[#515154] leading-relaxed font-normal">
                {lang === "en"
                  ? "From quadruped robot field navigation to autonomous driving closed-loop simulation and cultural heritage preservation, explore real-world deployments driven by the neural world model."
                  : "从四足机器人野外复杂地形巡检，到自动驾驶高保真闭环仿真与千年古建数字孪生，见证自回归因果世界模型在实体工业场景中的核心落地能力。"}
              </p>
            </div>

            {/* 4 大工业级落地场景卡片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-[28px] bg-white p-8 space-y-5">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px]">
                  <Image
                    src="/images/beijing-pulse/hero-beijing.jpg"
                    alt="Embodied Robotics Deployment"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-[13px] font-semibold text-[#0071e3]">
                    {lang === "en" ? "Embodied Locomotion" : "具身智能四足机器人"}
                  </div>
                  <h3 className="text-[22px] font-semibold text-[#1d1d1f]">
                    {lang === "en" ? "Zero-Shot Hardware Transfer" : "真实物理硬件零微调迁移"}
                  </h3>
                  <p className="text-[15px] text-[#515154] leading-relaxed">
                    {lang === "en"
                      ? "Conditioned directly on continuous motor torques and foot contact sensors, achieving 94.2% policy transfer success on quadruped robots without real-world damage penalties."
                      : "直接基于四足机器人电机连续扭矩与足端触地压力传感器推演，实现 94.2% 的策略无微调迁移成功率，免受真实物理试错损耗。"}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-8 space-y-5">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px]">
                  <Image
                    src="/images/beijing-pulse/futuristic.jpg"
                    alt="Autonomous Driving Closed-Loop Simulation"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-[13px] font-semibold text-[#0071e3]">
                    {lang === "en" ? "Autonomous Mobility" : "自动驾驶反事实仿真"}
                  </div>
                  <h3 className="text-[22px] font-semibold text-[#1d1d1f]">
                    {lang === "en" ? "Counterfactual Road Exploration" : "极限工况与反事实决策推演"}
                  </h3>
                  <p className="text-[15px] text-[#515154] leading-relaxed">
                    {lang === "en"
                      ? "Generates dynamic traffic branches based on steering and brake actions, enabling safe closed-loop stress testing for corner cases."
                      : "依据转向与制动控制向量生成连续动态交通分支，为自动驾驶系统提供零事故风险的极端 corner-case 闭环压力测试环境。"}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-8 space-y-5">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px]">
                  <Image
                    src="/images/beijing-pulse/forbidden-city.jpg"
                    alt="Cultural Heritage Digital Preservation"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-[13px] font-semibold text-[#0071e3]">
                    {lang === "en" ? "Spatial Digital Twins" : "空间高精度数字孪生"}
                  </div>
                  <h3 className="text-[22px] font-semibold text-[#1d1d1f]">
                    {lang === "en" ? "Sub-Millimeter 3DGS Heritage" : "古建毫米级 3DGS 保护与漫游"}
                  </h3>
                  <p className="text-[15px] text-[#515154] leading-relaxed">
                    {lang === "en"
                      ? "Unites millions of spatial radiance points with sun-path solar calculation, preserving architectural geometry for digital research."
                      : "将数百万空间辐射点云与太阳高度角天光物理模型融合，高保真数字化复刻古建筑历史形态，赋能高精细度空间感知。"}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-8 space-y-5">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px]">
                  <Image
                    src="/images/beijing-pulse/temple-of-heaven.jpg"
                    alt="Interactive Spatial Computing"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-[13px] font-semibold text-[#0071e3]">
                    {lang === "en" ? "Edge Spatial Computing" : "边缘端空间计算"}
                  </div>
                  <h3 className="text-[22px] font-semibold text-[#1d1d1f]">
                    {lang === "en" ? "Zero-Install WebGPU Streaming" : "全浏览器 WebGPU 零安装即玩"}
                  </h3>
                  <p className="text-[15px] text-[#515154] leading-relaxed">
                    {lang === "en"
                      ? "Ultra-lightweight WGSL decoders bring full 60 FPS interactive neural world rendering to mobile and desktop browsers instantly."
                      : "通过超轻量化 WGSL 着色器解码，在普通移动端与桌面浏览器上即开即用，实现 60 FPS 无感延迟动作漫游。"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. Router & Action Call (Apple 经典的纯白行动跳转路由)
           ========================================================================= */}
        <section className="bg-white py-20 sm:py-24 text-center terra-reveal w-full box-border">
          <div className="mx-auto max-w-4xl px-6 sm:px-8 space-y-6">
            <h2 className="text-[32px] sm:text-[44px] font-semibold text-[#1d1d1f] tracking-tight">
              {lang === "en" ? "Ready to build inside the world model?" : "准备好在世界模型中开始构建了吗？"}
            </h2>
            <p className="text-[17px] sm:text-[19px] text-[#515154] max-w-2xl mx-auto leading-relaxed">
              {lang === "en"
                ? "Dive into our comprehensive developer API specifications, roam the 100+ paper knowledge graph, or consult Copilot AI."
                : "查阅详尽的开发者 API 接口规范与代码范例，漫游 100+ 篇世界模型前沿文献星空，或与 AI 助手实时推演。"}
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-[15px]">
              <Link
                href="/docs"
                className="rounded-full bg-[#0071e3] px-7 py-3 text-white font-medium hover:bg-[#0077ed] transition no-underline"
              >
                {lang === "en" ? "Developer Documentation" : "开发文档中心"}
              </Link>
              <Link
                href="/research"
                className="rounded-full bg-[#f5f5f7] px-7 py-3 text-[#1d1d1f] font-medium hover:bg-[#e8e8ed] transition no-underline"
              >
                {lang === "en" ? "100+ Papers Library" : "100+ 篇文献专栏"}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setCopilotQuery("");
                  setCopilotOpen(true);
                }}
                className="text-[#0071e3] hover:underline flex items-center gap-1 font-medium transition cursor-pointer"
              >
                <span>{lang === "en" ? "Ask AI Assistant" : "咨询 AI 智能助手"}</span>
                <span>&gt;</span>
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. Footnotes (Apple 官方注脚风格)
           ========================================================================= */}
        <section className="bg-[#f5f5f7] py-12 px-6 sm:px-8 text-[13px] sm:text-[14px] text-[#515154] leading-relaxed w-full box-border">
          <div className="mx-auto max-w-6xl space-y-2">
            <p>1. 知识图谱收录 2024 至 2026 年间由全球顶尖机构发表在 CVPR、NeurIPS、ICLR 等顶级会议的 100+ 篇世界模型同行评议文献。</p>
            <p>2. 60 FPS 连续流式神经推流需现代支持 WebGPU 或 WebGL 2.0 硬件加速环境之浏览器支持。</p>
            <p>3. 具身智能 Sim-to-Real 迁移基准数据基于 Unitree Go2 四足机器人与 Fourier GR-1 人形机器人 100+ 次实测统计。</p>
            <p>4. 演示沙盘中全部三维时空画面均由动作因果自回归模型实时预测生成。</p>
          </div>
        </section>
      </main>

      {/* 10. 全局单层页脚 */}
      <AppleFooter />

      {/* 11. 论文沉浸式深度阅读器抽屉 */}
      <PaperReaderDrawer
        paper={readingPaper}
        isOpen={readerOpen}
        onClose={() => setReaderOpen(false)}
        onAskAi={handleAskAiAboutPaper}
        onOpenBlog={(blog) => {
          setReaderOpen(false);
          router.push(`/research?blog=${blog.id}`);
        }}
      />

      {/* 12. AI 知识库智能问答抽屉 */}
      <CopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        initialQuery={copilotQuery}
      />
    </div>
  );
}
