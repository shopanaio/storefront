import 'dotenv/config';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
const withNextIntl = createNextIntlPlugin();

import { createRequire } from 'module';
import getEnv from './bin/webpack/env.js';
const require = createRequire(import.meta.url);

const brand = process.env.BRAND || 'default';
const brandPathRelative = `./packages/brand-${brand}/src`;
const brandPathAbsolute = path.resolve(`packages/brand-${brand}/src`);

const cms = (process.env.CMS || 'shopana').toLowerCase();
const relayConfig = require(`./relay.${cms}.json`);

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: getEnv(),
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  // Transpile local packages for hot reload during development
  transpilePackages: ['@shopana/storefront-sdk'],
  compiler: {
    styledComponents: true,
    ...(process.env.STORYBOOK
      ? {}
      : { relay: relayConfig }),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    resolveAlias: {
      '@shopana/brand': brandPathRelative,
      '@shopana/brand/*': `${brandPathRelative}/*`,
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
