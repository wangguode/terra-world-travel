"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { OFFICIAL_RESEARCH_PAPERS, ResearchPaper } from "@/lib/oasis-blog-data";
import { AppleHeader } from "@/components/apple-header";
import { AppleFooter } from "@/components/apple-footer";
import { CopilotDrawer } from "@/components/copilot-drawer";

export default function ResearchPage() {
  const { lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>("infinite-causal-dit");
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
  }, [selectedCategory, lang]);

  const filteredPapers = OFFICIAL_RESEARCH_PAPERS.filter((paper) => {
    if (selectedCategory === "All") return true;
    return paper.category === selectedCategory;
  });

  const featuredPaper = OFFICIAL_RESEARCH_PAPERS[0];

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
    <div className="min-h-[100dvh] bg-[#000000] text-[#f5f5f7] flex flex-col justify-between">
      <AppleHeader onOpenCopilot={() => setCopilotOpen(true)} />

      {/* 顶层 Apple ML Research 风格副导航 */}
      <div className="bg-[#0c0c0e] px-6 sm:px-8 py-3 text-[13px] text-[#86868b]">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Apple-Grade Research</span>
            <span>/</span>
            <span className="text-[#a1a1a6]">Machine Learning & Physical World Models</span>
          </div>
          <div className="text-[13px] text-[#86868b]">
            Open Science · Reproducible Benchmarks · Apache 2.0
          </div>
        </div>
      </div>

      <main className="flex-1 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 space-y-16">
          {/* 1. 精选封面重磅论文 (Featured Research Banner, 无 eyebrow，图片主导) */}
          <section className="rounded-[32px] bg-[#121214] p-8 sm:p-12 terra-reveal">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <h1 className="text-[32px] sm:text-[46px] lg:text-[54px] font-semibold text-white tracking-tight leading-[1.08]">
                  {lang === "en" ? featuredPaper.titleEn : featuredPaper.titleZh}
                </h1>

                <div className="text-[14px] text-[#2997ff] font-medium flex flex-wrap items-center gap-2">
                  <span>Featured Paper</span>
                  <span>·</span>
                  <span>{featuredPaper.badge}</span>
                  <span>·</span>
                  <span className="text-[#86868b]">{featuredPaper.arxiv}</span>
                  <span className="text-[#86868b]">·</span>
                  <span className="text-[#86868b]">{featuredPaper.date}</span>
                </div>

                <div className="text-[14px] text-[#86868b]">
                  <span>Authors: </span>
                  <span className="text-[#d2d2d7] font-medium">
                    {featuredPaper.authors.join(", ")}
                  </span>
                </div>

                <p className="text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed max-w-3xl font-normal">
                  {lang === "en" ? featuredPaper.abstractEn : featuredPaper.abstractZh}
                </p>

                {/* 四大学术行动按钮 */}
                <div className="pt-2 flex flex-wrap items-center gap-3 text-[14px]">
                  <a
                    href="https://arxiv.org/abs/2603.01892"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white px-5 py-2.5 text-black font-semibold hover:bg-white/90 transition no-underline flex items-center gap-1.5"
                  >
                    <span>Read Paper (arXiv)</span>
                    <span>↗</span>
                  </a>
                  <a
                    href="https://github.com/wangguode/terra-world-travel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white/10 px-5 py-2.5 text-white font-medium hover:bg-white/20 transition no-underline flex items-center gap-1.5"
                  >
                    <span>Code Repository</span>
                    <span>↗</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyBibtex(featuredPaper.id, featuredPaper.bibtex)}
                    className="rounded-full bg-white/10 px-5 py-2.5 text-white font-medium hover:bg-white/20 transition"
                  >
                    {copiedBibtexId === featuredPaper.id ? "BibTeX Copied!" : "Cite (BibTeX)"}
                  </button>
                  <Link
                    href="/#interactive-playground"
                    className="rounded-full bg-[#0071e3] px-5 py-2.5 text-white font-medium hover:bg-[#0077ed] transition no-underline"
                  >
                    Interactive Demo
                  </Link>
                </div>
              </div>

              {/* 封面学术大图 (占满视觉重心) */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[24px]">
                  <Image
                    src={featuredPaper.image}
                    alt={featuredPaper.titleEn}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 2. 主题分类过滤标签条 (Topic Filter Pills) */}
          <div className="flex flex-wrap items-center justify-between gap-4 terra-reveal">
            <div>
              <h2 className="text-[24px] sm:text-[32px] font-semibold text-white tracking-tight">
                {lang === "en" ? "Publications & Preprints" : "全部学术论文与预印本"}
              </h2>
              <p className="mt-1 text-[16px] text-[#86868b]">
                {lang === "en"
                  ? "Peer-reviewed research and system papers from TERRA World Model Lab."
                  : "来自 TERRA 世界模型实验室的同行评议顶会成果与开源系统论文。"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(["All", "Causal Diffusion", "World Models", "Embodied AI"] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-[14px] font-medium transition ${
                      selectedCategory === cat
                        ? "bg-white text-black"
                        : "bg-[#161617] text-[#d1d1d6] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 3. 论文列表与深度解读卡片 (每张卡片含配图，标题在前，无 eyebrow) */}
          <div className="space-y-12">
            {filteredPapers.map((paper: ResearchPaper) => {
              const isExpanded = expandedPaperId === paper.id;
              return (
                <article
                  key={paper.id}
                  id={paper.id}
                  className="rounded-[32px] bg-[#121214] p-8 sm:p-12 space-y-6 transition hover:bg-[#141417] terra-reveal"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 space-y-4">
                      <h3 className="text-[24px] sm:text-[30px] font-semibold text-white tracking-tight leading-snug">
                        {lang === "en" ? paper.titleEn : paper.titleZh}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2.5 text-[14px]">
                        <span className="text-[#2997ff] font-medium">
                          {paper.badge}
                        </span>
                        <span>·</span>
                        <span className="text-[#86868b]">{paper.arxiv}</span>
                        <span>·</span>
                        <span className="text-[#86868b]">{paper.date}</span>
                      </div>

                      <div className="text-[14px] text-[#86868b]">
                        <span>{paper.authors.join(", ")}</span>
                      </div>

                      <p className="text-[16px] text-[#d2d2d7] leading-relaxed">
                        {lang === "en" ? paper.abstractEn : paper.abstractZh}
                      </p>
                    </div>

                    <div className="lg:col-span-4">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-[20px]">
                        <Image
                          src={paper.image}
                          alt={paper.titleEn}
                          fill
                          sizes="(max-width: 1024px) 100vw, 30vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 消融实验对比数据卡 (Ablation Benchmark Table) */}
                  <div className="rounded-[22px] bg-[#070707] p-6 space-y-3">
                    <div className="text-[14px] font-semibold text-white/95">
                      Empirical Benchmarks and Ablation Comparison
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[14px]">
                      {paper.benchmarks.map((bench) => (
                        <div key={bench.metric} className="rounded-[14px] bg-[#121214] p-4 space-y-1">
                          <div className="text-[#86868b] text-[13px]">{bench.metric}</div>
                          <div className="text-white font-medium">{bench.terraOasis}</div>
                          <div className="text-[#2997ff] text-[13px] font-semibold">
                            {bench.improvement} vs {bench.baseline}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 展开的深度正文切片 */}
                  {isExpanded && (
                    <div className="pt-4 space-y-6">
                      {paper.sections.map((sec, idx) => (
                        <div key={idx} className="space-y-2 rounded-[20px] bg-[#161617] p-6">
                          <h4 className="text-[18px] font-semibold text-white">
                            {lang === "en" ? sec.headingEn : sec.headingZh}
                          </h4>
                          <p className="text-[16px] text-[#d2d2d7] leading-relaxed">
                            {lang === "en" ? sec.bodyEn : sec.bodyZh}
                          </p>
                        </div>
                      ))}

                      {/* BibTeX 引用块 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[13px] text-[#86868b]">
                          <span>BibTeX Citation</span>
                          <button
                            type="button"
                            onClick={() => handleCopyBibtex(paper.id, paper.bibtex)}
                            className="text-[#2997ff] hover:underline"
                          >
                            {copiedBibtexId === paper.id ? "Copied" : "Copy BibTeX"}
                          </button>
                        </div>
                        <pre className="rounded-[18px] bg-[#070707] p-5 text-[14px] text-white/90 overflow-x-auto">
                          <code>{paper.bibtex}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* 展开/收起按钮与行动栏 */}
                  <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedPaperId(isExpanded ? null : paper.id)
                      }
                      className="text-[14px] text-[#2997ff] font-medium hover:underline flex items-center gap-1.5"
                    >
                      <span>
                        {isExpanded
                          ? lang === "en"
                            ? "Collapse Deep Dive"
                            : "收起深度研报"
                          : lang === "en"
                          ? "Expand Paper Sections & BibTeX"
                          : "展开论文切片与引用"}
                      </span>
                      <span>{isExpanded ? "↑" : "↓"}</span>
                    </button>

                    <div className="flex items-center gap-4 text-[14px]">
                      <a
                        href={`https://arxiv.org/abs/${paper.arxiv.replace("arXiv:", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#d1d1d6] hover:text-white transition no-underline"
                      >
                        arXiv PDF ↗
                      </a>
                      <button
                        type="button"
                        onClick={() => setCopilotOpen(true)}
                        className="text-[#2997ff] hover:underline"
                      >
                        Ask Copilot About This Paper &gt;
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>

      <AppleFooter />
      <CopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
}
