"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import True3DWorldGame from "@/components/true-3d-world-game";
import { useLanguage } from "@/lib/language-context";
import { AppleHeader } from "@/components/apple-header";
import { AppleFooter } from "@/components/apple-footer";
import { CopilotDrawer } from "@/components/copilot-drawer";
import { WorldModelKnowledgeGraph } from "@/components/world-model-knowledge-graph";
import { PaperReaderDrawer } from "@/components/paper-reader-drawer";
import { WORLD_MODEL_PAPERS_100, WorldModelPaper } from "@/lib/world-model-papers-100";

export default function HomePage() {
  const router = useRouter();
  const { lang } = useLanguage();

  // AI 助手抽屉状态
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState("");

  // 图谱当前选中的论文
  const [selectedPaper, setSelectedPaper] = useState<WorldModelPaper>(WORLD_MODEL_PAPERS_100[0]);
  const [readingPaper, setReadingPaper] = useState<WorldModelPaper | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);

  const handleSelectPaperFromGraph = (paper: WorldModelPaper) => {
    setSelectedPaper(paper);
    setReadingPaper(paper);
    const el = document.getElementById("selected-paper-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
    <div className="min-h-[100dvh] bg-[#030712] text-[#1d1d1f] overflow-x-hidden selection:bg-sky-500 selection:text-white">
      {/* 1. 深空通透悬浮顶栏（零割裂，与 100dvh 地球视口一体成型） */}
      <AppleHeader
        variant="overlay"
        onOpenCopilot={() => {
          setCopilotQuery("");
          setCopilotOpen(true);
        }}
      />

      <main className="w-full">
        {/* 2. 首屏 100dvh 影院级真实 3D 太空地球与低空航拍引擎 */}
        <section id="hero-3d-world" className="relative w-full bg-[#030712]">
          <True3DWorldGame
            onToggleSpecs={() => {
              const el = document.getElementById("knowledge-graph");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </section>

        {/* 3. 深空过渡区：实事求是的 3 大硬核工程架构支柱 */}
        <section id="ecosystem-pillars" className="relative bg-[#050a14] text-white border-t border-white/8 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 space-y-14">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-emerald-300 uppercase">
                <span>OPEN SPATIAL INTELLIGENCE LAB</span>
              </div>
              <h2 className="text-[30px] sm:text-[46px] font-semibold tracking-tight leading-[1.1] text-white">
                {lang === "en"
                  ? "Real Earth Photogrammetry Meets World Models Research."
                  : "真实地球 3D 渲染，与世界模型前沿学术研究台。"}
              </h2>
              <p className="text-[16px] sm:text-[18px] text-white/65 leading-relaxed">
                {lang === "en"
                  ? "No synthetic toy scenes, no billing walls. Stream real global satellite imagery, 3D elevation terrain, and city skylines directly in WebGL alongside 100+ curated World Model papers."
                  : "告别低模 Demo 与封闭付费墙。在浏览器中直连全球真实卫星影像、3D 数字高程与城市天际线，并配套 100+ 篇世界模型核心论文交互式知识图谱。"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-8 space-y-4 hover:border-white/20 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-mono uppercase tracking-wider text-sky-300">
                    01 / 3D GLOBE &amp; DEM
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <h3 className="text-[20px] font-semibold text-white">
                  {lang === "en" ? "True Orbital-to-Street Flight" : "太空轨道到低空航拍无缝俯冲"}
                </h3>
                <p className="text-[14px] sm:text-[15px] text-white/60 leading-relaxed">
                  {lang === "en"
                    ? "Powered by MapLibre GL v5 Globe projection, Esri World Imagery, AWS Terrarium 3D elevation, and OpenFreeMap 3D buildings at 60 FPS."
                    : "基于 MapLibre GL 球体投影、Esri 卫星影像、AWS Terrarium 3D 高程与 OpenFreeMap 3D 建筑，60 FPS 平滑切换全球真实地貌。"}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-8 space-y-4 hover:border-white/20 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-mono uppercase tracking-wider text-amber-300">
                    02 / ZERO-KEY EDGE
                  </span>
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                </div>
                <h3 className="text-[20px] font-semibold text-white">
                  {lang === "en" ? "Zero API Key, Static Edge Deploy" : "零 API Key · 纯静态边缘秒开"}
                </h3>
                <p className="text-[14px] sm:text-[15px] text-white/60 leading-relaxed">
                  {lang === "en"
                    ? "No Google Cloud billing or backend proxy required. Built with Next.js static export and isolated WebGL workers for instant global loading."
                    : "无需绑定信用卡或后端代理，采用 Next.js 纯静态导出与独立静态 Worker，适配 Cloudflare 全球边缘节点开箱即用。"}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-8 space-y-4 hover:border-white/20 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-mono uppercase tracking-wider text-rose-300">
                    03 / 100+ PAPERS GRAPH
                  </span>
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                </div>
                <h3 className="text-[20px] font-semibold text-white">
                  {lang === "en" ? "World Models Citation Universe" : "100+ 篇世界模型学术知识图谱"}
                </h3>
                <p className="text-[14px] sm:text-[15px] text-white/60 leading-relaxed">
                  {lang === "en"
                    ? "Interactive force-directed graph indexing milestone papers from DeepMind, OpenAI, NVIDIA, World Labs, and Wayve with instant reading."
                    : "系统梳理 2024–2026 年 DeepMind、OpenAI、NVIDIA、World Labs 等前沿文献引用脉络，支持图谱拖拽与一键 AI 精读。"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 极简白昼编辑区：100+ 篇世界模型交互式学术知识图谱 */}
        <section id="knowledge-graph" className="bg-white py-20 sm:py-28 w-full box-border">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[12px] font-semibold text-[#0071e3]">
                  <span>100+ Papers Indexed</span>
                  <span>·</span>
                  <span>2024–2026</span>
                </div>
                <h2 className="text-[30px] sm:text-[44px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.1]">
                  {lang === "en"
                    ? "Explore the World Models Knowledge Graph"
                    : "世界模型前沿学术星空与文献图谱"}
                </h2>
                <p className="text-[15px] sm:text-[17px] text-[#515154] leading-relaxed">
                  {lang === "en"
                    ? "Drag nodes, zoom the citation network, click any milestone paper to inspect details, or jump directly to the full research reader."
                    : "自由拖拽节点与缩放画布，点击任意文献即可查看核心贡献，或直接进入学术专刊视图与 AI Copilot 深度研读。"}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/research"
                  className="rounded-full bg-[#1d1d1f] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[#333336] transition no-underline"
                >
                  {lang === "en" ? "All Research Papers →" : "进入学术专刊 →"}
                </Link>
                <Link
                  href="/docs"
                  className="rounded-full bg-[#f5f5f7] px-5 py-2.5 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition no-underline"
                >
                  {lang === "en" ? "Developer Docs" : "开发者文档"}
                </Link>
              </div>
            </div>

            <WorldModelKnowledgeGraph
              onSelectPaper={handleSelectPaperFromGraph}
              selectedPaperId={selectedPaper.id}
            />

            {/* 选中文献精炼卡片 */}
            <div id="selected-paper-card" className="pt-2">
              <div className="rounded-[28px] border border-black/5 bg-[#f5f5f7] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-[12px]">
                    <span className="rounded-full bg-white px-3 py-0.5 font-semibold text-[#0071e3]">
                      {lang === "en" ? selectedPaper.categoryNameEn : selectedPaper.categoryNameZh}
                    </span>
                    <span className="text-[#86868b]">
                      {selectedPaper.venue} · {selectedPaper.year}
                    </span>
                    <span className="text-[#86868b]">·</span>
                    <span className="text-[#1d1d1f] font-medium">{selectedPaper.org}</span>
                  </div>

                  <h3 className="text-[20px] sm:text-[24px] font-semibold text-[#1d1d1f] tracking-tight leading-snug">
                    {lang === "en" ? selectedPaper.title : selectedPaper.titleZh}
                  </h3>

                  <p className="text-[14px] text-[#515154] leading-relaxed line-clamp-2">
                    {selectedPaper.highlight}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => router.push(`/research?paper=${selectedPaper.id}`)}
                    className="rounded-full bg-[#0071e3] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[#0077ed] transition cursor-pointer"
                  >
                    {lang === "en" ? "Read Full Article →" : "研读学术长文 →"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAskAiAboutPaper(selectedPaper.title)}
                    className="rounded-full bg-white px-4 py-2.5 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition cursor-pointer"
                  >
                    {lang === "en" ? "Ask AI Copilot" : "咨询 AI"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="bg-white">
        <AppleFooter />
      </div>

      <CopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        initialQuery={copilotQuery}
      />

      <PaperReaderDrawer
        paper={readingPaper}
        isOpen={readerOpen}
        onClose={() => setReaderOpen(false)}
        onAskAi={handleAskAiAboutPaper}
      />
    </div>
  );
}
