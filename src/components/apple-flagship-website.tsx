"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  BeijingSpatialWorldModel,
} from "@/components/beijing-pulse-world-model";
import {
  WORLD_MODEL_DOMAINS,
  type WorldModelDomain,
} from "@/lib/world-model-catalog";

export function AppleFlagshipWebsite() {
  const [currentUrl, setCurrentUrl] = useState<string>(
    "https://terra-world-travel.153557421.workers.dev"
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [activeDomainId, setActiveDomainId] = useState<string>("autonomous-driving");
  const [activeHour, setActiveHour] = useState<number>(17.5);
  const [snowMode, setSnowMode] = useState<boolean>(false);

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
  }, []);

  useEffect(() => {
    const origin =
      typeof window !== "undefined" && window.location.origin.includes("workers.dev")
        ? window.location.origin
        : "https://terra-world-travel.153557421.workers.dev";

    QRCode.toDataURL(origin, {
      width: 400,
      margin: 1,
      color: {
        dark: "#070707",
        light: "#f5f5f7",
      },
    })
      .then((dataUri) => {
        setCurrentUrl(origin);
        setQrCodeDataUrl(dataUri);
      })
      .catch(() => {});
  }, []);

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

  const handleTeleportToDomain = (domainId: string) => {
    setActiveDomainId(domainId);
    const el = document.getElementById("spatial-stage");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#070707] text-[#f5f5f7]">
      {/* 顶部极简透明悬浮 Topbar */}
      <header className="absolute top-0 left-0 right-0 z-40 bg-transparent py-4 sm:py-5 pointer-events-none">
        <div className="flex w-full items-center justify-between gap-4 px-6 sm:px-10">
          <a
            href="#spatial-stage"
            className="pointer-events-auto flex items-center gap-2 text-[16px] sm:text-[18px] font-bold tracking-tight text-white no-underline"
          >
            <span className="h-2 w-2 rounded-full bg-[#c23b3b]" />
            <span>TERRA WORLD MODEL NEXUS</span>
            <span className="text-[14px] font-normal text-white/40 tracking-wider hidden sm:inline">
              统一世界模型仿真平台
            </span>
          </a>

          <nav
            aria-label="主导航"
            className="pointer-events-auto flex items-center gap-4 sm:gap-8 text-[14px] sm:text-[16px]"
          >
            <a
              href="#spatial-stage"
              className="text-white/70 hover:text-white no-underline transition hidden md:inline"
            >
              交互仿真
            </a>
            <a
              href="#domain-matrix"
              className="text-white/70 hover:text-white no-underline transition hidden md:inline"
            >
              六大核心领域
            </a>
            <a
              href="#enterprise-scenarios"
              className="text-white/70 hover:text-white no-underline transition hidden md:inline"
            >
              商业与客户价值
            </a>
            <button
              type="button"
              onClick={() => setSnowMode(!snowMode)}
              className={`terra-btn rounded-full px-3.5 sm:px-4 py-1.5 text-[14px] font-medium transition ${
                snowMode
                  ? "bg-[#c23b3b] text-white"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {snowMode ? "已覆初雪" : "严苛环境模拟"}
            </button>
            <a
              href="#enterprise-scenarios"
              className="terra-btn rounded-full bg-white px-4 sm:px-5 py-1.5 text-[14px] font-semibold text-[#070707] no-underline hover:bg-white/90"
            >
              商业方案
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* 核心第一屏：开源世界模型统一交互仿真控制台 */}
        <section id="spatial-stage" className="relative w-full h-[100dvh] overflow-hidden bg-[#070707]">
          <div className="absolute top-20 sm:top-24 left-6 right-6 sm:right-auto sm:left-10 z-30 max-w-2xl pointer-events-auto">
            <h1 className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight leading-tight">
              世界模型前沿仿真平台 // TERRA World Model
            </h1>
            <p className="mt-2 text-[18px] sm:text-[20px] text-white/80 leading-relaxed m-0 tnum">
              面向自驾因果预测、具身动力学评测与宏观战术沙盘的统一空间物理仿真系统
            </p>
          </div>

          <BeijingSpatialWorldModel
            activeDomainId={activeDomainId}
            onSelectDomain={setActiveDomainId}
            hour={activeHour}
            onChangeHour={setActiveHour}
            snowMode={snowMode}
          />
        </section>

        {/* 核心第二屏：六大世界模型应用领域矩阵 */}
        <section id="domain-matrix" className="bg-[#0c0c0e] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight">
                六大世界模型技术矩阵
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">
                涵盖工业级闭环自驾、具身智能虚实迁移、交互式时空扩散及防务推演，点击一键载入上方交互视界。
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {WORLD_MODEL_DOMAINS.map((domain: WorldModelDomain) => (
                <article
                  key={domain.id}
                  className="terra-reveal rounded-[24px] bg-[#141416] p-5 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01]"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[18px]">
                      <Image
                        src={domain.previewImage}
                        alt={domain.nameZh}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[14px] text-white/60">
                        {domain.badge}
                      </span>
                      <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[14px] text-white/40">
                        {domain.openSourceReference}
                      </span>
                    </div>

                    <h3 className="mt-3 text-[20px] font-bold text-white tracking-tight">
                      {domain.nameZh}
                      <span className="block text-[14px] font-normal text-white/40">
                        {domain.nameEn}
                      </span>
                    </h3>

                    <p className="mt-2 text-[16px] text-white/70 leading-relaxed">
                      {domain.summaryZh}
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2 bg-white/5 rounded-[12px] p-2.5 text-[14px] tnum">
                      {domain.benchmarkMetrics.map((metric) => (
                        <div key={metric.label}>
                          <div className="text-white/40 text-[14px]">{metric.label}</div>
                          <div className="text-white font-medium text-[14px]">{metric.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3">
                    <button
                      type="button"
                      onClick={() => handleTeleportToDomain(domain.id)}
                      className="terra-btn w-full rounded-full bg-white/10 py-2.5 text-[14px] font-medium text-white hover:bg-white/20 transition"
                    >
                      在世界模型中载入仿真 ↑
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 核心第三屏：受众、客户与商业落地场景专章 */}
        <section id="enterprise-scenarios" className="bg-[#070707] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="max-w-2xl terra-reveal">
              <h2 className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight">
                商业场景与客户价值全景
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">
                明确回答本平台的面向受众、目标客户、使用场景及商业变现闭环。
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 客户群体与受众画像 */}
              <div className="rounded-[28px] bg-[#121214] p-8 terra-reveal space-y-6">
                <h3 className="text-[24px] font-bold text-white tracking-tight">
                  面向受众与核心客户画像
                </h3>
                
                <div className="space-y-4 text-[16px] leading-relaxed">
                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">自动驾驶主机厂与 Tier 1 方案商</div>
                    <div className="text-white/70 mt-1">
                      面向自驾算法团队与测试部门。痛点在于真实道路长尾危险极端工况采集极其困难，通过世界模型日行千万公里虚拟路测，降低 90% 实车成本。
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">具身智能与人形机器人研发团队</div>
                    <div className="text-white/70 mt-1">
                      面向机械臂与双足机器人研发科学家。在全物理守恒仿真环境中完成灵巧抓取与避障策略的 Sim-to-Real 闭环迁移，零硬件损耗。
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">国防防务推演中心与应急管理智库</div>
                    <div className="text-white/70 mt-1">
                      面向战略态势研判与灾害预防规划。在真实地理 GIS 时空阵列上进行千级智能体非完全信息对抗博弈与地质灾害推演。
                    </div>
                  </div>
                </div>
              </div>

              {/* 商业落地场景与变现模式 */}
              <div className="rounded-[28px] bg-[#121214] p-8 terra-reveal space-y-6">
                <h3 className="text-[24px] font-bold text-white tracking-tight">
                  商业落地场景与变现闭环
                </h3>

                <div className="space-y-4 text-[16px] leading-relaxed">
                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">虚拟路测与极端工况推演 SaaS 订阅</div>
                    <div className="text-white/70 mt-1">
                      向车企提供多视角自驾世界模型 API 与私有化集群部署，按日测里程与算力节点按需计费，支持量产车规级安全评测。
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">具身合成数据流水线服务（Data-as-a-Service）</div>
                    <div className="text-white/70 mt-1">
                      为机器人公司生产物理规律完备的合成视频与点云轨迹数据，按数据包规模与复杂交互轮次收费。
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-[16px] p-4">
                    <div className="font-semibold text-white">大模型物理常识安全认证与沙盘定制</div>
                    <div className="text-white/70 mt-1">
                      作为空间智能领域的权威基准测试平台，提供基础模型物理常识准入认证报告与军工/应急沙盘专属项目交付。
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 体验与离线手持伴侣 */}
            <div className="mt-10 rounded-[32px] bg-[#121214] p-8 sm:p-14 terra-reveal">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                  <h3 className="text-[24px] sm:text-[32px] font-bold text-white tracking-tight">
                    即刻接入世界模型仿真引擎
                  </h3>
                  <p className="mt-4 text-[16px] sm:text-[18px] text-white/70 leading-relaxed max-w-xl">
                    支持在任意移动设备与工作站上无缝预览开源世界模型仿真流，随时随地接入标准化空间物理推理接口。
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="terra-btn rounded-full bg-white px-7 py-3 text-[14px] font-bold text-black hover:bg-white/90 transition"
                    >
                      {copiedLink ? "已复制引擎访问网址" : "复制网址到移动端"}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <div className="rounded-3xl bg-white p-6 text-center">
                    {qrCodeDataUrl ? (
                      <Image
                        src={qrCodeDataUrl}
                        alt="手机扫码体验"
                        width={200}
                        height={200}
                        unoptimized
                        className="h-48 w-48 rounded-xl object-contain mx-auto"
                      />
                    ) : (
                      <div className="h-48 w-48 rounded-xl bg-gray-100 flex items-center justify-center text-black/50 text-[14px]">
                        加载二维码中
                      </div>
                    )}
                    <p className="mt-3 text-[14px] font-medium text-[#070707]">
                      手机扫码 · 实时仿真
                    </p>
                    <p className="text-[14px] text-[#070707]/60">
                      支持 iOS 与 Android 空间预览
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#070707] py-12 text-center text-[14px] text-white/40">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TERRA // World Model Nexus. Open Source Simulation.</p>
          <p>Autonomous Driving · Embodied AI · Physical Laws · Sandtable Wargaming</p>
        </div>
      </footer>
    </div>
  );
}
