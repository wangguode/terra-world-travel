"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  BeijingSpatialWorldModel,
} from "@/components/beijing-pulse-world-model";
import ATTRACTIONS_DATA from "@/lib/beijing-pulse-attractions.json";

interface AttractionItem {
  id: string;
  name: { en: string; zh: string };
  category: string;
  district: string;
  duration: string;
  tags: string[];
  image: string;
  address: { en: string; zh: string };
  hours: { en: string; zh: string };
  ticket: { en: string; zh: string };
  transport: { en: string; zh: string };
  description: { en: string; zh: string };
}

const ATTRACTIONS = ATTRACTIONS_DATA as AttractionItem[];

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

  const handleTeleportToSpot = (spotId: string) => {
    setActiveSpotId(spotId);
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
              世界模型
            </a>
            <a
              href="#curated-spots"
              className="text-white/70 hover:text-white no-underline transition hidden md:inline"
            >
              精选地标
            </a>
            <a
              href="#about"
              className="text-white/70 hover:text-white no-underline transition hidden md:inline"
            >
              关于项目
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
              href="#about"
              className="terra-btn rounded-full bg-white px-4 sm:px-5 py-1.5 text-[14px] font-semibold text-[#070707] no-underline hover:bg-white/90"
            >
              装进手机
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* 核心第一屏：开源 4D 城市空间世界模型视界 */}
        <section id="spatial-stage" className="relative w-full h-[100dvh] overflow-hidden bg-[#070707]">
          <div className="absolute top-20 sm:top-24 left-6 right-6 sm:right-auto sm:left-10 z-30 max-w-lg pointer-events-auto">
            <h1 className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight leading-tight">
              北京 · 4D 城市时空世界模型
            </h1>
            <p className="mt-2 text-[16px] sm:text-[18px] text-white/70 leading-relaxed m-0 tnum">
              六百年古都神经辐射场与真实城市环境时空仿真系统
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

        {/* 核心第二屏：继承自 beijing-pulse 的真实精选地标库 */}
        <section id="curated-spots" className="bg-[#0c0c0e] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight">
                精选地标 · 双语导览
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">
                收录北京核心历史与文化地标，点击任意卡片即可在上方世界模型中载入三维空间视界。
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {ATTRACTIONS.map((spot) => (
                <article
                  key={spot.id}
                  className="terra-reveal rounded-[24px] bg-[#141416] p-5 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01]"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[18px]">
                      <Image
                        src={`/${spot.image}`}
                        alt={spot.name.zh}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {spot.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/5 px-2.5 py-0.5 text-[14px] text-white/60"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="mt-3 text-[20px] font-bold text-white tracking-tight">
                      {spot.name.zh}
                      <span className="ml-2 text-[14px] font-normal text-white/40">
                        {spot.name.en}
                      </span>
                    </h3>

                    <p className="mt-2 text-[14px] text-white/70 leading-relaxed">
                      {spot.description.zh}
                    </p>

                    <div className="mt-3 space-y-1 text-[14px] text-white/40 tnum">
                      <div>开放：{spot.hours.zh}</div>
                      <div>门票：{spot.ticket.zh}</div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3">
                    <button
                      type="button"
                      onClick={() => handleTeleportToSpot(spot.id)}
                      className="terra-btn w-full rounded-full bg-white/10 py-2.5 text-[14px] font-medium text-white hover:bg-white/20 transition"
                    >
                      在世界模型中载入 ↑
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 核心第三屏：关于 BEIJING PULSE 与掌心离线伴侣 */}
        <section id="about" className="bg-[#070707] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="rounded-[32px] bg-[#121214] p-8 sm:p-14 terra-reveal">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                  <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                    发现指南之外的北京
                  </h2>
                  <p className="mt-4 text-[16px] sm:text-[18px] text-white/70 leading-relaxed max-w-xl">
                    融合开源神经深度场与物理光影演算，重构城市时空认知。支持手机浏览器全屏沉浸漫游，随时随地感受古都秩序与流光。
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
                      <div className="h-48 w-48 rounded-xl bg-gray-100 flex items-center justify-center text-black/50 text-[14px]">
                        加载二维码中
                      </div>
                    )}
                    <p className="mt-3 text-[14px] font-medium text-[#070707]">
                      手机扫码 · 即刻沉浸
                    </p>
                    <p className="text-[14px] text-[#070707]/60">
                      支持 iOS 与 Android 离线手持
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#070707] py-12 text-center text-[14px] text-white/40">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 BEIJING PULSE // 4D World Model Exploration.</p>
          <p>Open source spatial computing for city travelers.</p>
        </div>
      </footer>
    </div>
  );
}
