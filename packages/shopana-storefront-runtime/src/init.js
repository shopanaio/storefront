import {
  access,
  cp,
  mkdir,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

export const frameworks = ['next', 'react-router'];

/**
 * What each framework generates: the default files (templates/<framework>/<file>), the root
 * files a theme may override them with, whether the theme `public` directory is linked into
 * the runtime (Vite serves it from the theme itself), and the outputs of its builds.
 */
const frameworkLayouts = {
  next: {
    defaultGeneratedFiles: [
      'app/layout.tsx',
      'app/not-found.tsx',
      'app/[locale]/[[...slug]]/layout.tsx',
      'app/[locale]/[[...slug]]/page.tsx',
      'app/[locale]/[[...slug]]/error.tsx',
      'app/auth/[action]/route.ts',
      'app/auth/headless/[action]/route.ts',
      'app/manifest.webmanifest/route.ts',
      'app/sw.js/route.ts',
      'app/robots.txt/route.ts',
      'app/sitemap.xml/route.ts',
      'app/sitemaps/[file]/route.ts',
      'src/i18n/request.ts',
      'next-env.d.ts',
      'tsconfig.json',
    ],
    overrideGroups: [
      {
        kind: 'nextConfig',
        candidates: ['next.config.js', 'next.config.mjs', 'next.config.ts'],
        defaultTemplate: 'next.config.js',
      },
      {
        kind: 'routing',
        candidates: ['middleware.js', 'middleware.ts', 'proxy.js', 'proxy.ts'],
        defaultTemplate: 'middleware.ts',
      },
      {
        kind: 'instrumentation',
        candidates: ['instrumentation.js', 'instrumentation.ts'],
      },
      {
        kind: 'instrumentationClient',
        candidates: ['instrumentation-client.js', 'instrumentation-client.ts'],
        // Registers the service worker; an override registers it itself.
        defaultTemplate: 'instrumentation-client.ts',
      },
    ],
    linksPublicDirectory: true,
    buildOutputs: ['.next'],
  },
  'react-router': {
    defaultGeneratedFiles: [
      'app/entry.client.tsx',
      'app/entry.server.tsx',
      'app/root.tsx',
      'app/routes.ts',
      'app/page-route.ts',
      'app/routes/layout.tsx',
      'app/routes/page.tsx',
      'app/routes/auth.ts',
      'app/routes/auth-headless.ts',
      'app/routes/manifest.ts',
      'app/routes/sw.ts',
      'app/routes/robots.ts',
      'app/routes/sitemap.ts',
      'app/routes/sitemap-file.ts',
      'tsconfig.json',
    ],
    overrideGroups: [
      {
        kind: 'viteConfig',
        candidates: ['vite.config.js', 'vite.config.mjs', 'vite.config.ts'],
        defaultTemplate: 'vite.config.ts',
      },
      {
        kind: 'reactRouterConfig',
        candidates: ['react-router.config.js', 'react-router.config.ts'],
        defaultTemplate: 'react-router.config.ts',
      },
    ],
    linksPublicDirectory: false,
    buildOutputs: ['build', '.react-router'],
  },
};

/**
 * The theme's own middleware of a React Router storefront, run after the runtime's. Not
 * `src/runtime/middleware.ts`: that is the Next.js middleware of a theme, a function of
 * another contract.
 */
const themePwaCandidates = [
  'src/runtime/pwa.ts',
  'src/runtime/pwa.tsx',
  'src/runtime/pwa.js',
];

const themeSeoCandidates = [
  'src/runtime/seo.ts',
  'src/runtime/seo.tsx',
  'src/runtime/seo.js',
];

/** Addresses the runtime serves itself: a file of the theme's `public` would shadow them. */
const runtimePublicPaths = [
  'manifest.webmanifest',
  'sw.js',
  'robots.txt',
  'sitemap.xml',
  'sitemaps',
];

const themeMiddlewareCandidates = [
  'src/runtime/route-middleware.ts',
  'src/runtime/route-middleware.tsx',
  'src/runtime/route-middleware.js',
];

/**
 * Everything any framework generates: removed before generating, so a theme that changes its
 * framework keeps no files of the other one.
 */
const generatorOwnedPaths = [
  'app',
  'public',
  ...new Set(
    Object.values(frameworkLayouts).flatMap(
      ({ defaultGeneratedFiles, overrideGroups }) => [
        ...defaultGeneratedFiles.filter((file) => !file.startsWith('app/')),
        ...overrideGroups.flatMap(({ candidates }) => candidates),
      ]
    )
  ),
];
const obsoleteGeneratedPaths = ['i18n'];

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function assertRuntimeDirectoryIsChild(rootDir, runtimeDir) {
  const relativeRuntimeDir = path.relative(rootDir, runtimeDir);

  if (
    !relativeRuntimeDir ||
    relativeRuntimeDir === '..' ||
    relativeRuntimeDir.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeRuntimeDir)
  ) {
    throw new Error(
      `Runtime directory must be a child of the storefront root: ${runtimeDir}`
    );
  }
}

