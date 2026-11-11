"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { PaperBlogArticle, WORLD_MODEL_BLOG_ARTICLES } from "@/lib/world-model-blogs-rich";

interface PaperBlogViewerProps {
  article: PaperBlogArticle;
  onBackToGraph: () => void;
  onSelectArticle: (article: PaperBlogArticle) => void;
  onAskAi: (paperTitle: string) => void;
}

export function PaperBlogViewer({
  article,
  onBackToGraph,
  onSelectArticle,
  onAskAi,
}: PaperBlogViewerProps) {
  const { lang } = useLanguage();
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [copiedBibtex, setCopiedBibtex] = useState(false);

  const currentIndex = WORLD_MODEL_BLOG_ARTICLES.findIndex((a) => a.id === article.id);
  const prevArticle = currentIndex > 0 ? WORLD_MODEL_BLOG_ARTICLES[currentIndex - 1] : null;
  const nextArticle =
    currentIndex < WORLD_MODEL_BLOG_ARTICLES.length - 1
      ? WORLD_MODEL_BLOG_ARTICLES[currentIndex + 1]
      : null;

  const handleCopyCode = async (code: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeIdx(idx);
      setTimeout(() => setCopiedCodeIdx(null), 2000);
    } catch {
      setCopiedCodeIdx(idx);
      setTimeout(() => setCopiedCodeIdx(null), 2000);
    }
  };

  const handleCopyBibtex = async () => {
    try {
      await navigator.clipboard.writeText(article.bibtex);
      setCopiedBibtex(true);
      setTimeout(() => setCopiedBibtex(false), 2000);
    } catch {
      setCopiedBibtex(true);
      setTimeout(() => setCopiedBibtex(false), 2000);
    }
  };

  return (
    <article
      data-ui="paper-blog-viewer"
      className="w-full bg-white text-[#1d1d1f] space-y-12"
    >
      {/* 1. 顶部控制栏 (Apple 极简透白，带返回图谱与 AI 问答) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
        <button
          type="button"
          onClick={onBackToGraph}
          className="inline-flex items-center gap-2 text-[14px] font-medium text-[#0071e3] hover:underline cursor-pointer"
        >
          <span>←</span>
          <span>{lang === "en" ? "Back to Knowledge Graph" : "返回学术知识图谱"}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onAskAi(article.title)}
            className="rounded-full bg-[#0071e3] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[#0077ed] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span className="h-2 w-2 rounded-full bg-white" />
            <span>{lang === "en" ? "Ask AI About This Paper" : "向 AI 助手解析本文"}</span>
          </button>
        </div>
      </div>

      {/* 2. 封面与大标题区 */}
      <header className="space-y-6 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#515154]">
          <span className="rounded-full bg-[#f5f5f7] px-3 py-1 font-semibold text-[#0071e3]">
            {article.category}
          </span>
          <span>·</span>
          <span className="font-medium text-[#1d1d1f]">{article.venue}</span>
          <span>·</span>
          <span>{article.date}</span>
          <span>·</span>
          <span>{article.readTime}</span>
        </div>

        <h1 className="text-[32px] sm:text-[44px] lg:text-[50px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.12]">
          {lang === "en" ? article.title : article.titleZh}
        </h1>

        <div className="text-[18px] sm:text-[20px] text-[#515154] leading-relaxed font-normal">
          {lang === "en" ? article.summaryEn : article.summaryZh}
        </div>

        {/* 作者与机构 */}
        <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-[#515154]">
          <div>
            <span className="font-semibold text-[#1d1d1f]">
              {lang === "en" ? "Organization: " : "研究机构: "}
            </span>
            <span>{article.org}</span>
          </div>
          <div>
            <span className="font-semibold text-[#1d1d1f]">
              {lang === "en" ? "Reference: " : "论文归档: "}
            </span>
            <a
              href="https://arxiv.org"
              target="_blank"
              rel="noreferrer"
              className="text-[#0071e3] hover:underline"
            >
              {article.arxiv} ↗
            </a>
          </div>
        </div>
      </header>

      {/* 3. 宽幅学术封面图 */}
      <div className="relative aspect-[21/9] w-full max-h-[460px] overflow-hidden rounded-[28px] bg-[#f5f5f7]">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-white/90 p-4 text-[13px] text-[#515154] flex items-center justify-between">
          <span className="font-medium text-[#1d1d1f]">{article.titleZh}</span>
          <span className="text-[#0071e3]">{article.venue}</span>
        </div>
      </div>

      {/* 4. 双栏主体阅读区 (正文 8 列 + 侧边大纲与关联文章 4 列) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-4">
        {/* 左侧正文 */}
        <div className="lg:col-span-8 space-y-12">
          {article.sections.map((sec, sIdx) => (
            <section key={sIdx} id={`section-${sIdx}`} className="space-y-4">
              <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#1d1d1f] tracking-tight">
                {lang === "en" ? sec.titleEn : sec.titleZh}
              </h2>

              <div className="space-y-3 text-[16px] sm:text-[17px] text-[#515154] leading-[1.75]">
                {(lang === "en" ? sec.contentEn : sec.contentZh).map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>

              {/* 核心 Callout 标注 */}
              {sec.callout && (
                <div className="rounded-[22px] bg-[#f5f5f7] p-6 space-y-2 border-l-4 border-[#0071e3]">
                  <div className="text-[14px] font-semibold text-[#0071e3]">
                    {sec.callout.title}
                  </div>
                  <p className="text-[14px] text-[#1d1d1f] leading-relaxed">
                    {sec.callout.text}
                  </p>
                </div>
              )}

              {/* 架构伪代码/核心代码块 */}
              {sec.codeBlock && (
                <div className="rounded-[24px] bg-[#f5f5f7] p-5 space-y-3">
                  <div className="flex items-center justify-between text-[13px] text-[#86868b]">
                    <span className="font-semibold text-[#1d1d1f] uppercase tracking-wider">
                      {sec.codeBlock.language} · Architecture Implementation
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(sec.codeBlock!.code, sIdx)}
                      className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition cursor-pointer"
                    >
                      {copiedCodeIdx === sIdx
                        ? (lang === "en" ? "Copied!" : "已复制!")
                        : (lang === "en" ? "Copy Code" : "复制代码")}
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-[18px] bg-[#1d1d1f] p-5 text-[13px] text-[#f5f5f7] leading-relaxed">
                    <pre className="m-0 whitespace-pre">
                      <code>{sec.codeBlock.code}</code>
                    </pre>
                  </div>
                </div>
              )}
            </section>
          ))}

          {/* 定量消融实验对比表 (SOTA Benchmarks) */}
          {article.benchmarks.length > 0 && (
            <section id="benchmarks" className="space-y-4 pt-4">
              <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#1d1d1f] tracking-tight">
                {lang === "en" ? "Empirical Benchmarks & Ablations" : "定量消融实验与基准测试对比"}
              </h2>
              <div className="overflow-hidden rounded-[22px] bg-[#f5f5f7]">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-[#e8e8ed] text-[13px] font-semibold text-[#515154]">
                    <tr>
                      <th className="p-4">{lang === "en" ? "Evaluation Metric" : "评测维度"}</th>
                      <th className="p-4">{lang === "en" ? "Baseline" : "基线标准"}</th>
                      <th className="p-4">{lang === "en" ? "This Paper (SOTA)" : "本项成果 (SOTA)"}</th>
                      <th className="p-4">{lang === "en" ? "Relative Gain" : "性能提升"}</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#1d1d1f]">
                    {article.benchmarks.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white/50" : ""}>
                        <td className="p-4 font-semibold text-[#1d1d1f]">{row.metric}</td>
                        <td className="p-4 text-[#515154]">{row.baseline}</td>
                        <td className="p-4 font-semibold text-[#0071e3]">{row.paperSota}</td>
                        <td className="p-4 font-semibold text-[#34c759]">{row.improvement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* BibTeX 引用区 */}
          <section id="bibtex" className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-[#1d1d1f]">
                {lang === "en" ? "Cite This Work" : "学术引用 (BibTeX)"}
              </h2>
              <button
                type="button"
                onClick={handleCopyBibtex}
                className="rounded-full bg-[#f5f5f7] px-4 py-1 text-[13px] font-medium text-[#0071e3] hover:bg-[#e8e8ed] transition cursor-pointer"
              >
                {copiedBibtex
                  ? (lang === "en" ? "Copied!" : "已复制!")
                  : (lang === "en" ? "Copy BibTeX" : "复制 BibTeX")}
              </button>
            </div>
            <div className="overflow-x-auto rounded-[20px] bg-[#1d1d1f] p-5 text-[12px] sm:text-[13px] text-[#f5f5f7]">
              <pre className="m-0 whitespace-pre">
                <code>{article.bibtex}</code>
              </pre>
            </div>
          </section>

          {/* 上一篇 / 下一篇博客连续研读导航 */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevArticle ? (
              <button
                type="button"
                onClick={() => onSelectArticle(prevArticle)}
                className="rounded-[22px] bg-[#f5f5f7] p-5 text-left space-y-1 hover:bg-[#e8e8ed] transition cursor-pointer"
              >
                <div className="text-[12px] font-semibold text-[#86868b]">
                  {lang === "en" ? "← Previous Deep-Dive" : "← 上一篇深度研读"}
                </div>
                <div className="text-[15px] font-semibold text-[#1d1d1f] line-clamp-1">
                  {lang === "en" ? prevArticle.title : prevArticle.titleZh}
                </div>
              </button>
            ) : <div />}

            {nextArticle ? (
              <button
                type="button"
                onClick={() => onSelectArticle(nextArticle)}
                className="rounded-[22px] bg-[#f5f5f7] p-5 text-right space-y-1 hover:bg-[#e8e8ed] transition cursor-pointer"
              >
                <div className="text-[12px] font-semibold text-[#86868b]">
                  {lang === "en" ? "Next Deep-Dive →" : "下一篇深度研读 →"}
                </div>
                <div className="text-[15px] font-semibold text-[#0071e3] line-clamp-1">
                  {lang === "en" ? nextArticle.title : nextArticle.titleZh}
                </div>
              </button>
            ) : <div />}
          </div>
        </div>

        {/* 右侧：文章目录大纲与关联推荐 (4 列) */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="sticky top-24 space-y-6">
            {/* 文章目录大纲 */}
            <div className="rounded-[24px] bg-[#f5f5f7] p-6 space-y-3">
              <div className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">
                {lang === "en" ? "ARTICLE OUTLINE" : "文章目录大纲"}
              </div>
              <ul className="space-y-2 text-[14px] p-0 list-none text-[#515154]">
                {article.sections.map((sec, idx) => (
                  <li key={idx}>
                    <a
                      href={`#section-${idx}`}
                      className="hover:text-[#0071e3] transition no-underline block line-clamp-1"
                    >
                      {lang === "en" ? sec.titleEn : sec.titleZh}
                    </a>
                  </li>
                ))}
                {article.benchmarks.length > 0 && (
                  <li>
                    <a
                      href="#benchmarks"
                      className="hover:text-[#0071e3] transition no-underline block"
                    >
                      {lang === "en" ? "Empirical Benchmarks" : "消融实验对比"}
                    </a>
                  </li>
                )}
                <li>
                  <a
                    href="#bibtex"
                    className="hover:text-[#0071e3] transition no-underline block"
                  >
                    {lang === "en" ? "Citation (BibTeX)" : "引用信息"}
                  </a>
                </li>
              </ul>
            </div>

            {/* AI 助手快捷提问卡片 */}
            <div className="rounded-[24px] bg-[#f5f5f7] p-6 space-y-3">
              <div className="text-[14px] font-semibold text-[#1d1d1f]">
                {lang === "en" ? "Interact with AI Copilot" : "向 AI 助手提问本文"}
              </div>
              <p className="text-[13px] text-[#515154] leading-relaxed">
                {lang === "en"
                  ? "Ask questions regarding mathematical formulations, hardware requirements, or integration into TERRA-OASIS."
                  : "针对本文中的数学公式推导、硬件显存开销或如何集成至 TERRA-OASIS 引擎向 AI 实时提问。"}
              </p>
              <button
                type="button"
                onClick={() => onAskAi(article.title)}
                className="w-full rounded-full bg-[#0071e3] py-2 text-[13px] font-medium text-white hover:bg-[#0077ed] transition text-center cursor-pointer"
              >
                {lang === "en" ? "Start Q&A on this Paper" : "开始论文问答"}
              </button>
            </div>

            {/* 更多精选学术博客卡片 */}
            <div className="rounded-[24px] bg-[#f5f5f7] p-6 space-y-3">
              <div className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">
                {lang === "en" ? "OTHER SELECTED BLOGS" : "其他精选学术长文"}
              </div>
              <div className="space-y-3 pt-1">
                {WORLD_MODEL_BLOG_ARTICLES.filter((a) => a.id !== article.id)
                  .slice(0, 3)
                  .map((other) => (
                    <button
                      key={other.id}
                      type="button"
                      onClick={() => onSelectArticle(other)}
                      className="w-full text-left space-y-1 p-3 rounded-[16px] bg-white hover:bg-[#e8e8ed] transition cursor-pointer"
                    >
                      <div className="text-[12px] text-[#0071e3] font-medium">
                        {other.venue}
                      </div>
                      <div className="text-[13px] font-semibold text-[#1d1d1f] line-clamp-2">
                        {lang === "en" ? other.title : other.titleZh}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
