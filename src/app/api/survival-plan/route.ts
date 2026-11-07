import { NextResponse } from "next/server";
import { CORRIDORS, type CorridorId } from "@/lib/corridors-data";

interface SurvivalPlanRequest {
  corridorId?: CorridorId;
  arrivalTime?: string;
  days?: number;
  travelerStyle?: string;
  hotelArea?: string;
}

interface GeneratedPlanItem {
  timeSlot: string;
  phase: string;
  action: string;
  localAppTip: string;
  driverPhrase: string;
}

interface SurvivalPlanResponse {
  ok: boolean;
  provider: string;
  model: string;
  corridorId: CorridorId;
  summary: string;
  steps: GeneratedPlanItem[];
}

function buildFallbackPlan(
  corridorId: CorridorId,
  arrivalTime: string,
  days: number,
  travelerStyle: string,
  hotelArea: string
): SurvivalPlanResponse {
  const c = CORRIDORS[corridorId] ?? CORRIDORS["cn-to-seoul"];
  if (corridorId === "cn-to-seoul") {
    return {
      ok: true,
      provider: "terra-deterministic-engine",
      model: "qwen-plus-compatible",
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

  return {
    ok: true,
    provider: "terra-deterministic-engine",
    model: "qwen-plus-compatible",
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

async function callQwenEndpoint(
  baseUrl: string,
  apiKey: string,
  model: string,
  prompt: string
): Promise<GeneratedPlanItem[] | null> {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const res = await fetch(`${cleanBase}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content:
            "你是跨国落地生存与空间旅游规划引擎 TERRA AI。请仅输出合法的 JSON 数组（3个步骤对象），每个对象包含字段：timeSlot, phase, action, localAppTip, driverPhrase。不要输出 Markdown 代码块标记。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
    signal: AbortSignal.timeout(8500),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return null;
  const parsed = JSON.parse(jsonMatch[0]) as GeneratedPlanItem[];
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  return parsed.slice(0, 4).map((item) => ({
    timeSlot: String(item.timeSlot ?? "T+00m"),
    phase: String(item.phase ?? "落地生存关键动作"),
    action: String(item.action ?? ""),
    localAppTip: String(item.localAppTip ?? ""),
    driverPhrase: String(item.driverPhrase ?? ""),
  }));
}

export async function POST(req: Request) {
  let body: SurvivalPlanRequest = {};
  try {
    body = (await req.json()) as SurvivalPlanRequest;
  } catch {
    body = {};
  }

  const corridorId: CorridorId =
    body.corridorId === "global-to-beijing" ? "global-to-beijing" : "cn-to-seoul";
  const arrivalTime = (body.arrivalTime || "14:30").slice(0, 20);
  const days = Math.min(Math.max(Number(body.days) || 4, 1), 14);
  const travelerStyle = (body.travelerStyle || "首次自由行 · 建筑机位与地道美食").slice(0, 60);
  const hotelArea = (
    body.hotelArea || (corridorId === "cn-to-seoul" ? "弘大入口 / 延南洞" : "东城王府井 / 什刹海")
  ).slice(0, 40);

  const fallback = buildFallbackPlan(corridorId, arrivalTime, days, travelerStyle, hotelArea);
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
  const primaryUrl =
    process.env.AI_BASE_URL || "https://maas.qianwenaiapi.com/compatible-mode/v1";
  const secondaryUrl =
    process.env.AI_FALLBACK_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
  const model = process.env.AI_MODEL || "qwen-plus";

  if (!apiKey) {
    return NextResponse.json(fallback);
  }

  const destinationName =
    corridorId === "cn-to-seoul" ? "韩国首尔（仁川/金浦落地）" : "中国北京（首都/大兴落地）";
  const prompt = `旅客即将前往${destinationName}，预计落地时间：${arrivalTime}，行程天数：${days}天，偏好风格：${travelerStyle}，计划住宿区域：${hotelArea}。请生成3条最关键的落地生存与实景游览步骤（含1.下飞机联网/交通卡/进城，2.入住后第一站世界模型核心机位，3.次日王牌动线与防坑预约），并在 driverPhrase 字段给出可直接给当地出租车司机看的本国语言（韩文或中文）句子。`;

  try {
    const primarySteps = await callQwenEndpoint(primaryUrl, apiKey, model, prompt).catch(
      () => null
    );
    if (primarySteps) {
      return NextResponse.json({
        ...fallback,
        provider: "qianwen-maas-live",
        model,
        steps: primarySteps,
      });
    }

    const secondarySteps = await callQwenEndpoint(secondaryUrl, apiKey, model, prompt).catch(
      () => null
    );
    if (secondarySteps) {
      return NextResponse.json({
        ...fallback,
        provider: "dashscope-live",
        model,
        steps: secondarySteps,
      });
    }
  } catch {
    // 遵循 ai-call-safety：异常静默降级至确定性高可用方案，不暴露内部密钥或堆栈
  }

  return NextResponse.json(fallback);
}
