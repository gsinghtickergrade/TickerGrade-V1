import type { NextConfig } from "next";

const devDomain = process.env.REPLIT_DEV_DOMAIN || '';

const nextConfig: NextConfig = {
  allowedDevOrigins: devDomain ? [
    `https://${devDomain}`,
    `http://${devDomain}`,
    devDomain,
  ] : [],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
      {
        source: '/auth/:path*',
        destination: 'http://127.0.0.1:8000/auth/:path*',
      },
    ];
  },
};

export default nextConfig;
