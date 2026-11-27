import type { Metadata } from "next";

// 开发者文档子页面独立 Canonical 与 OpenGraph 配置
export const metadata: Metadata = {
  title: "Developer Documentation · TERRA-OASIS",
  description:
    "Developer documentation, architecture specifications, action-conditioning protocols, and WebGL 3D Earth deployment guides for TERRA-OASIS.",
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title: "Developer Documentation · TERRA-OASIS",
    description:
      "Architecture guides, action protocols, and zero-key static edge deployment documentation for TERRA-OASIS.",
    url: "https://terra.statementflow.win/docs",
    siteName: "TERRA-OASIS",
    type: "website",
    images: [
      {
        url: "/images/showcase/5-developer-documentation.png",
        width: 1200,
        height: 630,
        alt: "TERRA-OASIS Developer Documentation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Documentation · TERRA-OASIS",
    description:
      "Architecture guides, action protocols, and zero-key static edge deployment documentation for TERRA-OASIS.",
    images: ["/images/showcase/5-developer-documentation.png"],
  },
};

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