/**
 * The framework of the storefront: `options.framework`, else `storefront.framework` of the
 * theme `package.json`, else Next.js.
 */
export async function readRuntimeFramework(rootDir, framework) {
  let selected = framework;

  if (selected === undefined) {
    const packageFile = path.join(rootDir, 'package.json');
    if (await exists(packageFile)) {
      const manifest = JSON.parse(await readFile(packageFile, 'utf8'));
      selected = manifest.storefront?.framework;
    }
  }

  selected ??= 'next';
  if (!frameworks.includes(selected)) {
    throw new Error(
      `Unknown storefront framework "${selected}". Use one of: ${frameworks.join(', ')}.`
    );
  }
  return selected;
}

async function writeGeneratedFile(
  runtimeDir,
  framework,
  relativePath,
  templatePath
) {
  const source = path.join(
    packageDir,
    'templates',
    framework,
    templatePath ?? relativePath
  );
  const target = path.join(runtimeDir, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, await readFile(source, 'utf8'));
}

function toImportSpecifier(fromFile, sourceFile) {
  let specifier = path.relative(path.dirname(fromFile), sourceFile);

  specifier = specifier.split(path.sep).join('/');
  return specifier.startsWith('.') ? specifier : `./${specifier}`;
}

async function writeOverrideWrapper(rootDir, runtimeDir, override) {
  const source = path.join(rootDir, override.file);
  const target = path.join(runtimeDir, override.file);
  const specifier = toImportSpecifier(target, source);
  let contents;

  if (
    override.kind === 'nextConfig' ||
    override.kind === 'viteConfig' ||
    override.kind === 'reactRouterConfig'
  ) {
    contents = `export { default } from '${specifier}';\n`;
  } else if (override.kind === 'routing') {
    const exportName = override.file.startsWith('proxy.')
      ? 'proxy'
      : 'middleware';
    const isTypeScript = override.file.endsWith('.ts');
    const lines = [];

    if (isTypeScript) {
      lines.push(`import type { NextMiddleware } from 'next/server';`);
    }

    lines.push(
      `import * as rootRoutingModule from '${specifier}';`,
      `export * from '${specifier}';`
    );

    if (isTypeScript) {
      lines.push(
        'const routingModule = rootRoutingModule as {',
        '  default?: NextMiddleware;',
        `  ${exportName}?: NextMiddleware;`,
        '};',
        `const rootOverride = routingModule.${exportName} ?? routingModule.default;`
      );
    } else {
      lines.push(
        `const rootOverride = rootRoutingModule.${exportName} ?? rootRoutingModule.default;`
      );
    }

    lines.push(
      "if (typeof rootOverride !== 'function') {",
      `  throw new TypeError('${override.file} must export a default function or a named ${exportName} function');`,
      '}',
      isTypeScript
        ? 'export default function routing(...args: Parameters<typeof rootOverride>) {'
        : 'export default function routing(...args) {',
      '  return rootOverride(...args);',
      '}',
      ''
    );
    contents = lines.join('\n');
  } else {
    contents = `export * from '${specifier}';\n`;
  }

  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents);
}

async function detectOverrides(rootDir, overrideGroups) {
  const overrides = [];

  for (const group of overrideGroups) {
    const matches = [];

    for (const candidate of group.candidates) {
      if (await exists(path.join(rootDir, candidate))) {
        matches.push(candidate);
      }
    }

    if (matches.length > 1) {
      throw new Error(
        `Conflicting ${group.kind} overrides: ${matches.join(', ')}. ` +
          'Keep exactly one file from this override group.'
      );
    }

    if (matches.length === 1) {
      overrides.push({ kind: group.kind, file: matches[0] });
    }
  }

  return overrides;
}

/** `app/middleware.ts` of a React Router runtime: the theme's middleware, or none. */
async function writeThemeMiddleware(rootDir, runtimeDir) {
  const matches = [];
  for (const candidate of themeMiddlewareCandidates) {
    if (await exists(path.join(rootDir, candidate))) matches.push(candidate);
  }
  if (matches.length > 1) {
    throw new Error(
      `Conflicting theme middleware: ${matches.join(', ')}. Keep exactly one.`
    );
  }

  const contents = matches.length
    ? "export { default } from '@src/runtime/route-middleware';\n"
    : [
        "import type { RuntimeMiddleware } from '@shopana/storefront/react-router/server';",
        '',
        'const middleware: RuntimeMiddleware[] = [];',
        'export default middleware;',
        '',
      ].join('\n');
  await writeFile(path.join(runtimeDir, 'app/middleware.ts'), contents);
}

