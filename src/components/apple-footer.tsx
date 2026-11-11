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
    <footer className="bg-[#050505] py-16 text-[13px] sm:text-[14px] text-[#a1a1a6]">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12">
          {/* 列 1 */}
          <div>
            <div className="text-[14px] font-semibold text-white mb-3">
              {t.footer.products}
            </div>
            <ul className="space-y-2 p-0 list-none">
              <li>
                <Link href="/" className="hover:text-white transition no-underline text-[#a1a1a6]">
                  {t.nav.overview}
                </Link>
              </li>
              <li>
                <Link href="/#interactive-playground" className="hover:text-white transition no-underline text-[#a1a1a6]">
                  {t.nav.sandbox}
                </Link>
              </li>
              <li>
                <Link href="/#technological-pillars" className="hover:text-white transition no-underline text-[#a1a1a6]">
                  {t.nav.pillars}
                </Link>
              </li>
              <li>
                <Link href="/#world-dimensions" className="hover:text-white transition no-underline text-[#a1a1a6]">
                  {t.dimensions.title}
                </Link>
              </li>
            </ul>
          </div>

          {/* 列 2 */}
          <div>
            <div className="text-[14px] font-semibold text-white mb-3">
              {t.footer.docs}
            </div>
            <ul className="space-y-2 p-0 list-none">
              <li>
                <Link href="/docs?sec=getting-started" className="hover:text-white transition no-underline text-[#a1a1a6]">
                  {lang === "en" ? "Quick Start & Setup" : "快速上手与环境配置"}
                </Link>
              </li>
              <li>
                <Link href="/docs?sec=action-protocol" className="hover:text-white transition no-underline text-[#a1a1a6]">
                  {lang === "en" ? "Action Protocol (API)" : "动作注入条件协议 (API)"}
                </Link>
              </li>
              <li>
                <Link href="/docs?sec=dit-backbone" className="hover:text-white transition no-underline text-[#a1a1a6]">
                  {lang === "en" ? "14B Causal DiT Backbone" : "14B 因果扩散骨干详解"}
                </Link>
              </li>
              <li>
                <Link href="/docs?sec=cluster-deploy" className="hover:text-white transition no-underline text-[#a1a1a6]">
                  {lang === "en" ? "8×H100 Cluster Deployment" : "8×H100 集群私有化部署"}
                </Link>
              </li>
            </ul>
          </div>

          {/* 列 3 */}
          <div>
            <div className="text-[14px] font-semibold text-white mb-3">
              {t.footer.research}
            </div>
            <ul className="space-y-2 p-0 list-none">
              <li>
                <Link href="/research#blog-1" className="hover:text-white transition no-underline text-[#a1a1a6]">
                  {lang === "en" ? "Beyond 10-Second Collapse" : "突破 10 秒崩溃魔咒"}
                </Link>
              </li>
              <li>
                <Link href="/research#blog-2" className="hover:text-white transition no-underline text-[#a1a1a6]">
                  {lang === "en" ? "Emergent Intuitive Physics" : "放弃手工着色器涌现物理"}
                </Link>
              </li>
              <li>
                <Link href="/research#blog-3" className="hover:text-white transition no-underline text-[#a1a1a6]">
                  {lang === "en" ? "Embodied AI Sim-to-Real" : "具身智能 Sim-to-Real 探索"}
                </Link>
              </li>
            </ul>
          </div>

          {/* 列 4 */}
          <div>
            <div className="text-[14px] font-semibold text-white mb-3">
              {t.footer.community}
            </div>
            <ul className="space-y-2 p-0 list-none">
              <li>
                <a
                  href="https://github.com/wangguode/terra-world-travel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition no-underline text-[#a1a1a6]"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/wangguode/terra-world-travel/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition no-underline text-[#a1a1a6]"
                >
                  Release Notes (v2.0.0)
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleCopyBibtex}
                  className="hover:text-white transition p-0 text-left"
                >
                  {lang === "en" ? "Copy BibTeX Citation" : "复制 BibTeX 学术引用"}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#86868b]">
          <div>{t.footer.rights}</div>
          <div>{t.footer.license}</div>
        </div>
      </div>
    </footer>
  );
}
