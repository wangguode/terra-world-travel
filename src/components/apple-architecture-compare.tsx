"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface MetricRow {
  labelEn: string;
  labelZh: string;
  oasisValue: string;
  legacyValue: string;
  oasisScore: number; // 0-100
  legacyScore: number; // 0-100
  unit: string;
}

const COMPARISON_METRICS: MetricRow[] = [
  {
    labelEn: "Action-to-Photon Latency",
    labelZh: "动作到光子推演延迟",
    oasisValue: "12.4",
    legacyValue: "45.0",
    oasisScore: 92,
    legacyScore: 35,
    unit: "ms",
  },
  {
    labelEn: "Asset Payload Footprint",
    labelZh: "客户端资产体积占用",
    oasisValue: "0",
    legacyValue: "48.5",
    oasisScore: 98,
    legacyScore: 20,
    unit: "MB",
  },
  {
    labelEn: "Sim-to-Real Transfer Rate",
    labelZh: "实体机器人零样本迁移率",
    oasisValue: "94.2",
    legacyValue: "41.6",
    oasisScore: 94,
    legacyScore: 42,
    unit: "%",
  },
  {
    labelEn: "Continuous Stability Horizon",
    labelZh: "自回归推演无坍塌时程",
    oasisValue: "∞",
    legacyValue: "3.2",
    oasisScore: 99,
    legacyScore: 25,
    unit: "sec",
  },
];

