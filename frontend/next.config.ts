import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["mongodb", "pino", "pino-pretty"],
};

export default nextConfig;
