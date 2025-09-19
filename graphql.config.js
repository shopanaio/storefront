const config = {
  projects: {
    client: {
      schema: "schema.shopana.graphql",
      documents: ["src/**/*shopana.ts", "src/**/*shopana.tsx"],
    },
    shopify: {
      schema: "schema.shopify.graphql",
      documents: ["src/**/*.shopify.ts", "src/**/*.shopify.tsx"],
    },
  },
};

export default config;
