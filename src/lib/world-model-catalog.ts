export interface WorldModelDomain {
  id: string;
  nameZh: string;
  nameEn: string;
  category: "autonomous-driving" | "embodied-ai" | "interactive-generative" | "physics-engine" | "sandtable-defense" | "llm-alignment";
  badge: string;
  headline: string;
  summaryZh: string;
  summaryEn: string;
  openSourceReference: string;
  benchmarkMetrics: { label: string; value: string }[];
  targetAudience: string;
  businessScenario: string;
  interactivePreviewType: "driving" | "interactive" | "embodied" | "sandtable";
  previewImage: string;
  depthMap: string;
}

export const WORLD_MODEL_DOMAINS: WorldModelDomain[] = [
  {
    id: "autonomous-driving",
    nameZh: "自动驾驶端到端世界模型",
    nameEn: "Autonomous Driving World Models",
    category: "autonomous-driving",
    badge: "端到端因果生成",
    headline: "多视角环视因果预测与闭环驾驶仿真",
    summaryZh:
      "基于车载环视相机流与自车动作信号（转向、油门、刹车），在潜空间实时预测未来数秒的物理路况变化，支持任意长尾极端天气与突发危险工况的闭环重演与安全策略验证。",
    summaryEn:
      "Predict multi-view continuous roadway dynamics conditioned on ego-vehicle controls, generating safe and realistic corner-case simulations.",
    openSourceReference: "Drive-WM / GAIA-1 / UniSim Open Architecture",
    benchmarkMetrics: [
      { label: "视角一致性", value: "98.4% FVD" },
      { label: "控制响应延迟", value: "< 24ms" },
      { label: "路测替代比", value: "1:850 km" },
    ],
    targetAudience: "车企智能驾驶研发中心、ADAS 算法科学家、仿真测试工程师",
    businessScenario: "乘用车与商用车量产前极端长尾工况（鬼探头/暴风雪/施工区）闭环虚拟路测与安全准入。",
    interactivePreviewType: "driving",
    previewImage: "/assets/great-wall.jpg",
    depthMap: "/depth/great-wall.png",
  },
  {
    id: "embodied-ai",
    nameZh: "具身智能体物理评测场",
    nameEn: "Embodied AI & Agent Benchmark",
    category: "embodied-ai",
    badge: "虚实迁移 Sim-to-Real",
    headline: "机械臂与移动 Agent 的全物理常识动力学评估",
    summaryZh:
      "模拟刚体碰撞、摩擦力、液体张力及重力场。智能体在此闭环执行感知-决策-交互指令，全面评测 LLM/VLM 对三维几何空间与动力学常识的理解度，降低真实机器人破损风险。",
    summaryEn:
      "Rigid body dynamics, friction, and fluid simulation for robotic perception-action loops with high-fidelity Sim-to-Real fidelity.",
    openSourceReference: "Habitat-Sim / Isaac Gym / MineDojo Ecosystem",
    benchmarkMetrics: [
      { label: "物理守恒度", value: "99.2% MSE" },
      { label: "动力学更新", value: "240 Hz" },
      { label: "抓取成功率", value: "94.6%" },
    ],
    targetAudience: "人形机器人企业、工业自动化系统集成商、具身大模型研发团队",
    businessScenario: "灵巧手抓取训练、仓储搬运路径试错与百万级合成训练数据集生成。",
    interactivePreviewType: "embodied",
    previewImage: "/assets/forbidden-city.jpg",
    depthMap: "/depth/forbidden-city.png",
  },
  {
    id: "interactive-generative",
    nameZh: "可交互虚拟时空生成模型",
    nameEn: "Interactive Generative World Models",
    category: "interactive-generative",
    badge: "实时扩散推演",
    headline: "键盘/鼠标即时动作驱动的连续开放世界渲染",
    summaryZh:
      "打破传统游戏引擎预设资源模式，由自回归/扩散 Transformer 完全实时生成下一帧三维世界像素与空间几何，实现真实开放物理世界的无穷生成与实时交互探索。",
    summaryEn:
      "Real-time action-conditioned diffusion world generation without classical game engines, creating continuous interactive environments.",
    openSourceReference: "Oasis Architecture / Open-Sora / VideoCrafter",
    benchmarkMetrics: [
      { label: "实时帧率", value: "60 FPS" },
      { label: "时空连续性", value: "99.8%" },
      { label: "输入动作时延", value: "16ms" },
    ],
    targetAudience: "下一代虚拟现实交互开发者、元宇宙平台架构师、影视生成制作团队",
    businessScenario: "零引擎成本的沉浸式场景生成、数字孪生交互走查与创意环境沙盒。",
    interactivePreviewType: "interactive",
    previewImage: "/assets/summer-palace.jpg",
    depthMap: "/depth/summer-palace.png",
  },
  {
    id: "sandtable-defense",
    nameZh: "宏观战术沙盘多智能体推演",
    nameEn: "Tactical Sandtable & Multi-Agent Wargaming",
    category: "sandtable-defense",
    badge: "大规模态势博弈",
    headline: "真实地形与地缘时空下的千级智能体因果决策",
    summaryZh:
      "融合真实地理 GIS 空间点阵、地形阻隔与运筹资源约束，支持多方自主智能体在非完全信息博弈下的战术决策对抗、应急救援推演与灾害扩散预测。",
    summaryEn:
      "Large-scale multi-agent simulation over authentic GIS terrain for strategic decision-making, game theory, and crisis response.",
    openSourceReference: "WarAgent / Multi-Agent Geo-Simulation Framework",
    benchmarkMetrics: [
      { label: "并发智能体", value: "1,000+ Agents" },
      { label: "时空推演步长", value: "1s - 24h" },
      { label: "因果决策可解释性", value: "100%" },
    ],
    targetAudience: "国防防务运筹智库、应急管理规划局、超大城市智慧治理指挥中心",
    businessScenario: "城市级极端洪涝与火灾疏散演练、关键基础设施防御仿真与战略态势推演。",
    interactivePreviewType: "sandtable",
    previewImage: "/assets/temple-of-heaven.jpg",
    depthMap: "/depth/temple-of-heaven.png",
  },
  {
    id: "physics-engine",
    nameZh: "多物理场真实环境计算",
    nameEn: "Multi-Physics Real Environment Engine",
    category: "physics-engine",
    badge: "光照与连续介质",
    headline: "神经辐射度、米氏大气与光影因果的精确计算",
    summaryZh:
      "在 WebGL 神经深度场中嵌入天体物理几何算子与双向反射分布函数（BRDF），重构现实世界从晨曦到子夜的光量子散射与物性材质反应。",
    summaryEn:
      "Neural radiance transport, atmospheric scattering, and surface normal reconstruction under astronomical solar conditions.",
    openSourceReference: "Nerfstudio Core / GaussianSplats3D / Taichi Physics",
    benchmarkMetrics: [
      { label: "光子采样精度", value: "0.1 nm" },
      { label: "着色器管线", value: "WebGL 2.0" },
      { label: "太阳角度误差", value: "< 0.05°" },
    ],
    targetAudience: "工业光学仿真工程师、建筑环境采光设计院、数字空间计算开发者",
    businessScenario: "大型公共建筑日光环境全生命周期能效评测与视觉舒适度验证。",
    interactivePreviewType: "driving",
    previewImage: "/assets/798.jpg",
    depthMap: "/depth/798.png",
  },
  {
    id: "llm-alignment",
    nameZh: "基座大模型真实世界物理对齐",
    nameEn: "World Model Alignment for Foundation LLMs",
    category: "llm-alignment",
    badge: "物理常识基准",
    headline: "超越纯文本幻觉的物理因果规律验证体系",
    summaryZh:
      "针对前沿语言模型在空间几何、质量、运动与重力因果上的逻辑漏洞，提供标准化的具身测试用例与世界模型验证回路，确保 AI 在操作实体前具备完备物理常识。",
    summaryEn:
      "Rigorous physics benchmark ensuring foundation models possess grounded causal reasoning about 3D space, gravity, and mass.",
    openSourceReference: "OpenAI Gym Universe / Physical-QA / Mind2Web",
    benchmarkMetrics: [
      { label: "评测题库覆盖", value: "50,000+ Cases" },
      { label: "常识幻觉过滤率", value: "91.5%" },
      { label: "跨模态一致性", value: "97.3%" },
    ],
    targetAudience: "大模型研究机构、多模态基础模型对齐评测团队、AI 安全实验室",
    businessScenario: "前沿大模型商业化上线前物理安全红队测试与能力认证。",
    interactivePreviewType: "embodied",
    previewImage: "/assets/hutong.jpg",
    depthMap: "/depth/hutong.png",
  },
];
