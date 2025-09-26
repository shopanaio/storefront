"use client";

import { CheckoutHeader } from "@src/modules/checkout/CheckoutHeader";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CheckoutHeader />
      {children}
    </>
  );
}
