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

const defaultGeneratedFiles = [
  'app/layout.tsx',
  'app/not-found.tsx',
  'app/[locale]/[[...slug]]/layout.tsx',
  'app/[locale]/[[...slug]]/page.tsx',
  'src/i18n/request.ts',
  'next-env.d.ts',
  'tsconfig.json',
];

const overrideGroups = [
  {
    kind: 'nextConfig',
    candidates: ['next.config.js', 'next.config.mjs', 'next.config.ts'],
    defaultTemplate: 'next.config.js',
  },
  {
    kind: 'routing',
    candidates: [
      'middleware.js',
      'middleware.ts',
      'proxy.js',
      'proxy.ts',
    ],
    defaultTemplate: 'middleware.ts',
  },
  {
    kind: 'instrumentation',
    candidates: ['instrumentation.js', 'instrumentation.ts'],
  },
  {
    kind: 'instrumentationClient',
    candidates: [
      'instrumentation-client.js',
      'instrumentation-client.ts',
    ],
  },
];

const generatedOverridePaths = overrideGroups.flatMap(
  ({ candidates }) => candidates
);
const generatorOwnedPaths = [
  ...defaultGeneratedFiles,
  ...generatedOverridePaths,
  'public',
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

async function writeGeneratedFile(runtimeDir, relativePath, templatePath) {
  const source = path.join(
    packageDir,
    'templates',
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

  if (override.kind === 'nextConfig') {
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

async function detectOverrides(rootDir) {
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

  const overrides = await detectOverrides(rootDir);

  await mkdir(runtimeDir, { recursive: true });
  assertRuntimeDirectoryIsChild(
    await realpath(rootDir),
    await realpath(runtimeDir)
  );
  await Promise.all(
    [...generatorOwnedPaths, ...obsoleteGeneratedPaths].map((relativePath) =>
      rm(path.join(runtimeDir, relativePath), { force: true, recursive: true })
    )
  );
  await Promise.all(
    defaultGeneratedFiles.map((relativePath) =>
      writeGeneratedFile(runtimeDir, relativePath)
    )
  );

  for (const group of overrideGroups) {
    const override = overrides.find(({ kind }) => kind === group.kind);

    if (override) {
      await writeOverrideWrapper(rootDir, runtimeDir, override);
    } else if (group.defaultTemplate) {
      await writeGeneratedFile(
        runtimeDir,
        group.defaultTemplate,
        group.defaultTemplate
      );
    }
  }

  await linkPublicDirectory(rootDir, runtimeDir);

  return {
    rootDir,
    runtimeDir,
    overrides: overrides.map((override) => ({
      ...override,
      source: path.join(rootDir, override.file),
      target: path.join(runtimeDir, override.file),
    })),
  };
}
