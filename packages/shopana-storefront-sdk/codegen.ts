import type { CodegenConfig } from '@graphql-codegen/cli';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceDir = path.resolve(packageDir, '../..');

const scalars = {
  ID: { input: 'string', output: 'string' },
  BigInt: { input: 'number', output: 'number' },
  String: { input: 'string', output: 'string' },
  Boolean: { input: 'boolean', output: 'boolean' },
  Int: { input: 'number', output: 'number' },
  Float: { input: 'number', output: 'number' },
  Any: { input: 'unknown', output: 'unknown' },
  Timestamp: { input: 'string', output: 'string' },
  DateTime: { input: 'string', output: 'string' },
  Cursor: { input: 'string', output: 'string' },
  Phone: { input: 'string', output: 'string' },
  Email: { input: 'string', output: 'string' },
  Uint: { input: 'number', output: 'number' },
  Upload: { input: 'File', output: 'File' },
  Uuid: { input: 'string', output: 'string' },
  JSON: { input: 'object', output: 'object' },
};

const config: CodegenConfig = {
  overwrite: true,
  schema: path.join(workspaceDir, 'schema.shopana.graphql'),
  documents: [path.join(packageDir, 'src/**/*.graphql')],
  generates: {
    [path.join(packageDir, 'src/graphql/apollo/generated/operations.ts')]: {
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
