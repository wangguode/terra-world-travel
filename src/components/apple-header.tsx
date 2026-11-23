"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface AppleHeaderProps {
  onOpenCopilot: () => void;
  variant?: "overlay" | "solid";
  // 保留可选旧属性以兼容子页面调用，不再渲染废弃的雪景按钮
  snowMode?: boolean;
  onToggleSnow?: () => void;
}

export function AppleHeader({
  onOpenCopilot,
  variant = "solid",
}: AppleHeaderProps) {
  const { lang, toggleLang } = useLanguage();
  const isOverlay = variant === "overlay";

  return (
    <header
      className={
        isOverlay
          ? "fixed top-0 inset-x-0 z-40 border-b border-white/10 bg-[#040812]/55 backdrop-blur-xl transition-colors"
          : "sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur-xl transition-colors"
      }
    >
      <div className="mx-auto max-w-7xl flex h-13 items-center justify-between px-4 sm:px-8 text-[13px]">
        {/* 左侧品牌标识 */}
        <Link
          href="/"
          className={`flex items-center gap-2.5 text-[15px] sm:text-[16px] font-semibold tracking-tight transition hover:opacity-80 no-underline ${
            isOverlay ? "text-white" : "text-[#1d1d1f]"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          <span>TERRA-OASIS</span>
        </Link>

        {/* 中间极简四栏导航 */}
        <nav
          aria-label="Primary Navigation"
          className={`hidden md:flex items-center gap-7 font-medium ${
            isOverlay ? "text-white/75" : "text-[#515154]"
          }`}
        >
          <Link
            href="/#hero-3d-world"
            className={`transition no-underline ${
              isOverlay ? "hover:text-white" : "hover:text-[#1d1d1f]"
            }`}
          >
            {lang === "en" ? "3D Earth" : "3D 真实地球"}
          </Link>
          <Link
            href="/#knowledge-graph"
            className={`transition no-underline ${
              isOverlay ? "hover:text-white" : "hover:text-[#1d1d1f]"
            }`}
          >
            {lang === "en" ? "Knowledge Graph" : "学术知识图谱"}
          </Link>
          <Link
            href="/research"
            className={`transition no-underline ${
              isOverlay ? "hover:text-white" : "hover:text-[#1d1d1f]"
            }`}
          >
            {lang === "en" ? "Research" : "研究专刊"}
          </Link>
          <Link
            href="/docs"
            className={`transition no-underline ${
              isOverlay ? "hover:text-white" : "hover:text-[#1d1d1f]"
            }`}
          >
            {lang === "en" ? "Docs" : "开发文档"}
          </Link>
        </nav>

        {/* 右侧克制操作栏 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            className={`rounded-full px-3 py-1 text-[12px] font-medium transition cursor-pointer ${
              isOverlay
                ? "border border-white/15 bg-white/8 text-white/85 hover:bg-white/15"
                : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]"
            }`}
            title="Toggle Language"
          >
            {lang === "en" ? "中文" : "EN"}
          </button>

          <button
            type="button"
            onClick={onOpenCopilot}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition cursor-pointer ${
              isOverlay
                ? "border border-white/15 bg-white/8 text-white hover:bg-white/15"
                : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]"
            }`}
          >
            <span>AI Copilot</span>
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          </button>

          <a
            href="https://github.com/wangguode/terra-world-travel"
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden sm:inline-flex items-center rounded-full px-3.5 py-1 text-[12px] font-medium transition no-underline ${
              isOverlay
                ? "bg-white text-[#060b16] hover:bg-white/90"
                : "bg-[#1d1d1f] text-white hover:bg-[#333336]"
            }`}
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
