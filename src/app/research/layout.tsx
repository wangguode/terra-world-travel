import type { Metadata } from "next";

// 学术知识库子页面独立 Canonical 与 OpenGraph 配置
export const metadata: Metadata = {
  title: "World Models Research & Knowledge Graph · TERRA-OASIS",
  description:
    "Explore an interactive citation graph and technical deep-dives across 100+ World Models publications from DeepMind, OpenAI, NVIDIA, World Labs, and Wayve.",
  alternates: {
    canonical: "/research",
  },
  openGraph: {
    title: "World Models Research & Knowledge Graph · TERRA-OASIS",
    description:
      "Interactive citation network and deep-dive articles covering 100+ World Models papers (2024–2026).",
    url: "https://terra.statementflow.win/research",
    siteName: "TERRA-OASIS",
    type: "website",
    images: [
      {
        url: "/images/showcase/2-knowledge-graph.png",
        width: 1200,
        height: 630,
        alt: "TERRA-OASIS World Models Knowledge Graph",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "World Models Research & Knowledge Graph · TERRA-OASIS",
    description:
      "Interactive citation network and deep-dive articles covering 100+ World Models papers (2024–2026).",
    images: ["/images/showcase/2-knowledge-graph.png"],
  },
};

export default function ResearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
