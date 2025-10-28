import 'dotenv/config';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
const withNextIntl = createNextIntlPlugin();

import { createRequire } from 'module';
import getEnv from './bin/webpack/env.js';
import webpack from 'webpack';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: getEnv(),
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  compiler: {
    styledComponents: true,
    ...(process.env.STORYBOOK
      ? {}
      : { relay: require(`./relay.${process.env.CMS}.json`) }),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { dev }) => {
    // Apply provider-resolving loader only for production builds (next build)
    if (!dev) {
      config.module.rules.unshift({
        test: /\.[jt]sx?$/,
        enforce: 'pre',
        include: [path.resolve('src')],
        exclude: /node_modules/,
        use: [
          {
            loader: path.resolve('bin/webpack/resolve-provider.js'),
            options: {
              provider: process.env.NEXT_PUBLIC_CMS_PROVIDER,
              providers: ['shopify', 'shopana'],
            },
          },
        ],
      });
    }

    // Replace @shopana/brand with the active brand package at build and dev time
    const brand = process.env.BRAND || 'default';
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^@shopana\/brand(\/.*)?$/,
        (resource) => {
          const suffix = resource.request.replace(/^@shopana\/brand/, '');
          resource.request = path.resolve(
            `packages/brand-${brand}/src${suffix}`
          );
        }
      )
    );

    return config;
  },
};

export default withNextIntl(nextConfig);
