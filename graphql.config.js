const config = {
  projects: {
    client: {
      schema: ['schema.shopana.graphql', 'graphql-schema-extensions/*.graphql'],
      documents: [
        'src/**/*.apollo.graphql',
        'packages/shopana-storefront-sdk/src/**/*.apollo.graphql',
      ],
    },
  },
};

export default config;
