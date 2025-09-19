import "dotenv/config";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";
const withNextIntl = createNextIntlPlugin();

import { createRequire } from "module";
import getEnv from "./bin/webpack/env.js";
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
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev }) => {
    // Apply provider-resolving loader only for production builds (next build)
    if (!dev) {
      config.module.rules.unshift({
        test: /\.[jt]sx?$/,
        enforce: "pre",
        include: [path.resolve("src")],
        exclude: /node_modules/,
        use: [
          {
            loader: path.resolve("bin/webpack/resolve-provider.js"),
            options: {
              provider: process.env.NEXT_PUBLIC_CMS_PROVIDER,
              providers: ["shopify", "shopana"],
            },
          },
        ],
      });
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
