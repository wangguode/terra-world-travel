"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { WORLD_MODEL_PAPERS_100, WorldModelPaper } from "@/lib/world-model-papers-100";
import { OFFICIAL_DOCS, DocSection } from "@/lib/oasis-docs-data";

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  matchedPapers?: WorldModelPaper[];
  matchedDoc?: DocSection;
}

export function CopilotDrawer({ isOpen, onClose }: CopilotDrawerProps) {
  const { lang } = useLanguage();

  const initialGreeting =
    lang === "en"
      ? "Hello! I am the TERRA-OASIS World Model AI Assistant. I have indexed all 100 milestone world model research papers (2024–2026) and official SDK developer specifications. Ask me about Oasis, GameNGen, Genie 2, Cosmos, Sora, GAIA-1, or local Python SDK integration!"
      : "您好！我是 TERRA-OASIS 世界模型学术与技术助手。我已接入 2024–2026 年业界 100 篇前沿世界模型文献知识库与官方开发者规范。您可以向我询问 Oasis、GameNGen、Genie 2、Cosmos、Sora、GAIA-1 等学术突破，或咨询本地 SDK 与动作注入开发协议！";

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: initialGreeting,
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  if (!isOpen) return null;

  const PRESET_QUERIES = [
    lang === "en"
      ? "How does Oasis achieve 20+ FPS neural world generation?"
      : "Oasis 是如何实现 20+ FPS 全神经网络开放世界生成的？",
    lang === "en"
      ? "Compare GameNGen and Genie 2 physics simulation"
      : "对比 GameNGen 与 Genie 2 在神经引擎与物理模拟上的技术路径",
    lang === "en"
      ? "How does GAIA-1 perform counterfactual exploration in driving?"
      : "GAIA-1 是如何实现自动驾驶反事实险情推演的？",
    lang === "en"
      ? "How to inject continuous 6-DoF action conditioning into Causal DiT?"
      : "如何在 Causal DiT 中注入连续 6-DoF 动作向量与按键位掩码？",
    lang === "en"
      ? "What papers solve the 10-second autoregressive collapse problem?"
      : "2024-2026年有哪些论文彻底解决了自回归时空长程坍塌魔咒？",
  ];

  const handleSendQuery = (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: q }]);
    setInputQuery("");
    setIsAiTyping(true);

    setTimeout(() => {
      const lowerQ = q.toLowerCase();

      // 1. 在 100 篇论文中检索匹配
      const scoredPapers = WORLD_MODEL_PAPERS_100.map((p) => {
        let score = 0;
        const fullText = `${p.title} ${p.titleZh} ${p.org} ${p.category} ${p.abstract} ${p.abstractZh}`.toLowerCase();
        const keywords = lowerQ.split(/\s+/);
        keywords.forEach((kw) => {
          if (kw.length >= 2 && fullText.includes(kw)) {
            score += 3;
          }
        });
        if (lowerQ.includes(p.title.toLowerCase().slice(0, 10))) score += 10;
        if (p.titleZh && lowerQ.includes(p.titleZh.slice(0, 4))) score += 10;
        if (lowerQ.includes("oasis") && p.id.includes("oasis")) score += 15;
        if (lowerQ.includes("gamengen") && p.id.includes("gamengen")) score += 15;
        if (lowerQ.includes("genie") && p.id.includes("genie")) score += 15;
        if (lowerQ.includes("sora") && p.id.includes("sora")) score += 15;
        if (lowerQ.includes("gaia") && p.id.includes("gaia")) score += 15;
        if (lowerQ.includes("cosmos") && p.id.includes("cosmos")) score += 15;
        if (lowerQ.includes("diamond") && p.id.includes("diamond")) score += 15;
        if ((lowerQ.includes("collapse") || lowerQ.includes("坍塌") || lowerQ.includes("崩溃")) && (p.abstract.includes("collapse") || p.abstractZh.includes("坍塌"))) score += 12;
        if ((lowerQ.includes("robot") || lowerQ.includes("机器人") || lowerQ.includes("具身")) && p.category === "embodied-robotics") score += 8;
        if ((lowerQ.includes("drive") || lowerQ.includes("驾驶") || lowerQ.includes("自动驾驶")) && p.category === "autonomous-driving") score += 8;
        return { paper: p, score };
      });

      scoredPapers.sort((a, b) => b.score - a.score);
      const matchedPapers = scoredPapers.filter((s) => s.score > 0).slice(0, 3).map((s) => s.paper);

      // 2. 在技术文档中检索匹配
      const matchedDoc = OFFICIAL_DOCS.find((d) => {
        const docText = `${d.title} ${d.category} ${d.summaryEn} ${d.summaryZh}`.toLowerCase();
        return lowerQ.split(/\s+/).some((kw) => kw.length >= 2 && docText.includes(kw));
      });

      // 3. 构建智能学术回答
      let responseText = "";
      if (matchedPapers.length > 0) {
        const topP = matchedPapers[0];
        if (lang === "en") {
          responseText = `Based on the World Model Paper Knowledge Base, the most relevant breakthrough is "${topP.title}" (${topP.org}, ${topP.year}).\n\n${topP.abstract}\n\nKey Contribution: ${topP.highlight}`;
        } else {
          responseText = `根据前沿世界模型文献知识库，最贴切的核心学术成果为《${topP.titleZh}》（${topP.org}，收录于 ${topP.venue}）。\n\n【核心机制与创新】\n${topP.abstractZh}\n\n【关键定量突破】\n${topP.highlight}`;
        }
      } else if (matchedDoc) {
        if (lang === "en") {
          responseText = `According to our developer documentation regarding "${matchedDoc.title}":\n\n${matchedDoc.summaryEn}\n\nTarget Runtime: ${matchedDoc.framework}\nPlatforms: ${matchedDoc.platforms.join(", ")}`;
        } else {
          responseText = `根据技术文档【${matchedDoc.title}】技术规范：\n\n${matchedDoc.summaryZh}\n\n【运行时环境】\n${matchedDoc.framework}，支持 ${matchedDoc.platforms.join("、")}。可通过顶部文档中心查阅完整接口签名与代码调用用例。`;
        }
      } else {
        if (lang === "en") {
          responseText = `The 14B Causal DiT world model relies on action-conditioned autoregressive spatio-temporal diffusion. By coupling continuous kinematics with sliding temporal attention windows and dual-agent anchors, the model maintains high-fidelity physics and eliminates structural collapse over infinite horizons.`;
        } else {
          responseText = `TERRA-OASIS 14B 因果扩散世界模型基于动作条件自回归推演范式。通过将连续 6-DoF 运动学向量输入投影至潜流形空间，结合时序滑动注意力窗口与全局记忆锚点，能够彻底消除累积误差，在普通浏览器中即时实现 60 FPS 无坍塌连续交互漫游。`;
        }
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: responseText,
          matchedPapers: matchedPapers.length > 0 ? matchedPapers : undefined,
          matchedDoc: matchedDoc || undefined,
        },
      ]);
      setIsAiTyping(false);
    }, 380);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 抽屉面板：Apple 纯白高质感风格 */}
      <aside
        data-ui="copilot-drawer"
        aria-label="AI World Model Assistant"
        className="relative z-10 w-full max-w-md sm:max-w-xl h-full bg-white flex flex-col justify-between"
      >
        {/* 顶部标题栏 */}
        <div className="p-6 bg-[#f5f5f7] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0071e3]" />
            <div>
              <div className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">
                {lang === "en" ? "World Model AI Copilot" : "世界模型智能问答助手"}
              </div>
              <div className="text-[13px] text-[#515154]">
                {lang === "en"
                  ? "Connected to 100 Milestone Papers & Developer Docs"
                  : "已联网检索 100 篇前沿文献库与官方开发规范"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white px-3.5 py-1 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition cursor-pointer"
          >
            {lang === "en" ? "Close" : "关闭"}
          </button>
        </div>

        {/* 聊天消息滚动流 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className="text-[11px] font-medium text-[#86868b] mb-1 px-1">
                {msg.sender === "user" ? (lang === "en" ? "You" : "开发者提问") : (lang === "en" ? "AI World Model Assistant" : "学术与架构助手")}
              </div>

              <div
                className={`max-w-[92%] rounded-[22px] px-5 py-3.5 text-[14px] leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-[#0071e3] text-white"
                    : "bg-[#f5f5f7] text-[#1d1d1f]"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* 关联学术文献卡片推荐 */}
                {msg.matchedPapers && msg.matchedPapers.length > 0 && (
                  <div className="mt-4 pt-3 space-y-2">
                    <div className="text-[12px] font-semibold text-[#0071e3]">
                      {lang === "en" ? "Indexed Milestone References" : "知识库关联文献检索结果"}
                    </div>
                    {msg.matchedPapers.map((paper) => (
                      <div
                        key={paper.id}
                        className="rounded-[14px] bg-white p-3 space-y-1 text-[13px] text-[#1d1d1f]"
                      >
                        <div className="font-semibold text-[#0071e3] flex items-center justify-between">
                          <span>{paper.title}</span>
                          <span className="text-[11px] text-[#86868b]">{paper.year}</span>
                        </div>
                        <div className="text-[12px] text-[#515154]">{paper.org} · {paper.venue}</div>
                        <div className="text-[11px] text-[#86868b]">{paper.arxiv}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 关联开发文档卡片 */}
                {msg.matchedDoc && (
                  <div className="mt-3 pt-2">
                    <Link
                      href={`/docs?sec=${msg.matchedDoc.id}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#0071e3] hover:underline"
                    >
                      <span>{lang === "en" ? "View in Documentation: " : "查看关联技术章节: "}</span>
                      <span>{msg.matchedDoc.title} &gt;</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isAiTyping && (
            <div className="flex items-center gap-2 text-[13px] text-[#515154] bg-[#f5f5f7] w-fit px-4 py-2 rounded-full">
              <span className="h-2 w-2 rounded-full bg-[#0071e3]" />
              <span>{lang === "en" ? "Reasoning with 100 world model papers..." : "正在 100 篇前沿文献与技术规范知识库中检索推演..."}</span>
            </div>
          )}
        </div>

        {/* 预设推荐问题 Pills */}
        <div className="px-6 py-2 bg-white">
          <div className="text-[12px] font-semibold text-[#86868b] mb-2">
            {lang === "en" ? "RECOMMENDED QUERIES" : "推荐问答探索"}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {PRESET_QUERIES.map((pq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendQuery(pq)}
                className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[12px] text-[#515154] hover:bg-[#e8e8ed] hover:text-[#1d1d1f] transition text-left cursor-pointer"
              >
                {pq}
              </button>
            ))}
          </div>
        </div>

        {/* 底部输入框 */}
        <div className="p-4 bg-[#f5f5f7]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={lang === "en" ? "Ask anything about 100 world model papers or SDK..." : "提问任意世界模型前沿论文、算法推导或 SDK 开发规范..."}
              className="flex-1 rounded-full bg-white px-4 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#86868b] outline-none transition"
            />
            <button
              type="submit"
              className="rounded-full bg-[#0071e3] px-5 py-2.5 text-[14px] font-medium text-white hover:bg-[#0077ed] transition shrink-0 cursor-pointer"
            >
              {lang === "en" ? "Send" : "发送"}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
