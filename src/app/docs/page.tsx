"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { OFFICIAL_DOCS } from "@/lib/oasis-docs-data";
import { AppleHeader } from "@/components/apple-header";
import { AppleFooter } from "@/components/apple-footer";
import { CopilotDrawer } from "@/components/copilot-drawer";

function DocsContent() {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const initialSec = searchParams.get("sec") || "getting-started";

  const [activeDocId, setActiveDocId] = useState<string>(initialSec);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  const currentDoc =
    OFFICIAL_DOCS.find((d) => d.id === activeDocId) || OFFICIAL_DOCS[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentDoc.contentMarkdown || "");
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#000000] text-[#f5f5f7] flex flex-col justify-between">
      <AppleHeader onOpenCopilot={() => setCopilotOpen(true)} />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-10">
          <div className="pb-8 max-w-3xl">
            <h1 className="text-[32px] sm:text-[44px] font-semibold text-white tracking-tight">
              {lang === "en"
                ? "TERRA-OASIS Technical Documentation"
                : "TERRA-OASIS 架构技术文档中心"}
            </h1>
            <p className="mt-3 text-[16px] sm:text-[18px] text-[#a1a1a6] leading-relaxed">
              {lang === "en"
                ? "Official developer reference, WebSocket action-conditioning streaming protocol, 14B causal DiT backbone, and multi-node cluster deployment."
                : "官方开发指南、动作流条件注入协议规范、14B 因果 Transformer 骨干原理与企业级高可用分布式集群部署指南。"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 左侧文档目录树 */}
            <aside className="lg:col-span-4 rounded-[28px] bg-[#161617] p-6 space-y-2 sticky top-20">
              <div className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wider mb-4 px-3">
                {lang === "en" ? "DOCUMENTATION SECTIONS" : "架构技术专栏"}
              </div>
              {OFFICIAL_DOCS.map((doc) => {
                const isActive = doc.id === activeDocId;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setActiveDocId(doc.id)}
                    className={`w-full text-left rounded-[18px] px-4 py-3.5 transition flex items-center justify-between ${
                      isActive
                        ? "bg-[#1d1d1f] text-white font-medium"
                        : "text-[#a1a1a6] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div>
                      <div className="text-[15px]">{doc.title}</div>
                      <div className="text-[13px] text-[#86868b] mt-0.5">{doc.badge}</div>
                    </div>
                    <span className="text-[14px] text-[#2997ff]">{isActive ? "•" : ""}</span>
                  </button>
                );
              })}
            </aside>

            {/* 右侧文档详细正文 */}
            <div className="lg:col-span-8 rounded-[28px] bg-[#161617] p-8 sm:p-12 space-y-6">
              <div>
                <div className="inline-block rounded-full bg-white/5 px-3 py-1 text-[13px] font-medium text-[#2997ff]">
                  {currentDoc.badge}
                </div>
                <h2 className="mt-4 text-[26px] sm:text-[34px] font-semibold text-white tracking-tight">
                  {currentDoc.title}
                </h2>
                <p className="mt-2 text-[16px] text-[#d2d2d7] leading-relaxed">
                  {currentDoc.summary}
                </p>
              </div>

              <div className="relative">
                <pre className="text-[14px] text-white/90 p-6 bg-[#1d1d1f] rounded-[24px] overflow-x-auto leading-relaxed whitespace-pre-wrap font-sans">
                  <code>{currentDoc.contentMarkdown}</code>
                </pre>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute top-4 right-4 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-white/20 transition"
                >
                  {copiedCode
                    ? lang === "en"
                      ? "Copied!"
                      : "已复制"
                    : lang === "en"
                    ? "Copy Code / Markdown"
                    : "复制代码 / Markdown"}
                </button>
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
    <Suspense fallback={<div className="min-h-[100dvh] bg-black text-white p-10">Loading docs...</div>}>
      <DocsContent />
    </Suspense>
  );
}