export function AppleArchitectureCompare() {
  const { lang } = useLanguage();
  const [activeMode, setActiveMode] = useState<"oasis" | "legacy">("oasis");

  return (
    <section className="bg-white py-20 sm:py-28 terra-reveal w-full box-border">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 space-y-12">
        {/* 标题导读 */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[13px] font-medium text-[#0071e3]">
            <span>{lang === "en" ? "Architecture Breakthrough" : "架构范式重构"}</span>
            <span>·</span>
            <span>{lang === "en" ? "Generative vs Polygonal" : "自回归神经 vs 传统网格"}</span>
          </div>

          <h2 className="text-[32px] sm:text-[44px] lg:text-[52px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.08]">
            {lang === "en"
              ? "Why the neural world model changes everything."
              : "为什么自回归神经世界模型颠覆了传统仿真。"}
          </h2>

          <p className="text-[17px] sm:text-[19px] text-[#515154] leading-relaxed font-normal">
            {lang === "en"
              ? "Compare the causal autoregressive architecture of TERRA-OASIS against legacy polygonal simulation pipelines. No manual collision meshes, no static lightmaps—just continuous intuitive physics."
              : "对比 TERRA-OASIS 自回归因果架构与传统多边形物理引擎的本质差异。无需手工绑定碰撞体，无需预烘焙静态光照贴图，物理交互与自然光影在隐空间中自发涌现。"}
          </p>
        </div>

        {/* Apple 经典分段控制胶囊 (Segmented Control) */}
        <div className="flex items-center justify-start">
          <div className="inline-flex rounded-full bg-[#f5f5f7] p-1.5 transition">
            <button
              type="button"
              onClick={() => setActiveMode("oasis")}
              className={`rounded-full px-5 py-2 text-[14px] font-medium transition cursor-pointer flex items-center gap-2 ${
                activeMode === "oasis"
                  ? "bg-white text-[#1d1d1f]"
                  : "text-[#515154] hover:text-[#1d1d1f]"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${activeMode === "oasis" ? "bg-[#0071e3]" : "bg-[#86868b]"}`} />
              <span>TERRA-OASIS (14B Neural DiT)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("legacy")}
              className={`rounded-full px-5 py-2 text-[14px] font-medium transition cursor-pointer flex items-center gap-2 ${
                activeMode === "legacy"
                  ? "bg-white text-[#1d1d1f]"
                  : "text-[#515154] hover:text-[#1d1d1f]"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${activeMode === "legacy" ? "bg-[#e30000]" : "bg-[#86868b]"}`} />
              <span>{lang === "en" ? "Legacy Game Engine (PhysX)" : "传统游戏物理引擎 (PhysX / UE5)"}</span>
            </button>
          </div>
        </div>

        {/* 核心对比便当盒 (Apple Bento Comparison Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* 左侧：架构解析画幅 (7 列) */}
          <div className="lg:col-span-7 rounded-[32px] bg-[#f5f5f7] p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="text-[12px] font-semibold tracking-wider uppercase text-[#0071e3]">
                {activeMode === "oasis"
                  ? (lang === "en" ? "AUTOREGRESSIVE CAUSAL PARADIGM" : "自回归因果隐空间范式")
                  : (lang === "en" ? "STATIC RIGID BODY SIMULATION" : "传统多边形刚体碰撞范式")}
              </div>

              <h3 className="text-[26px] sm:text-[32px] font-semibold text-[#1d1d1f] tracking-tight leading-snug">
                {activeMode === "oasis"
                  ? (lang === "en"
                      ? "Zero polygons. Infinite dynamic physics synthesized directly from continuous actions."
                      : "零多边形网格。连续控制动作直接激发三维时空演化。")
                  : (lang === "en"
                      ? "Rigid polygon meshes with brittle collision boundaries and baked textures."
                      : "脆弱的网格刚体碰撞体，依赖繁重的人工贴图与物理参数手工调优。")}
              </h3>

              <p className="text-[15px] sm:text-[16px] text-[#515154] leading-relaxed">
                {activeMode === "oasis"
                  ? (lang === "en"
                      ? "TERRA-OASIS integrates continuous 6-DoF kinematics directly into a causal Diffusion Transformer. Spatiotemporal coherence, fluid dynamics, and solar daylight angles are synthesized autoregressively, eliminating the sim-to-real visual gap."
                      : "TERRA-OASIS 将 6 自由度连续动作向量直接注入自回归扩散 Transformer。时空连续性、流体运动学与太阳高度角完全由神经网络自发推演，彻底消除了传统计算机图形学与现实物理世界之间的鸿沟。")
                  : (lang === "en"
                      ? "Legacy engines require thousands of hand-crafted collision primitives, UV texture wrapping, and discrete raycasts. Complex deformable objects frequently clip through geometry, requiring excessive engineering workarounds."
                      : "传统方案必须手工构建数万个刚体碰撞网格、UV 展 UV 贴图与离散射线检测。复杂形变物体与液体频繁发生穿模与物理爆炸，在真实机器人迁移中面临严重的仿真间隙。")}
              </p>
            </div>

            {/* Apple 芯片发布会式动态管线流向 */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold tracking-wider uppercase text-[#86868b]">
                {activeMode === "oasis"
                  ? (lang === "en" ? "AUTOREGRESSIVE PIPELINE" : "自回归计算管线流程")
                  : (lang === "en" ? "LEGACY DISCRETE PIPELINE" : "传统离散渲染管线流程")}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[12px]">
                {activeMode === "oasis" ? (
                  <>
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-[#1d1d1f]">
                      {lang === "en" ? "Action Input a(t)" : "连续动作向量 a(t)"}
                    </span>
                    <span className="text-[#86868b]">→</span>
                    <span className="rounded-full bg-[#0071e3]/10 px-3 py-1 font-semibold text-[#0071e3]">
                      {lang === "en" ? "14B Causal DiT" : "14B 因果时空 DiT"}
                    </span>
                    <span className="text-[#86868b]">→</span>
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-[#1d1d1f]">
                      {lang === "en" ? "Dual Memory Anchors" : "双记忆锚点"}
                    </span>
                    <span className="text-[#86868b]">→</span>
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-[#34c759]">
                      {lang === "en" ? "60 FPS Photons" : "60 FPS 无坍塌光子"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-[#1d1d1f]">
                      {lang === "en" ? "Discrete Meshes" : "离散网格资产"}
                    </span>
                    <span className="text-[#86868b]">→</span>
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-[#1d1d1f]">
                      {lang === "en" ? "Hand-tuned Colliders" : "手工碰撞体"}
                    </span>
                    <span className="text-[#86868b]">→</span>
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-[#1d1d1f]">
                      {lang === "en" ? "Discrete PhysX Raycast" : "离散物理检测"}
                    </span>
                    <span className="text-[#86868b]">→</span>
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-[#ff3b30]">
                      {lang === "en" ? "Frequent Clipping" : "易穿模/坍塌"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 关键特性胶囊组 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <div className="text-[12px] text-[#86868b] font-medium">
                  {lang === "en" ? "Geometric Representation" : "几何表征形式"}
                </div>
                <div className="text-[15px] font-semibold text-[#1d1d1f]">
                  {activeMode === "oasis"
                    ? (lang === "en" ? "3D Radiance Points & Latent Fields" : "连续隐潜场 + 3D 高斯辐射点云")
                    : (lang === "en" ? "Discrete Triangles & LOD Meshes" : "离散三角网格与 LOD 模型")}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[12px] text-[#86868b] font-medium">
                  {lang === "en" ? "Illumination & Daylight" : "天光演进机制"}
                </div>
                <div className="text-[15px] font-semibold text-[#1d1d1f]">
                  {activeMode === "oasis"
                    ? (lang === "en" ? "Continuous Solar Latent Synthesis" : "连续太阳高度角自回归生成")
                    : (lang === "en" ? "Static Lightmaps / Ray Tracing" : "预烘焙光照贴图 / 重型光追")}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：关键量化指标条形展台 (5 列) */}
          <div className="lg:col-span-5 rounded-[32px] bg-[#f5f5f7] p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-1">
              <div className="text-[12px] font-semibold tracking-wider uppercase text-[#86868b]">
                {lang === "en" ? "EMPIRICAL BENCHMARKS" : "实测基准对照"}
              </div>
              <h4 className="text-[20px] font-semibold text-[#1d1d1f]">
                {lang === "en" ? "Quantitative Performance" : "核心技术指标实测"}
              </h4>
            </div>

            {/* 指标条形对比列表 */}
            <div className="space-y-6">
              {COMPARISON_METRICS.map((metric) => {
                const isOasis = activeMode === "oasis";
                const activeValue = isOasis ? metric.oasisValue : metric.legacyValue;
                const activeScore = isOasis ? metric.oasisScore : metric.legacyScore;
                const barColor = isOasis ? "bg-[#0071e3]" : "bg-[#86868b]";

                return (
                  <div key={metric.labelEn} className="space-y-2">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-medium text-[#1d1d1f]">
                        {lang === "en" ? metric.labelEn : metric.labelZh}
                      </span>
                      <span className="font-semibold text-[#1d1d1f] tnum">
                        {activeValue} {metric.unit}
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-[#e5e5e7] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-[width] duration-700 ease-out`}
                        style={{ width: `${activeScore}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 text-[12px] text-[#86868b] leading-relaxed">
              {lang === "en"
                ? "Tested on Ubuntu 22.04 LTS with 8x NVIDIA H100 SXM5 GPUs and Chrome 128 WebGPU client."
                : "实测环境基于 Ubuntu 22.04 LTS、8x NVIDIA H100 SXM5 集群与普通 Chrome 128 WebGPU 浏览器。"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
