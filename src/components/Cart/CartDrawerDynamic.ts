import dynamic from "next/dynamic";

export const CartDrawer = dynamic(
  () => import("./CartDrawer").then((m) => m.CartDrawer),
  { ssr: false }
);
