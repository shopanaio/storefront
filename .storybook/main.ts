import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';
import react from '@vitejs/plugin-react';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packagesDir = path.join(root, 'packages');

/** Themes run their own Storybook. */
const THEMES = new Set(['brand-bite-crunch']);

const STORY_FILE = /\.(mdx|stories\.tsx?)$/;

const packages = readdirSync(packagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !THEMES.has(entry.name))
  .map((entry) => path.join(packagesDir, entry.name))
  .filter((dir) => existsSync(path.join(dir, 'package.json')));

/** Aliases of the `#name/*` subpath imports of every package. */
const subpathImports = Object.fromEntries(
  packages.flatMap((dir) => {
    const { imports = {} } = JSON.parse(
      readFileSync(path.join(dir, 'package.json'), 'utf8')
    ) as { imports?: Record<string, string> };
    return Object.entries(imports)
      .filter(([key, target]) => key.endsWith('/*') && target.endsWith('/*'))
      .map(([key, target]) => [
        key.slice(0, -2),
        path.join(dir, target.slice(0, -2)),
      ]);
  })
);

/**
 * The SDK maps its subpaths to directories of `dist` (`./*` → `./dist/*`), which Next resolves
 * and Vite does not; the stories read its sources instead.
 */
const SDK_SOURCES = {
  find: /^@shopana\/storefront-sdk(\/.*)?$/,
  replacement: path.join(packagesDir, 'shopana-storefront-sdk/src$1'),
};

/** The sign-in screens and their primitives are read from sources too, not from `dist`. */
const PACKAGE_SOURCES = [
  {
    find: /^@shopana\/storefront-auth\/ui$/,
    replacement: path.join(packagesDir, 'storefront-auth/src/ui/index.ts'),
  },
  {
    find: /^@shopana\/storefront-auth\/ui\/primitives$/,
    replacement: path.join(
      packagesDir,
      'storefront-auth/src/ui/primitives/index.ts'
    ),
  },
  {
    find: /^@shopana\/storefront-auth\/testing$/,
    replacement: path.join(packagesDir, 'storefront-auth/src/testing/index.ts'),
  },
  {
    find: /^@shopana\/storefront-auth\/react$/,
    replacement: path.join(packagesDir, 'storefront-auth/src/react/index.ts'),
  },
  {
    find: /^@shopana\/storefront-auth$/,
    replacement: path.join(packagesDir, 'storefront-auth/src/index.ts'),
  },
  {
    find: /^@shopana\/storefront-ui$/,
    replacement: path.join(packagesDir, 'storefront-ui/src/index.ts'),
  },
];

type Alias = { find: string | RegExp; replacement: string };

function toAliasList(alias: unknown): Alias[] {
  if (!alias) return [];
  if (Array.isArray(alias)) return alias as Alias[];
  return Object.entries(alias as Record<string, string>).map(
    ([find, replacement]) => ({ find, replacement })
  );
}

const config: StorybookConfig = {
  // Only the packages that have stories, so the others raise no "no story files" warning.
  stories: packages
    .filter((dir) => {
      const src = path.join(dir, 'src');
      return (
        existsSync(src) &&
        readdirSync(src, { recursive: true }).some((file) =>
          STORY_FILE.test(String(file))
        )
      );
    })
    .map((dir) => ({
      directory: path.relative(
        path.join(root, '.storybook'),
        path.join(dir, 'src')
      ),
      files: '**/*.@(mdx|stories.@(ts|tsx))',
    })),
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  typescript: { reactDocgen: 'react-docgen-typescript' },
  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    plugins: [...(viteConfig.plugins ?? []), react()],
    resolve: {
      ...viteConfig.resolve,
      alias: [
        ...toAliasList(viteConfig.resolve?.alias),
        ...toAliasList(subpathImports),
        SDK_SOURCES,
        ...PACKAGE_SOURCES,
      ],
    },
    server: {
      ...viteConfig.server,
      watch: {
        ...viteConfig.server?.watch,
        // Theme builds (.next, .runtime) churn files the stories never import.
        ignored: [...THEMES].map((theme) => `**/packages/${theme}/**`),
      },
    },
  }),
};

export default config;
