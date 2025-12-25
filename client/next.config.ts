import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
  allowedDevOrigins: [
    '*.replit.dev',
    '*.repl.co',
    '*.replit.app',
  ],
};

export default nextConfig;
