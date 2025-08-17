import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Ensure compatibility with Vercel
  output: 'standalone',
};

export default nextConfig;
