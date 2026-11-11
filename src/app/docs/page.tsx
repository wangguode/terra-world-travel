"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { OFFICIAL_DOCS, DocSection } from "@/lib/oasis-docs-data";
import { AppleHeader } from "@/components/apple-header";
import { AppleFooter } from "@/components/apple-footer";
import { CopilotDrawer } from "@/components/copilot-drawer";

function DocsContent() {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const initialSec = searchParams.get("sec") || "getting-started";

  const [activeDocId, setActiveDocId] = useState<string>(initialSec);
  const [activeCodeTab, setActiveCodeTab] = useState<"python" | "typescript" | "bash">("python");
  const [copiedCode, setCopiedCode] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState("");

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
  }, [activeDocId, lang]);

  const currentIndex = OFFICIAL_DOCS.findIndex((d) => d.id === activeDocId);
  const currentDoc: DocSection = currentIndex >= 0 ? OFFICIAL_DOCS[currentIndex] : OFFICIAL_DOCS[0];
  const prevDoc: DocSection | null = currentIndex > 0 ? OFFICIAL_DOCS[currentIndex - 1] : null;
  const nextDoc: DocSection | null = currentIndex < OFFICIAL_DOCS.length - 1 ? OFFICIAL_DOCS[currentIndex + 1] : null;

  const categories = ["Guides", "Architecture", "Protocols", "Deployment"] as const;

  const filteredDocs = OFFICIAL_DOCS.filter((doc) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q) ||
      doc.summaryEn.toLowerCase().includes(q) ||
      doc.summaryZh.toLowerCase().includes(q)
    );
  });

  const activeSnippet =
    currentDoc.codeTabs[activeCodeTab] ||
    currentDoc.codeTabs.python ||
    currentDoc.codeTabs.bash ||
    currentDoc.codeTabs.typescript ||
    "";

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(activeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleAskAiAboutTopic = () => {
    setCopilotQuery(
      lang === "en"
        ? `Explain the implementation details and parameters for "${currentDoc.title}" in TERRA-OASIS`
        : `请详细解析 TERRA-OASIS 文档【${currentDoc.title}】的实现机制、参数规范与调用范例`
    );
    setCopilotOpen(true);
  };

  return (
    <div className="min-h-[100dvh] bg-white text-[#1d1d1f] flex flex-col justify-between overflow-x-hidden selection:bg-[#0071e3] selection:text-white">
      {/* 1. 统一 Apple 白昼磨砂玻璃全局导航 */}
      <AppleHeader
        onOpenCopilot={() => {
          setCopilotQuery("");
          setCopilotOpen(true);
        }}
      />

      {/* 2. Apple 极简纯净副导航 (彻底告别厚重灰横条，采用自然透白与留白) */}
      <div className="bg-white px-6 sm:px-8 py-3 text-[13px] text-[#515154] w-full sticky top-12 z-20">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#0071e3] transition no-underline text-[#515154]">
              TERRA-OASIS
            </Link>
            <span className="text-[#d2d2d7]">/</span>
            <Link href="/docs" className="hover:text-[#0071e3] transition no-underline text-[#515154]">
              {lang === "en" ? "Developer Documentation" : "开发者技术文档中心"}
            </Link>
            <span className="text-[#d2d2d7]">/</span>
            <span className="text-[#86868b]">{currentDoc.category}</span>
            <span className="text-[#d2d2d7]">/</span>
            <span className="text-[#1d1d1f] font-medium truncate max-w-xs">{currentDoc.title}</span>
          </nav>

          <button
            type="button"
            onClick={handleAskAiAboutTopic}
            className="rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[12px] font-medium text-[#0071e3] hover:bg-[#e8e8ed] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#0071e3]" />
            <span>{lang === "en" ? "Ask AI About This Topic" : "向 AI 询问本篇文档 ↗"}</span>
          </button>
        </div>
      </div>

      {/* 3. 彻底重塑的现代化高星知识库文档阅读系统 (Stripe / Apple Developer 规范) */}
      <main className="flex-1 py-10 sm:py-16 w-full">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
            {/* 左侧：专业层级目录树 (3 列) */}
            <aside className="lg:col-span-3 space-y-6">
              {/* 文档搜索框 */}
              <div className="rounded-[20px] bg-[#f5f5f7] p-2.5">
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={lang === "en" ? "Filter docs & APIs..." : "搜索技术章节与接口..."}
                  className="w-full rounded-full bg-white px-4 py-2 text-[13px] text-[#1d1d1f] placeholder-[#86868b] outline-none transition"
                />
              </div>

              {/* 分组目录树导航 */}
              <nav aria-label="Documentation Tree" className="space-y-6">
                {categories.map((cat) => {
                  const docsInCat = filteredDocs.filter((d) => d.category === cat);
                  if (docsInCat.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="px-3 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                        {cat}
                      </div>
                      <div className="space-y-1">
                        {docsInCat.map((doc) => {
                          const isActive = doc.id === currentDoc.id;
                          return (
                            <button
                              key={doc.id}
                              type="button"
                              onClick={() => {
                                setActiveDocId(doc.id);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={`w-full text-left rounded-[12px] px-3.5 py-2 text-[13px] transition flex items-center justify-between cursor-pointer ${
                                isActive
                                  ? "bg-[#1d1d1f] text-white font-medium"
                                  : "text-[#515154] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
                              }`}
                            >
                              <span className="leading-snug">{doc.title}</span>
                              {isActive && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>

              {/* 知识图谱与精选博客联动微卡片 */}
              <div className="rounded-[22px] bg-[#f5f5f7] p-5 space-y-3">
                <div className="text-[13px] font-semibold text-[#1d1d1f]">
                  {lang === "en" ? "Academic Knowledge Base" : "学术知识图谱与论文博客"}
                </div>
                <p className="text-[12px] text-[#515154] leading-relaxed">
                  {lang === "en"
                    ? "Explore 100+ indexed papers and read full deep-dive architectural blogs in our interactive universe."
                    : "在可交互的星空图谱中探索全球 100+ 篇顶尖世界模型文献，研读图文并茂的深度论文长文。"}
                </p>
                <Link
                  href="/research"
                  className="rounded-full bg-white px-4 py-2 text-[12px] font-medium text-[#0071e3] hover:bg-[#e8e8ed] transition w-full text-center block no-underline"
                >
                  {lang === "en" ? "Explore Knowledge Graph ↗" : "前往知识图谱与博客 ↗"}
                </Link>
              </div>
            </aside>

            {/* 中间：精雕细琢的文档正文阅读区 (7 列) */}
            <article className="lg:col-span-7 space-y-10 terra-reveal">
              {/* 文档大标题与导读 */}
              <div id="overview" className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3 py-1 text-[12px] font-medium text-[#0071e3]">
                  <span>{currentDoc.category}</span>
                  <span>·</span>
                  <span>{currentDoc.badge}</span>
                </div>

                <h1 className="text-[32px] sm:text-[44px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.14]">
                  {currentDoc.title}
                </h1>

                <p className="text-[17px] sm:text-[19px] text-[#515154] leading-relaxed font-normal">
                  {lang === "en" ? currentDoc.summaryEn : currentDoc.summaryZh}
                </p>
              </div>

              {/* 核心架构原则 Callout */}
              <div className="rounded-[22px] bg-[#f5f5f7] p-6 space-y-2 border-l-4 border-[#0071e3]">
                <div className="text-[13px] font-semibold text-[#0071e3]">
                  {lang === "en" ? "Core Architectural Principle" : "核心架构准则与设计初衷"}
                </div>
                <p className="text-[14px] text-[#1d1d1f] leading-relaxed">
                  {lang === "en"
                    ? "TERRA-OASIS eliminates rigid polygonal assets, generating dynamic physics, raytraced shadows, and daylight paths continuously through action-conditioned causal latent diffusion."
                    : "TERRA-OASIS 彻底摒弃传统游戏引擎中繁复的多边形网格资产绑定，所有刚体物理碰撞与天光太阳高度角演变均由自回归扩散 Transformer 直接基于连续动作向量生成。"}
                </p>
              </div>

              {/* 规格 Bento 矩阵 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-[18px] bg-[#f5f5f7] p-4 space-y-1">
                  <div className="text-[12px] text-[#86868b]">{lang === "en" ? "Category" : "模块分类"}</div>
                  <div className="text-[14px] font-semibold text-[#1d1d1f]">{currentDoc.category}</div>
                </div>
                <div className="rounded-[18px] bg-[#f5f5f7] p-4 space-y-1">
                  <div className="text-[12px] text-[#86868b]">{lang === "en" ? "Execution Mode" : "执行模式"}</div>
                  <div className="text-[14px] font-semibold text-[#1d1d1f]">Autoregressive</div>
                </div>
                <div className="rounded-[18px] bg-[#f5f5f7] p-4 space-y-1">
                  <div className="text-[12px] text-[#86868b]">{lang === "en" ? "Latency Target" : "响应延迟"}</div>
                  <div className="text-[14px] font-semibold text-[#0071e3]">&lt; 16 ms</div>
                </div>
                <div className="rounded-[18px] bg-[#f5f5f7] p-4 space-y-1">
                  <div className="text-[12px] text-[#86868b]">{lang === "en" ? "Framerate Cap" : "流式帧率"}</div>
                  <div className="text-[14px] font-semibold text-[#1d1d1f]">60 FPS</div>
                </div>
              </div>

              {/* 核心可运行代码控制台 */}
              <div id="code-implementation" className="rounded-[28px] bg-[#f5f5f7] p-5 sm:p-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white p-1">
                    {(["python", "typescript", "bash"] as const).map((tab) => {
                      const isTabActive = activeCodeTab === tab;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveCodeTab(tab)}
                          className={`rounded-full px-3.5 py-1 text-[12px] font-medium transition cursor-pointer ${
                            isTabActive
                              ? "bg-[#0071e3] text-white"
                              : "text-[#515154] hover:text-[#1d1d1f]"
                          }`}
                        >
                          {tab === "python" ? "Python SDK" : tab === "typescript" ? "TypeScript (WebGPU)" : "Shell / CLI"}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopySnippet}
                    className="rounded-full bg-white px-3.5 py-1 text-[12px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{copiedCode ? (lang === "en" ? "Copied!" : "已复制!") : (lang === "en" ? "Copy Code" : "复制代码")}</span>
                  </button>
                </div>

                <div className="relative rounded-[20px] bg-[#1d1d1f] p-5 sm:p-6 overflow-x-auto text-[13px] leading-relaxed text-[#f5f5f7]">
                  <pre className="m-0 whitespace-pre">
                    <code>{activeSnippet}</code>
                  </pre>
                </div>
              </div>

              {/* 参数详细规范说明 */}
              <div id="parameters" className="space-y-4" data-ui="true">
                <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1d1d1f] tracking-tight">
                  {lang === "en" ? "Parameters & Signature" : "接口签名与参数规范"}
                </h2>

                <div className="overflow-hidden rounded-[20px] bg-[#f5f5f7]">
                  <table className="w-full text-left text-[14px]">
                    <thead className="bg-[#e8e8ed] text-[13px] font-semibold text-[#515154]">
                      <tr>
                        <th className="p-4">Parameter</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#1d1d1f]">
                      {currentDoc.parameters.map((param, pIdx) => (
                        <tr key={pIdx} className={pIdx % 2 === 0 ? "bg-white/50" : ""}>
                          <td className="p-4 text-[13px] font-semibold text-[#0071e3]">
                            <code>{param.name}</code>
                          </td>
                          <td className="p-4 text-[13px] text-[#515154]">{param.type}</td>
                          <td className="p-4 text-[13px] text-[#515154]">
                            {lang === "en" ? param.descEn : param.descZh}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 深度原理解析与架构剖析 */}
              <div id="architecture-details" className="space-y-4">
                <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1d1d1f] tracking-tight">
                  {lang === "en" ? "Technical Deep Dive" : "深度原理解析"}
                </h2>
                <div className="rounded-[22px] bg-[#f5f5f7] p-6 space-y-4 text-[15px] text-[#515154] leading-relaxed">
                  <p>
                    {lang === "en"
                      ? "The core transformer blocks alternate between spatial self-attention and causal temporal attention. When user control inputs arrive via WebSocket or WebRTC data channels, the action conditioning vector is mapped into the continuous latent manifold via MLP projections."
                      : "核心 Transformer 模块在空间自注意力与因果时序注意力之间交替执行。当用户按键与位姿控制向量通过 WebSocket 或 WebRTC 数据通道传入时，动作张量通过多层感知机（MLP）无损投影至连续潜流形空间。"}
                  </p>
                  <p>
                    {lang === "en"
                      ? "By enforcing temporal sliding attention windows of 32 frames and caching key-value memory states, the pipeline achieves constant memory usage regardless of roaming session duration."
                      : "通过强制施加 32 帧的时序滑动注意力窗口与缓存键值（KV）记忆状态，推流管线可在任意时长的连续漫游中维持恒定的显存占用，彻底规避长程时空坍塌。"}
                  </p>
                </div>
              </div>

              {/* 前后章节连续阅读导航 (Prev / Next Navigation) */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevDoc ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDocId(prevDoc.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="rounded-[20px] bg-[#f5f5f7] p-5 text-left space-y-1 hover:bg-[#e8e8ed] transition cursor-pointer"
                  >
                    <div className="text-[12px] font-semibold text-[#86868b]">
                      {lang === "en" ? "← Previous Topic" : "← 上一章节"}
                    </div>
                    <div className="text-[14px] font-semibold text-[#1d1d1f]">
                      {prevDoc.title}
                    </div>
                  </button>
                ) : <div />}

                {nextDoc ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDocId(nextDoc.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="rounded-[20px] bg-[#f5f5f7] p-5 text-right space-y-1 hover:bg-[#e8e8ed] transition cursor-pointer"
                  >
                    <div className="text-[12px] font-semibold text-[#86868b]">
                      {lang === "en" ? "Next Topic →" : "下一章节 →"}
                    </div>
                    <div className="text-[14px] font-semibold text-[#0071e3]">
                      {nextDoc.title}
                    </div>
                  </button>
                ) : <div />}
              </div>
            </article>

            {/* 右侧：On this page 悬浮目录大纲 (2 列) */}
            <aside className="hidden lg:block lg:col-span-2 space-y-4">
              <div className="sticky top-24 space-y-3">
                <div className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                  {lang === "en" ? "ON THIS PAGE" : "本页大纲"}
                </div>
                <ul className="space-y-2 text-[13px] p-0 list-none text-[#515154]">
                  <li>
                    <a href="#overview" className="hover:text-[#0071e3] transition no-underline block">
                      {lang === "en" ? "Overview" : "概述与导读"}
                    </a>
                  </li>
                  <li>
                    <a href="#code-implementation" className="hover:text-[#0071e3] transition no-underline block">
                      {lang === "en" ? "Code Console" : "代码运行控制台"}
                    </a>
                  </li>
                  <li>
                    <a href="#parameters" className="hover:text-[#0071e3] transition no-underline block">
                      {lang === "en" ? "API Parameters" : "参数与规格"}
                    </a>
                  </li>
                  <li>
                    <a href="#architecture-details" className="hover:text-[#0071e3] transition no-underline block">
                      {lang === "en" ? "Architecture Deep Dive" : "深度原理解析"}
                    </a>
                  </li>
                </ul>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={handleAskAiAboutTopic}
                    className="w-full rounded-[16px] bg-[#f5f5f7] p-3 text-left space-y-1 hover:bg-[#e8e8ed] transition cursor-pointer"
                  >
                    <div className="text-[12px] font-semibold text-[#0071e3]">
                      {lang === "en" ? "Have questions?" : "有技术疑问？"}
                    </div>
                    <div className="text-[13px] text-[#1d1d1f]">
                      {lang === "en" ? "Ask Copilot AI &gt;" : "咨询 AI 助手 &gt;"}
                    </div>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* 4. 统一 Apple 浅灰底脚 */}
      <AppleFooter />

      {/* 5. AI 智能问答侧边抽屉 */}
      <CopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        initialQuery={copilotQuery}
      />
    </div>
  );
}

export default function DocsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-white flex items-center justify-center text-[#515154] text-[15px]">
          Loading Developer Documentation...
        </div>
      }
    >
      <DocsContent />
    </Suspense>
  );
}
