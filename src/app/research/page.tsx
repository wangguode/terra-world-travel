"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import {
  WORLD_MODEL_PAPERS_100,
  WORLD_MODEL_CATEGORIES,
  WorldModelPaper,
} from "@/lib/world-model-papers-100";
import { AppleHeader } from "@/components/apple-header";
import { AppleFooter } from "@/components/apple-footer";
import { CopilotDrawer } from "@/components/copilot-drawer";
import { WorldModelKnowledgeGraph } from "@/components/world-model-knowledge-graph";
import { PaperReaderDrawer } from "@/components/paper-reader-drawer";

export default function ResearchPage() {
  const { lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"graph" | "cards">("graph");

  // 论文深度阅读器状态
  const [readingPaper, setReadingPaper] = useState<WorldModelPaper | null>(null);
  const [readerOpen, setReaderOpen] = useState<boolean>(false);

  // AI 助手抽屉联动状态
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState("");

  const [copiedBibtexId, setCopiedBibtexId] = useState<string | null>(null);

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
  }, [selectedCategory, searchQuery, lang]);

  const filteredPapers = WORLD_MODEL_PAPERS_100.filter((paper) => {
    const matchCategory = selectedCategory === "all" || paper.category === selectedCategory;
    if (!matchCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      paper.title.toLowerCase().includes(q) ||
      paper.titleZh.toLowerCase().includes(q) ||
      paper.org.toLowerCase().includes(q) ||
      paper.venue.toLowerCase().includes(q) ||
      paper.arxiv.toLowerCase().includes(q) ||
      paper.abstract.toLowerCase().includes(q) ||
      paper.abstractZh.toLowerCase().includes(q)
    );
  });

  const featuredPaper = WORLD_MODEL_PAPERS_100[0];

  const handleCopyBibtex = async (paperId: string, bibtex: string) => {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopiedBibtexId(paperId);
      setTimeout(() => setCopiedBibtexId(null), 2000);
    } catch {
      setCopiedBibtexId(paperId);
      setTimeout(() => setCopiedBibtexId(null), 2000);
    }
  };

  const handleOpenPaper = (paper: WorldModelPaper) => {
    setReadingPaper(paper);
    setReaderOpen(true);
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
    <div className="min-h-[100dvh] bg-white text-[#1d1d1f] flex flex-col justify-between overflow-x-hidden selection:bg-[#0071e3] selection:text-white">
      {/* 1. 统一 Apple 白昼磨砂玻璃导航 */}
      <AppleHeader
        onOpenCopilot={() => {
          setCopilotQuery("");
          setCopilotOpen(true);
        }}
      />

      {/* 2. Apple 极简纯净副导航 */}
      <div className="bg-[#f5f5f7] px-6 sm:px-8 py-3.5 text-[14px] text-[#515154] w-full">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#0071e3] transition no-underline text-[#515154]">
              TERRA-OASIS
            </Link>
            <span className="text-[#86868b]">/</span>
            <span className="text-[#1d1d1f] font-semibold">
              {lang === "en" ? "100+ World Model Papers" : "100+ 篇世界模型文献与知识图谱"}
            </span>
          </nav>

          {/* 视图切换：知识图谱 vs 列表卡片 */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-full bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode("graph")}
                className={`rounded-full px-3.5 py-1 text-[12px] font-medium transition cursor-pointer ${
                  viewMode === "graph"
                    ? "bg-[#0071e3] text-white"
                    : "text-[#515154] hover:text-[#1d1d1f]"
                }`}
              >
                {lang === "en" ? "Graph View" : "知识图谱视图"}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`rounded-full px-3.5 py-1 text-[12px] font-medium transition cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-[#0071e3] text-white"
                    : "text-[#515154] hover:text-[#1d1d1f]"
                }`}
              >
                {lang === "en" ? "Paper List (100)" : "文献列表 (100)"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setCopilotQuery("");
                setCopilotOpen(true);
              }}
              className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#0071e3] hover:bg-[#e8e8ed] transition cursor-pointer"
            >
              {lang === "en" ? "Ask Copilot AI" : "AI 智能问答"}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 py-10 sm:py-16 w-full">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 space-y-16 w-full box-border">
          {/* 3. 核心知识图谱探索视窗 (用户可直接在科研专栏把玩星空图谱并点击阅读) */}
          {viewMode === "graph" && (
            <section className="space-y-6 terra-reveal">
              <div className="max-w-3xl space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[13px] font-medium text-[#0071e3]">
                  <span>Connected Knowledge Graph</span>
                  <span>·</span>
                  <span>Click to Read Paper</span>
                </div>
                <h1 className="text-[32px] sm:text-[44px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.12]">
                  {lang === "en"
                    ? "Interactive Knowledge Graph of 100+ Papers"
                    : "100+ 篇世界模型前沿学术星空图谱"}
                </h1>
                <p className="text-[16px] text-[#515154]">
                  {lang === "en"
                    ? "Drag nodes, explore citation clusters, and click any paper node to slide open the full reading drawer."
                    : "自由拖拽节点，探索全球顶尖学术脉络与因果演进网络。点击任意论文节点直接滑出沉浸式深度阅读面板。"}
                </p>
              </div>

              {/* 嵌入式交互图谱 */}
              <WorldModelKnowledgeGraph onSelectPaper={handleOpenPaper} />
            </section>
          )}

          {/* 4. 精选封面论文展台 (Apple 风格大画幅浅灰展台) */}
          <section className="rounded-[32px] bg-[#f5f5f7] p-8 sm:p-12 terra-reveal w-full box-border">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-[13px] font-medium text-[#0071e3]">
                  <span>Featured Publication</span>
                  <span>·</span>
                  <span>{featuredPaper.venue}</span>
                </div>

                <h2 className="text-[28px] sm:text-[38px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.12]">
                  {lang === "en" ? featuredPaper.title : featuredPaper.titleZh}
                </h2>

                <p className="text-[15px] sm:text-[17px] text-[#515154] leading-relaxed">
                  {lang === "en" ? featuredPaper.abstract : featuredPaper.abstractZh}
                </p>

                <div className="text-[13px] text-[#86868b]">
                  <span className="font-medium text-[#1d1d1f]">Organizations: </span>
                  {featuredPaper.org}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3 text-[14px]">
                  <button
                    type="button"
                    onClick={() => handleOpenPaper(featuredPaper)}
                    className="rounded-full bg-[#0071e3] px-5 py-2 text-white font-medium hover:bg-[#0077ed] transition cursor-pointer"
                  >
                    {lang === "en" ? "Read Full Paper" : "阅读论文全文"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyBibtex(featuredPaper.id, featuredPaper.bibtex)}
                    className="rounded-full bg-white px-5 py-2 text-[#1d1d1f] font-medium hover:bg-[#e8e8ed] transition cursor-pointer"
                  >
                    {copiedBibtexId === featuredPaper.id
                      ? (lang === "en" ? "BibTeX Copied!" : "已复制 BibTeX!")
                      : (lang === "en" ? "Copy BibTeX" : "复制 BibTeX")}
                  </button>

                  <a
                    href="https://arxiv.org"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white px-5 py-2 text-[#1d1d1f] font-medium hover:bg-[#e8e8ed] transition no-underline"
                  >
                    <span>{featuredPaper.arxiv}</span>
                    <span className="ml-1 text-[#0071e3]">↗</span>
                  </a>
                </div>
              </div>

              {/* 封面学术大图 */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-white">
                  <Image
                    src="/images/beijing-pulse/hero-beijing.jpg"
                    alt={featuredPaper.titleZh}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-white/95 p-3 text-[13px] text-[#515154] flex items-center justify-between">
                    <span className="font-semibold text-[#1d1d1f]">{featuredPaper.venue}</span>
                    <span className="text-[#0071e3]">{featuredPaper.arxiv}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. 100 篇前沿文献库列表 (可检索、分类过滤、一键滑出阅读器) */}
          <section className="space-y-6 terra-reveal">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-[26px] sm:text-[32px] font-semibold text-[#1d1d1f] tracking-tight">
                  {lang === "en" ? "Indexed 100 World Model Papers" : "收录的 100 篇前沿世界模型文献"}
                </h2>
                <p className="text-[14px] text-[#515154]">
                  {lang === "en"
                    ? "Click any paper to open the full reader drawer, copy BibTeX, or ask Copilot AI."
                    : "点击任意论文卡片即可滑出全文阅读抽屉，复制标准 BibTeX 引用或与 AI 助手实时问答。"}
                </p>
              </div>

              {/* 实时搜索框 */}
              <div className="w-full md:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === "en" ? "Filter by title, org, or arXiv..." : "检索论文、机构或主题..."}
                  className="w-full rounded-full bg-[#f5f5f7] px-4 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#86868b] outline-none transition"
                />
              </div>
            </div>

            {/* 6 大分类过滤 Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition shrink-0 cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-[#0071e3] text-white"
                    : "bg-[#f5f5f7] text-[#515154] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]"
                }`}
              >
                {lang === "en" ? "All (100)" : "全部 (100)"}
              </button>

              {WORLD_MODEL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = WORLD_MODEL_PAPERS_100.filter((p) => p.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-[#0071e3] text-white"
                        : "bg-[#f5f5f7] text-[#515154] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]"
                    }`}
                  >
                    <span>{lang === "en" ? cat.name : cat.nameZh}</span>
                    <span className="ml-1.5 opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* 论文卡片列表 */}
            <div className="space-y-5">
              {filteredPapers.map((paper: WorldModelPaper) => (
                <article
                  key={paper.id}
                  id={paper.id}
                  className="rounded-[24px] bg-[#f5f5f7] p-6 sm:p-7 space-y-4 transition hover:bg-[#eef0f3]"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="flex items-center gap-2.5 text-[13px] flex-wrap">
                        <span className="rounded-full bg-white px-3 py-0.5 font-medium text-[#0071e3]">
                          {lang === "en" ? paper.categoryNameEn : paper.categoryNameZh}
                        </span>
                        <span className="text-[#86868b]">{paper.venue}</span>
                        <span className="text-[#86868b]">·</span>
                        <span className="text-[#86868b]">{paper.arxiv}</span>
                      </div>

                      <h3 className="text-[19px] sm:text-[22px] font-semibold text-[#1d1d1f] tracking-tight">
                        {lang === "en" ? paper.title : paper.titleZh}
                      </h3>

                      <p className="text-[13px] text-[#515154]">
                        <span className="font-semibold text-[#1d1d1f]">Organizations: </span>
                        {paper.org}
                      </p>
                    </div>

                    {/* 动作按钮：直接阅读 */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyBibtex(paper.id, paper.bibtex)}
                        className="rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition cursor-pointer"
                      >
                        {copiedBibtexId === paper.id
                          ? (lang === "en" ? "Copied!" : "已复制!")
                          : (lang === "en" ? "Copy BibTeX" : "复制 BibTeX")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenPaper(paper)}
                        className="rounded-full bg-[#0071e3] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[#0077ed] transition cursor-pointer"
                      >
                        {lang === "en" ? "Read Paper" : "阅读论文"}
                      </button>
                    </div>
                  </div>

                  <p className="text-[14px] text-[#515154] leading-relaxed line-clamp-2">
                    {lang === "en" ? paper.abstract : paper.abstractZh}
                  </p>
                </article>
              ))}

              {filteredPapers.length === 0 && (
                <div className="rounded-[24px] bg-[#f5f5f7] p-12 text-center text-[#515154] space-y-3">
                  <div className="text-[16px] font-semibold text-[#1d1d1f]">
                    {lang === "en" ? "No matching papers found." : "未找到匹配的世界模型学术论文。"}
                  </div>
                  <p className="text-[14px]">
                    {lang === "en"
                      ? "Try searching for keywords like Sora, Oasis, Genie, Cosmos, Gaussian, or Robotics."
                      : "尝试搜索关键词：Sora、Oasis、Genie、Cosmos、Gaussian 或 Robotics。"}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* 6. 全局浅灰底脚 */}
      <AppleFooter />

      {/* 7. 论文沉浸式深度阅读器抽屉 */}
      <PaperReaderDrawer
        paper={readingPaper}
        isOpen={readerOpen}
        onClose={() => setReaderOpen(false)}
        onAskAi={handleAskAiAboutPaper}
      />

      {/* 8. AI 知识库智能问答抽屉 */}
      <CopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        initialQuery={copilotQuery}
      />
    </div>
  );
}
