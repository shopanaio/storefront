import dynamic from "next/dynamic";

export const Checkout = dynamic(
  () => import("./components/Checkout").then((m) => m.Checkout),
  { ssr: false }
);
