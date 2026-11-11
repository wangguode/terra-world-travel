"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { getTranslation } from "@/lib/i18n";

export function AppleFooter() {
  const { lang } = useLanguage();
  const t = getTranslation(lang);

  const handleCopyBibtex = async () => {
    const bibtex = `@article{terra_oasis_2026,
  title={Terra-Oasis: Playable Action-Conditioned Neural World Model Application},
  author={Wang, Guo and Terra World Lab Team},
  journal={arXiv preprint arXiv:2603.01892},
  year={2026}
}`;
    try {
      await navigator.clipboard.writeText(bibtex);
      alert(lang === "en" ? "BibTeX citation copied to clipboard!" : "学术引用 BibTeX 已复制到剪贴板！");
    } catch {
      alert(lang === "en" ? "BibTeX citation copied to clipboard!" : "学术引用 BibTeX 已复制到剪贴板！");
    }
  };

  return (
    <footer className="bg-[#f5f5f7] py-16 text-[13px] sm:text-[14px] text-[#6e6e73] transition-colors">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12">
          {/* 列 1 */}
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
                <Link href="/#interactive-playground" className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]">
                  {t.nav.sandbox}
                </Link>
              </li>
              <li>
                <Link href="/#ecosystem-pillars" className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]">
                  {t.nav.pillars}
                </Link>
              </li>
              <li>
                <Link href="/#interactive-playground" className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]">
                  {t.dimensions.title}
                </Link>
              </li>
            </ul>
          </div>

          {/* 列 2 */}
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

          {/* 列 3 */}
          <div>
            <div className="text-[14px] font-semibold text-[#1d1d1f] mb-3">
              {t.footer.research}
            </div>
            <ul className="space-y-2 p-0 list-none">
              <li>
                <Link href="/research#blog-1" className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]">
                  {lang === "en" ? "Beyond 10-Second Collapse" : "突破 10 秒崩溃魔咒"}
                </Link>
              </li>
              <li>
                <Link href="/research#blog-2" className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]">
                  {lang === "en" ? "Hybrid GS & Diffusion Dynamics" : "高斯场与扩散动力学融合"}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleCopyBibtex}
                  className="hover:text-[#1d1d1f] transition text-[#6e6e73] text-left p-0 bg-transparent border-0 cursor-pointer"
                >
                  {lang === "en" ? "Copy BibTeX Citation" : "复制学术 BibTeX 引用"}
                </button>
              </li>
              <li>
                <a
                  href="https://arxiv.org"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]"
                >
                  arXiv:2603.01892 (2026) ↗
                </a>
              </li>
            </ul>
          </div>

          {/* 列 4 */}
          <div>
            <div className="text-[14px] font-semibold text-[#1d1d1f] mb-3">
              {t.footer.community}
            </div>
            <ul className="space-y-2 p-0 list-none">
              <li>
                <a
                  href="https://github.com/wangguode/terra-world-travel"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]"
                >
                  GitHub Repository ↗
                </a>
              </li>
              <li>
                <a
                  href="https://huggingface.co"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]"
                >
                  HuggingFace Checkpoints ↗
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]"
                >
                  Discord Community ↗
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@terra-world-travel.org"
                  className="hover:text-[#1d1d1f] transition no-underline text-[#6e6e73]"
                >
                  Developer Relations ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 底部版权与免责声明 */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[13px] text-[#6e6e73]">
          <div>
            <span>{t.footer.rights}</span>
            <span className="mx-2">·</span>
            <span>{t.footer.license}</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/docs" className="hover:text-[#1d1d1f] transition no-underline text-[#86868b]">
              {lang === "en" ? "Privacy Policy" : "隐私政策"}
            </Link>
            <Link href="/docs" className="hover:text-[#1d1d1f] transition no-underline text-[#86868b]">
              {lang === "en" ? "Terms of Use" : "使用条款"}
            </Link>
            <Link href="/docs" className="hover:text-[#1d1d1f] transition no-underline text-[#86868b]">
              {lang === "en" ? "Sales Policy" : "销售政策"}
            </Link>
            <Link href="/docs" className="hover:text-[#1d1d1f] transition no-underline text-[#86868b]">
              {lang === "en" ? "Legal Notice" : "法律声明"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
