import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/google-merchant-feed',
        destination: '/google-merchant-feed.html',
      },
      {
        source: '/merchant-feed.html',
        destination: '/google-merchant-feed.html',
      },
      {
        source: '/google-products.html',
        destination: '/google-merchant-feed.html',
      },
    ];
  },
};

export default nextConfig;
