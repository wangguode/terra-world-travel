import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 适配 Cloudflare Pages 静态边缘导出与 PWA 离线缓存 */
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
