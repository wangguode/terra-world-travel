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

export interface TalentStory {
  id: string;
  nameEn: string;
  nameZh: string;
  roleEn: string;
  roleZh: string;
  cityEn: string;
  cityZh: string;
  bioEn: string;
  bioZh: string;
  image: string;
}

export const ECOSYSTEM_STORIES: JobCreationStory[] = [
  {
    id: "spatial-perception",
    badgeEn: "Spatial Perception",
    badgeZh: "空间感知与三维高斯",
    nameEn: "IntelliSpatial Team",
    nameZh: "时空智联团队",
    fieldEn: "Spatial AI & 3DGS",
    fieldZh: "空间智能 · 3D 高斯点云",
    locationEn: "Beijing, China",
    locationZh: "北京",
    quoteEn: "From real-time urban scanning to 60 FPS neural reconstruction, TERRA provides the fundamental canvas.",
    quoteZh: "从城市级实时激光雷达测绘到 60 FPS 神经辐射场重建，TERRA 为空间计算提供了底层画布。",
    storyEn:
      "Founded by pioneering computer vision researchers, IntelliSpatial leveraged TERRA's implicit world model to compress multi-gigabyte point clouds into neural latent fields. Their spatial app now powers heritage conservation across 40 ancient palaces with photorealistic precision.",
    storyZh:
      "由中国早期计算机视觉研究者创立的时空智联团队，依托 TERRA 的隐式世界模型，将传统数 GB 的离散激光点云压缩为轻量神经潜空间场。其空间数字孪生应用已在故宫与天坛等 40 多处古建筑数字化保护中落地，重现千年晨昏光影。",
    image: "/images/beijing-pulse/forbidden-city.jpg",
  },
  {
    id: "embodied-robotics",
    badgeEn: "Embodied Robotics",
    badgeZh: "具身智能与仿生运动",
    nameEn: "Bipedal & Quadruped Lab",
    nameZh: "智行仿生动力实验室",
    fieldEn: "Sim-to-Real Policy",
    fieldZh: "机器人 · Sim-to-Real",
    locationEn: "Shanghai, China",
    locationZh: "上海",
    quoteEn: "Training locomotion policies in neural world models reduced physical hardware damages by 98%.",
    quoteZh: "在神经世界模型中训练复杂步态控制，使真机物理碰撞损耗降低了 98%。",
    storyEn:
      "Developing quadruped robots for rugged industrial inspections used to risk millions in physical hardware damage. By generating dynamic neural sensory streams conditioned on continuous torque commands, the team achieves 94.2% zero-shot real-world transfer success.",
    storyZh:
      "在险峻工业巡检中研发四足与双足机器人，曾面临高昂的真机硬件跌落损伤成本。通过直接将关节力矩指令作为动作潜变量注入 TERRA 因果世界流，该团队实现了 94.2% 的零样本真机无缝迁移，步态推演毫秒级收敛。",
    image: "/images/beijing-pulse/hero-beijing.jpg",
  },
  {
    id: "autonomous-causality",
    badgeEn: "Autonomous Systems",
    badgeZh: "自动驾驶因果推演",
    nameEn: "NeuralDrive Mobility",
    nameZh: "元动时空智能",
    fieldEn: "Autonomous Driving",
    fieldZh: "无人驾驶 · 极限仿真",
    locationEn: "Shenzhen, China",
    locationZh: "深圳",
    quoteEn: "Generating continuous counterfactual corner cases without hand-coded virtual meshes.",
    quoteZh: "在没有任何人工三维网格的前提下，即时生成反事实极端天气与障碍演变。",
    storyEn:
      "Real-world autonomous testing cannot safely evaluate edge-case collisions or extreme snow blizzards. With TERRA's intuitive physics and spontaneous destruction emergence, NeuralDrive simulates millions of hazardous miles every night on edge WebGPU nodes.",
    storyZh:
      "真实道路路测无法安全模拟暴风雪突变或高速连环避障等长尾工况。借助 TERRA 潜空间自发涌现的直觉物理与动态霜雪演化，元动智能每晚在边缘节点推演上百万公里长尾场景，大幅提升端到端系统安全性。",
    image: "/images/beijing-pulse/798.jpg",
  },
  {
    id: "creative-worldbuilding",
    badgeEn: "Spatial Creators",
    badgeZh: "空间内容与独立创作者",
    nameEn: "Oasis Worldbuilders",
    nameZh: "绿洲时空创作者联盟",
    fieldEn: "Interactive Media",
    fieldZh: "交互媒体 · 沉浸漫游",
    locationEn: "Chengdu, China",
    locationZh: "成都",
    quoteEn: "A complete interactive virtual universe rendered without a traditional 3D graphics studio.",
    quoteZh: "无需昂贵的商业 3D 渲染农场，一个人即可推演出充满呼吸感的交互宇宙。",
    storyEn:
      "Independent developers and spatial storytellers use TERRA to construct playable interactive spaces purely from descriptive video telemetry and action vectors. Their cross-border spatial travel experience has engaged over 2.5 million explorers worldwide.",
    storyZh:
      "独立开发者与空间叙事者仅凭视频时空遥测与动作控制张量，即可在浏览器中即时构建具备真实重力与动量反馈的交互漫游走廊。其跨国空间漫游作品已吸引全球超过 250 万数字旅行者在线体验。",
    image: "/images/beijing-pulse/temple-of-heaven.jpg",
  },
];

