export interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  summary: string;
  content: string[];
}

export const OFFICIAL_BLOGS: BlogPost[] = [
  {
    id: "infinite-causal-dit",
    title: "突破 10 秒崩溃魔咒：14B Causal DiT 如何实现无限长程时空推演",
    category: "架构突破",
    date: "2026-03-08",
    readTime: "8 分钟阅读",
    author: "TERRA Research Team",
    summary:
      "解析早期自回归世界模型在长程生成中的潜在漂移机制，以及 TERRA-OASIS 如何通过滑动因果视界与能量重归一化打破时空坍塌瓶颈。",
    content: [
      "自 OpenAI Sora 与相关自回归视频生成模型发布以来，生成式 AI 在视觉逼真度上达到了前所未有的高度。然而，当业界尝试将这些模型转化为可交互的世界模型（Playable World Model）时，一个致命的技术天花板浮出水面：时间步累加引起的潜在时空坍缩（Latent Collapse）。",
      "在大多数 7B 参数规模的基础自回归实验中，当用户连续按键探索超过 10 至 15 秒后，画面特征均值会逐渐向奇异点漂移，表现为几何边缘软化、场景细节剧烈扭曲，最终退化为无法识别的灰白噪波。",
      "TERRA-OASIS 14B Causal DiT 引入了「时序能量重归一化层（Temporal Energy Renormalization）」。通过在自回归解码步骤中实时对齐潜在方差分布，并结合双智能体全局拓扑锚点，成功将稳定连续漫游时长推向无限长程（Infinite Horizon）。无论用户在沙盒中漫游几小时，物体的空间常在性与物理接触因果均稳如磐石。",
    ],
  },
  {
    id: "neural-physics-revolution",
    title: "从多边形到神经潜空间：世界模型重构下一代实时交互物理引擎",
    category: "图形学革命",
    date: "2026-02-24",
    readTime: "6 分钟阅读",
    author: "Core Engine Group",
    summary:
      "探讨放弃显式 3D 网格（Mesh）与离散刚体包围盒后，神经网络如何通过大规模动作条件训练自发学到牛顿力学与光学反射。",
    content: [
      "过去四十年中，3D 电子游戏与虚拟仿真工业建立在多边形网格（Polygon Meshes）与欧几里得几何碰撞体之上。每一个物体都必须有显式的顶点坐标与刚体参数，这导致开放世界的资产规模动辄达到上百吉字节，且无法应对即兴生成的非结构化形变。",
      "世界模型代表了第二代计算范式的转移。在 TERRA-OASIS 中，我们不再手工编码任何一个牛顿力学公式，而是让神经网络在数万小时高精度传感器与多动作流数据中自主学习世界的物理表征。",
      "实验表明，当模型具备足够的参数容量（14B 以上）时，它能够自发涌现出对重力加速度、弹性反弹、流体折射阻尼与各向异性菲涅尔焦散的深刻理解。用户按下按键，画面中的阴影、反射与运动惯性浑然天成，揭示了隐式神经物理引擎的巨大潜能。",
    ],
  },
  {
    id: "embodied-ai-sim2real",
    title: "具身智能的 Sim-to-Real 破局点：基于动作条件生成海量因果世界流",
    category: "具身智能前沿",
    date: "2026-01-18",
    readTime: "7 分钟阅读",
    author: "Robotics & Simulation Lab",
    summary:
      "如何利用 TERRA-OASIS 解决双足人形机器人与自动驾驶感知训练中的长尾危险极端工况数据匮乏问题。",
    content: [
      "在机器人学习与智能驾驶领域，Sim-to-Real（仿真到真实）鸿沟一直是最难以逾越的障碍。传统基于物理引擎的模拟器画面失真严重，导致在仿真器中训练的策略模型迁移到真实世界时极易发生泛化失败。",
      "TERRA-OASIS 为具身智能团队提供了一个高保真的「神经真实感闭环仿真器」。算法团队可以直接将机器人的电机控制信号（如关节力矩、期望位姿）作为动作潜变量持续注入模型，由模型实时回传具备真实世界级细节的光影与传感器深度流。",
      "这意味着研究团队可以在几分钟内模拟暴雨夜行车、强逆光视线受阻、地面结冰打滑等数千种极端危险工况，而无需在现实世界中承担任何实体碰撞损坏风险，真正推动具身智能自主进化。",
    ],
  },
];
