import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle for the Docker runtime image
  // (.next/standalone/server.js). See ../docs/deploy.md.
  output: "standalone",
  // Pin file tracing to this app dir. Without it, the empty root
  // package-lock.json makes Next infer the repo root as the tracing root and
  // nest the standalone output under frontend/, breaking the Dockerfile CMD.
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["mongodb", "pino", "pino-pretty"],
};

export default nextConfig;
