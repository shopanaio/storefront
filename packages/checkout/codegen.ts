import type { CodegenConfig } from '@graphql-codegen/cli';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceDir = path.resolve(packageDir, '../..');
const scalars = {
  BigInt: { input: 'number', output: 'number' },
  Cursor: { input: 'string', output: 'string' },
  DateTime: { input: 'string', output: 'string' },
  Email: { input: 'string', output: 'string' },
  JSON: { input: 'object', output: 'object' },
  Phone: { input: 'string', output: 'string' },
  Uuid: { input: 'string', output: 'string' },
};

const config: CodegenConfig = {
  overwrite: true,
  schema: path.join(workspaceDir, 'schema.shopana.graphql'),
  documents: [path.join(packageDir, 'src/**/*.graphql')],
  generates: {
    [path.join(packageDir, 'src/graphql/operations.ts')]: {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        arrayInputCoercion: false,
        avoidOptionals: false,
        dedupeOperationSuffix: true,
        enumsAsTypes: true,
        immutableTypes: true,
        nonOptionalTypename: true,
        scalars,
        useTypeImports: true,
      },
    },
  },
};

export default config;
