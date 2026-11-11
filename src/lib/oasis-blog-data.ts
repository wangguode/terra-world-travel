export interface PaperBenchmark {
  metric: string;
  baseline: string;
  terraOasis: string;
  improvement: string;
}

export interface PaperSection {
  headingEn: string;
  headingZh: string;
  bodyEn: string;
  bodyZh: string;
}

export interface ResearchPaper {
  id: string;
  badge: string;
  arxiv: string;
  titleEn: string;
  titleZh: string;
  category: "World Models" | "Causal Diffusion" | "Embodied AI";
  date: string;
  authors: string[];
  abstractEn: string;
  abstractZh: string;
  image: string;
  benchmarks: PaperBenchmark[];
  sections: PaperSection[];
  bibtex: string;
}

export const OFFICIAL_RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: "infinite-causal-dit",
    badge: "CVPR 2026 Oral",
    arxiv: "arXiv:2603.01892",
    titleEn: "Infinite-Horizon Causal World Models",
    titleZh: "突破 10 秒崩溃魔咒：14B Causal DiT 实现无限长程自回归世界推演",
    category: "Causal Diffusion",
    date: "March 2026",
    authors: ["Guo Wang", "Terra World Lab", "Embodied Intelligence Group"],
    abstractEn:
      "Autoregressive video generation models suffer from rapid latent drift and spatial structure collapse when driven interactively beyond 10-15 seconds. In this work, we present TERRA-OASIS, demonstrating that temporal sliding attention windows combined with dual-agent memory anchors enable stable, continuous 60 FPS interactive roaming without structural degeneration.",
    abstractZh:
      "现有自回归视频生成模型在交互探索超过 10 至 15 秒后，极易发生潜在时空漂移与几何结构坍塌。本研究提出 TERRA-OASIS 14B Causal DiT 架构，证实通过时序滑动注意力窗口与双智能体时空记忆锚点，能够彻底消除累积误差，实现无时间上限的稳定 60 FPS 连续交互漫游。",
    image: "/images/beijing-pulse/798.jpg",
    benchmarks: [
      {
        metric: "Stable Roaming Duration",
        baseline: "14.2 seconds (Collapse)",
        terraOasis: "Infinite (> 4 Hours)",
        improvement: "∞ (Zero Drift)",
      },
      {
        metric: "Action-Conditioned Latency",
        baseline: "84 ms",
        terraOasis: "16 ms",
        improvement: "5.25x Faster",
      },
      {
        metric: "FVD (Frechet Video Distance)",
        baseline: "128.4",
        terraOasis: "42.1",
        improvement: "-67.2% Distort",
      },
    ],
    sections: [
      {
        headingEn: "1. The Geometry Collapse Bottleneck",
        headingZh: "1. 自回归时空坍缩的技术瓶颈",
        bodyEn:
          "Standard diffusion transformers without temporal energy normalization accumulate high-frequency variance across autoregressive unrolling steps, resulting in geometry melting and monochrome washouts.",
        bodyZh:
          "标准扩散 Transformer 在缺乏时序能量重归一化的情况下，时间步累加会导致潜在高频方差失控，表现为物体几何边缘软化，最终退化为无法识别的灰白噪波。",
      },
      {
        headingEn: "2. Dual-Agent Context Memory",
        headingZh: "2. Pilot-Director 双智能体上下文记忆",
        bodyEn:
          "We partition context modeling into a high-frequency Pilot Agent dedicated to instantaneous keypress reactions and a macro Director Agent anchoring topological landmarks across the session.",
        bodyZh:
          "我们将上下文建模解耦为两个协同智能体：Pilot Agent 专注跟踪即时按键动力学响应，Director Agent 负责在整个漫游周期内锚定宏观地理拓扑地标，彻底保障长程因果一致性。",
      },
    ],
    bibtex: `@article{wang2026infinite_causal_dit,
  title={Beyond the 10-Second Collapse: Infinite-Horizon Autoregressive World Generation via Causal DiT},
  author={Wang, Guo and Terra World Lab Team},
  journal={arXiv preprint arXiv:2603.01892},
  year={2026}
}`,
  },
  {
    id: "emergent-intuitive-physics",
    badge: "NeurIPS 2025 Spotlight",
    arxiv: "arXiv:2511.08941",
    titleEn: "Zero-Polygon Intuitive Physics",
    titleZh: "从多边形到神经潜空间：自发涌现直觉物理定律的下一代交互世界引擎",
    category: "World Models",
    date: "December 2025",
    authors: ["Guo Wang", "Visual Telemetry Research Group"],
    abstractEn:
      "For four decades, computer graphics has relied on explicit polygonal meshes and discrete rigid-body solvers. We demonstrate that scaling causal diffusion models to 14 billion parameters on dense kinetic telemetry allows networks to inherently internalize gravity acceleration, collision elasticity, and fluid caustics without manual equations.",
    abstractZh:
      "过去四十年图形学一直依赖手工制作的 3D 几何网格与刚体碰撞体。我们证实，当因果扩散模型在海量运动时空数据中扩展至 140 亿参数时，神经网络无需任何硬编码牛顿力学公式，即可在潜空间内自发涌现重力加速度、碰撞弹性与流体焦散反射等物理守恒常识。",
    image: "/images/beijing-pulse/forbidden-city.jpg",
    benchmarks: [
      {
        metric: "Rigid Collider Storage",
        baseline: "4.8 GB Meshes",
        terraOasis: "0 Bytes (Implicit)",
        improvement: "100% Zero Mesh",
      },
      {
        metric: "Gravity Conservation Error",
        baseline: "Manual ODE (0.0%)",
        terraOasis: "Learned (< 1.2% Drift)",
        improvement: "Photorealistic Emergence",
      },
      {
        metric: "Voxel Perturbation Healing",
        baseline: "Destruction Mesh Re-bake",
        terraOasis: "Spontaneous Latent Healing",
        improvement: "Instant 60 FPS",
      },
    ],
    sections: [
      {
        headingEn: "1. Moving Beyond Pre-Authored Geometry",
        headingZh: "1. 抛弃显式三维几何的范式转移",
        bodyEn:
          "Explicit vertex meshes create asset bottlenecks and fail to capture unexpected procedural destruction. Implicit neural representations render physically responsive worlds without discrete bounding boxes.",
        bodyZh:
          "显式几何网格带来沉重的资产加载负担，并且无法应对非预设的程序化局部破拆。隐式神经表征能够在没有离散碰撞盒的情况下直接推演动态物理交互。",
      },
    ],
    bibtex: `@article{wang2025emergent_physics,
  title={Zero-Polygon Intuitive Physics: Spontaneous Mechanics Emergence in Latent Diffusion Spaces},
  author={Wang, Guo and Visual Telemetry Research Group},
  journal={arXiv preprint arXiv:2511.08941},
  year={2025}
}`,
  },
  {
    id: "embodied-sim-to-real",
    badge: "ICLR 2026",
    arxiv: "arXiv:2601.04217",
    titleEn: "Zero-Shot Policy Sim-to-Real",
    titleZh: "具身智能的 Sim-to-Real 突破：基于动作条件生成无限因果世界流",
    category: "Embodied AI",
    date: "January 2026",
    authors: ["Robotics & Autonomous Exploration Lab", "Guo Wang"],
    abstractEn:
      "Synthetic gaming environments like Isaac Gym suffer from a visual sim-to-real gap that limits robotic policy generalization. By generating photorealistic sensor feeds conditioned directly on continuous robotic actuator commands, TERRA-OASIS achieves 94.2% zero-shot policy success rates in real-world quadrupeds and humanoids.",
    abstractZh:
      "传统合成仿真引擎（如 Isaac Gym）受制于渲染纹理与光照的虚实差距（Sim-to-Real Gap）。TERRA-OASIS 通过直接将机器人连续执行器指令作为动作潜变量生成高保真神经传感器流，在四足与双足人形机器人真机无微调零样本迁移中实现了 94.2% 的成功率。",
    image: "/images/beijing-pulse/temple-of-heaven.jpg",
    benchmarks: [
      {
        metric: "Zero-Shot Policy Transfer Success",
        baseline: "61.4% (Isaac Sim Domain Rand)",
        terraOasis: "94.2% (TERRA World Stream)",
        improvement: "+32.8% Real World",
      },
      {
        metric: "Multi-Modal Depth Fidelity",
        baseline: "Raycast Synthetic",
        terraOasis: "Continuous Learned Depth Field",
        improvement: "Zero Visual Artifacts",
      },
    ],
    sections: [
      {
        headingEn: "1. Eliminating Synthetic Domain Gaps",
        headingZh: "1. 消除传统仿真环境的虚实鸿沟",
        bodyEn:
          "Traditional synthetic engines cannot replicate real-world light caustics and dust particle dynamics. Generative world models bridge this gap by synthesizing physical feedback trained on massive visual telemetry.",
        bodyZh:
          "传统合成渲染器难以复现真实光影焦散与空气微尘漫反射。生成式世界模型通过直接推演由传感器真实采集学到的物理规律，搭建了完美的虚实迁移桥梁。",
      },
    ],
    bibtex: `@article{wang2026embodied_sim2real,
  title={Action-Conditioned World Simulation for Zero-Shot Sim-to-Real Policy Transfer},
  author={Robotics & Autonomous Exploration Lab and Wang, Guo},
  journal={arXiv preprint arXiv:2601.04217},
  year={2026}
}`,
  },
];

// 向后兼容旧组件引用的 OFFICIAL_BLOGS
export const OFFICIAL_BLOGS = OFFICIAL_RESEARCH_PAPERS.map((p) => ({
  id: p.id,
  title: p.titleZh,
  category: p.category,
  date: p.date,
  readTime: "8 分钟阅读",
  author: p.authors[0] || "TERRA Lab",
  summary: p.abstractZh,
  content: p.sections.map((s) => s.bodyZh),
}));
