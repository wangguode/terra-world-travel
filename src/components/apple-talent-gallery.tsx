"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { TalentStory } from "@/lib/apple-job-creation-data";

interface AppleTalentGalleryProps {
  talents: TalentStory[];
}

export function AppleTalentGallery({ talents }: AppleTalentGalleryProps) {
  const { lang } = useLanguage();
  const [activeId, setActiveId] = useState<string>(talents[0]?.id || "talent-1");

  const current = talents.find((t) => t.id === activeId) || talents[0];

  return (
    <div className="w-full space-y-10 terra-reveal">
      {/* 顶部人物头像/名称 Tab 切换按钮组 (Apple 标志性切换条) */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {talents.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={`rounded-full px-5 py-2.5 text-[14px] sm:text-[15px] font-medium transition cursor-pointer ${
                isActive
                  ? "bg-[#1d1d1f] text-white"
                  : "bg-white text-[#515154] hover:bg-black/5 hover:text-[#1d1d1f]"
              }`}
            >
              <span>{lang === "en" ? item.nameEn : item.nameZh}</span>
              <span className="mx-1 text-[#86868b]">·</span>
              <span className="text-[13px] text-[#86868b]">
                {lang === "en" ? item.cityEn : item.cityZh}
              </span>
            </button>
          );
        })}
      </div>

      {/* 活跃人物核心大展台 */}
      <div className="rounded-[32px] sm:rounded-[40px] bg-white p-8 sm:p-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-[28px] sm:text-[38px] font-semibold text-[#1d1d1f] tracking-tight leading-snug">
              {lang === "en" ? current.nameEn : current.nameZh}
            </h3>

            <div className="text-[14px] text-[#0071e3] font-semibold flex items-center gap-2">
              <span>{lang === "en" ? current.cityEn : current.cityZh}</span>
              <span>·</span>
              <span>{lang === "en" ? current.roleEn : current.roleZh}</span>
            </div>

            <p className="text-[17px] sm:text-[19px] text-[#515154] leading-relaxed font-normal">
              {lang === "en" ? current.bioEn : current.bioZh}
            </p>

            <div className="pt-2 flex items-center gap-4 text-[14px]">
              <span className="rounded-full bg-[#f5f5f7] px-4 py-1.5 text-[#1d1d1f] font-medium">
                TERRA World Model Lab
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 w-full">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-[#f5f5f7]">
              <Image
                key={current.id}
                src={current.image}
                alt={lang === "en" ? current.nameEn : current.nameZh}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
