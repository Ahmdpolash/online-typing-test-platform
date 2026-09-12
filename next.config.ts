import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      "@phosphor-icons/react",
      "motion",
      "class-variance-authority",
    ],
  },
};

export default nextConfig;
