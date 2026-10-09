import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // 1. Host canonicalization: 301 permanent redirect from www to apex domain
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.dinanathandsons.com',
          },
        ],
        destination: 'https://dinanathandsons.com/:path*',
        permanent: true,
      },
      // 2. Category root-level shortcuts (resolves GSC redirect errors)
      { source: '/chemicals', destination: '/shop/category/chemicals', permanent: true },
      { source: '/packaging', destination: '/shop/category/packaging', permanent: true },
      { source: '/polishing', destination: '/shop/category/polishing', permanent: true },
      { source: '/hand-tools', destination: '/shop/category/hand-tools', permanent: true },
      { source: '/machines', destination: '/shop/category/machines', permanent: true },
      { source: '/consumables', destination: '/shop/category/consumables', permanent: true },
      { source: '/bullion', destination: '/shop/category/bullion', permanent: true },
      { source: '/shop/category/tools', destination: '/shop/category/hand-tools', permanent: true },
      { source: '/shop/category/goldsmith-tools', destination: '/shop/category/hand-tools', permanent: true },

      // 3. High-priority legacy product URLs & GSC 404 remediations
      { source: '/shop/graphite-crucible-70-70', destination: '/shop/dinanaths-graphite-crucible-1405', permanent: true },
      { source: '/shop/graphite-crucible-75-75', destination: '/shop/dinanaths-graphite-crucible-1405', permanent: true },
      { source: '/shop/dinanaths-graphite-crucible', destination: '/shop/dinanaths-graphite-crucible-1405', permanent: true },
      { source: '/shop/e020a21b-e90e-4330-b619-f7ce9664564e', destination: '/shop/dinanaths-graphite-crucible-1405', permanent: true },
      { source: '/shop/magnetic-polishing-machine-8-inch', destination: '/shop/magnetic-polishing-machine-0743', permanent: true },
      { source: '/shop/marathon-m4-lab-micromotor', destination: '/shop/marathon-m4-lab-micromotor-4222', permanent: true },
      { source: '/shop/tik-tak-silver-cleaner', destination: '/shop/tik-tak-silver-cleaner-9990', permanent: true },
      { source: '/shop/suhaga-goti-khaar-goti', destination: '/shop/suhaga-goti-khaar-goti-2749', permanent: true },
      { source: '/shop/nipper-cutter', destination: '/shop/dinanath-s-stainless-steel-mini-diagonal-nipper-4601', permanent: true },
      { source: '/shop/lakh-bangle-choodi', destination: '/shop/lakh-bangle-choodi-9080', permanent: true },
      { source: '/shop/metal-ear-piercing-gun-with-marking-pen-and-supporting-mirror', destination: '/shop/metal-ear-piercing-gun-with-marking-pen-and-supporting-mirror-3344', permanent: true },
      { source: '/shop/foredom-machine-hang-up-flexible-shaft-hanging-machine', destination: '/shop/foredom-machine-hang-up-flexible-shaft-machine-for-multipurpose-task-carving-cutting-grinding-sanding-polishing-and-craft-work-professional-rotary-tool-with-variable-speed-contro-5584', permanent: true },
      { source: '/shop/1kg-gold-silver-ingot-mould', destination: '/shop/1kg-gold-silver-ingot-mould-3321', permanent: true },
      { source: '/shop/2-in-1-manual-casting-machine', destination: '/shop/2-in-1-manual-casting-machine-2939', permanent: true },
      { source: '/shop/auto-clamp-wax-injector-with-vaccum-pump', destination: '/shop/auto-clamp-wax-injector-with-vaccum-pump-0837', permanent: true },
      { source: '/shop/black-kasauti-gold-testing-stone-big-size', destination: '/shop/black-kasauti-gold-testing-stone-big-size-9772', permanent: true },
      { source: '/shop/black-kasauti-gold-testing-stone-medium-size', destination: '/shop/black-kasauti-gold-testing-stone-medium-size-1414', permanent: true },
      { source: '/shop/black-kasauti-gold-testing-stone-small-size', destination: '/shop/black-kasauti-gold-testing-stone-small-size-3233', permanent: true },
      { source: '/shop/silver-coin-card-pack', destination: '/shop/silver-coin-card-pack-8046', permanent: true },

      // 4. Remove public exposure of /seed route
      {
        source: '/seed',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/seed/:path*',
        destination: '/shop',
        permanent: true,
      },
    ];
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
