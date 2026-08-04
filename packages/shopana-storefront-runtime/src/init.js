import {
  access,
  cp,
  mkdir,
  readFile,
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

const generatedFiles = [
  'app/layout.tsx',
  'app/not-found.tsx',
  'app/[locale]/[[...slug]]/layout.tsx',
  'app/[locale]/[[...slug]]/page.tsx',
  'src/i18n/request.ts',
  'middleware.ts',
  'next.config.js',
  'tsconfig.json',
];

const obsoleteGeneratedPaths = ['i18n'];

async function writeGeneratedFile(runtimeDir, relativePath) {
  const source = path.join(packageDir, 'templates', relativePath);
  const target = path.join(runtimeDir, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, await readFile(source, 'utf8'));
}

async function linkPublicDirectory(rootDir, runtimeDir) {
  const source = path.join(rootDir, 'public');
  const target = path.join(runtimeDir, 'public');

  await rm(target, { force: true, recursive: true });

  try {
    await access(source);
  } catch {
    return;
  }

  try {
    await symlink(
      process.platform === 'win32' ? source : '../public',
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

  await mkdir(runtimeDir, { recursive: true });
  await Promise.all(
    obsoleteGeneratedPaths.map((relativePath) =>
      rm(path.join(runtimeDir, relativePath), { force: true, recursive: true })
    )
  );
  await Promise.all(
    generatedFiles.map((relativePath) =>
      writeGeneratedFile(runtimeDir, relativePath)
    )
  );
  await linkPublicDirectory(rootDir, runtimeDir);

  return { rootDir, runtimeDir };
}
