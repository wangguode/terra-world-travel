export interface WorldDimension {
  id: string;
  name: string;
  codename: string;
  category: string;
  headline: string;
  description: string;
  image: string;
  depthMap: string;
  physics: {
    gravity: number; // m/s^2
    drag: number;
    bounce: number;
    entropy: number;
    lightCycle: string;
  };
  diffusionConfig: {
    defaultSteps: number;
    latentDim: string;
    causalWindow: number; // frames
    frameRate: number; // fps
    noiseScale: number;
  };
  interventions: {
    key: string;
    label: string;
    effect: string;
  }[];
}

export const WORLD_DIMENSIONS: WorldDimension[] = [
  {
    id: "cyber-temple",
    name: "赛博禅刹 · 在线祈福殿堂",
    codename: "TERRA-ZEN-TEMPLE",
    category: "Cyber Temple & Heritage",
    headline: "天坛晨钟暮鼓、多人赛博焚香与流体青烟自发涌现",
    description:
      "基于 14B 自回归世界模型驱动的在线 3D 赛博禅刹。全球探索者跨时区同屏在线漫游，实时敬奉赛博真香、鸣钟敲击电子木鱼积攒因果功德。香火青烟与古建日照光影完全由因果扩散潜空间自发推演，零几何穿模，空灵共振。",
    image: "/images/beijing-pulse/temple-of-heaven.jpg",
    depthMap: "/depth/temple-of-heaven.png",
    physics: {
      gravity: 9.8,
      drag: 0.15,
      bounce: 0.08,
      entropy: 0.05,
      lightCycle: "Zen Golden Hour · Incense Diffusion",
    },
    diffusionConfig: {
      defaultSteps: 30,
      latentDim: "16x64x64",
      causalWindow: 48,
      frameRate: 60,
      noiseScale: 0.05,
    },
    interventions: [
      { key: "F", label: "赛博焚香 (Incense)", effect: "在香炉前激发流体力学青烟潜变量扩散" },
      { key: "Space", label: "鸣钟敲磬 (Zen Bell)", effect: "敲击鸣钟激发全局声学因果涟漪，功德+1" },
      { key: "E", label: "佛光普照 (Radiance Sheen)", effect: "注入太阳高度角金光透射波，平定万物" },
    ],
  },
  {
    id: "cyber-city",
    name: "未来中枢 · 赛博数字新城",
    codename: "TERRA-CYBER-CITY",
    category: "Multiplayer Autonomous Urban",
    headline: "多智能体连续协同、各向异性车流与反事实决策推演",
    description:
      "高密度立体未来都市。基于连续控制向量实时推演车辆变道与行人避障。通过按 E 键注入突发工况扰动，世界模型即时生成零事故风险的反事实分支，展现超低延迟闭环仿真实力。",
    image: "/images/beijing-pulse/futuristic.jpg",
    depthMap: "/depth/forbidden-city.png",
    physics: {
      gravity: 9.8,
      drag: 0.22,
      bounce: 0.04,
      entropy: 0.18,
      lightCycle: "Bioluminescent Neon & Wet Asphalts",
    },
    diffusionConfig: {
      defaultSteps: 28,
      latentDim: "16x64x64",
      causalWindow: 64,
      frameRate: 60,
      noiseScale: 0.10,
    },
    interventions: [
      { key: "E", label: "反事实推演 (Counterfactual Branch)", effect: "在前方车流中模拟突发变道与紧急制动" },
      { key: "Space", label: "无人机视点 (Drone Ascend)", effect: "切换空中三维全景俯瞰时空流向" },
      { key: "R", label: "时空回溯 (Rollback Horizon)", effect: "回滚至前序关键帧重新推演分岔决策" },
    ],
  },
  {
    id: "voxel-oasis",
    name: "神经像素沙盒 (Voxel Oasis)",
    codename: "TERRA-DIT-01",
    category: "Neuromorphic Sandbox",
    headline: "实时可破拆与建造的自回归体素梦境",
    description:
      "基于因果自回归 Transformer 的无尽像素方块世界。按下 E 键或单击鼠标可实时注入扰动潜变量，观察神经扩散模型如何在不依赖 3D 几何网格的前提下实时破拆与重构地形。",
    image: "/images/beijing-pulse/forbidden-city.jpg",
    depthMap: "/depth/forbidden-city.png",
    physics: {
      gravity: 9.8,
      drag: 0.12,
      bounce: 0.05,
      entropy: 0.15,
      lightCycle: "24h Dynamic Sun-Earth Cycle",
    },
    diffusionConfig: {
      defaultSteps: 24,
      latentDim: "16x64x64",
      causalWindow: 32,
      frameRate: 60,
      noiseScale: 0.08,
    },
    interventions: [
      { key: "E", label: "体素破坏 (Break Block)", effect: "在相机前方注入几何缺失高斯噪声" },
      { key: "Space", label: "反重力跃迁 (Kinetic Leap)", effect: "应用垂直加速度潜向量" },
      { key: "R", label: "量子重抽样 (Reseed World)", effect: "重置随机扩散隐空间起始点" },
    ],
  },
  {
    id: "cyber-metropolis",
    name: "赛博霓虹时空 (Neon Metropolis)",
    codename: "TERRA-DIT-02",
    category: "Urban Simulation",
    headline: "多光源各向异性光流与雨夜反射推演",
    description:
      "模拟高密度立体都市中的雨滴流体、霓虹漫反射与交通流。通过调整时间滑块与因果上下文窗口，观察模型如何预测光影在湿润地表的实时菲涅尔反射。",
    image: "/images/beijing-pulse/temple-of-heaven.jpg",
    depthMap: "/depth/temple-of-heaven.png",
    physics: {
      gravity: 9.8,
      drag: 0.25,
      bounce: 0.02,
      entropy: 0.22,
      lightCycle: "Precipitation & Neon Flickering",
    },
    diffusionConfig: {
      defaultSteps: 30,
      latentDim: "16x64x64",
      causalWindow: 48,
      frameRate: 60,
      noiseScale: 0.12,
    },
    interventions: [
      { key: "E", label: "暴雨激活 (Rainstorm Surge)", effect: "注入连续水滴扰动微流场" },
      { key: "Space", label: "无人机视点 (Drone Ascend)", effect: "切换空中自由俯瞰轨迹" },
      { key: "R", label: "电网过载 (Grid Pulse)", effect: "瞬间重构场景色温与高光潜变量" },
    ],
  },
  {
    id: "submerged-ruins",
    name: "深海沉没巨构 (Submerged Colosseum)",
    codename: "TERRA-DIT-03",
    category: "Fluid & Optics",
    headline: "水下焦散、浮力动力学与体散射神经合成",
    description:
      "探索沉入碧蓝深海的巨大古代石拱遗迹。光线穿透水面产生动态焦散光网，极低阻尼与微重力环境让相机在三维空间中呈现漂浮漫游状态。",
    image: "/images/beijing-pulse/summer-palace.jpg",
    depthMap: "/depth/summer-palace.png",
    physics: {
      gravity: 2.1,
      drag: 0.65,
      bounce: 0.45,
      entropy: 0.08,
      lightCycle: "Subsurface Caustics 5200K",
    },
    diffusionConfig: {
      defaultSteps: 28,
      latentDim: "16x64x64",
      causalWindow: 36,
      frameRate: 60,
      noiseScale: 0.06,
    },
    interventions: [
      { key: "E", label: "水流涌动 (Hydro Current)", effect: "施加水平方向流体涡流矢量" },
      { key: "Space", label: "上浮冲刺 (Buoyancy Boost)", effect: "以 4.5m/s 速度浮升" },
      { key: "R", label: "潮汐重置 (Tidal Reset)", effect: "重新收敛水体浊度与焦散相位" },
    ],
  },
  {
    id: "floating-islands",
    name: "引力失真空岛 (Floating Precipice)",
    codename: "TERRA-DIT-04",
    category: "Non-Euclidean Gravity",
    headline: "群山悬浮、云雾卷吸与非常规动力学实验",
    description:
      "位于对流层上方的反重力岩石岛屿群。云海在峡谷间奔涌，测试世界模型在非欧几里得引力条件下的连续时空几何推演能力。",
    image: "/images/beijing-pulse/great-wall.jpg",
    depthMap: "/depth/great-wall.png",
    physics: {
      gravity: -1.5,
      drag: 0.05,
      bounce: 0.8,
      entropy: 0.35,
      lightCycle: "Stratospheric Sunrise 3200K",
    },
    diffusionConfig: {
      defaultSteps: 32,
      latentDim: "16x64x64",
      causalWindow: 64,
      frameRate: 60,
      noiseScale: 0.15,
    },
    interventions: [
      { key: "E", label: "引力倒转 (Gravity Invert)", effect: "使全局加速度矢量在正负间翻转" },
      { key: "Space", label: "真空俯冲 (Free-Fall Glider)", effect: "贴近岩壁表面滑翔推进" },
      { key: "R", label: "虚空重坍 (Void Collapse)", effect: "随机重布云层厚度与光束投射" },
    ],
  },
  {
    id: "bioluminescent-grove",
    name: "发光能量林地 (Bioluminescent Grove)",
    codename: "TERRA-DIT-05",
    category: "Organic Particle Field",
    headline: "自发光生物微粒与自适应暗光适应模拟",
    description:
      "布满荧光植物与能量光球的神秘森林。测试自回归模型对微弱自发光光源、粒子漂移与暗环境感知范围的因果保持力。",
    image: "/images/beijing-pulse/798.jpg",
    depthMap: "/depth/798.png",
    physics: {
      gravity: 7.2,
      drag: 0.18,
      bounce: 0.15,
      entropy: 0.18,
      lightCycle: "Organic Phosphorescence 450nm",
    },
    diffusionConfig: {
      defaultSteps: 26,
      latentDim: "16x64x64",
      causalWindow: 40,
      frameRate: 60,
      noiseScale: 0.09,
    },
    interventions: [
      { key: "E", label: "能量释放 (Spore Bloom)", effect: "在视线中心触发成簇荧光微粒扩散" },
      { key: "Space", label: "林梢跳跃 (Canopy Leap)", effect: "利用弹性藤蔓向上加速" },
      { key: "R", label: "暗夜重聚 (Nocturnal Phase)", effect: "调整生物发光光谱至深紫波段" },
    ],
  },
];

export interface ActionLogEntry {
  id: string;
  timestamp: number;
  key: string;
  action: string;
  latentDelta: [number, number, number];
}
