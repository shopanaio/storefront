import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listThemes } from './theme.mjs';

const workspaceDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const tsc = path.join(workspaceDir, 'node_modules/typescript/bin/tsc');
const configs = [
  ...readdirSync(path.join(workspaceDir, 'packages')).map((name) =>
    path.join('packages', name)
  ),
  ...listThemes().map((dir) => path.relative(workspaceDir, dir)),
]
  .flatMap((dir) => [
    path.join(dir, 'tsconfig.json'),
    path.join(dir, 'storybook', 'tsconfig.json'),
  ])
  .filter((config) => existsSync(path.join(workspaceDir, config)));
let failed = false;
for (const config of configs) {
  console.log(`Typechecking ${config}`);
  const result = spawnSync(process.execPath, [tsc, '--noEmit', '-p', config], {
    cwd: workspaceDir,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) failed = true;
}
process.exitCode = failed ? 1 : 0;
