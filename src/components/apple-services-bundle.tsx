"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface PlanTier {
  id: string;
  nameEn: string;
  nameZh: string;
  priceEn: string;
  priceZh: string;
  trialEn: string;
  trialZh: string;
  descEn: string;
  descZh: string;
  services: string[];
  ctaEn: string;
  ctaZh: string;
}

const PLANS: PlanTier[] = [
  {
    id: "individual",
    nameEn: "Individual",
    nameZh: "个人开发者版",
    priceEn: "$19.95/mo.",
    priceZh: "¥128/月",
    trialEn: "Free 1-month trial",
    trialZh: "首月免费体验",
    descEn: "Includes TERRA Reality, TERRA Studio, TERRA Arcade, and 50GB Cloud Telemetry.",
    descZh: "包含 4D 神经现实漫游、因果物理推演工作台、直觉物理沙盒与 50GB 遥测存储。",
    services: ["TERRA Reality", "TERRA Studio", "TERRA Arcade", "TERRA Cloud (50GB)"],
    ctaEn: "Try TERRA One free",
    ctaZh: "免费试用 TERRA One",
  },
  {
    id: "family",
    nameEn: "Family",
    nameZh: "团队与实验室版",
    priceEn: "$25.95/mo.",
    priceZh: "¥168/月",
    trialEn: "Free 1-month trial",
    trialZh: "首月免费体验",
    descEn: "Share with up to five researchers. Includes everything in Individual plus 200GB Telemetry.",
    descZh: "最多可支持 5 位科研人员协同。包含个人版全部服务，升级至 200GB 动态遥测。",
    services: [
      "TERRA Reality",
      "TERRA Studio",
      "TERRA Arcade",
      "TERRA Telemetry",
      "TERRA Cloud (200GB)",
    ],
    ctaEn: "Try TERRA One free",
    ctaZh: "免费试用团队版",
  },
  {
    id: "premier",
    nameEn: "Premier",
    nameZh: "旗舰科研尊享版",
    priceEn: "$37.95/mo.",
    priceZh: "¥248/月",
    trialEn: "Free 1-month trial",
    trialZh: "首月免费体验",
    descEn: "The ultimate spatial intelligence suite. Includes all six services and 2TB Cloud Telemetry.",
    descZh: "顶配全景空间智能套件。囊括全部 6 项核心服务与 2TB 高速神经张量云存储。",
    services: [
      "TERRA Reality",
      "TERRA Studio",
      "TERRA Arcade",
      "TERRA Telemetry",
      "TERRA Research",
      "TERRA Cloud (2TB)",
    ],
    ctaEn: "Try TERRA One free",
    ctaZh: "免费试用旗舰版",
  },
];

export function AppleServicesBundle() {
  const { lang } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<string>("premier");

  return (
    <section id="terra-one" className="relative bg-[#000000] py-20 sm:py-28 terra-reveal w-full box-border">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 space-y-12 w-full box-border">
        {/* Apple 经典居中大标题 */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#1c1c1e] px-4 py-1.5 text-[14px] font-medium text-white">
            <span className="h-2 w-2 rounded-full bg-[#2997ff]" />
            <span>TERRA One</span>
          </div>

          <h2 className="text-[32px] sm:text-[48px] lg:text-[56px] font-semibold text-white tracking-tight leading-[1.08]">
            {lang === "en"
              ? "Bundle up to six TERRA services and enjoy more for less."
              : "聚合六大世界模型空间服务，开启极致全景体验。"}
          </h2>

          <p className="text-[17px] sm:text-[19px] text-[#d2d2d7] leading-relaxed font-normal">
            {lang === "en"
              ? "Get the world’s leading neural simulation tools and spatial datasets in one simple subscription. Share across all your devices and research workflows."
              : "通过一个订阅包囊括业界前沿的神经仿真工具与空间时空数据集。无缝同步于你的全部工作站与科研工作流。"}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[15px]">
            <a
              href="#pricing-plans"
              className="rounded-full bg-white px-7 py-3 text-black font-semibold hover:bg-white/90 transition no-underline"
            >
              {lang === "en" ? "Try TERRA One free" : "免费体验 TERRA One"}
            </a>
            <a
              href="/docs"
              className="text-[#2997ff] hover:underline flex items-center gap-1 font-medium transition no-underline"
            >
              <span>{lang === "en" ? "Compare all plans" : "对比所有方案"}</span>
              <span>&gt;</span>
            </a>
          </div>
        </div>

        {/* 方案卡片三列排布 */}
        <div id="pricing-plans" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 w-full box-border">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`rounded-[32px] p-6 sm:p-8 flex flex-col justify-between transition cursor-pointer box-border ${
                  isSelected
                    ? "bg-[#1d1d1f]"
                    : "bg-[#121214] hover:bg-[#161617]"
                }`}
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[24px] sm:text-[28px] font-semibold text-white tracking-tight">
                      {lang === "en" ? plan.nameEn : plan.nameZh}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-baseline gap-2">
                      <span className="text-[28px] sm:text-[32px] font-semibold text-white tracking-tight">
                        {lang === "en" ? plan.priceEn : plan.priceZh}
                      </span>
                      <span className="text-[14px] text-[#86868b]">
                        {lang === "en" ? plan.trialEn : plan.trialZh}
                      </span>
                    </div>
                  </div>

                  <p className="text-[15px] sm:text-[16px] text-[#d2d2d7] leading-relaxed">
                    {lang === "en" ? plan.descEn : plan.descZh}
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="text-[13px] font-medium text-[#86868b]">
                      {lang === "en" ? "Services included:" : "包含的核心服务："}
                    </div>
                    <ul className="space-y-2.5 list-none p-0 m-0 text-[14px] sm:text-[15px] text-[#f5f5f7]">
                      {plan.services.map((svc) => (
                        <li key={svc} className="flex items-center gap-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#2997ff] shrink-0" />
                          <span>{svc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    type="button"
                    className={`w-full rounded-full py-3 text-[15px] font-semibold transition cursor-pointer ${
                      isSelected
                        ? "bg-[#0071e3] text-white hover:bg-[#0077ed]"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {lang === "en" ? plan.ctaEn : plan.ctaZh}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
