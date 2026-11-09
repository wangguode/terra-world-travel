"use client";

import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { WorldModelViewport } from "@/components/world-model-viewport";
import { CORRIDORS, type CorridorId, type DriverCard } from "@/lib/corridors-data";

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
  featurePhoto: string;
  featurePhotoAlt: string;
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
    featurePhoto: "/photos/snowy-shopping-street-in-seongsu-dong.jpg",
    featurePhotoAlt: "首尔圣水洞先锋设计街区实景",
    priceBenchmarks: [
      { label: "便利店香蕉牛奶", amount: "1800" },
      { label: "圣水洞冰美式", amount: "4500" },
      { label: "AREX 机场直达快轨", amount: "11000" },
      { label: "双人韩牛烤肉", amount: "65000" },
    ],
    extraEmpathyCards: [
      {
        id: "kr-subway-gate",
        tag: "地铁站务员求助 · 走错闸机",
        titleCn: "我不小心刷错方向了，能帮我开一下门去对面站台吗？",
        localHeadline: "죄송합니다, 반대편 개찰구로 잘못 들어왔어요. 건너갈 수 있을까요?",
        phoneticOrSub: "Joesonghamnida, bandaepyeon gaechalguro jalmot deureowasseoyo.",
        driverInstruction: "向地铁闸机口的工作人员出示此卡，或按闸机旁的求助按钮。",
        subwayBackup: "韩国多数老地铁站台左右不互通，刷卡前请看清终点站方向",
      },
      {
        id: "kr-dining-card",
        tag: "餐厅点餐与结账",
        titleCn: "请问这里可以刷海外信用卡或 WOWPASS 吗？",
        localHeadline: "여기 해외 카드나 와우패스(WOWPASS)로 결제 가능한가요?",
        phoneticOrSub: "Yeogi haeoe kadeuna WOWPASS-ro gyeolje ganeunghangayo?",
        driverInstruction: "结账前出示给店员确认；韩国绝大多数店铺均支持芯片卡与 WOWPASS。",
        subwayBackup: "传统市场与路边小吃摊建议备少量一万韩元现金",
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
    avoidPitfallTip: "iPhone 打开自带『钱包』点加号即可直接添加 Suica 西瓜卡，无需在机场排队买实体卡；成田进城认准 Skyliner。",
    featurePhoto: "/photos/1-shibuya-crossing-2012.jpg",
    featurePhotoAlt: "东京涩谷十字路口交通空间",
    priceBenchmarks: [
      { label: "便利店饭团与茶", amount: "450" },
      { label: "一兰拉面标准碗", amount: "1080" },
      { label: "成田 Skyliner 快轨", amount: "2570" },
      { label: "新宿市区出租车", amount: "3200" },
    ],
    extraEmpathyCards: [
      {
        id: "jp-station-help",
        tag: "电车站务员求助 · 找直梯",
        titleCn: "我带着大件行李，请问去站台的电梯在哪里？",
        localHeadline: "すみません、大きな荷物があります。ホーム行きのエレベーターはどこですか？",
        phoneticOrSub: "Sumimasen, ookina nimotsu ga arimasu. Erebeetaa wa doko desu ka?",
        driverInstruction: "新宿、涩谷等大站台阶极多，向改札口站务员出示可获最近直梯指引。",
        subwayBackup: "手机打开 Google Maps 开启『轮椅无障碍』路线可避开所有楼梯",
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
    mentalMathTip: "全城 99% 场所支持微信与支付宝直接扫码，地铁支持乘车码秒刷",
    avoidPitfallTip: "故宫每周一闭馆且必须提前 7 天实名预约；打车建议停在『故宫东华门』，沿筒子河步行直达午门检票口。",
    featurePhoto: "/photos/nearly-empty-incheon-airport-railroad-express-during.jpg",
    featurePhotoAlt: "现代高速快轨车厢空间",
    priceBenchmarks: [
      { label: "豆汁焦圈传统早餐", amount: "15" },
      { label: "大兴机场草桥快轨", amount: "35" },
      { label: "故宫旺季全价门票", amount: "60" },
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
        subwayBackup: "地铁备选：8 号线【金鱼胡同站】C 口出向西步行 12 分钟",
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
    avoidPitfallTip: "中泰已永久互免签证，下机直接走『Passport Control』护照查验通道，切勿排入落地签排队队列！",
    featurePhoto: "/photos/templo-wat-arun-bangkok-tailandia-2013-08.jpg",
    featurePhotoAlt: "曼谷湄南河畔郑王庙夕阳空间",
    priceBenchmarks: [
      { label: "湄南河过江渡轮", amount: "5" },
      { label: "素万那普机场快线", amount: "45" },
      { label: "郑王庙参观门票", amount: "200" },
      { label: "暹罗商圈泰式按摩", amount: "600" },
    ],
    extraEmpathyCards: [
      {
        id: "th-food-allergy",
        tag: "餐厅与夜市点餐 · 少辣忌口",
        titleCn: "请做成微辣，并且不要放香菜，非常感谢！",
        localHeadline: "เอาเผ็ดน้อย และไม่ใส่ผักชีนะครับ ขอบคุณครับ",
        phoneticOrSub: "Ao phet noi, lae mai sai phak-chee na khrap. Khawp khun khrap.",
        driverInstruction: "泰国本地菜肴默认极辣且多香菜，点冬阴功或青木瓜沙拉前出示给店员。",
        subwayBackup: "7-11 便利店与大型商场餐厅全面支持支付宝与微信扫码",
      },
    ],
  },
];

export function AppleFlagshipWebsite() {
  const [currentUrl, setCurrentUrl] = useState<string>("https://terra-world-travel.153557421.workers.dev");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeCity, setActiveCity] = useState<CorridorId>("cn-to-seoul");

  const [foreignAmount, setForeignAmount] = useState<string>("10000");
  const [speakingCardId, setSpeakingCardId] = useState<string | null>(null);
  const [fullscreenCard, setFullscreenCard] = useState<DriverCard | null>(null);

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
    const origin =
      typeof window !== "undefined" && window.location.origin.includes("workers.dev")
        ? window.location.origin
        : "https://terra-world-travel.153557421.workers.dev";

    QRCode.toDataURL(origin, {
      width: 400,
      margin: 1,
      color: {
        dark: "#050508",
        light: "#f5f5f7",
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
  };

  const cnyEquivalent = useMemo(() => {
    const val = parseFloat(foreignAmount) || 0;
    return (val * cityFact.rateToRmb).toFixed(1);
  }, [foreignAmount, cityFact]);

  const allCards = useMemo(() => {
    return [...corridorData.driverCards, ...cityFact.extraEmpathyCards];
  }, [corridorData, cityFact]);

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

  return (
    <div className="min-h-[100dvh] bg-[#050508] text-[#f5f5f7]">
      {/* 顶部极简 Apple 风格导航栏 */}
      <header className="sticky top-0 z-40 bg-[#050508] py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 sm:px-10">
          <a
            href="#top"
            className="flex items-center gap-2 text-[18px] font-bold tracking-tight text-white no-underline"
          >
            <span className="h-3 w-3 rounded-full bg-[#ff6b3d]" />
            TERRA
          </a>

          <nav aria-label="主导航" className="flex flex-wrap items-center gap-6 sm:gap-8 text-[18px]">
            <a href="#spatial-stage" className="text-white/80 hover:text-[#ff6b3d] no-underline">
              空间世界模型
            </a>
            <a href="#spatial-trajectory" className="text-white/80 hover:text-[#ff6b3d] no-underline">
              物理动线穿透
            </a>
            <a href="#spatial-anchors" className="text-white/80 hover:text-[#ff6b3d] no-underline">
              空间实体向导
            </a>
            <a
              href="#mobile-handoff"
              className="terra-btn rounded-full bg-white px-5 py-1.5 text-[18px] font-semibold text-[#050508] no-underline"
            >
              装进手机
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* 第一幕 · 震撼首屏 (The Spatial Stage) */}
        <section id="spatial-stage" className="py-12 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-8 terra-enter">
                <h1 className="text-[36px] sm:text-[80px] font-bold tracking-tight text-white leading-[1.05]">
                  TERRA 空间世界模型
                </h1>
                <p className="mt-4 max-w-[56ch] text-[18px] text-white/70">
                  在你肉身踏上异国土地之前，先在 4D 空间世界模型中第一人称穿透机场立体迷宫、预演黄金时段太阳光影与关键物理决策。
                </p>
              </div>

              {/* 目的地切换胶囊 */}
              <div className="lg:col-span-4 terra-enter">
                <div className="text-[18px] font-semibold text-white/60 mb-2">
                  选择探索走廊：
                </div>
                <div className="grid grid-cols-4 gap-2 rounded-2xl bg-white/5 p-1.5">
                  {CITY_FACTS.map((c) => {
                    const active = activeCity === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCity(c.id)}
                        className={`terra-btn rounded-xl py-2 text-[18px] font-semibold ${
                          active
                            ? "bg-[#ff6b3d] text-[#050508]"
                            : "text-white/80"
                        }`}
                      >
                        {c.shortName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 核心空间世界模型交互舞台 */}
            <div className="mt-10 terra-reveal">
              <WorldModelViewport
                scenes={corridorData.worldScenes}
                destinationCity={cityFact.fullName}
                cityId={activeCity}
              />
            </div>

            {/* 极简通透的落地物理安心条 */}
            <dl className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 terra-reveal">
              <div className="terra-reveal">
                <dt className="text-[18px] font-bold text-[#ff6b3d]">
                  到达枢纽与供电
                </dt>
                <dd className="mt-1.5 m-0 text-[18px] font-semibold text-white">
                  {cityFact.hub}
                </dd>
                <dd className="mt-1 m-0 text-[18px] text-white/60">
                  {corridorData.plugType}
                </dd>
              </div>

              <div className="terra-reveal">
                <dt className="text-[18px] font-bold text-[#ff6b3d]">
                  物价心算标尺
                </dt>
                <dd className="mt-1.5 m-0 text-[18px] font-semibold text-white tnum">
                  {corridorData.currencyInfo}
                </dd>
                <dd className="mt-1 m-0 text-[18px] text-white/60">
                  {cityFact.mentalMathTip}
                </dd>
              </div>

              <div className="terra-reveal">
                <dt className="text-[18px] font-bold text-[#ff6b3d]">
                  24h 中文救援专线
                </dt>
                <dd className="mt-1.5 m-0 text-[18px] font-semibold text-white tnum">
                  {corridorData.emergencyNumber}
                </dd>
                <dd className="mt-1 m-0 text-[18px] text-white/60">
                  遇行李遗失或司乘纠纷拨打即有中文接入
                </dd>
              </div>

              <div className="terra-reveal">
                <dt className="text-[18px] font-bold text-[#ff6b3d]">
                  头号防踩坑提醒
                </dt>
                <dd className="mt-1.5 m-0 text-[18px] text-white/80">
                  {cityFact.avoidPitfallTip}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* 第二幕 · 物理动线穿透：杂志级图文并茂 */}
        <section id="spatial-trajectory" className="bg-[#0e0e16] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="max-w-3xl terra-reveal">
              <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                出舱到酒店动线穿透
              </h2>
              <p className="mt-4 text-[18px] text-white/70">
                第一次落地异国，最慌乱的就是出舱到入住的头 120 分钟。世界模型在三维空间中预演关键物理节点，让你如本地人般从容迈出每一步。
              </p>
            </div>

            <figure className="mt-10 m-0 overflow-hidden rounded-3xl terra-reveal">
              <video
                src="/images/spatial-scan-loop.webm"
                poster="/images/spatial-scan-poster.jpg"
                autoPlay
                loop
                muted
                playsInline
                className="h-64 sm:h-80 w-full object-cover rounded-3xl"
              />
              <figcaption className="mt-3 text-[14px] text-white/50">
                4D 空间辐射场扫描：三维体素推演第一人称着陆连续轨迹。
              </figcaption>
            </figure>

            <div className="mt-16 space-y-16">
              {corridorData.timeline.slice(0, 3).map((step, idx) => (
                <article
                  key={step.title}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center terra-reveal"
                >
                  <div className="lg:col-span-6 overflow-hidden rounded-3xl">
                    <img
                      src={step.image}
                      alt={step.title}
                      width={640}
                      height={360}
                      className="h-64 sm:h-72 w-full object-cover rounded-3xl"
                    />
                  </div>

                  <div className="lg:col-span-6">
                    <div className="flex items-center gap-3 text-[14px]">
                      <span className="text-[#ff6b3d] tnum font-bold">0{idx + 1} 阶段</span>
                      <span className="text-white/50">{step.window}</span>
                    </div>

                    <h3 className="mt-3 text-[22px] font-bold text-white">
                      {step.title}
                    </h3>

                    <p className="mt-3 mb-0 text-[18px] text-white/60">
                      常见痛点：{step.painPoint}
                    </p>

                    <p className="mt-2 mb-0 text-[18px] text-white/90">
                      预演解法：{step.solution}
                    </p>

                    <div className="mt-4">
                      <a
                        href={step.affiliateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[18px] font-bold text-[#ff6b3d] hover:underline"
                      >
                        {step.actionTag} →
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 第三幕 · 空间实体向导 */}
        <section id="spatial-anchors" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* 左侧：即时物价标尺与城市实拍 */}
              <div className="lg:col-span-5 terra-reveal">
                <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                  {cityFact.shortName}物价直觉标尺
                </h2>
                <p className="mt-3 text-[18px] text-white/70">
                  结账时不知道几个零？输入当地货币即刻换算，附日常消费基准快速建立物价直觉。
                </p>

                <div className="mt-6 rounded-3xl bg-[#14141e] p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[14px] text-white/60">
                        当地货币 ({cityFact.currencyCode})
                      </span>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[18px] font-bold text-[#ff6b3d]">
                          {cityFact.currencySymbol}
                        </span>
                        <input
                          type="number"
                          value={foreignAmount}
                          onChange={(e) => setForeignAmount(e.target.value)}
                          className="w-full bg-transparent text-[18px] font-bold text-white tnum focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[14px] text-white/60">
                        折合人民币 (RMB)
                      </span>
                      <div className="mt-2 text-[18px] font-bold text-white tnum">
                        ¥ {cnyEquivalent}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4">
                    <span className="text-[14px] text-white/60">
                      常见消费基准（点击快速换算）：
                    </span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {cityFact.priceBenchmarks.map((b) => (
                        <button
                          key={b.label}
                          type="button"
                          onClick={() => setForeignAmount(b.amount)}
                          className="terra-btn rounded-full bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-[14px] text-white/90 tnum"
                        >
                          {b.label} {cityFact.currencySymbol}{Number(b.amount).toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-3xl">
                  <img
                    src={cityFact.featurePhoto}
                    alt={cityFact.featurePhotoAlt}
                    width={520}
                    height={300}
                    className="h-56 w-full object-cover rounded-3xl"
                  />
                </div>
              </div>

              {/* 右侧：双语「指指通」救急卡 */}
              <div className="lg:col-span-7 terra-reveal">
                <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                  关键场景母语救急卡
                </h2>
                <p className="mt-3 text-[18px] text-white/70">
                  面对出租车司机、地铁站务员或餐厅店员，一键播放原生真人发音，或展开全屏超大字递给对方看。
                </p>

                <ol className="mt-6 space-y-4 pl-0 list-none">
                  {allCards.slice(0, 3).map((card) => {
                    const isSpeaking = speakingCardId === card.id;
                    return (
                      <li
                        key={card.id}
                        className="rounded-3xl bg-[#14141e] p-6 terra-reveal"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-full bg-[#ff6b3d]/15 px-3 py-1 text-[14px] font-semibold text-[#ff6b3d]">
                            {card.tag}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => speakPhrase(card)}
                              className="terra-btn rounded-full bg-white/10 hover:bg-white/20 px-3.5 py-1 text-[14px] text-white"
                            >
                              {isSpeaking ? "朗读中..." : "播放发音"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setFullscreenCard(card)}
                              className="terra-btn rounded-full bg-white px-3.5 py-1 text-[14px] font-semibold text-black hover:bg-white/90"
                            >
                              全屏展示
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 text-[18px] font-bold text-white">
                          {card.titleCn}
                        </div>

                        <div className="mt-2 text-[18px] font-bold text-[#ff6b3d] leading-relaxed">
                          {card.localHeadline}
                        </div>

                        <div className="mt-1 text-[14px] text-white/50 tnum">
                          读音参考：{card.phoneticOrSub}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* 第四幕 · 手机无缝流转 */}
        <section id="mobile-handoff" className="bg-[#0e0e16] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 terra-reveal">
                <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
                  大屏预演，装进手机
                </h2>
                <p className="mt-4 max-w-[56ch] text-[18px] text-white/70">
                  在电脑上完成 4D 空间预演后，扫码直接带走。支持 Safari 与系统浏览器添加到主屏幕，在航班滑行或地下隧道无信号时，通关动线与救急卡片依然离线秒开。
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="terra-btn rounded-full bg-white px-6 py-3 text-[18px] font-semibold text-black hover:bg-white/90"
                  >
                    {copiedLink ? "已复制在线网址" : "复制网址发到手机"}
                  </button>
                  <span className="text-[14px] text-white/50 tnum">
                    {currentUrl}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center lg:justify-end terra-reveal">
                <div className="rounded-3xl bg-white p-6 text-center">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="手机扫码离线体验"
                      width={240}
                      height={240}
                      className="h-56 w-56 rounded-2xl object-contain mx-auto"
                    />
                  ) : (
                    <div className="flex h-56 w-56 items-center justify-center rounded-2xl bg-gray-100 text-black">
                      正在生成...
                    </div>
                  )}
                  <div className="mt-3 text-[18px] font-bold text-black">
                    手机扫码即刻同步当前走廊
                  </div>
                  <div className="text-[14px] text-gray-500">
                    支持 iOS Safari 与 Android 离线运行
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 极简通透页脚 */}
      <footer className="py-12 text-center text-[14px] text-white/40">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 flex flex-wrap items-center justify-between gap-4">
          <div className="font-semibold text-white/70">
            TERRA · 空间世界模型与跨国出行预演系统
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/wangguode/terra-world-travel"
              target="_blank"
              rel="noreferrer"
              className="text-white/60 hover:text-white"
            >
              GitHub 仓库
            </a>
            <a href="#spatial-stage" className="text-white/60 hover:text-white">
              回到顶部视窗
            </a>
          </div>
        </div>
      </footer>

      {/* 全屏双语展示弹窗 */}
      {fullscreenCard && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-[#0e0e14] p-8 sm:p-12">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#ff6b3d] px-4 py-1 text-[14px] font-bold text-black">
                {fullscreenCard.tag} · 请向对方出示
              </span>
              <button
                type="button"
                onClick={() => setFullscreenCard(null)}
                className="terra-btn rounded-full bg-white/10 px-4 py-1 text-[14px] text-white hover:bg-white/20"
              >
                关闭
              </button>
            </div>

            <div className="mt-8 text-[18px] text-white/70">
              中文含义：{fullscreenCard.titleCn}
            </div>

            <div className="mt-4 rounded-2xl bg-black p-6">
              <div className="text-[32px] sm:text-[40px] font-bold text-white leading-tight">
                {fullscreenCard.localHeadline}
              </div>
              <div className="mt-3 text-[18px] text-[#ff6b3d] tnum">
                发音：{fullscreenCard.phoneticOrSub}
              </div>
            </div>

            <p className="mt-6 mb-0 text-[18px] text-white/60">
              贴心提示：{fullscreenCard.driverInstruction}
            </p>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => speakPhrase(fullscreenCard)}
                className="terra-btn rounded-full bg-[#ff6b3d] px-6 py-2.5 text-[18px] font-bold text-black"
              >
                {speakingCardId === fullscreenCard.id ? "正在播放..." : "播放真人发音"}
              </button>
              <button
                type="button"
                onClick={() => setFullscreenCard(null)}
                className="terra-btn rounded-full bg-white/10 px-6 py-2.5 text-[18px] text-white"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
