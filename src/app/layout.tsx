import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";

// 全局 SEO 与 OpenGraph 基础元数据配置
export const metadata: Metadata = {
  metadataBase: new URL("https://terra.statementflow.win"),
  title: "TERRA-OASIS · Playable Neural World Simulator",
  description:
    "Open-source playable 3D Earth & action-conditioned world simulator. Stream 60 FPS MapLibre GL v5 3D terrain, satellite imagery, and explore 100+ World Models research papers.",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "TERRA-OASIS · Playable Neural World Simulator",
    description:
      "Open-source playable 3D Earth & action-conditioned world simulator. Stream 60 FPS MapLibre GL v5 3D terrain and explore 100+ World Models research papers.",
    url: "https://terra.statementflow.win",
    siteName: "TERRA-OASIS",
    type: "website",
    images: [
      {
        url: "/images/showcase/3-interactive-simulator.png",
        width: 1200,
        height: 630,
        alt: "TERRA-OASIS Playable 3D World Simulator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TERRA-OASIS · Playable Neural World Simulator",
    description:
      "Open-source playable 3D Earth & action-conditioned world simulator with 100+ World Models research knowledge graph.",
    images: ["/images/showcase/3-interactive-simulator.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TERRA-OASIS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-[#f5f5f7]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
