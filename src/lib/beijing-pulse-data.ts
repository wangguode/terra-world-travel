export interface AttractionName {
  en: string;
  zh: string;
}

export interface Attraction {
  id: string;
  name: AttractionName;
  category: "history" | "nature" | "culture" | "food";
  district: string;
  districtZh: string;
  duration: string;
  tags: string[];
  image: string;
  address: AttractionName;
  hours: AttractionName;
  ticket: AttractionName;
  transport: AttractionName;
  description: AttractionName;
  coordinates: string;
  elevation: string;
  // 4D 空间世界模型相关属性
  spatialModel: {
    recommendedHour: number;
    recommendedReason: string;
    solarBestView: string;
    anchors: {
      id: string;
      title: string;
      pos: [number, number, number];
      tip: string;
    }[];
  };
}

export interface RouteStop {
  time: string;
  attractionId: string;
  keyAction: string;
}

export interface TravelRoute {
  id: string;
  days: number;
  name: AttractionName;
  subtitle: AttractionName;
  stops: RouteStop[];
  highlights: string[];
}

export const ATTRACTIONS: Attraction[] = [
  {
    id: "forbidden-city",
    name: { en: "Forbidden City", zh: "故宫紫禁城" },
    category: "history",
    district: "dongcheng",
    districtZh: "东城区",
    duration: "3h",
    tags: ["unesco", "imperial", "must-see"],
    image: "/assets/forbidden-city.jpg",
    address: { en: "4 Jingshan Front St, Dongcheng", zh: "东城区景山前街4号" },
    hours: { en: "Tue-Sun 08:30-17:00", zh: "周二至周日 08:30-17:00" },
    ticket: { en: "¥60 (peak season)", zh: "旺季 ¥60 / 淡季 ¥40" },
    transport: { en: "Metro Line 1, Tiananmen East", zh: "地铁1号线天安门东站" },
    description: {
      en: "The imperial palace of Ming and Qing dynasties. Walk through vermilion gates and golden rooftops across 980 buildings.",
      zh: "明清两代皇家宫殿，九百八十座建筑，红墙金瓦，气势恢宏。"
    },
    coordinates: "39.9163° N, 116.3972° E",
    elevation: "海拔 44 米 · 中轴线宫殿群",
    spatialModel: {
      recommendedHour: 17.5,
      recommendedReason: "夕阳斜照太和殿与角楼，金瓦与筒子河倒影呈现全天最暖金色轮廓光",
      solarBestView: "东南角楼与景山万春亭俯瞰中轴线全景",
      anchors: [
        { id: "wumen", title: "午门检票与散客通道", pos: [0, 0, 4], tip: "避开天安门安检排队，从东华门步道直抵午门" },
        { id: "taihe", title: "太和殿中轴广角机位", pos: [0, 1.2, 0], tip: "站在丹陛下方仰角拍摄，建筑体量最具气魄" },
        { id: "shenwumen", title: "神武门出口与景山入口", pos: [0, 0.5, -4], tip: "出神武门过马路即达景山公园南门，登顶看故宫全景" }
      ]
    }
  },
  {
    id: "great-wall",
    name: { en: "Mutianyu Great Wall", zh: "慕田峪长城" },
    category: "nature",
    district: "huairou",
    districtZh: "怀柔区",
    duration: "5h",
    tags: ["unesco", "hiking", "must-see"],
    image: "/assets/great-wall.jpg",
    address: { en: "Mutianyu, Huairou District", zh: "怀柔区慕田峪村" },
    hours: { en: "Daily 07:30-17:30", zh: "每日 07:30-17:30" },
    ticket: { en: "¥40 entrance + cable car optional", zh: "门票 ¥40，索道另计" },
    transport: { en: "Bus 916 from Dongzhimen", zh: "东直门枢纽乘916快车" },
    description: {
      en: "Less crowded than Badaling, with forested ridges and watchtowers stretching across the horizon.",
      zh: "相比八达岭游人更少，崇山峻岭与古老烽火台绵延至天际。"
    },
    coordinates: "40.4319° N, 116.5704° E",
    elevation: "海拔 535 米 · 崇山脊线",
    spatialModel: {
      recommendedHour: 8.5,
      recommendedReason: "清晨山岚初散，侧光打在砖石烽火台立面上，光影对比立体且气温舒适",
      solarBestView: "14号敌楼平台与20号好汉坡",
      anchors: [
        { id: "cable-car", title: "缆车上站 · 14号敌楼", pos: [-2, 1, 2], tip: "乘箱式缆车直达14号敌楼，向西可徒步至最高处20号楼" },
        { id: "toboggan", title: "滑道下山 · 6号敌楼", pos: [3, 0.4, -2], tip: "体验旱地滑道顺山势俯冲而下，耗时约5分钟" }
      ]
    }
  },
  {
    id: "temple-of-heaven",
    name: { en: "Temple of Heaven", zh: "天坛祈年殿" },
    category: "history",
    district: "dongcheng",
    districtZh: "东城区",
    duration: "2h",
    tags: ["unesco", "imperial"],
    image: "/assets/temple-of-heaven.jpg",
    address: { en: "1 Tiantan Rd, Dongcheng", zh: "东城区天坛路1号" },
    hours: { en: "Daily 06:00-22:00 (park)", zh: "公园每日 06:00-22:00" },
    ticket: { en: "¥15 park / ¥34 combo", zh: "门票 ¥15 / 联票 ¥34" },
    transport: { en: "Metro Line 5, Tiantan Dongmen", zh: "地铁5号线天坛东门站" },
    description: {
      en: "Where emperors prayed for harvests. The circular Hall of Prayer is an icon of Chinese architecture.",
      zh: "皇帝祭天祈谷之地，三重檐圆形攒尖顶的祈年殿是中国建筑的经典标志。"
    },
    coordinates: "39.8822° N, 116.4066° E",
    elevation: "海拔 46 米 · 皇家坛庙",
    spatialModel: {
      recommendedHour: 7.0,
      recommendedReason: "晨光斜照蓝色琉璃瓦，古柏林间空气清透，晨练市民与古建融为生活画卷",
      solarBestView: "祈年殿南侧台阶与丹陛石正中",
      anchors: [
        { id: "qinian", title: "祈年殿正殿三层汉白玉台基", pos: [0, 1.5, 0], tip: "站在最下层汉白玉栏杆旁，仰角取景避开人群" },
        { id: "echo-wall", title: "皇穹宇回音壁", pos: [0, 0.4, 3], tip: "磨砖对缝圆形围墙，声波沿弧度清晰传导" }
      ]
    }
  },
  {
    id: "summer-palace",
    name: { en: "Summer Palace", zh: "颐和园" },
    category: "nature",
    district: "haidian",
    districtZh: "海淀区",
    duration: "4h",
    tags: ["unesco", "lake", "imperial"],
    image: "/assets/summer-palace.jpg",
    address: { en: "19 Xinjiangongmen Rd, Haidian", zh: "海淀区新建宫门路19号" },
    hours: { en: "Daily 06:30-18:00", zh: "每日 06:30-18:00" },
    ticket: { en: "¥30 (peak season)", zh: "门票 ¥30 / 联票 ¥60" },
    transport: { en: "Metro Line 4, Beigongmen", zh: "地铁4号线北宫门站" },
    description: {
      en: "Imperial garden around Kunming Lake. Longevity Hill, marble boat, and seventeen-arch bridge.",
      zh: "以昆明湖、万寿山为基址的皇家园林，长廊、石舫与十七孔桥相映成趣。"
    },
    coordinates: "39.9999° N, 116.2755° E",
    elevation: "海拔 58 米 · 昆明湖山水",
    spatialModel: {
      recommendedHour: 16.5,
      recommendedReason: "下午阳光西斜，西堤柳树与佛香阁金光交相辉映，冬至前后更可观十七孔桥金光穿洞",
      solarBestView: "南湖岛看十七孔桥与西堤六桥",
      anchors: [
        { id: "foxiangge", title: "万寿山佛香阁顶层俯瞰", pos: [0, 2.5, -2], tip: "登临佛香阁，昆明湖烟波浩渺与北京城西山尽收眼底" },
        { id: "17-bridge", title: "十七孔桥与铜牛", pos: [3, 0.3, 3], tip: "顺光拍摄十七孔石桥跨湖连岛的优雅弧线" }
      ]
    }
  },
  {
    id: "798",
    name: { en: "798 Art District", zh: "798 艺术区" },
    category: "culture",
    district: "chaoyang",
    districtZh: "朝阳区",
    duration: "3h",
    tags: ["art", "contemporary", "photography"],
    image: "/assets/798.jpg",
    address: { en: "2 Jiuxianqiao Rd, Chaoyang", zh: "朝阳区酒仙桥路2号" },
    hours: { en: "Daily 10:00-18:00 (galleries vary)", zh: "画廊开放约 10:00-18:00" },
    ticket: { en: "Free entry, exhibitions vary", zh: "园区免费，个展另计" },
    transport: { en: "Metro Line 14, Wangjing Nan", zh: "地铁14号线望京南站" },
    description: {
      en: "Former factory complex turned contemporary art hub. Galleries, cafes, and Bauhaus-era architecture.",
      zh: "原国营电子厂房蜕变的现代艺术中心，画廊、设计工坊与包豪斯锯齿屋顶相映。"
    },
    coordinates: "39.9840° N, 116.4960° E",
    elevation: "海拔 35 米 · 工业遗存街区",
    spatialModel: {
      recommendedHour: 14.0,
      recommendedReason: "包豪斯天窗漫反射自然光充沛，室内画廊与户外雕塑均处于最佳观赏光照",
      solarBestView: "798路中心主街与UCCA尤伦斯当代艺术中心外景",
      anchors: [
        { id: "sawtooth-roof", title: "包豪斯锯齿形天窗厂房", pos: [-1, 1, 0], tip: "北向倾斜高侧窗带来均匀无阴影漫射光，摄影极具线条感" }
      ]
    }
  },
  {
    id: "nanluoguxiang",
    name: { en: "Nanluoguxiang", zh: "南锣鼓巷与后海" },
    category: "culture",
    district: "dongcheng",
    districtZh: "东城区",
    duration: "2.5h",
    tags: ["hutong", "food", "shopping"],
    image: "/assets/nanluoguxiang.jpg",
    address: { en: "Nanluoguxiang Hutong, Dongcheng", zh: "东城区南锣鼓巷" },
    hours: { en: "Shops ~10:00-22:00", zh: "街区全天，商铺约 10:00-22:00" },
    ticket: { en: "Free", zh: "免费开放" },
    transport: { en: "Metro Line 6/8, Nanluoguxiang", zh: "地铁6/8号线南锣鼓巷站" },
    description: {
      en: "Centuries-old hutong lane lined with courtyard houses, snack stalls, and indie boutiques.",
      zh: "拥有七百多年历史的传统胡同，东西各有八条对称分布的平行胡同骨架。"
    },
    coordinates: "39.9372° N, 116.4031° E",
    elevation: "海拔 42 米 · 传统四合院肌理",
    spatialModel: {
      recommendedHour: 18.5,
      recommendedReason: "黄昏时分胡同红灯笼陆续点亮，暖光与瓦房灰色屋檐对比柔和",
      solarBestView: "中轴南锣主街及雨儿胡同齐白石旧居门前",
      anchors: [
        { id: "hutong-gate", title: "如意门与广亮大门门簪雕饰", pos: [0, 0.6, 2], tip: "细看四合院门第门墩石雕，见证北京老城居住礼制" }
      ]
    }
  }
];

