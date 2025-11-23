# Ecommerce SDK

Multi-provider ecommerce SDK supporting Shopana and Shopify backends with authentication and cart functionality.

## Features

- **Multi-provider support**: Shopana and Shopify
- **Authentication**: Sign in, sign up, sign out, password reset
- **Cart management**: Add, remove, update items, clear cart
- **Session management**: User session handling
- **Type-safe**: Full TypeScript support with GraphQL codegen
- **Relay integration**: Optimized GraphQL queries with Relay

## Installation

```bash
npm install @shopana/ecommerce-sdk
# or
yarn add @shopana/ecommerce-sdk
# or
pnpm add @shopana/ecommerce-sdk
```

## Quick Start

### 1. Initialize SDK

```typescript
import { initSDK } from '@shopana/ecommerce-sdk';

initSDK({
  cmsProvider: 'shopana', // or 'shopify'
  apiEndpoint: 'https://your-api.com/graphql',
  apiKey: 'your-api-key', // optional
  locale: 'en-US', // optional
  currency: 'USD', // optional
});
```

### 2. Use Providers

```tsx
import { CartProvider, SessionProvider } from '@shopana/ecommerce-sdk';

function App() {
  return (
    <SessionProvider>
      <CartProvider>
        <YourApp />
      </CartProvider>
    </SessionProvider>
  );
}
```

### 3. Use Hooks

```typescript
import { useSignIn, useCart, useAddItemToCart } from '@shopana/ecommerce-sdk';

function MyComponent() {
  const signIn = useSignIn();
  const { cart } = useCart();
  const addItemToCart = useAddItemToCart();

  // Use the hooks
}
```

## Architecture

### Provider Selection with `cmsPick`

The SDK uses a `cmsPick` mechanism to select the correct implementation based on the configured provider.

#### Runtime Selection (Default)

By default, provider selection happens at runtime using the SDK configuration:

```typescript
import { cmsPick } from '@shopana/ecommerce-sdk';
import featureShopana from './feature.shopana';
import featureShopify from './feature.shopify';

export default cmsPick({
  shopana: featureShopana,
  shopify: featureShopify,
});
```

#### Build-time Selection (Webpack Loader)

For better tree-shaking and bundle size optimization, you can use the webpack loader to select the provider at build time:

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: '@shopana/ecommerce-sdk/webpack/resolve-provider',
            options: {
              provider: process.env.CMS_PROVIDER || 'shopana',
              providers: ['shopana', 'shopify'],
            },
          },
          // ... other loaders (ts-loader, etc.)
        ],
      },
    ],
  },
};
```

**Benefits of build-time selection:**
- Smaller bundle size (unused provider code is eliminated)
- Better tree-shaking
- No runtime overhead
- Works seamlessly with the same code

### File Structure Convention

Each feature follows this structure:

```
useFeature/
├── index.ts                    # Provider selector using cmsPick
├── useFeature.shopana.ts      # Shopana implementation
├── useFeature.shopify.ts      # Shopify implementation
└── __generated__/             # Relay generated types
```

**Rules:**
- Always use **default exports** in provider files
- Entry point (`index.ts`) uses `cmsPick` for selection
- GraphQL operations must have the same names across providers
- Named exports are allowed in `index.ts` for interfaces/types

## API Reference

### Configuration

#### `initSDK(config: SDKConfig)`

Initialize the SDK with configuration.

```typescript
interface SDKConfig {
  cmsProvider: 'shopana' | 'shopify';
  apiEndpoint: string;
  apiKey?: string;
  locale?: string;
  currency?: string;
}
```

#### `getSDKConfig(): SDKConfig`

Get current SDK configuration.

#### `isSDKInitialized(): boolean`

Check if SDK is initialized.

### Authentication Hooks

#### `useSignIn()`

Sign in a user.

```typescript
const signIn = useSignIn();
await signIn({ email, password });
```

#### `useSignUp()`

Register a new user.

```typescript
const signUp = useSignUp();
await signUp({ email, password, firstName, lastName });
```

#### `useSignOut()`

Sign out the current user.

```typescript
const signOut = useSignOut();
await signOut();
```

#### `useForgotPassword()`

Request password reset.

```typescript
const forgotPassword = useForgotPassword();
await forgotPassword({ email });
```

#### `useResetPassword()`

Reset password with token.

```typescript
const resetPassword = useResetPassword();
await resetPassword({ token, newPassword });
```

### Cart Hooks

#### `useCart()`

Get current cart state.

```typescript
const { cart, loading, error } = useCart();
```

#### `useAddItemToCart()`

Add item to cart.

```typescript
const addItemToCart = useAddItemToCart();
await addItemToCart({ productId, quantity });
```

#### `useRemoveItemFromCart()`

Remove item from cart.

```typescript
const removeItemFromCart = useRemoveItemFromCart();
await removeItemFromCart({ lineId });
```

#### `useUpdateCartLineQuantity()`

Update item quantity.

```typescript
const updateQuantity = useUpdateCartLineQuantity();
await updateQuantity({ lineId, quantity });
```

#### `useClearCart()`

Clear entire cart.

```typescript
const clearCart = useClearCart();
await clearCart();
```

#### `useIsInTheCart()`

Check if product is in cart.

```typescript
const isInCart = useIsInTheCart(productId);
```

### Session Hooks

#### `useSession()`

Access session state.

```typescript
const session = useSession((state) => state);
```

#### `useGetSession()`

Fetch current session.

```typescript
const { data, loading } = useGetSession();
```

### Utility Hooks

#### `useMoney(money: Money)`

Format monetary values.

```typescript
const money = useMoney({ amount: 100, currencyCode: 'USD' });
// money.localizedString => "$100.00"
// money.withoutTrailingZeros => "$100"
```

## Development

### GraphQL Code Generation

Generate Relay types:

```bash
npm run relay
```

### Building

```bash
npm run build
```

### Testing

```bash
npm run test
```

## License

MIT
