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
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>("oasis-neural-universe");
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
    <div className="min-h-[100dvh] bg-white text-[#1d1d1f] flex flex-col justify-between overflow-x-hidden selection:bg-[#0071e3] selection:text-white">
      {/* 1. 统一 Apple 白昼磨砂玻璃导航 */}
      <AppleHeader onOpenCopilot={() => setCopilotOpen(true)} />

      {/* 2. 顶层学术专栏面包屑导航 (简洁专业，绝无无意义标语) */}
      <div className="bg-[#f5f5f7] px-6 sm:px-8 py-3 text-[14px] text-[#515154] w-full">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-[#0071e3] transition no-underline text-[#515154]">
              TERRA-OASIS
            </Link>
            <span className="text-[#86868b]">/</span>
            <span className="text-[#86868b]">Research Publications</span>
            <span className="text-[#86868b]">/</span>
            <span className="text-[#1d1d1f] font-semibold">Milestone Papers</span>
          </nav>
          <div className="text-[13px] text-[#515154]">
            {filteredPapers.length} Publications Indexed
          </div>
        </div>
      </div>

      <main className="flex-1 py-10 sm:py-16 w-full">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 space-y-16 w-full box-border">
          {/* 3. 精选封面重磅论文 (Featured Research Banner, 浅灰大画幅展台) */}
          <section className="rounded-[32px] bg-[#f5f5f7] p-8 sm:p-12 terra-reveal w-full box-border">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-[13px] font-medium text-[#0071e3]">
                  <span>Featured Publication</span>
                  <span>·</span>
                  <span>{featuredPaper.badge}</span>
                </div>

                <h1 className="text-[30px] sm:text-[42px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.12]">
                  {lang === "en" ? featuredPaper.titleEn : featuredPaper.titleZh}
                </h1>

                <p className="text-[15px] sm:text-[17px] text-[#515154] leading-relaxed">
                  {lang === "en" ? featuredPaper.abstractEn : featuredPaper.abstractZh}
                </p>

                <div className="text-[13px] text-[#86868b]">
                  <span className="font-medium text-[#1d1d1f]">Organizations: </span>
                  {featuredPaper.authors.join(", ")}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3 text-[14px]">
                  <button
                    type="button"
                    onClick={() => handleCopyBibtex(featuredPaper.id, featuredPaper.bibtex)}
                    className="rounded-full bg-[#0071e3] px-5 py-2 text-white font-medium hover:bg-[#0077ed] transition"
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

                  <Link
                    href="/docs"
                    className="text-[#0071e3] hover:underline flex items-center gap-1 font-medium px-2"
                  >
                    <span>{lang === "en" ? "SDK Integration Guide" : "查看代码落地指南"}</span>
                    <span>&gt;</span>
                  </Link>
                </div>
              </div>

              {/* 封面学术大图 */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-white">
                  <Image
                    src={featuredPaper.image}
                    alt={featuredPaper.titleZh}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-white/95 p-3 text-[13px] text-[#515154] flex items-center justify-between">
                    <span className="font-semibold text-[#1d1d1f]">{featuredPaper.badge}</span>
                    <span className="text-[#0071e3]">{featuredPaper.arxiv}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. 分类过滤药丸导航 (Apple 经典白昼胶囊) */}
          <section className="space-y-6 terra-reveal">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-[28px] sm:text-[34px] font-semibold text-[#1d1d1f] tracking-tight">
                  {lang === "en" ? "Peer-Reviewed World Model Publications" : "业界顶级世界模型文献专栏"}
                </h2>
                <p className="text-[15px] text-[#515154]">
                  {lang === "en"
                    ? "Curated milestone research papers across causal diffusion, game engine synthesis, and embodied foundation intelligence."
                    : "系统收录 Google DeepMind、OpenAI、Decart、Wayve 等顶尖机构在因果扩散、神经引擎与具身时空领域的里程碑成果。"}
                </p>
              </div>

              {/* 筛选按钮 */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] p-1.5 flex-wrap">
                {(["All", "World Models", "Causal Diffusion", "Embodied AI", "Game Engines"] as const).map(
                  (cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition cursor-pointer ${
                          isSelected
                            ? "bg-[#0071e3] text-white"
                            : "text-[#515154] hover:text-[#1d1d1f]"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 5. 论文列表卡片 */}
            <div className="space-y-8">
              {filteredPapers.map((paper: ResearchPaper) => {
                const isExpanded = expandedPaperId === paper.id;
                return (
                  <article
                    key={paper.id}
                    id={paper.id}
                    className="rounded-[28px] bg-[#f5f5f7] p-6 sm:p-10 space-y-6 transition hover:bg-[#eef0f3]"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 max-w-3xl">
                        <div className="flex items-center gap-2.5 text-[13px]">
                          <span className="rounded-full bg-white px-3 py-0.5 font-medium text-[#0071e3]">
                            {paper.category}
                          </span>
                          <span className="text-[#86868b]">{paper.badge}</span>
                          <span className="text-[#86868b]">·</span>
                          <span className="text-[#86868b]">{paper.date}</span>
                        </div>

                        <h3 className="text-[22px] sm:text-[28px] font-semibold text-[#1d1d1f] tracking-tight">
                          {lang === "en" ? paper.titleEn : paper.titleZh}
                        </h3>

                        <p className="text-[14px] text-[#515154]">
                          <span className="font-medium text-[#1d1d1f]">Organizations: </span>
                          {paper.authors.join(", ")}
                        </p>
                      </div>

                      {/* 动作区 */}
                      <div className="flex items-center gap-3 shrink-0">
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
                            ? (lang === "en" ? "Collapse Data" : "收起消融数据")
                            : (lang === "en" ? "Inspect Ablation" : "展开消融数据")}
                        </button>
                      </div>
                    </div>

                    <p className="text-[15px] sm:text-[16px] text-[#515154] leading-relaxed">
                      {lang === "en" ? paper.abstractEn : paper.abstractZh}
                    </p>

                    {/* 消融实验展开数据表 (浅色白板对比表格) */}
                    {isExpanded && (
                      <div className="rounded-[20px] bg-white p-6 space-y-4" data-ui="true">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[15px] font-semibold text-[#1d1d1f]">
                            {lang === "en" ? "Key Quantitative Benchmarks" : "核心实验评测指标对比"}
                          </h4>
                          <span className="text-[13px] text-[#86868b]">
                            {paper.arxiv}
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[13px]">
                            <thead className="text-[#86868b] text-[13px] tracking-wider">
                              <tr className="bg-[#f5f5f7]">
                                <th className="p-3">Evaluation Metric</th>
                                <th className="p-3">Baseline Architecture</th>
                                <th className="p-3">Neural World Model (SOTA)</th>
                                <th className="p-3">Improvement Delta</th>
                              </tr>
                            </thead>
                            <tbody className="text-[#1d1d1f]">
                              {paper.benchmarks.map((bench, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#f5f5f7]/50"}>
                                  <td className="p-3 font-medium text-[#1d1d1f]">{bench.metric}</td>
                                  <td className="p-3 text-[#515154]">{bench.baseline}</td>
                                  <td className="p-3 font-semibold text-[#0071e3]">{bench.terraOasis}</td>
                                  <td className="p-3 font-semibold text-[#0062c4]">{bench.improvement}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* 深度理论章节 */}
                        {paper.sections.length > 0 && (
                          <div className="pt-2 space-y-3">
                            <h5 className="text-[14px] font-semibold text-[#1d1d1f]">
                              {lang === "en" ? "Core Technical Breakthroughs" : "核心技术突破要点"}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {paper.sections.map((sec, secIdx) => (
                                <div key={secIdx} className="rounded-[16px] bg-[#f5f5f7] p-4 space-y-1.5">
                                  <div className="text-[13px] font-semibold text-[#1d1d1f]">
                                    {lang === "en" ? sec.headingEn : sec.headingZh}
                                  </div>
                                  <p className="text-[13px] text-[#515154] leading-relaxed">
                                    {lang === "en" ? sec.bodyEn : sec.bodyZh}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* BibTeX 引用代码框 */}
                        <div className="pt-2">
                          <div className="text-[13px] font-semibold text-[#86868b] mb-1.5">
                            Standard BibTeX Citation
                          </div>
                          <pre className="rounded-[14px] bg-[#f5f5f7] p-3 text-[13px] text-[#515154] overflow-x-auto m-0">
                            <code>{paper.bibtex}</code>
                          </pre>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          {/* 6. 学术合作与联合实验室 (浅灰大卡片，简洁专业) */}
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
