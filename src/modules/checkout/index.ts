import dynamic from "next/dynamic";

export const Checkout = dynamic(
  () => import("./components/Checkout").then((m) => m.Checkout),
  { ssr: false }
);

export const CheckoutSkeleton = dynamic(
  () => import("./components/CheckoutSkeleton").then((m) => m.CheckoutSkeleton),
  { ssr: false }
);
