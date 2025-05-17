import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', '127.0.0.1'], // No ports allowed here
  },
};

export default nextConfig;
