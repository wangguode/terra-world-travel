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

export default function ResearchPage() {
  const { lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>("oasis-a-universe-in-a-neural-network-1");
  const [copiedBibtexId, setCopiedBibtexId] = useState<string | null>(null);
  const [copilotOpen, setCopilotOpen] = useState(false);

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

  return (
    <div className="min-h-[100dvh] bg-white text-[#1d1d1f] flex flex-col justify-between overflow-x-hidden selection:bg-[#0071e3] selection:text-white">
      {/* 1. 统一 Apple 白昼磨砂玻璃导航 */}
      <AppleHeader onOpenCopilot={() => setCopilotOpen(true)} />

      {/* 2. Apple 极简纯净副导航（彻底移除了技术堆砌与口号） */}
      <div className="bg-[#f5f5f7] px-6 sm:px-8 py-3.5 text-[14px] text-[#515154] w-full">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#0071e3] transition no-underline text-[#515154]">
              TERRA-OASIS
            </Link>
            <span className="text-[#86868b]">/</span>
            <span className="text-[#1d1d1f] font-semibold">
              {lang === "en" ? "Research Publications" : "前沿文献专栏"}
            </span>
          </nav>

          <div className="flex items-center gap-2 text-[13px] text-[#515154]">
            <span className="h-2 w-2 rounded-full bg-[#0071e3]" />
            <span>
              {lang === "en"
                ? `${filteredPapers.length} / 100 Papers Filtered`
                : `已检索到 ${filteredPapers.length} / 100 篇前沿文献`}
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 py-10 sm:py-16 w-full">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 space-y-16 w-full box-border">
          {/* 3. 精选封面论文展台 (Apple 风格大画幅浅灰展台) */}
          <section className="rounded-[32px] bg-[#f5f5f7] p-8 sm:p-12 terra-reveal w-full box-border">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-[13px] font-medium text-[#0071e3]">
                  <span>Featured Publication</span>
                  <span>·</span>
                  <span>{featuredPaper.venue}</span>
                </div>

                <h1 className="text-[30px] sm:text-[42px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.12]">
                  {lang === "en" ? featuredPaper.title : featuredPaper.titleZh}
                </h1>

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
                    onClick={() => handleCopyBibtex(featuredPaper.id, featuredPaper.bibtex)}
                    className="rounded-full bg-[#0071e3] px-5 py-2 text-white font-medium hover:bg-[#0077ed] transition cursor-pointer"
                  >
                    {copiedBibtexId === featuredPaper.id
                      ? (lang === "en" ? "BibTeX Copied!" : "已复制 BibTeX!")
                      : (lang === "en" ? "Cite BibTeX" : "引用论文 (BibTeX)")}
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

                  <button
                    type="button"
                    onClick={() => setCopilotOpen(true)}
                    className="text-[#0071e3] hover:underline flex items-center gap-1 font-medium px-2 cursor-pointer"
                  >
                    <span>{lang === "en" ? "Ask AI About This Paper" : "向 AI 询问此论文"}</span>
                    <span>&gt;</span>
                  </button>
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

          {/* 4. 100 篇前沿文献库探索工具栏 (搜索框 + 6 大前沿分类 Pills) */}
          <section className="space-y-6 terra-reveal">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-[28px] sm:text-[34px] font-semibold text-[#1d1d1f] tracking-tight">
                  {lang === "en" ? "World Model Research Library" : "前沿世界模型 100 篇文献专栏"}
                </h2>
                <p className="text-[15px] text-[#515154]">
                  {lang === "en"
                    ? "Curated milestone publications (2024–2026) spanning Google DeepMind, OpenAI, NVIDIA, Wayve, and Decart."
                    : "收录 2024 至 2026 年间来自全球顶尖实验室与名校的 100 篇世界模型同行评议重磅成果，支持实时检索与 AI 智能问答。"}
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

            {/* 6 大前沿分类切换 Tabs */}
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
                {lang === "en" ? "All Papers (100)" : "全部文献 (100)"}
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

            {/* 5. 论文卡片流式展示列表 */}
            <div className="space-y-6">
              {filteredPapers.map((paper: WorldModelPaper) => {
                const isExpanded = expandedPaperId === paper.id;
                return (
                  <article
                    key={paper.id}
                    id={paper.id}
                    className="rounded-[24px] bg-[#f5f5f7] p-6 sm:p-8 space-y-5 transition hover:bg-[#eef0f3]"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 max-w-3xl">
                        <div className="flex items-center gap-2.5 text-[13px] flex-wrap">
                          <span className="rounded-full bg-white px-3 py-0.5 font-medium text-[#0071e3]">
                            {lang === "en" ? paper.categoryNameEn : paper.categoryNameZh}
                          </span>
                          <span className="text-[#86868b]">{paper.venue}</span>
                          <span className="text-[#86868b]">·</span>
                          <span className="text-[#86868b]">{paper.arxiv}</span>
                        </div>

                        <h3 className="text-[20px] sm:text-[24px] font-semibold text-[#1d1d1f] tracking-tight">
                          {lang === "en" ? paper.title : paper.titleZh}
                        </h3>

                        <p className="text-[14px] text-[#515154]">
                          <span className="font-medium text-[#1d1d1f]">Authors / Orgs: </span>
                          {paper.org}
                        </p>
                      </div>

                      {/* 动作区 */}
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
                          onClick={() => setExpandedPaperId(isExpanded ? null : paper.id)}
                          className="rounded-full bg-[#0071e3] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[#0077ed] transition cursor-pointer"
                        >
                          {isExpanded
                            ? (lang === "en" ? "Collapse Details" : "收起摘要")
                            : (lang === "en" ? "Inspect Details" : "阅读详情")}
                        </button>
                      </div>
                    </div>

                    <p className="text-[15px] sm:text-[16px] text-[#515154] leading-relaxed">
                      {lang === "en" ? paper.abstract : paper.abstractZh}
                    </p>

                    {/* 展开的核心贡献与 BibTeX */}
                    {isExpanded && (
                      <div className="rounded-[20px] bg-white p-6 space-y-4" data-ui="true">
                        <div className="space-y-1">
                          <div className="text-[13px] font-semibold text-[#0071e3]">
                            {lang === "en" ? "Key Quantitative Contribution" : "核心学术创新与定量贡献"}
                          </div>
                          <p className="text-[14px] text-[#1d1d1f] leading-relaxed">
                            {paper.highlight}
                          </p>
                        </div>

                        <div className="pt-2">
                          <div className="text-[13px] font-semibold text-[#86868b] mb-1.5">
                            Standard BibTeX Entry
                          </div>
                          <pre className="rounded-[14px] bg-[#f5f5f7] p-3 text-[13px] text-[#515154] overflow-x-auto m-0">
                            <code>{paper.bibtex}</code>
                          </pre>
                        </div>

                        <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-[13px]">
                          <a
                            href="https://arxiv.org"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0071e3] hover:underline font-medium"
                          >
                            <span>Download PDF on arXiv ({paper.arxiv}) ↗</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => setCopilotOpen(true)}
                            className="text-[#0071e3] hover:underline font-medium cursor-pointer"
                          >
                            <span>{lang === "en" ? "Ask AI Copilot about this paper &gt;" : "向 AI 助手提问该论文 &gt;"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}

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

          {/* 6. 学术合作与联合实验室 (Apple 浅灰大卡片) */}
          <section className="rounded-[32px] bg-[#f5f5f7] p-8 sm:p-12 text-center terra-reveal space-y-6">
            <h2 className="text-[28px] sm:text-[38px] font-semibold text-[#1d1d1f] tracking-tight">
              {lang === "en"
                ? "Academic Grant & Research Compute Allocation"
                : "学术研究算力配额与联合实验室"}
            </h2>
            <p className="text-[16px] sm:text-[18px] text-[#515154] max-w-2xl mx-auto leading-relaxed">
              {lang === "en"
                ? "We provide GPU compute clusters, real-time WebRTC simulator endpoints, and pre-trained checkpoint weights to accredited universities and non-profit research laboratories."
                : "我们为全球高校及非营利科研实验室提供高性能 GPU 集群计算支持、全双工 WebRTC 世界模型推流接口以及开源预训练权重。"}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[14px]">
              <a
                href="mailto:research@terra-world-travel.org"
                className="rounded-full bg-[#0071e3] px-7 py-3 text-white font-medium hover:bg-[#0077ed] transition no-underline"
              >
                {lang === "en" ? "Apply for Academic Grant" : "申请学术算力支持"}
              </a>
              <Link
                href="/docs"
                className="rounded-full bg-white px-7 py-3 text-[#1d1d1f] font-medium hover:bg-[#e8e8ed] transition no-underline"
              >
                {lang === "en" ? "Explore Developer SDK" : "查阅开发者 SDK"}
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* 7. 统一 Apple 浅灰底脚 */}
      <AppleFooter />

      {/* 8. AI 侧边抽屉 */}
      <CopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
}
