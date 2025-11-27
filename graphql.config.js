const config = {
  projects: {
    client: {
      schema: "schema.shopana.graphql",
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
