import dynamic from "next/dynamic";

export const Checkout = dynamic(
  () => import("./Checkout").then((m) => m.Checkout),
  { ssr: false }
);
