'use client';

import { useCart } from '@src/hooks/cart';

export function CartTotalSection() {
  const { cart, loading } = useCart();

  if (loading || !cart) {
    return null;
  }

  return (
    <div style={{ padding: 20, background: '#eef', marginBottom: 10 }}>
      <h2>CartTotalSection (test)</h2>
      <p><strong>Subtotal:</strong> {cart.cost?.subtotalAmount?.amount} {cart.cost?.subtotalAmount?.currencyCode}</p>
      <p><strong>Total:</strong> {cart.cost?.totalAmount?.amount} {cart.cost?.totalAmount?.currencyCode}</p>
    </div>
  );
}
