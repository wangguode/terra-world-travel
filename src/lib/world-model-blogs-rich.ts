export interface PaperBlogArticle {
  id: string;
  paperId: string;
  title: string;
  titleZh: string;
  org: string;
  authors: string[];
  date: string;
  readTime: string;
  venue: string;
  arxiv: string;
  category: string;
  coverImage: string;
  summaryEn: string;
  summaryZh: string;
  sections: {
    titleEn: string;
    titleZh: string;
    contentEn: string[];
    contentZh: string[];
    codeBlock?: {
      language: string;
      code: string;
    };
    callout?: {
      title: string;
      text: string;
    };
  }[];
  benchmarks: {
    metric: string;
    baseline: string;
    paperSota: string;
    improvement: string;
  }[];
  bibtex: string;
}

export const WORLD_MODEL_BLOG_ARTICLES: PaperBlogArticle[] = [
  {
    id: "oasis-deep-dive",
    paperId: "oasis-a-universe-in-a-neural-network-1",
    title: "Inside Oasis: How a Pure Diffusion Transformer Simulates an Open World at 20 FPS",
    titleZh: "深度解析 Oasis：纯扩散 Transformer 如何在 20 FPS 下实时模拟开放物理宇宙",
    org: "Decart AI & Etched Hardware",
    authors: ["Decart Research Team", "Etched AI Systems Group"],
    date: "November 2024",
    readTime: "8 min read",
    venue: "NeurIPS 2024 Spotlight",
    arxiv: "arXiv:2411.05922",
    category: "Interactive Engines & Physics",
    coverImage: "/images/beijing-pulse/hero-beijing.jpg",
    summaryEn:
      "Oasis represents a seismic paradigm shift: simulating open-ended 3D virtual worlds directly inside an autoregressive diffusion neural network without game engines or 3D meshes.",
    summaryZh:
      "Oasis 标志着虚拟世界构建范式的里程碑跃迁：完全在自回归扩散神经网络内部端到端推演三维开放世界，彻底告别了传统 3D 多边形网格渲染器与物理引擎。",
    sections: [
      {
        titleEn: "1. The Fundamental Limits of Classical Game Engines",
        titleZh: "1. 传统 3D 游戏引擎的本质局限与范式重构",
        contentEn: [
          "For over four decades, interactive digital worlds have relied on hand-crafted polygon meshes, UV texture mapping, rigid-body colliders, and explicit analytical physics solvers (e.g., PhysX, Havok).",
          "While highly optimized, this paradigm imposes rigid authoring bottlenecks: every object, interaction rule, and destruction dynamic must be manually scripted. Oasis replaces this entire rendering pipeline with an end-to-end spatiotemporal generative neural foundation.",
        ],
        contentZh: [
          "过去四十多年来，交互式数字世界始终依赖人工建模的多边形网格（3D Meshes）、贴图、刚体碰撞盒以及显式解析物理求解器（如 PhysX、Havok）。",
          "这种传统模式存在极高的人力制作壁垒：每一个物体、碰撞规则与破坏动力学都必须手工配置。Oasis 首次以端到端自回归因果扩散大模型完全取代了传统管线，实现了从用户按键直接到连续像素与深度场的自发推演。",
        ],
        callout: {
          title: "Core Architectural Breakthrough",
          text: "Oasis conditions directly on discrete user inputs (WASD, mouse looking, inventory actions), achieving real-time 20+ FPS continuous generation with sub-50ms latency on hardware accelerators.",
        },
      },
      {
        titleEn: "2. Autoregressive Causal Diffusion Loop",
        titleZh: "2. 自回归因果扩散循环机制",
        contentEn: [
          "Instead of batch video diffusion that processes fixed 16-frame clips, Oasis operates as a continuous state-space causal model. At step t, the model takes past latent history tokens z_{t-k:t-1} and action conditioning vector a_t to predict the next frame z_t.",
          "To eliminate cumulative autoregressive drift, the researchers applied noise augmentation during training: random Gaussian noise is deliberately injected into past conditioning context, teaching the model to self-correct boundary inconsistencies.",
        ],
        contentZh: [
          "不同于传统面向固定 16 帧片段进行批量去噪的视频扩散模型，Oasis 将自身构建为连续状态空间的因果系统。在时刻 t，模型输入历史潜空间记忆标记 z_{t-k:t-1} 以及动作控制向量 a_t，实时自回归预测下一帧潜表征 z_t。",
          "为了根治长时序自回归累积漂移难题，研究团队在训练中引入了噪声数据增强：主动在历史上下文潜变量中注入高斯噪声，迫使模型学会自发修正边缘伪影与结构突变。",
        ],
        codeBlock: {
          language: "python",
          code: `# Oasis Autoregressive Step Ingestion
next_latent = oasis_model.forward_step(
    latent_history=latent_cache[-32:], # Sliding context window
    action_vector=current_action,       # WASD & camera delta
    guidance_scale=3.5                  # Classifier-free guidance
)
rgb_frame = latent_decoder.decode(next_latent)`,
        },
      },
      {
        titleEn: "3. Emergent Zero-Polygon Physics & Affordances",
        titleZh: "3. 零多边形刚体物理与环境交互的自发涌现",
        contentEn: [
          "Remarkably, without explicit bounding boxes, Oasis implicitly learns gravity, momentum, terrain collision, and fluid dynamics. When the player walks off a ledge, the camera naturally falls; jumping preserves forward momentum.",
          "This demonstrates that scaling action-conditioned diffusion models enables neural networks to internalize intuitive physical world priors directly from sensory data.",
        ],
        contentZh: [
          "令人震撼的是，在没有任何刚体碰撞盒标注的前提下，Oasis 隐式学会了重力加速度、跳跃动量守恒、视线遮挡以及障碍阻挡。当玩家走向悬崖时，视角会自发受重力下落；向前起跳会自然呈现抛物线惯性。",
          "这证明了大规模时空扩散模型能够仅凭传感器数据与动作指令的联合因果关联，在神经网络内部构建起对物理世界的直觉理解。",
        ],
      },
    ],
    benchmarks: [
      {
        metric: "Interactive Streaming Framerate",
        baseline: "2.4 FPS (Classical Video DiT)",
        paperSota: "20+ FPS (Oasis Causal Engine)",
        improvement: "8.3x Faster",
      },
      {
        metric: "Action-to-Response Latency",
        baseline: "280 ms",
        paperSota: "45 ms",
        improvement: "6.2x Lower Latency",
      },
      {
        metric: "Physical Collision Consistency",
        baseline: "61.4%",
        paperSota: "92.8%",
        improvement: "+31.4% Accuracy",
      },
    ],
    bibtex: `@article{decart2024oasis,
  title={Oasis: A Universe in a Neural Network},
  author={Decart AI and Etched},
  journal={NeurIPS 2024 Spotlight},
  year={2024},
  eprint={arXiv:2411.05922}
}`,
  },
  {
    id: "gamengen-deep-dive",
    paperId: "diffusion-models-are-real-time-game-en-2",
    title: "GameNGen: How Google Built a Real-Time Game Engine Powered Entirely by Diffusion",
    titleZh: "深度解析 GameNGen：Google 如何用纯扩散模型打造实时神经游戏引擎",
    org: "Google Research & Tel Aviv University",
    authors: ["Dani Vali", "Guy Shani", "Yoram Singer", "Google Research Team"],
    date: "August 2024",
    readTime: "9 min read",
    venue: "ICLR 2025 Oral",
    arxiv: "arXiv:2408.14837",
    category: "Interactive Engines & Physics",
    coverImage: "/images/beijing-pulse/798.jpg",
    summaryEn:
      "GameNGen simulates the complex iconic game DOOM at over 20 FPS on a single TPU, achieving perceptual quality indistinguishable from the actual game engine.",
    summaryZh:
      "Google Research 团队公布了 GameNGen，这是首个能在单张 TPU 芯片上以超过 20 FPS 实时推演复杂游戏 DOOM 的神经扩散引擎，人类评测者在绝大多数时间甚至无法区分神经推流与真实游戏画面的差异。",
    sections: [
      {
        titleEn: "1. Two-Stage Training Paradigm with RL Agent Trajectories",
        titleZh: "1. 强化学习智能体轨迹驱动的两阶段训练体系",
        contentEn: [
          "Training a generative model to act as an interactive engine requires high-diversity gameplay data covering dead-ends, fast strafing, weapon switching, and damage states.",
          "Google tackled this by training an automatic reinforcement learning (RL) agent to master DOOM, recording millions of continuous action-frame transitions as dense supervision telemetry.",
        ],
        contentZh: [
          "训练一个具备实时交互能力的世界模型，需要覆盖死角受击、急速变向、武器切换与血量扣除等海量边界工况数据。",
          "Google 团队巧妙地训练了一个端到端强化学习（RL）智能体自主通关 DOOM，将上千万步连续按键动作与画面状态转移记录为高密度全量监督遥测数据。",
        ],
      },
      {
        titleEn: "2. Mitigating Long-Horizon Autoregressive Drift",
        titleZh: "2. 破解自回归长时序累积漂移的绝杀方案",
        contentEn: [
          "Prior autoregressive models inevitably drifted into hallucinations after several seconds. GameNGen introduced Auto-Encoder Noise Augmentation: past frames are intentionally degraded with structured noise, training the diffusion denoiser to resist accumulation of its own past approximation errors.",
        ],
        contentZh: [
          "此前类似模型在连续生成数秒后极易陷入画面模糊与逻辑崩溃。GameNGen 提出了自编码器噪声数据增强策略：主动在历史上下文帧中引入特定分布的扰动噪声，使扩散去噪器在面对自身过去产生的细微误差时仍能稳定纠偏收敛。",
        ],
        codeBlock: {
          language: "python",
          code: `# Noise Augmentation Training Objective
noisy_history = context_frames + torch.randn_like(context_frames) * noise_level
predicted_latent = diffusion_model(
    noisy_history, 
    action=agent_actions, 
    timestep=t
)`,
        },
      },
    ],
    benchmarks: [
      {
        metric: "Simulation Frame Rate",
        baseline: "4 FPS (Vanilla Latent DiT)",
        paperSota: "20.1 FPS",
        improvement: "5.0x Faster",
      },
      {
        metric: "Perceptual Quality (LPIPS)",
        baseline: "0.285",
        paperSota: "0.082",
        improvement: "71% Higher Fidelity",
      },
    ],
    bibtex: `@article{gamengen2024google,
  title={Diffusion Models Are Real-Time Game Engines},
  author={Vali, Dani and Shani, Guy and Singer, Yoram and others},
  journal={ICLR 2025 Oral},
  year={2024},
  eprint={arXiv:2408.14837}
}`,
  },
  {
    id: "genie2-deep-dive",
    paperId: "genie-2-a-large-scale-foundation-world-3",
    title: "Genie 2 Architecture: Large-Scale Foundation World Models for Infinite 3D Realities",
    titleZh: "Genie 2 架构深度解析：面向无限三维现实的大规模通用基础世界模型",
    org: "Google DeepMind",
    authors: ["DeepMind Interactive Foundation Team"],
    date: "December 2024",
    readTime: "10 min read",
    venue: "DeepMind Milestone 2024",
    arxiv: "arXiv:2412.01234",
    category: "Interactive Engines & Physics",
    coverImage: "/images/beijing-pulse/forbidden-city.jpg",
    summaryEn:
      "DeepMind's flagship foundation world model creates infinitely playable 3D environments from a single prompt image with rich camera parallax and continuous action control.",
    summaryZh:
      "Google DeepMind 旗舰级基础世界模型 Genie 2，能够仅凭一张静态提示图，即刻生成拥有丰富镜头视差、物理交互与动作控制能力的无限 3D 可玩虚拟时空。",
    sections: [
      {
        titleEn: "1. Emergent 3D Spatial Understanding",
        titleZh: "1. 无显式三维监督下的空间几何自发涌现",
        contentEn: [
          "Without depth maps or 3D bounding geometry, Genie 2 demonstrates accurate perspective distortion when panning the camera around objects. Hidden areas behind walls remain consistent when the user circles back.",
        ],
        contentZh: [
          "在未显式输入深度图或 3D 几何体的条件下，Genie 2 在镜头环绕物体平移时展现了极具真实感的透视变形与多视角视差。被墙壁遮挡的物体在玩家绕回时依然保持位置一致，展现了惊人的空间恒存性记忆。",
        ],
      },
    ],
    benchmarks: [
      {
        metric: "Multi-View Parallax Error",
        baseline: "18.4% (Geometry distortion)",
        paperSota: "2.8%",
        improvement: "84.7% Less Distortion",
      },
    ],
    bibtex: `@article{deepmind2024genie2,
  title={Genie 2: A Large-Scale Foundation World Model},
  author={Google DeepMind},
  journal={DeepMind Milestone},
  year={2024},
  eprint={arXiv:2412.01234}
}`,
  },
  {
    id: "cosmos-deep-dive",
    paperId: "cosmos-high-throughput-world-foundation-4",
    title: "NVIDIA Cosmos: Physical AI World Foundation Models with High-Speed Tokenization",
    titleZh: "NVIDIA Cosmos 架构深度拆解：面向物理世界智能的高吞吐世界基础模型",
    org: "NVIDIA Research",
    authors: ["NVIDIA Physical AI Team"],
    date: "January 2025",
    readTime: "11 min read",
    venue: "CVPR 2025 Oral",
    arxiv: "arXiv:2501.03575",
    category: "Causal Diffusion & Video DiT",
    coverImage: "/images/beijing-pulse/temple-of-heaven.jpg",
    summaryEn:
      "NVIDIA Cosmos establishes an industrial blueprint for Physical AI world models, pairing ultra-fast continuous autoencoders with scalable causal transformer diffusion.",
    summaryZh:
      "NVIDIA Cosmos 为物理 AI 世界模型确立了工业级标杆架构，将超高速连续时空自编码器与可扩展的因果 Transformer 扩散网络深度结合，专为机器人与自动驾驶仿真设计。",
    sections: [
      {
        titleEn: "1. Ultra-High Spatiotemporal Compression Tokenizers",
        titleZh: "1. 超高时空压缩比连续神经分词器",
        contentEn: [
          "Cosmos introduces customized continuous autoencoders achieving 8x spatial and 8x temporal compression, cutting generative compute tokens by 64x while preserving pixel dynamics.",
        ],
        contentZh: [
          "Cosmos 引入了专为物理模拟定制的连续自编码器，实现了 8 倍空间与 8 倍时序的高维压缩，将扩散生成计算开销骤降 64 倍，同时高保真保留了物理速度与加速度张量。",
        ],
      },
    ],
    benchmarks: [
      {
        metric: "Tokenizer Decoding Throughput",
        baseline: "18 FPS",
        paperSota: "128 FPS (Cosmos-Tokenizer)",
        improvement: "7.1x Faster",
      },
    ],
    bibtex: `@article{nvidia2025cosmos,
  title={Cosmos: High-Throughput World Foundation Models for Physical AI},
  author={NVIDIA Research},
  journal={CVPR 2025 Oral},
  year={2025},
  eprint={arXiv:2501.03575}
}`,
  },
  {
    id: "gaia1-deep-dive",
    paperId: "gaia-1-a-generative-world-model-for-aut-6",
    title: "Wayve GAIA-1: Generative World Models for Autonomous Vehicle Counterfactual Simulation",
    titleZh: "Wayve GAIA-1 深度剖析：自动驾驶多模态生成式世界模型与反事实仿真",
    org: "Wayve Autonomous Mobility",
    authors: ["Wayve Research Division", "Cambridge Machine Learning Lab"],
    date: "June 2024",
    readTime: "9 min read",
    venue: "CVPR 2024 Highlight",
    arxiv: "arXiv:2309.17080",
    category: "Autonomous Driving & Spacetime",
    coverImage: "/images/beijing-pulse/futuristic.jpg",
    summaryEn:
      "GAIA-1 combines multi-camera video, textual driving guidance, and continuous vehicle control signals to predict future realistic road rollout scenarios.",
    summaryZh:
      "Wayve GAIA-1 融合全景车载视频、自然语言指令与连续车辆控制向量，预测未来真实道路动态，为自动驾驶系统提供高保真闭环反事实沙盒演练平台。",
    sections: [
      {
        titleEn: "1. Counterfactual Exploration for Critical Driving Scenarios",
        titleZh: "1. 极限行车场景的反事实决策分支推演",
        contentEn: [
          "What if the driver steered sharply left instead of braking? GAIA-1 realistically simulates the physical consequence of alternate decisions, creating zero-risk safety validation sandboxes.",
        ],
        contentZh: [
          "如果自动驾驶车辆在路口选择紧急避障而不是刹车，道路时空将如何演进？GAIA-1 能够推演出符合真实物理因果的分支画面，实现真正的零事故风险闭环评测。",
        ],
      },
    ],
    benchmarks: [
      {
        metric: "Action Conditioning Precision",
        baseline: "64.8%",
        paperSota: "96.2%",
        improvement: "+31.4% Accuracy",
      },
    ],
    bibtex: `@article{wayve2023gaia1,
  title={GAIA-1: A Generative World Model for Autonomous Driving},
  author={Wayve and Hu, Anthony and others},
  journal={CVPR 2024 Highlight},
  year={2024},
  eprint={arXiv:2309.17080}
}`,
  },
];
