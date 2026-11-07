export type CorridorId =
  | "cn-to-seoul"
  | "global-to-beijing"
  | "cn-to-tokyo"
  | "cn-to-bangkok";

export interface CorridorMeta {
  id: CorridorId;
  city: string;
  country: string;
  code: string;
  flag: string;
  region: "asia" | "europe" | "americas";
  visaTag: string;
  status: "available" | "coming-soon";
  highlights: string[];
}

export const CORRIDOR_METAS: CorridorMeta[] = [
  {
    id: "cn-to-seoul",
    city: "首尔 Seoul",
    country: "韩国",
    code: "ICN",
    flag: "🇰🇷",
    region: "asia",
    visaTag: "贴纸签/电子签",
    status: "available",
    highlights: ["AREX快线直达", "WOWPASS换汇卡", "双语出租车卡"],
  },
  {
    id: "global-to-beijing",
    city: "北京 Beijing",
    country: "中国",
    code: "PKX",
    flag: "🇨🇳",
    region: "asia",
    visaTag: "144h过境免签",
    status: "available",
    highlights: ["故宫东华门捷径", "支付宝外卡无感", "皇城中轴3D"],
  },
  {
    id: "cn-to-tokyo",
    city: "东京 Tokyo",
    country: "日本",
    code: "HND",
    flag: "🇯🇵",
    region: "asia",
    visaTag: "单次/多次电子签",
    status: "available",
    highlights: ["iPhone直绑Suica", "成田Skyliner", "新宿站迷宫动线"],
  },
  {
    id: "cn-to-bangkok",
    city: "曼谷 Bangkok",
    country: "泰国",
    code: "BKK",
    flag: "🇹🇭",
    region: "asia",
    visaTag: "中泰永久互免签",
    status: "available",
    highlights: ["免签白名单丝滑", "Grab/Bolt打车防宰", "郑王庙日落机位"],
  },
];

export const UPCOMING_CITIES = [
  {
    city: "新加坡 Singapore",
    country: "新加坡",
    code: "SIN",
    flag: "🇸🇬",
    tag: "30天互免签证",
    votes: 3842,
  },
  {
    city: "大阪 Osaka",
    country: "日本",
    code: "KIX",
    flag: "🇯🇵",
    tag: "关西机场Haruka",
    votes: 2950,
  },
  {
    city: "巴黎 Paris",
    country: "法国",
    code: "CDG",
    flag: "🇫🇷",
    tag: "戴高乐RER防盗",
    votes: 2410,
  },
  {
    city: "伦敦 London",
    country: "英国",
    code: "LHR",
    flag: "🇬🇧",
    tag: "伊丽莎白线直达",
    votes: 1890,
  },
];

export interface TimelineStep {
  window: string;
  title: string;
  painPoint: string;
  solution: string;
  actionTag: string;
  affiliateUrl: string;
  affiliateLabel: string;
  image: string;
}

export interface AppMapping {
  category: string;
  originApp: string;
  whyItFails: string;
  localChampion: string;
  setupGuide: string;
  proTip: string;
}

export interface SpatialHotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  detail: string;
  cameraPreset: { yaw: number; pitch: number; zoom: number };
}

export interface TrajectoryWaypoint {
  step: number;
  title: string;
  hint: string;
  cameraPreset: { yaw: number; pitch: number; zoom: number };
}

export interface TemporalComparison {
  labelA: string;
  labelB: string;
  descA: string;
  descB: string;
}

export interface WorldModelScene {
  id: string;
  name: string;
  subtitle: string;
  coordinates: string;
  elevation: string;
  image: string;
  splatPalette: [string, string, string];
  bestTime: string;
  bookingRule: string;
  spatialSummary: string;
  hotspots: SpatialHotspot[];
  trajectoryWaypoints?: TrajectoryWaypoint[];
  temporalComparison?: TemporalComparison;
}

export interface DriverCard {
  id: string;
  tag: string;
  titleCn: string;
  localHeadline: string;
  phoneticOrSub: string;
  driverInstruction: string;
  subwayBackup: string;
}

export interface StayDistrict {
  name: string;
  vibe: string;
  priceRange: string;
  transitAccess: string;
  bestFor: string;
}

export interface CorridorConfig {
  id: CorridorId;
  originLabel: string;
  destinationCity: string;
  destinationCountry: string;
  heroHeadline: string;
  heroSubheadline: string;
  touchdownAirports: string;
  emergencyNumber: string;
  currencyInfo: string;
  plugType: string;
  timeline: TimelineStep[];
  appMatrix: AppMapping[];
  worldScenes: WorldModelScene[];
  driverCards: DriverCard[];
  stayDistricts: StayDistrict[];
}