export const TALENT_STORIES: TalentStory[] = [
  {
    id: "talent-1",
    nameEn: "Guo Wang",
    nameZh: "王果",
    roleEn: "Founding Architect · World Models",
    roleZh: "首席架构师 · 空间世界模型",
    cityEn: "Beijing",
    cityZh: "北京",
    bioEn:
      "Leading the 14B Causal DiT research, eliminating latent autoregressive collapse to realize continuous 60 FPS interactive spatial roaming.",
    bioZh:
      "主导 140 亿参数 Causal DiT 自回归因果网络架构研发，攻克长程时空坍塌瓶颈，实现无需离散网格的 60 FPS 连续交互漫游。",
    image: "/images/beijing-pulse/summer-palace.jpg",
  },
  {
    id: "talent-2",
    nameEn: "Dr. Lin Chen",
    nameZh: "陈琳 博士",
    roleEn: "Principal Scientist · Intuitive Physics",
    roleZh: "主任科学家 · 潜空间直觉物理",
    cityEn: "Hangzhou",
    cityZh: "杭州",
    bioEn:
      "Investigating spontaneous mechanics emergence in latent diffusion representations, replacing classical rigid colliders with implicit kinetic tensors.",
      bioZh:
      "深耕潜空间直觉物理与守恒律涌现，用隐式张量动力学取代传统刚体碰撞盒子，让重力与流体在像素生成中自然发生。",
    image: "/images/beijing-pulse/wangfujing.jpg",
  },
  {
    id: "talent-3",
    nameEn: "Alex Zhao",
    nameZh: "赵明宇",
    roleEn: "Edge Infrastructure Lead · WebGPU",
    roleZh: "边缘工程负责人 · WebGPU 流式计算",
    cityEn: "Shanghai",
    cityZh: "上海",
    bioEn:
      "Building sub-16ms action-to-photon rendering shaders across macOS, iOS, Windows, and Linux without local hardware dependencies.",
    bioZh:
      "构建亚 16ms 动作到光子端到端着色器引擎，无需沉重本地显卡即可在全平台浏览器中体验轻盈的交互式世界推演。",
    image: "/images/beijing-pulse/beihai-park.jpg",
  },
  {
    id: "talent-4",
    nameEn: "Sarah Yang",
    nameZh: "杨思颖",
    roleEn: "Embodied AI Robotics Lead",
    roleZh: "具身智能负责人 · Sim-to-Real",
    cityEn: "Shenzhen",
    cityZh: "深圳",
    bioEn:
      "Co-designing sensor telemetry bridges between quadruped actuators and generative neural radiance fields with 94.2% real-world benchmark parity.",
    bioZh:
      "打造机器人执行器与生成式神经辐射场之间的闭环遥测协议，在真机跨域迁移评测中实现 94.2% 的高精度任务收敛。",
    image: "/images/beijing-pulse/nanluoguxiang.jpg",
  },
];
