import { useEffect, useMemo } from 'react';
import { useLocale } from 'next-intl';
import type { Checkout } from '#checkout/types/entity';
import { mapCheckoutToAddressFormData } from '#checkout/sections/address/mapper';
import {
  ProviderModuleType,
  type ModuleMessages,
} from '#checkout/vendors/types';
import { loadMessages, loadModule } from './loadCache';

/** Starts loading a module and then its messages, so both are ready when it renders. */
function preload(type: ProviderModuleType, slug: string, locale: string) {
  loadModule<{ messages?: ModuleMessages }>(type, slug)?.then(
    (api) => {
      if (api.messages) {
        void loadMessages(api.messages.scope, locale, api.messages.load).catch(
          () => {}
        );
      }
    },
    // The part that renders it says so.
    () => {}
  );
}

/** Modules the checkout renders, as `type\nslug` keys. */
function modulesOf(checkout: Checkout.Checkout): string[] {
  // The address form is of the saved country or, before one is saved, of the buyer's: the two
  // the section picks from first (`pickDeliveryCountry`).
  const address = mapCheckoutToAddressFormData(checkout);
  const countries = [
    address?.address?.countryCode,
    address?.customerCountryCode,
  ].flatMap((code) => (code ? [`${ProviderModuleType.Address}\n${code}`] : []));
  const delivery = checkout.deliveryGroups.flatMap((group) =>
    group.deliveryMethods.map(
      (method) => `${ProviderModuleType.Delivery}\n${method.provider.code}`
    )
  );
  const payment = checkout.payment.paymentMethods.map(
    (method) => `${ProviderModuleType.Payment}\n${method.provider.code}`
  );
  return [...new Set([...countries, ...delivery, ...payment])].sort();
}

/**
 * Loads the modules the checkout renders, with their messages, as soon as the checkout says
 * which: the form of the address country, and the delivery and payment providers offered.
 * It runs again only when that list changes.
 */
export function usePreloadModules(checkout: Checkout.Checkout | null) {
  const locale = useLocale();
  const key = useMemo(
    () => (checkout ? modulesOf(checkout).join('\n\n') : ''),
    [checkout]
  );
  useEffect(() => {
    key
      .split('\n\n')
      .filter(Boolean)
      .forEach((entry) => {
        const [type, slug] = entry.split('\n');
        preload(type as ProviderModuleType, slug, locale);
      });
  }, [key, locale]);
}
