# Usage Examples

## Basic Setup

### 1. Initialize SDK in your app

```typescript
// app/layout.tsx or _app.tsx
import { initSDK } from '@shopana/ecommerce-sdk';

// Initialize before rendering
initSDK({
  cmsProvider: process.env.NEXT_PUBLIC_CMS_PROVIDER as 'shopana' | 'shopify',
  apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT!,
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  locale: 'en-US',
  currency: 'USD',
});
```

### 2. Wrap your app with providers

```tsx
// app/providers.tsx
'use client';

import { SessionProvider, CartProvider } from '@shopana/ecommerce-sdk';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Authentication Examples

### Sign In

```tsx
import { useSignIn } from '@shopana/ecommerce-sdk';
import { useState } from 'react';

export function SignInForm() {
  const signIn = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn({ email, password });
      // Redirect or update UI
      window.location.href = '/account';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

### Sign Up

```tsx
import { useSignUp } from '@shopana/ecommerce-sdk';

export function SignUpForm() {
  const signUp = useSignUp();
  // Similar implementation to SignInForm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp({
      email,
      password,
      firstName,
      lastName,
    });
  };

  // ... rest of the component
}
```

### Password Reset

```tsx
import { useForgotPassword, useResetPassword } from '@shopana/ecommerce-sdk';

// Step 1: Request reset
export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();

  const handleSubmit = async (email: string) => {
    await forgotPassword({ email });
    // Show success message
  };
}

// Step 2: Reset with token
export function ResetPasswordForm({ token }: { token: string }) {
  const resetPassword = useResetPassword();

  const handleSubmit = async (newPassword: string) => {
    await resetPassword({ token, newPassword });
    // Redirect to login
  };
}
```

### Sign Out

```tsx
import { useSignOut } from '@shopana/ecommerce-sdk';

export function SignOutButton() {
  const signOut = useSignOut();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

## Cart Examples

### Display Cart

```tsx
import { useCart, useMoney } from '@shopana/ecommerce-sdk';

export function CartDrawer() {
  const { cart, loading } = useCart();

  if (loading) return <div>Loading cart...</div>;
  if (!cart) return <div>Cart is empty</div>;

  return (
    <div className="cart">
      <h2>Your Cart ({cart.totalQuantity} items)</h2>
      {cart.lines?.edges?.map(({ node: line }) => (
        <CartLine key={line.id} line={line} />
      ))}
      <CartTotal total={cart.cost.totalAmount} />
    </div>
  );
}

function CartLine({ line }) {
  const price = useMoney(line.cost.totalAmount);

  return (
    <div className="cart-line">
      <img src={line.merchandise.image?.url} alt={line.merchandise.title} />
      <div>
        <h3>{line.merchandise.title}</h3>
        <p>Quantity: {line.quantity}</p>
        <p>{price.localizedString}</p>
      </div>
    </div>
  );
}

function CartTotal({ total }) {
  const money = useMoney(total);
  return <div className="cart-total">Total: {money.localizedString}</div>;
}
```

### Add to Cart

```tsx
import { useAddItemToCart } from '@shopana/ecommerce-sdk';

export function AddToCartButton({ productId, variantId }) {
  const addItemToCart = useAddItemToCart();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addItemToCart({
        merchandiseId: variantId,
        quantity: 1,
      });
      // Show success toast
    } catch (error) {
      // Show error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleAddToCart} disabled={loading}>
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

### Update Quantity

```tsx
import { useUpdateCartLineQuantity } from '@shopana/ecommerce-sdk';

export function CartLineQuantity({ lineId, currentQuantity }) {
  const updateQuantity = useUpdateCartLineQuantity();

  const handleUpdate = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity({ lineId, quantity: newQuantity });
  };

  return (
    <div className="quantity-selector">
      <button onClick={() => handleUpdate(currentQuantity - 1)}>-</button>
      <span>{currentQuantity}</span>
      <button onClick={() => handleUpdate(currentQuantity + 1)}>+</button>
    </div>
  );
}
```

### Remove from Cart

```tsx
import { useRemoveItemFromCart } from '@shopana/ecommerce-sdk';

export function RemoveButton({ lineId }) {
  const removeItem = useRemoveItemFromCart();

  return (
    <button onClick={() => removeItem({ lineId })}>
      Remove
    </button>
  );
}
```

### Clear Cart

```tsx
import { useClearCart } from '@shopana/ecommerce-sdk';

export function ClearCartButton() {
  const clearCart = useClearCart();

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  return <button onClick={handleClear}>Clear Cart</button>;
}
```

### Check if Product is in Cart

```tsx
import { useIsInTheCart } from '@shopana/ecommerce-sdk';

export function ProductCard({ productId }) {
  const isInCart = useIsInTheCart(productId);

  return (
    <div className="product-card">
      {/* Product details */}
      {isInCart && <span className="badge">In Cart</span>}
    </div>
  );
}
```

## Session Examples

### Get Current User

```tsx
import { useGetSession } from '@shopana/ecommerce-sdk';

export function UserProfile() {
  const { data: session, loading } = useGetSession();

  if (loading) return <div>Loading...</div>;
  if (!session?.customer) return <div>Not logged in</div>;

  return (
    <div className="profile">
      <h2>Welcome, {session.customer.firstName}!</h2>
      <p>Email: {session.customer.email}</p>
    </div>
  );
}
```

### Protected Route

```tsx
import { useSession } from '@shopana/ecommerce-sdk';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function ProtectedPage({ children }) {
  const session = useSession((state) => state.customer);
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  if (!session) return null;

  return <>{children}</>;
}
```

## Webpack Build-time Optimization (Optional)

For production builds, you can optimize bundle size by selecting the provider at build time:

```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(tsx?|jsx?)$/,
      include: [/node_modules\/@shopana\/ecommerce-sdk/],
      use: [
        {
          loader: '@shopana/ecommerce-sdk/webpack/resolve-provider',
          options: {
            provider: process.env.NEXT_PUBLIC_CMS_PROVIDER || 'shopana',
            providers: ['shopana', 'shopify'],
          },
        },
      ],
    });
    return config;
  },
};
```

This eliminates unused provider code from your bundle, resulting in smaller bundle sizes.
