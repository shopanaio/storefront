import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildClientSchema, printSchema } from 'graphql';

const workspaceDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const themeDir = path.join(workspaceDir, 'packages', 'brand-bite-crunch');
const schemaFile = path.join(workspaceDir, 'schema.shopana.graphql');
const schemaExtensionFile = path.join(
  workspaceDir,
  'graphql-schema-extensions',
  'auth.graphql'
);

try {
  process.loadEnvFile(path.join(themeDir, '.env'));
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
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

async function fetchShopanaSchema() {
  const graphqlUrl = process.env.SHOPANA_GRAPHQL_URL;
  if (!graphqlUrl) {
    throw new Error('SHOPANA_GRAPHQL_URL is required for workspace codegen');
  }

  const query = await readFile(
    path.join(themeDir, 'codegen', 'scripts', 'IntrospectionQuery.gql'),
    'utf8'
  );
  const headers = {
    'Content-Type': 'application/json',
    'X-Interpolation': 'true',
  };
  if (process.env.SHOPANA_API_KEY) {
    headers['X-Api-Key'] = process.env.SHOPANA_API_KEY;
  }
  const response = await fetch(graphqlUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ operationName: 'IntrospectionQuery', query }),
  });

  if (!response.ok) {
    throw new Error(`Shopana schema request failed with ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors?.length || !payload.data?.__schema) {
    throw new Error(
      'Shopana schema response did not contain introspection data'
    );
  }

  const extension = await readFile(schemaExtensionFile, 'utf8');
  await writeFile(
    schemaFile,
    `${printSchema(buildClientSchema({ __schema: payload.data.__schema }))}\n${extension}`
  );
}

if (process.argv.includes('--use-existing-schema')) {
  const [existingSchema, extension] = await Promise.all([
    readFile(path.join(themeDir, 'schema.shopana.graphql'), 'utf8'),
    readFile(schemaExtensionFile, 'utf8'),
  ]);
  await writeFile(schemaFile, `${existingSchema.trimEnd()}\n${extension}`);
  console.warn(
    'Using the existing Shopana schema artifact; no schema request was made.'
  );
} else {
  await fetchShopanaSchema();
}
await run(process.execPath, ['scripts/codegen-openapi.mjs']);
await run(
  process.execPath,
  ['codegen/scripts/validate-apollo-documents.js'],
  themeDir
);
await run('yarn', [
  'graphql-codegen',
  '--config',
  'packages/shopana-storefront-sdk/codegen.ts',
]);
await run('yarn', [
  'graphql-codegen',
  '--config',
  'packages/brand-bite-crunch/codegen.ts',
]);
await run('yarn', [
  'graphql-codegen',
  '--config',
  'packages/checkout/codegen.ts',
]);
