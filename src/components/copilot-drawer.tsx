"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { getTranslation } from "@/lib/i18n";
import { COPILOT_KNOWLEDGE_BASE, PRESET_PROMPTS } from "@/lib/oasis-copilot-data";

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CopilotDrawer({ isOpen, onClose }: CopilotDrawerProps) {
  const { lang } = useLanguage();
  const t = getTranslation(lang);

  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    {
      sender: "ai",
      text: t.copilot.initialMsg,
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  if (!isOpen) return null;

  const handleSendQuery = (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: q }]);
    setInputQuery("");
    setIsAiTyping(true);

    setTimeout(() => {
      const lowerQ = q.toLowerCase();
      let bestMatch = COPILOT_KNOWLEDGE_BASE[0];
      let maxScore = -1;

      COPILOT_KNOWLEDGE_BASE.forEach((item) => {
        let score = 0;
        item.keywords.forEach((kw) => {
          if (lowerQ.includes(kw.toLowerCase())) score += 2;
        });
        if (score > maxScore) {
          maxScore = score;
          bestMatch = item;
        }
      });

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `【${bestMatch.question}】\n\n${bestMatch.answer}`,
        },
      ]);
      setIsAiTyping(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 背景深色半透明遮罩 */}
      <div
        className="fixed inset-0 bg-black/70 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 右侧滑出抽屉面板 (Apple 风格暗色毛玻璃与精致布局) */}
      <aside
        data-ui="copilot-drawer"
        aria-label="AI Copilot Drawer"
        className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-[#121214] flex flex-col justify-between"
      >
        {/* 顶部标题栏 */}
        <div className="p-6 bg-[#161617] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#2997ff]" />
            <div>
              <div className="text-[17px] font-semibold text-white tracking-tight">
                {t.copilot.title}
              </div>
              <div className="text-[13px] text-[#86868b]">
                {t.copilot.sub}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1 text-[13px] text-white hover:bg-white/20 transition"
            aria-label="Close Drawer"
          >
            Close
          </button>
        </div>

        {/* 预设提示词快捷气泡 */}
        <div className="p-4 bg-[#141416] flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSendQuery(prompt)}
              className="rounded-full bg-white/5 px-3 py-1.5 text-[13px] text-[#d2d2d7] hover:bg-white/10 hover:text-white transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* 聊天对话流 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-[20px] px-4 py-3 text-[14px] sm:text-[15px] leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-[#0071e3] text-white"
                    : "bg-[#1d1d1f] text-[#f5f5f7] whitespace-pre-wrap"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isAiTyping && (
            <div className="text-[13px] text-[#2997ff] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2997ff]" />
              <span>{t.copilot.thinking}</span>
            </div>
          )}
        </div>

        {/* 底部输入框 */}
        <div className="p-4 bg-[#161617] flex gap-2.5">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendQuery();
            }}
            placeholder={t.copilot.placeholder}
            className="flex-1 rounded-full bg-[#1d1d1f] px-4 py-2.5 text-[14px] text-white placeholder-[#86868b] focus:outline-none focus:ring-1 focus:ring-[#2997ff]"
          />
          <button
            type="button"
            onClick={() => handleSendQuery()}
            className="rounded-full bg-[#0071e3] px-5 py-2.5 text-[14px] font-medium text-white hover:bg-[#0077ed] transition"
          >
            {t.copilot.send}
          </button>
        </div>
      </aside>
    </div>
  );
}
