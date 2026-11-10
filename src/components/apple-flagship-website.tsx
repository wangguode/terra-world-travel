"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import WorldModelSimulator from "./beijing-pulse-world-model";
import { WORLD_DIMENSIONS, WorldDimension } from "@/lib/oasis-world-app-data";

export default function TerraOasisApp() {

  const [activeWorldId, setActiveWorldId] = useState<string>("voxel-oasis");
  const [activeHour, setActiveHour] = useState<number>(17.5);
  const [snowMode, setSnowMode] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

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

  const handleSelectDimension = (worldId: string) => {
    setActiveWorldId(worldId);
    const el = document.getElementById("simulator-viewport");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-[#070707] text-[#f5f5f7]">
      {/* 顶部应用导航栏 */}
      <header className="absolute top-0 left-0 right-0 z-40 bg-transparent py-4 sm:py-5 pointer-events-none">
        <div className="mx-auto max-w-7xl flex w-full items-center justify-between gap-4 px-5 sm:px-10">
          <a
            href="#simulator-viewport"
            className="pointer-events-auto flex items-center gap-2.5 text-[16px] sm:text-[18px] font-bold tracking-tight text-white no-underline"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#00f2fe]" />
            <span>TERRA OASIS // 神经世界模拟器</span>
            <span className="text-[16px] font-normal text-white/40 tracking-wider hidden lg:inline">
              Playable Neural World Model Application
            </span>
          </a>

          <nav
            aria-label="主导航"
            className="pointer-events-auto flex items-center gap-3 sm:gap-6 text-[16px]"
          >
            <a
              href="#simulator-viewport"
              className="text-white/70 hover:text-white no-underline transition hidden lg:inline"
            >
              实时视界
            </a>
            <a
              href="#world-dimensions"
              className="text-white/70 hover:text-white no-underline transition hidden lg:inline"
            >
              世界维度
            </a>
            <a
              href="#world-model-mechanics"
              className="text-white/70 hover:text-white no-underline transition hidden lg:inline"
            >
              神经原理
            </a>
            <button
              type="button"
              onClick={() => setSnowMode(!snowMode)}
              className={`terra-btn rounded-full px-3.5 py-1.5 text-[16px] font-medium transition hidden sm:inline-block ${
                snowMode
                  ? "bg-[#00f2fe] text-black"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {snowMode ? "霜雪已覆" : "注入霜雪"}
            </button>
            <a
              href="https://github.com/wangguode/terra-world-travel"
              target="_blank"
              rel="noopener noreferrer"
              className="terra-btn rounded-full bg-white px-4 sm:px-5 py-1.5 text-[16px] font-semibold text-black no-underline hover:bg-white/90"
            >
              GitHub 仓库
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* 核心第一屏：全屏可交互神经世界模型模拟器 */}
        <section
          id="simulator-viewport"
          className="relative w-full bg-[#070707] pt-24 sm:pt-28 pb-4"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <h1 className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight">
              Terra-Oasis // 开源可交互神经世界模型应用
            </h1>
            <p className="mt-2 text-[18px] text-white/80 max-w-3xl leading-relaxed tnum">
              面向 Web 浏览器的自回归扩散神经虚拟沙盒：轻按键盘 WASD 实时漫游，按下 E 键破拆体素扰动，端到端推演下一帧时空与物理因果。
            </p>
          </div>

          <div className="mt-6 relative w-full h-[75vh] sm:h-[82vh] overflow-hidden bg-black">
            <WorldModelSimulator
              activeWorldId={activeWorldId}
              onSelectWorld={setActiveWorldId}
              hour={activeHour}
              onChangeHour={setActiveHour}
              snowMode={snowMode}
            />
          </div>
        </section>

        {/* 核心第二屏：世界维度沙盒选择器与物理法则 */}
        <section id="world-dimensions" className="bg-[#0c0c0e] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight">
                多重沙盒世界维度与物理法则
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">
                每个维度均由独立的因果注意力流和物理隐变量约束驱动，点击即可瞬间载入模拟器。
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {WORLD_DIMENSIONS.map((world: WorldDimension) => (
                <article
                  key={world.id}
                  className="terra-reveal rounded-[24px] bg-[#141416] p-6 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01]"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[18px]">
                      <Image
                        src={world.image}
                        alt={world.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-white/5 px-3 py-1 text-[16px] text-[#00f2fe] font-medium">
                        {world.category}
                      </span>
                      <span className="text-[16px] text-white/40 tnum">
                        {world.codename}
                      </span>
                    </div>

                    <h3 className="mt-3 text-[20px] font-bold text-white tracking-tight">
                      {world.name}
                    </h3>

                    <p className="mt-2 text-[16px] text-white/70 leading-relaxed">
                      {world.description}
                    </p>

                    <div className="mt-4 bg-white/5 rounded-[16px] p-3.5 space-y-1.5 text-[16px] tnum">
                      <div className="flex justify-between">
                        <span className="text-white/40">动力学重力：</span>
                        <span className="text-white font-medium">{world.physics.gravity} m/s²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">因果时序窗口：</span>
                        <span className="text-white font-medium">{world.diffusionConfig.causalWindow} Frames</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">流式刷新率：</span>
                        <span className="text-[#00f2fe] font-medium">{world.diffusionConfig.frameRate} FPS (720p)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3">
                    <button
                      type="button"
                      onClick={() => handleSelectDimension(world.id)}
                      className="terra-btn w-full rounded-full bg-white/10 py-2.5 text-[16px] font-medium text-white hover:bg-white/20 transition"
                    >
                      载入此世界维度 ↑
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 核心第三屏：什么是世界模型？神经渲染与传统游戏引擎对比 */}
        <section id="world-model-mechanics" className="bg-[#09090b] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight">
                什么是世界模型？突破传统 3D 渲染极限
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">
                世界模型（World Model）颠覆了由多边形网格和手工物理着色器构筑的传统图形管线，将物理现实的生成与演化完全托付给自回归神经网络。
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 传统游戏引擎 */}
              <div className="rounded-[28px] bg-[#121214] p-8 terra-reveal space-y-5">
                <div className="text-[16px] text-white/50 uppercase">
                  Traditional Engine Pipeline
                </div>
                <h3 className="text-[20px] sm:text-[24px] font-bold text-white tracking-tight">
                  传统渲染引擎 (Unreal / Unity)
                </h3>
                <div className="space-y-4 text-[16px] leading-relaxed">
                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">显式几何网格与碰撞体依赖</div>
                    <div className="text-white/70 mt-1">
                      必须手工制作数百万顶点网格（Meshes）、UV 贴图与包围盒刚体。世界无法即兴无限生成未预设的地貌。
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">规则硬编码物理模拟</div>
                    <div className="text-white/70 mt-1">
                      通过离散牛顿力学方程硬编码碰撞判定，遇到复杂流体、破碎与光斑焦散时开销呈指数级暴增。
                    </div>
                  </div>
                </div>
              </div>

              {/* 神经交互世界模型 */}
              <div className="rounded-[28px] bg-[#121214] p-8 terra-reveal space-y-5">
                <div className="text-[16px] text-[#00f2fe] uppercase">
                  Neural World Model Paradigm
                </div>
                <h3 className="text-[20px] sm:text-[24px] font-bold text-white tracking-tight">
                  神经世界模型 (Terra-Oasis / DiT)
                </h3>
                <div className="space-y-4 text-[16px] leading-relaxed">
                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">动作条件隐空间因果推演</div>
                    <div className="text-white/70 mt-1">
                      无需任何 3D 资产与多边形。模型以历史帧与键盘输入为条件，自回归扩散端到端生成下一帧连续时空。
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">无尽开放涌现与动态干预</div>
                    <div className="text-white/70 mt-1">
                      支持用户通过按键实时注入世界扰动（破拆地形、重力反转），模型依靠内化的物理世界知识自发涌现真实反馈。
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 移动端与跨设备体验 */}
            <div className="mt-12 rounded-[32px] bg-[#121214] p-8 sm:p-14 terra-reveal">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                  <h3 className="text-[24px] sm:text-[32px] font-bold text-white tracking-tight">
                    在任意移动设备上即刻探索
                  </h3>
                  <p className="mt-4 text-[16px] sm:text-[18px] text-white/70 leading-relaxed max-w-xl">
                    Terra-Oasis 针对现代移动浏览器 WebGL 与触控事件进行了深度轻量化优化，无需昂贵算力设备，扫描二维码即可在手机上漫游神经沙盒。
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="terra-btn rounded-full bg-white px-7 py-3 text-[16px] font-bold text-black hover:bg-white/90 transition"
                    >
                      {copiedLink ? "已复制模拟器网址" : "复制网址到移动端"}
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
                      <div className="h-48 w-48 rounded-xl bg-gray-100 flex items-center justify-center text-black/50 text-[16px]">
                        加载二维码中
                      </div>
                    )}
                    <p className="mt-3 text-[16px] font-medium text-[#070707]">
                      手机扫码 · 即刻交互
                    </p>
                    <p className="text-[16px] text-[#070707]/60">
                      支持 iOS 与 Android 触控漫游
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#070707] py-12 text-center text-[16px] text-white/40">
        <div className="mx-auto max-w-7xl px-5 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TERRA-OASIS // OPEN NEURAL WORLD MODEL APPLICATION.</p>
          <p>Real-Time Action-Conditioned Causal World Simulator.</p>
        </div>
      </footer>
    </div>
  );
}

export { TerraOasisApp as AppleFlagshipWebsite };
