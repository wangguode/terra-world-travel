"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import WorldModelSimulator from "./beijing-pulse-world-model";
import { WORLD_DIMENSIONS, WorldDimension } from "@/lib/oasis-world-app-data";

export default function TerraOasisOfficialWebsite() {
  const [activeWorldId, setActiveWorldId] = useState<string>("voxel-oasis");
  const [activeHour, setActiveHour] = useState<number>(17.5);
  const [snowMode, setSnowMode] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedBibtex, setCopiedBibtex] = useState<boolean>(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

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

  const handleCopyBibtex = async () => {
    const bibtex = `@article{terra_oasis_2026,
  title={Terra-Oasis: Playable Action-Conditioned Neural World Model Application},
  author={Wang, Guo and Terra World Lab Team},
  journal={arXiv preprint arXiv:2603.01892},
  year={2026}
}`;
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopiedBibtex(true);
      setTimeout(() => setCopiedBibtex(false), 2400);
    } catch {
      setCopiedBibtex(true);
      setTimeout(() => setCopiedBibtex(false), 2400);
    }
  };

  const handleSelectDimension = (worldId: string) => {
    setActiveWorldId(worldId);
    const el = document.getElementById("interactive-playground");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleFaq = (index: number) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  const FAQS = [
    {
      q: "什么是世界模型（World Model）？它和普通 AI 视频生成（如 Sora、Kling）有什么区别？",
      a: "普通 AI 视频生成是单向、离线的。用户输入一段 Prompt，模型在云端渲染一段数十秒固定不可更改的视频片段。而世界模型是交互式、因果连续的模拟系统。它不仅输入文本，还实时接收用户的连续动作（键盘 WASD、跳跃、手柄摇杆等），根据历史时空记忆与物理因果规律，自回归实时推演下一帧的画面与碰撞反馈，就像一个完全由神经网络构筑的虚拟游戏引擎。",
    },
    {
      q: "为什么在普通的 Web 浏览器中无需独立显卡也能实时体验？",
      a: "TERRA-OASIS 结合了因果扩散隐空间压缩技术与现代 WebGL/WebGPU 神经渲染流水线。模型在隐空间（Latent Space）以 16×64×64 高压缩比进行动作因果预测，再通过轻量级神经解码器在客户端以 60 FPS 流式重构高保真光影与深度视差，大幅降低了本地硬件门槛。",
    },
    {
      q: "世界模型是如何判断障碍物碰撞与重力下坠的？世界里有真实的 3D 网格吗？",
      a: "世界中没有任何预先制作的三维网格（3D Meshes）或离散碰撞盒子。模型在海量高精度物理交互与空间数据训练中，自主学会了「内化直觉物理（Learned Intuitive Physics）」。它理解墙壁无法穿透、悬空物体会下落、水体具有浮力，因此能够在神经网络参数内部直接计算因果阻挡与重力积分。",
    },
    {
      q: "如何将 TERRA-OASIS 动作流接入自己的游戏或具身智能机器人研发管线？",
      a: "TERRA-OASIS 提供了基于 WebSocket 的标准动作条件注入 SDK。任何第三方系统只需持续发送按键或执行器位姿张量（如 [x, y, z, roll, pitch, yaw]），服务端即可实时回传 720p@60FPS 神经渲染帧与隐式深度场，可无缝用于具身智能 Sim-to-Real 闭环仿真或交互游戏制作。",
    },
  ];

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-[#070707] text-[#f5f5f7]">
      {/* 1. 官方全局顶栏 (Official Header) */}
      <header className="sticky top-0 z-50 bg-[#070707] py-4">
        <div className="mx-auto max-w-7xl flex w-full items-center justify-between gap-4 px-5 sm:px-10">
          <a
            href="#hero"
            className="flex items-center gap-2.5 text-[18px] font-bold tracking-tight text-white no-underline"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#00f2fe]" />
            <span>TERRA OASIS</span>
            <span className="text-[16px] font-normal text-white/40 tracking-wider hidden md:inline">
              官方世界模型平台
            </span>
          </a>

          <nav
            aria-label="官方主导航"
            className="flex items-center gap-4 sm:gap-7 text-[16px]"
          >
            <a
              href="#interactive-playground"
              className="text-white/70 hover:text-white no-underline transition hidden md:inline"
            >
              在线沙盒
            </a>
            <a
              href="#technological-pillars"
              className="text-white/70 hover:text-white no-underline transition hidden md:inline"
            >
              技术突破
            </a>
            <a
              href="#world-dimensions"
              className="text-white/70 hover:text-white no-underline transition hidden md:inline"
            >
              世界矩阵
            </a>
            <a
              href="#quickstart"
              className="text-white/70 hover:text-white no-underline transition hidden md:inline"
            >
              极速接入
            </a>
            <a
              href="#faq"
              className="text-white/70 hover:text-white no-underline transition hidden lg:inline"
            >
              常见问答
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

      <main>
        {/* 2. 官方旗舰品牌第一视觉 (Hero Section) */}
        <section id="hero" className="relative bg-[#070707] pt-20 sm:pt-28 pb-16 sm:pb-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-4xl terra-reveal">
              <h1 className="text-[32px] sm:text-[60px] lg:text-[76px] font-bold text-white tracking-tight leading-[1.06]">
                物理世界，由神经网络端到端实时生成
              </h1>

              <p className="mt-6 text-[18px] sm:text-[20px] text-white/70 max-w-3xl leading-relaxed tnum">
                告别传统 3D 几何建模与手工物理着色器。TERRA-OASIS 是首个面向现代 Web 浏览器的动作驱动因果扩散世界模型，无需高端显卡，轻按键盘 WASD 即可实时漫游探索无限涌现的物理虚拟时空。
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#interactive-playground"
                  className="terra-btn rounded-full bg-[#00f2fe] px-8 py-3.5 text-[16px] font-bold text-black no-underline hover:bg-[#00f2fe]/90 transition"
                >
                  进入可玩神经沙盒 ↓
                </a>
                <a
                  href="#technological-pillars"
                  className="terra-btn rounded-full bg-white/10 px-7 py-3.5 text-[16px] font-medium text-white no-underline hover:bg-white/20 transition"
                >
                  阅读技术架构原理
                </a>
              </div>
            </div>

            {/* 核心硬核指标条 (Key Metrics Bar) */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 terra-reveal">
              <div className="rounded-[20px] bg-[#0c0c0e] p-5 sm:p-6">
                <div className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight tnum">
                  14B
                </div>
                <div className="mt-1 text-[16px] text-white/50">
                  因果扩散 Transformer 骨干
                </div>
              </div>

              <div className="rounded-[20px] bg-[#0c0c0e] p-5 sm:p-6">
                <div className="text-[28px] sm:text-[36px] font-bold text-[#00f2fe] tracking-tight tnum">
                  60 FPS
                </div>
                <div className="mt-1 text-[16px] text-white/50">
                  720p 实时神经推流
                </div>
              </div>

              <div className="rounded-[20px] bg-[#0c0c0e] p-5 sm:p-6">
                <div className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight tnum">
                  16 ms
                </div>
                <div className="mt-1 text-[16px] text-white/50">
                  端到端动作条件注入延迟
                </div>
              </div>

              <div className="rounded-[20px] bg-[#0c0c0e] p-5 sm:p-6">
                <div className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight tnum">
                  0 Poly
                </div>
                <div className="mt-1 text-[16px] text-white/50">
                  100% 神经自回归，无预设网格
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 在线交互沙盒官方体验区 (Interactive Playground Showcase) */}
        <section
          id="interactive-playground"
          className="relative bg-[#09090b] py-16 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-3xl terra-reveal">
              <h2 className="text-[32px] sm:text-[40px] font-bold text-white tracking-tight">
                在线神经虚拟沙盒体验视窗
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">
                60 FPS WebGL 实时推流就绪：轻按键盘 WASD 实时漫游，按下 E 键破拆体素扰动，Space 键向上跃迁，体验纯神经网络端到端推演的时空因果。
              </p>
            </div>

            {/* 视窗硬件级外壳容器 */}
            <div className="mt-8 rounded-[28px] bg-[#121214] p-2 sm:p-3 terra-reveal">
              <div className="relative w-full h-[65vh] sm:h-[75vh] min-h-[480px] rounded-[22px] overflow-hidden bg-black">
                <WorldModelSimulator
                  activeWorldId={activeWorldId}
                  onSelectWorld={setActiveWorldId}
                  hour={activeHour}
                  onChangeHour={setActiveHour}
                  snowMode={snowMode}
                />
              </div>

              {/* 视窗下方快捷操作指南条 */}
              <div className="mt-3 px-3 py-2 flex flex-wrap items-center justify-between gap-4 text-[16px] text-white/60">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div>
                    <span className="rounded-[6px] bg-white/10 px-2 py-0.5 text-white font-semibold mr-1.5">
                      WASD
                    </span>
                    <span>平移移动</span>
                  </div>
                  <div>
                    <span className="rounded-[6px] bg-white/10 px-2 py-0.5 text-white font-semibold mr-1.5">
                      Space
                    </span>
                    <span>反重力跳跃</span>
                  </div>
                  <div>
                    <span className="rounded-[6px] bg-white/10 px-2 py-0.5 text-[#00f2fe] font-semibold mr-1.5">
                      E 键 / 点击
                    </span>
                    <span>世界破拆扰动</span>
                  </div>
                  <div>
                    <span className="rounded-[6px] bg-white/10 px-2 py-0.5 text-white font-semibold mr-1.5">
                      R
                    </span>
                    <span>量子重采样</span>
                  </div>
                </div>

                <div className="text-[16px] text-white/40">
                  支持鼠标拖拽视角与移动端触控方向键
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 突破传统图形学的四大核心技术支柱 (Technological Pillars) */}
        <section id="technological-pillars" className="bg-[#070707] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[32px] sm:text-[40px] font-bold text-white tracking-tight">
                突破传统图形学极限的四大技术支柱
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">
                从显式手工 3D 建模迈向隐式神经世界生成，TERRA-OASIS 重新定义了人机虚拟环境的交互范式。
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="rounded-[24px] bg-[#0c0c0e] p-8 terra-reveal space-y-3">
                <div className="flex items-center gap-2 text-[#00f2fe] text-[16px] font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[#00f2fe]" />
                  <span>核心技术一</span>
                </div>
                <h3 className="text-[22px] sm:text-[24px] font-bold text-white tracking-tight">
                  动作条件因果注入 (Action Conditioning)
                </h3>
                <p className="text-[16px] text-white/70 leading-relaxed">
                  不再是被动生成一段固定视频。模型将用户的按键输入与物理位移矢量作为条件潜变量，毫秒级注入扩散主干，以自回归方式逐帧推演出符合操作意图的时空走向。
                </p>
              </div>

              <div className="rounded-[24px] bg-[#0c0c0e] p-8 terra-reveal space-y-3">
                <div className="flex items-center gap-2 text-[#00f2fe] text-[16px] font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[#00f2fe]" />
                  <span>核心技术二</span>
                </div>
                <h3 className="text-[22px] sm:text-[24px] font-bold text-white tracking-tight">
                  无限长程时空连续性 (Causal DiT Horizon)
                </h3>
                <p className="text-[16px] text-white/70 leading-relaxed">
                  传统自回归视频生成在数秒后容易发生时空漂移与画面坍缩。TERRA-OASIS 采用双智能体时空记忆调度与因果滑动注意力，保证无论漫游多久，物理结构与场景几何永不崩坏。
                </p>
              </div>

              <div className="rounded-[24px] bg-[#0c0c0e] p-8 terra-reveal space-y-3">
                <div className="flex items-center gap-2 text-[#00f2fe] text-[16px] font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[#00f2fe]" />
                  <span>核心技术三</span>
                </div>
                <h3 className="text-[22px] sm:text-[24px] font-bold text-white tracking-tight">
                  自主涌现的内化直觉物理 (Learned Physics)
                </h3>
                <p className="text-[16px] text-white/70 leading-relaxed">
                  完全无需编写牛顿力学方程或 PhysX 碰撞体代码。神经网络在海量动态数据中自发学到了重力加速度、空气阻尼、碰撞弹射、流体焦散与菲涅尔光斑的客观规律。
                </p>
              </div>

              <div className="rounded-[24px] bg-[#0c0c0e] p-8 terra-reveal space-y-3">
                <div className="flex items-center gap-2 text-[#00f2fe] text-[16px] font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[#00f2fe]" />
                  <span>核心技术四</span>
                </div>
                <h3 className="text-[22px] sm:text-[24px] font-bold text-white tracking-tight">
                  体素破拆扰动与因果自愈 (Neural Perturbation)
                </h3>
                <p className="text-[16px] text-white/70 leading-relaxed">
                  当用户按下 E 键破拆体素或注入局部高斯噪声时，模型能够即时推演出周围几何破裂飞溅与阴影重构，展现出真正世界模型独有的局部物理干预自适应能力。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. 五大沙盒世界维度画廊 (Dimensions Gallery) */}
        <section id="world-dimensions" className="bg-[#0c0c0e] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[32px] sm:text-[40px] font-bold text-white tracking-tight">
                五大多重沙盒世界维度矩阵
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">
                每个维度均搭载独特的动力学重力常数、因果时序视界与光学反射特性，点击即可在上方在线视窗中即时加载体验。
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
                      在视窗中载入此世界 ↑
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6. 开发者极速接入与动作流 SDK (Developer Quickstart) */}
        <section id="quickstart" className="bg-[#070707] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[32px] sm:text-[40px] font-bold text-white tracking-tight">
                开发者极速接入与动作流 SDK
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">
                面向游戏引擎、机器人控制与研究人员。三行代码即可连接 TERRA-OASIS 动作流服务，注入连续按键与位姿张量。
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 terra-reveal">
              <div className="rounded-[24px] bg-[#0c0c0e] p-6 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="text-[18px] font-bold text-white">客户端免配即玩</div>
                  <p className="mt-2 text-[16px] text-white/70 leading-relaxed">
                    完全无需安装环境与独立显卡。任何支持 WebGL 的现代浏览器打开即可通过键盘 WASD 实时漫游 60 FPS 神经虚拟沙盒。
                  </p>
                </div>
                <div className="pt-2">
                  <a href="#interactive-playground" className="text-[#00f2fe] text-[16px] font-semibold hover:underline no-underline">
                    立即在上方体验 →
                  </a>
                </div>
              </div>

              <div className="rounded-[24px] bg-[#0c0c0e] p-6 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="text-[18px] font-bold text-white">Python 动作流 SDK</div>
                  <pre className="mt-2 text-[16px] text-white/80 p-3 bg-black/40 rounded-[12px] overflow-x-auto leading-relaxed">
                    <code>{`import terra_oasis as oasis

client = oasis.connect("wss://api.terra-oasis.org")
frame = client.step(action="move_forward", speed=1.2)`}</code>
                  </pre>
                </div>
                <div className="text-[16px] text-white/40">pip install terra-oasis-sdk</div>
              </div>

              <div className="rounded-[24px] bg-[#0c0c0e] p-6 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="text-[18px] font-bold text-white">Docker 容器私有化部署</div>
                  <pre className="mt-2 text-[16px] text-white/80 p-3 bg-black/40 rounded-[12px] overflow-x-auto leading-relaxed">
                    <code>{`docker run --gpus all -p 3200:3200 \\
  ghcr.io/wangguode/terra-oasis:latest`}</code>
                  </pre>
                </div>
                <div className="text-[16px] text-white/40">支持多卡 GPU 张量并行推理</div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. 学术研究与开发者生态 (Research & Citation) */}
        <section id="research" className="bg-[#09090b] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-6 terra-reveal">
                <h2 className="text-[32px] sm:text-[40px] font-bold text-white tracking-tight">
                  开放研究、学术引用与生态
                </h2>
                <p className="mt-4 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">
                  TERRA-OASIS 致力于推动下一代世界模型技术的完全开放与普及。无论是学术界开展具身智能仿真研究，还是独立开发者探索次世代神经游戏，均可通过开源代码库与预训练权重自由构建。
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="https://github.com/wangguode/terra-world-travel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="terra-btn rounded-full bg-white px-7 py-3 text-[16px] font-bold text-black no-underline hover:bg-white/90 transition"
                  >
                    在 GitHub 上 Star 关注
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyBibtex}
                    className="terra-btn rounded-full bg-white/10 px-6 py-3 text-[16px] font-medium text-white hover:bg-white/20 transition"
                  >
                    {copiedBibtex ? "已复制学术引用 BibTeX" : "复制 BibTeX 引用"}
                  </button>
                </div>
              </div>

              {/* BibTeX 引用块 */}
              <div className="lg:col-span-6 rounded-[24px] bg-[#121214] p-6 terra-reveal">
                <div className="flex items-center justify-between text-[16px] text-white/40 pb-3">
                  <span className="font-semibold text-white">BibTeX Citation</span>
                  <span className="uppercase text-[16px]">CITATION</span>
                </div>
                <pre className="mt-2 text-[16px] text-white/80 overflow-x-auto leading-relaxed p-4 bg-black/40 rounded-[14px]">
                  <code>{`@article{terra_oasis_2026,
  title={Terra-Oasis: Playable Action-Conditioned
         Neural World Model Application},
  author={Wang, Guo and Terra World Lab Team},
  journal={arXiv preprint arXiv:2603.01892},
  year={2026}
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* 7. 常见问题解答 (FAQ) */}
        <section id="faq" className="bg-[#070707] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[32px] sm:text-[40px] font-bold text-white tracking-tight">
                关于 TERRA-OASIS 的常见问题
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">
                深入了解世界模型技术原理、浏览器运行机制与未来发展路线。
              </p>
            </div>

            <div className="mt-12 space-y-4 max-w-4xl terra-reveal">
              {FAQS.map((faq, index) => {
                const isOpen = activeFaqIndex === index;
                return (
                  <div
                    key={faq.q}
                    className="rounded-[20px] bg-[#0c0c0e] p-6 transition"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between text-left gap-4"
                    >
                      <span className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight">
                        {faq.q}
                      </span>
                      <span className="text-[20px] text-[#00f2fe] shrink-0">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="mt-4 text-[16px] text-white/70 leading-relaxed pt-3">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 移动端快速扫码体验 */}
            <div className="mt-14 rounded-[32px] bg-[#121214] p-8 sm:p-14 terra-reveal">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                  <h3 className="text-[24px] sm:text-[32px] font-bold text-white tracking-tight">
                    在任意移动设备上即刻启动沙盒
                  </h3>
                  <p className="mt-4 text-[16px] sm:text-[18px] text-white/70 leading-relaxed max-w-xl">
                    针对现代移动浏览器 WebGL 与触控事件进行了深度轻量化优化，无需昂贵算力设备，扫描二维码即可在手机上漫游神经沙盒。
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="terra-btn rounded-full bg-white px-7 py-3 text-[16px] font-bold text-black hover:bg-white/90 transition"
                    >
                      {copiedLink ? "已复制官网访问链接" : "复制网址到移动端"}
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

      {/* 8. 官方现代多列标准页脚 (Official Modern Footer) */}
      <footer className="bg-[#050505] py-16 text-[16px] text-white/50">
        <div className="mx-auto max-w-7xl px-5 sm:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12">
            <div>
              <div className="text-[16px] font-bold text-white uppercase tracking-wider mb-4">
                产品与平台
              </div>
              <ul className="space-y-2.5 p-0 list-none">
                <li>
                  <a href="#interactive-playground" className="text-white/60 hover:text-white no-underline transition">
                    在线神经沙盒
                  </a>
                </li>
                <li>
                  <a href="#world-dimensions" className="text-white/60 hover:text-white no-underline transition">
                    多重世界维度
                  </a>
                </li>
                <li>
                  <a href="#technological-pillars" className="text-white/60 hover:text-white no-underline transition">
                    动作条件引擎
                  </a>
                </li>
                <li>
                  <a href="#hero" className="text-white/60 hover:text-white no-underline transition">
                    性能指标矩阵
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-[16px] font-bold text-white uppercase tracking-wider mb-4">
                研究与技术
              </div>
              <ul className="space-y-2.5 p-0 list-none">
                <li>
                  <a href="#technological-pillars" className="text-white/60 hover:text-white no-underline transition">
                    因果 DiT 架构
                  </a>
                </li>
                <li>
                  <a href="#research" className="text-white/60 hover:text-white no-underline transition">
                    学术论文引用
                  </a>
                </li>
                <li>
                  <a href="#technological-pillars" className="text-white/60 hover:text-white no-underline transition">
                    内化物理规律
                  </a>
                </li>
                <li>
                  <a href="#technological-pillars" className="text-white/60 hover:text-white no-underline transition">
                    体素神经自愈
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-[16px] font-bold text-white uppercase tracking-wider mb-4">
                开源与社区
              </div>
              <ul className="space-y-2.5 p-0 list-none">
                <li>
                  <a
                    href="https://github.com/wangguode/terra-world-travel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white no-underline transition"
                  >
                    GitHub 源码仓库
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-white/60 hover:text-white no-underline transition">
                    开发者 FAQ
                  </a>
                </li>
                <li>
                  <a href="https://github.com/wangguode/terra-world-travel/issues" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white no-underline transition">
                    问题反馈 Issue
                  </a>
                </li>
                <li>
                  <a href="https://github.com/wangguode/terra-world-travel/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white no-underline transition">
                    MIT 开源协议
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-[16px] font-bold text-white uppercase tracking-wider mb-4">
                关于 TERRA LAB
              </div>
              <p className="text-[16px] text-white/50 leading-relaxed">
                致力于构建世界模型开放基座，探索端到端神经渲染与自回归时空生成的下一代虚拟现实范式。
              </p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[16px] text-white/40">
            <p className="m-0">© 2026 TERRA-OASIS · OPEN NEURAL WORLD MODEL APPLICATION.</p>
            <p className="m-0">Real-Time Action-Conditioned Causal World Simulator.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { TerraOasisOfficialWebsite as AppleFlagshipWebsite };
