import type { CorridorId } from "@/lib/corridors-data";

export interface SurvivalPlanRequest {
  corridorId?: CorridorId;
  arrivalTime?: string;
  days?: number;
  travelerStyle?: string;
  hotelArea?: string;
}

export interface GeneratedPlanItem {
  timeSlot: string;
  phase: string;
  action: string;
  localAppTip: string;
  driverPhrase: string;
}

export interface SurvivalPlanResponse {
  ok: boolean;
  provider: string;
  model: string;
  corridorId: CorridorId;
  summary: string;
  steps: GeneratedPlanItem[];
}

export function buildFallbackPlan(
  corridorId: CorridorId,
  arrivalTime: string,
  days: number,
  travelerStyle: string,
  hotelArea: string
): SurvivalPlanResponse {
  if (corridorId === "cn-to-seoul") {
    return {
      ok: true,
      provider: "terra-spatial-engine",
      model: "deterministic-neural-engine",
      corridorId,
      summary: `已为【${arrivalTime} 落地仁川/金浦 · ${days}天 · ${travelerStyle} · 入住${hotelArea}】生成首尔零盲区落地生存与 3D 空间串联动线。`,
      steps: [
        {
          timeSlot: `${arrivalTime} (+00m)`,
          phase: "机舱滑行与 eSIM 激活",
          action: "关闭飞行模式启用韩国 LG U+ / SKT eSIM；走外国人入境通道后下至 B1 交通层。",
          localAppTip: "切勿打开 Google 地图查路线，立即启动 Naver Map（中文界面）。",
          driverPhrase: "인천공항 지하 1층 공항철도(AREX) 타는 곳으로 갑니다.",
        },
        {
          timeSlot: `${arrivalTime} (+30m)`,
          phase: "WOWPASS 申领与进城快轨",
          action: `在 B1 层橙色自助机塞入人民币/刷支付宝领 WOWPASS（含 T-money），乘 AREX 前往【${hotelArea}】寄存行李。`,
          localAppTip: "使用 Kakao T 叫车前往酒店时，支付方式右滑选择『Pay to Driver』下车刷 WOWPASS。",
          driverPhrase: `기사님, ${hotelArea} 쪽 호텔로 가주세요. 감사합니다!`,
        },
        {
          timeSlot: "Day 1 下午",
          phase: "3D 世界模型实景首站",
          action: "前往景福宫光化门（14:00 守门将换岗）或圣水洞演武场街（Dior 圣水 + Onion 咖啡）。",
          localAppTip: "热门烤肉店提前 45 分钟在 CatchTable Global 线上取号，避免现场吹风排队。",
          driverPhrase: "기사님, 성수동 카페거리(연무장길) 앞으로 가주세요.",
        },
      ],
    };
  }

  if (corridorId === "cn-to-tokyo") {
    return {
      ok: true,
      provider: "terra-spatial-engine",
      model: "deterministic-neural-engine",
      corridorId,
      summary: `已为【${arrivalTime} 落地羽田/成田 · ${days}天 · ${travelerStyle} · 入住${hotelArea}】生成东京极速通关与时空动线。`,
      steps: [
        {
          timeSlot: `${arrivalTime} (+00m)`,
          phase: "Visit Japan Web 二维码与西瓜卡",
          action: "出关出示 VJW 蓝码与入境海关码；iPhone 钱包直接免费添加 Suica/PASMO 交通卡并用 Apple Pay 充值 ¥3,000。",
          localAppTip: "在东京使用乘换案外或 Google Maps 查准点车厢编号，避开上班高峰挤压。",
          driverPhrase: "すみません、羽田空港からホテルまでお願いします。",
        },
        {
          timeSlot: `${arrivalTime} (+45m)`,
          phase: "京急线/单轨电车进城",
          action: `刷手机 Suica 搭乘京急机场线直通浅草线，35 分钟直达【${hotelArea}】入驻。`,
          localAppTip: "打车使用 GO (Taxi) 或 Uber Japan，支持绑定海外信用卡免密扣款。",
          driverPhrase: `運転手さん、${hotelArea}のホテルまでお願いします。`,
        },
      ],
    };
  }

  if (corridorId === "cn-to-bangkok") {
    return {
      ok: true,
      provider: "terra-spatial-engine",
      model: "deterministic-neural-engine",
      corridorId,
      summary: `已为【${arrivalTime} 落地素万那普/廊曼 · ${days}天 · ${travelerStyle} · 入住${hotelArea}】生成曼谷免签落地与打车防宰动线。`,
      steps: [
        {
          timeSlot: `${arrivalTime} (+00m)`,
          phase: "永久免签快速通关与 AIS 电话卡",
          action: "持中国护照走中泰免签通道（无需填入境卡）；B1 层机场快线旁柜台激活 AIS 5G 高速卡。",
          localAppTip: "打车切勿轻信航站楼内拉客黄牛，直接下 1 层公共出租车站取号或使用 Grab / Bolt。",
          driverPhrase: "ไปที่โรงแรมแถวสุขุมวิทครับ เปิดมิเตอร์ด้วยนะครับ (请打表)",
        },
        {
          timeSlot: `${arrivalTime} (+40m)`,
          phase: "进城避堵与轻轨出行",
          action: `乘坐 ARL 机场快线 28 分钟直达披耶泰站换乘 BTS 前往【${hotelArea}】。`,
          localAppTip: "BTS 各站点购买单程票仅收现金或 Rabbit 卡，提前在 7-11 备好泰铢零钱。",
          driverPhrase: `ไปโรงแรมที่ ${hotelArea} ครับ ขอบคุณครับ`,
        },
      ],
    };
  }

  return {
    ok: true,
    provider: "terra-spatial-engine",
    model: "deterministic-v3",
    corridorId: "global-to-beijing",
    summary: `已为【${arrivalTime} 落地北京首都/大兴 · ${days}天 · ${travelerStyle} · 入住${hotelArea}】生成皇城中轴线落地生存与 3D 空间动线。`,
    steps: [
      {
        timeSlot: `${arrivalTime} (+00m)`,
        phase: "Alipay 外卡激活与机场快轨",
        action: "打开支付宝（Alipay International）确认 Visa/Mastercard 免密乘车码，刷码进入大兴机场线（19分钟至草桥）或首都机场线（至东直门/北新桥）。",
        localAppTip: "使用高德地图（Amap English）或 Apple Maps 查看地铁换乘最近车厢位置。",
        driverPhrase: `师傅您好，请送我到【${hotelArea}】，我们走二环辅路落客，谢谢！`,
      },
      {
        timeSlot: "Day 1 核心动线",
        phase: "故宫东华门免排安检捷径 → 景山万春亭",
        action: "打车定位『故宫东华门』沿筒子河步行 8 分钟直达午门检票，游览太和殿与珍宝馆后从神武门出，登景山万春亭拍紫禁城全景日落。",
        localAppTip: "下午 15:30 在大众点评线上取『四季民福烤鸭（故宫东华门店）』晚市号。",
        driverPhrase: "师傅您好，请送我到【故宫东华门】（不走天安门广场安检通道），谢谢！",
      },
      {
        timeSlot: "Day 2 皇家山水与胡同",
        phase: "颐和园十七孔桥 → 什刹海钟鼓楼夜游",
        action: "下午从颐和园『新建宫门』入园直达十七孔桥与昆明湖，傍晚乘地铁 8 号线至什刹海 A2 口拍鼓楼红墙并逛烟袋斜街。",
        localAppTip: "从景区返程请使用支付宝内『DiDi 滴滴出行』小程序呼叫快车。",
        driverPhrase: "师傅您好，请送我到【鼓楼东大街与地安门外大街路口】，谢谢！",
      },
    ],
  };
}
