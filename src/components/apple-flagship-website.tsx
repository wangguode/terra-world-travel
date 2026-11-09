"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { BeijingSpatialWorldModel } from "@/components/beijing-pulse-world-model";
import {
  ATTRACTIONS,
  ROUTES,
  CATEGORIES,
  type TravelRoute,
} from "@/lib/beijing-pulse-data";

export function AppleFlagshipWebsite() {
  const [currentUrl, setCurrentUrl] = useState<string>("https://terra-world-travel.153557421.workers.dev");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedRoute, setCopiedRoute] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSpatialAttractionId, setActiveSpatialAttractionId] = useState<string>("forbidden-city");
  const [selectedRoute, setSelectedRoute] = useState<TravelRoute>(ROUTES[0]);

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
  }, [activeCategory]);

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

  const filteredAttractions = useMemo(() => {
    return ATTRACTIONS.filter((item) => {
      const matchCat = activeCategory === "all" || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.zh.toLowerCase().includes(q) ||
        item.name.en.toLowerCase().includes(q) ||
        item.districtZh.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleOpenSpatial = (id: string) => {
    setActiveSpatialAttractionId(id);
    const element = document.getElementById("spatial-viewer-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCopyRoute = async (route: TravelRoute) => {
    const text = `【${route.name.zh} · ${route.subtitle.zh}】\n` +
      route.stops
        .map((s) => {
          const spot = ATTRACTIONS.find((a) => a.id === s.attractionId);
          return `${s.time} - ${spot?.name.zh ?? s.attractionId}：${s.keyAction}`;
        })
        .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopiedRoute(route.id);
      setTimeout(() => setCopiedRoute(null), 2400);
    } catch {
      setCopiedRoute(route.id);
      setTimeout(() => setCopiedRoute(null), 2400);
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

          <nav aria-label="主导航" className="flex flex-wrap items-center gap-6 sm:gap-8 text-[18px]">
            <a href="#explore" className="text-white/80 hover:text-[#ff6b6b] no-underline">
              探索
            </a>
            <a href="#spatial-viewer-section" className="text-white/80 hover:text-[#ff6b6b] no-underline">
              3D 实景空间漫游
            </a>
            <a href="#featured-spots" className="text-white/80 hover:text-[#ff6b6b] no-underline">
              精选地标
            </a>
            <a href="#suggested-routes" className="text-white/80 hover:text-[#ff6b6b] no-underline">
              经典行程
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
        <section id="explore" className="relative min-h-[75vh] flex items-end overflow-hidden pb-16 sm:pb-24">
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
                发现指南之外的北京。精选地标实景呈现，360° 空间环顾与四日光影变化。
              </p>

              {/* 搜索与快捷按钮 */}
              <div className="mt-8 flex flex-wrap gap-3 max-w-xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索地标、区域或标签（如：长城、中轴线）"
                  className="flex-1 rounded-full bg-white/10 px-6 py-3 text-[18px] text-white placeholder-white/50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleOpenSpatial("forbidden-city")}
                  className="terra-btn rounded-full bg-[#c23b3b] px-6 py-3 text-[18px] font-semibold text-white"
                >
                  3D 空间漫游
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-[18px]">
                <a
                  href="#featured-spots"
                  className="terra-btn rounded-full bg-white px-6 py-2.5 text-[18px] font-semibold text-black no-underline"
                >
                  浏览全部地标
                </a>
                <a
                  href="#suggested-routes"
                  className="terra-btn rounded-full bg-white/10 px-6 py-2.5 text-[18px] font-medium text-white no-underline"
                >
                  经典游览路线
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 核心数据条 (Stats Bar) */}
        <section className="bg-[#121212] py-8">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <a href="#featured-spots" className="no-underline group">
                <div className="text-[36px] font-bold text-white tnum group-hover:text-[#ff6b6b]">
                  10
                </div>
                <div className="text-[14px] text-white/60">
                  精选实测地标 (Curated spots)
                </div>
              </a>

              <a href="#suggested-routes" className="no-underline group">
                <div className="text-[36px] font-bold text-white tnum group-hover:text-[#ff6b6b]">
                  3
                </div>
                <div className="text-[14px] text-white/60">
                  经典行程参考 (Route plans)
                </div>
              </a>

              <a href="#spatial-viewer-section" className="no-underline group">
                <div className="text-[36px] font-bold text-[#ff6b6b] tnum">
                  6
                </div>
                <div className="text-[14px] text-white/60">
                  360° 实景漫游 (3D Panorama)
                </div>
              </a>

              <div>
                <div className="text-[36px] font-bold text-white tnum">
                  4
                </div>
                <div className="text-[14px] text-white/60">
                  世界文化遗产 (UNESCO Sites)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 核心功能：3D 实景空间漫游视窗 (3D Spatial Environment) */}
        <section id="spatial-viewer-section" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="flex flex-wrap items-end justify-between gap-6 terra-reveal">
              <div>
                <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                  360° 实景空间漫游
                </h2>
                <p className="mt-3 max-w-[60ch] text-[18px] text-white/70">
                  鼠标拖拽即可自由旋转环顾四周。切换右下角光影时段，直观感受晨曦、正午、黄昏金辉与夜间光影。
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {ATTRACTIONS.slice(0, 4).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setActiveSpatialAttractionId(a.id)}
                    className={`terra-btn rounded-full px-4 py-2 text-[14px] font-semibold ${
                      activeSpatialAttractionId === a.id
                        ? "bg-[#c23b3b] text-white"
                        : "bg-[#141418] text-white/80"
                    }`}
                  >
                    {a.name.zh}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 terra-reveal">
              <BeijingSpatialWorldModel
                initialAttractionId={activeSpatialAttractionId}
              />
            </div>

            {/* 真实空间全景视频 */}
            <figure className="mt-12 m-0 overflow-hidden rounded-3xl terra-reveal">
              <video
                src="/images/spatial-scan-loop.webm"
                poster="/images/spatial-scan-poster.jpg"
                autoPlay
                loop
                muted
                playsInline
                className="h-64 sm:h-80 w-full object-cover rounded-3xl"
              />
              <figcaption className="mt-3 text-[14px] text-white/50">
                三维空间全景视角：沉浸式呈现建筑空间尺度与纵深。
              </figcaption>
            </figure>
          </div>
        </section>

        {/* 精选地标 (Featured Spots) */}
        <section id="featured-spots" className="bg-[#121212] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="flex flex-wrap items-end justify-between gap-6 terra-reveal">
              <div>
                <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                  精选地标探索
                </h2>
                <p className="mt-3 max-w-[56ch] text-[18px] text-white/70">
                  每一处地标配齐实拍图、开放时间与门票，点击即可展开 3D 空间环顾。
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`terra-btn rounded-full px-4 py-2 text-[14px] font-semibold ${
                      activeCategory === cat.id
                        ? "bg-[#c23b3b] text-white"
                        : "bg-[#1e1e1e] text-white/80 hover:bg-[#282828]"
                    }`}
                  >
                    {cat.name.zh}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAttractions.map((spot) => (
                <article
                  key={spot.id}
                  className="rounded-3xl bg-[#1a1a1a] p-5 terra-reveal flex flex-col justify-between"
                >
                  <div>
                    <div className="overflow-hidden rounded-2xl relative">
                      <Image
                        src={spot.image}
                        alt={spot.name.zh}
                        width={600}
                        height={340}
                        className="h-56 w-full object-cover"
                      />
                      <span className="absolute top-3 right-3 rounded-full bg-black/70 px-3 py-1 text-[14px] font-semibold text-white">
                        {spot.duration}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-[14px]">
                      <span className="text-[#ff6b6b] font-semibold">
                        {spot.districtZh}
                      </span>
                      <span className="text-white/60">
                        {spot.ticket.zh}
                      </span>
                    </div>

                    <h3 className="mt-2 text-[22px] font-bold text-white">
                      {spot.name.zh}
                    </h3>
                    <div className="text-[14px] text-white/50">
                      {spot.name.en}
                    </div>

                    <p className="mt-3 mb-0 text-[14px] text-white/70 line-clamp-2">
                      {spot.description.zh}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => handleOpenSpatial(spot.id)}
                      className="terra-btn rounded-full bg-[#c23b3b] px-4 py-2 text-[14px] font-semibold text-white"
                    >
                      3D 空间环顾 →
                    </button>
                    <span className="text-[14px] text-white/50">
                      {spot.hours.zh}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 实用经典行程参考 (Practical Routes) */}
        <section id="suggested-routes" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="max-w-3xl terra-reveal">
              <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                经典游览行程参考
              </h2>
              <p className="mt-3 text-[18px] text-white/70">
                经过实践检验的游览路线，包含真实游览次序与换乘地铁，可一键复制进手机备忘录。
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* 左侧路线选择列表 */}
              <div className="lg:col-span-4 space-y-2 terra-reveal">
                {ROUTES.map((route) => {
                  const isSel = route.id === selectedRoute.id;
                  return (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => setSelectedRoute(route)}
                      className={`terra-btn w-full text-left rounded-2xl px-5 py-4 transition ${
                        isSel
                          ? "bg-[#c23b3b] text-white"
                          : "bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[14px]">
                        <span className={isSel ? "text-white/90 font-bold" : "text-[#ff6b6b] font-semibold"}>
                          {route.days} 日行程
                        </span>
                        <span className="text-white/60">{route.stops.length} 个核心点位</span>
                      </div>
                      <div className="mt-1 text-[18px] font-bold text-white">
                        {route.name.zh}
                      </div>
                      <div className="mt-0.5 text-[14px] text-white/60">
                        {route.subtitle.zh}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 右侧路线时间线 */}
              <div className="lg:col-span-8 p-4 terra-reveal">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[22px] font-bold text-white">
                      {selectedRoute.name.zh}
                    </h3>
                    <p className="mt-1 text-[14px] text-white/60">
                      {selectedRoute.subtitle.zh}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyRoute(selectedRoute)}
                    className="terra-btn rounded-full bg-white px-5 py-2 text-[14px] font-semibold text-black"
                  >
                    {copiedRoute === selectedRoute.id ? "已复制行程" : "一键复制行程"}
                  </button>
                </div>

                <ol className="mt-8 space-y-6 pl-0 list-none">
                  {selectedRoute.stops.map((stop, idx) => {
                    const spot = ATTRACTIONS.find((a) => a.id === stop.attractionId);
                    return (
                      <li key={stop.attractionId} className="flex gap-4 items-start">
                        <div className="h-8 w-8 rounded-full bg-[#c23b3b] text-white font-bold flex items-center justify-center text-[14px] shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[18px] font-bold text-white">
                              {spot?.name.zh ?? stop.attractionId}
                            </span>
                            <span className="text-[14px] text-white/50 tnum font-semibold">
                              {stop.time}
                            </span>
                          </div>
                          <p className="mt-1 mb-0 text-[14px] text-white/80">
                            {stop.keyAction}
                          </p>
                          <div className="mt-2 flex gap-3 text-[14px]">
                            <button
                              type="button"
                              onClick={() => handleOpenSpatial(stop.attractionId)}
                              className="text-[#ff6b6b] font-semibold hover:underline"
                            >
                              查看 3D 实景 →
                            </button>
                            <span className="text-white/40">
                              {spot?.transport.zh}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* 手机扫码离线漫游 (Mobile Handoff) */}
        <section id="mobile-handoff" className="bg-[#121212] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 terra-reveal">
                <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                  装进手机，离线可用
                </h2>
                <p className="mt-4 max-w-[56ch] text-[18px] text-white/70">
                  扫码直接带走行程与地标指南。支持 Safari 与 Chrome 添加至主屏幕，在地铁或信号不佳时依然秒开。
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="terra-btn rounded-full bg-white px-6 py-3 text-[18px] font-semibold text-black hover:bg-white/90"
                  >
                    {copiedLink ? "已复制在线网址" : "复制网址发到手机"}
                  </button>
                  <span className="text-[14px] text-white/50 tnum">
                    {currentUrl}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center lg:justify-end terra-reveal">
                <div className="rounded-3xl bg-white p-6 text-center">
                  {qrCodeDataUrl ? (
                    <Image
                      src={qrCodeDataUrl}
                      alt="手机扫码体验"
                      width={240}
                      height={240}
                      unoptimized
                      className="h-56 w-56 rounded-2xl object-contain mx-auto"
                    />
                  ) : (
                    <div className="flex h-56 w-56 items-center justify-center rounded-2xl bg-gray-100 text-black">
                      正在生成...
                    </div>
                  )}
                  <div className="mt-3 text-[18px] font-bold text-black">
                    手机扫码即刻同步
                  </div>
                  <div className="text-[14px] text-gray-500">
                    支持 iOS Safari 与 Android 离线运行
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 极简页脚 */}
      <footer className="py-12 text-center text-[14px] text-white/40">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 flex flex-wrap items-center justify-between gap-4">
          <div className="font-semibold text-white/70">
            BEIJING PULSE · 发现指南之外的北京
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/wangguode/terra-world-travel"
              target="_blank"
              rel="noreferrer"
              className="text-white/60 hover:text-white"
            >
              GitHub 仓库
            </a>
            <a href="#explore" className="text-white/60 hover:text-white">
              回到顶部
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
