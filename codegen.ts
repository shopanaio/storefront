import type { CodegenConfig } from '@graphql-codegen/cli';

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
  ignoreNoDocuments: true,
  generates: {
    'codegen/schema-client.ts': {
      schema: ['schema.shopana.graphql', 'graphql-schema-extensions/*.graphql'],
      plugins: ['typescript', 'typescript-operations'],
      config: {
        typesPrefix: 'Api',
        enumPrefix: false,
        scalars: {
          ...scalars,
          Decimal: { input: 'number', output: 'number' },
        },
      },
    },
    'codegen/apollo/storefront-operations.ts': {
      schema: 'schema.shopana.graphql',
      documents: ['src/**/*.graphql'],
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
    'packages/shopana-storefront-sdk/src/graphql/apollo/generated/operations.ts':
      {
        schema: [
          'schema.shopana.graphql',
          'graphql-schema-extensions/auth.graphql',
        ],
        documents: ['packages/shopana-storefront-sdk/src/**/*.graphql'],
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
