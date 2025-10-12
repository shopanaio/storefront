import { CodegenConfig } from '@graphql-codegen/cli';

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
  documents: [],
  generates: {
    // Main schema
    'codegen/schema-client.ts': {
      schema: 'schema.shopana.graphql',
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
    // Shopify schema
    'codegen/shopify-storefront-api.ts': {
      schema: 'schema.shopify.graphql',
      plugins: ['typescript', 'typescript-operations'],
      config: {
        typesPrefix: 'Shopify',
        enumPrefix: false,
        scalars: {
          ...scalars,
          Decimal: { input: 'string', output: 'string' },
        },
      },
    },
  },
};

export default config;
