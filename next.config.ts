import type { NextConfig } from "next";

const API_SERVER = process.env['API_SERVER_URL'] || 'http://localhost:3001';

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: false },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_SERVER}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;