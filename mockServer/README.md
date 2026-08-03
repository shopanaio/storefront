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

## Mock images and data

[DummyJSON Products](https://dummyjson.com/docs/products) is the recommended
starting point for product fixtures. It provides products, categories, prices,
descriptions, thumbnails, and image galleries.

Useful alternatives:

- [Lorem Picsum](https://picsum.photos/) for seeded photos, for example
  `https://picsum.photos/seed/product-1/800/800`.
- [DummyJSON Image](https://dummyjson.com/docs/image) for generated placeholders
  with controlled dimensions, colors, and labels.
- [Unsplash](https://unsplash.com/) for realistic photos, subject to its usage
  terms.

Do not rely on remote image URLs in stable fixtures. Download selected images
once and keep them in the mock server so that local development, offline use,
and screenshot tests are deterministic. Use the following asset structure:

```text
public/
  images/
    products/
    categories/
    avatars/
    reviews/
    placeholders/
```

Store fixture records under `src/fixtures/` and reference the corresponding
local image URLs from those records.

The bundled `Northstar Supply` demo dataset is documented in
[`src/fixtures/README.md`](src/fixtures/README.md). It covers catalog, media,
markets, customers, checkout, orders, returns, reviews, questions, and Online
Store content.
