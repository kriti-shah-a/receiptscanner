import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["tesseract.js"],
  turbopack: { root: process.cwd() },
};

export default nextConfig;
