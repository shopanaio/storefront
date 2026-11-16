import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveTheme } from './theme.mjs';

const workspaceDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const themeDir = resolveTheme();

if (themeDir) {
  try {
    process.loadEnvFile(path.join(themeDir, '.env'));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

function run(command, args, cwd = workspaceDir) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `${command} exited with ${signal ? `signal ${signal}` : `code ${code}`}`
        )
      );
    });
  });
}

await run(process.execPath, ['scripts/codegen-openapi.mjs']);
await run(process.execPath, ['scripts/codegen-possible-types.mjs']);
if (themeDir) {
  await run(
    process.execPath,
    ['codegen/scripts/validate-apollo-documents.js'],
    themeDir
  );
}
await run('yarn', [
  'graphql-codegen',
  '--config',
  'packages/shopana-storefront-sdk/codegen.ts',
]);
if (themeDir) {
  await run('yarn', [
    'graphql-codegen',
    '--config',
    path.relative(workspaceDir, path.join(themeDir, 'codegen.ts')),
  ]);
}
await run('yarn', [
  'graphql-codegen',
  '--config',
  'packages/checkout/codegen.ts',
]);
await run('yarn', [
  'prettier',
  '--write',
  'mockServer/src/openapi/application-auth.d.ts',
  'packages/shopana-storefront-sdk/src/openapi/application-auth.ts',
  'packages/shopana-storefront-sdk/src/graphql/apollo/generated/*.ts',
  'packages/checkout/src/graphql/operations.ts',
]);
if (themeDir) {
  await run('yarn', [
    'prettier',
    '--write',
    path.relative(
      workspaceDir,
      path.join(themeDir, 'codegen/schema-client.ts')
    ),
    path.relative(
      workspaceDir,
      path.join(themeDir, 'codegen/apollo/storefront-operations.ts')
    ),
  ]);
}
