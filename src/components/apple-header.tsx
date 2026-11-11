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
    <header className="sticky top-0 z-40 bg-[#000000]">
      <div className="mx-auto max-w-7xl flex h-12 sm:h-13 items-center justify-between px-5 sm:px-10 text-[13px] sm:text-[14px]">
        {/* 左侧品牌 Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[17px] sm:text-[19px] font-semibold text-white tracking-tight hover:text-white/90 transition no-underline"
        >
          <span className="h-2 w-2 rounded-full bg-[#2997ff]" />
          <span>{t.nav.brand}</span>
        </Link>

        {/* 中间核心导航链接 (规范简洁，绝无重复层叠) */}
        <nav aria-label="Official Navigation" className="hidden md:flex items-center gap-6 text-[#a1a1a6]">
          <Link href="/" className="hover:text-white transition no-underline">
            {t.nav.overview}
          </Link>
          <Link href="/#interactive-playground" className="hover:text-white transition no-underline">
            {t.nav.sandbox}
          </Link>
          <Link href="/#technological-pillars" className="hover:text-white transition no-underline">
            {t.nav.pillars}
          </Link>
          <Link href="/docs" className="hover:text-white transition no-underline">
            {t.nav.docs}
          </Link>
          <Link href="/research" className="hover:text-white transition no-underline">
            {t.nav.research}
          </Link>
        </nav>

        {/* 右侧动作工具栏：语言切换 + AI 抽屉 + 体验按钮 */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* 语言切换按钮 */}
          <button
            type="button"
            onClick={toggleLang}
            className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-medium text-white hover:bg-white/20 transition flex items-center gap-1"
            title="Toggle Language (English / 中文)"
          >
            <span>{t.nav.langSwitch}</span>
          </button>

          {/* AI 抽屉呼出按钮 */}
          <button
            type="button"
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[13px] font-medium text-white/90 hover:bg-white/10 hover:text-white transition"
          >
            <span>{t.nav.copilot}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#2997ff]" />
          </button>

          {/* 可选冰雪注入切换 */}
          {onToggleSnow && (
            <button
              type="button"
              onClick={onToggleSnow}
              className="rounded-full bg-white/5 px-3 py-1 text-[13px] text-[#a1a1a6] hover:bg-white/10 hover:text-white transition hidden lg:inline-block"
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
