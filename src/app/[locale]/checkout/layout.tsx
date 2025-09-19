"use client";

import { CheckoutHeader } from "@src/components/Checkout/CheckoutHeader";

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
