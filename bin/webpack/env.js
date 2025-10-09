const getEnv = () => {
  if (process.env.STORYBOOK) {
    return {};
  }

  console.log("Running with CMS:", process.env.CMS);

  return {
    shopana: {
      NEXT_PUBLIC_CMS_PROVIDER: "shopana",
      NEXT_PUBLIC_GRAPHQL_URL: process.env.SHOPANA_GRAPHQL_URL,
      NEXT_PUBLIC_API_KEY: process.env.SHOPANA_API_KEY,
      NEXT_PUBLIC_BRAND: process.env.BRAND || "default",
    },
    shopify: {
      NEXT_PUBLIC_CMS_PROVIDER: "shopify",
      NEXT_PUBLIC_GRAPHQL_URL: process.env.SHOPIFY_GRAPHQL_URL,
      NEXT_PUBLIC_API_KEY: process.env.SHOPIFY_API_KEY,
      NEXT_PUBLIC_BRAND: process.env.BRAND || "default",
    },
  }[process.env.CMS];
};

export default getEnv;
