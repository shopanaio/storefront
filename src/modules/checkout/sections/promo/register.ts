import { registerSection } from '@src/modules/checkout/sections/registry';

registerSection('promo', async () => ({
  slug: 'promo',
  titleKey: 'promo',
  Component: (await import('./components/PromoSection')).PromoSection,
}));
