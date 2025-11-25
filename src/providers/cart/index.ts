/**
 * Cart Provider Export
 *
 * Re-exports CartProvider from SDK for backward compatibility.
 * Old CMS-specific providers moved to .old.tsx files.
 *
 * @deprecated Import directly from SDK instead:
 * import { CartProvider } from '@shopana/storefront-sdk/modules/cart/react';
 */

export { CartProvider } from '@shopana/storefront-sdk/modules/cart/react/providers/CartProvider';

// Old providers kept for reference (renamed to .old.tsx)
// import CartProviderShopana from "./cart-provider.shopana.old";
// import CartProviderShopify from "./cart-provider.shopify.old";
