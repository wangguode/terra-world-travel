"use client";

import React from "react";
import { useLanguage } from "@/lib/language-context";

interface ServiceNavItem {
  id: string;
  nameEn: string;
  nameZh: string;
  icon: (className?: string) => React.ReactNode;
}

const SERVICE_ITEMS: ServiceNavItem[] = [
  {
    id: "terra-one",
    nameEn: "TERRA One",
    nameZh: "TERRA One 聚合",
    icon: (className = "w-6 h-6") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: "terra-reality",
    nameEn: "TERRA Reality",
    nameZh: "4D 神经现实",
    icon: (className = "w-6 h-6") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: "terra-studio",
    nameEn: "TERRA Studio",
    nameZh: "因果物理引擎",
    icon: (className = "w-6 h-6") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" fillOpacity="0.2" />
      </svg>
    ),
  },
  {
    id: "terra-arcade",
    nameEn: "TERRA Arcade",
    nameZh: "直觉物理游乐场",
    icon: (className = "w-6 h-6") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <circle cx="15" cy="13" r="1" />
        <circle cx="18" cy="11" r="1" />
        <rect x="2" y="6" width="20" height="12" rx="6" />
      </svg>
    ),
  },
  {
    id: "terra-telemetry",
    nameEn: "TERRA Telemetry",
    nameZh: "具身遥测与闭环",
    icon: (className = "w-6 h-6") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    id: "terra-research",
    nameEn: "TERRA Research",
    nameZh: "学术论文与评测",
    icon: (className = "w-6 h-6") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: "terra-cloud",
    nameEn: "TERRA Cloud",
    nameZh: "边缘流式分发",
    icon: (className = "w-6 h-6") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </svg>
    ),
  },
];

export function AppleServicesChapternav() {
  const { lang } = useLanguage();

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label="Apple Services Navigation"
      className="bg-[#000000] py-4 w-full box-border"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 list-none p-0 m-0">
          {SERVICE_ITEMS.map((item) => (
            <li key={item.id} className="text-center shrink-0">
              <button
                type="button"
                onClick={() => handleScroll(item.id)}
                className="group flex flex-col items-center gap-2 text-[#a1a1a6] hover:text-white transition cursor-pointer"
              >
                <div className="text-[#a1a1a6] group-hover:text-white transition group-hover:scale-105 duration-200">
                  {item.icon("w-7 h-7 sm:w-8 sm:h-8")}
                </div>
                <span className="text-[13px] font-medium tracking-tight whitespace-nowrap">
                  {lang === "en" ? item.nameEn : item.nameZh}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
