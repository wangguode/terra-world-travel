"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import WorldModelSimulator from "./beijing-pulse-world-model";
import { WORLD_DIMENSIONS, WorldDimension } from "@/lib/oasis-world-app-data";
import { OFFICIAL_DOCS } from "@/lib/oasis-docs-data";
import { OFFICIAL_BLOGS } from "@/lib/oasis-blog-data";
import { COPILOT_KNOWLEDGE_BASE, PRESET_PROMPTS } from "@/lib/oasis-copilot-data";

export function AppleFlagshipWebsite() {
  // 顶层导航视图：overview(概览主站) | docs(架构文档) | blog(研究博客) | copilot(问答AI)
  const [currentView, setCurrentView] = useState<"overview" | "docs" | "blog" | "copilot">("overview");

  // 基础状态
  const [activeWorldId, setActiveWorldId] = useState<string>("voxel-oasis");
  const [activeHour, setActiveHour] = useState<number>(17.5);
  const [snowMode, setSnowMode] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedBibtex, setCopiedBibtex] = useState<boolean>(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // 文档中心状态
  const [activeDocId, setActiveDocId] = useState<string>("getting-started");
  const [copiedDocCode, setCopiedDocCode] = useState<boolean>(false);

  // 博客中心状态
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);

  // 问答 AI Copilot 状态
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    {
      sender: "ai",
      text: "你好！我是 TERRA-OASIS 官方世界模型智能助手。你可以问我关于动作条件因果注入（Action-Conditioning）、14B Causal DiT 架构、零多边形物理判定以及 Python SDK 接入的任何问题！",
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>("");
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

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
  }, [currentView]);

  useEffect(() => {
    const origin =
      typeof window !== "undefined" && window.location.origin.includes("workers.dev")
        ? window.location.origin
        : "https://terra-world-travel.153557421.workers.dev";

    QRCode.toDataURL(origin, {
      width: 220,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => {
        setQrCodeDataUrl(url);
        setCurrentUrl(origin);
      })
      .catch((err) => console.error("QR Code Error:", err));
  }, []);

  const handleCopyUrl = async () => {
    const url = currentUrl || "https://terra-world-travel.153557421.workers.dev";
    try {
      await navigator.clipboard.writeText(url);
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
    setCurrentView("overview");
    setTimeout(() => {
      const el = document.getElementById("interactive-playground");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const toggleFaq = (index: number) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  // 问答 AI 处理
  const handleSendCopilotQuery = (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: q }]);
    setInputQuery("");
    setIsAiTyping(true);

    setTimeout(() => {
      const lowerQ = q.toLowerCase();
      let bestMatch = COPILOT_KNOWLEDGE_BASE[0];
      let maxScore = -1;

      COPILOT_KNOWLEDGE_BASE.forEach((item) => {
        let score = 0;
        item.keywords.forEach((kw) => {
          if (lowerQ.includes(kw.toLowerCase())) score += 2;
        });
        if (score > maxScore) {
          maxScore = score;
          bestMatch = item;
        }
      });

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `【${bestMatch.question}】\n\n${bestMatch.answer}`,
        },
      ]);
      setIsAiTyping(false);
    }, 500);
  };

  const FAQS = [
    {
      q: "TERRA-OASIS 与传统游戏引擎（Unreal / Unity）的本质区别是什么？",
      a: "传统游戏引擎依赖人工制作的 3D 几何网格（Meshes）、纹理贴图、光照烘焙和手工物理碰撞体。而 TERRA-OASIS 是纯粹的自回归生成式世界模型。它无需预设三维网格，每帧画面由 14B 因果扩散 Transformer 直接根据前序动作与时空记忆实时预测生成，从底层重构了交互式虚拟世界的呈现方式。",
    },
    {
      q: "为什么在浏览器中无需高端 GPU 就能达到 60 FPS 实时推流？",
      a: "TERRA-OASIS 采用云端分布式因果扩散推理管线与现代浏览器轻量 WebGL 客户端结合的混合架构。模型将用户按键转化为连续动作潜变量注入骨干，同时在边缘端利用轻量化着色器进行多通道隐式渲染（RGB辐射场、深度潜空间与法线通道），大幅降低了终端运行门槛。",
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

  const currentDoc =
    OFFICIAL_DOCS.find((d) => d.id === activeDocId) || OFFICIAL_DOCS[0];

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-[#000000] text-[#f5f5f7]">
      {/* 1. Apple 正统全局导航条 (Apple Global Nav, 44px) */}
      <div className="bg-[#000000] sticky top-0 z-50">
        <div className="mx-auto max-w-7xl flex h-11 items-center justify-between px-5 sm:px-10 text-[13px] sm:text-[14px] text-[#a1a1a6]">
          <button
            type="button"
            onClick={() => setCurrentView("overview")}
            className="text-[#f5f5f7] hover:text-white transition font-medium flex items-center gap-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#2997ff]" />
            <span>TERRA OASIS</span>
          </button>
          <div className="flex items-center gap-5 sm:gap-8">
            <button
              type="button"
              onClick={() => setCurrentView("overview")}
              className={`transition ${
                currentView === "overview" ? "text-white" : "hover:text-[#f5f5f7]"
              }`}
            >
              世界模型
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("docs")}
              className={`transition hidden sm:inline-block ${
                currentView === "docs" ? "text-white" : "hover:text-[#f5f5f7]"
              }`}
            >
              开发文档
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("blog")}
              className={`transition hidden sm:inline-block ${
                currentView === "blog" ? "text-white" : "hover:text-[#f5f5f7]"
              }`}
            >
              研究博客
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView("copilot");
                setCopilotOpen(true);
              }}
              className={`transition flex items-center gap-1.5 ${
                currentView === "copilot" ? "text-white" : "hover:text-[#f5f5f7]"
              }`}
            >
              <span>AI 问答</span>
              <span className="h-1 w-1 rounded-full bg-[#2997ff]" />
            </button>
          </div>
          <a
            href="https://github.com/wangguode/terra-world-travel"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#a1a1a6] hover:text-white transition no-underline"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* 2. Apple 产品专页吸顶导航 (Apple Local Subnav, 52px) */}
      <header className="sticky top-11 z-40 bg-[#000000]">
        <div className="mx-auto max-w-7xl flex h-13 items-center justify-between px-5 sm:px-10">
          <button
            type="button"
            onClick={() => setCurrentView("overview")}
            className="text-[19px] sm:text-[21px] font-semibold text-[#f5f5f7] tracking-tight hover:text-white transition"
          >
            TERRA-OASIS
          </button>

          <nav aria-label="产品二级导航" className="flex items-center gap-3 sm:gap-6 text-[14px]">
            <button
              type="button"
              onClick={() => setCurrentView("overview")}
              className={`transition ${
                currentView === "overview" ? "text-white font-medium" : "text-[#a1a1a6] hover:text-white"
              }`}
            >
              概览
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("docs")}
              className={`transition hidden md:inline-block ${
                currentView === "docs" ? "text-white font-medium" : "text-[#a1a1a6] hover:text-white"
              }`}
            >
              文档中心
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("blog")}
              className={`transition hidden md:inline-block ${
                currentView === "blog" ? "text-white font-medium" : "text-[#a1a1a6] hover:text-white"
              }`}
            >
              前沿论文
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView("copilot");
                setCopilotOpen(true);
              }}
              className={`transition ${
                currentView === "copilot" ? "text-[#2997ff] font-medium" : "text-[#a1a1a6] hover:text-white"
              }`}
            >
              智能助手
            </button>
            <button
              type="button"
              onClick={() => setSnowMode(!snowMode)}
              className="rounded-full bg-white/10 px-3 py-1 text-[13px] text-[#f5f5f7] hover:bg-white/15 transition hidden sm:inline-block"
            >
              {snowMode ? "冰雪已注入" : "注入霜雪"}
            </button>
            <a
              href="#interactive-playground"
              onClick={() => setCurrentView("overview")}
              className="rounded-full bg-[#0071e3] px-3.5 sm:px-4 py-1 text-[13px] font-medium text-white hover:bg-[#0077ed] transition no-underline"
            >
              即刻体验
            </a>
          </nav>
        </div>
      </header>

      {/* ===================== 视图分支 A：概览主站 (Overview) ===================== */}
      {currentView === "overview" && (
        <main>
          {/* 3. Apple 经典居中大片感 Hero Section */}
          <section id="hero" className="relative bg-[#000000] pt-16 sm:pt-24 pb-20 sm:pb-28 text-center">
            <div className="mx-auto max-w-5xl px-5 sm:px-10">
              <div className="terra-reveal space-y-4">
                <div className="text-[17px] sm:text-[19px] font-semibold text-[#f5f5f7] tracking-tight">
                  TERRA-OASIS 世界模型
                </div>

                <h1 className="text-[32px] sm:text-[56px] lg:text-[72px] font-semibold text-[#f5f5f7] tracking-tight leading-[1.06] max-w-4xl mx-auto">
                  物理世界，由神经网络端到端实时生成。
                </h1>

                <p className="mt-4 text-[17px] sm:text-[20px] text-[#d2d2d7] max-w-2xl mx-auto leading-relaxed tnum font-normal">
                  告别传统 3D 几何建模与手工着色器。首个面向现代 Web 浏览器的动作驱动因果扩散世界模型，无需高端显卡，轻按 WASD 即刻漫游无限涌现的时空。
                </p>

                <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-[16px]">
                  <a
                    href="#interactive-playground"
                    className="rounded-full bg-[#0071e3] px-6 py-2.5 text-white hover:bg-[#0077ed] transition no-underline font-medium"
                  >
                    进入交互沙盒
                  </a>
                  <button
                    type="button"
                    onClick={() => setCurrentView("docs")}
                    className="text-[#2997ff] hover:underline flex items-center gap-1 font-medium transition"
                  >
                    <span>查阅技术架构文档</span>
                    <span>&gt;</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("copilot");
                      setCopilotOpen(true);
                    }}
                    className="text-[#2997ff] hover:underline flex items-center gap-1 font-medium transition"
                  >
                    <span>向智能助手提问</span>
                    <span>&gt;</span>
                  </button>
                </div>
              </div>

              {/* Apple 芯片级大指标矩阵 (Key Specs Matrix) */}
              <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 terra-reveal">
                <div className="rounded-[24px] bg-[#161617] p-6 sm:p-8 text-center">
                  <div className="text-[36px] sm:text-[48px] font-semibold text-white tracking-tight tnum">
                    14B
                  </div>
                  <div className="mt-2 text-[14px] text-[#a1a1a6] font-normal">
                    因果扩散 Transformer 骨干
                  </div>
                </div>

                <div className="rounded-[24px] bg-[#161617] p-6 sm:p-8 text-center">
                  <div className="text-[36px] sm:text-[48px] font-semibold text-[#2997ff] tracking-tight tnum">
                    60 FPS
                  </div>
                  <div className="mt-2 text-[14px] text-[#a1a1a6] font-normal">
                    720p 实时神经推流
                  </div>
                </div>

                <div className="rounded-[24px] bg-[#161617] p-6 sm:p-8 text-center">
                  <div className="text-[36px] sm:text-[48px] font-semibold text-white tracking-tight tnum">
                    16 ms
                  </div>
                  <div className="mt-2 text-[14px] text-[#a1a1a6] font-normal">
                    端到端动作条件注入延迟
                  </div>
                </div>

                <div className="rounded-[24px] bg-[#161617] p-6 sm:p-8 text-center">
                  <div className="text-[36px] sm:text-[48px] font-semibold text-white tracking-tight tnum">
                    0 Poly
                  </div>
                  <div className="mt-2 text-[14px] text-[#a1a1a6] font-normal">
                    100% 神经自回归，无预设网格
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. 在线交互沙盒官方体验区 (Apple Style Sandbox) */}
          <section id="interactive-playground" className="relative bg-[#000000] py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-5 sm:px-10">
              <div className="max-w-3xl terra-reveal">
                <h2 className="text-[28px] sm:text-[40px] font-semibold text-white tracking-tight">
                  在线神经虚拟沙盒体验视窗
                </h2>
                <p className="mt-3 text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed">
                  60 FPS WebGL 实时推流就绪：轻按键盘 WASD 实时漫游，按下 E 键破拆体素扰动，Space 键向上跃迁，体验纯神经网络端到端推演的时空因果。
                </p>
              </div>

              {/* 视窗硬件级外壳容器 */}
              <div className="mt-8 rounded-[28px] bg-[#161617] p-2 sm:p-3 terra-reveal">
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
                <div className="mt-3 px-3 py-2 flex flex-wrap items-center justify-between gap-4 text-[14px] text-[#a1a1a6]">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <span className="rounded-[6px] bg-white/10 px-2 py-0.5 text-white font-medium mr-1.5">
                        WASD
                      </span>
                      <span>平移移动</span>
                    </div>
                    <div>
                      <span className="rounded-[6px] bg-white/10 px-2 py-0.5 text-white font-medium mr-1.5">
                        Space
                      </span>
                      <span>反重力跳跃</span>
                    </div>
                    <div>
                      <span className="rounded-[6px] bg-white/10 px-2 py-0.5 text-[#2997ff] font-medium mr-1.5">
                        E 键 / 点击
                      </span>
                      <span>世界破拆扰动</span>
                    </div>
                    <div>
                      <span className="rounded-[6px] bg-white/10 px-2 py-0.5 text-white font-medium mr-1.5">
                        R
                      </span>
                      <span>量子重采样</span>
                    </div>
                  </div>

                  <div className="text-[14px] text-[#a1a1a6]">
                    支持鼠标拖拽视角与移动端触控方向键 · 支持一键全屏沉浸视界
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. 突破传统图形学的四大核心技术支柱 (Technological Pillars) */}
          <section id="technological-pillars" className="bg-[#000000] py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-10">
              <div className="max-w-2xl terra-reveal">
                <h2 className="text-[28px] sm:text-[40px] font-semibold text-white tracking-tight">
                  突破传统图形学极限的四大技术支柱
                </h2>
                <p className="mt-3 text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed">
                  从显式手工 3D 建模迈向隐式神经世界生成，TERRA-OASIS 重新定义了人机虚拟环境的交互范式。
                </p>
              </div>

              <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="rounded-[28px] bg-[#161617] p-8 sm:p-10 terra-reveal space-y-3">
                  <h3 className="text-[22px] sm:text-[24px] font-semibold text-white tracking-tight">
                    1. 动作条件因果注入 (Action Conditioning)
                  </h3>
                  <p className="text-[16px] text-[#d2d2d7] leading-relaxed">
                    不再是被动生成一段固定视频。模型将用户的按键输入与物理位移矢量作为条件潜变量，毫秒级注入扩散主干，以自回归方式逐帧推演出符合操作意图的时空走向。
                  </p>
                </div>

                <div className="rounded-[28px] bg-[#161617] p-8 sm:p-10 terra-reveal space-y-3">
                  <h3 className="text-[22px] sm:text-[24px] font-semibold text-white tracking-tight">
                    2. 无限长程时空连续性 (Causal DiT Horizon)
                  </h3>
                  <p className="text-[16px] text-[#d2d2d7] leading-relaxed">
                    传统自回归视频生成在数秒后容易发生时空漂移与画面坍缩。TERRA-OASIS 采用双智能体时空记忆调度与因果滑动注意力，保证无论漫游多久，物理结构与场景几何永不崩坏。
                  </p>
                </div>

                <div className="rounded-[28px] bg-[#161617] p-8 sm:p-10 terra-reveal space-y-3">
                  <h3 className="text-[22px] sm:text-[24px] font-semibold text-white tracking-tight">
                    3. 自主涌现的内化直觉物理 (Learned Physics)
                  </h3>
                  <p className="text-[16px] text-[#d2d2d7] leading-relaxed">
                    完全无需编写牛顿力学方程或 PhysX 碰撞体代码。神经网络在海量动态数据中自发学到了重力加速度、空气阻尼、碰撞弹射、流体焦散与菲涅尔光斑的客观规律。
                  </p>
                </div>

                <div className="rounded-[28px] bg-[#161617] p-8 sm:p-10 terra-reveal space-y-3">
                  <h3 className="text-[22px] sm:text-[24px] font-semibold text-white tracking-tight">
                    4. 体素破拆扰动与因果自愈 (Neural Perturbation)
                  </h3>
                  <p className="text-[16px] text-[#d2d2d7] leading-relaxed">
                    当用户按下 E 键破拆体素或注入局部高斯噪声时，模型能够即时推演出周围几何破裂飞溅与阴影重构，展现出真正世界模型独有的局部物理干预自适应能力。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. 五大沙盒世界维度画廊 (Apple Bento Gallery) */}
          <section id="world-dimensions" className="bg-[#000000] py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-10">
              <div className="max-w-2xl terra-reveal">
                <h2 className="text-[28px] sm:text-[40px] font-semibold text-white tracking-tight">
                  五大多重沙盒世界维度矩阵
                </h2>
                <p className="mt-3 text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed">
                  每个维度均搭载独特的动力学重力常数、因果时序视界与光学反射特性，点击即可在上方在线视窗中即时加载体验。
                </p>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {WORLD_DIMENSIONS.map((world: WorldDimension) => (
                  <article
                    key={world.id}
                    className="terra-reveal rounded-[28px] bg-[#161617] p-6 sm:p-7 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01]"
                  >
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden rounded-[20px]">
                        <Image
                          src={world.image}
                          alt={world.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-full bg-white/5 px-3 py-1 text-[13px] text-[#2997ff] font-medium">
                          {world.category}
                        </span>
                        <span className="text-[13px] text-[#a1a1a6] tnum">
                          {world.codename}
                        </span>
                      </div>

                      <h3 className="mt-3 text-[20px] font-semibold text-white tracking-tight">
                        {world.name}
                      </h3>

                      <p className="mt-2 text-[15px] text-[#d2d2d7] leading-relaxed">
                        {world.description}
                      </p>

                      <div className="mt-4 bg-[#1d1d1f] rounded-[18px] p-4 space-y-2 text-[14px] tnum">
                        <div className="flex justify-between">
                          <span className="text-[#a1a1a6]">动力学重力：</span>
                          <span className="text-white font-medium">{world.physics.gravity} m/s²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a1a1a6]">因果时序窗口：</span>
                          <span className="text-white font-medium">{world.diffusionConfig.causalWindow} Frames</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a1a1a6]">流式刷新率：</span>
                          <span className="text-[#2997ff] font-medium">{world.diffusionConfig.frameRate} FPS (720p)</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-2">
                      <button
                        type="button"
                        onClick={() => handleSelectDimension(world.id)}
                        className="w-full rounded-full bg-white/10 py-2.5 text-[14px] font-medium text-white hover:bg-white/15 transition"
                      >
                        在视窗中载入此世界 ↑
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* 7. 开发者极速接入与动作流 SDK (Developer Quickstart) */}
          <section id="quickstart" className="bg-[#000000] py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-10">
              <div className="max-w-2xl terra-reveal">
                <h2 className="text-[28px] sm:text-[40px] font-semibold text-white tracking-tight">
                  开发者接入与动作流 SDK
                </h2>
                <p className="mt-3 text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed">
                  面向游戏引擎、机器人控制与研究人员。三行代码即可连接 TERRA-OASIS 动作流服务，注入连续按键与位姿张量。
                </p>
              </div>

              <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 terra-reveal">
                <div className="rounded-[28px] bg-[#161617] p-8 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="text-[18px] font-semibold text-white">客户端免配即玩</div>
                    <p className="mt-2 text-[15px] text-[#d2d2d7] leading-relaxed">
                      完全无需安装环境与独立显卡。任何支持 WebGL 的现代浏览器打开即可通过键盘 WASD 实时漫游 60 FPS 神经虚拟沙盒。
                    </p>
                  </div>
                  <div>
                    <a href="#interactive-playground" className="text-[#2997ff] text-[15px] font-medium hover:underline flex items-center gap-1">
                      <span>立即在视窗中体验</span>
                      <span>&gt;</span>
                    </a>
                  </div>
                </div>

                <div className="rounded-[28px] bg-[#161617] p-8 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="text-[18px] font-semibold text-white">Python 动作流 SDK</div>
                    <pre className="mt-2 text-[13px] text-white/90 p-4 bg-[#1d1d1f] rounded-[16px] overflow-x-auto leading-relaxed">
                      <code>{`import terra_oasis as oasis

client = oasis.connect("wss://api.terra.ai")
stream = client.stream_world(dim="voxel")
stream.send_action({"key": "W", "pitch": 0.1})`}</code>
                    </pre>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView("docs");
                        setActiveDocId("action-protocol");
                      }}
                      className="text-[#2997ff] text-[15px] font-medium hover:underline flex items-center gap-1"
                    >
                      <span>阅读动作注入协议</span>
                      <span>&gt;</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-[28px] bg-[#161617] p-8 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="text-[18px] font-semibold text-white">私有化集群部署</div>
                    <p className="mt-2 text-[15px] text-[#d2d2d7] leading-relaxed">
                      提供 Docker 一键镜像与 vLLM-World 分布式推理后端，支持 8×H100/H800 算力集群高吞吐私有化部署。
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView("docs");
                        setActiveDocId("cluster-deploy");
                      }}
                      className="text-[#2997ff] text-[15px] font-medium hover:underline flex items-center gap-1"
                    >
                      <span>查阅集群部署手册</span>
                      <span>&gt;</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 开源仓库与学术引用 */}
              <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 rounded-[28px] bg-[#161617] p-8 sm:p-10 terra-reveal">
                  <h3 className="text-[22px] sm:text-[28px] font-semibold text-white tracking-tight">
                    完全开源，欢迎社区共建下一代物理世界基座
                  </h3>
                  <p className="mt-3 text-[15px] sm:text-[16px] text-[#d2d2d7] leading-relaxed">
                    遵循 Apache-2.0 协议开源全部前端 WebGL 客户端代码、动作注入中间件以及知识库文档。
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <a
                      href="https://github.com/wangguode/terra-world-travel"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-white px-6 py-2.5 text-[15px] font-semibold text-black no-underline hover:bg-white/90 transition"
                    >
                      访问 GitHub 官方仓库
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyBibtex}
                      className="rounded-full bg-white/10 px-6 py-2.5 text-[15px] font-medium text-white hover:bg-white/15 transition"
                    >
                      {copiedBibtex ? "已复制学术引用 BibTeX" : "复制学术引用 (BibTeX)"}
                    </button>
                  </div>
                </div>

                {/* BibTeX 引用块 */}
                <div className="lg:col-span-6 rounded-[28px] bg-[#161617] p-8 terra-reveal">
                  <div className="flex items-center justify-between text-[14px] text-[#a1a1a6] pb-3">
                    <span className="font-medium text-white">BibTeX Citation</span>
                    <span className="text-[13px] text-[#a1a1a6]">arXiv:2603.01892</span>
                  </div>
                  <pre className="mt-2 text-[13px] text-white/90 overflow-x-auto leading-relaxed p-4 bg-[#1d1d1f] rounded-[16px]">
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

          {/* 8. 常见问题解答 (FAQ) */}
          <section id="faq" className="bg-[#000000] py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-10">
              <div className="max-w-2xl terra-reveal">
                <h2 className="text-[28px] sm:text-[40px] font-semibold text-white tracking-tight">
                  关于 TERRA-OASIS 的常见问题
                </h2>
                <p className="mt-3 text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed">
                  深入了解世界模型技术原理、浏览器运行机制与未来发展路线。
                </p>
              </div>

              <div className="mt-12 space-y-4 max-w-4xl terra-reveal">
                {FAQS.map((faq, index) => {
                  const isOpen = activeFaqIndex === index;
                  return (
                    <div
                      key={faq.q}
                      className="rounded-[24px] bg-[#161617] p-6 sm:p-7 transition"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between text-left gap-4"
                      >
                        <span className="text-[17px] sm:text-[19px] font-semibold text-white tracking-tight">
                          {faq.q}
                        </span>
                        <span className="text-[20px] text-[#2997ff] shrink-0">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      {isOpen && (
                        <p className="mt-4 text-[15px] sm:text-[16px] text-[#d2d2d7] leading-relaxed pt-3">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 移动端快速扫码体验 */}
              <div className="mt-14 rounded-[32px] bg-[#161617] p-8 sm:p-14 terra-reveal">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-7">
                    <h3 className="text-[24px] sm:text-[32px] font-semibold text-white tracking-tight">
                      在任意移动设备上即刻启动沙盒
                    </h3>
                    <p className="mt-4 text-[16px] text-[#d2d2d7] leading-relaxed max-w-xl">
                      针对现代移动浏览器 WebGL 与触控事件进行了深度轻量化优化，无需昂贵算力设备，扫描二维码即可在手机上漫游神经沙盒。
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="rounded-full bg-white px-6 py-2.5 text-[15px] font-semibold text-black hover:bg-white/90 transition"
                      >
                        {copiedLink ? "已复制官网访问链接" : "复制网址到移动端"}
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex justify-center lg:justify-end">
                    <div className="rounded-[24px] bg-white p-6 text-center">
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
                          二维码生成中...
                        </div>
                      )}
                      <div className="mt-3 text-[13px] font-medium text-black">
                        手机 Safari / Chrome 扫码漫游
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ===================== 视图分支 B：架构技术文档中心 (Docs) ===================== */}
      {currentView === "docs" && (
        <main className="min-h-[85vh] bg-[#000000] py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="pb-8">
              <h1 className="text-[32px] sm:text-[44px] font-semibold text-white tracking-tight">
                TERRA-OASIS 架构技术文档中心
              </h1>
              <p className="mt-3 text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed max-w-3xl">
                官方开发指南、动作流条件注入协议规范、14B 因果 Transformer 骨干原理与企业级高可用分布式集群部署指南。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* 左侧文档目录 */}
              <aside className="lg:col-span-4 rounded-[28px] bg-[#161617] p-6 space-y-2 sticky top-28">
                <div className="text-[14px] font-semibold text-white/90 mb-3 px-3">
                  架构文档专栏
                </div>
                {OFFICIAL_DOCS.map((doc) => {
                  const isActive = doc.id === activeDocId;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setActiveDocId(doc.id)}
                      className={`w-full text-left rounded-[18px] px-4 py-3.5 transition flex items-center justify-between ${
                        isActive
                          ? "bg-[#1d1d1f] text-white font-medium"
                          : "text-[#a1a1a6] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div>
                        <div className="text-[15px]">{doc.title}</div>
                        <div className="text-[13px] text-[#a1a1a6] mt-0.5">{doc.badge}</div>
                      </div>
                      <span className="text-[14px] text-[#2997ff]">{isActive ? "•" : ""}</span>
                    </button>
                  );
                })}
              </aside>

              {/* 右侧文档详细正文 */}
              <div className="lg:col-span-8 rounded-[28px] bg-[#161617] p-8 sm:p-12 space-y-8">
                <div>
                  <div className="inline-block rounded-full bg-white/5 px-3 py-1 text-[13px] font-medium text-[#2997ff]">
                    {currentDoc.badge}
                  </div>
                  <h2 className="mt-4 text-[26px] sm:text-[34px] font-semibold text-white tracking-tight">
                    {currentDoc.title}
                  </h2>
                  <p className="mt-2 text-[16px] text-[#d2d2d7] leading-relaxed">
                    {currentDoc.summary}
                  </p>
                </div>

                <div className="relative">
                  <pre className="text-[14px] text-white/90 p-6 bg-[#1d1d1f] rounded-[24px] overflow-x-auto leading-relaxed whitespace-pre-wrap font-sans">
                    <code>{currentDoc.contentMarkdown}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(currentDoc.contentMarkdown || "");
                        setCopiedDocCode(true);
                        setTimeout(() => setCopiedDocCode(false), 2000);
                      } catch {
                        setCopiedDocCode(true);
                        setTimeout(() => setCopiedDocCode(false), 2000);
                      }
                    }}
                    className="absolute top-4 right-4 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-white/20 transition"
                  >
                    {copiedDocCode ? "已复制全文" : "复制代码/文档"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ===================== 视图分支 C：前沿研究博客与社区前沿 (Blog) ===================== */}
      {currentView === "blog" && (
        <main className="min-h-[85vh] bg-[#000000] py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="pb-8 max-w-3xl">
              <h1 className="text-[32px] sm:text-[44px] font-semibold text-white tracking-tight">
                TERRA 研究博客与前沿探索
              </h1>
              <p className="mt-3 text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed">
                来自核心工程与前沿算法团队的一线实战笔记。解构因果扩散世界模型、神经物理涌现与具身智能 Sim-to-Real 的核心突破。
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {OFFICIAL_BLOGS.map((post) => {
                const isExpanded = selectedBlogId === post.id;
                return (
                  <article
                    key={post.id}
                    className="rounded-[28px] bg-[#161617] p-8 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01]"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[13px] text-[#a1a1a6] tnum">
                        <span className="rounded-full bg-white/5 text-[#2997ff] px-3 py-1 font-medium">
                          {post.category}
                        </span>
                        <span>{post.readTime}</span>
                      </div>

                      <h2 className="text-[20px] sm:text-[22px] font-semibold text-white tracking-tight leading-snug">
                        {post.title}
                      </h2>

                      <p className="text-[15px] text-[#d2d2d7] leading-relaxed">
                        {post.summary}
                      </p>

                      {isExpanded && (
                        <div className="mt-4 pt-4 space-y-4 text-[14px] text-white/90 leading-relaxed bg-[#1d1d1f] p-5 rounded-[20px]">
                          {post.content.map((p, idx) => (
                            <p key={idx} className="m-0">
                              {p}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 flex items-center justify-between gap-4 text-[13px] text-[#a1a1a6] tnum">
                      <span>{post.author} · {post.date}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedBlogId(isExpanded ? null : post.id)}
                        className="text-[#2997ff] hover:underline font-medium"
                      >
                        {isExpanded ? "收起阅读 ↑" : "阅读全文 &gt;"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* ===================== 视图分支 D：问答 AI 智能助手全功能工作区 (Copilot) ===================== */}
      {currentView === "copilot" && (
        <main className="min-h-[85vh] bg-[#000000] py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-5 sm:px-10">
            <div className="pb-6">
              <h1 className="text-[32px] sm:text-[40px] font-semibold text-white tracking-tight">
                TERRA-OASIS 智能问答助手
              </h1>
              <p className="mt-2 text-[16px] sm:text-[18px] text-[#d2d2d7] leading-relaxed">
                针对动作条件注入、14B 因果扩散主干、零多边形网格物理模拟提供专业即时解答。
              </p>
            </div>

            {/* 预设提示词快捷气泡 */}
            <div className="flex flex-wrap gap-2.5 pb-6">
              {PRESET_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSendCopilotQuery(prompt)}
                  className="rounded-full bg-[#161617] px-4 py-2 text-[14px] text-[#a1a1a6] hover:bg-[#1d1d1f] hover:text-white transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* 对话窗口 */}
            <div className="rounded-[28px] bg-[#161617] p-6 sm:p-8 flex flex-col h-[520px]">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-2xl rounded-[22px] px-5 py-3.5 text-[15px] leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-[#0071e3] text-white font-normal"
                          : "bg-[#1d1d1f] text-white/90 whitespace-pre-wrap"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiTyping && (
                  <div className="text-[14px] text-[#2997ff]">
                    AI 正在基于世界模型因果知识库推理中...
                  </div>
                )}
              </div>

              {/* 输入框 */}
              <div className="mt-4 pt-4 flex gap-3">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendCopilotQuery();
                  }}
                  placeholder="询问世界模型机制、动作潜变量注入或 Python SDK 接入..."
                  className="flex-1 rounded-full bg-[#1d1d1f] px-5 py-3.5 text-[15px] text-white placeholder-[#a1a1a6] focus:outline-none focus:ring-1 focus:ring-[#2997ff]"
                />
                <button
                  type="button"
                  onClick={() => handleSendCopilotQuery()}
                  className="rounded-full bg-[#0071e3] px-7 py-3.5 text-[15px] font-medium text-white hover:bg-[#0077ed] transition"
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 右下角智能问答 AI 浮动快捷唤起组件 */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => {
            setCurrentView("copilot");
            setCopilotOpen(!copilotOpen);
          }}
          className="rounded-full bg-[#0071e3] p-3.5 sm:px-5 sm:py-3 text-white font-medium flex items-center gap-2 hover:bg-[#0077ed] transition"
          title="点击唤起世界模型智能问答 AI"
        >
          <span className="h-2 w-2 rounded-full bg-white" />
          <span className="text-[14px] hidden sm:inline">AI 问答助手</span>
        </button>
      </div>

      {/* 9. Apple 风格极简官方多列页脚 (Apple Official Footer) */}
      <footer className="bg-[#000000] py-16 text-[13px] sm:text-[14px] text-[#a1a1a6]">
        <div className="mx-auto max-w-7xl px-5 sm:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12">
            <div>
              <div className="text-[14px] font-semibold text-white mb-3">
                产品与平台
              </div>
              <ul className="space-y-2 p-0 list-none">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("overview");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition"
                  >
                    TERRA-OASIS 概览
                  </button>
                </li>
                <li>
                  <a href="#interactive-playground" className="hover:text-white transition no-underline text-[#a1a1a6]">
                    神经虚拟沙盒体验
                  </a>
                </li>
                <li>
                  <a href="#world-dimensions" className="hover:text-white transition no-underline text-[#a1a1a6]">
                    五大世界维度矩阵
                  </a>
                </li>
                <li>
                  <a href="#technological-pillars" className="hover:text-white transition no-underline text-[#a1a1a6]">
                    内化物理与因果 DiT
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-[14px] font-semibold text-white mb-3">
                开发者与架构文档
              </div>
              <ul className="space-y-2 p-0 list-none">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("docs");
                      setActiveDocId("getting-started");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition"
                  >
                    快速上手与环境配置
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("docs");
                      setActiveDocId("action-protocol");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition"
                  >
                    动作注入条件协议 (API)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("docs");
                      setActiveDocId("dit-backbone");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition"
                  >
                    14B 因果扩散骨干详解
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("docs");
                      setActiveDocId("cluster-deploy");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition"
                  >
                    8×H100 集群私有化部署
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-[14px] font-semibold text-white mb-3">
                前沿研究博客
              </div>
              <ul className="space-y-2 p-0 list-none">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("blog");
                      setSelectedBlogId("blog-1");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition"
                  >
                    突破 10 秒崩溃魔咒
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("blog");
                      setSelectedBlogId("blog-2");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition"
                  >
                    放弃手工着色器涌现物理
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("blog");
                      setSelectedBlogId("blog-3");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition"
                  >
                    具身智能 Sim-to-Real 探索
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("copilot");
                      setCopilotOpen(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition flex items-center gap-1.5"
                  >
                    <span>智能问答 AI Copilot</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2997ff]" />
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-[14px] font-semibold text-white mb-3">
                开源生态与关于
              </div>
              <ul className="space-y-2 p-0 list-none">
                <li>
                  <a
                    href="https://github.com/wangguode/terra-world-travel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition no-underline text-[#a1a1a6]"
                  >
                    GitHub 源码仓库
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/wangguode/terra-world-travel/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition no-underline text-[#a1a1a6]"
                  >
                    发行版本 (v2.0.0)
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleCopyBibtex}
                    className="hover:text-white transition"
                  >
                    复制 BibTeX 学术引用
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("overview");
                      const el = document.getElementById("faq");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="hover:text-white transition"
                  >
                    常见技术问题解答 (FAQ)
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#a1a1a6]">
            <div>
              Copyright © 2026 TERRA World Model Open Source Initiative. All rights reserved.
            </div>
            <div className="flex gap-4">
              <span>基于 Apache-2.0 协议开源</span>
              <span>·</span>
              <span>面向下一代具身智能与交互世界基座</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppleFlagshipWebsite;
