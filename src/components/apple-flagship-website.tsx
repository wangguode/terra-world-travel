"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  BeijingSpatialWorldModel,
  type LightingMode,
} from "@/components/beijing-pulse-world-model";
import {
  ATTRACTIONS,
  SPATIAL_MOMENTS,
  type Attraction,
  type SpatialMoment,
} from "@/lib/beijing-pulse-data";

export function AppleFlagshipWebsite() {
  const [currentUrl, setCurrentUrl] = useState<string>(
    "https://terra-world-travel.153557421.workers.dev"
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [activeSpatialAttractionId, setActiveSpatialAttractionId] =
    useState<string>("forbidden-city");
  const [activeLightModeId, setActiveLightModeId] =
    useState<LightingMode["id"]>("sunset");

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

  const handleLaunchSpatialMoment = (moment: SpatialMoment) => {
    setActiveSpatialAttractionId(moment.attractionId);
    setActiveLightModeId(moment.lightingId);
    const element = document.getElementById("spatial-viewer-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLaunchAttraction = (attraction: Attraction) => {
    setActiveSpatialAttractionId(attraction.id);
    setActiveLightModeId(attraction.defaultLight);
    const element = document.getElementById("spatial-viewer-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

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

  return (
    <div className="min-h-[100dvh] bg-[#070707] text-[#f5f5f7]">
      {/* 顶部极简 Topbar */}
      <header className="sticky top-0 z-40 bg-[#070707] py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 sm:px-10">
          <a
            href="#top"
            className="flex items-center gap-2 text-[18px] font-bold tracking-tight text-white no-underline"
          >
            <span className="h-3 w-3 rounded-full bg-[#c23b3b]" />
            BEIJING PULSE
          </a>

          <nav
            aria-label="主导航"
            className="flex flex-wrap items-center gap-6 sm:gap-8 text-[18px]"
          >
            <a
              href="#spatial-viewer-section"
              className="text-white/80 hover:text-[#ff6b6b] no-underline"
            >
              360° 实景漫游
            </a>
            <a
              href="#spatial-moments"
              className="text-white/80 hover:text-[#ff6b6b] no-underline"
            >
              时空光影灵感
            </a>
            <a
              href="#featured-gallery"
              className="text-white/80 hover:text-[#ff6b6b] no-underline"
            >
              地标视界
            </a>
            <a
              href="#mobile-handoff"
              className="terra-btn rounded-full bg-white px-5 py-1.5 text-[18px] font-semibold text-[#070707] no-underline"
            >
              装进手机
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* Cinematic Hero Banner */}
        <section
          id="hero"
          className="relative min-h-[72vh] flex items-end overflow-hidden pb-16 sm:pb-24"
        >
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/forbidden-city.jpg"
              alt="紫禁城全景晨曦"
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
                Discover Beijing beyond guidebooks.
              </h1>
              <p className="mt-4 text-[22px] font-medium text-white/90">
                北京，触手可及。基于真实空间建模与四时光影渲染，随心环顾，即刻身临其境。
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#spatial-viewer-section"
                  className="terra-btn rounded-full bg-[#c23b3b] px-6 py-2.5 text-[18px] font-semibold text-white no-underline hover:bg-[#d44343]"
                >
                  开启 360° 实景漫游 ↓
                </a>
                <a
                  href="#spatial-moments"
                  className="terra-btn rounded-full bg-white/10 px-6 py-2.5 text-[18px] font-medium text-white no-underline hover:bg-white/15"
                >
                  浏览时空光影灵感
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 核心指标条 (Curated Stats) */}
        <section className="bg-[#070707] py-12">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 terra-reveal">
              <div>
                <div className="text-[36px] font-bold text-white tnum">360°</div>
                <div className="text-[14px] text-white/60">真实照片级全景空间环顾</div>
              </div>

              <div>
                <div className="text-[36px] font-bold text-white tnum">4 时</div>
                <div className="text-[14px] text-white/60">晨曦·正午·金辉·夜幕光影</div>
              </div>

              <div>
                <div className="text-[36px] font-bold text-white tnum">10 处</div>
                <div className="text-[14px] text-white/60">明清古建与当代先锋地标</div>
              </div>

              <div>
                <div className="text-[36px] font-bold text-white tnum">0 冗余</div>
                <div className="text-[14px] text-white/60">告别繁复攻略，纯净沉浸</div>
              </div>
            </div>
          </div>
        </section>

        {/* 核心剧场：360° 实景时空漫游 (The Main Stage) */}
        <section id="spatial-viewer-section" className="bg-[#070707] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="max-w-3xl terra-reveal">
              <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                360° 实景时空漫游视窗
              </h2>
              <p className="mt-3 text-[18px] text-white/70">
                按住鼠标拖拽即可自由环顾四周。切换下方四时光影时钟，直观感受晨曦、正午、黄昏金辉与深邃蓝调。
              </p>
            </div>

            <div className="mt-10 terra-reveal">
              <BeijingSpatialWorldModel
                selectedId={activeSpatialAttractionId}
                onSelectAttraction={setActiveSpatialAttractionId}
                lightModeId={activeLightModeId}
                onSelectLightMode={setActiveLightModeId}
              />
            </div>
          </div>
        </section>

        {/* 四时光影灵感：与 3D 联动的时空切片 (Curated Spatial Moments) */}
        <section id="spatial-moments" className="bg-[#0c0c0e] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="max-w-3xl terra-reveal">
              <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                四时光影灵感
              </h2>
              <p className="mt-3 text-[18px] text-white/70">
                空间与时光的相遇。点击任一切片，即刻将 3D 实景视窗对齐至该处绝佳光影时段。
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {SPATIAL_MOMENTS.map((moment) => (
                <article
                  key={moment.id}
                  className="rounded-3xl bg-[#141418] p-5 terra-reveal flex flex-col justify-between"
                >
                  <div>
                    <div className="overflow-hidden rounded-2xl relative">
                      <Image
                        src={moment.image}
                        alt={moment.title}
                        width={600}
                        height={380}
                        className="h-60 w-full object-cover hover:scale-105 transition duration-500"
                      />
                      <span className="absolute top-3 right-3 rounded-full bg-black/75 px-3 py-1 text-[14px] font-semibold text-white">
                        {moment.timeLabel}
                      </span>
                    </div>

                    <div className="mt-5">
                      <div className="text-[14px] font-semibold text-[#ff6b6b]">
                        {moment.landmarkZh}
                      </div>
                      <h3 className="mt-1 text-[22px] font-bold text-white">
                        {moment.title}
                      </h3>
                      <p className="mt-2 text-[14px] text-white/70 leading-relaxed">
                        {moment.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => handleLaunchSpatialMoment(moment)}
                      className="terra-btn w-full rounded-2xl bg-[#c23b3b] py-3 text-[14px] font-bold text-white transition hover:bg-[#d44343]"
                    >
                      载入此时空视角 (3D 漫游) →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 地标视界：高清画廊，点击即刻载入 3D (Spatial Showcase) */}
        <section id="featured-gallery" className="bg-[#070707] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="max-w-3xl terra-reveal">
              <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                地标视界
              </h2>
              <p className="mt-3 text-[18px] text-white/70">
                每一处地标皆为一座凝固的时光史诗。点击即可直接在上方 3D 视窗中无缝漫游。
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ATTRACTIONS.map((spot) => (
                <article
                  key={spot.id}
                  className="rounded-3xl bg-[#141418] p-5 terra-reveal flex flex-col justify-between"
                >
                  <div>
                    <div className="overflow-hidden rounded-2xl relative">
                      <Image
                        src={spot.image}
                        alt={spot.name.zh}
                        width={600}
                        height={360}
                        className="h-56 w-full object-cover hover:scale-105 transition duration-500"
                      />
                      <span className="absolute top-3 left-3 rounded-full bg-black/75 px-3 py-1 text-[14px] font-semibold text-white/90">
                        {spot.districtZh}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-[22px] font-bold text-white">
                        {spot.name.zh}
                      </h3>
                      <div className="mt-0.5 text-[14px] text-white/50">
                        {spot.name.en} · {spot.elevation}
                      </div>
                      <p className="mt-2 text-[14px] text-white/70 leading-relaxed">
                        {spot.essence}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => handleLaunchAttraction(spot)}
                      className="terra-btn w-full rounded-2xl bg-white/10 py-2.5 text-[14px] font-semibold text-white hover:bg-white/15 transition"
                    >
                      进入 360° 空间漫游 →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 离线与移动端跨端同步 (Mobile Companion) */}
        <section id="mobile-handoff" className="bg-[#0c0c0e] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="rounded-[32px] bg-[#141418] p-8 sm:p-14 terra-reveal">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                  <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                    装进手机，随时沉浸
                  </h2>
                  <p className="mt-4 text-[18px] text-white/70 leading-relaxed max-w-xl">
                    支持 iOS Safari 与 Android Chrome 全屏沉浸式漫游。随时随地通过手机陀螺仪与触控拖拽，感受古都时空光影。
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="terra-btn rounded-full bg-white px-6 py-3 text-[14px] font-bold text-black"
                    >
                      {copiedLink ? "已复制访问链接" : "复制网址发到手机"}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <div className="rounded-3xl bg-white p-6 text-center">
                    {qrCodeDataUrl ? (
                      <Image
                        src={qrCodeDataUrl}
                        alt="手机扫码体验"
                        width={220}
                        height={220}
                        unoptimized
                        className="h-52 w-52 rounded-2xl object-contain mx-auto"
                      />
                    ) : (
                      <div className="flex h-52 w-52 items-center justify-center rounded-2xl bg-gray-100 text-black">
                        正在生成...
                      </div>
                    )}
                    <div className="mt-3 text-[18px] font-bold text-black">
                      手机扫码即刻同步
                    </div>
                    <div className="text-[14px] text-black/60">
                      支持 iOS 与 Android 离线运行
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
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6 sm:px-10 text-[14px] text-white/60">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#c23b3b]" />
            <span>BEIJING PULSE · 发现指南之外的北京</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/wangguode/terra-world-travel"
              target="_blank"
              rel="noreferrer"
              className="text-white/60 hover:text-white no-underline"
            >
              GitHub 仓库
            </a>
            <a href="#top" className="text-white/60 hover:text-white no-underline">
              回到顶部 ↑
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
