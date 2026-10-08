import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(process.cwd()) },
  allowedDevOrigins: ["127.0.0.1"],
  experimental: { globalNotFound: true },
};

export default nextConfig;
