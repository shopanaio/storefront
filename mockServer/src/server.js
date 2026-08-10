import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildSchema } from "graphql";
import { createYoga } from "graphql-yoga";

import { createMockStore } from "./mock-store.js";
import { applyResolvers, createContext } from "./resolvers.js";
import { createApplicationAuthRoutes } from "./application-auth-routes.js";

const schemaPath = fileURLToPath(new URL("../schema.graphql", import.meta.url));

const contentTypes = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const listen = (server, { host = "0.0.0.0", port }) => new Promise((resolveListen, reject) => {
  const onError = (error) => {
    server.off("listening", onListening);
    reject(error);
  };
  const onListening = () => {
    server.off("error", onError);
    resolveListen();
  };

  server.once("error", onError);
  server.once("listening", onListening);
  server.listen(port, host);
});

const close = (server) => new Promise((resolveClose, reject) => {
  server.close((error) => error ? reject(error) : resolveClose());
});

export const createMockServer = async ({ fixtures, publicPath }) => {
  if (!publicPath) throw new TypeError("Mock server requires a publicPath.");

  const resolvedPublicPath = resolve(publicPath);
  const typeDefs = await readFile(schemaPath, "utf8");
  const store = createMockStore(fixtures);
  const schema = applyResolvers(buildSchema(typeDefs), store);
  const yoga = createYoga({
    schema,
    graphqlEndpoint: "/graphql",
    graphiql: true,
    context: createContext(store),
  });
  const applicationAuthRoutes = createApplicationAuthRoutes();

  const httpServer = createServer(async (request, response) => {
    const pathname = new URL(request.url ?? "/", "http://mock.local").pathname;
    if (await applicationAuthRoutes(request, response, pathname)) return;
    if (pathname.startsWith("/images/")) {
      const assetPath = resolve(resolvedPublicPath, `.${pathname}`);
      if (!assetPath.startsWith(`${resolvedPublicPath}/`)) {
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

  return {
    httpServer,
    store,
    listen: (options) => listen(httpServer, options),
    close: () => close(httpServer),
  };
};
