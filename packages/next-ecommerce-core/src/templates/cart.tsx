import type { SectionProps } from '../core/types';
import type { PageTemplate } from '../core/types';
import type { CartPageData } from '../sdk/types';

type EmptySettings = Record<string, never>;

function CartSection({ data }: SectionProps<EmptySettings, CartPageData>) {
  const { cart } = data;
  return (
    <section style={{ padding: '2rem 1.5rem', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Cart</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {cart.lines.map((line) => (
          <li key={line.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
              {line.title} × {line.quantity}
            </span>
            <span>
              {line.currencyCode} {line.price * line.quantity}
            </span>
          </li>
        ))}
      </ul>
      <hr style={{ margin: '1.5rem 0' }} />
      <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>
        Total: {cart.currencyCode} {cart.total}
      </p>
    </section>
  );
}

export const cartTemplate: PageTemplate<CartPageData> = {
  name: 'cart',
  sections: [
    {
      id: 'cart-summary',
      component: CartSection,
      settings: {},
    },
  ],
};
