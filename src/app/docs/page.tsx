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
      {/* 1. 统一 Apple 白昼磨砂玻璃导航 */}
      <AppleHeader onOpenCopilot={() => setCopilotOpen(true)} />

      {/* 2. Apple Developer 浅色专属浮动副导航栏 (Sub-header) */}
      <div className="bg-[#f5f5f7] px-6 sm:px-8 py-3 text-[14px] text-[#515154] w-full">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-[#0071e3] transition no-underline text-[#515154]">
              TERRA-OASIS
            </Link>
            <span className="text-[#86868b]">/</span>
            <span className="text-[#86868b]">Developer Documentation</span>
            <span className="text-[#86868b]">/</span>
            <span className="text-[#86868b]">{currentDoc.category}</span>
            <span className="text-[#86868b]">/</span>
            <span className="text-[#1d1d1f] font-semibold">{currentDoc.title}</span>
          </nav>

          <div className="flex items-center gap-3 text-[13px]">
            <span className="rounded-full bg-[#0071e3]/10 px-3 py-1 text-[#0071e3] font-medium">
              {currentDoc.framework}
            </span>
            <span className="hidden sm:inline text-[#86868b]">
              Platforms: {currentDoc.platforms.join(" · ")}
            </span>
          </div>
        </div>
      </div>

      {/* 3. 主体工作区：浅色分栏架构 (对标 Apple Developer Docs) */}
      <main className="flex-1 py-10 sm:py-14 w-full">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
            {/* 左侧：文档导航与目录 (浅灰温润底座) */}
            <aside className="lg:col-span-4 space-y-6">
              {/* 搜索与过滤框 */}
              <div className="rounded-[20px] bg-[#f5f5f7] p-4 space-y-3">
                <div className="text-[13px] font-semibold tracking-wider text-[#86868b]">
                  {lang === "en" ? "SEARCH DOCUMENTATION" : "检索官方技术规范"}
                </div>
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={lang === "en" ? "Filter APIs, topics, weights..." : "搜索模块、算子或参数..."}
                  className="w-full rounded-full bg-white px-4 py-2 text-[14px] text-[#1d1d1f] placeholder-[#86868b] outline-none transition"
                />
              </div>

              {/* 文档目录列表 */}
              <div className="rounded-[24px] bg-[#f5f5f7] p-3 space-y-1">
                <div className="px-3 py-2 text-[13px] font-semibold text-[#86868b] tracking-wider">
                  {lang === "en" ? "TABLE OF CONTENTS" : "技术章节目录"}
                </div>
                <div className="space-y-1">
                  {filteredDocs.map((doc) => {
                    const isActive = doc.id === currentDoc.id;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setActiveDocId(doc.id)}
                        className={`w-full text-left rounded-[16px] px-3.5 py-3 text-[14px] transition flex items-center justify-between cursor-pointer ${
                          isActive
                            ? "bg-white text-[#0071e3] font-semibold"
                            : "text-[#515154] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-[13px] font-normal text-[#86868b]">{doc.category}</div>
                          <div className="leading-snug">{doc.title}</div>
                        </div>
                        {isActive && (
                          <span className="h-2 w-2 rounded-full bg-[#0071e3] shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                  {filteredDocs.length === 0 && (
                    <div className="p-4 text-center text-[13px] text-[#86868b]">
                      {lang === "en" ? "No matching topics found." : "未找到匹配的技术文档条目。"}
                    </div>
                  )}
                </div>
              </div>

              {/* 开发者支持卡片 (浅灰高级卡片) */}
              <div className="rounded-[24px] bg-[#f5f5f7] p-6 space-y-3">
                <div className="text-[14px] font-semibold text-[#1d1d1f]">
                  {lang === "en" ? "Enterprise Architecture Team" : "企业级世界模型技术支持"}
                </div>
                <p className="text-[13px] text-[#515154] leading-relaxed">
                  {lang === "en"
                    ? "Need dedicated inference cluster design or robotics hardware sensor calibration?"
                    : "需要大规模推理集群定制规划、具身硬件传感器标定或私有化部署支持？"}
                </p>
                <button
                  type="button"
                  onClick={() => setCopilotOpen(true)}
                  className="rounded-full bg-[#0071e3] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#0077ed] transition w-full text-center"
                >
                  {lang === "en" ? "Ask AI Assistant" : "与架构助手在线对话"}
                </button>
              </div>
            </aside>

            {/* 右侧：文档主展台 (纯白背景 + Apple 经典排版) */}
            <article className="lg:col-span-8 space-y-10 terra-reveal">
              {/* 文档头部 */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[13px] font-medium text-[#0071e3]">
                  <span>{currentDoc.category}</span>
                  <span>·</span>
                  <span>{currentDoc.framework}</span>
                </div>

                <h1 className="text-[32px] sm:text-[44px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.12]">
                  {currentDoc.title}
                </h1>

                <p className="text-[17px] sm:text-[19px] text-[#515154] leading-relaxed font-normal">
                  {lang === "en" ? currentDoc.summaryEn : currentDoc.summaryZh}
                </p>
              </div>

              {/* 规格属性展示条 (浅灰四栏网格) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="rounded-[18px] bg-[#f5f5f7] p-4 space-y-1">
                  <div className="text-[13px] text-[#86868b]">{lang === "en" ? "Target Runtime" : "目标运行时"}</div>
                  <div className="text-[15px] font-semibold text-[#1d1d1f]">{currentDoc.framework}</div>
                </div>
                <div className="rounded-[18px] bg-[#f5f5f7] p-4 space-y-1">
                  <div className="text-[13px] text-[#86868b]">{lang === "en" ? "Precision" : "量化精度"}</div>
                  <div className="text-[15px] font-semibold text-[#1d1d1f]">FP16 / INT4</div>
                </div>
                <div className="rounded-[18px] bg-[#f5f5f7] p-4 space-y-1">
                  <div className="text-[13px] text-[#86868b]">{lang === "en" ? "Latency Budget" : "延迟预算"}</div>
                  <div className="text-[15px] font-semibold text-[#0071e3]">&lt; 16 ms</div>
                </div>
                <div className="rounded-[18px] bg-[#f5f5f7] p-4 space-y-1">
                  <div className="text-[13px] text-[#86868b]">{lang === "en" ? "License" : "开源协议"}</div>
                  <div className="text-[15px] font-semibold text-[#1d1d1f]">Apache 2.0</div>
                </div>
              </div>

              {/* 核心代码实现展台 (Apple Developer 经典高对比度代码窗，外壳浅灰) */}
              <div className="rounded-[28px] bg-[#f5f5f7] p-5 sm:p-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* 代码语言切换 Tab */}
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

                  {/* 复制按钮 */}
                  <button
                    type="button"
                    onClick={handleCopySnippet}
                    className="rounded-full bg-white px-3.5 py-1 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{copiedCode ? (lang === "en" ? "Copied!" : "已复制!") : (lang === "en" ? "Copy Code" : "复制代码")}</span>
                  </button>
                </div>

                {/* 代码高亮块 (Apple 开发者高对比度深色晶体容器，保证极客代码最佳易读性) */}
                <div className="relative rounded-[20px] bg-[#1d1d1f] p-5 sm:p-6 overflow-x-auto text-[13px] sm:text-[14px] leading-relaxed text-[#f5f5f7]">
                  <pre className="m-0 whitespace-pre">
                    <code>{activeSnippet}</code>
                  </pre>
                </div>
              </div>

              {/* 接口参数规范详细说明 (浅灰表格) */}
              <div className="space-y-4" data-ui="true">
                <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1d1d1f] tracking-tight">
                  {lang === "en" ? "Parameters & Signature" : "接口签名与参数规范"}
                </h2>

                <div className="overflow-hidden rounded-[20px] bg-[#f5f5f7]">
                  <table className="w-full text-left text-[14px]">
                    <thead className="bg-[#e8e8ed] text-[13px] font-semibold text-[#515154] tracking-wider">
                      <tr>
                        <th className="p-4">Parameter</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Default</th>
                        <th className="p-4">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#1d1d1f]">
                      <tr className="bg-white/40">
                        <td className="p-4 text-[13px] font-semibold text-[#0071e3]"><code>action_vector</code></td>
                        <td className="p-4 text-[13px] text-[#515154]">Float[6]</td>
                        <td className="p-4 text-[13px] text-[#86868b]">[0,0,0,0,0,0]</td>
                        <td className="p-4 text-[#515154]">6-DoF continuous camera or robot actuator input.</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-[13px] font-semibold text-[#0071e3]"><code>temporal_window</code></td>
                        <td className="p-4 text-[13px] text-[#515154]">Integer</td>
                        <td className="p-4 text-[13px] text-[#86868b]">32</td>
                        <td className="p-4 text-[#515154]">Sliding causal attention window size across frames.</td>
                      </tr>
                      <tr className="bg-white/40">
                        <td className="p-4 text-[13px] font-semibold text-[#0071e3]"><code>latent_guidance_scale</code></td>
                        <td className="p-4 text-[13px] text-[#515154]">Float</td>
                        <td className="p-4 text-[13px] text-[#86868b]">4.5</td>
                        <td className="p-4 text-[#515154]">Classifier-free causal guidance strength for physics.</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-[13px] font-semibold text-[#0071e3]"><code>webrtc_stream_url</code></td>
                        <td className="p-4 text-[13px] text-[#515154]">String</td>
                        <td className="p-4 text-[13px] text-[#86868b]">ws://localhost:3200</td>
                        <td className="p-4 text-[#515154]">H.265 / AV1 low-latency streaming endpoint.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 关联技术议题与下一篇推荐 (浅灰卡片网格) */}
              <div className="space-y-4 pt-4">
                <h3 className="text-[20px] font-semibold text-[#1d1d1f]">
                  {lang === "en" ? "Related Topics" : "推荐进阶议题"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    href="/research#infinite-causal-dit"
                    className="rounded-[20px] bg-[#f5f5f7] p-5 space-y-2 hover:bg-[#e8e8ed] transition no-underline block"
                  >
                    <div className="text-[13px] font-semibold text-[#0071e3]">Academic Preprint</div>
                    <div className="text-[16px] font-semibold text-[#1d1d1f]">
                      Infinite-Horizon Causal DiT (CVPR 2026) ↗
                    </div>
                    <p className="text-[13px] text-[#515154] leading-relaxed">
                      Deep mathematical derivation of non-collapsing autoregressive video diffusion transformers.
                    </p>
                  </Link>

                  <Link
                    href="/#interactive-playground"
                    className="rounded-[20px] bg-[#f5f5f7] p-5 space-y-2 hover:bg-[#e8e8ed] transition no-underline block"
                  >
                    <div className="text-[13px] font-semibold text-[#0071e3]">Live Interactive Sandpit</div>
                    <div className="text-[16px] font-semibold text-[#1d1d1f]">
                      Interactive 3D WebGL / WebGPU Sandbox ↗
                    </div>
                    <p className="text-[13px] text-[#515154] leading-relaxed">
                      Experience real-time neural latent shockwaves and daylight path simulation in browser.
                    </p>
                  </Link>
                </div>
              </div>
            </article>
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
