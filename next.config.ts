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
        destination: '/google-merchant-feed.xml',
      },
      {
        source: '/merchant-feed.xml',
        destination: '/google-merchant-feed.xml',
      },
      {
        source: '/google-products.xml',
        destination: '/google-merchant-feed.xml',
      },
      {
        source: '/feed.xml',
        destination: '/google-merchant-feed.xml',
      },
      {
        source: '/merchant-feed.html',
        destination: '/google-merchant-feed.xml',
      },
      {
        source: '/google-products.html',
        destination: '/google-merchant-feed.xml',
      },
    ];
  },
};

export default nextConfig;
