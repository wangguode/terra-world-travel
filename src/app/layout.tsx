import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TERRA // 空间世界模型与跨国落地生存操作系统",
  description:
    "面向跨国出行与复杂物理空间的神经世界模型操作系统：支持首尔/北京/东京/曼谷空间动线推演、24小时时空光影孪生、历史遗址空间对齐与落地生存应急工作站。",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TERRA",
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
