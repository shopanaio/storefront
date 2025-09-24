/* eslint-disable */
import fs from "fs";
import path from "path";

import { printSchema, buildClientSchema } from "graphql";

const { readFile, writeFile } = fs.promises;

const { SHOPANA_GRAPHQL_URL } = process.env;

const main = async () => {
  const response = await fetch(SHOPANA_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Interpolation": "true",
    },
    body: JSON.stringify({
      operationName: "IntrospectionQuery",
      query: await readFile(
        path.resolve(process.cwd(), "bin", "graphql", "IntrospectionQuery.gql"),
        "utf8"
      ),
    }),
  });

  const data = await response.json();
  return writeFile(
    path.join(process.cwd(), "schema.shopana.graphql"),
    printSchema(buildClientSchema({ __schema: data.data.__schema }))
  );
};

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
