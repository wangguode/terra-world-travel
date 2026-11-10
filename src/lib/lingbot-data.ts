export interface WorldPreset {
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  image: string;
  depthMap: string;
  tag: string;
  defaultCoord: string;
}

export const WORLD_PRESETS: WorldPreset[] = [
  {
    id: "imperial-palace",
    nameZh: "紫禁城 · 暮色宫殿",
    nameEn: "The Forbidden Sanctuary",
    descriptionZh: "600年皇家殿宇与角楼金瓦，低角度落日金辉与深邃檐影交织的物理因果空间。",
    descriptionEn: "Imperial architecture with rich ray-traced shadows and vermilion surface normals.",
    image: "/assets/forbidden-city.jpg",
    depthMap: "/depth/forbidden-city.png",
    tag: "历史古迹 · 宏大空间",
    defaultCoord: "39.9163° N, 116.3972° E",
  },
  {
    id: "ancient-pass",
    nameZh: "慕田峪 · 燕山烽燧",
    nameEn: "Great Wall Alpine Ridgeline",
    descriptionZh: "崇山峻岭之巅的石质长城，米氏散射晨雾与连绵山峦的无尽生成视界。",
    descriptionEn: "Endless winding watchtowers rendered with volumetric atmospheric haze.",
    image: "/assets/great-wall.jpg",
    depthMap: "/depth/great-wall.png",
    tag: "自然地形 · 极限视野",
    defaultCoord: "40.4319° N, 116.5704° E",
  },
  {
    id: "heavenly-altar",
    nameZh: "天坛 · 圜丘正阳",
    nameEn: "Temple of Heaven Sacred Axis",
    descriptionZh: "天圆地方的极简几何秩序，三层汉白玉台基在正午阳光下的纯粹反射。",
    descriptionEn: "Concentric circular geometry under zenith sunlight with crisp contact shadows.",
    image: "/assets/temple-of-heaven.jpg",
    depthMap: "/depth/temple-of-heaven.png",
    tag: "对称几何 · 纯净光场",
    defaultCoord: "39.8822° N, 116.4066° E",
  },
  {
    id: "summer-pavilion",
    nameZh: "颐和园 · 万寿湖光",
    nameEn: "Summer Palace Lakeside",
    descriptionZh: "十七孔汉白玉石桥横卧昆明湖，水面菲涅尔微澜与落日波光的动态流体模拟。",
    descriptionEn: "Dynamic aquatic reflection and seventeen-arch bridge under sunset.",
    image: "/assets/summer-palace.jpg",
    depthMap: "/depth/summer-palace.png",
    tag: "水体流体 · 菲涅尔波光",
    defaultCoord: "39.9998° N, 116.2755° E",
  },
  {
    id: "industrial-loft",
    nameZh: "798 · 锯齿漫射场",
    nameEn: "798 Industrial Sawtooth Hall",
    descriptionZh: "包豪斯工业旧厂房北向采光天窗，大空间极简冷白漫射光场与当代艺术展区。",
    descriptionEn: "Industrial interior with north-facing skylights casting soft ambient diffuse.",
    image: "/assets/798.jpg",
    depthMap: "/depth/798.png",
    tag: "室内空间 · 工业结构",
    defaultCoord: "39.9839° N, 116.4947° E",
  },
];

export interface LingBotVersionInfo {
  version: "1.0" | "2.0";
  title: string;
  badge: string;
  parameterCount: string;
  fps: string;
  resolution: string;
  durationCapability: string;
  architecture: string;
  descriptionZh: string;
}

export const LINGBOT_VERSIONS: Record<"1.0" | "2.0", LingBotVersionInfo> = {
  "1.0": {
    version: "1.0",
    title: "LingBot-World 1.0",
    badge: "基础短程生成",
    parameterCount: "7B Parameters",
    fps: "30 FPS",
    resolution: "512p",
    durationCapability: "15~30秒短程因果",
    architecture: "Standard Autoregressive Video DiT",
    descriptionZh: "第一代开源交互世界模型，验证了动作信号（WASD）条件反射控制画面实时生成的可能性。",
  },
  "2.0": {
    version: "2.0",
    title: "LingBot-World 2.0 (Infinity)",
    badge: "14B Causal DiT 旗舰版",
    parameterCount: "14B Causal Parameters",
    fps: "60 FPS",
    resolution: "720p HD",
    durationCapability: "数小时连续无崩溃",
    architecture: "Causal DiT + Pilot-Director Dual Agents",
    descriptionZh: "第二代工业级世界模型，彻底解决长程时空崩塌难题，引入因果注意力掩码与双智能体调度，支持无尽时空交互。",
  },
};
