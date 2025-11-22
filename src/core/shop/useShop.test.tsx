import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useShop, useShopOptional } from './useShop';
import { ShopProvider } from './ShopContext';
import type { ShopConfig } from './types';

// Test component that uses useShop hook
function TestComponent() {
  const shop = useShop();

  return (
    <div>
      <div data-testid="shop-name">{shop.name}</div>
      <div data-testid="shop-email">{shop.email}</div>
      <div data-testid="locale-code">{shop.locale.code}</div>
      <div data-testid="currency-code">{shop.currency.code}</div>
      <div data-testid="formatted-money">{shop.formatMoney(1234.56)}</div>
      <div data-testid="formatted-weight">{shop.formatWeight(10)}</div>
      <div data-testid="has-cart-feature">{String(shop.hasFeature('cart'))}</div>
    </div>
  );
}

// Test component that uses useShopOptional hook
function TestOptionalComponent() {
  const shop = useShopOptional();

  if (!shop) {
    return <div data-testid="no-shop">No shop available</div>;
  }

  return <div data-testid="shop-name">{shop.name}</div>;
}

describe('useShop', () => {
  let mockShopConfig: ShopConfig;

  beforeEach(() => {
    mockShopConfig = {
      name: 'Test Shop',
      domain: 'test-shop.com',
      email: 'test@test-shop.com',
      phone: '+1234567890',
      locale: {
        code: 'en',
        name: 'English',
        direction: 'ltr',
      },
      availableLocales: [
        { code: 'en', name: 'English', direction: 'ltr' },
        { code: 'uk', name: 'Українська', direction: 'ltr' },
      ],
      currency: {
        code: 'USD',
        symbol: '$',
        symbolPosition: 'before',
        decimalSeparator: '.',
        thousandsSeparator: ',',
        decimals: 2,
      },
      availableCurrencies: [
        {
          code: 'USD',
          symbol: '$',
          symbolPosition: 'before',
          decimalSeparator: '.',
          thousandsSeparator: ',',
          decimals: 2,
        },
      ],
      timezone: 'America/New_York',
      moneyFormat: {
        currency: {
          code: 'USD',
          symbol: '$',
          symbolPosition: 'before',
          decimalSeparator: '.',
          thousandsSeparator: ',',
          decimals: 2,
        },
        locale: {
          code: 'en',
          name: 'English',
          direction: 'ltr',
        },
      },
      dateFormat: 'MM/DD/YYYY',
      weightUnit: 'kg',
      measurementUnit: 'metric',
      features: {
        cart: true,
        wishlist: false,
        reviews: true,
        compareProducts: false,
        giftCards: false,
        subscriptions: false,
        multiCurrency: false,
        inventory: true,
      },
      seo: {
        title: 'Test Shop - Best Products',
        description: 'Shop the best products at Test Shop',
        keywords: ['test', 'shop', 'products'],
      },
      social: {
        facebook: 'https://facebook.com/testshop',
        instagram: 'https://instagram.com/testshop',
      },
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        country: 'Test Country',
        zipCode: '12345',
      },
      metadata: {
        customField: 'customValue',
      },
    };
  });

  describe('Basic Shop Information', () => {
    it('should provide access to shop configuration', () => {
      render(
        <ShopProvider config={mockShopConfig}>
          <TestComponent />
        </ShopProvider>
      );

      expect(screen.getByTestId('shop-name')).toHaveTextContent('Test Shop');
      expect(screen.getByTestId('shop-email')).toHaveTextContent('test@test-shop.com');
      expect(screen.getByTestId('locale-code')).toHaveTextContent('en');
      expect(screen.getByTestId('currency-code')).toHaveTextContent('USD');
    });

    it('should throw error when used outside ShopProvider', () => {
      // Mock console.error to suppress error output in test
      const originalError = console.error;
      console.error = () => {};

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useShop must be used within ShopProvider');

      console.error = originalError;
    });
  });

  describe('Money Formatting', () => {
    it('should format money with default currency', () => {
      render(
        <ShopProvider config={mockShopConfig}>
          <TestComponent />
        </ShopProvider>
      );

      expect(screen.getByTestId('formatted-money')).toHaveTextContent('$1,234.56');
    });

    it('should format money with symbol before amount', () => {
      function MoneyTest() {
        const shop = useShop();
        return <div data-testid="money">{shop.formatMoney(100)}</div>;
      }

      render(
        <ShopProvider config={mockShopConfig}>
          <MoneyTest />
        </ShopProvider>
      );

      expect(screen.getByTestId('money')).toHaveTextContent('$100.00');
    });

    it('should format money with symbol after amount', () => {
      const uahCurrency = {
        code: 'UAH',
        symbol: '₴',
        symbolPosition: 'after' as const,
        decimalSeparator: ',',
        thousandsSeparator: ' ',
        decimals: 2,
      };

      function MoneyTest() {
        const shop = useShop();
        return <div data-testid="money">{shop.formatMoney(1234.56, uahCurrency)}</div>;
      }

      render(
        <ShopProvider config={mockShopConfig}>
          <MoneyTest />
        </ShopProvider>
      );

      expect(screen.getByTestId('money')).toHaveTextContent('1 234,56₴');
    });

    it('should format money with different decimal places', () => {
      const jpy = {
        code: 'JPY',
        symbol: '¥',
        symbolPosition: 'before' as const,
        decimalSeparator: '.',
        thousandsSeparator: ',',
        decimals: 0,
      };

      function MoneyTest() {
        const shop = useShop();
        return <div data-testid="money">{shop.formatMoney(1234, jpy)}</div>;
      }

      render(
        <ShopProvider config={mockShopConfig}>
          <MoneyTest />
        </ShopProvider>
      );

      expect(screen.getByTestId('money')).toHaveTextContent('¥1,234');
    });
  });

  describe('Date Formatting', () => {
    it('should format Date objects', () => {
      function DateTest() {
        const shop = useShop();
        const testDate = new Date('2025-11-22');
        return <div data-testid="date">{shop.formatDate(testDate)}</div>;
      }

      render(
        <ShopProvider config={mockShopConfig}>
          <DateTest />
        </ShopProvider>
      );

      expect(screen.getByTestId('date')).toHaveTextContent('11/22/2025');
    });

    it('should format date strings', () => {
      function DateTest() {
        const shop = useShop();
        return <div data-testid="date">{shop.formatDate('2025-11-22')}</div>;
      }

      render(
        <ShopProvider config={mockShopConfig}>
          <DateTest />
        </ShopProvider>
      );

      expect(screen.getByTestId('date')).toHaveTextContent('11/22/2025');
    });

    it('should use DD/MM/YYYY format', () => {
      const configWithDDMMYYYY = {
        ...mockShopConfig,
        dateFormat: 'DD/MM/YYYY',
      };

      function DateTest() {
        const shop = useShop();
        return <div data-testid="date">{shop.formatDate('2025-11-22')}</div>;
      }

      render(
        <ShopProvider config={configWithDDMMYYYY}>
          <DateTest />
        </ShopProvider>
      );

      expect(screen.getByTestId('date')).toHaveTextContent('22/11/2025');
    });
  });

  describe('Weight Formatting', () => {
    it('should format weight with unit', () => {
      render(
        <ShopProvider config={mockShopConfig}>
          <TestComponent />
        </ShopProvider>
      );

      expect(screen.getByTestId('formatted-weight')).toHaveTextContent('10 kg');
    });

    it('should format weight with different units', () => {
      const configWithLbs = {
        ...mockShopConfig,
        weightUnit: 'lb' as const,
      };

      function WeightTest() {
        const shop = useShop();
        return <div data-testid="weight">{shop.formatWeight(5.5)}</div>;
      }

      render(
        <ShopProvider config={configWithLbs}>
          <WeightTest />
        </ShopProvider>
      );

      expect(screen.getByTestId('weight')).toHaveTextContent('5.5 lb');
    });
  });

  describe('Feature Checks', () => {
    it('should check enabled features', () => {
      render(
        <ShopProvider config={mockShopConfig}>
          <TestComponent />
        </ShopProvider>
      );

      expect(screen.getByTestId('has-cart-feature')).toHaveTextContent('true');
    });

    it('should check disabled features', () => {
      function FeatureTest() {
        const shop = useShop();
        return (
          <div>
            <div data-testid="has-wishlist">{String(shop.hasFeature('wishlist'))}</div>
            <div data-testid="has-reviews">{String(shop.hasFeature('reviews'))}</div>
          </div>
        );
      }

      render(
        <ShopProvider config={mockShopConfig}>
          <FeatureTest />
        </ShopProvider>
      );

      expect(screen.getByTestId('has-wishlist')).toHaveTextContent('false');
      expect(screen.getByTestId('has-reviews')).toHaveTextContent('true');
    });
  });

  describe('Translation Function', () => {
    it('should return translation key (placeholder)', () => {
      function TranslationTest() {
        const shop = useShop();
        return <div data-testid="translation">{shop.t('hello.world')}</div>;
      }

      render(
        <ShopProvider config={mockShopConfig}>
          <TranslationTest />
        </ShopProvider>
      );

      // Placeholder implementation just returns the key
      expect(screen.getByTestId('translation')).toHaveTextContent('hello.world');
    });
  });

  describe('useShopOptional', () => {
    it('should return shop config when inside provider', () => {
      render(
        <ShopProvider config={mockShopConfig}>
          <TestOptionalComponent />
        </ShopProvider>
      );

      expect(screen.getByTestId('shop-name')).toHaveTextContent('Test Shop');
    });

    it('should return null when outside provider', () => {
      render(<TestOptionalComponent />);

      expect(screen.getByTestId('no-shop')).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('should memoize utility functions', () => {
      const { rerender } = render(
        <ShopProvider config={mockShopConfig}>
          <TestComponent />
        </ShopProvider>
      );

      const firstRender = screen.getByTestId('formatted-money').textContent;

      // Re-render with same config
      rerender(
        <ShopProvider config={mockShopConfig}>
          <TestComponent />
        </ShopProvider>
      );

      const secondRender = screen.getByTestId('formatted-money').textContent;

      expect(firstRender).toBe(secondRender);
    });

    it('should update when config changes', () => {
      const { rerender } = render(
        <ShopProvider config={mockShopConfig}>
          <TestComponent />
        </ShopProvider>
      );

      const firstShopName = screen.getByTestId('shop-name').textContent;

      const updatedConfig = {
        ...mockShopConfig,
        name: 'Updated Shop',
      };

      rerender(
        <ShopProvider config={updatedConfig}>
          <TestComponent />
        </ShopProvider>
      );

      const secondShopName = screen.getByTestId('shop-name').textContent;

      expect(firstShopName).toBe('Test Shop');
      expect(secondShopName).toBe('Updated Shop');
    });
  });
});