export const CORRIDORS: Record<CorridorId, CorridorConfig> = {
  "cn-to-seoul": {
    id: "cn-to-seoul",
    originLabel: "中国大陆出发旅客",
    destinationCity: "首尔 Seoul",
    destinationCountry: "韩国 South Korea",
    heroHeadline: "TERRA · 首尔落地生存",
    heroSubheadline:
      "解决第一次去韩国下飞机后的四大断层：国内手机卡断网、Google 地图无法步行导航、路边摊与公交不支持微信支付、不懂韩语无法打车排队。通过 Web 3D 高斯点云世界模型，在出发前预演仁川机场动线、景福宫中轴与圣水洞街区。",
    touchdownAirports: "仁川国际机场 (ICN T1/T2) · 金浦国际机场 (GMP)",
    emergencyNumber: "1330 (韩国旅游发展局 24h 中文人工翻译与求助热线)",
    currencyInfo: "韩元 KRW · 1,000 KRW 约合 5.3 RMB",
    plugType: "德标两圆孔 (Type C / F, 220V) · 需备转换插头",
    timeline: [
      {
        window: "落地后第 0 至 20 分钟 · 廊桥与入境厅",
        title: "机舱落地与原生 eSIM 激活",
        painPoint:
          "国内手机号国际漫游不仅资费高，部分韩国本土排队系统（如 CatchTable）需要韩国本土网络或邮箱验证。",
        solution:
          "起飞前扫码安装 Airalo 韩国 LG U+ / SKT 原生 eSIM（落地关闭飞行模式即满格 5G），或在仁川到达厅 KT 柜台凭护照两分钟激活实体卡。",
        actionTag: "原生 5G 低延迟通道",
        affiliateUrl: "https://www.airalo.com/south-korea-esim",
        affiliateLabel: "获取韩国 LG U+ 5G eSIM 离线包",
        image: "/images/seoul-incheon-real.jpg",
      },
      {
        window: "落地后第 25 至 45 分钟 · B1 交通层",
        title: "WOWPASS 换汇与交通卡",
        painPoint:
          "虽然明洞免税店支持支付宝，但韩国全境地铁、公交、九成以上的圣水洞独立咖啡馆与烤肉店仅接受韩元 IC 芯片卡或 T-money。",
        solution:
          "下到仁川机场 B1 层 AREX 铁路入口处，在橙色自助机用护照与人民币或支付宝直接申领一张 WOWPASS 卡：兼具预付 IC 借记卡与 T-money 交通卡芯片。",
        actionTag: "消费与地铁双芯片合一",
        affiliateUrl: "https://www.wowpass.io/?lang=zh_CN",
        affiliateLabel: "预订仁川机场 WOWPASS 自提码",
        image: "/images/seoul-gyeongbokgung-real.jpg",
      },
      {
        window: "落地后第 45 至 70 分钟 · 进城列车",
        title: "Naver 中文导航与打车",
        painPoint:
          "受韩国国家测绘法规限制，Google Maps 在韩国境内无法提供任何步行路线规划与驾车导航，高德或百度在首尔亦无实时小巷数据。",
        solution:
          "立即打开 Naver Map（在设置中切换为简体中文，可直接搜中文地名），并打开 Kakao T 打车软件（勾选 Pay to Driver 即可下车刷 WOWPASS 或付现）。",
        actionTag: "本土高精度中文导航",
        affiliateUrl: "https://map.naver.com",
        affiliateLabel: "加载首尔热门机位 Naver 收藏夹",
        image: "/images/seoul-seongsu-real.jpg",
      },
      {
        window: "落地后第 75 至 120 分钟 · 核心商圈入住",
        title: "仁川快轨直达与住宿选区",
        painPoint:
          "仁川机场 B1 层东西两侧分别是橙色 AREX 直达列车（仅停首尔站）与蓝色普通列车（经停弘大入口），走错闸机耽误 40 分钟。",
        solution:
          "住弘大或延南洞直接刷 T-money 进蓝色普通列车闸机（52 分钟直达弘大入口站）；住明洞或东大门刷码进橙色直达快线（43 分钟到首尔站）。",
        actionTag: "43 分钟直达首尔核心",
        affiliateUrl: "https://www.klook.com/zh-CN/activity/1163-airport-railroad-arex-incheon-seoul/",
        affiliateLabel: "预订 AREX 仁川机场直达快线票",
        image: "/images/seoul-city-real.jpg",
      },
    ],
    appMatrix: [
      {
        category: "步行与地铁路线导航",
        originApp: "高德地图 / 百度地图 / Google Maps",
        whyItFails: "Google 地图在韩国被锁死步行与驾车导航；国内地图无首尔地铁出口电梯与小巷数据。",
        localChampion: "Naver Map 中文版",
        setupGuide: "打开软件后进入左上角菜单 Settings，在 Language 中选择简体中文界面。",
        proTip: "搜索店铺时如果不确定韩文名，可直接在下方出租车大字卡复制韩文原名粘贴检索。",
      },
      {
        category: "城市出租车即时叫车",
        originApp: "滴滴出行",
        whyItFails: "韩国街头招手拦车极难（多数已被网约锁定），夜间弘大与江南更难路边拦车。",
        localChampion: "Kakao T 与 Uber UT",
        setupGuide: "用国内手机号收验证码注册 Kakao T，叫车选 General Taxi，支付方式右滑选 Pay to Driver。",
        proTip: "Uber 在韩国会自动切换为与 SK 合作的 UT 出租车网络，原绑定的外币卡可直接扣款。",
      },
      {
        category: "餐厅排队取号与防跑空",
        originApp: "大众点评 / 美团排队",
        whyItFails: "首尔网红烤肉、伦敦贝果博物馆、圣水洞热门餐厅全部采用门口 CatchTable 平板取号。",
        localChampion: "CatchTable 国际版",
        setupGuide: "无需韩国本土手机号，直接用邮箱注册 CatchTable Global 即可远程查看实时排队并取号。",
        proTip: "热门店（如金猪食堂、London Bagel）建议在出发去门店前 45 分钟直接在软件内线上抢号。",
      },
      {
        category: "菜单识别与无障碍沟通",
        originApp: "普通英汉词典",
        whyItFails: "韩国大量地道老店仅有韩文手写墙面菜单，通用翻译器对韩式料理专有名词翻译不准。",
        localChampion: "Naver Papago",
        setupGuide: "开启图片实时涂抹翻译与双人语音对话模式，提前下载韩中离线语言包。",
        proTip: "点餐遇到两份起订（2인분）是韩国烤肉店常规规则，Papago 拍照可一秒识别。",
      },
    ],
    worldScenes: [
      {
        id: "seoul-gyeongbokgung",
        name: "景福宫与光化门皇家轴线",
        subtitle: "Gyeongbokgung Palace & Gwanghwamun Spatial Twin",
        coordinates: "37.5796° N, 126.9770° E",
        elevation: "海拔 42 米 · 85° 广角体素",
        image: "/images/seoul-gyeongbokgung-real.jpg",
        splatPalette: ["#ff5a26", "#f4a261", "#38bdf8"],
        bestTime: "上午 09:30 至 11:00（守门将换岗仪式 10:00 与 14:00，周二闭馆）",
        bookingRule: "穿传统韩服可免门票直接从光化门东侧专用通道入园；普通门票 3,000 韩元现场即买。",
        spatialSummary:
          "三维世界模型视窗还原了光化门广场、勤政殿双层丹青飞檐与背后北岳山花岗岩山脊的空间景深关系。拖动视角可预演从地铁景福宫站出站、租借韩服、光化门换岗机位至庆会楼倒影池的无折返动线。",
        hotspots: [
          {
            id: "gwanghwamun-gate",
            x: 34,
            y: 52,
            label: "光化门换岗机位",
            detail: "每日 10:00 与 14:00 举行皇家守门将换岗。最佳机位在光化门城门正南方偏东 15 米，以北岳山为背景仰拍。",
            cameraPreset: { yaw: -22, pitch: 8, zoom: 1.15 },
          },
          {
            id: "geunjeongjeon-hall",
            x: 52,
            y: 38,
            label: "勤政殿丹青中轴",
            detail: "利用早间侧逆光拍摄双层重檐与花岗岩品阶石，避开旅行团大部队请走西侧回廊框架取景。",
            cameraPreset: { yaw: 0, pitch: 14, zoom: 1.28 },
          },
          {
            id: "gyeonghoeru-pavilion",
            x: 71,
            y: 46,
            label: "庆会楼水面镜像",
            detail: "景福宫出片率最高机位。站在池塘西岸石栏处，用标准或两倍焦段对称构图拍摄庆会楼与松树倒影。",
            cameraPreset: { yaw: 28, pitch: 6, zoom: 1.2 },
          },
        ],
        temporalComparison: {
          labelA: "1890 历史王朝旧貌",
          labelB: "2026 现代首尔孪生",
          descA: "李氏朝鲜时期未烧毁前木结构原貌，丹青朱红与北岳山荒野相映。",
          descB: "三维点云高精度重建后的现代景福宫，首尔中轴线现代摩天楼与皇家宫殿空间交叠。",
        },
        trajectoryWaypoints: [
          {
            step: 1,
            title: "地铁3号线景福宫站5号口出站",
            hint: "出站沿国立古宫博物馆长廊步行2分钟直达光化门东门",
            cameraPreset: { yaw: -35, pitch: 6, zoom: 1.1 },
          },
          {
            step: 2,
            title: "光化门守门将换岗广场",
            hint: "每日10:00与14:00，最佳站位在城楼正南偏东15米避开逆光",
            cameraPreset: { yaw: -18, pitch: 10, zoom: 1.2 },
          },
          {
            step: 3,
            title: "勤政殿双层丹青御道中轴",
            hint: "穿过兴礼门进入主殿，走西侧廊道可拍到无游客前景框景",
            cameraPreset: { yaw: 0, pitch: 14, zoom: 1.28 },
          },
          {
            step: 4,
            title: "庆会楼倒影池与出口",
            hint: "西侧池畔拍完倒影，直接从神武门出宫去青瓦台或三清洞",
            cameraPreset: { yaw: 26, pitch: 8, zoom: 1.22 },
          },
        ],
      },
      {
        id: "seoul-seongsu",
        name: "圣水洞红砖买手街区",
        subtitle: "Seongsu-dong Red-Brick Industrial & Flagship District",
        coordinates: "37.5446° N, 127.0560° E",
        elevation: "海拔 18 米 · 街景尺度点云",
        image: "/images/seoul-seongsu-real.jpg",
        splatPalette: ["#f97316", "#eab308", "#38bdf8"],
        bestTime: "上午 11:00 至 17:30（建议工作日或周末 11:00 首批进店）",
        bookingRule: "Dior 圣水玻璃花房外景拍照无需预约；Tamburins 与 ADER Error 现场直接排队入场。",
        spatialSummary:
          "被称为首尔布鲁克林的旧鞋厂工业区。通过三维空间模型可直观查看地铁圣水站出站后，沿着演武场街串联 Cafe Onion 废墟露台、Dior 圣水概念店与 Tamburins 下沉水泥展厅的最短步行闭环。",
        hotspots: [
          {
            id: "dior-seongsu",
            x: 48,
            y: 44,
            label: "Dior 金属玻璃花房",
            detail: "演武场街核心地标。下午四点后暖色灯光亮起时在街对角斑马线旁拍摄建筑全貌最出片。",
            cameraPreset: { yaw: -12, pitch: 10, zoom: 1.22 },
          },
          {
            id: "tamburins-flagship",
            x: 68,
            y: 54,
            label: "Tamburins 水泥展厅",
            detail: "与 Dior 仅隔一条马路。支持现场直接办理免税退税（请随身携带实体护照原件）。",
            cameraPreset: { yaw: 20, pitch: 4, zoom: 1.18 },
          },
          {
            id: "onion-rooftop",
            x: 29,
            y: 58,
            label: "Onion 废墟工厂露台",
            detail: "圣水站 2 号口步行 3 分钟。招牌雪山面包配美式咖啡，二楼露台保留了七十年代红砖厂房结构。",
            cameraPreset: { yaw: -28, pitch: 12, zoom: 1.12 },
          },
        ],
      },
      {
        id: "seoul-incheon-arex",
        name: "仁川机场地下交通枢纽",
        subtitle: "Incheon Touchdown B1F Transit & WOWPASS Hub",
        coordinates: "37.4602° N, 126.4407° E",
        elevation: "地下一层 · 零摩擦换乘走廊",
        image: "/images/seoul-incheon-real.jpg",
        splatPalette: ["#38bdf8", "#22d3ee", "#ff5a26"],
        bestTime: "全天候 05:20 至 23:30（末班快轨 22:48 与 23:38）",
        bookingRule: "橙色直达快线需对号入座；蓝色普通列车直接刷 T-money 或 WOWPASS 进站。",
        spatialSummary:
          "第一次去首尔最容易迷路的就是仁川机场入境后从一层下到地下一层交通中心。本三维视窗标定了自动扶梯落点、WOWPASS 自助发卡机、CU 便利店以及橙蓝双色闸机的精确空间方位。",
        hotspots: [
          {
            id: "wowpass-kiosk",
            x: 38,
            y: 56,
            label: "WOWPASS 自助发卡机",
            detail: "位于 AREX 售票处旁。插入护照与人民币百元现钞或预约码，一分钟吐出实体卡。",
            cameraPreset: { yaw: -18, pitch: 6, zoom: 1.2 },
          },
          {
            id: "arex-orange-gate",
            x: 62,
            y: 42,
            label: "橙色直达快线闸机",
            detail: "全程 43 分钟中途不停靠直达首尔站，提供免费无线网与指定座位，适合住明洞与东大门旅客。",
            cameraPreset: { yaw: 16, pitch: 10, zoom: 1.25 },
          },
          {
            id: "arex-blue-gate",
            x: 76,
            y: 58,
            label: "蓝色普通列车闸机",
            detail: "直接刷交通卡进站，无需买指定席票，52 分钟直达年轻旅客最集中的弘大入口站。",
            cameraPreset: { yaw: 30, pitch: 5, zoom: 1.15 },
          },
        ],
      },
    ],
    driverCards: [
      {
        id: "kr-hongdae",
        tag: "弘大商圈与民宿核心区",
        titleCn: "送我到弘大入口站 9 号口",
        localHeadline: "기사님, 홍대입구역 9번 출구 앞으로 가주세요.",
        phoneticOrSub: "Hongdae-ipgu-yeok 9-beon chulgu · Mapo-gu, Seoul",
        driverInstruction: "감사합니다! 카드(티머니/신용카드) 결제할게요. (谢谢师傅！我将使用交通卡或银行卡刷卡支付)",
        subwayBackup: "地铁路线：机场快线或地铁 2 号线【弘大入口站】9 号口出",
      },
      {
        id: "kr-myeongdong",
        tag: "明洞换汇与免税百货中心",
        titleCn: "送我到明洞乐天百货总店",
        localHeadline: "기사님, 명동 롯데백화점 본점 앞으로 가주세요.",
        phoneticOrSub: "Lotte Department Store Main Branch · Jung-gu, Seoul",
        driverInstruction: "트렁크 좀 열어주시겠어요? 감사합니다! (麻烦帮我打开一下后备箱，非常感谢！)",
        subwayBackup: "地铁路线：地铁 2 号线【乙支路入口站】7 号口出",
      },
      {
        id: "kr-seongsu",
        tag: "圣水洞买手店与咖啡街",
        titleCn: "送我到圣水洞 Dior 概念店",
        localHeadline: "기사님, 성수동 디올성수(연무장길 7) 앞으로 가주세요.",
        phoneticOrSub: "7 Yeonmujang-gil, Seongdong-gu, Seoul (Dior Seongsu)",
        driverInstruction: "여기서 세워주세요. 감사합니다! (请在这里靠边停一下即可，谢谢！)",
        subwayBackup: "地铁路线：地铁 2 号线【圣水站】4 号口步行 350 米",
      },
      {
        id: "kr-gyeongbokgung",
        tag: "景福宫光化门正门",
        titleCn: "送我到景福宫光化门正门",
        localHeadline: "기사님, 경복궁 정문(광화문 앞)으로 가주세요.",
        phoneticOrSub: "161 Sajik-ro, Jongno-gu, Seoul (Gyeongbokgung Palace)",
        driverInstruction: "광화문 우측 하차장에 내려주세요. (请在光化门右侧落客区停靠，谢谢！)",
        subwayBackup: "地铁路线：地铁 3 号线【景福宫站】4 号或 5 号口即达",
      },
      {
        id: "kr-icn-airport",
        tag: "返程赶飞机（仁川航站楼）",
        titleCn: "送我到仁川国际机场出发层",
        localHeadline: "기사님, 인천국제공항 출국장으로 가주세요.",
        phoneticOrSub: "Incheon International Airport Departure Level (T1 / T2)",
        driverInstruction: "비행기 시간이 급해서 빠른 길로 부탁드립니다. (航班较紧，麻烦走高速快线)",
        subwayBackup: "备选快轨：首尔站或弘大入口站搭乘 AREX 机场快线准点不堵车",
      },
    ],
    stayDistricts: [
      {
        name: "弘大与延南洞片区",
        vibe: "潮流街区 · 独立咖啡馆 · 深夜烤肉与街头演出",
        priceRange: "¥550 - ¥1,100 / 晚",
        transitAccess: "AREX 机场铁路 52 分钟免换乘直达 + 地铁 2 号环线核心",
        bestFor: "第一次去首尔的年轻旅客、看重机场直达免搬行李过楼梯的自由行玩家",
      },
      {
        name: "明洞与乙支路片区",
        vibe: "百货免税店 · 大使馆换汇街 · 步行去南山塔与景福宫",
        priceRange: "¥680 - ¥1,500 / 晚",
        transitAccess: "地铁 2 号线与 4 号线双轨交汇，机场大巴 6015 路直达酒店门口",
        bestFor: "家庭出游、首次赴韩需要全中文购物环境与高密度换汇所的旅客",
      },
      {
        name: "圣水与汉南江南片区",
        vibe: "买手店旗舰建筑 · 艺术美术馆 · 精致高端餐饮",
        priceRange: "¥900 - ¥2,400 / 晚",
        transitAccess: "地铁 2 号线东段与过江大桥，打车往返各旗舰店 10 分钟内",
        bestFor: "注重审美体验、冲着设计师品牌、建筑摄影与精品探店而来的深度玩家",
      },
    ],
  },
  "global-to-beijing": {
    id: "global-to-beijing",
    originLabel: "国际入境旅客与国内自由行",
    destinationCity: "北京 Beijing",
    destinationCountry: "中国 China · 皇城中轴线",
    heroHeadline: "TERRA · 北京皇城中轴",
    heroSubheadline:
      "由 testUi-1 北京旅游地点工程全面升维改造：不仅为入境旅客一键打通 Alipay 外卡支付、大兴与首都机场快轨和 BEIJING PASS，更内置故宫太和殿、颐和园昆明湖、什刹海钟鼓楼的三维高斯点云空间漫游舱，终结故宫抢不到票与走冤枉路排长队的痛点。",
    touchdownAirports: "北京大兴国际机场 (PKX) · 北京首都国际机场 (PEK T2/T3)",
    emergencyNumber: "12345 (北京市多语种市民服务热线) / 110",
    currencyInfo: "人民币 CNY · 全城 99% 普及移动扫码支付 (Alipay / WeChat Pay)",
    plugType: "国标两扁与三扁插头 (Type A / I, 220V)",
    timeline: [
      {
        window: "落地后第 0 至 20 分钟 · 首都与大兴机场",
        title: "跨境双栈联网与免签通关",
        painPoint:
          "海外入境旅客落地后若使用普通本地电话卡，无法打开国际邮箱与海外银行软件接收信用卡支付验证码。",
        solution:
          "国际旅客落地前启用 Airalo China eSIM（自带合规漫游网关，同时秒开支付宝、高德与海外邮箱）；国内旅客直接开启亿通行或支付宝地铁乘车码。",
        actionTag: "双栈无感漫游网络",
        affiliateUrl: "https://www.airalo.com/china-esim",
        affiliateLabel: "获取中国大陆全网通 5G eSIM",
        image: "/images/beijing-forbidden-city.jpg",
      },
      {
        window: "落地后第 20 至 45 分钟 · 机场轨道交通层",
        title: "支付宝外卡直绑与乘车码",
        painPoint:
          "北京从胡同小吃摊、故宫饮水机到出租车均已全面普及二维码支付，只带外币现金在街头寸步难行。",
        solution:
          "打开支付宝切换为国际版，直接绑定 Visa 或 Mastercard 外卡（单笔 200 元以内免收 3% 手续费）；在北京地铁闸机可直接拍外卡或刷乘车码通行。",
        actionTag: "一部手机刷遍北京地铁",
        affiliateUrl: "https://www.trip.com/guide/info/alipay-for-foreigners.html",
        affiliateLabel: "查看支付宝外卡免手续费绑定指南",
        image: "/images/beijing-summer-palace.jpg",
      },
      {
        window: "落地后第 45 至 75 分钟 · 核心景区预约",
        title: "故宫提前预约与东华门捷径",
        painPoint:
          "无数游客直接打车到天安门或故宫门口，才发现当天门票早已售罄，且误入天安门广场安检排队长达 90 分钟。",
        solution:
          "故宫博物院每晚八点放第 7 天票，务必提前实名预约。已约好故宫门票请直接打车定位故宫东华门，沿筒子河步行 8 分钟直达午门检票口，完美绕开广场安检长队。",
        actionTag: "东华门免排广场安检",
        affiliateUrl: "https://www.trip.com/travel-guide/attraction/beijing/the-palace-museum-75595/",
        affiliateLabel: "预订故宫与颐和园官方实名联票",
        image: "/images/beijing-shichahai.jpg",
      },
      {
        window: "落地后第 75 至 120 分钟 · 皇城入住",
        title: "机场快轨换乘与二环交通",
        painPoint:
          "晚高峰北京二环、三环与长安街地面交通极易拥堵，且故宫与南锣鼓巷周边胡同严禁网约车随意停靠。",
        solution:
          "大兴机场搭乘大兴机场线 19 分钟直达草桥站换乘 19 号线；首都机场搭乘首都机场线 20 分钟直达东直门或北新桥（簋街美食中心）。",
        actionTag: "轨道优先避开二环拥堵",
        affiliateUrl: "https://www.trip.com/hotels/beijing-hotel-list-1/",
        affiliateLabel: "查看北京二环地铁口四合院与酒店清单",
        image: "/images/seoul-gyeongbokgung.jpg",
      },
    ],
    appMatrix: [
      {
        category: "皇城胡同与地铁出口导航",
        originApp: "Google Maps",
        whyItFails: "Google Maps 在中国大陆存在坐标偏移，且无实时地铁换乘车厢引导。",
        localChampion: "高德地图英文版与 Apple Maps",
        setupGuide: "海外手机打开高德地图可切换为英文界面；iPhone 用户进入北京后自带地图会自动切换为高德高精度数据。",
        proTip: "在北京坐地铁换乘一定要看高德提示的进站第几节车厢离换乘扶梯最近，可少走几百米通道。",
      },
      {
        category: "全城网约车与出租车呼叫",
        originApp: "Uber / Lyft / Kakao T",
        whyItFails: "Uber 国际版在中国大陆无法叫车，且在故宫与什刹海路边很难拦到空驶出租车。",
        localChampion: "支付宝内置滴滴出行小程序",
        setupGuide: "打开支付宝首页点击出行或 DiDi，支持全英文输入起点终点，司乘聊天消息自动中英互译。",
        proTip: "从故宫神武门出来时切勿在正门口叫车（全路段禁停），请步行至景山公园西门再发单。",
      },
      {
        category: "铜锅涮肉与北京烤鸭排队",
        originApp: "Yelp / TripAdvisor",
        whyItFails: "四季民福烤鸭、南门涮肉、聚宝源在饭点现场排队往往超过两小时。",
        localChampion: "大众点评与微信远程取号",
        setupGuide: "下午三点半逛故宫到一半时，直接在大众点评或四季民福公众号线上取晚市号。",
        proTip: "四季民福故宫东华门店靠窗位可直接看到东华门城楼与护城河，务必提前线上取小桌号。",
      },
      {
        category: "景点门票实名预约中枢",
        originApp: "现场售票窗口买票",
        whyItFails: "北京一类文博场馆已全面取消现场散客纸质售票窗口，未提前预约无法入场。",
        localChampion: "Trip.com 与故宫官方小程序",
        setupGuide: "持中国身份证用微信小程序；持外国护照或港澳台证件推荐直接用 Trip.com 一键录入预约。",
        proTip: "如果故宫实在没抢到票，景山公园加太庙（劳动人民文化宫，同规格金丝楠木大殿，现场可买票）是最强平替。",
      },
    ],
    worldScenes: [
      {
        id: "beijing-forbidden-city",
        name: "故宫太和殿至景山中轴线",
        subtitle: "Forbidden City Central Meridian & Jingshan Overlook",
        coordinates: "39.9163° N, 116.3972° E",
        elevation: "海拔 52 米 · 世界文化遗产核心",
        image: "/images/beijing-forbidden-city.jpg",
        splatPalette: ["#f59e0b", "#ef4444", "#fbbf24"],
        bestTime: "上午 08:30 第一批检票入园 或 15:00 后夕阳斜照红墙",
        bookingRule: "提前 7 天 20:00 实名抢票（旺季 ¥60 / 淡季 ¥40），周一闭馆。务必携带身份证或护照原件。",
        spatialSummary:
          "基于 testUi-1 北京地标库升级的三维高斯空间场景。完整呈现东华门筒子河捷径、午门五凤楼、太和殿丹陛石、珍宝馆九龙壁、神武门出宫至景山公园万春亭俯瞰紫禁城琉璃瓦海的黄金四小时立体动线。",
        hotspots: [
          {
            id: "donghuamen-shortcut",
            x: 24,
            y: 62,
            label: "东华门筒子河捷径",
            detail: "打车到故宫东华门，沿护城河柳树步道走 8 分钟直达午门检票口，省去天安门广场一小时安检排队。",
            cameraPreset: { yaw: -26, pitch: 6, zoom: 1.16 },
          },
          {
            id: "hall-of-supreme-harmony",
            x: 52,
            y: 42,
            label: "太和殿须弥座中轴",
            detail: "中国现存最大木结构宫殿。建议站在太和殿广场西侧弘义阁回廊台阶上，利用廊柱做前景框景拍摄。",
            cameraPreset: { yaw: 0, pitch: 12, zoom: 1.3 },
          },
          {
            id: "jingshan-wanchunting",
            x: 74,
            y: 28,
            label: "景山万春亭制高点",
            detail: "从故宫神武门出来过地下通道即达景山公园南门，登顶万春亭向南俯瞰整座紫禁城金顶与中轴线落日。",
            cameraPreset: { yaw: 24, pitch: 22, zoom: 1.24 },
          },
        ],
        temporalComparison: {
          labelA: "太和殿午间晴空明净",
          labelB: "景山万春亭夕阳落日",
          descA: "早间08:30第一批入宫，太和殿广场空旷无游人，金色琉璃瓦在顺光下纯净威严。",
          descB: "傍晚16:30登顶景山万春亭，金光横扫紫禁城万间殿宇，中轴线壮阔落日景致。",
        },
        trajectoryWaypoints: [
          {
            step: 1,
            title: "打车直达东华门避开安检长队",
            hint: "沿东华门筒子河向西步行8分钟直抵午门检票口，省去天安门广场1小时排队",
            cameraPreset: { yaw: -26, pitch: 6, zoom: 1.16 },
          },
          {
            step: 2,
            title: "午门检票与太和门金水桥",
            hint: "刷身份证或护照秒进，走中轴内金水桥拍摄午门五凤楼倒影",
            cameraPreset: { yaw: -10, pitch: 10, zoom: 1.2 },
          },
          {
            step: 3,
            title: "太和殿须弥座与弘义阁回廊",
            hint: "立于太和殿西侧回廊台阶，以朱红立柱作框景仰拍三重檐大殿",
            cameraPreset: { yaw: 0, pitch: 12, zoom: 1.3 },
          },
          {
            step: 4,
            title: "神武门出宫直登景山万春亭",
            hint: "出神武门过地道进景山南门，步行10分钟登顶俯瞰整座故宫全景",
            cameraPreset: { yaw: 24, pitch: 22, zoom: 1.24 },
          },
        ],
      },
      {
        id: "beijing-summer-palace",
        name: "颐和园昆明湖与十七孔桥",
        subtitle: "Summer Palace Kunming Lake & Longevity Hill Spatial Twin",
        coordinates: "39.9999° N, 116.2755° E",
        elevation: "海拔 68 米 · 皇家山水园林",
        image: "/images/beijing-summer-palace.jpg",
        splatPalette: ["#34d399", "#38bdf8", "#f59e0b"],
        bestTime: "下午 15:30 至 18:00（冬至前后下午四点十七孔桥出现金光穿洞奇观）",
        bookingRule: "联票 ¥60（含大门票、佛香阁、德和园、苏州街），支持现场扫码或提前预约，刷证件秒进。",
        spatialSummary:
          "颐和园面积相当于四个故宫，选错大门会多走一万步。三维空间模型标定了两条最优动线：想拍十七孔桥日落请直接从新建宫门入园；想俯瞰昆明湖请从地铁北宫门站入园翻越万寿山至佛香阁。",
        hotspots: [
          {
            id: "seventeen-arch-bridge",
            x: 36,
            y: 58,
            label: "十七孔桥金光穿洞",
            detail: "从新建宫门进园步行 3 分钟即达铜牛与十七孔桥东端。傍晚斜阳将桥洞全部照亮成金色。",
            cameraPreset: { yaw: -20, pitch: 8, zoom: 1.22 },
          },
          {
            id: "foxiangge-tower",
            x: 58,
            y: 32,
            label: "万寿山佛香阁全景",
            detail: "全园视觉核心。登上八角三层四重檐的佛香阁平台，可将昆明湖、南湖岛与西山玉泉山尽收眼底。",
            cameraPreset: { yaw: 8, pitch: 18, zoom: 1.28 },
          },
          {
            id: "painted-boat-dock",
            x: 72,
            y: 54,
            label: "石舫古画舫游船处",
            detail: "走完 728 米彩绘长廊后，可在石舫码头乘画舫直接横渡昆明湖返回南湖岛，免走回头路。",
            cameraPreset: { yaw: 26, pitch: 6, zoom: 1.15 },
          },
        ],
      },
      {
        id: "beijing-shichahai",
        name: "什刹海钟鼓楼与胡同肌理",
        subtitle: "Shichahai Lake, Bell-Drum Towers & Siheyuan Alleys",
        coordinates: "39.9405° N, 116.3887° E",
        elevation: "海拔 46 米 · 老北京水系胡同",
        image: "/images/beijing-shichahai.jpg",
        splatPalette: ["#ff5a26", "#f43f5e", "#38bdf8"],
        bestTime: "下午 16:30 至 21:00（傍晚蓝调时刻鼓楼亮灯与什刹海晚风）",
        bookingRule: "什刹海历史文化街区、烟袋斜街、银锭桥全天免费开放；登钟鼓楼联票 ¥30。",
        spatialSummary:
          "老北京先有什刹海后有北京城的水系胡同活化石。三维模型串联起地铁什刹海站、鼓楼红墙机位、烟袋斜街、银锭桥观山与前海荷花市场摇橹船（冬季为什刹海冰场）的沉浸漫游路线。",
        hotspots: [
          {
            id: "drum-tower-axis",
            x: 32,
            y: 40,
            label: "地安门外鼓楼红墙",
            detail: "北京中轴线北端点。站在鼓楼东大街路口斑马线安全岛，用长焦镜头拍出胡同电车与宏伟鼓楼同框。",
            cameraPreset: { yaw: -18, pitch: 14, zoom: 1.25 },
          },
          {
            id: "yinding-bridge",
            x: 54,
            y: 52,
            label: "银锭桥前海交汇处",
            detail: "燕京小八景之一银锭观山，桥旁就是百年老字号烤肉季与南门涮肉什刹海店。",
            cameraPreset: { yaw: 4, pitch: 8, zoom: 1.2 },
          },
          {
            id: "shichahai-boating",
            x: 75,
            y: 60,
            label: "荷花市场码头四合院",
            detail: "夏秋乘摇橹船听船夫讲恭王府与胡同典故；冬季湖面结冰后变身老北京什刹海滑冰车冰场。",
            cameraPreset: { yaw: 24, pitch: 6, zoom: 1.15 },
          },
        ],
      },
      {
        id: "beijing-great-wall",
        name: "慕田峪长城山脊与敌楼",
        subtitle: "Mutianyu Great Wall Watchtowers & Ridge Spatial Twin",
        coordinates: "40.4319° N, 116.5704° E",
        elevation: "海拔 540 米 · 燕山山脉脊线",
        image: "/images/beijing-pulse/great-wall.jpg",
        splatPalette: ["#10b981", "#f59e0b", "#38bdf8"],
        bestTime: "上午 08:30 首批缆车登城 或 15:30 夕阳顺光拍大角楼",
        bookingRule: "门票 ¥40 + 往返缆车 ¥140（14号敌楼直达）或索道滑道组合，外国护照免预约现场即刷。",
        spatialSummary:
          "相比八达岭游客密度低 60%，植被覆盖率达 90%。三维模型清晰标定了北检票口、14 号敌楼缆车落点、20 号好汉坡制高点以及 6 号敌楼旱地滑道下山的体能最优闭环。",
        hotspots: [
          {
            id: "mutianyu-tower-14",
            x: 34,
            y: 52,
            label: "14号敌楼封闭缆车站",
            detail: "带老人小孩或摄影器材首选路线：乘封闭厢式缆车 6 分钟直达 14 号敌楼平台，零台阶起步。",
            cameraPreset: { yaw: -20, pitch: 12, zoom: 1.2 },
          },
          {
            id: "mutianyu-tower-20",
            x: 64,
            y: 28,
            label: "20号好汉坡山脊制高点",
            detail: "慕田峪最高点，回望 14 至 20 号敌楼如巨龙盘踞层林山脊，长焦 70mm 压缩感极佳。",
            cameraPreset: { yaw: 18, pitch: 20, zoom: 1.32 },
          },
          {
            id: "mutianyu-toboggan",
            x: 76,
            y: 64,
            label: "6号敌楼旱地雪橇滑道",
            detail: "从 14 号敌楼往东下坡走到 6 号敌楼，乘坐全长 1.58 公里的不锈钢滑道 5 分钟直滑山脚。",
            cameraPreset: { yaw: 28, pitch: 6, zoom: 1.15 },
          },
        ],
      },
      {
        id: "beijing-temple-of-heaven",
        name: "天坛祈年殿与丹陛桥",
        subtitle: "Temple of Heaven Hall of Prayer for Good Harvests",
        coordinates: "39.8822° N, 116.4066° E",
        elevation: "海拔 43 米 · 明清祭天坛庙",
        image: "/images/beijing-pulse/temple-of-heaven.jpg",
        splatPalette: ["#38bdf8", "#f43f5e", "#fbbf24"],
        bestTime: "上午 08:00 开殿第一时间 或 周五周六晚间亮灯时刻",
        bookingRule: "务必购买 ¥34 联票（含祈年殿、回音壁、圜丘），只买 ¥15 大门票无法进入祈年殿内坛。",
        spatialSummary:
          "三维空间模型复刻了三层汉白玉祈谷坛与宝顶鎏金三重檐圆形大殿。清晰展示东门进、祈年殿、丹陛桥神道、回音壁、圜丘坛至南门出（旁邻南门涮肉总店）的顺畅动线。",
        hotspots: [
          {
            id: "qiniandian-triple-eaves",
            x: 50,
            y: 36,
            label: "祈年殿三重蓝琉璃瓦",
            detail: "站在祈年门汉白玉栏杆正中央低机位仰拍，可将三重蓝瓦金顶与纯白汉白玉底座拍出神圣对称感。",
            cameraPreset: { yaw: 0, pitch: 15, zoom: 1.28 },
          },
          {
            id: "danbiqiao-axis",
            x: 32,
            y: 62,
            label: "丹陛桥祭天古神道",
            detail: "长 360 米的高出地面 4 米大道，中间为神道、东为御道、西为王道，漫步其上有漫步云端之感。",
            cameraPreset: { yaw: -22, pitch: 8, zoom: 1.18 },
          },
          {
            id: "echo-wall-yuanqiu",
            x: 72,
            y: 56,
            label: "回音壁与圜丘天心石",
            detail: "出南门步行 200 米即是正宗老北京铜锅涮肉代表『宏源南门涮肉』天坛总店。",
            cameraPreset: { yaw: 24, pitch: 10, zoom: 1.2 },
          },
        ],
      },
    ],
    driverCards: [
      {
        id: "bj-donghuamen",
        tag: "故宫最快检票捷径（绕开广场安检）",
        titleCn: "送我到故宫东华门落客区",
        localHeadline: "师傅您好，请送我到【故宫东华门】路口落客区。",
        phoneticOrSub: "Donghuamen Gate of the Forbidden City · Dongcheng District",
        driverInstruction: "下车后沿着筒子河红墙往西走 8 分钟就是故宫午门检票口，不用排天安门广场安检长队。",
        subwayBackup: "地铁路线：地铁 8 号线【金鱼胡同站】C 口出，步行至东华门",
      },
      {
        id: "bj-jingshan",
        tag: "俯瞰故宫全景制高点",
        titleCn: "送我到景山公园西门",
        localHeadline: "师傅您好，请送我到【景山公园西门】（景山西街）。",
        phoneticOrSub: "West Gate of Jingshan Park · Xicheng District, Beijing",
        driverInstruction: "注：故宫神武门外大街全线禁停网约车，定位景山公园西门最容易上下车。",
        subwayBackup: "地铁路线：地铁 8 号线【什刹海站】或 6 号线【北海北站】",
      },
      {
        id: "bj-summer-palace",
        tag: "颐和园十七孔桥最近入口",
        titleCn: "送我到颐和园新建宫门",
        localHeadline: "师傅您好，请送我到【颐和园新建宫门】（昆明湖东岸）。",
        phoneticOrSub: "Xinjian Gongmen Gate, Summer Palace · Haidian District",
        driverInstruction: "进新建宫门走 150 米就是铜牛和十七孔桥，看日落最快不费腿。",
        subwayBackup: "地铁路线：地铁 4 号线【北宫门站】D 口（适合从山上往下逛）",
      },
      {
        id: "bj-shichahai",
        tag: "鼓楼与什刹海胡同起点",
        titleCn: "送我到地安门外鼓楼路口",
        localHeadline: "师傅您好，请送我到【钟鼓楼广场 / 地安门外大街鼓楼路口】。",
        phoneticOrSub: "Drum Tower (Gulou) Crossroads · Dongcheng District",
        driverInstruction: "下车先拍鼓楼机位，再顺着烟袋斜街一路逛到什刹海银锭桥和后海。",
        subwayBackup: "地铁路线：地铁 8 号线【什刹海站】A2 出口即达烟袋斜街与鼓楼",
      },
      {
        id: "bj-daxing-airport",
        tag: "返程赶飞机（大兴与首都机场）",
        titleCn: "送我到大兴或首都机场出发层",
        localHeadline: "师傅您好，请送我到【大兴机场四层出发 / 首都机场 T3 出发】。",
        phoneticOrSub: "Beijing Daxing (PKX) / Capital Airport (PEK T3) Departures",
        driverInstruction: "上车请务必跟师傅再次核对您的机票是 PKX（大兴）还是 PEK（首都顺义），两座机场相距 65 公里。",
        subwayBackup: "地铁路线：地铁草桥站换乘【大兴机场线】（19 分钟直达航站楼）",
      },
    ],
    stayDistricts: [
      {
        name: "王府井与东四皇城片区",
        vibe: "步行可达故宫东华门 · 精品四合院酒店与五星酒店聚集",
        priceRange: "¥650 - ¥1,800 / 晚",
        transitAccess: "地铁 5 号线与 8 号线核心，去天安门、故宫、美术馆均在 15 分钟内",
        bestFor: "第一次来北京的国内外游客、带父母孩子出行、希望早上第一批轻松进故宫的旅客",
      },
      {
        name: "什刹海与北新桥胡同片区",
        vibe: "老北京胡同烟火气 · 钟鼓楼与簋街宵夜 · 首都机场线终点",
        priceRange: "¥500 - ¥1,300 / 晚",
        transitAccess: "首都机场线直达北新桥站 + 地铁 2/5/6/8 号线四通八达",
        bestFor: "喜欢胡同文化、精酿咖啡、铜锅涮肉与首都机场落地免换乘直达的玩家",
      },
      {
        name: "前门大栅栏与草桥南轴线",
        vibe: "百年老字号步行街 · 天坛公园旁 · 大兴机场快线直通",
        priceRange: "¥450 - ¥1,100 / 晚",
        transitAccess: "地铁 2/7/8 号线交汇，往南直通大兴国际机场草桥枢纽",
        bestFor: "从大兴机场或北京南站抵京、想沉浸感受京剧茶馆与天坛晨练的旅客",
      },
    ],
  },
  "cn-to-tokyo": {
    id: "cn-to-tokyo",
    originLabel: "中国大陆出发旅客",
    destinationCity: "东京 Tokyo",
    destinationCountry: "日本 Japan",
    heroHeadline: "TERRA · 东京落地生存",
    heroSubheadline:
      "解决成田/羽田落地三大痛点：成田Skyliner与Access特急买错票多花1小时、iPhone快速无损绑定Suica西瓜卡免排队、新宿地下三层巨大迷宫换乘第一视角空间预演。",
    touchdownAirports: "羽田国际机场 (HND) · 成田国际机场 (NRT T1/T2)",
    emergencyNumber: "#7119 (急救医疗咨询) / 110",
    currencyInfo: "日元 JPY · 1,000 JPY 约合 47.8 RMB",
    plugType: "两脚扁插头 (Type A, 100V) · 手机充电无需转换头",
    timeline: [
      {
        window: "落地后第 0 至 20 分钟 · 航站楼",
        title: "Apple 钱包开通移动西瓜卡 (Suica)",
        painPoint: "实体西瓜卡因全球芯片短缺曾长期断供，机场人工排队买票耗时30分钟以上。",
        solution: "iPhone无需下载任何App，在自带【钱包】点击右上角加号，搜索【交通卡 ➔ Suica】，直接用国内万事达或Visa外币卡充值2000日元即刻刷机过闸。",
        actionTag: "Apple Wallet 零等待激活",
        affiliateUrl: "https://www.jreast.co.jp/e/pass/suica.html",
        affiliateLabel: "查看Suica西瓜卡绑卡图解",
        image: "/images/seoul-street-real.jpg",
      },
      {
        window: "落地后第 25 至 50 分钟 · 铁道站台",
        title: "京成 Skyliner 直达日暮里与上野",
        painPoint: "成田机场站台列车种类繁多，误上普通各停慢车需耗时近2小时才能进城。",
        solution: "住上野/浅草/银座认准【Skyliner 特急】，36分钟无折返直达日暮里（换乘山手线极快）；住涩谷/新宿可乘成田特快 N'EX 直达。",
        actionTag: "36分钟直达山手线环线",
        affiliateUrl: "https://www.keisei.co.jp/keisei/tetudou/skyliner/cn/",
        affiliateLabel: "预订 Skyliner 快速折扣车票",
        image: "/images/seoul-city-real.jpg",
      },
      {
        window: "落地后第 50 至 90 分钟 · 地铁枢纽",
        title: "新宿站地下迷宫第一视角导航",
        painPoint: "新宿站每日吞吐350万人次，拥有200余个出口，高德与Google均无法精准定位地下楼层。",
        solution: "打开 TERRA 第一视角空间动线，跟随无障碍电梯与JR南口黄色指示标线直接出站，避开西口地下换乘陷阱。",
        actionTag: "空间级地下通道指引",
        affiliateUrl: "https://www.tokyometro.jp/cn/",
        affiliateLabel: "加载东京地铁24/48/72小时通票",
        image: "/images/seoul-incheon-real.jpg",
      },
    ],
    appMatrix: [
      {
        category: "地下铁路线与车厢换乘",
        originApp: "高德地图 / 百度地图",
        whyItFails: "国内地图无东京JR与东京地下铁（Metro/都营）实时换乘最佳车厢与出口步行动线。",
        localChampion: "Yahoo! 乘换案内 与 Google Maps",
        setupGuide: "输入汉字站名（如新宿、涩谷、秋叶原）即可直接查询最少换乘与早发车次。",
        proTip: "注意看【早 / 安 / 乐】三个小标，选择【乐】代表换乘最少不折腾。",
      },
      {
        category: "出租车与夜间打车",
        originApp: "滴滴出行",
        whyItFails: "日本街头出租车起步价高且夜间拦车极难。",
        localChampion: "GO (Taxi) 与 Uber Japan",
        setupGuide: "用国内手机号注册，绑定外币卡扣款，支持预估精准价格。",
        proTip: "深夜如果在六本木或歌舞伎町错过末班电车，可直接在 GO 呼叫定额接送出租车。",
      },
      {
        category: "顶级日料与居酒屋预约",
        originApp: "大众点评",
        whyItFails: "Tabelog 铜牌/银牌餐厅现场不接待临时客，未提前预约无法就座。",
        localChampion: "Tabelog 国际版 与 TableCheck",
        setupGuide: "在网页端直接用邮箱注册 TableCheck，支持中文预订与信用卡担保。",
        proTip: "Tabelog 评分超过 3.5 分在日本就是极品神店，根本无需排小红书网红店。",
      },
    ],
    worldScenes: [
      {
        id: "tokyo-shinjuku-cross",
        name: "新宿站南口与歌舞伎町夜景",
        subtitle: "Shinjuku Station South Exit & Kabukicho 3D Twin",
        coordinates: "35.6895° N, 139.7006° E",
        elevation: "海拔 38 米 · 全球最繁华地下枢纽",
        image: "/images/seoul-street-real.jpg",
        splatPalette: ["#f43f5e", "#0284c7", "#eab308"],
        bestTime: "傍晚 17:30 至 21:00（霓虹灯点亮与蓝调交织时刻）",
        bookingRule: "歌舞伎町街景全天免费开放；SHINJUKU TOKYU MILANO 楼顶展望台现场购票。",
        spatialSummary:
          "三维空间视窗复刻了新宿站南口甲州街道天桥、JR各线换乘扶梯、Lumine商场与歌舞伎町一番街大门的物理空间拓扑关系。",
        hotspots: [
          {
            id: "shinjuku-south-bridge",
            x: 42,
            y: 48,
            label: "南口甲州街道天桥机位",
            detail: "站在天桥上俯瞰JR特急列车穿行与繁华车流，长焦70mm拍摄出极具赛博朋克质感的列车进站画面。",
            cameraPreset: { yaw: -18, pitch: 8, zoom: 1.2 },
          },
          {
            id: "kabukicho-gate",
            x: 65,
            y: 38,
            label: "歌舞伎町一番街霓虹门楼",
            detail: "夜景经典机位，站在斑马线安全岛中央利用广角镜头仰拍大红门楼与哥斯拉头像。",
            cameraPreset: { yaw: 15, pitch: 12, zoom: 1.25 },
          },
        ],
        temporalComparison: {
          labelA: "日间晴朗通透街景",
          labelB: "夜间赛博霓虹蓝调",
          descA: "上午时段新宿站南口阳光明净，适合拍摄建筑线条与电车轨道空间层次。",
          descB: "入夜后全城霓虹招牌点亮，雨后地面反光更具《迷失东京》光影质感。",
        },
        trajectoryWaypoints: [
          {
            step: 1,
            title: "成田快线N'EX下车到达新宿站地下站台",
            hint: "切勿跟随大流下楼梯！抬头寻找【南改札 (South Exit)】黄色指示标志乘直梯上楼",
            cameraPreset: { yaw: -25, pitch: 6, zoom: 1.15 },
          },
          {
            step: 2,
            title: "刷Suica穿过南口人工闸机出站",
            hint: "出闸机即是开阔的甲州街道人行天桥，视野开阔无拥挤感",
            cameraPreset: { yaw: 0, pitch: 10, zoom: 1.22 },
          },
          {
            step: 3,
            title: "沿地面人行道步行8分钟穿过JR铁道天桥",
            hint: "直达歌舞伎町一番街主干道，全程零地下迷路风险",
            cameraPreset: { yaw: 22, pitch: 12, zoom: 1.28 },
          },
        ],
      },
    ],
    driverCards: [
      {
        id: "jp-shinjuku",
        tag: "新宿商圈核心住宿",
        titleCn: "送我到新宿站南口高岛屋百货",
        localHeadline: "運転手さん、新宿駅南口の高島屋前までお願いします。",
        phoneticOrSub: "Shinjuku-eki Minamiguchi Takashimaya-mae made onegaishimasu.",
        driverInstruction: "カード（Suica / クレジットカード）で支払います。(我将使用西瓜卡或信用卡结账，谢谢！)",
        subwayBackup: "备选电车：JR山手线或中央线【新宿站】南口即达",
      },
      {
        id: "jp-ginza",
        tag: "银座步行街与百货区",
        titleCn: "送我到银座四丁目三越百货",
        localHeadline: "運転手さん、銀座四丁目の三越前までお願いします。",
        phoneticOrSub: "Ginza Yonchome Mitsukoshi-mae made onegaishimasu.",
        driverInstruction: "トランクを開けていただけますか？(麻烦帮我开一下后备箱，非常感谢！)",
        subwayBackup: "备选电车：东京地下铁银座线【银座站】A7出口直通三越",
      },
    ],
    stayDistricts: [
      {
        name: "新宿与涩谷片区",
        vibe: "不夜城霓虹 · 潮流旗舰百货 · 交通枢纽四通八达",
        priceRange: "¥900 - ¥2,200 / 晚",
        transitAccess: "JR山手线大站 + N'EX 成田特快免换乘直达",
        bestFor: "年轻自由行玩家、看重夜生活与大站直通的旅客",
      },
      {
        name: "上野与浅草片区",
        vibe: "下町江户风情 · 药妆平价美食 · 机场列车起点",
        priceRange: "¥600 - ¥1,400 / 晚",
        transitAccess: "Skyliner 36分钟直造成田机场 + 银座线始发站",
        bestFor: "高性价比预算游、行李较多看重机场直达的旅客",
      },
    ],
  },
  "cn-to-bangkok": {
    id: "cn-to-bangkok",
    originLabel: "中国大陆出发旅客",
    destinationCity: "曼谷 Bangkok",
    destinationCountry: "泰国 Thailand",
    heroHeadline: "TERRA · 曼谷落地生存",
    heroSubheadline:
      "解决素万那普与廊曼机场下飞机后三大痛点：中泰永久互免签丝滑通关走哪个通道、路边揽客黑车漫天要价防坑、Grab与Bolt叫车价差对比与郑王庙最佳落日机位预演。",
    touchdownAirports: "素万那普国际机场 (BKK) · 廊曼国际机场 (DMK)",
    emergencyNumber: "1155 (泰国旅游警察 24h 中文热线) / 191",
    currencyInfo: "泰铢 THB · 100 THB 约合 21.5 RMB",
    plugType: "美标双扁/两圆插孔 (Type A/C, 220V) · 手机充电器可直插",
    timeline: [
      {
        window: "落地后第 0 至 20 分钟 · 入境边检",
        title: "中泰互免签白名单通道通关",
        painPoint: "许多旅客误排付费落地签（Visa on Arrival）长队浪费40分钟并多花2000铢。",
        solution: "中泰已实行永久互免签证！下飞机直接沿着【Passport Control 护照查验】大通道前行，出示中国护照直接盖章免费入境。",
        actionTag: "永久互免签零费用通道",
        affiliateUrl: "https://www.trip.com/travel-guide/info/thailand-visa-free.html",
        affiliateLabel: "查看泰国入境免签最新通关指引",
        image: "/images/seoul-gyeongbokgung-real.jpg",
      },
      {
        window: "落地后第 25 至 45 分钟 · 交通层",
        title: "B1 机场快线 ARL 避开曼谷大堵车",
        painPoint: "曼谷高峰期进城高速常态化拥堵90分钟以上，且出租车经常拒载或不打表（No Meter）。",
        solution: "下到素万那普 B1 层搭乘机场快线 (Airport Rail Link)，45 泰铢（不到10元人民币）26分钟直达披耶泰站 (Phaya Thai)，无缝换乘 BTS 轻轨避开堵车。",
        actionTag: "26分钟轨道交通直达市区",
        affiliateUrl: "https://www.srtet.co.th/en/",
        affiliateLabel: "加载曼谷天铁BTS与机场快线图",
        image: "/images/seoul-incheon-real.jpg",
      },
    ],
    appMatrix: [
      {
        category: "全城网约车与防宰打车",
        originApp: "滴滴出行",
        whyItFails: "机场一楼出租车常要求固定一口价（500-800铢），夜间常不打表。",
        localChampion: "Grab 与 Bolt 双平台比价",
        setupGuide: "国内手机号直接注册，绑定支付宝或外币卡，着急选 Grab，省钱选 Bolt（便宜30%）。",
        proTip: "机场出发层四楼叫车比一楼便宜，且司乘碰面更快。",
      },
      {
        category: "移动扫码支付与免手续费",
        originApp: "国内普通储蓄卡取现",
        whyItFails: "泰国ATM机每笔取现强制扣除220泰铢（约合48元人民币）当地银行手续费。",
        localChampion: "支付宝与微信跨境支付",
        setupGuide: "曼谷全境7-11便利店、商场百货与BTS轻轨购票机全面支持支付宝汇率直扣。",
        proTip: "街头夜市摊位认准蓝色 PromptPay 码，支持部分国内电子钱包扫码付。",
      },
    ],
    worldScenes: [
      {
        id: "bangkok-wat-arun",
        name: "郑王庙黎明寺与湄南河日落",
        subtitle: "Wat Arun & Chao Phraya River Sunset Spatial Twin",
        coordinates: "13.7437° N, 100.4888° E",
        elevation: "海拔 12 米 · 暹罗大乘舍利塔",
        image: "/images/seoul-city-real.jpg",
        splatPalette: ["#f59e0b", "#06b6d4", "#f43f5e"],
        bestTime: "下午 16:45 至 18:30（夕阳将陶瓷佛塔染成金色与对岸蓝调时刻）",
        bookingRule: "门票 200 泰铢现场购买（附赠一瓶饮用水）；穿短裤无袖需在门口租披肩方可入内。",
        spatialSummary:
          "三维空间视窗还原了82米高黎明寺主塔、彩瓷浮雕、湄南河摆渡船码头以及对岸沿河景观咖啡馆的对望景深空间。",
        hotspots: [
          {
            id: "wat-arun-main-spire",
            x: 48,
            y: 42,
            label: "郑王庙主塔陡峭台阶",
            detail: "近距离仰拍彩瓷拼接浮雕，站在第二层平台向东可拍摄湄南河游船与主塔金顶同框。",
            cameraPreset: { yaw: 0, pitch: 16, zoom: 1.25 },
          },
          {
            id: "chao-phraya-sunset-deck",
            x: 75,
            y: 54,
            label: "湄南河对岸日落观景位",
            detail: "乘5泰铢横渡摆渡船到东岸（Tha Tien码头旁咖啡馆），长焦拍摄落日恰好落入郑王庙塔尖的绝美剪影。",
            cameraPreset: { yaw: 28, pitch: 8, zoom: 1.2 },
          },
        ],
        temporalComparison: {
          labelA: "午后白瓷光泽明亮",
          labelB: "傍晚夕阳落日金辉",
          descA: "日间强光下陶瓷浮雕花纹细节极其清晰，适合特写雕刻与泰服人像。",
          descB: "傍晚六点落日将佛塔染成绚丽金红色，对岸酒吧灯火点亮，氛围感拉满。",
        },
        trajectoryWaypoints: [
          {
            step: 1,
            title: "地铁MRT其木站或郑王庙专属渡口上岸",
            hint: "由东岸Tha Tien码头花5泰铢坐摆渡轮，3分钟直达寺庙专用码头",
            cameraPreset: { yaw: -22, pitch: 6, zoom: 1.15 },
          },
          {
            step: 2,
            title: "售票处购票并穿戴合格服饰入园",
            hint: "持中国护照直接扫码支付200铢门票，入口处免费领取饮用水",
            cameraPreset: { yaw: -5, pitch: 12, zoom: 1.2 },
          },
          {
            step: 3,
            title: "主塔第二层观景台与落日机位",
            hint: "沿台阶缓步登上中央塔身，面朝西方湄南河迎接落日辉光",
            cameraPreset: { yaw: 24, pitch: 14, zoom: 1.28 },
          },
        ],
      },
    ],
    driverCards: [
      {
        id: "th-wat-arun",
        tag: "郑王庙核心景区",
        titleCn: "送我到郑王庙正门入口",
        localHeadline: "พี่คนขับครับ ไปส่งที่ วัดอรุณราชวราราม นะครับ ขอบคุณครับ",
        phoneticOrSub: "Pii khon khap khrap, bpai song tee Wat Arun na khrap, khawp khun khrap.",
        driverInstruction: "กรุณาเปิดมิเตอร์ด้วยนะครับ (请帮我按打表计费，非常感谢！)",
        subwayBackup: "备选交通：MRT蓝线【Itsaraphap站】2号口步行10分钟即达",
      },
      {
        id: "th-bkk-airport",
        tag: "赶飞机返程（素万那普）",
        titleCn: "送我到素万那普国际机场四层出发大厅",
        localHeadline: "พี่คนขับครับ ไปส่งที่ สนามบินสุวรรณภูมิ ชั้น 4 ขาออก นะครับ",
        phoneticOrSub: "Suvarnabhumi Airport Departure Level 4, khawp khun khrap.",
        driverInstruction: "ขึ้นทางด่วนได้เลยครับ ผมจ่ายค่าทางด่วนเอง (请走高速公路，高速过路费由我承担)",
        subwayBackup: "备选快轨：披耶泰站搭乘 ARL 机场快线直达航站楼",
      },
    ],
    stayDistricts: [
      {
        name: "素坤逸与暹罗商圈 (Sukhumvit / Siam)",
        vibe: "现代百货核心 · BTS天铁交汇 · 购物夜市极度便利",
        priceRange: "¥400 - ¥1,200 / 晚",
        transitAccess: "BTS 绿色主线贯穿，步行去各大商场免晒太阳",
        bestFor: "第一次来曼谷、喜欢逛街与美食咖啡馆的自由行玩家",
      },
      {
        name: "湄南河畔度假片区 (Riverside)",
        vibe: "五星奢华度假 · 壮阔河景晚风 · 游船穿梭两岸",
        priceRange: "¥900 - ¥2,800 / 晚",
        transitAccess: "酒店专属摆渡船往返 Sathorn 码头与郑王庙",
        bestFor: "看重度假体验、情侣出游与摄影爱好者的深度优选",
      },
    ],
  },
};
