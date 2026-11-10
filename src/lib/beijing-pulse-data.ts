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
    defaultHour: 17.5,
    timeNotes: {
      dawn: "清晨六点半，万寿山晨岚初散，昆明湖面波平如镜，画舫泛起第一道涟漪。",
      noon: "正午十二点，佛香阁傲立山峦，长廊千米画卷映衬碧水蓝天，皇家山水无尽明媚。",
      sunset: "傍晚五点半，夕阳斜穿十七孔桥，金光穿洞，水天一色，残霞漫卷如诗。",
      night: "入夜八点，湖水沉入幽蓝，万寿山影与湖畔疏柳交相入梦，晚风微凉。",
    },
    poeticEssay:
      "微风掠过昆明湖，带来晚清皇家园林的最后一抹斜阳。佛香阁前，游船归岸，岁月安然沉入如水暮色之中。",
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
    defaultHour: 20.0,
    timeNotes: {
      dawn: "清晨六点半，鸽哨掠过灰瓦四合院上空，胡同口升起早点炊烟，老北京最朴素的日常。",
      noon: "正午十二点，老槐树荫洒下斑驳光斑，深巷静谧，四合院如意门门簪古朴温润。",
      sunset: "傍晚五点半，银锭桥头落日融金，水波泛舟，垂柳拂面，游人意态悠闲。",
      night: "入夜八点，沿河红灯笼次第亮起，暖光与水影融为一处，温婉市井烟火流连不绝。",
    },
    poeticEssay:
      "暮色笼罩什刹海柳岸，青砖灰瓦间一盏盏红灯笼悄然亮起。没有喧嚣，只有北京城最温润、最真实的呼吸。",
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
    defaultHour: 12.0,
    timeNotes: {
      dawn: "清晨六点半，包豪斯锯齿形厂房在晨光中投下几何斜影，工业遗存静候前沿灵感。",
      noon: "正午十二点，天窗漫射天光照亮画廊白墙，雕塑与当代画布在静默中对话。",
      sunset: "傍晚五点半，斑驳砖墙与金属管道披上暖色，艺术与市井在黄昏里交融。",
      night: "入夜八点，霓虹与灯箱隐于幽暗街角，先锋与自由在夜色中继续沉吟。",
    },
    poeticEssay:
      "红砖厂房与锯齿天窗，记录着工业与艺术的跨时空交汇。静驻于此，体会古老帝都与现代先锋的精神共鸣。",
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
