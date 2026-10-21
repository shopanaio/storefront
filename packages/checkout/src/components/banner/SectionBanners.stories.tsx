import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import {
  NextIntlClientProvider,
  useLocale,
  useMessages,
  useTranslations,
} from 'next-intl';
import { fn } from 'storybook/test';
import { LoadError } from '#checkout/infra/loadCache';
import { UndeliverableLines } from '#checkout/sections/delivery/components/UndeliverableLines';
import { SectionId } from '#checkout/state/interface';
import { resetReasonMessageKey } from '#checkout/state/banners/messages';
import { makeLine } from '#checkout/stories/fixtures';
import { formScenario } from '#checkout/stories/formScenario';
import { mockCheckout } from '#checkout/stories/mockCheckout';
import type { CheckoutMockState } from '#checkout/stories/mockCheckout';
import { withCheckout } from '#checkout/stories/withCheckout';
import { CheckoutBanner } from '#checkout/ui/banner/CheckoutBanner';
import type { BannerTone } from '#checkout/ui/banner/tones';
import { LoadingBoundary } from '#checkout/ui/LoadingBoundary';
import { DirectoryNotice } from '#checkout/vendors/nova-poshta/components/DirectoryNotice';
import novaPoshtaEn from '#checkout/vendors/nova-poshta/i18n/en.json';
import novaPoshtaUk from '#checkout/vendors/nova-poshta/i18n/uk.json';

/**
 * Banners inside the sections of the checkout (delivery, payment, Nova Poshta, a part that failed
 * to load), with the texts and actions their sections give them. The order-level banners are in
 * `Checkout/Banners/Order`.
 */
function SectionBanners({ children }: { children?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 560,
      }}
    >
      {children}
    </div>
  );
}

interface BannerProps {
  tone: BannerTone;
  /** Message key in the Checkout namespace. */
  title: string;
  values?: Record<string, string | number>;
  description?: string;
  action?: string;
}

/** A section banner, its texts by message key. */
function Banner({ tone, title, values, description, action }: BannerProps) {
  const t = useTranslations('Checkout');
  return (
    <CheckoutBanner
      tone={tone}
      title={t(title, values)}
      description={description ? t(description) : undefined}
      action={action ? { label: t(action), onClick: fn() } : undefined}
    />
  );
}

const reset = (code: string, section: SectionId.Delivery | SectionId.Payment) =>
  resetReasonMessageKey({ code, message: '' }, section);

