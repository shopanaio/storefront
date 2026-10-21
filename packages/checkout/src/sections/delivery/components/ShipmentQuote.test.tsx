import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';
import type { Checkout } from '#checkout/types/entity';
import type { QuotedShipment } from '../shipments';
import { ShipmentQuote } from './ShipmentQuote';

const uah = (amount: number) => ({ amount, currencyCode: 'UAH' });

const shipment = (shipping: Checkout.DeliveryGroupShipping): QuotedShipment => ({
  shipping,
  estimatedMinDeliveryAt: null,
  estimatedMaxDeliveryAt: null,
});

const view = (shipments: QuotedShipment[]) =>
  render(
    <NextIntlClientProvider
      locale="uk"
      timeZone="Europe/Kyiv"
      messages={{
        Checkout: {
          shipping: 'Доставка',
          'shipping-free': 'Безкоштовно',
          'shipping-carrier-rates': 'За тарифами перевізника',
          'shipping-amount-and-carrier-rates': '{amount} + за тарифами перевізника',
          'shipping-free-because': 'Безкоштовна доставка: {reasons}',
          'shipping-free-reason-tier': 'рівень «{title}»',
          'shipping-free-reason-reward': 'нагорода «{title}»',
          'delivery-estimate': 'доставка {dates}',
        },
      }}
    >
      <ShipmentQuote shipments={shipments} withLabel />
    </NextIntlClientProvider>
  );

const struck = () => document.querySelector('del');

describe('ShipmentQuote', () => {
  it('strikes the price free shipping took off and names the loyalty tier', () => {
    view([
      shipment({
        paymentModel: 'MERCHANT_COLLECTED',
        originalPrice: uah(80),
        payer: 'MERCHANT',
        total: uah(0),
        freeShipping: { source: 'LOYALTY_TIER', title: 'Gold', code: null },
      }),
    ]);

    expect(struck()?.textContent).toMatch(/80/);
    expect(screen.getByText(/Безкоштовно/)).toBeInTheDocument();
    expect(screen.getByText('Безкоштовна доставка: рівень «Gold»')).toBeInTheDocument();
  });

  it('shows a carrier charge free shipping pays as free, with the carrier rates struck', () => {
    view([
      shipment({
        paymentModel: 'CARRIER_DIRECT',
        originalPrice: null,
        payer: 'MERCHANT',
        total: uah(0),
        freeShipping: { source: 'LOYALTY_REWARD', title: 'Free delivery', code: null },
      }),
    ]);

    expect(struck()?.textContent).toBe('За тарифами перевізника');
    expect(screen.getByText(/Безкоштовно/)).toBeInTheDocument();
    expect(
      screen.getByText('Безкоштовна доставка: нагорода «Free delivery»')
    ).toBeInTheDocument();
  });

  it('names the discount by its title', () => {
    view([
      shipment({
        paymentModel: 'CARRIER_DIRECT',
        originalPrice: uah(95),
        payer: 'MERCHANT',
        total: uah(0),
        freeShipping: { source: 'DISCOUNT', title: 'Літо без доставки', code: 'SUMMER' },
      }),
    ]);

    expect(struck()?.textContent).toMatch(/95/);
    expect(screen.getByText('Безкоштовна доставка: Літо без доставки')).toBeInTheDocument();
  });

  it('keeps the carrier rates when the recipient pays the carrier', () => {
    view([
      shipment({
        paymentModel: 'CARRIER_DIRECT',
        originalPrice: uah(95),
        payer: 'RECIPIENT',
        total: uah(0),
        freeShipping: null,
      }),
    ]);

    expect(struck()).toBeNull();
    expect(screen.getByText(/За тарифами перевізника/)).toBeInTheDocument();
    expect(screen.queryByText(/Безкоштовн/)).toBeNull();
  });

  it('shows a plain price without a reason', () => {
    view([
      shipment({
        paymentModel: 'MERCHANT_COLLECTED',
        originalPrice: uah(80),
        payer: 'MERCHANT',
        total: uah(80),
        freeShipping: null,
      }),
    ]);

    expect(struck()).toBeNull();
    expect(screen.getByText(/80/)).toBeInTheDocument();
    expect(screen.queryByText(/Безкоштовна доставка/)).toBeNull();
  });
});
