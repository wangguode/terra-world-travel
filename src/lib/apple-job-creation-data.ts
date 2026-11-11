export interface JobCreationStory {
  id: string;
  badgeEn: string;
  badgeZh: string;
  nameEn: string;
  nameZh: string;
  fieldEn: string;
  fieldZh: string;
  locationEn: string;
  locationZh: string;
  quoteEn: string;
  quoteZh: string;
  storyEn: string;
  storyZh: string;
  image: string;
}

export const ECOSYSTEM_STORIES: JobCreationStory[] = [
  {
    id: "spatial-perception",
    badgeEn: "Spatial Perception",
    badgeZh: "空间感知与三维高斯",
    nameEn: "IntelliSpatial Systems",
    nameZh: "时空智联系统",
    fieldEn: "Spatial AI & 3DGS",
    fieldZh: "空间智能 · 3D 高斯点云",
    locationEn: "Beijing, China",
    locationZh: "北京",
    quoteEn: "From real-time urban scanning to 60 FPS neural reconstruction, TERRA provides the fundamental canvas.",
    quoteZh: "从城市级实时激光雷达测绘到 60 FPS 神经辐射场重建，TERRA 为空间计算提供了底层画布。",
    storyEn:
      "Leveraging TERRA's implicit world model, engineering teams compressed multi-gigabyte point clouds into neural latent fields. The spatial digital twin platform now powers heritage conservation across 40 ancient palaces with photorealistic precision.",
    storyZh:
      "依托 TERRA 的隐式世界模型，工程团队将传统数 GB 的离散激光点云压缩为轻量神经潜空间场。其空间数字孪生系统已在故宫与天坛等 40 多处古建筑数字化保护中落地，重现千年晨昏光影。",
    image: "/images/beijing-pulse/forbidden-city.jpg",
  },
  {
    id: "embodied-robotics",
    badgeEn: "Embodied Robotics",
    badgeZh: "具身智能与仿生运动",
    nameEn: "Kinematics & Dynamics Lab",
    nameZh: "仿生动力学实验室",
    fieldEn: "Sim-to-Real Policy",
    fieldZh: "机器人 · Sim-to-Real",
    locationEn: "Shanghai, China",
    locationZh: "上海",
    quoteEn: "Training locomotion policies in neural world models reduced physical hardware damages by 98%.",
    quoteZh: "在神经世界模型中演练运动控制策略，将真机物理调试损耗降低了 98%。",
    storyEn:
      "Robotics researchers condition the neural world model on high-frequency joint torques and foot contact sensors. Quadruped robots traverse unseen terrain with high stability, achieving zero-shot policy transfer across stairs and loose scree.",
    storyZh:
      "机器人研发人员将世界模型与电机高频扭矩及足端传感器闭环对齐。四足机器人在未曾经历的复杂地形上自如前行，在乱石碎屑与高台阶路况下实现真正的零微调物理迁移。",
    image: "/images/beijing-pulse/hero-beijing.jpg",
  },
  {
    id: "autonomous-simulation",
    badgeEn: "Autonomous Mobility",
    badgeZh: "自动驾驶时空闭环",
    nameEn: "DriveTwin Core",
    nameZh: "星行智驾时空仿真",
    fieldEn: "Counterfactual Safety",
    fieldZh: "安全闭环 · 反事实推演",
    locationEn: "Shenzhen, China",
    locationZh: "深圳",
    quoteEn: "Simulating edge-case accidents without putting real vehicles or passengers at risk.",
    quoteZh: "推演极限工况险情，无需将实体车辆与乘客置于真实的交通风险之中。",
    storyEn:
      "Autonomous driving teams use TERRA's counterfactual branching to evaluate vehicle behavior under critical pedestrian crossings and sudden torrential storms, running millions of simulated miles daily.",
    storyZh:
      "自动驾驶团队利用 TERRA 的反事实分支生成能力，实时模拟暴风雨骤降、行人横穿等极端险情下的车辆响应，每日完成数百万公里无风险虚拟路测。",
    image: "/images/beijing-pulse/futuristic.jpg",
  },
  {
    id: "creative-interactive",
    badgeEn: "Interactive Spatial Worlds",
    badgeZh: "交互虚拟世界与空间叙事",
    nameEn: "Open World Collective",
    nameZh: "开放时空创作者联盟",
    fieldEn: "Indie Spatial Creators",
    fieldZh: "空间应用 · 沉浸交互",
    locationEn: "Hangzhou, China",
    locationZh: "杭州",
    quoteEn: "World creation transformed from assembling polygons to directing neural causal spacetime.",
    quoteZh: "世界构建的范式，从繁杂的多边形拼装，彻底升级为对神经因果时空的直接引导。",
    storyEn:
      "Independent developers build interactive spatial environments inside browsers without high-end local GPUs. Global explorers can interactively walk through procedurally evolving architectural wonders.",
    storyZh:
      "独立开发者与空间叙事者仅凭动作控制张量，即可在浏览器中即时构建具备真实重力与动量反馈的交互漫游走廊，已吸引全球超过 250 万数字旅行者在线体验。",
    image: "/images/beijing-pulse/temple-of-heaven.jpg",
  },
];
