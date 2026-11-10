"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  BeijingSpatialWorldModel,
} from "@/components/beijing-pulse-world-model";
import {
  VISUAL_CHAPTERS,
} from "@/lib/beijing-pulse-data";

export function AppleFlagshipWebsite() {
  const [currentUrl, setCurrentUrl] = useState<string>(
    "https://terra-world-travel.153557421.workers.dev"
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [activeSpotId, setActiveSpotId] = useState<string>("forbidden-city");
  const [activeHour, setActiveHour] = useState<number>(17.5);
  const [snowMode, setSnowMode] = useState<boolean>(false);

  useEffect(() => {
    const nodes = document.querySelectorAll(".terra-reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.08 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const origin =
      typeof window !== "undefined" && window.location.origin.includes("workers.dev")
        ? window.location.origin
        : "https://terra-world-travel.153557421.workers.dev";

    QRCode.toDataURL(origin, {
      width: 400,
      margin: 1,
      color: {
        dark: "#070707",
        light: "#f5f5f7",
      },
    })
      .then((dataUri) => {
        setCurrentUrl(origin);
        setQrCodeDataUrl(dataUri);
      })
      .catch(() => {});
  }, []);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    }
  };

  const handleTeleportToSpot = (spotId: string, hour: number) => {
    setActiveSpotId(spotId);
    setActiveHour(hour);
    const el = document.getElementById("spatial-stage");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#070707] text-[#f5f5f7]">
      {/* 顶部极简透明悬浮 Topbar */}
      <header className="absolute top-0 left-0 right-0 z-40 bg-transparent py-4 sm:py-5 pointer-events-none">
        <div className="flex w-full items-center justify-between gap-4 px-6 sm:px-10">
          <a
            href="#spatial-stage"
            className="pointer-events-auto flex items-center gap-2 text-[16px] sm:text-[18px] font-bold tracking-tight text-white no-underline"
          >
            <span className="h-2 w-2 rounded-full bg-[#c23b3b]" />
            <span>BEIJING PULSE</span>
            <span className="text-[14px] font-normal text-white/40 tracking-wider hidden sm:inline">
              北京 · 4D空间世界模型
            </span>
          </a>

          <nav
            aria-label="主导航"
            className="pointer-events-auto flex items-center gap-4 sm:gap-8 text-[14px] sm:text-[16px]"
          >
            <a
              href="#spatial-stage"
              className="text-white/70 hover:text-white no-underline transition hidden md:inline"
            >
              时空光影
            </a>
            <a
              href="#visual-chapters"
              className="text-white/70 hover:text-white no-underline transition hidden md:inline"
            >
              画报长卷
            </a>
            <button
              type="button"
              onClick={() => setSnowMode(!snowMode)}
              className={`terra-btn rounded-full px-3.5 sm:px-4 py-1.5 text-[14px] font-medium transition ${
                snowMode
                  ? "bg-[#c23b3b] text-white"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {snowMode ? "已覆初雪" : "紫禁初雪"}
            </button>
            <a
              href="#mobile-companion"
              className="terra-btn rounded-full bg-white px-4 sm:px-5 py-1.5 text-[14px] font-semibold text-[#070707] no-underline hover:bg-white/90"
            >
              装进手机
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* 核心第一屏：全屏 4D 真实城市时空世界模型仿真仪 */}
        <section id="spatial-stage" className="relative w-full h-[100dvh] overflow-hidden bg-[#070707]">
          {/* 左上侧：主标题与世界模型定位（高技术简约风） */}
          <div className="absolute top-24 left-6 right-6 sm:right-auto sm:left-10 z-30 max-w-lg pointer-events-auto">
            <h1 className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight leading-tight">
              北京 · 4D 城市时空世界模型
            </h1>
            <p className="mt-2 text-[16px] sm:text-[18px] text-white/70 leading-relaxed m-0 tnum">
              六百年古都神经深度场与物理太阳光影实时推演
            </p>
          </div>

          <BeijingSpatialWorldModel
            selectedSpotId={activeSpotId}
            onSelectSpot={setActiveSpotId}
            hour={activeHour}
            onChangeHour={setActiveHour}
            snowMode={snowMode}
          />
        </section>

        {/* 岁月长卷：画报散文流（次级深度沉思） */}
        <section id="visual-chapters" className="bg-[#0c0c0e] py-24 sm:py-36">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[36px] font-bold text-white tracking-tight">
                岁月沉思 · 散文长卷
              </h2>
              <p className="mt-3 text-[18px] text-white/70 leading-relaxed">
                每一座古建皆有灵魂，每一寸红墙皆藏光阴。放下走马观花的攻略，在画报级宽幅光影中慢慢漫游。
              </p>
            </div>

            {/* 章节一：暮色紫禁 */}
            <article className="mt-20 sm:mt-28">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 terra-reveal">
                  <div
                    onClick={() =>
                      handleTeleportToSpot(
                        VISUAL_CHAPTERS[0].targetSpotId,
                        VISUAL_CHAPTERS[0].targetHour
                      )
                    }
                    className="group overflow-hidden rounded-[28px] relative aspect-[16/10] cursor-pointer"
                  >
                    <Image
                      src={VISUAL_CHAPTERS[0].image}
                      alt={VISUAL_CHAPTERS[0].title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 lg:pl-6 space-y-4 terra-reveal">
                  <h3 className="text-[36px] font-bold text-white tracking-tight">
                    {VISUAL_CHAPTERS[0].chapterNumber} · {VISUAL_CHAPTERS[0].title}
                  </h3>
                  <p className="text-[16px] text-white/80 leading-relaxed">
                    {VISUAL_CHAPTERS[0].essay}
                  </p>
                  <div className="text-[14px] text-white/40">
                    {VISUAL_CHAPTERS[0].details}
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleTeleportToSpot(
                          VISUAL_CHAPTERS[0].targetSpotId,
                          VISUAL_CHAPTERS[0].targetHour
                        )
                      }
                      className="terra-btn rounded-full bg-white/10 px-5 py-2 text-[14px] font-medium text-white hover:bg-white/15 transition"
                    >
                      在视窗中载入此黄昏景致 ↑
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* 章节二：晨雾雄关（反向构图，丰富节奏） */}
            <article className="mt-24 sm:mt-36">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-5 lg:pr-6 space-y-4 order-2 lg:order-1 terra-reveal">
                  <h3 className="text-[36px] font-bold text-white tracking-tight">
                    {VISUAL_CHAPTERS[1].chapterNumber} · {VISUAL_CHAPTERS[1].title}
                  </h3>
                  <p className="text-[16px] text-white/80 leading-relaxed">
                    {VISUAL_CHAPTERS[1].essay}
                  </p>
                  <div className="text-[14px] text-white/40">
                    {VISUAL_CHAPTERS[1].details}
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleTeleportToSpot(
                          VISUAL_CHAPTERS[1].targetSpotId,
                          VISUAL_CHAPTERS[1].targetHour
                        )
                      }
                      className="terra-btn rounded-full bg-white/10 px-5 py-2 text-[14px] font-medium text-white hover:bg-white/15 transition"
                    >
                      在视窗中载入此晨曦景致 ↑
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 order-1 lg:order-2 terra-reveal">
                  <div
                    onClick={() =>
                      handleTeleportToSpot(
                        VISUAL_CHAPTERS[1].targetSpotId,
                        VISUAL_CHAPTERS[1].targetHour
                      )
                    }
                    className="group overflow-hidden rounded-[28px] relative aspect-[16/10] cursor-pointer"
                  >
                    <Image
                      src={VISUAL_CHAPTERS[1].image}
                      alt={VISUAL_CHAPTERS[1].title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                </div>
              </div>
            </article>

            {/* 章节三：晴空坛庙 */}
            <article className="mt-24 sm:mt-36">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 terra-reveal">
                  <div
                    onClick={() =>
                      handleTeleportToSpot(
                        VISUAL_CHAPTERS[2].targetSpotId,
                        VISUAL_CHAPTERS[2].targetHour
                      )
                    }
                    className="group overflow-hidden rounded-[28px] relative aspect-[16/10] cursor-pointer"
                  >
                    <Image
                      src={VISUAL_CHAPTERS[2].image}
                      alt={VISUAL_CHAPTERS[2].title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 lg:pl-6 space-y-4 terra-reveal">
                  <h3 className="text-[36px] font-bold text-white tracking-tight">
                    {VISUAL_CHAPTERS[2].chapterNumber} · {VISUAL_CHAPTERS[2].title}
                  </h3>
                  <p className="text-[16px] text-white/80 leading-relaxed">
                    {VISUAL_CHAPTERS[2].essay}
                  </p>
                  <div className="text-[14px] text-white/40">
                    {VISUAL_CHAPTERS[2].details}
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleTeleportToSpot(
                          VISUAL_CHAPTERS[2].targetSpotId,
                          VISUAL_CHAPTERS[2].targetHour
                        )
                      }
                      className="terra-btn rounded-full bg-white/10 px-5 py-2 text-[14px] font-medium text-white hover:bg-white/15 transition"
                    >
                      在视窗中载入此晴空景致 ↑
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* 掌心北京 · 离线手持 (Mobile Companion) */}
        <section id="mobile-companion" className="bg-[#070707] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="rounded-[32px] bg-[#121214] p-8 sm:p-14 terra-reveal">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                  <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                    静下心，把北京带在掌中
                  </h2>
                  <p className="mt-4 text-[18px] text-white/70 leading-relaxed max-w-xl">
                    支持 iOS Safari 与 Android Chrome 浏览器全屏沉浸。随时随地通过手机屏幕与微风指触，感受古都的安宁与流光。
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="terra-btn rounded-full bg-white px-7 py-3 text-[14px] font-bold text-black hover:bg-white/90 transition"
                    >
                      {copiedLink ? "已复制访问网址" : "复制网址到手机"}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <div className="rounded-3xl bg-white p-6 text-center">
                    {qrCodeDataUrl ? (
                      <Image
                        src={qrCodeDataUrl}
                        alt="手机扫码体验"
                        width={200}
                        height={200}
                        unoptimized
                        className="h-48 w-48 rounded-xl object-contain mx-auto"
                      />
                    ) : (
                      <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-gray-100 text-black">
                        生成中...
                      </div>
                    )}
                    <div className="mt-3 text-[16px] font-bold text-black">
                      手机扫码 · 即刻沉浸
                    </div>
                    <div className="text-[14px] text-black/60">
                      支持 iOS 与 Android 离线手持
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 极简底部 Footer */}
      <footer className="bg-[#070707] py-12">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6 sm:px-10 text-[14px] text-white/50">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#c23b3b]" />
            <span>BEIJING PULSE · 发现指南之外的北京</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/wangguode/terra-world-travel"
              target="_blank"
              rel="noreferrer"
              className="text-white/50 hover:text-white no-underline transition"
            >
              GitHub
            </a>
            <a
              href="#top"
              className="text-white/50 hover:text-white no-underline transition"
            >
              回到顶部 ↑
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