/** `app/pwa.ts`: the theme's part of the installable app, or none (the store's manifest). */
async function writeThemePwa(rootDir, runtimeDir) {
  const matches = [];
  for (const candidate of themePwaCandidates) {
    if (await exists(path.join(rootDir, candidate))) matches.push(candidate);
  }
  if (matches.length > 1) {
    throw new Error(
      `Conflicting theme PWA definitions: ${matches.join(', ')}. Keep exactly one.`
    );
  }

  const contents = matches.length
    ? "export { default } from '@src/runtime/pwa';\n"
    : [
        "import { defineRuntimePwa } from '@shopana/storefront/pwa';",
        '',
        'export default defineRuntimePwa({});',
        '',
      ].join('\n');
  await mkdir(path.join(runtimeDir, 'app'), { recursive: true });
  await writeFile(path.join(runtimeDir, 'app/pwa.ts'), contents);
}

/** `app/seo.ts`: the theme's robots rules and sitemaps, or none (all allowed, no sitemap). */
async function writeThemeSeo(rootDir, runtimeDir) {
  const matches = [];
  for (const candidate of themeSeoCandidates) {
    if (await exists(path.join(rootDir, candidate))) matches.push(candidate);
  }
  if (matches.length > 1) {
    throw new Error(
      `Conflicting theme SEO definitions: ${matches.join(', ')}. Keep exactly one.`
    );
  }

  const contents = matches.length
    ? "export { default } from '@src/runtime/seo';\n"
    : [
        "import { defineRuntimeSeo } from '@shopana/storefront/seo';",
        '',
        'export default defineRuntimeSeo({});',
        '',
      ].join('\n');
  await mkdir(path.join(runtimeDir, 'app'), { recursive: true });
  await writeFile(path.join(runtimeDir, 'app/seo.ts'), contents);
}

async function assertNoRuntimePublicFiles(rootDir) {
  for (const file of runtimePublicPaths) {
    if (await exists(path.join(rootDir, 'public', file))) {
      throw new Error(
        `public/${file} shadows the ${file} the runtime serves. Remove it; the manifest ` +
          'comes from the store and src/runtime/pwa.ts, robots.txt and the sitemaps from ' +
          'src/runtime/seo.ts.'
      );
    }
  }
}

async function linkPublicDirectory(rootDir, runtimeDir) {
  const source = path.join(rootDir, 'public');
  const target = path.join(runtimeDir, 'public');

  if (!(await exists(source))) {
    return;
  }

  try {
    await symlink(
      process.platform === 'win32'
        ? source
        : path.relative(path.dirname(target), source),
      target,
      process.platform === 'win32' ? 'junction' : 'dir'
    );
  } catch {
    await cp(source, target, { recursive: true });
  }
}

export async function initRuntime(options = {}) {
  const rootDir = path.resolve(options.rootDir ?? process.cwd());
  const runtimeDir = path.resolve(rootDir, options.runtimeDir ?? '.runtime');
  assertRuntimeDirectoryIsChild(rootDir, runtimeDir);

  const framework = await readRuntimeFramework(rootDir, options.framework);
  const layout = frameworkLayouts[framework];
  const overrides = await detectOverrides(rootDir, layout.overrideGroups);
  await assertNoRuntimePublicFiles(rootDir);

  await mkdir(runtimeDir, { recursive: true });
  assertRuntimeDirectoryIsChild(
    await realpath(rootDir),
    await realpath(runtimeDir)
  );
  // The builds of the framework stay (its incremental caches); those of another framework go,
  // so `start` cannot serve a build the theme left behind.
  const otherBuildOutputs = Object.entries(frameworkLayouts).flatMap(
    ([name, { buildOutputs }]) => (name === framework ? [] : buildOutputs)
  );
  await Promise.all(
    [
      ...generatorOwnedPaths,
      ...obsoleteGeneratedPaths,
      ...otherBuildOutputs,
    ].map((relativePath) =>
      rm(path.join(runtimeDir, relativePath), { force: true, recursive: true })
    )
  );
  await Promise.all(
    layout.defaultGeneratedFiles.map((relativePath) =>
      writeGeneratedFile(runtimeDir, framework, relativePath)
    )
  );

  for (const group of layout.overrideGroups) {
    const override = overrides.find(({ kind }) => kind === group.kind);

    if (override) {
      await writeOverrideWrapper(rootDir, runtimeDir, override);
    } else if (group.defaultTemplate) {
      await writeGeneratedFile(
        runtimeDir,
        framework,
        group.defaultTemplate,
        group.defaultTemplate
      );
    }
  }

  await writeThemePwa(rootDir, runtimeDir);
  await writeThemeSeo(rootDir, runtimeDir);
  if (framework === 'react-router') {
    await writeThemeMiddleware(rootDir, runtimeDir);
  }
  if (layout.linksPublicDirectory) {
    await linkPublicDirectory(rootDir, runtimeDir);
  }

  return {
    rootDir,
    runtimeDir,
    framework,
    overrides: overrides.map((override) => ({
      ...override,
      source: path.join(rootDir, override.file),
      target: path.join(runtimeDir, override.file),
    })),
  };
}
