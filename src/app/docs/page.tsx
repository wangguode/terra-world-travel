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

  const currentDoc: DocSection =
    OFFICIAL_DOCS.find((d) => d.id === activeDocId) || OFFICIAL_DOCS[0];

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

  return (
    <div className="min-h-[100dvh] bg-white text-[#1d1d1f] flex flex-col justify-between overflow-x-hidden selection:bg-[#0071e3] selection:text-white">
      {/* 1. 统一 Apple 白昼磨砂玻璃全局导航 */}
      <AppleHeader onOpenCopilot={() => setCopilotOpen(true)} />

      {/* 2. Apple 极简干净副导航（彻底移除了用户截图中的机械技术名词与长串标签） */}
      <div className="bg-[#f5f5f7] px-6 sm:px-8 py-3.5 text-[14px] text-[#515154] w-full">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#0071e3] transition no-underline text-[#515154]">
              TERRA-OASIS
            </Link>
            <span className="text-[#86868b]">/</span>
            <span className="text-[#1d1d1f] font-semibold">
              {lang === "en" ? "Developer Documentation" : "开发者技术文档"}
            </span>
            <span className="text-[#86868b]">/</span>
            <span className="text-[#0071e3] font-medium">{currentDoc.title}</span>
          </nav>

          <button
            type="button"
            onClick={() => setCopilotOpen(true)}
            className="rounded-full bg-white px-3.5 py-1 text-[13px] font-medium text-[#0071e3] hover:bg-[#e8e8ed] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span className="h-2 w-2 rounded-full bg-[#0071e3]" />
            <span>{lang === "en" ? "Ask AI Assistant" : "文档智能问答"}</span>
          </button>
        </div>
      </div>

      {/* 3. 开源高 Star 知识库级别三栏文档阅读体系 (Mintlify / Fumadocs + Apple 经典美学) */}
      <main className="flex-1 py-10 sm:py-14 w-full">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* 左侧：专业分组树形目录 (3 列) */}
            <aside className="lg:col-span-3 space-y-6">
              {/* 文档搜索框 */}
              <div className="rounded-[20px] bg-[#f5f5f7] p-3.5">
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={lang === "en" ? "Search documentation..." : "检索文档与接口..."}
                  className="w-full rounded-full bg-white px-4 py-2 text-[14px] text-[#1d1d1f] placeholder-[#86868b] outline-none transition"
                />
              </div>

              {/* 分组目录树 */}
              <nav aria-label="Documentation Sidebar" className="space-y-6">
                {categories.map((cat) => {
                  const docsInCat = filteredDocs.filter((d) => d.category === cat);
                  if (docsInCat.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="px-3 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">
                        {cat}
                      </div>
                      <div className="space-y-1">
                        {docsInCat.map((doc) => {
                          const isActive = doc.id === currentDoc.id;
                          return (
                            <button
                              key={doc.id}
                              type="button"
                              onClick={() => setActiveDocId(doc.id)}
                              className={`w-full text-left rounded-[14px] px-3.5 py-2.5 text-[14px] transition flex items-center justify-between cursor-pointer ${
                                isActive
                                  ? "bg-[#0071e3] text-white font-medium"
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

              {/* 知识库问答快捷入口 */}
              <div className="rounded-[22px] bg-[#f5f5f7] p-5 space-y-3">
                <div className="text-[14px] font-semibold text-[#1d1d1f]">
                  {lang === "en" ? "Need Technical Assistance?" : "遇到技术疑问？"}
                </div>
                <p className="text-[13px] text-[#515154] leading-relaxed">
                  {lang === "en"
                    ? "Our AI assistant is trained on these specifications and 100 milestone research papers."
                    : "内置 AI 助手已学习全部开发规范与 100 篇前沿世界模型文献，可随时提供技术解答。"}
                </p>
                <button
                  type="button"
                  onClick={() => setCopilotOpen(true)}
                  className="rounded-full bg-[#0071e3] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#0077ed] transition w-full text-center cursor-pointer"
                >
                  {lang === "en" ? "Ask AI Assistant" : "与架构助手对话"}
                </button>
              </div>
            </aside>

            {/* 中间：文档主体阅读区 (7 列) */}
            <article className="lg:col-span-7 space-y-10 terra-reveal">
              {/* 文档头部 */}
              <div id="overview" className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[13px] font-medium text-[#0071e3]">
                  <span>{currentDoc.category}</span>
                  <span>·</span>
                  <span>{currentDoc.badge}</span>
                </div>

                <h1 className="text-[34px] sm:text-[44px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.12]">
                  {currentDoc.title}
                </h1>

                <p className="text-[17px] sm:text-[19px] text-[#515154] leading-relaxed font-normal">
                  {lang === "en" ? currentDoc.summaryEn : currentDoc.summaryZh}
                </p>
              </div>

              {/* 核心概念 Callout 提示框 */}
              <div className="rounded-[20px] bg-[#f5f5f7] p-6 space-y-2 border-l-4 border-[#0071e3]">
                <div className="text-[14px] font-semibold text-[#1d1d1f]">
                  {lang === "en" ? "Key Architectural Principle" : "核心设计准则"}
                </div>
                <p className="text-[14px] text-[#515154] leading-relaxed">
                  {lang === "en"
                    ? "TERRA-OASIS eliminates rigid polygonal assets, generating dynamic physics and daylight paths continuously through action-conditioned causal latent diffusion."
                    : "TERRA-OASIS 彻底摒弃传统游戏引擎中繁复的多边形网格资产绑定，所有刚体物理碰撞与天光太阳高度角演变均由自回归扩散 Transformer 直接基于连续动作向量生成。"}
                </p>
              </div>

              {/* 关键属性 Bento 盒 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="rounded-[18px] bg-[#f5f5f7] p-4 space-y-1">
                  <div className="text-[12px] text-[#86868b]">{lang === "en" ? "Category" : "模块分类"}</div>
                  <div className="text-[15px] font-semibold text-[#1d1d1f]">{currentDoc.category}</div>
                </div>
                <div className="rounded-[18px] bg-[#f5f5f7] p-4 space-y-1">
                  <div className="text-[12px] text-[#86868b]">{lang === "en" ? "Execution Mode" : "执行模式"}</div>
                  <div className="text-[15px] font-semibold text-[#1d1d1f]">Autoregressive</div>
                </div>
                <div className="rounded-[18px] bg-[#f5f5f7] p-4 space-y-1">
                  <div className="text-[12px] text-[#86868b]">{lang === "en" ? "Latency Target" : "响应延迟"}</div>
                  <div className="text-[15px] font-semibold text-[#0071e3]">&lt; 16 ms</div>
                </div>
                <div className="rounded-[18px] bg-[#f5f5f7] p-4 space-y-1">
                  <div className="text-[12px] text-[#86868b]">{lang === "en" ? "Framerate Cap" : "流式帧率"}</div>
                  <div className="text-[15px] font-semibold text-[#1d1d1f]">60 FPS</div>
                </div>
              </div>

              {/* 核心代码实现展示窗 */}
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
                          className={`rounded-full px-3.5 py-1 text-[13px] font-medium transition cursor-pointer ${
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
                    className="rounded-full bg-white px-3.5 py-1 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{copiedCode ? (lang === "en" ? "Copied!" : "已复制!") : (lang === "en" ? "Copy Code" : "复制代码")}</span>
                  </button>
                </div>

                <div className="relative rounded-[20px] bg-[#1d1d1f] p-5 sm:p-6 overflow-x-auto text-[13px] sm:text-[14px] leading-relaxed text-[#f5f5f7]">
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
                    <thead className="bg-[#e8e8ed] text-[13px] font-semibold text-[#515154] tracking-wider">
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

              {/* 深度阅读正文与架构解析 */}
              <div id="architecture-details" className="space-y-4">
                <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1d1d1f] tracking-tight">
                  {lang === "en" ? "Technical Deep Dive" : "深度原理解析"}
                </h2>
                <div className="rounded-[22px] bg-[#f5f5f7] p-6 space-y-3 text-[15px] text-[#515154] leading-relaxed">
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

              {/* 关联技术进阶推荐 */}
              <div id="related-topics" className="space-y-4 pt-4">
                <h3 className="text-[20px] font-semibold text-[#1d1d1f]">
                  {lang === "en" ? "Related Resources" : "推荐进阶资源"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    href="/research"
                    className="rounded-[20px] bg-[#f5f5f7] p-5 space-y-2 hover:bg-[#e8e8ed] transition no-underline block"
                  >
                    <div className="text-[13px] font-semibold text-[#0071e3]">
                      {lang === "en" ? "100 Milestone Papers" : "100 篇前沿文献库"}
                    </div>
                    <div className="text-[16px] font-semibold text-[#1d1d1f]">
                      World Model Research Index ↗
                    </div>
                    <p className="text-[13px] text-[#515154] leading-relaxed">
                      Explore peer-reviewed publications from Google DeepMind, OpenAI, NVIDIA, and Wayve.
                    </p>
                  </Link>

                  <Link
                    href="/#interactive-playground"
                    className="rounded-[20px] bg-[#f5f5f7] p-5 space-y-2 hover:bg-[#e8e8ed] transition no-underline block"
                  >
                    <div className="text-[13px] font-semibold text-[#0071e3]">
                      {lang === "en" ? "Live Interactive Sandpit" : "实机 3D 沙盒视窗"}
                    </div>
                    <div className="text-[16px] font-semibold text-[#1d1d1f]">
                      WebGL / WebGPU Sandbox ↗
                    </div>
                    <p className="text-[13px] text-[#515154] leading-relaxed">
                      Experience real-time neural latent shockwaves and daylight path simulation in browser.
                    </p>
                  </Link>
                </div>
              </div>
            </article>

            {/* 右侧：On this page 悬浮大纲目录 (2 列) */}
            <aside className="hidden lg:block lg:col-span-2 space-y-4">
              <div className="sticky top-20 space-y-3">
                <div className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">
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
                      {lang === "en" ? "Code Example" : "代码实现范例"}
                    </a>
                  </li>
                  <li>
                    <a href="#parameters" className="hover:text-[#0071e3] transition no-underline block">
                      {lang === "en" ? "API Parameters" : "参数与规格"}
                    </a>
                  </li>
                  <li>
                    <a href="#architecture-details" className="hover:text-[#0071e3] transition no-underline block">
                      {lang === "en" ? "Deep Dive" : "深度原理解析"}
                    </a>
                  </li>
                  <li>
                    <a href="#related-topics" className="hover:text-[#0071e3] transition no-underline block">
                      {lang === "en" ? "Related Resources" : "推荐进阶"}
                    </a>
                  </li>
                </ul>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => setCopilotOpen(true)}
                    className="w-full rounded-[16px] bg-[#f5f5f7] p-3 text-left space-y-1 hover:bg-[#e8e8ed] transition cursor-pointer"
                  >
                    <div className="text-[12px] font-semibold text-[#0071e3]">
                      {lang === "en" ? "Have questions?" : "有疑问？"}
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

      {/* 5. AI 侧边抽屉 */}
      <CopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
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
