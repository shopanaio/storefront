"use client";

import { CheckoutPageClient } from "@src/modules/checkout/page/client";

/**
 * Checkout module page component
 * Uses global CartProvider from root layout
 */
export default function CheckoutModulePage() {
  return <CheckoutPageClient />;
}
