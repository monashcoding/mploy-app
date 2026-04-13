import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongodb", "pino", "pino-pretty"],
};

export default nextConfig;
