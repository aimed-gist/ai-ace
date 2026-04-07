import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ai-ace",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
