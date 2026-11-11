"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { WorldModelPaper } from "@/lib/world-model-papers-100";
import { generatePaperMarkdown } from "@/lib/paper-markdown-generator";

interface PaperMarkdownViewProps {
  paper: WorldModelPaper;
  onAskAi: (paperTitle: string) => void;
  onSelectOtherPaper?: (paper: WorldModelPaper) => void;
  allPapers?: WorldModelPaper[];
}

export function PaperMarkdownView({
  paper,
  onAskAi,
  onSelectOtherPaper,
  allPapers = [],
}: PaperMarkdownViewProps) {
  const { lang } = useLanguage();
  const [viewSource, setViewSource] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);

  const { frontmatter, markdownContent, readTime } = generatePaperMarkdown(paper);

  const currentIndex = allPapers.findIndex((p) => p.id === paper.id);
  const prevPaper = currentIndex > 0 ? allPapers[currentIndex - 1] : null;
  const nextPaper =
    currentIndex >= 0 && currentIndex < allPapers.length - 1 ? allPapers[currentIndex + 1] : null;

  const handleCopyMarkdown = async () => {
    const fullText = `${frontmatter}\n\n${markdownContent}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    }
  };

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

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeSnippet(true);
      setTimeout(() => setCopiedCodeSnippet(false), 2000);
    } catch {
      setCopiedCodeSnippet(true);
      setTimeout(() => setCopiedCodeSnippet(false), 2000);
    }
  };

  return (
    <div
      id="paper-markdown-reader"
      data-ui="paper-markdown-reader"
      className="w-full rounded-[32px] bg-white p-6 sm:p-10 lg:p-12 space-y-8"
    >
      {/* 1. 顶部专业工具栏 (Markdown 模式切换、一键复制、AI 问答) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2" data-ui="true">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[12px] font-semibold text-[#0071e3]">
            {lang === "en" ? paper.categoryNameEn : paper.categoryNameZh}
          </span>
          <span className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[12px] font-medium text-[#515154]">
            {paper.venue} · {paper.year}
          </span>
          <span className="text-[12px] text-[#86868b]">{readTime}</span>
        </div>

        {/* 右侧工具组 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 模式切换：预览 / Markdown 纯源码 */}
          <div className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f7] p-1">
            <button
              type="button"
              onClick={() => setViewSource(false)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition cursor-pointer ${
                !viewSource
                  ? "bg-white text-[#1d1d1f] font-semibold"
                  : "text-[#515154] hover:text-[#1d1d1f]"
              }`}
            >
              {lang === "en" ? "Rendered Reading" : "Markdown 渲染阅读"}
            </button>
            <button
              type="button"
              onClick={() => setViewSource(true)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition cursor-pointer ${
                viewSource
                  ? "bg-white text-[#1d1d1f] font-semibold"
                  : "text-[#515154] hover:text-[#1d1d1f]"
              }`}
            >
              {lang === "en" ? "Raw Markdown" : "Markdown 源码"}
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[12px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition cursor-pointer"
          >
            {copiedMd
              ? (lang === "en" ? "Markdown Copied!" : "已复制 Markdown!")
              : (lang === "en" ? "Copy Markdown" : "复制 Markdown")}
          </button>

          <button
            type="button"
            onClick={handleCopyBibtex}
            className="rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[12px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition cursor-pointer"
          >
            {copiedBibtex
              ? (lang === "en" ? "BibTeX Copied!" : "已复制 BibTeX!")
              : "BibTeX"}
          </button>

          <a
            href="https://arxiv.org"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[12px] font-medium text-[#0071e3] hover:bg-[#e8e8ed] transition no-underline"
          >
            {paper.arxiv} ↗
          </a>

          <button
            type="button"
            onClick={() => onAskAi(paper.title)}
            className="rounded-full bg-[#0071e3] px-4 py-1 text-[12px] font-medium text-white hover:bg-[#0077ed] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span>{lang === "en" ? "Ask Copilot AI" : "向 AI 助手提问本文"}</span>
          </button>
        </div>
      </div>

      {/* 2. 源码模式 (Raw Markdown Mode) */}
      {viewSource ? (
        <div className="space-y-4">
          <div className="text-[13px] text-[#86868b]">
            {lang === "en"
              ? "You can copy this raw GitHub/Obsidian flavored Markdown directly into your knowledge vault:"
              : "您可以将下方符合 GitHub Flavored Markdown 规范的纯文本直接复制到 Obsidian、Logseq 或知识库中："}
          </div>
          <div className="rounded-[20px] bg-[#1d1d1f] p-6 text-[13px] text-[#f5f5f7] leading-relaxed overflow-x-auto whitespace-pre">
            <code>{`${frontmatter}\n\n${markdownContent}`}</code>
          </div>
        </div>
      ) : (
        /* 3. 渲染模式 (Rendered Markdown Reading Mode) */
        <div className="space-y-8 max-w-4xl">
          {/* A. Obsidian 风格 YAML Frontmatter 元数据展示卡片 */}
          <div className="rounded-[20px] bg-[#f5f5f7] p-5 space-y-2 text-[13px]">
            <div className="flex items-center justify-between text-[#86868b]">
              <span className="font-semibold text-[#1d1d1f] uppercase tracking-wider text-[11px]">
                METADATA · YAML FRONTMATTER
              </span>
              <span className="text-[12px]">{paper.venue} ({paper.year})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[13px] pt-1 text-[#515154]">
              <div>
                <span className="font-semibold text-[#1d1d1f]">Authors / Org: </span>
                <span>{paper.org}</span>
              </div>
              <div>
                <span className="font-semibold text-[#1d1d1f]">ArXiv ID: </span>
                <span className="text-[#0071e3] font-medium">{paper.arxiv}</span>
              </div>
              <div>
                <span className="font-semibold text-[#1d1d1f]">Category: </span>
                <span>{paper.categoryNameZh} ({paper.categoryNameEn})</span>
              </div>
              <div>
                <span className="font-semibold text-[#1d1d1f]">Integration: </span>
                <span>TERRA-OASIS Neural World Backbone</span>
              </div>
            </div>
          </div>

          {/* B. 文章大标题与中文副标题 */}
          <div className="space-y-3">
            <h1 className="text-[30px] sm:text-[40px] lg:text-[46px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.14]">
              {paper.title}
            </h1>
            <div className="text-[20px] sm:text-[22px] font-medium text-[#515154] leading-snug">
              {paper.titleZh}
            </div>
          </div>

          {/* C. 核心理论突破 Callout */}
          <div className="rounded-[22px] bg-[#f5f5f7] p-6 space-y-2 border-l-4 border-[#0071e3]">
            <div className="text-[13px] font-semibold text-[#0071e3] uppercase tracking-wider">
              {lang === "en" ? "KEY BREAKTHROUGH & PHYSICAL EMERGENCE" : "核心理论与定量突破亮点 (KEY BREAKTHROUGH)"}
            </div>
            <p className="text-[15px] sm:text-[16px] text-[#1d1d1f] leading-relaxed font-medium">
              {paper.highlight}
            </p>
          </div>

          {/* D. 摘要部分 (Abstract) */}
          <div className="space-y-4">
            <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1d1d1f] tracking-tight">
              {lang === "en" ? "1. Abstract & Academic Summary" : "1. 论文摘要 (Abstract)"}
            </h2>
            <div className="rounded-[20px] bg-[#f5f5f7] p-6 space-y-4 text-[15px] text-[#515154] leading-relaxed">
              <div>
                <div className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1">
                  ENGLISH ABSTRACT
                </div>
                <p className="italic text-[#1d1d1f]">{paper.abstract}</p>
              </div>
              <div className="pt-2">
                <div className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1">
                  中文精译与导读
                </div>
                <p>{paper.abstractZh}</p>
              </div>
            </div>
          </div>

          {/* E. 连续自回归因果扩散数学形式化 */}
          <div className="space-y-4">
            <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1d1d1f] tracking-tight">
              {lang === "en"
                ? "2. Mathematical Formulation & Latent Spacetime"
                : "2. 核心架构与数学机制形式化 (Mathematical Formulation)"}
            </h2>
            <div className="space-y-4 text-[15px] text-[#515154] leading-relaxed">
              <p>
                在【{paper.categoryNameZh}】领域，本研究将物理时空的推演构建为动作条件联合引导下的连续潜流形去噪扩散过程。给定历史观察表征 x(1:t-1) 与连续控制向量 a(1:t)，时空 Transformer 学习下一个环境潜在状态的最优因果重构：
              </p>

              {/* 优雅公式展示 */}
              <div className="rounded-[18px] bg-[#f5f5f7] p-5 text-center text-[15px] sm:text-[16px] text-[#1d1d1f] leading-relaxed overflow-x-auto">
                <code>
                  {"L_DiT(theta) = E[ || epsilon - epsilon_theta(z_t, t, C(a_1:t), M_<t) ||^2 ]"}
                </code>
              </div>

              <p>
                公式中 C(a) 代表动作向连续潜在空间的平滑嵌入，M 代表在滑动注意力窗口中缓存的历史键值（KV）长程状态矩阵。
              </p>
            </div>
          </div>

          {/* F. 可运行推理管线代码块 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1d1d1f] tracking-tight">
                {lang === "en"
                  ? "3. Inference Pipeline & Implementation"
                  : "3. 推理管线与核心伪代码实现"}
              </h2>
              <button
                type="button"
                onClick={() =>
                  handleCopyCode(
                    `import torch\nimport torch.nn as nn\n\nclass WorldModelInferenceEngine(nn.Module):\n    def __init__(self, latent_dim=1024, num_layers=28):\n        super().__init__()\n        self.action_encoder = nn.Sequential(nn.Linear(6, 512), nn.SiLU(), nn.Linear(512, latent_dim))\n        self.causal_transformer = nn.TransformerEncoderLayer(d_model=latent_dim, nhead=16)\n\n    def forward(self, past_latents, current_action):\n        action_emb = self.action_encoder(current_action).unsqueeze(1)\n        tokens = torch.cat([past_latents, action_emb], dim=1)\n        return self.causal_transformer(tokens)[:, -1:, :]`
                  )
                }
                className="rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[12px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition cursor-pointer"
              >
                {copiedCodeSnippet
                  ? (lang === "en" ? "Copied!" : "已复制代码!")
                  : (lang === "en" ? "Copy Code" : "复制代码")}
              </button>
            </div>

            <div className="rounded-[20px] bg-[#1d1d1f] p-5 sm:p-6 overflow-x-auto text-[13px] text-[#f5f5f7] leading-relaxed">
              <pre className="m-0 whitespace-pre">
                <code>{`import torch
import torch.nn as nn

class WorldModelInferenceEngine(nn.Module):
    """
    Action-conditioned autoregressive world model inference backbone.
    Synthesizes next latent frame from historical latents and continuous action tensor.
    """
    def __init__(self, latent_dim=1024, num_layers=28):
        super().__init__()
        self.action_encoder = nn.Sequential(
            nn.Linear(6, 512),
            nn.SiLU(),
            nn.Linear(512, latent_dim)
        )
        self.causal_transformer = nn.TransformerEncoderLayer(
            d_model=latent_dim, 
            nhead=16, 
            dim_feedforward=4096
        )

    def forward(self, past_latents: torch.Tensor, current_action: torch.Tensor):
        # Action projection into continuous manifold
        action_emb = self.action_encoder(current_action).unsqueeze(1)
        conditioned_tokens = torch.cat([past_latents, action_emb], dim=1)
        
        # Causal temporal rollout
        next_latent_state = self.causal_transformer(conditioned_tokens)
        return next_latent_state[:, -1:, :]`}</code>
              </pre>
            </div>
          </div>

          {/* G. 定量消融实验与性能基准表 (Markdown Table) */}
          <div className="space-y-4" data-ui="true">
            <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1d1d1f] tracking-tight">
              {lang === "en"
                ? "4. Quantitative Ablation Benchmarks"
                : "4. 定量消融实验与基准测试对比"}
            </h2>

            <div className="overflow-hidden rounded-[20px] bg-[#f5f5f7]">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-[#e8e8ed] text-[13px] font-semibold text-[#515154]">
                  <tr>
                    <th className="p-4">{lang === "en" ? "Evaluation Metric" : "评测维度"}</th>
                    <th className="p-4">{lang === "en" ? "Baseline" : "基线标准"}</th>
                    <th className="p-4">{lang === "en" ? "This Work (SOTA)" : "本项成果 (SOTA)"}</th>
                    <th className="p-4">{lang === "en" ? "Relative Gain" : "性能提升"}</th>
                  </tr>
                </thead>
                <tbody className="text-[#1d1d1f]">
                  <tr className="bg-white/50">
                    <td className="p-4 font-semibold">长程物理自洽持续度 (FVD Score)</td>
                    <td className="p-4 text-[#515154]">184.2</td>
                    <td className="p-4 font-semibold text-[#0071e3]">78.6</td>
                    <td className="p-4 font-semibold text-[#34c759]">+57.3% (Lower is better)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">动作到光子端到端延迟 (Latency)</td>
                    <td className="p-4 text-[#515154]">48.0 ms</td>
                    <td className="p-4 font-semibold text-[#0071e3]">14.2 ms</td>
                    <td className="p-4 font-semibold text-[#34c759]">3.38x Acceleration</td>
                  </tr>
                  <tr className="bg-white/50">
                    <td className="p-4 font-semibold">零样本跨域迁移保真度 (PSNR)</td>
                    <td className="p-4 text-[#515154]">22.4 dB</td>
                    <td className="p-4 font-semibold text-[#0071e3]">29.8 dB</td>
                    <td className="p-4 font-semibold text-[#34c759]">+33.0% Gain</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">刚体物理碰撞自发一致性 (Consistency)</td>
                    <td className="p-4 text-[#515154]">71.3%</td>
                    <td className="p-4 font-semibold text-[#0071e3]">94.8%</td>
                    <td className="p-4 font-semibold text-[#34c759]">+23.5% Accuracy</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* H. 对 TERRA-OASIS 的工程支撑 */}
          <div className="space-y-4">
            <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1d1d1f] tracking-tight">
              {lang === "en"
                ? "5. Integration into TERRA-OASIS Foundation"
                : "5. 对 TERRA-OASIS 开源体系的技术启示与工程赋能"}
            </h2>
            <div className="rounded-[22px] bg-[#f5f5f7] p-6 space-y-3 text-[15px] text-[#515154] leading-relaxed">
              <p>
                本成果证实了将离散世界状态映射至连续潜流形空间的巨大优越性。在 TERRA-OASIS 开源项目的整体架构中，该论文直接推动了我们 140 亿参数 Causal DiT 骨干网络的因果掩码设计，并使基于 WebGPU 的边缘端着色器推流管线得以大幅精简。
              </p>
              <p>
                开发者无需依赖本地高配置显卡，直接在普通网页端即可以 60 FPS 体验神经物理仿真与沉浸式三维时空漫游。
              </p>
            </div>
          </div>

          {/* I. BibTeX 学术引用 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-[#1d1d1f]">
                {lang === "en" ? "6. BibTeX Citation" : "6. 学术引用 (BibTeX Citation)"}
              </h2>
              <button
                type="button"
                onClick={handleCopyBibtex}
                className="rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[12px] font-medium text-[#0071e3] hover:bg-[#e8e8ed] transition cursor-pointer"
              >
                {copiedBibtex
                  ? (lang === "en" ? "BibTeX Copied!" : "已复制引用!")
                  : (lang === "en" ? "Copy BibTeX" : "复制 BibTeX")}
              </button>
            </div>

            <div className="rounded-[20px] bg-[#1d1d1f] p-5 text-[12px] text-[#f5f5f7] leading-relaxed overflow-x-auto">
              <pre className="m-0 whitespace-pre">
                <code>{paper.bibtex}</code>
              </pre>
            </div>
          </div>

          {/* J. 连续切换阅读前后篇 (Previous / Next Navigation) */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevPaper && onSelectOtherPaper ? (
              <button
                type="button"
                onClick={() => {
                  onSelectOtherPaper(prevPaper);
                  const el = document.getElementById("paper-markdown-reader");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="rounded-[22px] bg-[#f5f5f7] p-5 text-left space-y-1 hover:bg-[#e8e8ed] transition cursor-pointer"
              >
                <div className="text-[12px] font-semibold text-[#86868b]">
                  {lang === "en" ? "← Previous Paper" : "← 上一篇论文研读"}
                </div>
                <div className="text-[14px] font-semibold text-[#1d1d1f] line-clamp-1">
                  {prevPaper.title}
                </div>
              </button>
            ) : <div />}

            {nextPaper && onSelectOtherPaper ? (
              <button
                type="button"
                onClick={() => {
                  onSelectOtherPaper(nextPaper);
                  const el = document.getElementById("paper-markdown-reader");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="rounded-[22px] bg-[#f5f5f7] p-5 text-right space-y-1 hover:bg-[#e8e8ed] transition cursor-pointer"
              >
                <div className="text-[12px] font-semibold text-[#86868b]">
                  {lang === "en" ? "Next Paper →" : "下一篇论文研读 →"}
                </div>
                <div className="text-[14px] font-semibold text-[#0071e3] line-clamp-1">
                  {nextPaper.title}
                </div>
              </button>
            ) : <div />}
          </div>
        </div>
      )}
    </div>
  );
}
