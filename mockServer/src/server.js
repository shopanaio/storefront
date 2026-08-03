import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildSchema } from "graphql";
import { createYoga } from "graphql-yoga";

import { createMockStore } from "./mock-store.js";
import { applyResolvers, createContext } from "./resolvers.js";

const schemaPath = fileURLToPath(new URL("../schema.graphql", import.meta.url));
const publicPath = fileURLToPath(new URL("../public", import.meta.url));
const typeDefs = await readFile(schemaPath, "utf8");
const store = createMockStore();
const schema = applyResolvers(buildSchema(typeDefs), store);

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
  graphiql: true,
  context: createContext(store),
});

const contentTypes = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? "/", "http://mock.local").pathname;
  if (pathname.startsWith("/images/")) {
    const assetPath = resolve(publicPath, `.${pathname}`);
    if (!assetPath.startsWith(`${publicPath}/`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    try {
      const asset = await readFile(assetPath);
      response.writeHead(200, {
        "cache-control": "public, max-age=3600",
        "content-type": contentTypes[extname(assetPath)] ?? "application/octet-stream",
      });
      response.end(asset);
    } catch {
      response.writeHead(404).end("Not found");
    }
    return;
  }
  yoga(request, response);
});
const port = Number.parseInt(process.env.PORT ?? "4100", 10);
const host = process.env.HOST ?? "127.0.0.1";

server.listen(port, host, () => {
  console.log(`Mock GraphQL server is running at http://${host}:${port}/graphql`);
});
