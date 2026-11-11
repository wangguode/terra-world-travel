import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";

export const metadata: Metadata = {
  title: "TERRA-OASIS · Playable Neural World Simulator",
  description:
    "Open source action-conditioned neural world model web application. Real-time WASD roaming, emergent intuitive physics, and multi-dimensional sandbox simulation.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Terra Oasis",
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
