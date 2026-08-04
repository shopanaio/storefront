import { defineConfig } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import atlaskitDesignSystem from '@atlaskit/eslint-plugin-design-system';
import graphqlEslint from '@graphql-eslint/eslint-plugin';

export default defineConfig([
  {
    extends: [...nextCoreWebVitals, ...nextTypescript],

    plugins: {
      '@atlaskit/design-system': atlaskitDesignSystem,
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-relay',
              message: 'Use @shopana/storefront-sdk/graphql/apollo.',
            },
            {
              name: 'react-relay/hooks',
              message: 'Use @shopana/storefront-sdk/graphql/apollo.',
            },
            { name: 'relay-runtime', message: 'Relay has been removed.' },
          ],
          patterns: ['relay-runtime/*'],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TaggedTemplateExpression[tag.name=/^(gql|graphql)$/]',
          message: 'Move GraphQL text to a *.apollo.graphql document.',
        },
      ],
    },
  },
  {
    files: [
      'src/**/*.apollo.graphql',
      'packages/shopana-storefront-sdk/src/**/*.apollo.graphql',
    ],
    languageOptions: {
      parser: graphqlEslint.parser,
      parserOptions: {
        graphQLConfig: {
          schema: [
            'schema.shopana.graphql',
            'graphql-schema-extensions/auth.graphql',
          ],
          documents: [
            'src/**/*.apollo.graphql',
            'packages/shopana-storefront-sdk/src/**/*.apollo.graphql',
          ],
        },
      },
    },
    plugins: {
      '@graphql-eslint': graphqlEslint,
    },
    rules: {
      '@graphql-eslint/executable-definitions': 'error',
      '@graphql-eslint/fields-on-correct-type': 'error',
      '@graphql-eslint/fragments-on-composite-type': 'error',
      '@graphql-eslint/known-argument-names': 'error',
      '@graphql-eslint/known-directives': 'error',
      '@graphql-eslint/known-fragment-names': 'error',
      '@graphql-eslint/known-type-names': 'error',
      '@graphql-eslint/no-anonymous-operations': 'error',
      '@graphql-eslint/no-duplicate-fields': 'error',
      '@graphql-eslint/no-fragment-cycles': 'error',
      '@graphql-eslint/no-undefined-variables': 'error',
      '@graphql-eslint/no-unused-fragments': 'error',
      '@graphql-eslint/no-unused-variables': 'error',
      '@graphql-eslint/possible-fragment-spread': 'error',
      '@graphql-eslint/provided-required-arguments': 'error',
      '@graphql-eslint/scalar-leafs': 'error',
      '@graphql-eslint/unique-fragment-name': 'error',
      '@graphql-eslint/unique-operation-name': 'error',
      '@graphql-eslint/unique-variable-names': 'error',
      '@graphql-eslint/variables-in-allowed-position': 'error',
    },
  },
]);
