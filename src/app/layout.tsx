import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TERRA 3.0 // 跨国落地生存指南与空间世界模型漫游系统",
  description:
    "专为 iPhone、Android 与 PC 打造的全端跨国落地生存系统：首尔/北京/东京/曼谷黄金 120 分钟时间轴、空间世界模型第一视角动线推演、本土 App 平替映射与出租车双语急救卡。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TERRA Travel",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
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
