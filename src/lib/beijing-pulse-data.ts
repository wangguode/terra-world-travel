export interface AstronomicalWindow {
  title: string;
  optimalHour: number;
  timeWindow: string;
  seasonContext: string;
  solarAltitude: string;
  solarAzimuth: string;
  colorTemp: string;
  physicsPrinciple: string;
  observationGuide: string;
}

export interface ScenicSpot {
  id: string;
  nameZh: string;
  nameEn: string;
  locationZh: string;
  coordinates: string;
  image: string;
  depthMap: string;
  aspectRatio: string;
  defaultHour: number; // 0.0 - 24.0
  timeNotes: {
    dawn: string;
    noon: string;
    sunset: string;
    night: string;
  };
  poeticEssay: string;
  phenomenon: AstronomicalWindow;
}

export const SCENIC_SPOTS: ScenicSpot[] = [
  {
    id: "forbidden-city",
    nameZh: "故宫紫禁城",
    nameEn: "The Forbidden City",
    locationZh: "东城 · 景山前街",
    coordinates: "39.9163° N, 116.3972° E",
    image: "/assets/forbidden-city.jpg",
    depthMap: "/depth/forbidden-city.png",
    aspectRatio: "1279 / 640",
    defaultHour: 17.5,
    timeNotes: {
      dawn: "清晨六点半，晨曦斜穿午门飞檐，九百八十座殿宇在薄光中逐渐苏醒，空气清澈冷冽。",
      noon: "正午十二点，日悬中天，汉白玉丹陛与红墙金瓦交相辉映，皇家气象巍然肃穆。",
      sunset: "傍晚五点半，夕阳斜照角楼与筒子河，飞檐如墨，水面泛起满城碎金，六百年静穆化作绝美晚霞。",
      night: "入夜八点，深邃蓝调夜幕垂落，古建轮廓与星辰同驻，静听古老宫墙间的时光低语。",
    },
    poeticEssay:
      "六百年的红墙，在黄昏时分静默如谜。斜阳穿过太和门丹陛，琉璃金瓦将最后一抹余晖送入筒子河。时间在这里不再匆忙流逝，而是沉淀为静默的永恒。",
    phenomenon: {
      title: "西北角楼 · 悬日碎金",
      optimalHour: 17.5,
      timeWindow: "17:15 - 17:45",
      seasonContext: "深秋初冬最佳",
      solarAltitude: "4.8° (低掠射)",
      solarAzimuth: "248° (西南向)",
      colorTemp: "2800K (暖金赤红)",
      physicsPrinciple:
        "太阳高度角降至5°以下，阳光以低角度横穿筒子河水面形成全反射。角楼十字脊飞檐在强逆光下呈现锋利剪影，金色琉璃瓦产生强烈的菲涅尔高光。",
      observationGuide:
        "故宫闭馆前30分钟，游人退去，护城河水面波澜渐止。此时伫立景山前街东北侧，是捕捉六百年建筑肃穆与天地晚霞的唯一黄金物理窗口。",
    },
  },
  {
    id: "great-wall",
    nameZh: "慕田峪长城",
    nameEn: "Mutianyu Great Wall",
    locationZh: "怀柔 · 燕山脊线",
    coordinates: "40.4319° N, 116.5704° E",
    image: "/assets/great-wall.jpg",
    depthMap: "/depth/great-wall.png",
    aspectRatio: "1280 / 820",
    defaultHour: 6.5,
    timeNotes: {
      dawn: "清晨六点半，初阳穿透苍茫林海与晨雾，石质烽火台在金色微光中舒展，游人未至，天地空旷。",
      noon: "正午十二点，长城如巨龙蜿蜒于千峰翠色之巅，视野辽阔极目远眺，山川壮丽。",
      sunset: "傍晚五点半，余晖将苍山涂抹成暖赭色，烽火台剪影苍凉雄浑，静沐山风。",
      night: "入夜八点，群峰归于黛蓝深寂，唯有城砖静卧星河之下，岁月无声。",
    },
    poeticEssay:
      "当晨光微熹，燕山山脉在林海与薄雾中苏醒。古老烽火台静默横卧于千峰之巅，天地苍茫，唯有山风与时光在此长久低语。",
    phenomenon: {
      title: "正关台 · 雄关破晓",
      optimalHour: 6.5,
      timeWindow: "06:15 - 06:45",
      seasonContext: "全年晨曦清朗日",
      solarAltitude: "2.1° (破晓掠角)",
      solarAzimuth: "82° (东偏北)",
      colorTemp: "3200K (冷粉金光)",
      physicsPrinciple:
        "朝阳第一缕长波光穿越山谷逆温薄雾层，发生米氏散射（Mie Scattering）。光束切过敌楼石垛，形成明暗反差超过1:16的立体浮雕光影。",
      observationGuide:
        "缆车运行前登顶二十号敌楼，无任何游客喧扰。山风掠过千峰翠谷，是体验古代边陲孤寂与万里山河壮魄的独家时刻。",
    },
  },
  {
    id: "temple-of-heaven",
    nameZh: "天坛祈年殿",
    nameEn: "Temple of Heaven",
    locationZh: "东城 · 天坛路",
    coordinates: "39.8822° N, 116.4066° E",
    image: "/assets/temple-of-heaven.jpg",
    depthMap: "/depth/temple-of-heaven.png",
    aspectRatio: "1280 / 853",
    defaultHour: 12.0,
    timeNotes: {
      dawn: "清晨六点半，古柏苍翠掩映间，祈年殿圆形蓝顶初沐晨光，空灵澄澈。",
      noon: "正午十二点，纯净高天之下，三重蓝琉璃瓦顶与三层汉白玉台基晶莹素洁，天圆地方之境至此圆满。",
      sunset: "傍晚五点半，暖金暮光侧映石雕华表，长影斑驳，祈谷古意悠远深长。",
      night: "入夜八点，天幕如洗，蓝调深邃，圆殿庄严独立，东方空间哲学的沉静回响。",
    },
    poeticEssay:
      "天圆地方，汉白玉阶直上云霄。当正午无影的纯净光线自穹顶垂落，几何的绝对对称化作心灵深处的极致宁静。",
    phenomenon: {
      title: "天心石 · 天地中天日影",
      optimalHour: 12.0,
      timeWindow: "11:50 - 12:20",
      seasonContext: "春分/秋分正午",
      solarAltitude: "49.5° (中天高位)",
      solarAzimuth: "180° (正南无偏角)",
      colorTemp: "5800K (纯净中性日光)",
      physicsPrinciple:
        "太阳直射中天，建筑阴影投射达到极小值。三层汉白玉圆坛基座与三重蓝瓦同心圆在正午高角度光照下呈现近乎绝对的轴对称反光比。",
      observationGuide:
        "驻足丹陛桥正北向南平视，正午的高反差光影剥离了一切多余色彩，只剩天空深蓝、琉璃宝顶与白玉台基，东方几何神圣秩序呼之欲出。",
    },
  },
  {
    id: "summer-palace",
    nameZh: "颐和园",
    nameEn: "The Summer Palace",
    locationZh: "海淀 · 昆明湖畔",
    coordinates: "39.9999° N, 116.2755° E",
    image: "/assets/summer-palace.jpg",
    depthMap: "/depth/summer-palace.png",
    aspectRatio: "1280 / 1934",
    defaultHour: 16.5,
    timeNotes: {
      dawn: "清晨六点半，万寿山晨岚初散，昆明湖面波平如镜，画舫泛起第一道涟漪。",
      noon: "正午十二点，佛香阁傲立山峦，长廊千米画卷映衬碧水蓝天，皇家山水无尽明媚。",
      sunset: "傍晚五点半，夕阳斜穿十七孔桥，金光穿洞，水天一色，残霞漫卷如诗。",
      night: "入夜八点，湖水沉入幽蓝，万寿山影与湖畔疏柳交相入梦，晚风微凉。",
    },
    poeticEssay:
      "微风掠过昆明湖，带来晚清皇家园林的最后一抹斜阳。佛香阁前，游船归岸，岁月安然沉入如水暮色之中。",
    phenomenon: {
      title: "十七孔桥 · 金光穿洞",
      optimalHour: 16.5,
      timeWindow: "16:15 - 16:50",
      seasonContext: "冬至日前后二十天",
      solarAltitude: "6.2° (低斜阳)",
      solarAzimuth: "224° (南偏西精准入射)",
      colorTemp: "2600K (深红金光)",
      physicsPrinciple:
        "古代匠人精密天文布局：冬至日前后太阳落山方位角恰好与桥洞轴线平行，阳光贯通17个石拱桥洞，水面二次折射将拱券内壁全部照亮成赤金隧道。",
      observationGuide:
        "避开南湖岛拥挤长焦机位，于十七孔桥东侧堤岸轻驻。金光灌满桥孔仅持续约25分钟，是人造工程与宇宙天体运行完美契合的奇迹。",
    },
  },
  {
    id: "nanluoguxiang",
    nameZh: "什刹海与后海",
    nameEn: "Shichahai & Nanluo",
    locationZh: "东城 · 老城街巷",
    coordinates: "39.9372° N, 116.4031° E",
    image: "/assets/nanluoguxiang.jpg",
    depthMap: "/depth/nanluoguxiang.png",
    aspectRatio: "1280 / 960",
    defaultHour: 18.5,
    timeNotes: {
      dawn: "清晨六点半，鸽哨掠过灰瓦四合院上空，胡同口升起早点炊烟，老北京最朴素的日常。",
      noon: "正午十二点，老槐树荫洒下斑驳光斑，深巷静谧，四合院如意门门簪古朴温润。",
      sunset: "傍晚五点半，银锭桥头落日融金，水波泛舟，垂柳拂面，游人意态悠闲。",
      night: "入夜八点，沿河红灯笼次第亮起，暖光与水影融为一处，温婉市井烟火流连不绝。",
    },
    poeticEssay:
      "暮色笼罩什刹海柳岸，青砖灰瓦间一盏盏红灯笼悄然亮起。没有喧嚣，只有北京城最温润、最真实的呼吸。",
    phenomenon: {
      title: "银锭桥头 · 蓝调观山",
      optimalHour: 18.5,
      timeWindow: "18:20 - 18:50",
      seasonContext: "夏秋天高云淡时",
      solarAltitude: "-4.2° (航海暮光蓝调)",
      solarAzimuth: "272° (正西)",
      colorTemp: "8800K (纯净青蓝冷调)",
      physicsPrinciple:
        "太阳沉入西山地平线下，天空臭氧层吸收红黄波段，瑞利散射主导天空呈现深邃天蓝（Blue Hour），而地面红灯笼（2200K）与水面形成高质感冷暖色彩对冲。",
      observationGuide:
        "站在银锭桥栏旁西望，远山如黛横卧水尽头。此时喧嚣尚未到达顶峰，微风吹拂水柳，最能体会清代《日下旧闻考》中‘银锭观山’的意境。",
    },
  },
  {
    id: "798",
    nameZh: "798 艺术区",
    nameEn: "798 Art District",
    locationZh: "朝阳 · 酒仙桥",
    coordinates: "39.9842° N, 116.4947° E",
    image: "/assets/798.jpg",
    depthMap: "/depth/798.png",
    aspectRatio: "1280 / 960",
    defaultHour: 11.5,
    timeNotes: {
      dawn: "清晨六点半，包豪斯锯齿形厂房在晨光中投下几何斜影，工业遗存静候前沿灵感。",
      noon: "正午十二点，天窗漫射天光照亮画廊白墙，雕塑与当代画布在静默中对话。",
      sunset: "傍晚五点半，斑驳砖墙与金属管道披上暖色，艺术与市井在黄昏里交融。",
      night: "入夜八点，霓虹与灯箱隐于幽暗街角，先锋与自由在夜色中继续沉吟。",
    },
    poeticEssay:
      "红砖厂房与锯齿天窗，记录着工业与艺术的跨时空交汇。静驻于此，体会古老帝都与现代先锋的精神共鸣。",
    phenomenon: {
      title: "锯齿天窗 · 极简漫射场",
      optimalHour: 11.5,
      timeWindow: "10:30 - 13:30",
      seasonContext: "四季晴空无云日",
      solarAltitude: "45.0° (高角度)",
      solarAzimuth: "165° (南向直射避让)",
      colorTemp: "6200K (恒定冷白漫射)",
      physicsPrinciple:
        "东德包豪斯几何设计：锯齿形弧顶北向开窗，彻底阻隔刺眼的直射眩光，仅采集天空漫射散射光，车间内部光照度在白昼高度均匀恒定。",
      observationGuide:
        "步入七星中街老厂房画廊，抬头观赏连续混凝土抛物线屋架。柔和无影的光线抚平一切浮躁，是体会理性工业结构与当代艺术共振的黄金时段。",
    },
  },
];

