"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { WorldModelPaper } from "@/lib/world-model-papers-100";

interface PaperReaderDrawerProps {
  paper: WorldModelPaper | null;
  isOpen: boolean;
  onClose: () => void;
  onAskAi: (paperTitle: string) => void;
}

export function PaperReaderDrawer({
  paper,
  isOpen,
  onClose,
  onAskAi,
}: PaperReaderDrawerProps) {
  const { lang } = useLanguage();
  const [copiedBibtex, setCopiedBibtex] = useState(false);

  if (!isOpen || !paper) return null;

  const handleCopyBibtex = async () => {
    try {
      await navigator.clipboard.writeText(paper.bibtex);
      setCopiedBibtex(true);
      setTimeout(() => setCopiedBibtex(false), 2000);
    } catch {
      setCopiedBibtex(true);
      setTimeout(() => setCopiedBibtex(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 右侧滑出面板：Apple 纯白高质感沉浸阅读器 */}
      <aside
        data-ui="paper-reader"
        aria-label="Full Paper Reader"
        className="relative z-10 w-full max-w-xl sm:max-w-2xl h-full bg-white flex flex-col justify-between overflow-hidden"
      >
        {/* 顶部工具栏 */}
        <div className="p-6 bg-[#f5f5f7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white px-3 py-0.5 text-[12px] font-semibold text-[#0071e3]">
              {lang === "en" ? paper.categoryNameEn : paper.categoryNameZh}
            </span>
            <span className="text-[13px] text-[#515154]">{paper.venue}</span>
            <span className="text-[13px] text-[#86868b]">·</span>
            <span className="text-[13px] text-[#86868b]">{paper.year}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAskAi(paper.title)}
              className="rounded-full bg-[#0071e3] px-3.5 py-1 text-[13px] font-medium text-white hover:bg-[#0077ed] transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{lang === "en" ? "Ask AI Copilot" : "向 AI 助手提问"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white px-3 py-1 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition cursor-pointer"
            >
              {lang === "en" ? "Close" : "关闭"}
            </button>
          </div>
        </div>

        {/* 论文正文阅读滚动区 */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* 标题与作者机构 */}
          <div className="space-y-3">
            <h1 className="text-[24px] sm:text-[30px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.18]">
              {paper.title}
            </h1>
            <div className="text-[18px] text-[#515154] font-medium">
              {paper.titleZh}
            </div>
            <div className="text-[14px] text-[#515154] pt-1">
              <span className="font-semibold text-[#1d1d1f]">Organizations / Authors: </span>
              <span>{paper.org}</span>
            </div>
            <div className="text-[13px] text-[#86868b]">
              <span>Preprint Reference: </span>
              <a
                href="https://arxiv.org"
                target="_blank"
                rel="noreferrer"
                className="text-[#0071e3] hover:underline"
              >
                {paper.arxiv} ↗
              </a>
            </div>
          </div>

          {/* 核心创新与学术亮点 Callout */}
          <div className="rounded-[20px] bg-[#f5f5f7] p-5 space-y-1.5 border-l-4 border-[#0071e3]">
            <div className="text-[13px] font-semibold text-[#0071e3]">
              {lang === "en" ? "Key Innovation & Breakthrough" : "核心理论与定量突破亮点"}
            </div>
            <p className="text-[14px] text-[#1d1d1f] leading-relaxed">
              {paper.highlight}
            </p>
          </div>

          {/* 论文完整中英文摘要 */}
          <div className="space-y-3">
            <h2 className="text-[18px] font-semibold text-[#1d1d1f]">
              {lang === "en" ? "Abstract" : "学术摘要 (Abstract)"}
            </h2>
            <div className="rounded-[20px] bg-[#f5f5f7] p-6 space-y-4 text-[14px] leading-relaxed text-[#515154]">
              <p className="italic text-[#1d1d1f]">{paper.abstract}</p>
              <div className="pt-2 text-[#515154]">{paper.abstractZh}</div>
            </div>
          </div>

          {/* 深度原理解读 */}
          <div className="space-y-3">
            <h2 className="text-[18px] font-semibold text-[#1d1d1f]">
              {lang === "en" ? "Technical Architecture & Significance" : "世界模型架构机制与学术价值"}
            </h2>
            <div className="space-y-3 text-[14px] text-[#515154] leading-relaxed">
              <p>
                {lang === "en"
                  ? `This publication represents a milestone in the evolution of ${paper.categoryNameEn}. By formalizing next-step environmental rollout as an action-conditioned continuous generative process, the authors demonstrate that causal neural simulation can emerge persistent intuitive physics without classical analytical graphics rendering pipelines.`
                  : `本项成果在【${paper.categoryNameZh}】领域树立了重要里程碑。论文将物理时空演进形式化为动作条件驱动的连续自回归因果推演过程，证实神经网络在脱离传统三维多边形资产绑定的前提下，能够自发涌现长程物理自洽性与多视角一致性。`}
              </p>
              <p>
                {lang === "en"
                  ? `In relation to TERRA-OASIS, the methodologies explored in this paper directly inform our 14B Causal DiT backbone, spatial memory caching, and low-latency WebGPU edge shader decoders.`
                  : `在与 TERRA-OASIS 开源体系的协同上，该研究所验证的自回归因果注意机制与时空潜流形表征，为我们的 140 亿参数 Causal DiT 骨干网络、时空滑动记忆缓存以及 WebGPU 边缘端推流提供了关键的技术支撑。`}
              </p>
            </div>
          </div>

          {/* BibTeX 引用代码框 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#1d1d1f]">
                {lang === "en" ? "BibTeX Citation" : "学术文献引用 (BibTeX)"}
              </h2>
              <button
                type="button"
                onClick={handleCopyBibtex}
                className="rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[12px] font-medium text-[#0071e3] hover:bg-[#e8e8ed] transition cursor-pointer"
              >
                {copiedBibtex ? (lang === "en" ? "Copied!" : "已复制!") : (lang === "en" ? "Copy BibTeX" : "复制引用")}
              </button>
            </div>
            <pre className="rounded-[16px] bg-[#f5f5f7] p-4 text-[12px] text-[#515154] overflow-x-auto m-0">
              <code>{paper.bibtex}</code>
            </pre>
          </div>
        </div>

        {/* 底部行动栏 */}
        <div className="p-4 bg-[#f5f5f7] flex items-center justify-between gap-3">
          <a
            href="https://arxiv.org"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white px-5 py-2 text-[14px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition no-underline"
          >
            {lang === "en" ? "Open Full PDF on arXiv ↗" : "在 arXiv 阅读原始论文 PDF ↗"}
          </a>

          <button
            type="button"
            onClick={() => onAskAi(paper.title)}
            className="rounded-full bg-[#0071e3] px-5 py-2 text-[14px] font-medium text-white hover:bg-[#0077ed] transition cursor-pointer"
          >
            {lang === "en" ? "Ask Copilot AI About Paper" : "向 AI 深度问答此论文"}
          </button>
        </div>
      </aside>
    </div>
  );
}
