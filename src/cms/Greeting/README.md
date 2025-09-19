# Greeting (providerized hooks example)

This example shows how provider-based implementation selection works (e.g., `shopify` or `shopana`) using a `relay.ts(x)` file colocated with provider files and a custom Webpack loader `bin/webpack/resolve-provider.js`.

## 1) Create provider implementations and `relay.ts`

```ts
// useGreeting.shopify.ts
"use client";
import { graphql } from "relay-runtime";

// Optional stub query to validate the provider schema with Relay
export const ProviderGreetingTestQuery = graphql`
  query useGreetingTestQuery {
    product(id: "example") { id }
  }
`;

const useGreeting = () => ({
  title: "Hello from Shopify 🛍️",
});

export default useGreeting;

// useGreeting.shopana.ts
"use client";
import { graphql } from "relay-runtime";

export const ProviderGreetingTestQuery = graphql`
  query useGreetingTestQuery {
    product(handle: "example") { id }
  }
`;

const useGreeting = () => ({
  title: "Hello from Shopana 🎁",
});

export default useGreeting;

// relay.ts
import { cmsPick } from "@src/cms/pick";
import useGreetingShopana from "./useGreeting.shopana";
import useGreetingShopify from "./useGreeting.shopify";

export default cmsPick({
  shopana: useGreetingShopana,
  shopify: useGreetingShopify,
});
```

Files are located here:

- `src/cms/Greeting/useGreeting/useGreeting.shopify.ts`
- `src/cms/Greeting/useGreeting/useGreeting.shopana.ts`
- `src/cms/Greeting/useGreeting/relay.ts`

## 2) Select provider via environment variable

Set `NEXT_PUBLIC_CMS_PROVIDER` (e.g., `shopify`). During build, the loader inspects imports in `relay.ts(x)`, matches `./*.shopify`/`./*.shopana`, picks the right implementation, and regenerates the module so only the chosen implementation is bundled.

## 3) Build and Relay

Configuration is wired in `next.config.js` (see `bin/webpack/resolve-provider.js`). Relay/GraphQL compilation also relies on `process.env.NEXT_PUBLIC_CMS_PROVIDER`.

How to compile Relay artifacts for the selected provider:

```bash
# Set provider once in your shell or .env.local
export NEXT_PUBLIC_CMS_PROVIDER=shopana   # or: shopify

# Compile Relay artifacts for the selected provider
yarn relay
```

Notes:

- Files suffixed with `.shopana.ts(x)` and `.shopify.ts(x)` are picked by `graphql.config.js` and the custom provider resolver.
- The example includes small stub GraphQL queries to validate the setup with Relay.

## Component usage

- **Component**: `src/cms/Greeting/Greeting.tsx`
- **Provider switch hook**: `src/cms/Greeting/useGreeting/relay.ts`
- **Data interface**: `src/cms/Greeting/interface.ts`
