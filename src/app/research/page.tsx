"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { OFFICIAL_BLOGS } from "@/lib/oasis-blog-data";
import { AppleHeader } from "@/components/apple-header";
import { AppleFooter } from "@/components/apple-footer";
import { CopilotDrawer } from "@/components/copilot-drawer";

export default function ResearchPage() {
  const { lang } = useLanguage();
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[#000000] text-[#f5f5f7] flex flex-col justify-between">
      <AppleHeader onOpenCopilot={() => setCopilotOpen(true)} />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-10">
          <div className="pb-8 max-w-3xl">
            <h1 className="text-[32px] sm:text-[44px] font-semibold text-white tracking-tight">
              {lang === "en"
                ? "TERRA Research & Papers"
                : "TERRA 前沿研究与学术论文"}
            </h1>
            <p className="mt-3 text-[16px] sm:text-[18px] text-[#a1a1a6] leading-relaxed">
              {lang === "en"
                ? "Frontline notes from our core engineering and research teams. Deconstructing causal diffusion world models, emergent intuitive physics, and Sim-to-Real for robotics."
                : "来自核心工程与前沿算法团队的一线实战笔记。解构因果扩散世界模型、神经物理涌现与具身智能 Sim-to-Real 的核心突破。"}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {OFFICIAL_BLOGS.map((post) => {
              const isExpanded = selectedBlogId === post.id;
              return (
                <article
                  key={post.id}
                  id={post.id}
                  className="rounded-[28px] bg-[#161617] p-8 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[13px] text-[#86868b] tnum">
                      <span className="rounded-full bg-white/5 text-[#2997ff] px-3 py-1 font-medium">
                        {post.category}
                      </span>
                      <span>{post.readTime}</span>
                    </div>

                    <h2 className="text-[20px] sm:text-[22px] font-semibold text-white tracking-tight leading-snug">
                      {post.title}
                    </h2>

                    <p className="text-[15px] text-[#d2d2d7] leading-relaxed">
                      {post.summary}
                    </p>

                    {isExpanded && (
                      <div className="mt-4 pt-4 space-y-4 text-[14px] text-white/90 leading-relaxed bg-[#1d1d1f] p-5 rounded-[20px]">
                        {post.content.map((p, idx) => (
                          <p key={idx} className="m-0">
                            {p}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 flex items-center justify-between gap-4 text-[13px] text-[#86868b] tnum">
                    <span>
                      {post.author} · {post.date}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedBlogId(isExpanded ? null : post.id)}
                      className="text-[#2997ff] hover:underline font-medium"
                    >
                      {isExpanded
                        ? lang === "en"
                          ? "Collapse ↑"
                          : "收起阅读 ↑"
                        : lang === "en"
                        ? "Read Full Paper >"
                        : "阅读全文 >"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>

      <AppleFooter />
      <CopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
}
