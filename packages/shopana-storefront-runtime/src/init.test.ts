import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initRuntime, readRuntimeFramework } from './init.js';

let rootDir: string;

async function writeTheme(
  manifest: object,
  files: Record<string, string> = {}
) {
  await writeFile(path.join(rootDir, 'package.json'), JSON.stringify(manifest));
  for (const [file, contents] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(rootDir, file)), { recursive: true });
    await writeFile(path.join(rootDir, file), contents);
  }
}

async function listFiles(dir: string, prefix = ''): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? listFiles(path.join(dir, entry.name), `${prefix}${entry.name}/`)
        : [`${prefix}${entry.name}`]
    )
  );
  return files.flat().sort();
}

beforeEach(async () => {
  rootDir = await mkdtemp(path.join(tmpdir(), 'storefront-theme-'));
});

afterEach(async () => {
  await rm(rootDir, { recursive: true, force: true });
});

describe('readRuntimeFramework', () => {
  it('reads storefront.framework of the theme, Next.js by default', async () => {
    await writeTheme({ name: 'theme' });
    expect(await readRuntimeFramework(rootDir)).toBe('next');

    await writeTheme({
      name: 'theme',
      storefront: { framework: 'react-router' },
    });
    expect(await readRuntimeFramework(rootDir)).toBe('react-router');
    expect(await readRuntimeFramework(rootDir, 'next')).toBe('next');
  });

  it('refuses an unknown framework', async () => {
    await writeTheme({ name: 'theme', storefront: { framework: 'remix' } });
    await expect(readRuntimeFramework(rootDir)).rejects.toThrow(
      'Unknown storefront framework "remix"'
    );
  });
});

describe('initRuntime for React Router', () => {
  it('generates the app, its config and an empty theme middleware', async () => {
    await writeTheme({
      name: 'theme',
      storefront: { framework: 'react-router' },
    });
    const result = await initRuntime({ rootDir });

    expect(result.framework).toBe('react-router');
    expect(await listFiles(result.runtimeDir)).toEqual([
      'app/entry.server.tsx',
      'app/middleware.ts',
      'app/page-route.ts',
      'app/root.tsx',
      'app/routes.ts',
      'app/routes/auth-headless.ts',
      'app/routes/auth.ts',
      'app/routes/layout.tsx',
      'app/routes/page.tsx',
      'react-router.config.ts',
      'tsconfig.json',
      'vite.config.ts',
    ]);
    expect(
      await readFile(path.join(result.runtimeDir, 'app/middleware.ts'), 'utf8')
    ).toContain('const middleware: RuntimeMiddleware[] = [];');
  });

  it('uses the theme middleware and root config overrides', async () => {
    await writeTheme(
      { name: 'theme', storefront: { framework: 'react-router' } },
      {
        'src/runtime/middleware.ts': 'export default [];',
        'vite.config.ts': 'export default {};',
      }
    );
    const result = await initRuntime({ rootDir });

    expect(result.overrides.map(({ kind, file }) => ({ kind, file }))).toEqual([
      { kind: 'viteConfig', file: 'vite.config.ts' },
    ]);
    expect(
      await readFile(path.join(result.runtimeDir, 'vite.config.ts'), 'utf8')
    ).toBe("export { default } from '../vite.config.ts';\n");
    expect(
      await readFile(path.join(result.runtimeDir, 'app/middleware.ts'), 'utf8')
    ).toBe("export { default } from '@src/runtime/middleware';\n");
  });

  it('removes the files of the framework the theme left', async () => {
    await writeTheme({ name: 'theme' }, { 'public/logo.svg': '<svg/>' });
    const next = await initRuntime({ rootDir });
    expect(await listFiles(next.runtimeDir)).toContain(
      'app/[locale]/[[...slug]]/page.tsx'
    );

    await writeTheme({
      name: 'theme',
      storefront: { framework: 'react-router' },
    });
    const reactRouter = await initRuntime({ rootDir });
    const files = await listFiles(reactRouter.runtimeDir);
    expect(files.filter((file) => file.includes('[locale]'))).toEqual([]);
    expect(files).not.toContain('next.config.js');
    expect(files).not.toContain('middleware.ts');
    expect(files).not.toContain('public/logo.svg');
  });
});
