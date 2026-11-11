"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface ArchitectureLayer {
  id: string;
  nameEn: string;
  nameZh: string;
  eyebrowEn: string;
  eyebrowZh: string;
  tensorShape: string;
  latencyContribution: string;
  headlineEn: string;
  headlineZh: string;
  descriptionEn: string;
  descriptionZh: string;
  breakthroughEn: string;
  breakthroughZh: string;
  codeFormula: string;
}

const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  {
    id: "action-encoder",
    nameEn: "Continuous Action Embedding",
    nameZh: "连续 6-DoF 动作流嵌入层",
    eyebrowEn: "LAYER 01 · KINEMATICS PROJECTION",
    eyebrowZh: "第 01 层 · 连续运动学隐空间投影",
    tensorShape: "[B, T, 6] → [B, T, 1024]",
    latencyContribution: "0.8 ms",
    headlineEn: "Direct continuous torque-to-latent projection without discrete tokenization.",
    headlineZh: "连续动作扭矩直接投影至潜流形，彻底打破离散 Token 步长限制。",
    descriptionEn: "Maps 6-DoF camera trajectories and robot joint torques into continuous latent manifolds using sinusoidal positional encoding and MLP projection, providing smooth conditioning signals for every spatiotemporal patch.",
    descriptionZh: "将 6 自由度相机位姿变化量与机器人电机扭矩连续向量，通过自适应多层感知机与正弦位置编码直接映射为高维连续特征，为时空扩散注意块提供亚毫秒级的平滑因果条件引导。",
    breakthroughEn: "Eliminates velocity jitter and dead-reckoning accumulation errors over long navigation horizons.",
    breakthroughZh: "彻底消除了长程导航推演中常见的速度抖动与累积推算漂移误差。",
    codeFormula: "z_a = MLP(concat(a_t, PE(t))) ∈ ℝ^(B × T × 1024)",
  },
  {
    id: "causal-backbone",
    nameEn: "14B Spatio-Temporal Causal DiT",
    nameZh: "140 亿参数时空因果 DiT 主干",
    eyebrowEn: "LAYER 02 · NEURAL BACKBONE",
    eyebrowZh: "第 02 层 · 自回归因果扩散 Transformer",
    tensorShape: "[B, 16, 32, 32, 128]",
    latencyContribution: "7.6 ms",
    headlineEn: "Strict lower-triangular causal attention enforcing physical temporal directionality.",
    headlineZh: "严格下三角因果注意力机制，强制约束物理时序单向演变律。",
    descriptionEn: "Features 36 transformer blocks combining axial spatial self-attention with causal temporal cross-attention. Future video frames are synthesized solely based on historical context and incoming action vectors.",
    descriptionZh: "由 36 组交织的时空轴向自注意力块组成，在时间维度施加严格因果掩码。未来任何一帧三维场景的生成，严格依赖前序时空潜变量历史与当前输入的控制向量，杜绝时间穿越假象。",
    breakthroughEn: "Generates intuitive rigid collisions, rolling inertia, and specular reflection flows automatically.",
    breakthroughZh: "自发涌现刚体弹性碰撞、滚动惯性以及随视点连续位移的复杂菲涅尔高光演变。",
    codeFormula: "Attention(Q, K, V) = softmax(Q·Kᵀ / √d + M_causal) · V",
  },
  {
    id: "memory-anchors",
    nameEn: "Sliding Temporal Attention & Anchors",
    nameZh: "时序滑动注意力窗口与记忆锚点",
    eyebrowEn: "LAYER 03 · LONG-HORIZON STABILITY",
    eyebrowZh: "第 03 层 · 无限长程稳定性保障体系",
    tensorShape: "Window: 16 Frames · Keyframe Memory: 128",
    latencyContribution: "2.1 ms",
    headlineEn: "Dual-anchor spatial memory prevents cumulative structural collapse indefinitely.",
    headlineZh: "双记忆锚点机制，彻底终结自回归生成长程结构坍塌与遗忘魔咒。",
    descriptionEn: "By periodically pinning global reference latents into a sparse keyframe buffer while sliding local window attention, the model maintains perfect geographic loop-closure when roaming back to previously visited landmarks.",
    descriptionZh: "在滑动推演过程中，系统自动提取全局地标稀疏关键帧并写入长程记忆池；当用户旋转漫游数分钟后重回起点时，双锚点机制确保原有建筑结构、光影角度与空间相对坐标绝对保真重现。",
    breakthroughEn: "Infinite non-collapsing interactive roaming demonstrated over 30+ minutes of continuous control.",
    breakthroughZh: "在长达 30 分钟以上的连续实机推演测试中，场景保真度零衰减，闭环重访重合度达 99.4%。",
    codeFormula: "Attn_hybrid = α · Attn_local(W_16) + (1-α) · Attn_global(M_anchor)",
  },
  {
    id: "webgpu-decoder",
    nameEn: "Edge WGSL Latent Shader Decoder",
    nameZh: "WebGPU 边缘着色器即时解码器",
    eyebrowEn: "LAYER 04 · CLIENT HARDWARE ACCELERATION",
    eyebrowZh: "第 04 层 · 客户端全硬件零安装加速",
    tensorShape: "WGSL Compute Pipeline · 60 FPS",
    latencyContribution: "1.9 ms",
    headlineEn: "Native GPU parallel decompression directly to screen photons without server lag.",
    headlineZh: "纯原生 GPU 边缘端并行解算，零安装免服务器推流延迟。",
    descriptionEn: "A custom-written WebGPU compute shader executes lightweight inverse latent transform directly on the client's local GPU, transforming latent feature maps into crisp RGB radiance points at 60 FPS.",
    descriptionZh: "基于 WGSL 手工精简优化的边缘端反演着色器直接挂载于用户本地显卡，在无需本地高端工作站的前提下，以低于 2 毫秒的开销将潜空间张量解压还原为 60 FPS 的超高清真实时空光子。",
    breakthroughEn: "Sub-16ms action-to-photon latency on any standard modern laptop browser.",
    breakthroughZh: "在普通现代笔记本浏览器中即可实现低于 16 毫秒的「动作到光子」极速响应。",
    codeFormula: "C_rgb(x, y) = WGSL_Decompress(Z_latent, SunAngle) ∈ [0, 1]³",
  },
];

