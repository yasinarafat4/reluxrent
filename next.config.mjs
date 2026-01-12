// next.config.mjs;

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['mui-one-time-password-input', 'react-ipgeolocation', 'jwt-decode', 'ra-media-library'],
  experimental: {
    esmExternals: true,
    scrollRestoration: true,
    optimizeCss: true,
  },
  compiler: {
    styledComponents: true,
    reactRemoveProperties: true,
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    unoptimized: false,
    localPatterns: [
      { pathname: '/images/**', search: '' },
      { pathname: '/uploads/**', search: '' },
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'reluxrent.com' },
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/uploads/**' },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Use filesystem cache for faster rebuilds but avoid memory accumulation
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    return config;
  },
};

export default nextConfig;
