import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TERRA 2.0 // 跨国落地生存指南与 3D 空间世界模型旅游平台 (Seoul & Beijing)",
  description:
    "专为 PC、Apple iPhone (iOS) 与 Android 打造的全端跨国落地生存系统：黄金 120 分钟时间轴、Web 3D 高斯点云世界模型漫游舱、本土 App 平替映射与出租车双语急救卡。",
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
