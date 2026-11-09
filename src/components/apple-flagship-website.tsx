"use client";

import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { WorldModelViewport } from "@/components/world-model-viewport";
import { CORRIDORS, type CorridorId, type DriverCard } from "@/lib/corridors-data";
import { buildFallbackPlan, type GeneratedPlanItem } from "@/lib/survival-engine";

interface CityQuickFacts {
  id: CorridorId;
  shortName: string;
  fullName: string;
  hub: string;
  currencySymbol: string;
  currencyCode: string;
  rateToRmb: number;
  speechLang: string;
  mentalMathTip: string;
  avoidPitfallTip: string;
  priceBenchmarks: { label: string; amount: string }[];
  extraEmpathyCards: DriverCard[];
}

const CITY_FACTS: CityQuickFacts[] = [
  {
    id: "cn-to-seoul",
    shortName: "首尔",
    fullName: "首尔 Seoul",
    hub: "仁川 ICN · 金浦 GMP",
    currencySymbol: "₩",
    currencyCode: "KRW",
    rateToRmb: 0.0053,
    speechLang: "ko-KR",
    mentalMathTip: "去掉末尾三个零再乘 5.3（例：10,000 韩元 ≈ 53 元人民币）",
    avoidPitfallTip: "Google 地图在韩国无法步行导航，下飞机请立即换用 Naver Map 中文版；景福宫每周二闭馆。",
    priceBenchmarks: [
      { label: "便利店香蕉牛奶", amount: "1800" },
      { label: "圣水洞冰美式", amount: "4500" },
      { label: "AREX 机场快轨", amount: "11000" },
      { label: "双人韩牛烤肉", amount: "65000" },
    ],
    extraEmpathyCards: [
      {
        id: "kr-subway-gate",
        tag: "地铁站务员求助 · 走错闸机",
        titleCn: "我不小心刷错方向了，能帮我开一下门去对面站台吗？",
        localHeadline: "죄송합니다, 반대편 개찰구로 잘못 들어왔어요. 건너갈 수 있을까요?",
        phoneticOrSub: "Joesonghamnida, bandaepyeon gaechalguro jalmot deureowasseoyo.",
        driverInstruction: "请向地铁闸机口的工作人员出示此卡，或按闸机旁的求助按钮。",
        subwayBackup: "韩国地铁多数老站台左右不互通，刷卡前先看清终点站方向",
      },
      {
        id: "kr-dining-card",
        tag: "餐厅点餐与结账沟通",
        titleCn: "请问这里可以刷海外银行卡或 WOWPASS 吗？",
        localHeadline: "여기 해외 카드나 와우패스(WOWPASS)로 결제 가능한가요?",
        phoneticOrSub: "Yeogi haeoe kadeuna WOWPASS-ro gyeolje ganeunghangayo?",
        driverInstruction: "结账前出示给店员确认；韩国几乎所有餐厅均支持 IC 芯片卡刷卡。",
        subwayBackup: "路边鱼饼摊与传统市场请备少量一万韩元纸币",
      },
    ],
  },
  {
    id: "global-to-beijing",
    shortName: "北京",
    fullName: "北京 Beijing",
    hub: "大兴 PKX · 首都 PEK",
    currencySymbol: "¥",
    currencyCode: "CNY",
    rateToRmb: 1.0,
    speechLang: "zh-CN",
    mentalMathTip: "人民币本币计价，全城 99% 场所支持支付宝与微信扫码，地铁可直接刷乘车码",
    avoidPitfallTip: "故宫每周一闭馆且必须提前 7 天 20:00 实名预约；打车定位『故宫东华门』沿筒子河走 8 分钟直达午门，避开天安门正门长队。",
    priceBenchmarks: [
      { label: "豆汁焦圈早餐", amount: "15" },
      { label: "大兴机场草桥快轨", amount: "35" },
      { label: "故宫旺季门票", amount: "60" },
      { label: "四季民福烤鸭双人餐", amount: "260" },
    ],
    extraEmpathyCards: [
      {
        id: "bj-donghuamen-tip",
        tag: "出租车避堵指令 · 故宫捷径",
        titleCn: "师傅麻烦停在故宫东华门外筒子河路口，我不走天安门广场安检",
        localHeadline: "师傅您好，请送我到故宫东华门外路口落客，我们沿筒子河步道走到午门。",
        phoneticOrSub: "Donghuamen Gate · Express Walk to Meridian Gate (Wumen)",
        driverInstruction: "天安门广场散客安检常需排队 60 分钟以上，从东华门步行仅需 8 分钟直达午门检票口。",
        subwayBackup: "备选地铁：地铁 8 号线【金鱼胡同站】C 口出步行 12 分钟",
      },
    ],
  },
  {
    id: "cn-to-tokyo",
    shortName: "东京",
    fullName: "东京 Tokyo",
    hub: "羽田 HND · 成田 NRT",
    currencySymbol: "¥",
    currencyCode: "JPY",
    rateToRmb: 0.048,
    speechLang: "ja-JP",
    mentalMathTip: "直接除以 20（例：1,000 日元 ≈ 48 元人民币；10,000 日元 ≈ 480 元人民币）",
    avoidPitfallTip: "iPhone 打开自带『钱包』点加号即可直接添加 Suica 西瓜卡，无需在机场排队买实体卡；成田进城认准 Skyliner 或 N'EX。",
    priceBenchmarks: [
      { label: "便利店饭团与茶", amount: "450" },
      { label: "一兰拉面标准碗", amount: "1080" },
      { label: "成田 Skyliner 快轨", amount: "2570" },
      { label: "新宿市区出租车", amount: "3200" },
    ],
    extraEmpathyCards: [
      {
        id: "jp-station-help",
        tag: "电车站务员求助 · 找无障碍电梯",
        titleCn: "我带着大件行李，请问去站台的电梯（Elevator）在哪里？",
        localHeadline: "すみません、大きな荷物があります。ホーム行きのエレベーターはどこですか？",
        phoneticOrSub: "Sumimasen, ookina nimotsu ga arimasu. Erebeetaa wa doko desu ka?",
        driverInstruction: "新宿、涩谷等大站台阶极多，向改札口站务员出示此卡可获最近直梯指引。",
        subwayBackup: "手机打开 Google Maps 选择『轮椅无障碍』路线即可只走直梯",
      },
    ],
  },
  {
    id: "cn-to-bangkok",
    shortName: "曼谷",
    fullName: "曼谷 Bangkok",
    hub: "素万那普 BKK · 廊曼 DMK",
    currencySymbol: "฿",
    currencyCode: "THB",
    rateToRmb: 0.215,
    speechLang: "th-TH",
    mentalMathTip: "直接除以 4.7（例：100 泰铢 ≈ 21.5 元人民币；1,000 泰铢 ≈ 215 元人民币）",
    avoidPitfallTip: "中泰已永久互免签证，下飞机直接走『Passport Control』护照查验通道，千万别拐进 Visa on Arrival 落地签长队！",
    priceBenchmarks: [
      { label: "湄南河过江渡轮", amount: "5" },
      { label: "素万那普机场快线", amount: "45" },
      { label: "郑王庙门票", amount: "200" },
      { label: "暹罗商圈泰式按摩", amount: "600" },
    ],
    extraEmpathyCards: [
      {
        id: "th-food-allergy",
        tag: "餐厅与夜市点餐 · 少辣不加香菜",
        titleCn: "请做成微辣，并且不要放香菜，谢谢！",
        localHeadline: "เอาเผ็ดน้อย และไม่ใส่ผักชีนะครับ ขอบคุณครับ",
        phoneticOrSub: "Ao phet noi, lae mai sai phak-chee na khrap. Khawp khun khrap.",
        driverInstruction: "泰国本土菜肴默认极辣且多香菜，点冬阴功或青木瓜沙拉前出示给店员。",
        subwayBackup: "7-11 便利店与大型商场餐厅全面支持支付宝直接扫码结账",
      },
    ],
  },
];

