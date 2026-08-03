const config = {
  projects: {
    client: {
      schema: [
        "schema.shopana.graphql",
        "relay-schema-extensions/*.graphql",
      ],
      documents: ["src/**/*.ts", "src/**/*.tsx"],
      directives: {
        inline: "@inline",
        include: "@include",
        skip: "@skip",
      },
    },
  },
};

export default config;
