import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const schemaPath = path.join(workspaceDir, 'application-auth.openapi.yaml');
const cliPath = path.join(
  workspaceDir,
  'node_modules',
  'openapi-typescript',
  'bin',
  'cli.js'
);
const outputs = [
  path.join(
    workspaceDir,
    'packages',
    'shopana-storefront-sdk',
    'src',
    'openapi',
    'application-auth.ts'
  ),
  path.join(
    workspaceDir,
    'mockServer',
    'src',
    'openapi',
    'application-auth.d.ts'
  ),
];

const generate = (outputPath) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        cliPath,
        schemaPath,
        '--output',
        outputPath,
        '--export-type',
        '--immutable',
      ],
      { cwd: workspaceDir, stdio: 'inherit' }
    );

    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `OpenAPI codegen exited with ${signal ? `signal ${signal}` : `code ${code}`}`
        )
      );
    });
  });

for (const outputPath of outputs) {
  await generate(outputPath);
}
