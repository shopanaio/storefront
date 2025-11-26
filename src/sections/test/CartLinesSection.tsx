'use client';

import { useCart } from '@src/hooks/cart';

export function CartLinesSection() {
  const { cart, loading, loaded } = useCart();

  if (loading) {
    return <div style={{ padding: 20, background: '#eee' }}>Loading cart...</div>;
  }

  if (!cart || !cart.lines?.length) {
    return <div style={{ padding: 20, background: '#fee' }}>Cart is empty</div>;
  }

  return (
    <div style={{ padding: 20, background: '#efe', marginBottom: 10 }}>
      <h2>CartLinesSection (test)</h2>
      <p><strong>Lines count:</strong> {cart.lines.length}</p>
      <ul>
        {cart.lines.map((line: any) => (
          <li key={line.id}>
            {line.variant?.title ?? 'Unknown'} x {line.quantity} - {line.variant?.price?.amount} {line.variant?.price?.currencyCode}
          </li>
        ))}
      </ul>
    </div>
  );
}
