"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
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
    <div className="min-h-[100dvh] bg-[#000000] text-[#f5f5f7] flex flex-col justify-between overflow-x-hidden selection:bg-[#0071e3] selection:text-white">
      <AppleHeader onOpenCopilot={() => setCopilotOpen(true)} />

      {/* Apple Developer 专属浮动副导航栏 (Sub-header) */}
      <div className="bg-[#0a0a0c] px-6 sm:px-8 py-3.5 text-[14px] text-[#86868b] w-full">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-white transition no-underline text-[#86868b]">
              TERRA-OASIS
            </Link>
            <span className="text-[#515154]">/</span>
            <span className="text-[#a1a1a6]">Developer Documentation</span>
            <span className="text-[#515154]">/</span>
            <span className="text-[#a1a1a6]">{currentDoc.category}</span>
            <span className="text-[#515154]">/</span>
            <span className="text-white font-medium">{currentDoc.title}</span>
          </nav>

          <div className="flex items-center gap-3 text-[13px]">
            <span className="rounded-full bg-[#0071e3]/20 px-3 py-1 text-[#2997ff] font-medium">
              {currentDoc.framework}
            </span>
            <span className="hidden sm:inline text-[#86868b]">
              Platforms: {currentDoc.platforms.join(" · ")}
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 py-10 sm:py-16 w-full">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 space-y-12 w-full box-border">
          {/* 1. 具有绝对视觉焦点的 Apple Developer 头部 Hero 卡片 */}
          <div className="rounded-[32px] bg-[#121214] p-8 sm:p-12 terra-reveal w-full box-border">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <h1 className="text-[32px] sm:text-[48px] lg:text-[56px] font-semibold text-white tracking-tight leading-[1.08]">
                  {currentDoc.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-[14px] text-[#2997ff] font-medium">
                  <span>{currentDoc.category}</span>
                  <span className="text-[#515154]">·</span>
                  <span>{currentDoc.badge}</span>
                  <span className="text-[#515154]">·</span>
                  <span className="text-[#86868b]">{currentDoc.framework}</span>
                </div>

                <p className="text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed max-w-2xl font-normal">
                  {lang === "en" ? currentDoc.summaryEn : currentDoc.summaryZh}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3 text-[14px]">
                  <a
                    href="#sample-code"
                    className="rounded-full bg-[#0071e3] px-6 py-2.5 text-white font-medium hover:bg-[#0077ed] transition no-underline"
                  >
                    View Code Samples
                  </a>
                  <button
                    type="button"
                    onClick={() => setCopilotOpen(true)}
                    className="rounded-full bg-white/10 px-5 py-2.5 text-[#2997ff] font-medium hover:bg-white/20 transition cursor-pointer"
                  >
                    Ask AI Copilot &gt;
                  </button>
                </div>
              </div>

              {/* 架构透视大图 */}
              <div className="lg:col-span-5 w-full">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[24px] bg-[#0c0c0e]">
                  <Image
                    src="/images/beijing-pulse/798.jpg"
                    alt="Neural Architecture Schema"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. 双栏架构：左侧 Navigator + 右侧主 API 详注 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full box-border">
            {/* 左侧 Navigator (Apple 开发者文档导航树) */}
            <aside className="lg:col-span-4 rounded-[28px] bg-[#121214] p-6 space-y-4 lg:sticky lg:top-16 terra-reveal w-full box-border">
              {/* 搜索过滤框 */}
              <div className="relative w-full">
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={lang === "en" ? "Filter documentation..." : "搜索技术文档专栏..."}
                  className="w-full rounded-full bg-[#1c1c1f] px-4 py-2.5 text-[15px] text-white placeholder-[#86868b] focus:outline-none focus:ring-1 focus:ring-[#2997ff]"
                />
              </div>

              <div className="text-[14px] font-semibold text-[#86868b] px-2">
                {lang === "en" ? "Topics and API Reference" : "技术专栏与接口参考"}
              </div>

              <div className="space-y-1.5 max-h-[70vh] overflow-y-auto w-full pr-1">
                {filteredDocs.map((doc) => {
                  const isActive = doc.id === activeDocId;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setActiveDocId(doc.id)}
                      className={`w-full text-left rounded-[18px] px-4 py-3.5 transition flex items-center justify-between cursor-pointer ${
                        isActive
                          ? "bg-[#1d1d21] text-white font-medium"
                          : "text-[#a1a1a6] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="pr-2">
                        <div className="text-[15px] sm:text-[16px] leading-snug">{doc.title}</div>
                        <div className="text-[13px] text-[#86868b] mt-0.5 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#2997ff]" />
                          <span>{doc.badge}</span>
                        </div>
                      </div>
                      {isActive && (
                        <span className="text-[16px] text-[#2997ff] shrink-0 font-bold">
                          •
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* 右侧主文档排版区 (Apple Developer Reference 规范) */}
            <div className="lg:col-span-8 space-y-10 w-full box-border">
              {/* Apple 经典 Declaration (语法声明框) */}
              <div className="rounded-[28px] bg-[#121214] p-8 sm:p-10 space-y-4 terra-reveal w-full box-border">
                <div className="text-[16px] font-semibold text-white">
                  Declaration & Signature
                </div>
                <pre className="rounded-[22px] bg-[#070709] p-6 text-[15px] text-white/95 overflow-x-auto leading-relaxed max-w-full">
                  <code>{currentDoc.declaration}</code>
                </pre>
              </div>

              {/* 多语言代码实战示例 (Language Tabs) */}
              <div id="sample-code" className="rounded-[28px] bg-[#121214] p-8 sm:p-10 space-y-6 terra-reveal w-full box-border">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-[16px] font-semibold text-white">
                    Sample Code and Implementation
                  </div>

                  {/* 语言选项卡 */}
                  <div className="flex items-center gap-1.5 rounded-full bg-[#1c1c1f] p-1 text-[13px]">
                    {currentDoc.codeTabs.python && (
                      <button
                        type="button"
                        onClick={() => setActiveCodeTab("python")}
                        className={`rounded-full px-3.5 py-1.5 font-medium transition cursor-pointer ${
                          activeCodeTab === "python"
                            ? "bg-[#0071e3] text-white"
                            : "text-[#a1a1a6] hover:text-white"
                        }`}
                      >
                        Python
                      </button>
                    )}
                    {currentDoc.codeTabs.typescript && (
                      <button
                        type="button"
                        onClick={() => setActiveCodeTab("typescript")}
                        className={`rounded-full px-3.5 py-1.5 font-medium transition cursor-pointer ${
                          activeCodeTab === "typescript"
                            ? "bg-[#0071e3] text-white"
                            : "text-[#a1a1a6] hover:text-white"
                        }`}
                      >
                        TypeScript
                      </button>
                    )}
                    {currentDoc.codeTabs.bash && (
                      <button
                        type="button"
                        onClick={() => setActiveCodeTab("bash")}
                        className={`rounded-full px-3.5 py-1.5 font-medium transition cursor-pointer ${
                          activeCodeTab === "bash"
                            ? "bg-[#0071e3] text-white"
                            : "text-[#a1a1a6] hover:text-white"
                        }`}
                      >
                        Bash / CLI
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative w-full">
                  <pre className="text-[15px] text-white/95 p-6 bg-[#070709] rounded-[22px] overflow-x-auto leading-relaxed max-w-full">
                    <code>{activeSnippet}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={handleCopySnippet}
                    className="absolute top-4 right-4 rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-medium text-white hover:bg-white/20 transition cursor-pointer"
                  >
                    {copiedCode
                      ? lang === "en"
                        ? "Copied"
                        : "已复制"
                      : lang === "en"
                      ? "Copy Code"
                      : "复制代码"}
                  </button>
                </div>
              </div>

              {/* 参数规格说明表 (Parameters Table) */}
              {currentDoc.parameters.length > 0 && (
                <div className="rounded-[28px] bg-[#121214] p-8 sm:p-10 space-y-6 terra-reveal w-full box-border">
                  <div className="text-[16px] font-semibold text-white">
                    Parameters and Arguments
                  </div>
                  <div className="space-y-4">
                    {currentDoc.parameters.map((param) => (
                      <div
                        key={param.name}
                        className="rounded-[20px] bg-[#161619] p-5 space-y-2 w-full box-border"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <code className="text-[15px] font-bold text-[#2997ff]">
                            {param.name}
                          </code>
                          <code className="text-[13px] text-[#a1a1a6] bg-white/5 px-2.5 py-0.5 rounded-[6px]">
                            {param.type}
                          </code>
                        </div>
                        <p className="text-[16px] text-[#f5f5f7] leading-relaxed">
                          {lang === "en" ? param.descEn : param.descZh}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 相关主题卡片网格 (Apple Developer Topics Grid) */}
              <div className="rounded-[28px] bg-[#121214] p-8 sm:p-10 space-y-6 terra-reveal w-full box-border">
                <div className="text-[16px] font-semibold text-white">
                  Related Topics & Extensions
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentDoc.topics.map((topic, i) => (
                    <div
                      key={topic.title}
                      className="rounded-[20px] bg-[#161619] p-5 space-y-3 transition hover:bg-[#1c1c20] w-full box-border"
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[14px]">
                        <Image
                          src={
                            i === 0
                              ? "/images/beijing-pulse/forbidden-city.jpg"
                              : "/images/beijing-pulse/temple-of-heaven.jpg"
                          }
                          alt={topic.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 30vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="text-[16px] font-semibold text-[#2997ff]">
                        {topic.title}
                      </div>
                      <p className="text-[15px] sm:text-[16px] text-[#d2d2d7] leading-relaxed">
                        {lang === "en" ? topic.descEn : topic.descZh}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AppleFooter />
      <CopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
}

export default function DocsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#000000] text-white flex items-center justify-center">
          <div className="text-[15px] text-[#86868b]">Loading Documentation...</div>
        </div>
      }
    >
      <DocsContent />
    </Suspense>
  );
}
