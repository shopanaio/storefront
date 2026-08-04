import dynamic from "@shopana/storefront/next/dynamic";

export const CartDrawer = dynamic(
  () => import("./index").then((m) => m.CartDrawer),
  { ssr: false }
);
