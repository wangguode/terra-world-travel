export interface CopilotQA {
  keywords: string[];
  question: string;
  answer: string;
  category: "theory" | "action" | "physics" | "deploy";
}

export const COPILOT_KNOWLEDGE_BASE: CopilotQA[] = [
  {
    keywords: ["区别", "传统", "虚幻", "unity", "引擎", "mesh", "多边形", "游戏引擎"],
    question: "TERRA-OASIS 与传统游戏引擎（Unreal / Unity）有什么根本区别？",
    answer:
      "传统游戏引擎依赖显式几何资产：数百万个手工制作的 3D 网格（Meshes）、UV 展开贴图、烘焙好的光照以及硬编码的牛顿运动学公式（如 PhysX/Havok）。\n\n而 TERRA-OASIS 世界模型完全抛弃了预设 3D 几何与包围盒碰撞体。整个虚拟时空是由 14B 因果扩散 Transformer（Causal DiT）端到端学习并实时推演出来的。玩家的每个按键动作（WASD、跳跃、破拆）都作为条件潜变量直接输入神经网络，由模型根据内化的直觉物理规律直接预测下一帧连续像素与深度场，实现了真正零资产即兴开放世界涌现。",
    category: "theory",
  },
  {
    keywords: ["动作", "action", "按键", "wasd", "条件", "流", "websocket", "sdk"],
    question: "动作条件（Action-Conditioning）是如何注入神经网络并实时推演的？",
    answer:
      "在 TERRA-OASIS 中，用户的键盘按键、鼠标位移或机器人的执行器位姿会被离散/连续动作编码器转化为高维动作潜变量（Action Latents，如 16 维连续动力学矢量）。\n\n该张量通过跨注意力机制（Cross-Attention）或自适应归一化层（AdaLN）毫秒级注入到 Causal DiT 的扩散隐空间中。模型将「上一帧隐状态 + 当前动作潜变量」结合，自回归推演出下一帧潜在表征，端到端延迟仅 16ms，从而实现 60 FPS 极速动作响应。",
    category: "action",
  },
  {
    keywords: ["因果", "无限", "时空", "崩溃", "漂移", "dit", "14b", "transformer"],
    question: "为什么早期世界模型漫游十几秒后会崩溃，而 14B Causal DiT 能实现无限长程漫游？",
    answer:
      "早期自回归生成模型（如 7B 基础架构）缺乏对长程时空一致性的约束，误差在时间步累加会导致画面迅速泛白、扭曲甚至结构坍塌（Latent Collapse）。\n\nTERRA-OASIS 引入了三大架构突破：\n1. 滑动时序注意力窗口（Sliding Context KV Cache），在保留近期高频动作因果的同时锚定宏观空间拓扑；\n2. Pilot-Director 双智能体调度机制：Pilot Agent 专注跟踪即时动作特征，Director Agent 保证全局时空记忆一致性；\n3. 隐空间能量重归一化：动态修正潜在漂移，确保用户无论漫游几小时，世界结构都坚固稳定。",
    category: "theory",
  },
  {
    keywords: ["物理", "重力", "碰撞", "破拆", "体素", "破坏", "扰动"],
    question: "没有 3D 碰撞盒，模型是如何判定物理碰撞与体素破拆自愈的？",
    answer:
      "模型在海量高精度多视角动态交互数据中内化了直觉物理常识。它理解墙面不可穿透、重力会引起向下加速度、水体产生浮力。\n\n当用户按下 E 键在视线前方破拆体素时，系统会在潜空间局部注入高斯噪声冲击波。因果扩散去噪网络接收到这种局部信息突变后，会根据场景上下文自发生成碎裂飞溅的微粒与局部几何凹陷，并在后续帧中重新收敛光影与闭环阴影，展示出纯神经渲染独有的物理扰动自适应能力。",
    category: "physics",
  },
  {
    keywords: ["部署", "gpu", "显卡", "docker", "python", "开源", "集群"],
    question: "如何私有化部署该模型并将其接入自己的机器人仿真或游戏系统？",
    answer:
      "TERRA-OASIS 提供了开箱即用的分布式部署套件：\n1. Web 端：用户无需显卡即可直接通过现代 WebGL 浏览器访问；\n2. Python SDK：安装 `terra-oasis-sdk`，通过三行代码即可通过 WebSocket 建立低延迟推流会话；\n3. 私有化集群：支持通过 Docker 在 8×A100/H100 服务器上启动 SGLang 张量并行推理引擎（`--tp 8 --enable-causal-attention`），单卡支持数十路并发动作推流。",
    category: "deploy",
  },
];

export const PRESET_PROMPTS = [
  "与传统虚幻/Unity 游戏引擎有什么区别？",
  "动作条件是如何在 16ms 内完成注入的？",
  "没有 3D 网格，如何判定碰撞与体素破拆？",
  "如何通过 Python SDK 接入动作流？",
];