/** Messages of the Nova Poshta module, which the checkout loads with the module. */
function NovaPoshtaMessages({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const messages = useMessages() as Record<string, unknown>;
  const modules = (messages.Modules ?? {}) as Record<string, unknown>;
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={{
        ...messages,
        Modules: {
          ...modules,
          novaPoshta: locale === 'uk' ? novaPoshtaUk : novaPoshtaEn,
        },
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}

function CityRequired() {
  const t = useTranslations('Modules.novaPoshta.form');
  return <CheckoutBanner tone="action" title={t('city_required_warning')} />;
}

function FailedPart(): ReactNode {
  throw new LoadError('module', { cause: new Error('Network error') });
}

const meta = {
  title: 'Checkout/Banners/Sections',
  component: SectionBanners,
  decorators: [withCheckout],
  beforeEach: ({ parameters }) => {
    if (parameters.checkout) {
      mockCheckout(parameters.checkout as Partial<CheckoutMockState>);
    }
  },
} satisfies Meta<typeof SectionBanners>;

export default meta;
type Story = StoryObj<typeof meta>;

// Delivery: the API reset the chosen method.

export const DeliveryReset: Story = {
  render: () => (
    <SectionBanners>
      <Banner
        tone="action"
        title={reset('DELIVERY_OPTION_REMOVED', SectionId.Delivery)}
        description="delivery-selection-reset"
      />
    </SectionBanners>
  ),
};

export const DeliveryResetUnavailable: Story = {
  render: () => (
    <SectionBanners>
      <Banner
        tone="action"
        title={reset(
          'DELIVERY_OPTION_TEMPORARILY_UNAVAILABLE',
          SectionId.Delivery
        )}
        description="delivery-selection-reset"
      />
    </SectionBanners>
  ),
};

/** The saved input (branch, address) no longer fits: the buyer fixes it in the same method. */
export const DeliveryResetInputInvalid: Story = {
  render: () => (
    <SectionBanners>
      <Banner
        tone="action"
        title={reset('DELIVERY_CUSTOMER_INPUT_INVALID', SectionId.Delivery)}
        description="delivery-selection-reset-fix"
      />
    </SectionBanners>
  ),
};

/** The reset shown on the shipment of a checkout with several. */
export const ShipmentReset: Story = {
  render: () => (
    <SectionBanners>
      <Banner
        tone="action"
        title={reset(
          'DELIVERY_OPTION_TEMPORARILY_UNAVAILABLE',
          SectionId.Delivery
        )}
      />
    </SectionBanners>
  ),
};

// Delivery: writes of the section.

export const DeliveryInputRejected: Story = {
  render: () => (
    <SectionBanners>
      <Banner
        tone="critical"
        title="delivery-input-rejected-title"
        description="delivery-input-rejected"
        action="save"
      />
    </SectionBanners>
  ),
};

export const DeliveryNotSaved: Story = {
  render: () => (
    <SectionBanners>
      <Banner
        tone="critical"
        title="delivery-not-saved"
        action="banner-retry"
      />
    </SectionBanners>
  ),
};

export const ShipmentsNotSaved: Story = {
  render: () => (
    <SectionBanners>
      <Banner
        tone="critical"
        title="delivery-shipments-not-saved"
        values={{ shipments: '1, 2' }}
        action="banner-retry"
      />
    </SectionBanners>
  ),
};

export const DeliveryInputRetrying: Story = {
  render: () => (
    <SectionBanners>
      <Banner tone="warning" title="delivery-input-retrying" />
    </SectionBanners>
  ),
};

export const DeliveryGroupChanged: Story = {
  render: () => (
    <SectionBanners>
      <Banner tone="warning" title="delivery-group-changed" />
    </SectionBanners>
  ),
};

// Delivery: lines that cannot be delivered to the address.

const pizza = makeLine({
  id: 'line-1',
  title: 'Large, 32 cm',
  productTitle: 'Pepperoni pizza',
  quantity: 2,
  unitPrice: 289,
});

const extraLines = [
  makeLine({
    id: 'line-2',
    title: '0.5 l',
    productTitle: 'Cola',
    quantity: 2,
    unitPrice: 45,
  }),
  makeLine({
    id: 'line-3',
    title: '1 l',
    productTitle: 'Orange juice',
    unitPrice: 79,
  }),
  makeLine({
    id: 'line-4',
    title: '250 g',
    productTitle: 'Tiramisu',
    unitPrice: 149,
  }),
  makeLine({
    id: 'line-5',
    title: '6 pcs',
    productTitle: 'Chicken wings',
    unitPrice: 199,
  }),
];

/** Every line goes to a shipment with no delivery method. */
const undeliverable = (lines: typeof extraLines) =>
  formScenario({
    groups: [{ id: 'group-1', lines, options: [] }],
    checkout: { lines },
  });

export const UndeliverableLine: Story = {
  parameters: undeliverable([pizza]),
  render: () => (
    <SectionBanners>
      <UndeliverableLines />
    </SectionBanners>
  ),
};

/** More than three lines: the rest folds under "show more". */
export const UndeliverableManyLines: Story = {
  parameters: undeliverable([pizza, ...extraLines]),
  render: () => (
    <SectionBanners>
      <UndeliverableLines />
    </SectionBanners>
  ),
};

// Payment.

export const PaymentReset: Story = {
  render: () => (
    <SectionBanners>
      <Banner
        tone="action"
        title={reset('PAYMENT_METHOD_UNAVAILABLE', SectionId.Payment)}
        description="payment-selection-reset"
      />
    </SectionBanners>
  ),
};

// Nova Poshta.

export const NovaPoshtaDirectoryUnavailable: Story = {
  render: () => (
    <NovaPoshtaMessages>
      <SectionBanners>
        <DirectoryNotice
          loading={false}
          empty={false}
          error="unavailable"
          onRetry={fn()}
        />
      </SectionBanners>
    </NovaPoshtaMessages>
  ),
};

export const NovaPoshtaDirectoryFailed: Story = {
  render: () => (
    <NovaPoshtaMessages>
      <SectionBanners>
        <DirectoryNotice
          loading={false}
          empty={false}
          error="failed"
          onRetry={fn()}
        />
      </SectionBanners>
    </NovaPoshtaMessages>
  ),
};

export const NovaPoshtaSearchInvalid: Story = {
  render: () => (
    <NovaPoshtaMessages>
      <SectionBanners>
        <DirectoryNotice
          loading={false}
          empty={false}
          error="invalid"
          onRetry={fn()}
        />
      </SectionBanners>
    </NovaPoshtaMessages>
  ),
};

export const NovaPoshtaCityRequired: Story = {
  render: () => (
    <NovaPoshtaMessages>
      <SectionBanners>
        <CityRequired />
      </SectionBanners>
    </NovaPoshtaMessages>
  ),
};

// Any part of the checkout.

/** A module or its messages failed to load: the part says so with a "Retry". */
export const LoadFailed: Story = {
  render: () => (
    <SectionBanners>
      <LoadingBoundary fallback={null}>
        <FailedPart />
      </LoadingBoundary>
    </SectionBanners>
  ),
};
