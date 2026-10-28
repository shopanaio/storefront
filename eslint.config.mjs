import { existsSync } from 'node:fs';
import { defineConfig } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import atlaskitDesignSystem from '@atlaskit/eslint-plugin-design-system';
import graphqlEslint from '@graphql-eslint/eslint-plugin';

/** The fetched API schema; without it (a fresh clone, CI) the mock server schema is used. */
const graphqlSchema = existsSync('schema.shopana.graphql')
  ? 'schema.shopana.graphql'
  : 'mockServer/schema.graphql';

export default defineConfig([
  {
    ignores: [
      '**/.runtime/**',
      '**/dist/**',
      '**/storybook-static/**',
      '**/public/embed/**',
    ],
  },
  {
    extends: [...nextCoreWebVitals, ...nextTypescript],

    plugins: {
      '@atlaskit/design-system': atlaskitDesignSystem,
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      // Rest siblings drop properties from a copy; `_name` marks a value kept on purpose.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
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
          patterns: [
            {
              group: ['relay-runtime/*'],
              message: 'Relay has been removed.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TaggedTemplateExpression[tag.name=/^(gql|graphql)$/]',
          message: 'Move GraphQL text to a *.graphql document.',
        },
      ],
    },
  },
  {
    files: [
      'themes/*/src/**/*.graphql',
      'packages/checkout/src/**/*.graphql',
      'packages/shopana-storefront-sdk/src/**/*.graphql',
    ],
    languageOptions: {
      parser: graphqlEslint.parser,
      parserOptions: {
        graphQLConfig: {
          schema: graphqlSchema,
          documents: [
            'themes/*/src/**/*.graphql',
            'packages/checkout/src/**/*.graphql',
            'packages/shopana-storefront-sdk/src/**/*.graphql',
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
  {
    files: [
      'themes/*/src/**/*.{js,jsx,ts,tsx,mjs,cjs}',
      'packages/checkout/src/**/*.{js,jsx,ts,tsx,mjs,cjs}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next',
              message:
                'Import framework APIs through the @shopana/storefront facades.',
            },
            {
              name: 'react-router',
              message:
                'Import framework APIs through the @shopana/storefront facades.',
            },
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
          patterns: [
            {
              group: ['relay-runtime/*'],
              message: 'Relay has been removed.',
            },
            {
              group: ['next/*', 'react-router/*', '@react-router/*'],
              message:
                'Import framework APIs through the @shopana/storefront facades.',
            },
          ],
        },
      ],
    },
  },
]);
