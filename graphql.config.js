const config = {
  projects: {
    client: {
      schema: ['schema.shopana.graphql', 'graphql-schema-extensions/*.graphql'],
      documents: [
        'src/**/*.graphql',
        'packages/shopana-storefront-sdk/src/**/*.graphql',
      ],
    },
  },
};

export default config;