export function AppleFlagshipWebsite() {
  const [currentUrl, setCurrentUrl] = useState<string>("https://terra-world-travel.153557421.workers.dev");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedPlan, setCopiedPlan] = useState<boolean>(false);

  const [activeCity, setActiveCity] = useState<CorridorId>("cn-to-seoul");
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    "cn-to-seoul-0": true,
  });

  const [foreignAmount, setForeignAmount] = useState<string>("10000");
  const [cardSearch, setCardSearch] = useState<string>("");
  const [speakingCardId, setSpeakingCardId] = useState<string | null>(null);
  const [fullscreenCard, setFullscreenCard] = useState<DriverCard | null>(null);

  const [arrivalTime, setArrivalTime] = useState<string>("13:30");
  const [tripDays, setTripDays] = useState<number>(3);
  const [travelerStyle, setTravelerStyle] = useState<string>("第一次去 · 稳妥省心与避坑优先");
  const [hotelDistrict, setHotelDistrict] = useState<string>("弘大入口 / 明洞商圈");
  const [generatedPlan, setGeneratedPlan] = useState<{
    summary: string;
    steps: GeneratedPlanItem[];
  } | null>(() =>
    buildFallbackPlan(
      "cn-to-seoul",
      "13:30",
      3,
      "第一次去 · 稳妥省心与避坑优先",
      "弘大入口 / 明洞商圈"
    )
  );

  // 滚动进场动画观察器
  useEffect(() => {
    const nodes = document.querySelectorAll(".terra-reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.08 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [activeCity]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("terra_checklist_v1");
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, boolean>;
        queueMicrotask(() => setCompletedSteps(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => {
      const next = { ...prev, [stepKey]: !prev[stepKey] };
      try {
        window.localStorage.setItem("terra_checklist_v1", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    const origin =
      typeof window !== "undefined" && window.location.origin.includes("workers.dev")
        ? window.location.origin
        : "https://terra-world-travel.153557421.workers.dev";

    QRCode.toDataURL(origin, {
      width: 440,
      margin: 1,
      color: {
        dark: "#141416",
        light: "#ececee",
      },
    })
      .then((dataUri) => {
        setCurrentUrl(origin);
        setQrCodeDataUrl(dataUri);
      })
      .catch(() => {});
  }, []);

  const corridorData = CORRIDORS[activeCity] ?? CORRIDORS["cn-to-seoul"];
  const cityFact = useMemo(
    () => CITY_FACTS.find((c) => c.id === activeCity) ?? CITY_FACTS[0],
    [activeCity]
  );

  const handleSelectCity = (id: CorridorId) => {
    setActiveCity(id);
    const nextFact = CITY_FACTS.find((c) => c.id === id) ?? CITY_FACTS[0];
    setForeignAmount(nextFact.priceBenchmarks[2]?.amount ?? "1000");
    const defaultArea =
      id === "cn-to-seoul"
        ? "弘大入口 / 明洞商圈"
        : id === "global-to-beijing"
        ? "东直门 / 王府井商圈"
        : id === "cn-to-tokyo"
        ? "新宿南口 / 上野商圈"
        : "暹罗广场 / 素坤逸商圈";
    setHotelDistrict(defaultArea);
    setGeneratedPlan(
      buildFallbackPlan(id, arrivalTime, tripDays, travelerStyle, defaultArea)
    );
  };

  const cnyEquivalent = useMemo(() => {
    const val = parseFloat(foreignAmount) || 0;
    return (val * cityFact.rateToRmb).toFixed(1);
  }, [foreignAmount, cityFact]);

  const allCards = useMemo(() => {
    const merged = [...corridorData.driverCards, ...cityFact.extraEmpathyCards];
    if (!cardSearch.trim()) return merged;
    const q = cardSearch.toLowerCase();
    return merged.filter(
      (c) =>
        c.titleCn.toLowerCase().includes(q) ||
        c.tag.toLowerCase().includes(q) ||
        c.localHeadline.toLowerCase().includes(q) ||
        c.phoneticOrSub.toLowerCase().includes(q)
    );
  }, [corridorData, cityFact, cardSearch]);

  const speakPhrase = (card: DriverCard) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(card.localHeadline);
    u.lang = cityFact.speechLang;
    u.rate = 0.9;
    setSpeakingCardId(card.id);
    u.onend = () => setSpeakingCardId(null);
    u.onerror = () => setSpeakingCardId(null);
    window.speechSynthesis.speak(u);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    }
  };

  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const plan = buildFallbackPlan(
      activeCity,
      arrivalTime,
      tripDays,
      travelerStyle,
      hotelDistrict
    );
    setGeneratedPlan(plan);
  };

  const completedCount = corridorData.timeline.filter(
    (_, idx) => completedSteps[`${activeCity}-${idx}`]
  ).length;

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0c] text-[#f5f5f7]">
      {/* 顶部极简导航栏：统一左右外边距 */}
      <header className="sticky top-0 z-40 bg-[#0a0a0c] py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 sm:px-10">
          <a href="#top" className="text-[18px] font-bold tracking-tight text-[#f5f5f7] no-underline">
            TERRA
          </a>

          <nav aria-label="主导航" className="flex flex-wrap items-center gap-4 sm:gap-7 text-[18px]">
            <a href="#world-model" className="text-[#f5f5f7] hover:text-[#ff6b3d] no-underline">
              实景空间预演
            </a>
            <a href="#touchdown-steps" className="text-[#f5f5f7] hover:text-[#ff6b3d] no-underline">
              落地两小时清单
            </a>
            <a href="#pocket-tools" className="text-[#f5f5f7] hover:text-[#ff6b3d] no-underline">
              算钱与双语卡
            </a>
            <a href="#route-planner" className="text-[#f5f5f7] hover:text-[#ff6b3d] no-underline">
              首日动线定制
            </a>
            <a href="#mobile-handoff" className="terra-btn rounded-full bg-[#ff6b3d] px-5 py-1.5 font-semibold text-[#0a0a0c] no-underline">
              装进手机
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* 第一屏：左对齐大标题 + 城市切换 + 真实 3DGS 空间预演舱 + 安心速查条 */}
        <section id="world-model" className="py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-7 terra-enter">
                <h1 className="text-[36px] sm:text-[80px] font-bold tracking-tight text-[#f5f5f7]">
                  TERRA 落地前先走一遍
                </h1>
                <p className="mt-4 max-w-[58ch] text-[18px] text-[#f5f5f7]">
                  面向跨国自由行的三维空间预演与落地生存向导。基于 World Labs 开源的 3D 高斯泼溅渲染器，在出发前实景走通首尔、北京、东京、曼谷的机场快轨换乘、光影机位与双语打车。
                </p>
              </div>

              {/* 目的地切换器（填满右侧栅格） */}
              <div className="lg:col-span-5 terra-enter rounded-2xl bg-[#141418] p-5">
                <div className="text-[18px] font-semibold text-[#f5f5f7]">
                  选择目的地走廊（全站清单与汇率同步切换）：
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CITY_FACTS.map((c) => {
                    const active = activeCity === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCity(c.id)}
                        className={`terra-btn rounded-full py-2 text-[18px] font-semibold ${
                          active
                            ? "bg-[#ff6b3d] text-[#0a0a0c]"
                            : "bg-[#1e1e24] text-[#f5f5f7]"
                        }`}
                      >
                        {c.shortName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 真实 3DGS 世界模型交互舞台：紧贴首屏标题下方 */}
            <div className="mt-8 terra-reveal">
              <WorldModelViewport
                scenes={corridorData.worldScenes}
                destinationCity={cityFact.shortName}
              />
            </div>

            {/* 贴心安心速查条：不套盒子，采用纯净排版横条 */}
            <dl className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 terra-reveal">
              <div>
                <dt className="text-[18px] font-bold text-[#ff6b3d]">
                  到达枢纽与插座
                </dt>
                <dd className="mt-1 m-0 text-[18px] font-semibold text-[#f5f5f7]">
                  {cityFact.hub}
                </dd>
                <dd className="mt-1 m-0 max-w-[44ch] text-[18px] text-[#d4d4dc]">
                  {corridorData.plugType}
                </dd>
              </div>

              <div>
                <dt className="text-[18px] font-bold text-[#ff6b3d]">
                  物价心算口诀
                </dt>
                <dd className="mt-1 m-0 text-[18px] font-semibold text-[#f5f5f7] tnum">
                  {corridorData.currencyInfo}
                </dd>
                <dd className="mt-1 m-0 max-w-[44ch] text-[18px] text-[#d4d4dc]">
                  {cityFact.mentalMathTip}
                </dd>
              </div>

              <div>
                <dt className="text-[18px] font-bold text-[#ff6b3d]">
                  24 小时中文求助热线
                </dt>
                <dd className="mt-1 m-0 text-[18px] font-semibold text-[#f5f5f7] tnum">
                  {corridorData.emergencyNumber}
                </dd>
                <dd className="mt-1 m-0 max-w-[44ch] text-[18px] text-[#d4d4dc]">
                  遇到迷路、丢护照或司乘纠纷，拨打即有中文翻译介入。
                </dd>
              </div>

              <div>
                <dt className="text-[18px] font-bold text-[#ff6b3d]">
                  落地头号防踩坑提醒
                </dt>
                <dd className="mt-1 m-0 max-w-[44ch] text-[18px] text-[#f5f5f7]">
                  {cityFact.avoidPitfallTip}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* 第二屏：为什么用真实 3D 高斯泼溅扫描，而不是一张静态全景图 */}
        <section className="bg-[#141418] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5 terra-reveal">
                <h2 className="text-[36px] font-bold text-[#f5f5f7]">
                  实景扫描，不止照片
                </h2>
                <p className="mt-4 max-w-[56ch] text-[18px] text-[#f5f5f7]">
                  普通旅游攻略只给你一张修过的打卡照，到了现场才发现站台分不清方向、下午去全是背光。TERRA 引入三维高斯泼溅（3D Gaussian Splatting），把真实物理空间还原为可自由走动的体素场。
                </p>
                <ol className="mt-6 space-y-4 pl-5 text-[18px] text-[#f5f5f7]">
                  <li className="terra-reveal">
                    <strong>任意新视角合成：</strong>右侧两张画面来自同一份 50 万高斯基元扫描（Tanks and Temples 公开站台数据集），从月台正面走到车厢侧后方，遮挡关系与景深实时重算。
                  </li>
                  <li className="terra-reveal">
                    <strong>时段光照在 GPU 上实时推演：</strong>拖动上方时间滑块，50 万个高斯基元同步重算冷暖色温，提前看清几点去最出片。
                  </li>
                  <li className="terra-reveal">
                    <strong>诚实标注数据来源：</strong>三维站台采用公开实测 3DGS 数据集演示空间引擎能力；首尔、北京、东京、曼谷四大走廊配齐实地拍摄照片与实测通关动线。
                  </li>
                </ol>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <figure className="m-0 terra-reveal">
                  <img
                    src="/splats/transit-platform-poster.jpg"
                    alt="同一份 3DGS 实景扫描的视角 A：站台车头正面"
                    width={640}
                    height={360}
                    className="h-52 w-full rounded-xl object-cover terra-drift"
                  />
                  <figcaption className="mt-3 max-w-[50ch] text-[18px] text-[#f5f5f7] tnum">
                    视角 A（坐标 -3.0, 0.1, 3.75）：站在月台落客区正面看列车与路锥。
                  </figcaption>
                </figure>

                <figure className="m-0 terra-reveal">
                  <img
                    src="/splats/transit-platform-view-b.jpg"
                    alt="同一份 3DGS 实景扫描的视角 B：沿轨道走入车厢侧方"
                    width={640}
                    height={360}
                    className="h-52 w-full rounded-xl object-cover"
                  />
                  <figcaption className="mt-3 max-w-[50ch] text-[18px] text-[#f5f5f7] tnum">
                    视角 B（坐标 -5.0, 0.5, 1.0）：在同一个三维体素场中向里走 4 米后的新视角。
                  </figcaption>
                </figure>

                <figure className="m-0 sm:col-span-2 terra-reveal">
                  <video
                    src="/images/spatial-scan-loop.webm"
                    poster="/images/spatial-scan-poster.jpg"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-64 w-full rounded-xl object-cover"
                  />
                  <figcaption className="mt-3 max-w-[60ch] text-[18px] text-[#f5f5f7]">
                    三维空间点云扫描与相机轨迹重建示意：将离散多视角影像融合为可连续漫游的三维辐射场。
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* 第三屏：中性石材亮色底（#ececee）—— 落地头两小时 */}
        <section id="touchdown-steps" className="bg-[#ececee] text-[#141416] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="terra-reveal">
                <h2 className="text-[36px] font-bold text-[#141416]">
                  落地头两小时清单
                </h2>
                <p className="mt-3 max-w-[58ch] text-[18px] text-[#141416]">
                  第一次落地异国机场，最慌乱的就是出舱门到住进酒店的 120 分钟。我们把 {cityFact.fullName} 的通关、换卡、快轨和本土软件拆成一步步可勾选的行动项，进度自动保存在浏览器里。
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {CITY_FACTS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCity(c.id)}
                    className={`terra-btn rounded-full px-4 py-2 text-[18px] font-semibold ${
                      activeCity === c.id
                        ? "bg-[#141416] text-[#ececee]"
                        : "bg-[#dfdfe4] text-[#141416]"
                    }`}
                  >
                    {c.shortName}
                  </button>
                ))}
                <span className="rounded-full bg-[#141416] px-4 py-2 text-[18px] font-semibold text-[#ececee] tnum">
                  已准备 {completedCount} / {corridorData.timeline.length} 项
                </span>
              </div>
            </div>

            {/* 落地步骤：杂志图文并置排版（不堆叠重复卡片框） */}
            <div className="mt-12 space-y-12">
              {corridorData.timeline.map((step, idx) => {
                const stepKey = `${activeCity}-${idx}`;
                const isDone = Boolean(completedSteps[stepKey]);
                return (
                  <article
                    key={step.title}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center terra-reveal"
                  >
                    <div className="lg:col-span-5">
                      <img
                        src={step.image}
                        alt={step.title}
                        width={560}
                        height={340}
                        className="h-60 w-full rounded-2xl object-cover"
                      />
                    </div>

                    <div className="lg:col-span-7">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[18px] font-bold text-[#3c3c44] tnum">
                          {step.window} · {step.actionTag}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleStep(stepKey)}
                          className={`terra-btn rounded-full px-5 py-2 text-[18px] font-semibold ${
                            isDone
                              ? "bg-[#141416] text-[#ececee]"
                              : "bg-[#dfdfe4] text-[#141416]"
                          }`}
                        >
                          {isDone ? "已准备就绪" : "标记为已备好"}
                        </button>
                      </div>

                      <h3 className="mt-3 text-[18px] font-bold text-[#141416]">
                        {step.title}
                      </h3>

                      <p className="mt-2 mb-0 max-w-[60ch] text-[18px] text-[#3c3c44]">
                        常见踩坑：{step.painPoint}
                      </p>

                      <p className="mt-2 mb-0 max-w-[60ch] text-[18px] text-[#141416]">
                        解决动作：{step.solution}
                      </p>

                      <div className="mt-4">
                        <a
                          href={step.affiliateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[18px] font-bold text-[#141416] underline"
                        >
                          {step.affiliateLabel} →
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* 本土必装 App 平替对照（纯净三列排版） */}
            <div className="mt-20 rounded-2xl bg-[#dfdfe4] p-6 sm:p-10 terra-reveal">
              <h3 className="text-[18px] font-bold text-[#141416]">
                {cityFact.shortName}本土软件平替对照（国内习惯软件为何在当地失灵）
              </h3>
              <dl className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {corridorData.appMatrix.map((app) => (
                  <div key={app.category}>
                    <dt className="text-[18px] font-bold text-[#141416]">
                      {app.category} → 换用 {app.localChampion}
                    </dt>
                    <dd className="mt-2 m-0 max-w-[46ch] text-[18px] text-[#3c3c44]">
                      原习惯（{app.originApp}）：{app.whyItFails}
                    </dd>
                    <dd className="mt-2 m-0 max-w-[46ch] text-[18px] text-[#141416]">
                      贴心设置：{app.setupGuide} {app.proTip}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* 第四屏：算钱、问路与打车 */}
        <section id="pocket-tools" className="bg-[#0a0a0c] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="terra-reveal">
              <h2 className="text-[36px] font-bold text-[#f5f5f7]">
                算钱、问路与打车
              </h2>
              <p className="mt-3 max-w-[58ch] text-[18px] text-[#f5f5f7]">
                在便利店结账不知道几个零、在街头拦出租车或走错地铁闸机说不清诉求？左边一键换算当地物价，右边直接播放母语发音或展开全屏大字递给对方看。
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* 左栏：汇率换算与住宿选区 */}
              <div className="lg:col-span-5 rounded-2xl bg-[#141418] p-6 sm:p-8 terra-reveal">
                <h3 className="text-[18px] font-bold text-[#f5f5f7]">
                  {cityFact.shortName}即时汇率与物价标尺
                </h3>
                <p className="mt-2 max-w-[52ch] text-[18px] text-[#d4d4dc]">
                  {cityFact.mentalMathTip}
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-[#1e1e24] p-4">
                    <label htmlFor="terra-currency-input" className="block text-[18px] text-[#d4d4dc]">
                      当地货币 ({cityFact.currencyCode})
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[18px] font-bold text-[#f5f5f7]">
                        {cityFact.currencySymbol}
                      </span>
                      <input
                        id="terra-currency-input"
                        type="number"
                        value={foreignAmount}
                        onChange={(e) => setForeignAmount(e.target.value)}
                        className="w-full bg-transparent text-[18px] font-bold text-[#f5f5f7] tnum focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#1e1e24] p-4">
                    <div className="text-[18px] text-[#d4d4dc]">
                      折合人民币 (RMB)
                    </div>
                    <div className="mt-2 text-[18px] font-bold text-[#ff6b3d] tnum">
                      ¥ {cnyEquivalent}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-[18px] font-semibold text-[#f5f5f7]">
                    常见日常消费（点击直接换算）：
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cityFact.priceBenchmarks.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setForeignAmount(item.amount)}
                        className="terra-btn rounded-full bg-[#1e1e24] px-4 py-2 text-[18px] text-[#f5f5f7] tnum"
                      >
                        {item.label} {cityFact.currencySymbol}
                        {Number(item.amount).toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-[18px] font-bold text-[#f5f5f7]">
                    {cityFact.shortName}住宿片区对比
                  </h3>
                  <dl className="mt-4 space-y-4">
                    {corridorData.stayDistricts.map((d) => (
                      <div key={d.name}>
                        <dt className="text-[18px] font-bold text-[#f5f5f7]">
                          {d.name} · <span className="text-[#ff6b3d] tnum">{d.priceRange}</span>
                        </dt>
                        <dd className="mt-1 m-0 max-w-[50ch] text-[18px] text-[#d4d4dc]">
                          {d.transitAccess}（适合：{d.bestFor}）
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* 右栏：贴心「指指通」双语救急卡（纯净列表，不套多层小盒子） */}
              <div className="lg:col-span-7 rounded-2xl bg-[#141418] p-6 sm:p-8 terra-reveal">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[18px] font-bold text-[#f5f5f7]">
                      双语「指指通」沟通卡（带真人发音与全屏展示）
                    </h3>
                    <p className="mt-1 max-w-[54ch] text-[18px] text-[#d4d4dc]">
                      涵盖热门商圈打车、地铁走错闸机求助、餐厅点餐忌口与结账询问。
                    </p>
                  </div>

                  <div className="w-full sm:w-72">
                    <label htmlFor="terra-card-search" className="sr-only">
                      搜索沟通卡
                    </label>
                    <input
                      id="terra-card-search"
                      type="text"
                      value={cardSearch}
                      onChange={(e) => setCardSearch(e.target.value)}
                      placeholder="搜索地点或场景（如：弘大、电梯）"
                      className="w-full rounded-full bg-[#1e1e24] px-4 py-2 text-[18px] text-[#f5f5f7] placeholder-[#d4d4dc] focus:outline-none"
                    />
                  </div>
                </div>

                <ol className="mt-6 space-y-6 pl-5 text-[18px] text-[#f5f5f7]">
                  {allCards.map((card) => {
                    const isSpeaking = speakingCardId === card.id;
                    return (
                      <li key={card.id}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[18px] font-bold text-[#ff6b3d]">
                            {card.tag} · {card.titleCn}
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => speakPhrase(card)}
                              className="terra-btn rounded-full bg-[#1e1e24] px-4 py-1.5 text-[18px] font-medium text-[#f5f5f7]"
                            >
                              {isSpeaking ? "朗读中..." : "播放发音"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setFullscreenCard(card)}
                              className="terra-btn rounded-full bg-[#f5f5f7] px-4 py-1.5 text-[18px] font-semibold text-[#0a0a0c]"
                            >
                              全屏给对方看
                            </button>
                          </div>
                        </div>

                        <p className="mt-2 mb-0 max-w-[60ch] text-[18px] font-bold text-[#f5f5f7]">
                          {card.localHeadline}
                        </p>
                        <p className="mt-1 mb-0 max-w-[60ch] text-[18px] text-[#d4d4dc]">
                          读音：{card.phoneticOrSub} · {card.subwayBackup}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* 第五屏：按航班落地时间定制首日动线 */}
        <section id="route-planner" className="bg-[#141418] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5 terra-reveal">
                <h2 className="text-[36px] font-bold text-[#f5f5f7]">
                  定制首日落地动线
                </h2>
                <p className="mt-3 max-w-[56ch] text-[18px] text-[#f5f5f7]">
                  早上九点落地和深夜十一点落地，出关后的交通与换汇方案完全不同。填入你的航班预计到达时间与住宿片区，生成可直接复制进备忘录的首日行动表。
                </p>

                <form
                  onSubmit={handleGeneratePlan}
                  className="mt-6 space-y-4 rounded-2xl bg-[#0a0a0c] p-6"
                >
                  <div>
                    <label htmlFor="plan-arrival-time" className="block text-[18px] font-medium text-[#f5f5f7]">
                      航班预计落地时间
                    </label>
                    <input
                      id="plan-arrival-time"
                      type="time"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      className="mt-1.5 w-full rounded-xl bg-[#1e1e24] px-4 py-2.5 text-[18px] text-[#f5f5f7] tnum"
                    />
                  </div>

                  <div>
                    <label htmlFor="plan-trip-days" className="block text-[18px] font-medium text-[#f5f5f7]">
                      停留天数
                    </label>
                    <select
                      id="plan-trip-days"
                      value={tripDays}
                      onChange={(e) => setTripDays(parseInt(e.target.value, 10))}
                      className="mt-1.5 w-full rounded-xl bg-[#1e1e24] px-4 py-2.5 text-[18px] text-[#f5f5f7]"
                    >
                      <option value={2}>2 天（周末快闪）</option>
                      <option value={3}>3 天（经典城市漫游）</option>
                      <option value={5}>5 天（深度街区探索）</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="plan-style" className="block text-[18px] font-medium text-[#f5f5f7]">
                      同行偏好
                    </label>
                    <select
                      id="plan-style"
                      value={travelerStyle}
                      onChange={(e) => setTravelerStyle(e.target.value)}
                      className="mt-1.5 w-full rounded-xl bg-[#1e1e24] px-4 py-2.5 text-[18px] text-[#f5f5f7]"
                    >
                      <option value="第一次去 · 稳妥省心与避坑优先">第一次去 · 稳妥省心与避坑优先</option>
                      <option value="建筑摄影与黄金光影机位优先">建筑摄影与黄金光影机位优先</option>
                      <option value="带着父母或大件行李 · 少走台阶">带着父母或大件行李 · 少走台阶</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="plan-hotel" className="block text-[18px] font-medium text-[#f5f5f7]">
                      预订酒店所在商圈
                    </label>
                    <input
                      id="plan-hotel"
                      type="text"
                      value={hotelDistrict}
                      onChange={(e) => setHotelDistrict(e.target.value)}
                      className="mt-1.5 w-full rounded-xl bg-[#1e1e24] px-4 py-2.5 text-[18px] text-[#f5f5f7]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="terra-btn w-full rounded-full bg-[#ff6b3d] py-3 text-[18px] font-semibold text-[#0a0a0c]"
                  >
                    更新 {cityFact.shortName} 首日落地路书
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 terra-reveal">
                {generatedPlan && (
                  <div className="rounded-2xl bg-[#0a0a0c] p-6 sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <h3 className="text-[18px] font-bold text-[#f5f5f7]">
                        {cityFact.shortName}专属落地执行单
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const text = generatedPlan.steps
                            .map(
                              (s) =>
                                `${s.timeSlot} 【${s.phase}】\n动作：${s.action}\n提示：${s.localAppTip}\n给司机看：${s.driverPhrase}`
                            )
                            .join("\n\n");
                          navigator.clipboard.writeText(text);
                          setCopiedPlan(true);
                          setTimeout(() => setCopiedPlan(false), 2200);
                        }}
                        className="terra-btn rounded-full bg-[#ff6b3d] px-5 py-2 text-[18px] font-semibold text-[#0a0a0c]"
                      >
                        {copiedPlan ? "已复制到剪贴板" : "一键复制整份路书"}
                      </button>
                    </div>

                    <p className="mt-3 max-w-[60ch] text-[18px] text-[#d4d4dc]">
                      {generatedPlan.summary}
                    </p>

                    <ol className="mt-6 space-y-6 pl-5 text-[18px] text-[#f5f5f7]">
                      {generatedPlan.steps.map((st) => (
                        <li key={st.phase}>
                          <div className="font-bold text-[#f5f5f7]">
                            {st.timeSlot} · {st.phase}
                          </div>
                          <p className="mt-1 mb-0 max-w-[60ch] text-[18px] text-[#f5f5f7]">
                            {st.action}
                          </p>
                          <p className="mt-1 mb-0 max-w-[60ch] text-[18px] text-[#d4d4dc]">
                            软件配合：{st.localAppTip}
                          </p>
                          <p className="mt-1 mb-0 max-w-[60ch] text-[18px] text-[#f5f5f7]">
                            双语备忘：{st.driverPhrase}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 第六屏：石材亮色底（#ececee）—— 扫码装进手机，断网也能查 */}
        <section id="mobile-handoff" className="bg-[#ececee] text-[#141416] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 terra-reveal">
                <h2 className="text-[36px] font-bold text-[#141416]">
                  装进手机，离线可查
                </h2>
                <p className="mt-4 max-w-[58ch] text-[18px] text-[#141416]">
                  在电脑上预演完动线后，用手机相机或微信扫描右侧二维码即可同步打开。将网页添加到主屏幕后，即使在机舱滑行或地下隧道没有信号，通关清单、汇率换算与双语打车卡依然可以离线打开。
                </p>

                <ol className="mt-6 space-y-2 pl-5 text-[18px] text-[#141416]">
                  <li>
                    <strong>iPhone 用户：</strong>用 Safari 打开后点底部『分享』按钮，选择『添加到主屏幕』。
                  </li>
                  <li>
                    <strong>Android 用户：</strong>用 Chrome 或系统浏览器打开，点右上角菜单选择『安装应用』或『添加到主屏幕』。
                  </li>
                </ol>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="terra-btn rounded-full bg-[#141416] px-6 py-3 text-[18px] font-semibold text-[#ececee]"
                  >
                    {copiedLink ? "已复制在线网址" : "复制网址发到手机微信"}
                  </button>
                  <span className="text-[18px] text-[#3c3c44] tnum">
                    {currentUrl}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col items-start lg:items-end terra-reveal">
                <div className="rounded-2xl bg-[#dfdfe4] p-6 text-center">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="TERRA 手机端体验二维码"
                      width={240}
                      height={240}
                      className="h-56 w-56 rounded-xl object-contain"
                    />
                  ) : (
                    <div className="flex h-56 w-56 items-center justify-center rounded-xl bg-[#ececee] text-[18px] text-[#3c3c44]">
                      正在生成二维码...
                    </div>
                  )}
                  <div className="mt-3 text-[18px] font-semibold text-[#141416]">
                    手机扫码即刻同步当前走廊
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚：全宽品牌收尾 + 开源与摄影作品署名 */}
      <footer className="bg-[#0a0a0c] text-[#d4d4dc] py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div className="text-[18px] font-bold text-[#f5f5f7]">
              TERRA · 跨国自由行三维空间预演与落地生存向导
            </div>
            <div className="flex flex-wrap gap-6 text-[18px]">
              <a
                href="https://github.com/wangguode/terra-world-travel"
                target="_blank"
                rel="noreferrer"
                className="text-[#f5f5f7] hover:underline"
              >
                GitHub 开源仓库
              </a>
              <a href="#world-model" className="text-[#d4d4dc] hover:text-white">
                回到顶部三维视窗
              </a>
            </div>
          </div>

          <p className="m-0 max-w-[60ch] text-[18px] text-[#d4d4dc]">
            三维高斯泼溅渲染引擎基于 World Labs 开源的 Spark (@sparkjsdev/spark, MIT License)，站台三维实景数据来自 Tanks and Temples 公开学术数据集。
          </p>

          <p className="m-0 max-w-[60ch] text-[14px] text-[#d4d4dc]">
            摄影素材署名（Wikimedia Commons 开放许可）：
            <a href="https://commons.wikimedia.org/w/index.php?curid=21101086" target="_blank" rel="noreferrer" className="text-[#f5f5f7] underline ml-1">“1 shibuya crossing 2012”</a> by chensiyuan (CC BY-SA 4.0);
            <a href="https://commons.wikimedia.org/w/index.php?curid=9662365" target="_blank" rel="noreferrer" className="text-[#f5f5f7] underline ml-1">“Keikyu HanedaAirport Station”</a> by RGB256 (CC BY-SA 3.0);
            <a href="https://commons.wikimedia.org/w/index.php?curid=60525211" target="_blank" rel="noreferrer" className="text-[#f5f5f7] underline ml-1">“Bangkok Airport Rail Link”</a> by Edward Russell (CC BY 2.0);
            <a href="https://commons.wikimedia.org/w/index.php?curid=28363649" target="_blank" rel="noreferrer" className="text-[#f5f5f7] underline ml-1">“Templo Wat Arun, Bangkok”</a> by Diego Delso (CC BY-SA 3.0);
            <a href="https://commons.wikimedia.org/w/index.php?curid=87842985" target="_blank" rel="noreferrer" className="text-[#f5f5f7] underline ml-1">“Incheon Airport Railroad Express”</a> (CC BY-SA 4.0);
            <a href="https://commons.wikimedia.org/wiki/File:Snowy_shopping_street_in_Seongsu-dong.jpg" target="_blank" rel="noreferrer" className="text-[#f5f5f7] underline ml-1">“Snowy shopping street in Seongsu-dong”</a> by CartoonChess (CC BY-SA 4.0).
          </p>
        </div>
      </footer>

      {/* 全屏双语给司机/店员看弹窗 */}
      {fullscreenCard && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={fullscreenCard.titleCn}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0c]/95 p-4 sm:p-8"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-[#141418] p-6 sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full bg-[#ff6b3d] px-4 py-1 text-[18px] font-semibold text-[#0a0a0c]">
                {fullscreenCard.tag} · 请直接展示给对方
              </span>
              <button
                type="button"
                onClick={() => setFullscreenCard(null)}
                className="terra-btn rounded-full bg-[#1e1e24] px-4 py-1.5 text-[18px] font-semibold text-[#f5f5f7]"
              >
                关闭全屏
              </button>
            </div>

            <p className="mt-5 mb-0 max-w-[56ch] text-[18px] text-[#d4d4dc]">
              中文原意：{fullscreenCard.titleCn}
            </p>

            <div className="mt-4 rounded-xl bg-[#0a0a0c] p-6">
              <div className="text-[36px] font-bold text-[#f5f5f7]">
                {fullscreenCard.localHeadline}
              </div>
              <div className="mt-3 text-[18px] text-[#d4d4dc]">
                发音参考：{fullscreenCard.phoneticOrSub}
              </div>
            </div>

            <p className="mt-4 mb-0 max-w-[56ch] text-[18px] text-[#f5f5f7]">
              补充说明：{fullscreenCard.driverInstruction}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => speakPhrase(fullscreenCard)}
                className="terra-btn rounded-full bg-[#ff6b3d] px-6 py-2.5 text-[18px] font-semibold text-[#0a0a0c]"
              >
                {speakingCardId === fullscreenCard.id ? "正在朗读外语..." : "播放外语真人发音"}
              </button>
              <button
                type="button"
                onClick={() => setFullscreenCard(null)}
                className="terra-btn rounded-full bg-[#1e1e24] px-6 py-2.5 text-[18px] font-medium text-[#f5f5f7]"
              >
                返回页面
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