export interface VisualChapter {
  id: string;
  chapterNumber: string;
  title: string;
  subtitle: string;
  image: string;
  essay: string;
  details: string;
  targetSpotId: string;
  targetHour: number;
}

export const VISUAL_CHAPTERS: VisualChapter[] = [
  {
    id: "chapter-forbidden",
    chapterNumber: "第壹章",
    title: "暮色紫禁 · 六百年的沉思",
    subtitle: "FORBIDDEN CITY · DUSK",
    image: "/assets/forbidden-city.jpg",
    targetSpotId: "forbidden-city",
    targetHour: 17.5,
    essay:
      "当斜阳缓缓落入西山，紫禁城的重檐庑殿顶镀上了一层流转的暖金。红墙如血，金瓦如火，神武门外的护城河水静静流淌。站在景山之巅南望，中轴线上的重重宫阙在暮色中渐渐沉寂。六百年的兴衰沉浮，都在这一抹斜阳里化作了天地间的从容与静谧。",
    details: "明永乐十八年至今 · 中轴线宫殿建筑群 · 经纬度 39.91° N, 116.40° E",
  },
  {
    id: "chapter-great-wall",
    chapterNumber: "第贰章",
    title: "晨雾雄关 · 苍山古意",
    subtitle: "GREAT WALL · DAWN",
    image: "/assets/great-wall.jpg",
    targetSpotId: "great-wall",
    targetHour: 6.5,
    essay:
      "清晨，微风拂动燕山群峰的林海。薄雾如轻纱缭绕在崇山峻岭之间，朝阳的第一缕暖光穿透云岚，轻轻拂过斑驳的城砖与烽火台。没有如织的游人，唯有鸟鸣与山风穿行于箭楼空窗。千年的边关风云已散，留下的唯有苍山如海、残阳如血的苍茫气魄与岁月安宁。",
    details: "北齐至明代修筑 · 怀柔慕田峪 · 经纬度 40.43° N, 116.57° E",
  },
  {
    id: "chapter-temple",
    chapterNumber: "第叁章",
    title: "晴空素境 · 东方空间秩序",
    subtitle: "TEMPLE OF HEAVEN · HARMONY",
    image: "/assets/temple-of-heaven.jpg",
    targetSpotId: "temple-of-heaven",
    targetHour: 12.0,
    essay:
      "天圆地方，是古人对宇宙最纯粹的想象。正午的高天碧空如洗，祈年殿的三重蓝琉璃瓦在阳光下晶莹剔透，三层汉白玉圆台如云海托起天阙。这里没有繁复逼仄的装饰，只有绝对的几何对称与空灵的广袤空间。漫步于古柏树荫间，心灵仿佛也在这一方天地中找到了久违的澄澈与安放。",
    details: "明永乐十八年始建 · 皇家祭天坛庙 · 经纬度 39.88° N, 116.41° E",
  },
];
