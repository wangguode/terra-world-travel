import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  /* 适配 Cloudflare Pages 静态边缘导出与 GitHub Pages 多环境自动适配 */
  output: "export",
  basePath: isGithubActions ? "/terra-world-travel" : "",
  assetPrefix: isGithubActions ? "/terra-world-travel" : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
