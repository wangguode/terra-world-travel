"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  BeijingSpatialWorldModel,
  type TimeOfDay,
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
  const [activeTime, setActiveTime] = useState<TimeOfDay>("sunset");

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

  const handleTeleportToSpot = (spotId: string, time: TimeOfDay) => {
    setActiveSpotId(spotId);
    setActiveTime(time);
    const el = document.getElementById("spatial-stage");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#070707] text-[#f5f5f7]">
      {/* 顶部极简 Topbar */}
      <header className="sticky top-0 z-40 bg-[#070707] py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 sm:px-10">
          <a
            href="#top"
            className="flex items-center gap-2.5 text-[18px] font-bold tracking-tight text-white no-underline"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#c23b3b]" />
            <span>BEIJING PULSE</span>
            <span className="text-[14px] font-normal text-white/40 tracking-wider hidden sm:inline">
              北京 · 岁月静好
            </span>
          </a>

          <nav
            aria-label="主导航"
            className="flex flex-wrap items-center gap-6 sm:gap-10 text-[16px]"
          >
            <a
              href="#spatial-stage"
              className="text-white/70 hover:text-white no-underline transition"
            >
              四时光影
            </a>
            <a
              href="#visual-chapters"
              className="text-white/70 hover:text-white no-underline transition"
            >
              画报长卷
            </a>
            <a
              href="#mobile-companion"
              className="terra-btn rounded-full bg-white px-5 py-1.5 text-[14px] font-semibold text-[#070707] no-underline hover:bg-white/90"
            >
              装进手机
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* 纯净诗意 Hero */}
        <section
          id="hero"
          className="relative min-h-[75vh] flex items-end overflow-hidden pb-16 sm:pb-24"
        >
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/forbidden-city.jpg"
              alt="故宫紫禁城全景晨曦"
              width={1600}
              height={900}
              priority
              className="h-full w-full object-cover object-center brightness-90"
            />
            <div className="absolute inset-0 bg-[#070707]/60" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 w-full terra-enter">
            <div className="max-w-3xl">
              <h1 className="text-[36px] sm:text-[56px] lg:text-[80px] font-bold tracking-tight text-white leading-[1.05]">
                Beijing in Timeless Light.
              </h1>
              <p className="mt-5 text-[22px] font-medium text-white/90 leading-relaxed">
                六百年古都，在晨曦、晴空、金辉与蓝调之间无声流淌。静下心，感受每一寸建筑与时光的静默守候。
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#spatial-stage"
                  className="terra-btn rounded-full bg-[#c23b3b] px-7 py-3 text-[16px] font-semibold text-white no-underline hover:bg-[#d44343] transition"
                >
                  静观四时光影 ↓
                </a>
                <a
                  href="#visual-chapters"
                  className="terra-btn rounded-full bg-white/10 px-7 py-3 text-[16px] font-medium text-white no-underline hover:bg-white/15 transition"
                >
                  翻阅岁月长卷
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 核心剧场：真实无畸变四时光影视窗 (The Main Stage) */}
        <section id="spatial-stage" className="bg-[#070707] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                四时光影 · 沉浸视界
              </h2>
              <p className="mt-3 text-[18px] text-white/70 leading-relaxed">
                保持真实光学透视，拒绝球面畸变。切换上方地标与右下角时光刻度，静观晨曦初露、日悬中天、金瓦落日与蓝调夜幕。
              </p>
            </div>

            <div className="mt-10 terra-reveal">
              <BeijingSpatialWorldModel
                selectedSpotId={activeSpotId}
                onSelectSpot={setActiveSpotId}
                selectedTime={activeTime}
                onSelectTime={setActiveTime}
              />
            </div>
          </div>
        </section>

        {/* 岁月长卷：画报散文流（彻底抛弃小卡片堆砌，回归画报大美） */}
        <section id="visual-chapters" className="bg-[#0c0c0e] py-24 sm:py-36">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                岁月沉思 · 散文长卷
              </h2>
              <p className="mt-3 text-[18px] text-white/70 leading-relaxed">
                每一座古建皆有灵魂，每一寸红墙皆藏光阴。放下走马观花的攻略，在画报级宽幅光影中慢慢漫游。
              </p>
            </div>

            {/* 章节一：暮色紫禁 */}
            <article className="mt-20 sm:mt-28 terra-reveal">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                  <div className="overflow-hidden rounded-[28px] relative aspect-[16/10]">
                    <Image
                      src={VISUAL_CHAPTERS[0].image}
                      alt={VISUAL_CHAPTERS[0].title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover object-center"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 lg:pl-6 space-y-4">
                  <h3 className="text-[32px] sm:text-[38px] font-bold text-white tracking-tight">
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
                      onClick={() => handleTeleportToSpot("forbidden-city", "sunset")}
                      className="terra-btn rounded-full bg-white/10 px-5 py-2 text-[14px] font-medium text-white hover:bg-white/15 transition"
                    >
                      在视窗中载入此黄昏景致 ↑
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* 章节二：晨雾雄关（反向构图，丰富节奏） */}
            <article className="mt-24 sm:mt-36 terra-reveal">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-5 lg:pr-6 space-y-4 order-2 lg:order-1">
                  <h3 className="text-[32px] sm:text-[38px] font-bold text-white tracking-tight">
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
                      onClick={() => handleTeleportToSpot("great-wall", "dawn")}
                      className="terra-btn rounded-full bg-white/10 px-5 py-2 text-[14px] font-medium text-white hover:bg-white/15 transition"
                    >
                      在视窗中载入此晨曦景致 ↑
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 order-1 lg:order-2">
                  <div className="overflow-hidden rounded-[28px] relative aspect-[16/10]">
                    <Image
                      src={VISUAL_CHAPTERS[1].image}
                      alt={VISUAL_CHAPTERS[1].title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover object-center"
                    />
                  </div>
                </div>
              </div>
            </article>

            {/* 章节三：晴空坛庙 */}
            <article className="mt-24 sm:mt-36 terra-reveal">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                  <div className="overflow-hidden rounded-[28px] relative aspect-[16/10]">
                    <Image
                      src={VISUAL_CHAPTERS[2].image}
                      alt={VISUAL_CHAPTERS[2].title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover object-center"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 lg:pl-6 space-y-4">
                  <h3 className="text-[32px] sm:text-[38px] font-bold text-white tracking-tight">
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
                      onClick={() => handleTeleportToSpot("temple-of-heaven", "noon")}
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
