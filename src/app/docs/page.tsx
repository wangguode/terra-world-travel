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
  const [copiedDeclaration, setCopiedDeclaration] = useState(false);
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

  const handleCopyDeclaration = async () => {
    try {
      await navigator.clipboard.writeText(currentDoc.declaration);
      setCopiedDeclaration(true);
      setTimeout(() => setCopiedDeclaration(false), 2000);
    } catch {
      setCopiedDeclaration(true);
      setTimeout(() => setCopiedDeclaration(false), 2000);
    }
  };

  const handleAskAiAboutTopic = () => {
    setCopilotQuery(
      lang === "en"
        ? `Explain the implementation details, signatures, and parameter specifications for "${currentDoc.title}" in TERRA-OASIS`
        : `请系统解析 TERRA-OASIS 开发文档【${currentDoc.title}】的架构设计、接口签名规范与实际调用代码`
    );
    setCopilotOpen(true);
  };

  return (
    <div className="min-h-[100dvh] bg-white text-[#1d1d1f] flex flex-col justify-between overflow-x-hidden selection:bg-[#0071e3] selection:text-white">
      {/* 1. 统一 Apple 白昼磨砂玻璃全局主导航 */}
      <AppleHeader
        onOpenCopilot={() => {
          setCopilotQuery("");
          setCopilotOpen(true);
        }}
      />

      {/* 2. Apple Developer 级纯净极简面包屑栏 */}
      <div className="bg-white px-6 sm:px-8 py-3.5 text-[13px] text-[#515154] w-full sticky top-12 z-20">
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
            <span className="text-[#1d1d1f] font-semibold truncate max-w-xs">{currentDoc.title}</span>
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

      {/* 3. 系统级重塑的专业开发者文档阅读系统 (Stripe / Apple Developer 规范) */}
      <main className="flex-1 py-8 sm:py-12 w-full">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* 左侧：专业层级目录树 (3 列) */}
            <aside className="lg:col-span-3 space-y-6">
              {/* 文档检索输入框 */}
              <div className="relative">
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={lang === "en" ? "Search documentation..." : "搜索章节、接口与协议..."}
                  className="w-full rounded-[14px] bg-[#f5f5f7] px-4 py-2.5 text-[13px] text-[#1d1d1f] placeholder-[#86868b] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20"
                />
              </div>

              {/* 分组目录树导航 */}
              <nav aria-label="Documentation Tree" className="space-y-6">
                {categories.map((cat) => {
                  const docsInCat = filteredDocs.filter((d) => d.category === cat);
                  if (docsInCat.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="px-3 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                        {cat}
                      </div>
                      <div className="space-y-0.5">
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
                              className={`w-full text-left rounded-[10px] px-3 py-2 text-[13px] transition flex items-center justify-between cursor-pointer ${
                                isActive
                                  ? "bg-[#0071e3]/10 text-[#0071e3] font-semibold"
                                  : "text-[#515154] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
                              }`}
                            >
                              <span className="leading-snug truncate">{doc.title}</span>
                              {isActive && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#0071e3] shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>

              {/* 关联学术星空知识库微卡片 */}
              <div className="rounded-[20px] bg-[#f5f5f7] p-5 space-y-2.5">
                <div className="text-[13px] font-semibold text-[#1d1d1f]">
                  {lang === "en" ? "World Model Research" : "前沿世界模型科研星空"}
                </div>
                <p className="text-[12px] text-[#515154] leading-relaxed">
                  {lang === "en"
                    ? "Explore 100+ indexed papers and read full Markdown articles directly in the platform."
                    : "在可交互知识星空中探索 100+ 篇全球前沿世界模型文献，在当前平台直接以 Markdown 风格阅读。"}
                </p>
                <Link
                  href="/research"
                  className="rounded-full bg-white px-4 py-1.5 text-[12px] font-medium text-[#0071e3] hover:bg-[#e8e8ed] transition w-full text-center block no-underline"
                >
                  {lang === "en" ? "Explore Research Graph ↗" : "前往前沿科研知识库 ↗"}
                </Link>
              </div>
            </aside>

            {/* 中间：以 Apple Developer / Stripe 规范深度重塑的文档正文 (7 列) */}
            <article className="lg:col-span-7 space-y-12 terra-reveal">
              {/* A. 标题与架构导读 */}
              <header id="overview" className="space-y-4">
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="rounded-full bg-[#f5f5f7] px-3 py-1 font-medium text-[#0071e3]">
                    {currentDoc.category}
                  </span>
                </div>

                <h1 className="text-[34px] sm:text-[46px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.12]">
                  {currentDoc.title}
                </h1>

                <p className="text-[17px] sm:text-[19px] text-[#515154] leading-relaxed font-normal">
                  {lang === "en" ? currentDoc.summaryEn : currentDoc.summaryZh}
                </p>
              </header>

              {/* B. Apple 风格接口声明框 (Declaration Window) */}
              <section id="declaration" className="space-y-3">
                <div className="flex items-center justify-between text-[12px] text-[#86868b]">
                  <span className="font-semibold text-[#1d1d1f] uppercase tracking-wider text-[11px]">
                    DECLARATION &amp; PROTOCOL SIGNATURE
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyDeclaration}
                    className="rounded-full bg-[#f5f5f7] px-3 py-0.5 font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition cursor-pointer"
                  >
                    {copiedDeclaration
                      ? (lang === "en" ? "Copied!" : "已复制!")
                      : (lang === "en" ? "Copy Declaration" : "复制声明")}
                  </button>
                </div>

                <div className="rounded-[18px] bg-[#f5f5f7] p-5 text-[13px] text-[#1d1d1f] leading-relaxed overflow-x-auto whitespace-pre">
                  <code>{currentDoc.declaration}</code>
                </div>
              </section>

              {/* C. 核心架构准则 Callout */}
              <section className="rounded-[22px] bg-[#f5f5f7] p-6 space-y-2 border-l-4 border-[#0071e3]">
                <div className="text-[13px] font-semibold text-[#0071e3] uppercase tracking-wider">
                  {lang === "en" ? "CORE ARCHITECTURAL PRINCIPLE" : "核心架构准则与设计初衷"}
                </div>
                <p className="text-[14px] text-[#1d1d1f] leading-relaxed">
                  {lang === "en"
                    ? "TERRA-OASIS eliminates rigid polygonal meshes and static vertex buffers. The entire physical world, collision surfaces, and daylight illumination are synthesized autoregressively from continuous action conditioning vectors."
                    : "TERRA-OASIS 彻底摒弃传统游戏引擎中繁复的多边形网格资产绑定，所有刚体物理碰撞与天光太阳高度角演变均由自回归扩散 Transformer 直接基于连续动作向量生成。"}
                </p>
              </section>

              {/* D. 规格参数卡片流 (Stripe API 规范，告别丑陋生硬表格) */}
              <section id="parameters" className="space-y-4" data-ui="true">
                <div className="space-y-1">
                  <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1d1d1f] tracking-tight">
                    {lang === "en" ? "Parameters & Attributes" : "接口参数与属性字段规范"}
                  </h2>
                  <p className="text-[14px] text-[#515154]">
                    {lang === "en"
                      ? "Configuration options and runtime arguments accepted by this module."
                      : "详细说明本模块接收的初始化配置项、动作张量维度与执行参数。"}
                  </p>
                </div>

                <div className="space-y-3">
                  {currentDoc.parameters.map((param, pIdx) => (
                    <div
                      key={pIdx}
                      className="rounded-[16px] bg-[#f5f5f7] p-4 sm:p-5 space-y-2 transition hover:bg-[#efeff2]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <code className="text-[14px] font-semibold text-[#0071e3]">
                            {param.name}
                          </code>
                          <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#515154]">
                            {param.type}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
                          Required
                        </span>
                      </div>
                      <p className="text-[13px] text-[#515154] leading-relaxed">
                        {lang === "en" ? param.descEn : param.descZh}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* E. 交互式代码运行控制台 (Mac 窗口三色圆点高质感代码台) */}
              <section id="code-console" className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1d1d1f] tracking-tight">
                    {lang === "en" ? "Code Runner Console" : "可运行代码实现与控制台"}
                  </h2>
                  <p className="text-[14px] text-[#515154]">
                    {lang === "en"
                      ? "Ready-to-run integration snippets across supported languages and execution runtimes."
                      : "开箱即用的跨语言调用示例，可在本地 Python 环境、浏览器 WebGPU 或终端 CLI 中直接运行。"}
                  </p>
                </div>

                <div className="rounded-[24px] bg-[#1d1d1f] overflow-hidden text-[#f5f5f7]">
                  {/* 控制台顶部标签栏：带 Mac 窗口三色圆点 */}
                  <div className="p-4 bg-[#2c2c2e] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                        <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                      </div>

                      {/* 语言选项切换卡 */}
                      <div className="inline-flex items-center gap-1 rounded-full bg-white/10 p-0.5">
                        {(["python", "typescript", "bash"] as const).map((tab) => {
                          const isTabActive = activeCodeTab === tab;
                          return (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setActiveCodeTab(tab)}
                              className={`rounded-full px-3 py-0.5 text-[12px] font-medium transition cursor-pointer ${
                                isTabActive
                                  ? "bg-white text-[#1d1d1f] font-semibold"
                                  : "text-white/70 hover:text-white"
                              }`}
                            >
                              {tab === "python"
                                ? "Python SDK"
                                : tab === "typescript"
                                ? "TypeScript (WebGPU)"
                                : "Shell CLI"}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopySnippet}
                      className="rounded-full bg-white/10 px-3.5 py-1 text-[12px] font-medium text-white hover:bg-white/20 transition cursor-pointer"
                    >
                      {copiedCode
                        ? (lang === "en" ? "Copied!" : "已复制!")
                        : (lang === "en" ? "Copy Code" : "复制代码")}
                    </button>
                  </div>

                  {/* 代码内容区域 */}
                  <div className="p-5 sm:p-6 text-[13px] leading-relaxed overflow-x-auto whitespace-pre">
                    <code>{activeSnippet}</code>
                  </div>
                </div>
              </section>

              {/* F. 深度架构原理剖析 */}
              <section id="architecture-deepdive" className="space-y-4">
                <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1d1d1f] tracking-tight">
                  {lang === "en" ? "Architecture Deep Dive" : "深度原理解析与架构机制"}
                </h2>
                <div className="rounded-[22px] bg-[#f5f5f7] p-6 sm:p-8 space-y-4 text-[15px] text-[#515154] leading-relaxed">
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
              </section>

              {/* G. 导出类与结构体规范 (Associated Topics & Structures) */}
              {currentDoc.topics && currentDoc.topics.length > 0 && (
                <section id="topics-structures" className="space-y-4">
                  <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1d1d1f] tracking-tight">
                    {lang === "en" ? "Exported Classes & Protocols" : "导出类与数据结构协议"}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentDoc.topics.map((top, tIdx) => (
                      <div key={tIdx} className="rounded-[18px] bg-[#f5f5f7] p-5 space-y-1.5">
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="font-semibold text-[#1d1d1f] text-[14px]">
                            {top.title}
                          </span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[#0071e3] font-medium">
                            {top.type}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#515154] leading-relaxed">
                          {lang === "en" ? top.descEn : top.descZh}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* H. 流式连贯阅读导航 (Next / Previous Navigation) */}
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

            {/* 右侧：On This Page 极简随动目录 (2 列) */}
            <aside className="hidden lg:block lg:col-span-2 space-y-4">
              <div className="sticky top-24 space-y-4">
                <div className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                  {lang === "en" ? "ON THIS PAGE" : "本篇大纲"}
                </div>
                <ul className="space-y-2 text-[13px] p-0 list-none text-[#515154]">
                  <li>
                    <a href="#overview" className="hover:text-[#0071e3] transition no-underline block">
                      {lang === "en" ? "Overview" : "概述与导读"}
                    </a>
                  </li>
                  <li>
                    <a href="#declaration" className="hover:text-[#0071e3] transition no-underline block">
                      {lang === "en" ? "Declaration" : "接口签名声明"}
                    </a>
                  </li>
                  <li>
                    <a href="#parameters" className="hover:text-[#0071e3] transition no-underline block">
                      {lang === "en" ? "Parameters" : "参数与规格"}
                    </a>
                  </li>
                  <li>
                    <a href="#code-console" className="hover:text-[#0071e3] transition no-underline block">
                      {lang === "en" ? "Code Runner" : "可运行代码控制台"}
                    </a>
                  </li>
                  <li>
                    <a href="#architecture-deepdive" className="hover:text-[#0071e3] transition no-underline block">
                      {lang === "en" ? "Architecture" : "深度原理解析"}
                    </a>
                  </li>
                  <li>
                    <a href="#topics-structures" className="hover:text-[#0071e3] transition no-underline block">
                      {lang === "en" ? "Structures & Topics" : "导出类与协议"}
                    </a>
                  </li>
                </ul>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleAskAiAboutTopic}
                    className="w-full rounded-[16px] bg-[#f5f5f7] p-3.5 text-left space-y-1 hover:bg-[#e8e8ed] transition cursor-pointer"
                  >
                    <div className="text-[12px] font-semibold text-[#0071e3]">
                      {lang === "en" ? "Have questions?" : "有技术疑问？"}
                    </div>
                    <div className="text-[13px] text-[#1d1d1f]">
                      {lang === "en" ? "Ask Copilot AI &gt;" : "咨询 AI 智能助手 &gt;"}
                    </div>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* 4. 统一 Apple 浅灰单层页脚 */}
      <AppleFooter />

      {/* 5. 论文快速抽屉 (支持需要时唤出) */}
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
