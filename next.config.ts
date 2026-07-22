import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "10.56.177.184:3000",
    "10.44.211.184:3000",
    "*.ngrok-free.app",
    "*.ngrok-free.dev"
  ],
};

export default nextConfig;
