"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { JobCreationStory } from "@/lib/apple-job-creation-data";

interface AppleStoryGalleryProps {
  stories: JobCreationStory[];
}

export function AppleStoryGallery({ stories }: AppleStoryGalleryProps) {
  const { lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const current = stories[activeIndex] || stories[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full space-y-8 terra-reveal">
      {/* 1. 主视觉照片画廊 */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#1c1c1e]">
        <Image
          key={current.id}
          src={current.image}
          alt={lang === "en" ? current.nameEn : current.nameZh}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 85vw"
          className="object-cover transition-opacity duration-700 ease-out"
        />

        {/* 顶部轻量标签 */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
          <span className="rounded-full bg-black/60 px-4 py-1.5 text-[13px] font-medium text-white">
            {lang === "en" ? current.badgeEn : current.badgeZh}
          </span>
        </div>

        {/* 悬停左右切换箭头 (Apple PaddleNav) */}
        <div className="absolute inset-y-0 left-4 sm:left-6 flex items-center">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous story"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/70 transition cursor-pointer"
          >
            <span className="text-[18px] sm:text-[20px] leading-none">‹</span>
          </button>
        </div>

        <div className="absolute inset-y-0 right-4 sm:right-6 flex items-center">
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next story"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/70 transition cursor-pointer"
          >
            <span className="text-[18px] sm:text-[20px] leading-none">›</span>
          </button>
        </div>
      </div>

      {/* 2. Apple 标志性圆点 Tab 导航 (DotNav) */}
      <div className="flex items-center justify-center gap-2.5">
        {stories.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition cursor-pointer ${
                isActive ? "w-8 bg-[#0071e3]" : "w-2.5 bg-black/20 hover:bg-black/40"
              }`}
            />
          );
        })}
      </div>

      {/* 3. Apple 经典图文解说卡片 (Caption Wrapper) */}
      <div className="rounded-[28px] bg-white p-8 sm:p-12 space-y-4">
        <div className="text-[14px] text-[#515154] font-medium flex flex-wrap items-center gap-2">
          <span className="text-[#1d1d1f] font-semibold text-[16px]">
            {lang === "en" ? current.nameEn : current.nameZh}
          </span>
          <span>|</span>
          <span>{lang === "en" ? current.fieldEn : current.fieldZh}</span>
          <span>|</span>
          <span>{lang === "en" ? current.locationEn : current.locationZh}</span>
        </div>

        <p className="text-[20px] sm:text-[24px] font-semibold text-[#1d1d1f] leading-snug tracking-tight">
          &ldquo;{lang === "en" ? current.quoteEn : current.quoteZh}&rdquo;
        </p>

        <p className="text-[16px] sm:text-[17px] text-[#515154] leading-relaxed max-w-4xl font-normal">
          {lang === "en" ? current.storyEn : current.storyZh}
        </p>
      </div>
    </div>
  );
}
