"use client";

import React, { useState, useEffect } from "react";
import { TerraTravelWorkbench } from "@/components/terra-travel-workbench";
import { AppleShowcaseLanding } from "@/components/apple-showcase-landing";
import { ArrowLeft, Smartphone } from "lucide-react";

export default function HomePage() {
  const [isMobileDevice, setIsMobileDevice] = useState<boolean | null>(null);
  const [activeView, setActiveView] = useState<"apple-showcase" | "studio">("apple-showcase");

  useEffect(() => {
    // 智能检测真机移动端环境 (iPhone, iPad, Android, 小屏模式)
    const checkIsMobile = () => {
      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
      const isSmallScreen = typeof window !== "undefined" ? window.innerWidth < 768 : false;
      return isMobileUA || isSmallScreen;
    };

    const isMobile = checkIsMobile();
    setIsMobileDevice(isMobile);

    // 如果是手机真机访问，直接进入沉浸式原生 App 界面
    if (isMobile) {
      setActiveView("studio");
    }
  }, []);

  // 避免服务端客户端水合不一致的短暂加载
  if (isMobileDevice === null) {
    return <div className="min-h-screen bg-black" />;
  }

  // 手机真机直接呈现全屏原生体验
  if (isMobileDevice) {
    return <TerraTravelWorkbench />;
  }

  // PC 电脑端展示 Apple 官网级旗舰门户，可无缝切换进入交互舱
  return (
    <div>
      {activeView === "apple-showcase" ? (
        <AppleShowcaseLanding onLaunchStudio={() => setActiveView("studio")} />
      ) : (
        <div className="relative">
          {/* 桌面端交互舱顶部微型返回栏 */}
          <div className="sticky top-0 z-50 flex h-10 w-full items-center justify-between border-b border-white/10 bg-black/90 px-6 backdrop-blur-md">
            <button
              onClick={() => setActiveView("apple-showcase")}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>返回 Apple 官网展示主页</span>
            </button>
            <span className="text-[11px] font-mono text-zinc-500">
              TERRA Interactive Studio Engine
            </span>
          </div>
          <TerraTravelWorkbench />
        </div>
      )}
    </div>
  );
}
