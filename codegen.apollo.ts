import type { CodegenConfig } from '@graphql-codegen/cli';

/**
 * Apollo operations intentionally use a separate file suffix so Relay
 * documents and generated artifacts remain untouched during migration.
 */
const config: CodegenConfig = {
  overwrite: true,
  schema: 'schema.shopana.graphql',
  documents: [
    'src/**/*.apollo.graphql',
    'src/**/*.apollo.{ts,tsx}',
    'packages/shopana-storefront-sdk/src/**/*.apollo.graphql',
    'packages/shopana-storefront-sdk/src/**/*.apollo.{ts,tsx}',
  ],
  ignoreNoDocuments: true,
  generates: {
    'codegen/apollo/operations.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        arrayInputCoercion: false,
        avoidOptionals: false,
        enumsAsTypes: true,
        immutableTypes: true,
        useTypeImports: true,
      },
    },
  },
};

export default config;
