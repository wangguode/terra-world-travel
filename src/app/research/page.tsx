"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import {
  WORLD_MODEL_PAPERS_100,
  WORLD_MODEL_CATEGORIES,
  WorldModelPaper,
} from "@/lib/world-model-papers-100";
import {
  WORLD_MODEL_BLOG_ARTICLES,
  PaperBlogArticle,
} from "@/lib/world-model-blogs-rich";
import { AppleHeader } from "@/components/apple-header";
import { AppleFooter } from "@/components/apple-footer";
import { CopilotDrawer } from "@/components/copilot-drawer";
import { WorldModelKnowledgeGraph } from "@/components/world-model-knowledge-graph";
import { PaperReaderDrawer } from "@/components/paper-reader-drawer";
import { PaperBlogViewer } from "@/components/paper-blog-viewer";
import { PaperMarkdownView } from "@/components/paper-markdown-view";

function ResearchContent() {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const initialBlogParam = searchParams.get("blog");

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"graph" | "blogs" | "papers">("graph");

  // 深度论文博客全屏研读状态
  const [activeBlog, setActiveBlog] = useState<PaperBlogArticle | null>(() => {
    if (initialBlogParam) {
      return WORLD_MODEL_BLOG_ARTICLES.find((b) => b.id === initialBlogParam) || null;
    }
    return null;
  });

  // 图谱当前选中的论文 (用于下方 Markdown 风格即时研读)
  const [selectedGraphPaper, setSelectedGraphPaper] = useState<WorldModelPaper>(
    WORLD_MODEL_PAPERS_100[0]
  );

  // 论文轻量抽屉状态
  const [readingPaper, setReadingPaper] = useState<WorldModelPaper | null>(null);
  const [readerOpen, setReaderOpen] = useState<boolean>(false);

  // AI 助手抽屉联动状态
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState("");

  const [copiedBibtexId, setCopiedBibtexId] = useState<string | null>(null);

  useEffect(() => {
    if (initialBlogParam) {
      const target = WORLD_MODEL_BLOG_ARTICLES.find((b) => b.id === initialBlogParam);
      if (target) {
        const timer = setTimeout(() => {
          setActiveBlog(target);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [initialBlogParam]);

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
  }, [selectedCategory, searchQuery, viewMode, activeBlog, lang]);

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
    // 检查是否有对应的深度博客，如果有且在 blogs 模式下直接打开博客，否则打开抽屉
    const matchedBlog = WORLD_MODEL_BLOG_ARTICLES.find(
      (b) => b.paperId === paper.id || b.title.toLowerCase().includes(paper.title.slice(0, 15).toLowerCase())
    );
    if (matchedBlog && viewMode === "blogs") {
      setActiveBlog(matchedBlog);
      return;
    }
    setReadingPaper(paper);
    setReaderOpen(true);
  };

  const handleOpenBlogFromDrawer = (blog: PaperBlogArticle) => {
    setReaderOpen(false);
    setActiveBlog(blog);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      {/* 1. 统一 Apple 磨砂玻璃主导航 */}
      <AppleHeader
        onOpenCopilot={() => {
          setCopilotQuery("");
          setCopilotOpen(true);
        }}
      />

      {/* 2. Apple 极简纯净副导航 (彻底取消厚重灰横条，采用白底自然留白) */}
      <div className="bg-white px-6 sm:px-8 py-3 text-[13px] text-[#515154] w-full sticky top-12 z-20">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#0071e3] transition no-underline text-[#515154]">
              TERRA-OASIS
            </Link>
            <span className="text-[#d2d2d7]">/</span>
            <button
              type="button"
              onClick={() => {
                setActiveBlog(null);
                setViewMode("graph");
              }}
              className="hover:text-[#0071e3] transition cursor-pointer text-[#515154]"
            >
              {lang === "en" ? "Research & Knowledge Base" : "前沿科研与学术知识库"}
            </button>
            {activeBlog ? (
              <>
                <span className="text-[#d2d2d7]">/</span>
                <span className="text-[#1d1d1f] font-medium truncate max-w-xs sm:max-w-md">
                  {lang === "en" ? activeBlog.title : activeBlog.titleZh}
                </span>
              </>
            ) : (
              <>
                <span className="text-[#d2d2d7]">/</span>
                <span className="text-[#1d1d1f] font-medium">
                  {viewMode === "graph"
                    ? (lang === "en" ? "Knowledge Graph" : "学术知识图谱")
                    : viewMode === "blogs"
                    ? (lang === "en" ? "Deep-Dive Blogs" : "深度论文博客")
                    : (lang === "en" ? "100+ Indexed Papers" : "100+ 篇文献库")}
                </span>
              </>
            )}
          </nav>

          {/* 顶层视图切换胶囊 (Apple 纯白悬浮药丸) */}
          <div className="flex items-center gap-2">
            {!activeBlog && (
              <div className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f7] p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("graph")}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium transition cursor-pointer ${
                    viewMode === "graph"
                      ? "bg-white text-[#1d1d1f] font-semibold"
                      : "text-[#515154] hover:text-[#1d1d1f]"
                  }`}
                >
                  {lang === "en" ? "Knowledge Graph" : "知识图谱"}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("blogs")}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium transition cursor-pointer ${
                    viewMode === "blogs"
                      ? "bg-white text-[#1d1d1f] font-semibold"
                      : "text-[#515154] hover:text-[#1d1d1f]"
                  }`}
                >
                  {lang === "en" ? "Deep-Dive Blogs" : "精选论文博客"}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("papers")}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium transition cursor-pointer ${
                    viewMode === "papers"
                      ? "bg-white text-[#1d1d1f] font-semibold"
                      : "text-[#515154] hover:text-[#1d1d1f]"
                  }`}
                >
                  {lang === "en" ? "100+ Papers" : "100 篇文献库"}
                </button>
              </div>
            )}

            {activeBlog ? (
              <button
                type="button"
                onClick={() => setActiveBlog(null)}
                className="rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[12px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition cursor-pointer"
              >
                {lang === "en" ? "← Back to Hub" : "← 返回知识库主页"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCopilotQuery("");
                  setCopilotOpen(true);
                }}
                className="rounded-full bg-[#0071e3] px-3.5 py-1 text-[12px] font-medium text-white hover:bg-[#0077ed] transition cursor-pointer flex items-center gap-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                <span>{lang === "en" ? "Ask Copilot AI" : "AI 智能问答"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 py-10 sm:py-16 w-full">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 space-y-16 w-full box-border">
          {/* =====================================================================
              A. 模式一：如果选中了具体某篇论文博客，全景沉浸研读
             ===================================================================== */}
          {activeBlog ? (
            <section className="terra-reveal">
              <PaperBlogViewer
                article={activeBlog}
                onBackToGraph={() => {
                  setActiveBlog(null);
                  setViewMode("graph");
                }}
                onSelectArticle={(other) => {
                  setActiveBlog(other);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onAskAi={handleAskAiAboutPaper}
              />
            </section>
          ) : (
            <>
              {/* =====================================================================
                  B. 模式二：知识图谱视图 (Knowledge Graph + Markdown Reading Area)
                 ===================================================================== */}
              {viewMode === "graph" && (
                <section className="space-y-10 terra-reveal">
                  <div className="max-w-3xl space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[13px] font-medium text-[#0071e3]">
                      <span>Interactive Academic Universe</span>
                      <span>·</span>
                      <span>100+ Papers</span>
                    </div>
                    <h1 className="text-[32px] sm:text-[46px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.12]">
                      {lang === "en"
                        ? "Interactive Knowledge Graph of World Models"
                        : "世界模型前沿学术星空知识图谱"}
                    </h1>
                    <p className="text-[16px] text-[#515154] leading-relaxed">
                      {lang === "en"
                        ? "Explore citation networks across 100+ top publications. Click any node in the graph, and read the full paper below in clean Markdown style."
                        : "可拖拽探索 100+ 篇全球前沿世界模型文献脉络。点击图谱中任意节点，选中的学术成果将直接在下方以 Markdown 风格展开研读，零弹窗阻隔。"}
                    </p>
                  </div>

                  {/* 交互知识图谱 */}
                  <WorldModelKnowledgeGraph
                    onSelectPaper={(paper) => {
                      setSelectedGraphPaper(paper);
                      const el = document.getElementById("paper-markdown-reader");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    selectedPaperId={selectedGraphPaper.id}
                  />

                  {/* 核心联动：图谱下方直接呈现 Markdown 风格研读专区 */}
                  <div className="pt-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#0071e3]" />
                        <span className="text-[15px] font-semibold text-[#1d1d1f]">
                          {lang === "en" ? "Selected Paper · Markdown Reading Area" : "图谱当前选中成果 · Markdown 风格学术研读专区"}
                        </span>
                        <span className="text-[13px] text-[#86868b] truncate max-w-md">
                          ({selectedGraphPaper.title})
                        </span>
                      </div>
                      <div className="text-[13px] text-[#0071e3] font-medium">
                        {lang === "en" ? "Click any node in graph above to switch" : "点击上方任意图谱节点即刻切换研读 ↓"}
                      </div>
                    </div>

                    <PaperMarkdownView
                      paper={selectedGraphPaper}
                      onAskAi={handleAskAiAboutPaper}
                      onSelectOtherPaper={(p) => setSelectedGraphPaper(p)}
                      allPapers={WORLD_MODEL_PAPERS_100}
                    />
                  </div>
                </section>
              )}

              {/* =====================================================================
                  C. 模式三：精选深度论文博客画廊 (Deep-Dive Paper Blogs Gallery)
                 ===================================================================== */}
              {viewMode === "blogs" && (
                <section className="space-y-8 terra-reveal">
                  <div className="max-w-3xl space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[13px] font-medium text-[#0071e3]">
                      <span>Peer-Reviewed Deep Dives</span>
                      <span>·</span>
                      <span>Integrated Blog Knowledge Base</span>
                    </div>
                    <h1 className="text-[32px] sm:text-[46px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.12]">
                      {lang === "en"
                        ? "Curated World Model Paper Blogs"
                        : "精选前沿世界模型深度研读长文"}
                    </h1>
                    <p className="text-[16px] text-[#515154] leading-relaxed">
                      {lang === "en"
                        ? "Read long-form architectural breakdowns, mathematical equations, code implementations, and empirical benchmark tables directly within the TERRA platform."
                        : "在平台中直接全景研读全球 Top 论文的深度博客：涵盖架构推导、可运行伪代码、消融实验表与工程启示，支持随时唤醒 AI 助手智能问答。"}
                    </p>
                  </div>

                  {/* 精选论文博客网格卡片 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {WORLD_MODEL_BLOG_ARTICLES.map((blog) => (
                      <article
                        key={blog.id}
                        onClick={() => {
                          setActiveBlog(blog);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="group rounded-[28px] bg-[#f5f5f7] overflow-hidden p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:bg-[#e8e8ed] transition cursor-pointer"
                      >
                        <div className="space-y-4">
                          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-white">
                            <Image
                              src={blog.coverImage}
                              alt={blog.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold text-[#0071e3]">
                              {blog.category}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[12px] text-[#86868b]">
                              <span className="font-semibold text-[#1d1d1f]">{blog.venue}</span>
                              <span>·</span>
                              <span>{blog.date}</span>
                              <span>·</span>
                              <span>{blog.readTime}</span>
                            </div>

                            <h2 className="text-[20px] sm:text-[22px] font-semibold text-[#1d1d1f] tracking-tight leading-snug group-hover:text-[#0071e3] transition">
                              {lang === "en" ? blog.title : blog.titleZh}
                            </h2>

                            <p className="text-[14px] text-[#515154] line-clamp-3 leading-relaxed">
                              {lang === "en" ? blog.summaryEn : blog.summaryZh}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 text-[13px]">
                          <span className="text-[#86868b]">{blog.org}</span>
                          <span className="text-[#0071e3] font-medium flex items-center gap-1">
                            <span>{lang === "en" ? "Read Full Blog" : "研读深度长文"}</span>
                            <span>→</span>
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* =====================================================================
                  D. 模式四：100 篇前沿文献库列表 (Indexed 100 Papers)
                 ===================================================================== */}
              {viewMode === "papers" && (
                <section className="space-y-6 terra-reveal">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="text-[26px] sm:text-[34px] font-semibold text-[#1d1d1f] tracking-tight">
                        {lang === "en" ? "Indexed 100 World Model Papers" : "收录的 100 篇前沿世界模型文献"}
                      </h2>
                      <p className="text-[14px] text-[#515154]">
                        {lang === "en"
                          ? "Filter by domain, search authors, copy BibTeX, or ask Copilot AI."
                          : "按 6 大领域结构化分类，支持全文快速检索与 BibTeX 引用。"}
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
                      const count = WORLD_MODEL_PAPERS_100.filter((p) => p.category === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition shrink-0 cursor-pointer ${
                            selectedCategory === cat.id
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

                  {/* 文献卡片流 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPapers.map((paper) => (
                      <div
                        key={paper.id}
                        className="rounded-[22px] bg-[#f5f5f7] p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:bg-[#e8e8ed] transition"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-[12px] text-[#86868b]">
                            <span className="rounded-full bg-white px-2.5 py-0.5 font-medium text-[#0071e3]">
                              {lang === "en" ? paper.categoryNameEn : paper.categoryNameZh}
                            </span>
                            <span>{paper.venue} · {paper.year}</span>
                          </div>

                          <h3
                            onClick={() => handleOpenPaper(paper)}
                            className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight leading-snug cursor-pointer hover:text-[#0071e3] transition"
                          >
                            {paper.title}
                          </h3>

                          <div className="text-[14px] text-[#515154]">
                            {paper.titleZh}
                          </div>

                          <p className="text-[13px] text-[#515154] line-clamp-3 leading-relaxed">
                            {lang === "en" ? paper.abstract : paper.abstractZh}
                          </p>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[12px]">
                          <span className="text-[#86868b] truncate max-w-[200px]">{paper.org}</span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyBibtex(paper.id, paper.bibtex)}
                              className="rounded-full bg-white px-3 py-1 font-medium text-[#1d1d1f] hover:bg-[#d2d2d7]/50 transition cursor-pointer"
                            >
                              {copiedBibtexId === paper.id
                                ? (lang === "en" ? "Copied" : "已复制")
                                : "BibTeX"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenPaper(paper)}
                              className="rounded-full bg-[#0071e3] px-3 py-1 font-medium text-white hover:bg-[#0077ed] transition cursor-pointer"
                            >
                              {lang === "en" ? "Read" : "阅读"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 精选封面展台 (当未打开具体博客时，展示在最底部作为学术引领) */}
              <section className="rounded-[32px] bg-[#f5f5f7] p-8 sm:p-12 terra-reveal w-full box-border">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-[13px] font-medium text-[#0071e3]">
                      <span>Featured Milestone Publication</span>
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
                        {lang === "en" ? "Read Milestone Paper" : "阅读里程碑论文"}
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
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-white">
                      <Image
                        src="/images/beijing-pulse/hero-beijing.jpg"
                        alt={featuredPaper.titleZh}
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* 4. 统一 Apple 浅灰底脚 */}
      <AppleFooter />

      {/* 5. 论文轻量快速抽屉 */}
      <PaperReaderDrawer
        paper={readingPaper}
        isOpen={readerOpen}
        onClose={() => setReaderOpen(false)}
        onAskAi={handleAskAiAboutPaper}
        onOpenBlog={handleOpenBlogFromDrawer}
      />

      {/* 6. AI 智能问答侧边抽屉 */}
      <CopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        initialQuery={copilotQuery}
      />
    </div>
  );
}

export default function ResearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-white flex items-center justify-center text-[#515154] text-[15px]">
          Loading Research &amp; Knowledge Base...
        </div>
      }
    >
      <ResearchContent />
    </Suspense>
  );
}
