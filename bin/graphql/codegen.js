/* eslint-disable */
import { generate } from "./generate-types.js";
import "dotenv/config";

const run = async () => {
  try {
    if (process.env.CMS === "shopify") {
      console.log("running Shopify Storefront API codegen");
      await import("./shopify-storefront-api.js");
      await generate();
      return;
    }

    if (process.env.CMS === "shopana") {
      console.log("running Shopana Storefront API codegen");
      await import("./shopana-storefront-api.js");
      await generate();
      return;
    }

    throw new Error("Unsupported CMS");
  } catch (e) {
    console.log(e, "Error generating graphql schema");
    process.exit(1);
  }
};

run();
