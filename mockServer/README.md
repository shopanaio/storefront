# @shopana/mock-server

Standalone GraphQL mock server based on the storefront federation supergraph schema.

The server intentionally has no application resolvers yet. Add mock state and resolvers
under `src/` as the mocked API is implemented.

## Run

```sh
yarn install
yarn start
```

The GraphQL endpoint and GraphiQL are available at:

```text
http://127.0.0.1:4100/graphql
```

Use `PORT` and `HOST` to override the defaults:

```sh
PORT=4200 HOST=0.0.0.0 yarn start
```

For development with automatic restart:

```sh
yarn dev
```
