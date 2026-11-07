import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const terraHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 2200px;
    height: 1560px;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif;
    color: #1e293b;
    padding: 28px 32px;
    overflow: hidden;
  }
  .canvas {
    display: grid;
    grid-template-columns: 310px 1fr 270px;
    grid-template-rows: 170px 195px 1fr 165px;
    gap: 20px;
    width: 100%;
    height: 100%;
  }
  .box {
    border: 2.5px solid #4a78b5;
    border-radius: 22px;
    background: #ffffff;
    position: relative;
  }
  /* Left Column */
  .left-protocols {
    grid-column: 1;
    grid-row: 1 / 3;
    height: 290px;
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  .left-design {
    grid-column: 1;
    grid-row: 2 / 3;
    margin-top: 135px;
    height: 185px;
    padding: 18px 22px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  .left-models {
    grid-column: 1;
    grid-row: 3 / 5;
    margin-top: 115px;
    padding: 22px 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .proto-item {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 21px;
    font-weight: 700;
    color: #0f172a;
  }
  .proto-badge {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 16px;
    color: #fff;
    flex-shrink: 0;
  }
  /* Top Ecosystem Storage & Data Sources */
  .top-eco {
    grid-column: 2 / 4;
    grid-row: 1;
    padding: 18px 32px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(2, 1fr);
    align-items: center;
    gap: 12px 20px;
    background: #fcfdff;
  }
  .eco-chip {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
  }
  .eco-dot {
    min-width: 52px;
    height: 34px;
    padding: 0 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
  }
  /* Upper Corridors & Scenarios Layer */
  .upper-scenarios {
    grid-column: 2 / 4;
    grid-row: 2;
    background: #fdf2f4;
    border-color: #334155;
    padding: 18px 28px;
    display: grid;
    grid-template-columns: 430px 1fr;
    gap: 24px;
    align-items: center;
  }
  .scenario-left {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .scenario-title {
    font-size: 23px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 2px;
  }
  .pill-grid-2x2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 14px;
  }
  .pill {
    border: 2px solid #334155;
    border-radius: 11px;
    padding: 9px 14px;
    text-align: center;
    font-size: 17px;
    font-weight: 700;
    color: #0f172a;
    background: #fff;
  }
  .pill.rose { background: #f8c4c0; }
  .pill.lavender { background: #d4d4f7; }
  .pill.amber { background: #f7ba79; }
  .pill.gray { background: #eef1f5; }

  .scenario-right-card {
    border: 2px solid #475569;
    border-radius: 18px;
    background: #fff8f9;
    padding: 14px 22px;
    display: grid;
    grid-template-columns: 310px 260px 1fr;
    align-items: center;
    gap: 20px;
    height: 152px;
  }
  .brand-center {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .brand-center h2 {
    font-size: 36px;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #0f172a;
  }
  .brand-center p {
    font-size: 18px;
    font-weight: 700;
    color: #ea580c;
  }

  /* Main Core Engine Container */
  .core-container {
    grid-column: 2;
    grid-row: 3;
    background: #edf6ff;
    border: 2.5px solid #334155;
    border-radius: 24px;
    padding: 20px 26px 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .core-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .core-logo {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .core-logo-badge {
    background: linear-gradient(135deg, #ff5a26, #2563eb);
    color: #fff;
    font-weight: 900;
    font-size: 26px;
    padding: 8px 16px;
    border-radius: 12px;
  }
  .core-logo-title {
    font-size: 38px;
    font-weight: 800;
    color: #0f172a;
  }
  .lang-tag {
    background: #1d4ed8;
    color: #fff;
    font-size: 16px;
    font-weight: 800;
    padding: 5px 11px;
    border-radius: 7px;
  }

  .sub-panel {
    background: #b4dcff;
    border: 2px solid #1e293b;
    border-radius: 18px;
    padding: 12px 18px 16px;
  }
  .sub-panel-title {
    text-align: center;
    font-size: 19px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 10px;
  }
  .service-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px 18px;
  }

  .core-mid-row {
    display: grid;
    grid-template-columns: 280px 1fr 260px;
    gap: 18px;
    margin: 14px 0;
    height: 295px;
  }
  .stack-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .engine-flow {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 16px 20px;
    align-items: center;
    padding: 12px 14px;
    height: 225px;
    position: relative;
  }

  .core-bot-row {
    display: grid;
    grid-template-columns: 340px 310px 1fr;
    gap: 18px;
    height: 170px;
  }

  /* Right Sidebar */
  .right-sidebar {
    grid-column: 3;
    grid-row: 3;
    background: #eef6ff;
    border-color: #334155;
    padding: 26px 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }
  .side-tool {
    width: 100%;
    border: 2px solid #cbd5e1;
    border-radius: 16px;
    background: #ffffff;
    padding: 16px 14px;
    text-align: center;
  }
  .side-tool h4 {
    font-size: 22px;
    font-weight: 900;
    color: #0f172a;
  }
  .side-tool p {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    margin-top: 4px;
  }

  /* Bottom Infrastructure Row */
  .bot-infra {
    grid-column: 2 / 4;
    grid-row: 4;
    display: grid;
    grid-template-columns: 440px 1fr 270px;
    gap: 20px;
  }
  .infra-card {
    border: 2.5px solid #4a78b5;
    border-radius: 20px;
    padding: 16px 24px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    gap: 10px 16px;
    background: #ffffff;
  }
  .infra-wide {
    grid-template-columns: repeat(3, 1fr);
  }
</style>
</head>
<body>
  <div class="canvas">
    <!-- Left 1: Multi-Platform & Protocols -->
    <div class="box left-protocols">
      <div class="proto-item"><span class="proto-badge" style="background:#0f172a">iOS</span> Apple iPhone 灵动岛适配</div>
      <div class="proto-item"><span class="proto-badge" style="background:#16a34a">AND</span> Android 旗舰手势适配</div>
      <div class="proto-item"><span class="proto-badge" style="background:#2563eb">PC</span> 桌面端双栏宽屏工作台</div>
      <div class="proto-item"><span class="proto-badge" style="background:#ea580c">PWA</span> 机场断网离线 ServiceWorker</div>
    </div>

    <!-- Left 2: Design & Spatial Spec -->
    <div class="box left-design">
      <div class="proto-item"><span class="proto-badge" style="background:#111827">3D</span> 3D Gaussian Splatting</div>
      <div class="proto-item"><span class="proto-badge" style="background:#b9380c">UI</span> Colour-Chapters 视觉体系</div>
      <div class="proto-item"><span class="proto-badge" style="background:#0284c7">GIS</span> WGS84 / GCJ-02 坐标纠偏</div>
    </div>

    <!-- Left 3: Foundation LLM & Spatial Models -->
    <div class="box left-models">
      <div class="proto-item"><span class="proto-badge" style="background:#4f46e5">千问</span> 阿里云百炼 Qwen-Plus</div>
      <div class="proto-item"><span class="proto-badge" style="background:#0891b2">VL</span> Qwen-VL-Max 视觉机位理解</div>
      <div class="proto-item"><span class="proto-badge" style="background:#059669">OAI</span> OpenAI Compatible API</div>
      <div class="proto-item"><span class="proto-badge" style="background:#d97706">3DGS</span> Luma / Spark .splat 点云</div>
      <div class="proto-item"><span class="proto-badge" style="background:#dc2626">MAP</span> Naver Map / 高德双引擎</div>
      <div class="proto-item"><span class="proto-badge" style="background:#334155">TTS</span> 韩语/英语/中文司机语音包</div>
      <div class="proto-item"><span class="proto-badge" style="background:#7c3aed">DET</span> 确定性离线生存兜底引擎</div>
    </div>

    <!-- Top Row: Spatial Assets, Travel & Payment Ecosystem -->
    <div class="box top-eco">
      <div class="eco-chip"><span class="eco-dot" style="background:#ea580c">eSIM</span> Airalo 原生漫游</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#f97316">WOW</span> WOWPASS 换汇芯片</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#16a34a">NAVER</span> Naver Map 中文导航</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#eab308">KAKAO</span> Kakao T 出租车网</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#e11d48">CATCH</span> CatchTable 排队系统</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#0284c7">AREX</span> 仁川机场橙/蓝快轨</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#2563eb">ALIPAY</span> 支付宝外卡免密直绑</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#dc2626">PASS</span> BEIJING PASS 一卡通</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#059669">AMAP</span> 高德地图英文版</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#d97706">DIDI</span> 滴滴英语自动互译</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#4f46e5">TRIP</span> Trip.com 实名抢票</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#0f172a">PULSE</span> Beijing Pulse 地标库</div>
    </div>

    <!-- Row 2: Corridors & Vertical Scenarios -->
    <div class="box upper-scenarios">
      <div class="scenario-left">
        <div class="scenario-title">TERRA-Corridors (跨国双向走廊实例)</div>
        <div class="pill-grid-2x2">
          <div class="pill rose">CN → 首尔仁川/金浦</div>
          <div class="pill rose">Global → 北京首都/大兴</div>
          <div class="pill rose">CN → 东京成田/羽田</div>
          <div class="pill rose">testUi-1 皇城中轴资产</div>
        </div>
      </div>

      <div class="scenario-right-card">
        <div class="stack-col" style="gap:8px">
          <div class="pill lavender">下飞机黄金 120 分钟 SOP</div>
          <div class="pill lavender">本土国民 App 1:1 平替映射</div>
          <div class="pill lavender">给出租车司机看全屏双语卡</div>
        </div>

        <div class="brand-center">
          <h2>TERRA 2.0</h2>
          <p>World Model × Touchdown OS</p>
        </div>

        <div class="stack-col" style="gap:8px">
          <div class="pill-grid-2x2">
            <div class="pill amber">东华门免排安检</div>
            <div class="pill amber">景福宫韩服免票</div>
            <div class="pill amber">圣水洞红砖机位</div>
            <div class="pill amber">什刹海胡同动线</div>
          </div>
          <div class="pill amber">60FPS 3D 高斯点云空间预演</div>
        </div>
      </div>
    </div>

    <!-- Row 3 Center: Main TERRA 2.0 Core Engine -->
    <div class="core-container">
      <div class="core-header">
        <div class="core-logo">
          <span class="core-logo-badge">TERRA</span>
          <span class="core-logo-title">TERRA Spatial & Survival OS 2.0</span>
          <span class="lang-tag">Next.js 16</span>
          <span class="lang-tag" style="background:#ea580c">WebGL / 3DGS</span>
          <span class="lang-tag" style="background:#059669">TypeScript 5</span>
        </div>
        <div style="font-size:18px;font-weight:700;color:#334155">
          iOS / Android / PC 全端响应式 + 离线 PWA 架构
        </div>
      </div>

      <!-- Top Sub-Panel: Touchdown & Spatial Service Layer -->
      <div class="sub-panel">
        <div class="sub-panel-title">Touchdown & Spatial Service Layer (跨国落地生存与空间编排服务层)</div>
        <div class="service-grid">
          <div class="pill gray">黄金 120 分钟分钟级时间轴引擎</div>
          <div class="pill gray">跨国 App 生态映射矩阵 (App Matrix)</div>
          <div class="pill gray">Show-to-Driver 全屏高对比度急救卡</div>
          <div class="pill gray">三大黄金住宿圈交通直达评估器</div>
          <div class="pill gray">景区实名预约防跑空预警 (7-Day Rule)</div>
          <div class="pill gray">跨境联盟变现路由 (eSIM / 快轨 / 门票)</div>
        </div>
      </div>

      <!-- Middle Row: 3 Sub-Systems -->
      <div class="core-mid-row">
        <div class="sub-panel stack-col">
          <div class="sub-panel-title">Device & Viewport Bus</div>
          <div class="pill gray">PC 宽屏双栏工作台视图</div>
          <div class="pill gray">iPhone 灵动岛与底部安全区</div>
          <div class="pill gray">Android 触控手势与返回栈</div>
          <div class="pill gray">真机壳套实时切换预览器</div>
        </div>

        <div class="sub-panel">
          <div class="sub-panel-title">Web 3D Gaussian World Model Engine (三维高斯世界模型漫游核心)</div>
          <div class="engine-flow">
            <div class="pill gray" style="padding:14px">60FPS 体素点云投影<br/><span style="font-size:13px;color:#475569">Yaw / Pitch / FOV 矩阵</span></div>
            <div class="pill amber" style="padding:14px">空间机位锚点 (Hotspots)<br/><span style="font-size:13px;color:#0f172a">镜头参数与焦段自动飞行</span></div>
            <div class="pill gray" style="padding:14px">Hybrid / Pure Splat<br/><span style="font-size:13px;color:#475569">建筑实景与纯点云双模态</span></div>
            <div class="pill gray" style="padding:14px">北京中轴线 3D 场景库<br/><span style="font-size:13px;color:#475569">故宫 / 颐和园 / 什刹海</span></div>
            <div class="pill gray" style="padding:14px">首尔核心圈 3D 场景库<br/><span style="font-size:13px;color:#475569">景福宫 / 圣水洞 / 仁川B1</span></div>
            <div class="pill lavender" style="padding:14px">无折返步行闭环计算<br/><span style="font-size:13px;color:#0f172a">地铁几号口出站精准衔接</span></div>
          </div>
        </div>

        <div class="sub-panel stack-col">
          <div class="sub-panel-title">Offline Survival Pack</div>
          <div class="pill gray">韩文/中文司机指令剪贴板</div>
          <div class="pill gray">机场快轨时刻与闸机对照</div>
          <div class="pill gray">1330 / 12345 紧急救援直拨</div>
          <div class="pill gray">PWA 离线缓存资产包</div>
        </div>
      </div>

      <!-- Bottom Row: AI Safety Gateway, Corridor Store, Middleware -->
      <div class="core-bot-row">
        <div class="sub-panel stack-col">
          <div class="sub-panel-title">Bailian Qwen-Plus AI Copilot</div>
          <div class="pill-grid-2x2">
            <div class="pill gray">个性化落地动线生成</div>
            <div class="pill gray">8.5s 严格超时熔断</div>
            <div class="pill gray">双端点自动故障切换</div>
            <div class="pill gray">Deterministic 离线兜底</div>
          </div>
        </div>

        <div class="sub-panel stack-col">
          <div class="sub-panel-title">Corridor Knowledge Store</div>
          <div class="pill gray">corridors-data.ts 双城结构化库</div>
          <div class="pill gray">beijing-pulse 10 大地标与路线库</div>
        </div>

        <div class="sub-panel stack-col">
          <div class="sub-panel-title">AI Call Safety & Quality Guardrails</div>
          <div class="pill-grid-2x2">
            <div class="pill gray">服务端 .env.local 密钥隔离</div>
            <div class="pill gray">JSON 结构化输出强校验</div>
            <div class="pill gray">TasteSkill 0 FAIL 视觉门禁</div>
            <div class="pill gray">WCAG AAA 高对比度校验</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Sidebar: Tooling, Audit & Monetization -->
    <div class="box right-sidebar">
      <div class="side-tool">
        <h4 style="color:#ea580c">TasteSkill v2</h4>
        <p>lint.mjs 0 FAIL / 0 WARN<br/>inspect.mjs 真机渲染门禁</p>
      </div>
      <div class="side-tool">
        <h4 style="color:#2563eb">Archify Engine</h4>
        <p>交互式架构图与数据流验证<br/>docs/architecture/</p>
      </div>
      <div class="side-tool">
        <h4 style="color:#059669">Beijing Pulse</h4>
        <p>11 张高清实景摄影资产<br/>中英韩三语地标词典</p>
      </div>
      <div class="side-tool">
        <h4 style="color:#7c3aed">Revenue Loop</h4>
        <p>eSIM 佣金 + 交通卡分润<br/>$4.99 离线生存包订阅</p>
      </div>
    </div>

    <!-- Bottom Infrastructure Row -->
    <div class="bot-infra">
      <div class="infra-card">
        <div class="eco-chip"><span class="eco-dot" style="background:#0f172a">NEXT</span> Next.js 16 Turbopack</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#2563eb">EDGE</span> Serverless API Route</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#059669">CDN</span> 静态点云与高清图加速</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#ea580c">PWA</span> iOS / Android 桌面安装</div>
      </div>

      <div class="infra-card infra-wide">
        <div class="eco-chip"><span class="eco-dot" style="background:#e11d48">XHS</span> 小红书爆款图卡矩阵</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#0f172a">TIKTOK</span> 抖音/TikTok 3D 预演短视频</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#2563eb">SEO</span> 跨国落地长尾词 pSEO</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#16a34a">LEMON</span> Lemon Squeezy 全球收款</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#d97706">PAYO</span> Payoneer 派安盈结汇人民币</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#4f46e5">OTA</span> Trip.com / Klook CPS 联盟</div>
      </div>

      <div class="infra-card">
        <div class="eco-chip"><span class="eco-dot" style="background:#0284c7">VERCEL</span> Vercel / Railway</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#111827">GH</span> GitHub Open Source</div>
      </div>
    </div>
  </div>
</body>
</html>`;

const wigHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 2200px;
    height: 1560px;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif;
    color: #1e293b;
    padding: 28px 32px;
    overflow: hidden;
  }
  .canvas {
    display: grid;
    grid-template-columns: 310px 1fr 270px;
    grid-template-rows: 170px 195px 1fr 165px;
    gap: 20px;
    width: 100%;
    height: 100%;
  }
  .box {
    border: 2.5px solid #4a78b5;
    border-radius: 22px;
    background: #ffffff;
    position: relative;
  }
  .left-protocols {
    grid-column: 1;
    grid-row: 1 / 3;
    height: 290px;
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  .left-design {
    grid-column: 1;
    grid-row: 2 / 3;
    margin-top: 135px;
    height: 185px;
    padding: 18px 22px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  .left-models {
    grid-column: 1;
    grid-row: 3 / 5;
    margin-top: 115px;
    padding: 22px 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .proto-item {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
  }
  .proto-badge {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 15px;
    color: #fff;
    flex-shrink: 0;
  }
  .top-eco {
    grid-column: 2 / 4;
    grid-row: 1;
    padding: 18px 32px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(2, 1fr);
    align-items: center;
    gap: 12px 20px;
    background: #fcfdff;
  }
  .eco-chip {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 19px;
    font-weight: 700;
    color: #1e293b;
  }
  .eco-dot {
    min-width: 52px;
    height: 34px;
    padding: 0 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
  }
  .upper-scenarios {
    grid-column: 2 / 4;
    grid-row: 2;
    background: #fdf2f4;
    border-color: #334155;
    padding: 18px 28px;
    display: grid;
    grid-template-columns: 430px 1fr;
    gap: 24px;
    align-items: center;
  }
  .scenario-left {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .scenario-title {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
  }
  .pill-grid-2x2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 14px;
  }
  .pill {
    border: 2px solid #334155;
    border-radius: 11px;
    padding: 9px 14px;
    text-align: center;
    font-size: 17px;
    font-weight: 700;
    color: #0f172a;
    background: #fff;
  }
  .pill.rose { background: #f8c4c0; }
  .pill.lavender { background: #d4d4f7; }
  .pill.amber { background: #f7ba79; }
  .pill.gray { background: #eef1f5; }

  .scenario-right-card {
    border: 2px solid #475569;
    border-radius: 18px;
    background: #fff8f9;
    padding: 14px 22px;
    display: grid;
    grid-template-columns: 310px 260px 1fr;
    align-items: center;
    gap: 20px;
    height: 152px;
  }
  .brand-center {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .brand-center h2 {
    font-size: 34px;
    font-weight: 900;
    color: #0f172a;
  }
  .brand-center p {
    font-size: 17px;
    font-weight: 700;
    color: #7c3aed;
  }
  .core-container {
    grid-column: 2;
    grid-row: 3;
    background: #edf6ff;
    border: 2.5px solid #334155;
    border-radius: 24px;
    padding: 20px 26px 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .core-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .core-logo {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .core-logo-badge {
    background: linear-gradient(135deg, #7c3aed, #2563eb);
    color: #fff;
    font-weight: 900;
    font-size: 25px;
    padding: 8px 16px;
    border-radius: 12px;
  }
  .core-logo-title {
    font-size: 36px;
    font-weight: 800;
    color: #0f172a;
  }
  .lang-tag {
    background: #1d4ed8;
    color: #fff;
    font-size: 15px;
    font-weight: 800;
    padding: 5px 11px;
    border-radius: 7px;
  }
  .sub-panel {
    background: #b4dcff;
    border: 2px solid #1e293b;
    border-radius: 18px;
    padding: 12px 18px 16px;
  }
  .sub-panel-title {
    text-align: center;
    font-size: 19px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 10px;
  }
  .service-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px 18px;
  }
  .core-mid-row {
    display: grid;
    grid-template-columns: 280px 1fr 260px;
    gap: 16px;
    margin: 10px 0;
    height: 278px;
  }
  .stack-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .engine-flow {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 14px 18px;
    align-items: center;
    padding: 8px 12px;
    height: 210px;
  }
  .core-bot-row {
    display: grid;
    grid-template-columns: 350px 310px 1fr;
    gap: 16px;
    height: 192px;
  }
  .right-sidebar {
    grid-column: 3;
    grid-row: 3;
    background: #eef6ff;
    border-color: #334155;
    padding: 26px 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }
  .side-tool {
    width: 100%;
    border: 2px solid #cbd5e1;
    border-radius: 16px;
    background: #ffffff;
    padding: 16px 14px;
    text-align: center;
  }
  .side-tool h4 {
    font-size: 21px;
    font-weight: 900;
    color: #0f172a;
  }
  .side-tool p {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    margin-top: 4px;
  }
  .bot-infra {
    grid-column: 2 / 4;
    grid-row: 4;
    display: grid;
    grid-template-columns: 440px 1fr 270px;
    gap: 20px;
  }
  .infra-card {
    border: 2.5px solid #4a78b5;
    border-radius: 20px;
    padding: 16px 24px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    gap: 10px 16px;
    background: #ffffff;
  }
  .infra-wide {
    grid-template-columns: repeat(3, 1fr);
  }
</style>
</head>
<body>
  <div class="canvas">
    <!-- Left 1: Client Endpoints -->
    <div class="box left-protocols">
      <div class="proto-item"><span class="proto-badge" style="background:#059669">MP</span> 微信小程序 / H5 试戴端</div>
      <div class="proto-item"><span class="proto-badge" style="background:#2563eb">PAD</span> 门店导购 iPad 大屏端</div>
      <div class="proto-item"><span class="proto-badge" style="background:#7c3aed">ADM</span> Admin 运营资产工作台</div>
      <div class="proto-item"><span class="proto-badge" style="background:#ea580c">REST</span> Multipart / Poll 异步协议</div>
    </div>

    <!-- Left 2: Asset Decoupling System -->
    <div class="box left-design">
      <div class="proto-item"><span class="proto-badge" style="background:#111827">L1</span> WigAsset 光秃假发本体</div>
      <div class="proto-item"><span class="proto-badge" style="background:#0284c7">L2</span> ModelAsset 标准模特底图</div>
      <div class="proto-item"><span class="proto-badge" style="background:#d97706">L3</span> WigShowcase 展厅合成墙</div>
    </div>

    <!-- Left 3: Multi-Modal Vision & Image Edit Models -->
    <div class="box left-models">
      <div class="proto-item"><span class="proto-badge" style="background:#4f46e5">QWEN</span> qwen-image-edit-plus</div>
      <div class="proto-item"><span class="proto-badge" style="background:#0891b2">VL</span> qwen-vl-max 脸型与发际线</div>
      <div class="proto-item"><span class="proto-badge" style="background:#2563eb">ARK</span> Doubao Seedream 5.0 (2K)</div>
      <div class="proto-item"><span class="proto-badge" style="background:#059669">GPT</span> OpenAI gpt-image-1.5-all</div>
      <div class="proto-item"><span class="proto-badge" style="background:#d97706">FLUX</span> Flux.1 Kontext 保ID编辑</div>
      <div class="proto-item"><span class="proto-badge" style="background:#dc2626">WAN</span> 通义万相 wan2.5-i2i</div>
      <div class="proto-item"><span class="proto-badge" style="background:#334155">SEED</span> Seed / Mock 零Key离线引擎</div>
    </div>

    <!-- Top Ecosystem: Storage & Persistence -->
    <div class="box top-eco">
      <div class="eco-chip"><span class="eco-dot" style="background:#ea580c">JSON</span> wig-assets.json 本体库</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#2563eb">MOD</span> model-assets.json 模特库</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#7c3aed">SHOW</span> wig-showcases.json 展厅</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#059669">CAT</span> customer-catalog 客户画册</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#dc2626">TTL</span> SessionRepository (24h)</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#d97706">FILE</span> Local / OSS 静态文件服务</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#0891b2">URI</span> Data-URI 图像内联编码器</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#4f46e5">PY</span> batch-import 批量导入器</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#16a34a">LBS</span> Store 附近门店坐标库</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#e11d48">FDBK</span> Feedback 试戴满意度库</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#0f172a">AUTH</span> X-Admin-Token 鉴权</div>
      <div class="eco-chip"><span class="eco-dot" style="background:#0284c7">JOB</span> BatchJobRegistry 批处理</div>
    </div>

    <!-- Row 2: Consumer & Admin Scenarios -->
    <div class="box upper-scenarios">
      <div class="scenario-left">
        <div class="scenario-title">Consumer Try-On Scenarios (C端四大试戴场景)</div>
        <div class="pill-grid-2x2">
          <div class="pill rose">女士长发 / 空气刘海</div>
          <div class="pill rose">都市干练短发 / 波波头</div>
          <div class="pill rose">男士商务精英 / M型发际线</div>
          <div class="pill rose">中老年白发遮盖 / 局部补发</div>
        </div>
      </div>

      <div class="scenario-right-card">
        <div class="stack-col" style="gap:8px">
          <div class="pill lavender">CompareSlider 前后滑动对比</div>
          <div class="pill lavender">局部微调 (刘海/发际线/蓬松度)</div>
          <div class="pill lavender">附近门店预约与导购跟进</div>
        </div>

        <div class="brand-center">
          <h2>WigTryOn 2.0</h2>
          <p>Zero-Identity-Drift AI Try-On</p>
        </div>

        <div class="stack-col" style="gap:8px">
          <div class="pill-grid-2x2">
            <div class="pill amber">WigAsset 剥离人脸</div>
            <div class="pill amber">ModelAsset 标准肖像</div>
            <div class="pill amber">Showcase 批量合成</div>
            <div class="pill amber">Customer 画册导入</div>
          </div>
          <div class="pill amber">三层资产解耦：彻底解决『换发变换脸』</div>
        </div>
      </div>
    </div>

    <!-- Row 3 Center: Spring Boot 3 + React 19 Core Engine -->
    <div class="core-container">
      <div class="core-header">
        <div class="core-logo">
          <span class="core-logo-badge">VS-AI</span>
          <span class="core-logo-title">WigTryOn Full-Stack Engine 2.0</span>
          <span class="lang-tag">Java 17 / Spring Boot 3</span>
          <span class="lang-tag" style="background:#7c3aed">React 19 / Vite 6</span>
          <span class="lang-tag" style="background:#059669">Python 3</span>
        </div>
        <div style="font-size:18px;font-weight:700;color:#334155">
          零数据库开箱即用 · 支持 Seed 离线演示与 Real 多模型热切换
        </div>
      </div>

      <!-- Top Sub-Panel: Application & Admin Service Layer -->
      <div class="sub-panel">
        <div class="sub-panel-title">Try-On & Studio Orchestration Layer (试戴编排与运营资产服务层)</div>
        <div class="service-grid">
          <div class="pill gray">PhotoService (人脸检测与快速跳过开关)</div>
          <div class="pill gray">RecommendService (脸型/肤色/白发分析)</div>
          <div class="pill gray">TryonService (异步任务池与重绘编排)</div>
          <div class="pill gray">BareWigGenerator (无头模纯假发提取)</div>
          <div class="pill gray">ModelPortraitGenerator (标准模特生成)</div>
          <div class="pill gray">CustomerCatalogImportService (画册导入)</div>
        </div>
      </div>

      <!-- Middle Row: 3 Sub-Systems -->
      <div class="core-mid-row">
        <div class="sub-panel stack-col">
          <div class="sub-panel-title">Progress & Event System</div>
          <div class="pill gray">指数衰减伪进度推进器</div>
          <div class="pill gray">92 * (1 - exp(-t / 30)) 曲线</div>
          <div class="pill gray">单调递增防回退状态机</div>
          <div class="pill gray">BatchJob 异步批量进度流</div>
        </div>

        <div class="sub-panel">
          <div class="sub-panel-title">Identity-Preserving Try-On Core (保身份发丝级试戴合成核心)</div>
          <div class="engine-flow">
            <div class="pill gray" style="padding:14px">1. 提取 WigAsset 本体图<br/><span style="font-size:13px;color:#475569">剔除商品模特五官干扰</span></div>
            <div class="pill amber" style="padding:14px">2. PromptBuilder 编译<br/><span style="font-size:13px;color:#0f172a">发丝根根分明·消塑料蜡像感</span></div>
            <div class="pill gray" style="padding:14px">3. 多模态双图融合编辑<br/><span style="font-size:13px;color:#475569">replace_first / inpaint</span></div>
            <div class="pill lavender" style="padding:14px">4. 变化分校验 (minScore)<br/><span style="font-size:13px;color:#0f172a">低于 7.0 自动触发强化重试</span></div>
            <div class="pill lavender" style="padding:14px">5. 下半脸护栏 (FaceGuard)<br/><span style="font-size:13px;color:#0f172a">防止五官漂移与改脸</span></div>
            <div class="pill gray" style="padding:14px">6. 落盘本地/OSS 并返回<br/><span style="font-size:13px;color:#475569">进度瞬时置为 100%</span></div>
          </div>
        </div>

        <div class="sub-panel stack-col">
          <div class="sub-panel-title">Storage & Workspace</div>
          <div class="pill gray">本地 ./data/storage 免Docker</div>
          <div class="pill gray">公网 URL 自动下载落盘</div>
          <div class="pill gray">ShowcaseIntegrity 完整性自检</div>
          <div class="pill gray">24h 会话自动清理守护</div>
        </div>
      </div>

      <!-- Bottom Row: AiServiceRouter, Prompt Engine, Guardrails -->
      <div class="core-bot-row">
        <div class="sub-panel stack-col">
          <div class="sub-panel-title">AiServiceRouter (@Primary 动态路由)</div>
          <div class="pill-grid-2x2">
            <div class="pill gray">preferredModel 动态覆盖</div>
            <div class="pill gray">DashScope / Ark / Yunwu</div>
            <div class="pill gray">strict-real 联调开关</div>
            <div class="pill gray">异常零中断降级 Seed</div>
          </div>
        </div>

        <div class="sub-panel stack-col">
          <div class="sub-panel-title">Prompt & Catalog Rules</div>
          <div class="pill gray">FULL_WIG / LOCAL_BANGS / HAIRLINE</div>
          <div class="pill gray">CustomerCatalogRules 智能归类</div>
        </div>

        <div class="sub-panel stack-col">
          <div class="sub-panel-title">Security & Demo Recording Acceleration</div>
          <div class="pill-grid-2x2">
            <div class="pill gray">demo-fast-face-check 秒过</div>
            <div class="pill gray">demo-fast-recommend 秒推</div>
            <div class="pill gray">AdminAuthInterceptor 门禁</div>
            <div class="pill gray">API Key 环境变量隔离</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Sidebar -->
    <div class="box right-sidebar">
      <div class="side-tool">
        <h4 style="color:#7c3aed">BareWig AI</h4>
        <p>从真人商品图自动剥离<br/>生成纯白底假发本体图</p>
      </div>
      <div class="side-tool">
        <h4 style="color:#2563eb">Model Studio</h4>
        <p>按脸型/年龄段批量生成<br/>标准化试戴模特肖像</p>
      </div>
      <div class="side-tool">
        <h4 style="color:#059669">Catalog Wizard</h4>
        <p>客户原始文件夹一键扫描<br/>自动入库并合成展厅</p>
      </div>
      <div class="side-tool">
        <h4 style="color:#ea580c">Store O2O</h4>
        <p>线上试戴满意一键锁客<br/>线下门店定制转化闭环</p>
      </div>
    </div>

    <!-- Bottom Infrastructure Row -->
    <div class="bot-infra">
      <div class="infra-card">
        <div class="eco-chip"><span class="eco-dot" style="background:#059669">BOOT</span> Spring Boot 3.2</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#2563eb">VITE</span> Vite 6 + Tailwind 4</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#7c3aed">MOTION</span> Framer Motion 动画</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#ea580c">ZERO</span> 零 MySQL / 零 Redis 依赖</div>
      </div>

      <div class="infra-card infra-wide">
        <div class="eco-chip"><span class="eco-dot" style="background:#4f46e5">BAILIAN</span> 阿里云百炼 DashScope</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#0284c7">ARK</span> 火山方舟 Doubao Seedream</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#059669">YUNWU</span> 云雾 OpenAI 兼容网关</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#d97706">FLUX</span> Flux Kontext 专有链路</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#e11d48">TEST</span> JUnit 5 + Python 验收测试</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#0f172a">REC</span> start-demo-recording 录屏模式</div>
      </div>

      <div class="infra-card">
        <div class="eco-chip"><span class="eco-dot" style="background:#16a34a">MIT</span> MIT Open Source</div>
        <div class="eco-chip"><span class="eco-dot" style="background:#111827">GH</span> GitHub Release</div>
      </div>
    </div>
  </div>
</body>
</html>`;

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({
  viewport: { width: 2200, height: 1560 },
  deviceScaleFactor: 1.5,
});

const terraOut = "/Users/wangguo/Projects/terra-world-travel/docs/architecture/terra-panoramic-architecture.png";
await page.setContent(terraHtml, { waitUntil: "networkidle" });
await page.screenshot({ path: terraOut, type: "png" });
console.log("Saved", terraOut);

const wigOut = "/Users/wangguo/Projects/GitHub/Vs代码/docs/architecture/wig-tryon-panoramic-architecture.png";
await page.setContent(wigHtml, { waitUntil: "networkidle" });
await page.screenshot({ path: wigOut, type: "png" });
console.log("Saved", wigOut);

await browser.close();
