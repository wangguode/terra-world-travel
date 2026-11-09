export interface AttractionName {
  en: string;
  zh: string;
}

export interface Attraction {
  id: string;
  name: AttractionName;
  districtZh: string;
  image: string;
  coordinates: string;
  elevation: string;
  essence: string;
  defaultLight: "dawn" | "noon" | "sunset" | "night";
}

export interface SpatialMoment {
  id: string;
  attractionId: string;
  lightingId: "dawn" | "noon" | "sunset" | "night";
  timeLabel: string;
  title: string;
  landmarkZh: string;
  desc: string;
  image: string;
}

export const ATTRACTIONS: Attraction[] = [
  {
    id: "forbidden-city",
    name: { en: "Forbidden City", zh: "故宫紫禁城" },
    districtZh: "东城区",
    image: "/assets/forbidden-city.jpg",
    coordinates: "39.9163° N, 116.3972° E",
    elevation: "海拔 44 米 · 中轴线宫殿群",
    essence: "明清皇城中轴之巅，红墙金瓦九百八十座殿宇，东方木构建筑极致典范。",
    defaultLight: "sunset",
  },
  {
    id: "great-wall",
    name: { en: "Mutianyu Great Wall", zh: "慕田峪长城" },
    districtZh: "怀柔区",
    image: "/assets/great-wall.jpg",
    coordinates: "40.4319° N, 116.5704° E",
    elevation: "海拔 535 米 · 崇山脊线",
    essence: "燕山山脉苍翠之巅，古老烽火台绵延至天际，初阳下天地苍茫雄浑。",
    defaultLight: "dawn",
  },
  {
    id: "temple-of-heaven",
    name: { en: "Temple of Heaven", zh: "天坛祈年殿" },
    districtZh: "东城区",
    image: "/assets/temple-of-heaven.jpg",
    coordinates: "39.8822° N, 116.4066° E",
    elevation: "海拔 46 米 · 皇家坛庙",
    essence: "东方空间哲学极致体现，三重蓝琉璃飞檐直指天际，天圆地方。",
    defaultLight: "noon",
  },
  {
    id: "summer-palace",
    name: { en: "Summer Palace", zh: "颐和园" },
    districtZh: "海淀区",
    image: "/assets/summer-palace.jpg",
    coordinates: "39.9999° N, 116.2755° E",
    elevation: "海拔 58 米 · 昆明湖山水",
    essence: "万寿山与昆明湖相映成趣，长廊晚照与十七孔桥倒映碎金。",
    defaultLight: "sunset",
  },
  {
    id: "beihai-park",
    name: { en: "Beihai Park", zh: "北海公园" },
    districtZh: "西城区",
    image: "/assets/beihai-park.jpg",
    coordinates: "39.9248° N, 116.3888° E",
    elevation: "海拔 45 米 · 琼华岛太液池",
    essence: "辽金元明清五代御苑，琼岛白塔耸立碧波之上，城中静谧绿洲。",
    defaultLight: "noon",
  },
  {
    id: "798",
    name: { en: "798 Art District", zh: "798 艺术区" },
    districtZh: "朝阳区",
    image: "/assets/798.jpg",
    coordinates: "39.9842° N, 116.4947° E",
    elevation: "海拔 38 米 · 包豪斯工业遗存",
    essence: "包豪斯锯齿形厂房与现代前沿艺术交织，北京先锋当代文化地标。",
    defaultLight: "noon",
  },
  {
    id: "nanluoguxiang",
    name: { en: "Nanluoguxiang & Shichahai", zh: "南锣鼓巷与后海" },
    districtZh: "东城区",
    image: "/assets/nanluoguxiang.jpg",
    coordinates: "39.9372° N, 116.4031° E",
    elevation: "海拔 42 米 · 传统四合院肌理",
    essence: "七百年老城街巷肌理，青砖灰瓦与暮色红灯笼，原汁原味京城烟火。",
    defaultLight: "night",
  },
  {
    id: "lama-temple",
    name: { en: "Lama Temple (Yonghe)", zh: "雍和宫" },
    districtZh: "东城区",
    image: "/assets/lama-temple.jpg",
    coordinates: "39.9472° N, 116.4178° E",
    elevation: "海拔 43 米 · 藏传佛教圣地",
    essence: "清代皇家寺院建筑群，黄瓦红墙与缭绕香烟，藏汉建筑艺术融合瑰宝。",
    defaultLight: "dawn",
  },
  {
    id: "hutong",
    name: { en: "Beijing Hutongs", zh: "北京胡同" },
    districtZh: "西城区",
    image: "/assets/hutong.jpg",
    coordinates: "39.9320° N, 116.3980° E",
    elevation: "海拔 41 米 · 老北京四合院",
    essence: "门墩门簪与老槐树荫，静谧灰瓦四合院，深藏古都千百年的人文温情。",
    defaultLight: "sunset",
  },
  {
    id: "wangfujing",
    name: { en: "Wangfujing", zh: "王府井大街" },
    districtZh: "东城区",
    image: "/assets/wangfujing.jpg",
    coordinates: "39.9142° N, 116.4116° E",
    elevation: "海拔 42 米 · 百年商业中枢",
    essence: "百年商业金街与新潮潮流碰撞，夜幕华灯初上，展现北京现代繁华。",
    defaultLight: "night",
  },
];

export const SPATIAL_MOMENTS: SpatialMoment[] = [
  {
    id: "forbidden-sunset",
    attractionId: "forbidden-city",
    lightingId: "sunset",
    timeLabel: "17:30 · 黄昏金辉",
    title: "金瓦落日 · 紫禁暮色",
    landmarkZh: "故宫紫禁城",
    desc: "落日余晖斜照神武门与角楼，金瓦与筒子河倒影共染暖金，六百年静穆化作壮丽画卷。",
    image: "/assets/forbidden-city.jpg",
  },
  {
    id: "great-wall-dawn",
    attractionId: "great-wall",
    lightingId: "dawn",
    timeLabel: "06:30 · 清晨晨曦",
    title: "晨雾苍莽 · 雄关初醒",
    landmarkZh: "慕田峪长城",
    desc: "朝阳穿透苍翠山峦与薄雾，低角度金光勾勒烽火台轮廓，游人罕至，天地浩瀚无垠。",
    image: "/assets/great-wall.jpg",
  },
  {
    id: "temple-of-heaven-noon",
    attractionId: "temple-of-heaven",
    lightingId: "noon",
    timeLabel: "12:00 · 正午澄澈",
    title: "晴空素境 · 祈年天圆",
    landmarkZh: "天坛祈年殿",
    desc: "正午澄澈顶光照耀三重蓝琉璃瓦与三层汉白玉台基，天圆地方，古典几何秩序的极致表达。",
    image: "/assets/temple-of-heaven.jpg",
  },
];
