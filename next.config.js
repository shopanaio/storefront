import 'dotenv/config';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { fileURLToPath } from 'url';
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

import getEnv from './bin/webpack/env.js';

const brand = process.env.BRAND || 'bite-crunch';
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const brandPackage =
  brand === 'xyz' ? '@shopana/brand-piknik' : `@shopana/brand-${brand}`;
const brandPathAbsolute = path.join(
  projectRoot,
  'packages',
  `brand-${brand}`,
  'src'
);

const graphqlImagePattern = (() => {
  try {
    const url = new URL(process.env.SHOPANA_GRAPHQL_URL);

    return {
      protocol: url.protocol.slice(0, -1),
      hostname: url.hostname,
      port: url.port,
      pathname: '/images/**',
    };
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: projectRoot,
  env: getEnv(),
  reactStrictMode: false,
  images: {
    // unoptimized: true,
    remotePatterns: [
      ...(graphqlImagePattern ? [graphqlImagePattern] : []),
      {
        protocol: 'https',
        hostname: 'nbg1.your-objectstorage.com',
        pathname: '/**',
      },
    ],
  },
  productionBrowserSourceMaps: true,
  // Transpile local packages for hot reload during development
  transpilePackages: [
    brandPackage,
    '@shopana/storefront-runtime',
    '@shopana/storefront-sdk',
  ],
  compiler: {
    styledComponents: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      '@shopana/brand': `${brandPackage}/src`,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shopana/brand': brandPathAbsolute,
    };

    return config;
  },
};

export default withNextIntl(nextConfig);
