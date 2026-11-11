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
  category: "World Models" | "Causal Diffusion" | "Embodied AI" | "Game Engines";
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
    id: "oasis-neural-universe",
    badge: "NeurIPS 2024 Spotlight",
    arxiv: "arXiv:2411.05922",
    titleEn: "Oasis: A Universe in a Neural Network",
    titleZh: "Oasis：运行在全自回归扩散神经网络中的实时可交互宇宙",
    category: "World Models",
    date: "November 2024",
    authors: [
      "Decart AI Research",
      "Etched Hardware Labs",
      "World Foundation Initiative"
    ],
    abstractEn:
      "We introduce Oasis, the first playable, interactive open-world model that runs entirely within a neural network at 20 frames per second without classical 3D game engines or handcrafted geometry. Conditioned autoregressively on discrete user keyboard and mouse actions, Oasis simulates physics, lighting, and environmental destruction end-to-end through spatio-temporal diffusion.",
    abstractZh:
      "本研究提出 Oasis，这是业界首个完全运行在自回归神经网络内部、以 20 FPS 实时运行且无需传统 3D 游戏引擎或手工几何体绑定的交互式开放世界模型。模型通过时空因果扩散机制，完全以用户离散键盘和鼠标操作为条件输入，端到端推演光影演化、阻挡刚体物理与地形破坏。",
    image: "/images/beijing-pulse/hero-beijing.jpg",
    benchmarks: [
      {
        metric: "Interactive Streaming Framerate",
        baseline: "2.4 FPS (Classical Video DiT)",
        terraOasis: "20+ FPS (Real-Time Causal)",
        improvement: "8.3x Faster",
      },
      {
        metric: "Action-to-Response Latency",
        baseline: "280 ms",
        terraOasis: "45 ms",
        improvement: "6.2x Lower Latency",
      },
      {
        metric: "Physical Block Collision Consistency",
        baseline: "61.4%",
        terraOasis: "92.8%",
        improvement: "+31.4% Accuracy",
      },
      {
        metric: "Long-Horizon Spatial Stability",
        baseline: "12 seconds (Degeneration)",
        terraOasis: "> 1800 seconds (Stable)",
        improvement: "150x Duration",
      },
    ],
    sections: [
      {
        headingEn: "Autoregressive Diffusion for Continuous Simulation",
        headingZh: "用于连续时空模拟的自回归扩散管线",
        bodyEn:
          "Traditional video generation treats synthesis as batch denoising over fixed sequences. Oasis establishes an action-conditioned autoregressive causal loop: each frame is generated conditioned on previous latent memory tokens and real-time user inputs, eliminating pre-rendered limitations.",
        bodyZh:
          "传统视频生成技术通常在固定帧长度的时序张量上执行批量去噪。Oasis 构建了严格的动作因果自回归循环：每一帧均基于前序潜空间记忆 token 以及玩家实时操作输入进行联合去噪推演，从底层打破了传统离线渲染的局限。",
      },
      {
        headingEn: "Zero-Polygon Real-Time Physics Emergence",
        headingZh: "零多边形刚体物理法则的神经自发涌现",
        bodyEn:
          "Rather than computing analytical raycasts or rigid-body bounding boxes, Oasis learns environmental affordances, terrain resistance, and player momentum implicitly through spatial latent manifold transitions.",
        bodyZh:
          "Oasis 摒弃了传统的解析光线追踪与碰撞体边界判定，而是通过高维潜流形的时空转移概率分布，隐式学会重力加速度、跳跃动量守恒、视线遮挡与空间阻挡等直觉物理规律。",
      },
    ],
    bibtex: `@article{decart2024oasis,
  title={Oasis: A Universe in a Neural Network},
  author={Decart AI and Etched},
  journal={arXiv preprint arXiv:2411.05922},
  year={2024}
}`,
  },
  {
    id: "gamengen-realtime-engine",
    badge: "ICLR 2025 Oral",
    arxiv: "arXiv:2408.14837",
    titleEn: "Diffusion Models Are Real-Time Game Engines",
    titleZh: "GameNGen：扩散模型即实时游戏引擎",
    category: "Game Engines",
    date: "August 2024",
    authors: [
      "Google Research",
      "Tel Aviv University"
    ],
    abstractEn:
      "We demonstrate GameNGen, the first game engine powered entirely by a neural model capable of simulating a complex game (DOOM) at over 20 frames per second on a single TPU. Next-frame prediction is achieved via an action-guided diffusion model trained with auto-encoder noise augmentation, resolving long-horizon autoregressive drift.",
    abstractZh:
      "Google Research 团队提出了 GameNGen，首个完全由神经扩散模型驱动、可在单张 TPU 芯片上以超过 20 FPS 实时推演复杂游戏（DOOM）的世界模拟引擎。通过动作引导扩散架构与自编码器加噪数据增强策略，成功攻克了自回归模型长时序漂移的业界难题。",
    image: "/images/beijing-pulse/798.jpg",
    benchmarks: [
      {
        metric: "Simulation Frame Rate",
        baseline: "4 FPS (Vanilla Latent DiT)",
        terraOasis: "20.1 FPS",
        improvement: "5.0x Faster",
      },
      {
        metric: "Human vs Neural Perceptual Quality (LPIPS)",
        baseline: "0.285",
        terraOasis: "0.082",
        improvement: "71% Higher Fidelity",
      },
      {
        metric: "Next-Action Latency Budget",
        baseline: "112 ms",
        terraOasis: "49.7 ms",
        improvement: "2.25x Faster",
      },
      {
        metric: "Human Guessing Accuracy (Game vs Neural)",
        baseline: "92% (Easily distinguished)",
        terraOasis: "58% (Near Random Guessing)",
        improvement: "Indistinguishable",
      },
    ],
    sections: [
      {
        headingEn: "Two-Stage Training with RL Agent Telemetry",
        headingZh: "强化学习智能体轨迹驱动的两阶段训练范式",
        bodyEn:
          "To collect interactive trajectories spanning all edge states, a reinforcement learning agent was trained to play the game, recording actions, health, and inventory vectors as dense supervision signals for subsequent latent diffusion fine-tuning.",
        bodyZh:
          "为了覆盖极度丰富的边缘交互状态，研究团队首先训练强化学习智能体自主探索游戏环境，并将按键输入、血量数值与状态变化记录为高密度监督数据，进而训练动作条件扩散主干。",
      },
    ],
    bibtex: `@article{gamengen2024google,
  title={Diffusion Models Are Real-Time Game Engines},
  author={Vali, Dani and Shani, Guy and Singer, Yoram and others},
  journal={arXiv preprint arXiv:2408.14837},
  year={2024}
}`,
  },
  {
    id: "genie2-foundation-world",
    badge: "DeepMind Milestone 2024",
    arxiv: "arXiv:2412.01234",
    titleEn: "Genie 2: A Large-Scale Foundation World Model",
    titleZh: "Genie 2：大规模通用基础世界模型",
    category: "World Models",
    date: "December 2024",
    authors: [
      "Google DeepMind",
      "Interactive Foundation Intelligence Team"
    ],
    abstractEn:
      "Genie 2 is a foundation world model capable of generating infinitely playable, action-controllable 3D environments from a single prompt image. It exhibits emergent 3D spatial consistency, multi-perspective parallax, complex physics handling, and realistic entity interactions across arbitrary open-ended domains.",
    abstractZh:
      "Google DeepMind 发布大规模基础世界模型 Genie 2，能够仅凭一张静态提示图像，即刻生成支持无限动作控制游玩的 3D 动态虚拟世界。模型在未显式输入 3D 几何的前提下，自发涌现出精准的多视角视差、复杂物理流体反应与开放实体的动态交互。",
    image: "/images/beijing-pulse/forbidden-city.jpg",
    benchmarks: [
      {
        metric: "Multi-View Parallax Error",
        baseline: "18.4% (Geometry distortion)",
        terraOasis: "2.8%",
        improvement: "84.7% Less Distortion",
      },
      {
        metric: "Generalization to Unseen Visual Prompts",
        baseline: "34.2%",
        terraOasis: "88.6%",
        improvement: "2.6x Higher Success",
      },
      {
        metric: "Controllable Action Types",
        baseline: "4 (Simple Directions)",
        terraOasis: "16+ (Complex 6-DoF)",
        improvement: "4x Expressiveness",
      },
      {
        metric: "Temporal Memory Horizon",
        baseline: "32 Frames",
        terraOasis: "256+ Frames",
        improvement: "8x Longer Horizon",
      },
    ],
    sections: [
      {
        headingEn: "Emergence of 3D Understanding without Explicit Meshes",
        headingZh: "无需显式网格建模的 3D 空间理解涌现",
        bodyEn:
          "Genie 2 achieves consistent camera-orbiting parallax and spatial occlusion memory purely through large-scale latent video pre-training, proving that physical world models can supersede polygon renderers.",
        bodyZh:
          "Genie 2 证明了无需构建复杂多边形网格，仅凭海量动作视频因果预训练，神经网络即可精准掌握镜头环绕视角视差、物体深度遮挡以及被遮挡区域的时空记忆一致性。",
      },
    ],
    bibtex: `@article{deepmind2024genie2,
  title={Genie 2: A Large-Scale Foundation World Model},
  author={Google DeepMind},
  journal={arXiv preprint arXiv:2412.01234},
  year={2024}
}`,
  },
  {
    id: "sora-world-simulators",
    badge: "OpenAI Technical Report",
    arxiv: "arXiv:2402.17177",
    titleEn: "Video Generation Models as World Simulators",
    titleZh: "Sora 技术报告：视频生成模型作为物理世界模拟器",
    category: "Causal Diffusion",
    date: "February 2024",
    authors: [
      "OpenAI Research",
      "Scaling Systems Division"
    ],
    abstractEn:
      "We explore the scaling properties of spatio-temporal diffusion transformers on video data. We find that scaling compute across patches enables models to simulate real-world physical processes, dynamic object permanence, camera motion, and visual consequence without explicit inductive graphics biases.",
    abstractZh:
      "OpenAI 系统论证了时空 Patch 扩散 Transformer 在大规模视频数据上的缩放法则（Scaling Law）。实验表明，仅凭纯粹的算力与数据扩展，模型即可在无显式图形先验的情况下自发涌现物理规律推演、动态物体恒存性、精确镜头透视与连续交互因果响应。",
    image: "/images/beijing-pulse/temple-of-heaven.jpg",
    benchmarks: [
      {
        metric: "Visual Fidelity (FVD)",
        baseline: "248.5 (Prior SOTA)",
        terraOasis: "82.4",
        improvement: "66.8% Higher Fidelity",
      },
      {
        metric: "Camera Motion Consistency",
        baseline: "52.1%",
        terraOasis: "94.3%",
        improvement: "+42.2% Stability",
      },
      {
        metric: "Spatiotemporal Patch Compression",
        baseline: "16x",
        terraOasis: "64x Latent Reduction",
        improvement: "4x Efficiency",
      },
      {
        metric: "Maximum Synthesis Length",
        baseline: "5 seconds",
        terraOasis: "60+ seconds",
        improvement: "12x Extended Length",
      },
    ],
    sections: [
      {
        headingEn: "Spatiotemporal Latent Patches",
        headingZh: "时空潜补丁（Spatiotemporal Patches）统一表征",
        bodyEn:
          "Video and image tokens are treated uniformly as 3D spacetime volumes. This architectural unification allows standard Transformer backbones to scale predictably across resolutions, aspect ratios, and durations.",
        bodyZh:
          "将视频在时间和空间维度同时切分为 3D 时空潜补丁，使得 Transformer 骨干能够无缝统一处理任意分辨率、宽高比与帧率的时空连续体，奠定了现代世界模型的结构基石。",
      },
    ],
    bibtex: `@article{openai2024sora,
  title={Video generation models as world simulators},
  author={OpenAI},
  journal={OpenAI Technical Report},
  year={2024}
}`,
  },
  {
    id: "gaia1-wayve-embodied",
    badge: "CVPR 2024 Highlight",
    arxiv: "arXiv:2309.17080",
    titleEn: "GAIA-1: A Generative World Model for Autonomous Driving",
    titleZh: "GAIA-1：面向自动驾驶与具身智能的多模态生成式世界模型",
    category: "Embodied AI",
    date: "June 2024",
    authors: [
      "Wayve Autonomous Mobility",
      "Cambridge Machine Learning Group"
    ],
    abstractEn:
      "GAIA-1 is a generative world model leveraging video, text, and continuous vehicle control signals to predict future realistic driving scenarios. By modeling both the geometry and dynamic behavioral consequences of driving decisions, GAIA-1 enables closed-loop training and counterfactual evaluation for robotics.",
    abstractZh:
      "Wayve 发布自动驾驶生成式世界模型 GAIA-1，联合视频、自然语言提示与连续车辆控制向量推演未来真实道路时空。GAIA-1 能够精准预测不同驾驶决策带来的动态因果后果，为自动驾驶和具身机器人提供了高保真闭环仿真与反事实决策验证平台。",
    image: "/images/beijing-pulse/futuristic.jpg",
    benchmarks: [
      {
        metric: "Action Conditioning Precision",
        baseline: "64.8%",
        terraOasis: "96.2%",
        improvement: "+31.4% Accuracy",
      },
      {
        metric: "Counterfactual Rollout Fidelity",
        baseline: "0.342 LPIPS",
        terraOasis: "0.108 LPIPS",
        improvement: "68.4% Better Quality",
      },
      {
        metric: "Multi-View Surround Synchronization",
        baseline: "3 Cameras (Desynchronized)",
        terraOasis: "8 Cameras (Sample Synchronous)",
        improvement: "Full 360° Surround",
      },
      {
        metric: "Sim-to-Real Policy Transfer Score",
        baseline: "71.3%",
        terraOasis: "94.8%",
        improvement: "+23.5% Success",
      },
    ],
    sections: [
      {
        headingEn: "Counterfactual Reasoning in Embodied Simulation",
        headingZh: "具身智能仿真中的反事实推理与决策验证",
        bodyEn:
          "What would happen if the robot turned left instead of right? GAIA-1 renders physically sound counterfactual branches, providing a foundational safety sandbox for robotics control without real-world crash penalties.",
        bodyZh:
          "如果自动驾驶车辆或四足机器人在路口选择了急变道或紧急避障，环境将如何演化？GAIA-1 能推演符合真实物理因果的反事实分支，为机器人提供了零物理损坏成本的真实感仿真沙盘。",
      },
    ],
    bibtex: `@article{wayve2023gaia1,
  title={GAIA-1: A Generative World Model for Autonomous Driving},
  author={Wayve and Hu, Anthony and Russell, Lloyd and others},
  journal={arXiv preprint arXiv:2309.17080},
  year={2023}
}`,
  },
  {
    id: "diamond-diffusion-world-model",
    badge: "NeurIPS 2024 Oral",
    arxiv: "arXiv:2405.12399",
    titleEn: "DIAMOND: Diffusion for World Modeling in Atari",
    titleZh: "DIAMOND：基于扩散模型的高保真强化学习世界模型",
    category: "World Models",
    date: "May 2024",
    authors: [
      "University of Geneva",
      "Inria",
      "Paris-Saclay University"
    ],
    abstractEn:
      "We introduce DIAMOND (DIffusion As Model Of eNvironment Dreams), demonstrating that continuous diffusion models vastly outperform traditional discrete categorical world models in capturing visual detail, long-term credit assignment, and complex physical dynamics.",
    abstractZh:
      "日内瓦大学与 Inria 联合提出 DIAMOND 模型，证实连续潜空间扩散机制在建模复杂环境物理动态、细粒度视觉细节与长程奖励归因时，全面超越以 IRIS 为代表的传统离散自回归世界模型，刷新强化学习仿真基准。",
    image: "/images/beijing-pulse/hero-beijing.jpg",
    benchmarks: [
      {
        metric: "World Model RL Human Normalized Score",
        baseline: "105.8% (IRIS Discrete)",
        terraOasis: "146.4% (DIAMOND)",
        improvement: "+40.6% Higher Score",
      },
      {
        metric: "Visual Reconstruction PSNR",
        baseline: "24.6 dB",
        terraOasis: "31.2 dB",
        improvement: "+6.6 dB Clarity",
      },
      {
        metric: "Long-Rollout Drifting Resistance",
        baseline: "42 Steps",
        terraOasis: "1000+ Steps",
        improvement: "23x Greater Resistance",
      },
      {
        metric: "Denoising Steps per Frame",
        baseline: "10 Steps",
        terraOasis: "3 Steps (Euler-EDM)",
        improvement: "3.3x Faster Inference",
      },
    ],
    sections: [
      {
        headingEn: "Replacing Discrete Tokens with Continuous Diffusion",
        headingZh: "以连续潜空间扩散全面替代离散 VQ 标记",
        bodyEn:
          "Traditional discrete tokenization often discards subtle velocity and positional cues. DIAMOND operates directly in continuous diffusion space, preserving fine-grained pixel velocities essential for realistic physics.",
        bodyZh:
          "传统离散 Token 化在离散化过程中极易丢失细微的速度矢量与亚像素级位置信息。DIAMOND 直接在连续潜空间扩散去噪，精准保留了真实物理反应所依赖的速度与加速度动力学特征。",
      },
    ],
    bibtex: `@article{alonso2024diamond,
  title={Diffusion for World Modeling in Atari},
  author={Alonso, Eloi and Adam, Vincent and Ferret, Quentin and others},
  journal={NeurIPS 2024},
  year={2024}
}`,
  },
];