export const ROUTES: TravelRoute[] = [
  {
    id: "1-day-classic",
    days: 1,
    name: { en: "1-Day Imperial Classic", zh: "一日紫禁中轴经典" },
    subtitle: { en: "Imperial heart of Beijing", zh: "从紫禁城晨曦到景山日落" },
    stops: [
      { time: "08:30", attractionId: "forbidden-city", keyAction: "午门进宫，沿中轴线三大殿与御花园纵览" },
      { time: "13:30", attractionId: "temple-of-heaven", keyAction: "出神武门乘5号线至天坛，观祈年殿与回音壁" },
      { time: "18:00", attractionId: "nanluoguxiang", keyAction: "傍晚漫步什刹海胡同，黄昏临水小酌尝京味小吃" }
    ],
    highlights: ["中轴线宫殿群全视角", "皇室祭祀坛庙建筑", "胡同四合院原真烟火"]
  },
  {
    id: "2-day-culture",
    days: 2,
    name: { en: "2-Day Culture & Heritage", zh: "两日古都与先锋文化" },
    subtitle: { en: "Temples, hutongs & art", zh: "千年坛庙与包豪斯当代艺术" },
    stops: [
      { time: "Day 1 · 09:00", attractionId: "temple-of-heaven", keyAction: "天坛晨间祈年殿祈福散步" },
      { time: "Day 1 · 14:00", attractionId: "forbidden-city", keyAction: "故宫深度探访东六宫与珍宝馆" },
      { time: "Day 2 · 10:00", attractionId: "798", keyAction: "798当代艺术画廊与工业遗存探店" },
      { time: "Day 2 · 15:30", attractionId: "nanluoguxiang", keyAction: "南锣鼓巷非遗手作与四合院咖啡" }
    ],
    highlights: ["传统皇家规制与现代艺术并存", "深度胡同人文漫步"]
  },
  {
    id: "3-day-deep",
    days: 3,
    name: { en: "3-Day Mountain & Palaces", zh: "三日长城山峦与皇家全览" },
    subtitle: { en: "Wall, gardens & everything", zh: "长城壮阔、山水园林与核心地标" },
    stops: [
      { time: "Day 1 · 07:30", attractionId: "great-wall", keyAction: "慕田峪长城缆车登顶，烽火台徒步俯瞰燕山" },
      { time: "Day 2 · 09:00", attractionId: "summer-palace", keyAction: "颐和园万寿山佛香阁，昆明湖乘画舫泛舟" },
      { time: "Day 3 · 08:30", attractionId: "forbidden-city", keyAction: "紫禁城全貌与景山俯瞰日落" }
    ],
    highlights: ["长城雄伟脊线", "皇家山水园林极境", "紫禁城完整动线穿透"]
  }
];

export const CATEGORIES = [
  { id: "all", name: { en: "All Spots", zh: "全部精选" } },
  { id: "history", name: { en: "Imperial History", zh: "皇家古建" } },
  { id: "nature", name: { en: "Gardens & Hills", zh: "名山园林" } },
  { id: "culture", name: { en: "Hutongs & Art", zh: "街巷与艺术" } },
];
