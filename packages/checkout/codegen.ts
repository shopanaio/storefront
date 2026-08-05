import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../brand-bite-crunch/schema.shopana.graphql',
  documents: ['src/**/*.graphql'],
  generates: {
    'src/graphql/operations.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        arrayInputCoercion: false,
        avoidOptionals: false,
        dedupeOperationSuffix: true,
        enumsAsTypes: true,
        immutableTypes: true,
        nonOptionalTypename: true,
        useTypeImports: true,
      },
    },
  },
};

export default config;
