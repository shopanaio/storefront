const config = {
  projects: {
    client: {
      schema: "schema.shopana.graphql",
      documents: ["src/**/*shopana.ts", "src/**/*shopana.tsx"],
      directives: {
        inline: "@inline",
        include: "@include",
        skip: "@skip",
      },
    },
    shopify: {
      schema: "schema.shopify.graphql",
      documents: ["src/**/*.shopify.ts", "src/**/*.shopify.tsx"],
    },
  },
};

export default config;
