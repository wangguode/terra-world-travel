"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { getTranslation } from "@/lib/i18n";

interface AppleHeaderProps {
  onOpenCopilot: () => void;
  snowMode?: boolean;
  onToggleSnow?: () => void;
}

export function AppleHeader({
  onOpenCopilot,
  snowMode,
  onToggleSnow,
}: AppleHeaderProps) {
  const { lang, toggleLang } = useLanguage();
  const t = getTranslation(lang);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl flex h-12 sm:h-13 items-center justify-between px-5 sm:px-10 text-[13px] sm:text-[14px]">
        {/* 左侧品牌 Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[17px] sm:text-[19px] font-semibold text-[#1d1d1f] tracking-tight hover:opacity-80 transition no-underline"
        >
          <span className="h-2 w-2 rounded-full bg-[#0071e3]" />
          <span>{t.nav.brand}</span>
        </Link>

        {/* 中间核心导航链接 (Apple 经典浅色风格，灰字 hover 变深黑) */}
        <nav aria-label="Official Navigation" className="hidden md:flex items-center gap-6 text-[#515154]">
          <Link href="/" className="hover:text-[#1d1d1f] transition no-underline">
            {t.nav.overview}
          </Link>
          <Link href="/#interactive-playground" className="hover:text-[#1d1d1f] transition no-underline">
            {t.nav.sandbox}
          </Link>
          <Link href="/#ecosystem-pillars" className="hover:text-[#1d1d1f] transition no-underline">
            {t.nav.pillars}
          </Link>
          <Link href="/docs" className="hover:text-[#1d1d1f] transition no-underline">
            {t.nav.docs}
          </Link>
          <Link href="/research" className="hover:text-[#1d1d1f] transition no-underline">
            {t.nav.research}
          </Link>
        </nav>

        {/* 右侧动作工具栏：语言切换 + AI 抽屉 + 体验按钮 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 语言切换按钮 (温润浅灰胶囊) */}
          <button
            type="button"
            onClick={toggleLang}
            className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition flex items-center gap-1"
            title="Toggle Language (English / 中文)"
          >
            <span>{t.nav.langSwitch}</span>
          </button>

          {/* AI 抽屉呼出按钮 */}
          <button
            type="button"
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 py-1 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition"
          >
            <span>{t.nav.copilot}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#0071e3]" />
          </button>

          {/* 可选冰雪注入切换 */}
          {onToggleSnow && (
            <button
              type="button"
              onClick={onToggleSnow}
              className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[13px] text-[#515154] hover:bg-[#e8e8ed] hover:text-[#1d1d1f] transition hidden lg:inline-block"
            >
              {snowMode ? t.nav.snowInjected : t.nav.snowInject}
            </button>
          )}

          {/* Apple 经典蓝药丸行动按钮 */}
          <Link
            href="/#interactive-playground"
            className="rounded-full bg-[#0071e3] px-3.5 sm:px-4 py-1 text-[13px] font-medium text-white hover:bg-[#0077ed] transition no-underline"
          >
            {t.nav.launch}
          </Link>
        </div>
      </div>
    </header>
  );
}