export function AppleNeuralSpecDeepdive() {
  const { lang } = useLanguage();
  const [activeLayerId, setActiveLayerId] = useState<string>("causal-backbone");

  const currentLayer =
    ARCHITECTURE_LAYERS.find((l) => l.id === activeLayerId) || ARCHITECTURE_LAYERS[1];

  return (
    <section className="bg-white py-24 sm:py-32 terra-reveal w-full box-border">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 space-y-14">
        {/* Apple 经典大标题与 Eyebrow 导读 */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3.5 py-1 text-[13px] font-semibold text-[#0071e3] tracking-widest uppercase">
            <span>{lang === "en" ? "NEURAL ARCHITECTURE EXPLODED VIEW" : "世界模型神经网络分层解剖"}</span>
          </div>

          <h2 className="text-[34px] sm:text-[48px] lg:text-[56px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.05]">
            {lang === "en"
              ? "Deep dive into the 14B causal engine."
              : "深入 140 亿参数神经因果引擎的每一层。"}
          </h2>

          <p className="text-[18px] sm:text-[21px] text-[#6e6e73] leading-relaxed font-normal">
            {lang === "en"
              ? "Explore the four foundational layers that enable real-time 60 FPS continuous physical world generation directly in browser hardware."
              : "逐层拆解驱动全双工 60 FPS 物理世界即时涌现的四大底层神经子系统。从动作流嵌入到边缘硬件着色器解码，见证自回归推演的技术基石。"}
          </p>
        </div>

        {/* Apple 经典 4 栏层级交互切换药丸 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ARCHITECTURE_LAYERS.map((layer, idx) => {
            const isActive = layer.id === activeLayerId;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setActiveLayerId(layer.id)}
                className={`text-left rounded-[22px] p-5 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  isActive
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase">
                  <span className={isActive ? "text-[#2997ff]" : "text-[#86868b]"}>
                    LAYER 0{idx + 1}
                  </span>
                  <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-[#2997ff]" : "bg-[#86868b]"}`} />
                </div>
                <div className="text-[14px] sm:text-[15px] font-semibold tracking-tight leading-snug">
                  {lang === "en" ? layer.nameEn : layer.nameZh}
                </div>
                <div className="text-[12px] opacity-60 tnum">
                  {layer.latencyContribution}
                </div>
              </button>
            );
          })}
        </div>

        {/* 核心解剖视窗展台 (Apple 旗舰级分层展台) */}
        <div className="rounded-[32px] bg-[#f5f5f7] p-8 sm:p-12 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 左侧：详细论述与科学突破 (7 列) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="text-[12px] font-semibold text-[#0071e3] tracking-widest uppercase">
                {lang === "en" ? currentLayer.eyebrowEn : currentLayer.eyebrowZh}
              </div>

              <h3 className="text-[26px] sm:text-[34px] font-semibold text-[#1d1d1f] tracking-tight leading-snug">
                {lang === "en" ? currentLayer.headlineEn : currentLayer.headlineZh}
              </h3>

              <p className="text-[16px] text-[#515154] leading-relaxed">
                {lang === "en" ? currentLayer.descriptionEn : currentLayer.descriptionZh}
              </p>

              {/* 关键突破 Callout */}
              <div className="rounded-[20px] bg-white p-5 space-y-2">
                <div className="text-[12px] font-semibold text-[#1d1d1f] uppercase tracking-wider">
                  {lang === "en" ? "KEY QUANTITATIVE IMPACT" : "核心定量工程突破"}
                </div>
                <p className="text-[14px] text-[#6e6e73] leading-relaxed font-normal">
                  {lang === "en" ? currentLayer.breakthroughEn : currentLayer.breakthroughZh}
                </p>
              </div>
            </div>

            {/* 右侧：张量规格与数学推导框 (5 列) */}
            <div className="lg:col-span-5 rounded-[26px] bg-[#1d1d1f] text-white p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold tracking-wider uppercase text-[#86868b]">
                  {lang === "en" ? "TENSOR & COMPUTATION METRICS" : "张量规格与计算指标"}
                </div>
                <div className="text-[20px] font-semibold text-white tracking-tight">
                  {lang === "en" ? "Mathematical Rigor" : "数学表达与算子签名"}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[11px] text-[#86868b] uppercase tracking-wider">
                    {lang === "en" ? "Tensor Manifold Dimensions" : "潜空间张量流形维度"}
                  </div>
                  <div className="text-[14px] font-medium text-white tnum">
                    <code>{currentLayer.tensorShape}</code>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-[#86868b] uppercase tracking-wider">
                    {lang === "en" ? "Inference Latency Overhead" : "前向推演计算开销"}
                  </div>
                  <div className="text-[24px] font-semibold text-[#2997ff] tnum">
                    {currentLayer.latencyContribution}
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <div className="text-[11px] text-[#86868b] uppercase tracking-wider">
                    {lang === "en" ? "Governing Equation" : "核心算子控制方程"}
                  </div>
                  <div className="rounded-[14px] bg-white/10 p-3 text-[12px] text-white/90 overflow-x-auto whitespace-pre">
                    <code>{currentLayer.codeFormula}</code>
                  </div>
                </div>
              </div>

              <div className="text-[12px] text-[#86868b] leading-relaxed">
                {lang === "en"
                  ? "Fully implemented with zero external proprietary physics engines. Synthesized purely in latent diffusion."
                  : "完全由自回归潜空间因果扩散合成，不依赖任何第三方闭源物理引擎插件。"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
