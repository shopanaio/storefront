import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

import { buildSchema } from "graphql";
import { createYoga } from "graphql-yoga";

const schemaPath = fileURLToPath(new URL("../schema.graphql", import.meta.url));
const typeDefs = await readFile(schemaPath, "utf8");
const schema = buildSchema(typeDefs);

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
  graphiql: true,
});

const server = createServer(yoga);
const port = Number.parseInt(process.env.PORT ?? "4100", 10);
const host = process.env.HOST ?? "127.0.0.1";

server.listen(port, host, () => {
  console.log(`Mock GraphQL server is running at http://${host}:${port}/graphql`);
});
