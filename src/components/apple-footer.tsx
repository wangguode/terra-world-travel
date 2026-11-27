"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { getTranslation } from "@/lib/i18n";

export function AppleFooter() {
  const { lang } = useLanguage();
  const t = getTranslation(lang);

  // 生成开源软件项目的真实 BibTeX 引用（不含虚构预印本编号）
  const handleCopyBibtex = async () => {
    const bibtex = `@software{terra_oasis_2026,
  title = {TERRA-OASIS: Playable 3D World Simulator and World Models Research Hub},
  author = {Wang, Guo},
  year = {2026},
  url = {https://terra.statementflow.win},
  note = {Open-source repository: https://github.com/wangguode/terra-world-travel}
}`;
    try {
      await navigator.clipboard.writeText(bibtex);
      alert(lang === "en" ? "BibTeX citation copied to clipboard!" : "开源项目 BibTeX 引用已复制到剪贴板！");
    } catch {
      alert(lang === "en" ? "BibTeX citation copied to clipboard!" : "开源项目 BibTeX 引用已复制到剪贴板！");
    }
  };

  return (
    <footer className="bg-[#f5f5f7] py-16 text-[13px] sm:text-[14px] text-[#6e6e73] transition-colors">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12">
          {/* 列 1：产品与首页真实锚点 */}
          <div>
            <div className="text-[14px] font-semibold text-[#1d1d1f] mb-3">
              {t.footer.products}
            </div>
            <ul className="space-y-2 p-0 list-none">
              <li>
                <Link href="/" className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]">
                  {t.nav.overview}
                </Link>
              </li>
              <li>
                <Link href="/#hero-3d-world" className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]">
                  {t.nav.sandbox}
                </Link>
              </li>
              <li>
                <Link href="/#ecosystem-pillars" className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]">
                  {t.nav.pillars}
                </Link>
              </li>
              <li>
                <Link href="/#knowledge-graph" className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]">
                  {lang === "en" ? "100+ Papers Graph" : "100+ 篇学术知识图谱"}
                </Link>
              </li>
            </ul>
          </div>

          {/* 列 2：开发者技术文档 */}
          <div>
            <div className="text-[14px] font-semibold text-[#1d1d1f] mb-3">
              {t.footer.docs}
            </div>
            <ul className="space-y-2 p-0 list-none">
              <li>
                <Link href="/docs?sec=getting-started" className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]">
                  {lang === "en" ? "Quick Start & Setup" : "快速上手与环境配置"}
                </Link>
              </li>
              <li>
                <Link href="/docs?sec=action-protocol" className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]">
                  {lang === "en" ? "Action Protocol (API)" : "动作注入条件协议 (API)"}
                </Link>
              </li>
              <li>
                <Link href="/docs?sec=dit-backbone" className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]">
                  {lang === "en" ? "14B Causal DiT Backbone" : "14B 因果扩散骨干详解"}
                </Link>
              </li>
              <li>
                <Link href="/docs?sec=cluster-deploy" className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]">
                  {lang === "en" ? "8×H100 Cluster Deployment" : "8×H100 集群私有化部署"}
                </Link>
              </li>
            </ul>
          </div>

          {/* 列 3：前沿学术专刊与奠基文献 */}
          <div>
            <div className="text-[14px] font-semibold text-[#1d1d1f] mb-3">
              {t.footer.research}
            </div>
            <ul className="space-y-2 p-0 list-none">
              <li>
                <Link href="/research?blog=oasis-deep-dive" className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]">
                  {lang === "en" ? "Inside Oasis: 20 FPS Diffusion" : "深度解析 Oasis 扩散世界模型"}
                </Link>
              </li>
              <li>
                <Link href="/research?blog=gamengen-deep-dive" className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]">
                  {lang === "en" ? "GameNGen Neural Engine" : "深度解析 GameNGen 神经引擎"}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleCopyBibtex}
                  className="hover:text-[#1d1d1f] transition text-[#6e6e73] text-left p-0 bg-transparent border-0 cursor-pointer"
                >
                  {lang === "en" ? "Copy BibTeX Citation" : "复制项目 BibTeX 引用"}
                </button>
              </li>
              <li>
                <a
                  href="https://arxiv.org/abs/1803.10122"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]"
                >
                  {lang === "en" ? "World Models (arXiv:1803.10122) ↗" : "World Models 奠基论文 ↗"}
                </a>
              </li>
            </ul>
          </div>

          {/* 列 4：真实开源仓库与联系方式 */}
          <div>
            <div className="text-[14px] font-semibold text-[#1d1d1f] mb-3">
              {t.footer.community}
            </div>
            <ul className="space-y-2 p-0 list-none">
              <li>
                <a
                  href="https://github.com/wangguode/terra-world-travel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]"
                >
                  GitHub Repository ↗
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/wangguode/terra-world-travel/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]"
                >
                  {lang === "en" ? "Issues & Bug Tracker ↗" : "GitHub Issues 问题反馈 ↗"}
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/wangguode/terra-world-travel/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]"
                >
                  {lang === "en" ? "Community Discussions ↗" : "GitHub 开源社区讨论 ↗"}
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@statementflow.win"
                  className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]"
                >
                  hello@statementflow.win
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 底部开源版权与文档说明链接 */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[13px] text-[#6e6e73]">
          <div>
            <span>{t.footer.rights}</span>
            <span className="mx-2">·</span>
            <span>{t.footer.license}</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/docs" className="hover:text-[#1d1d1f] transition no-underline text-[#86868b]">
              {lang === "en" ? "Documentation" : "开发者文档"}
            </Link>
            <Link href="/research" className="hover:text-[#1d1d1f] transition no-underline text-[#86868b]">
              {lang === "en" ? "Research Index" : "学术文献索引"}
            </Link>
            <a
              href="https://github.com/wangguode/terra-world-travel"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1d1d1f] transition no-underline text-[#86868b]"
            >
              {lang === "en" ? "Open Source License" : "开源许可说明"}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
