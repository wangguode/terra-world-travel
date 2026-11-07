import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TERRA // 跨国落地生存指南与 3D 空间世界模型旅游平台 (Seoul & Beijing)",
  description:
    "解决跨国旅行下飞机前 120 分钟断网、换汇、打车、地图失效痛点，并通过 Web 3D 高斯点云世界模型沉浸式预演首尔与北京核心地标。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
