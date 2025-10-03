import { registerSection } from '../registry';
import { DeliverySection } from './components/DeliverySection';

registerSection('delivery', () => ({
  slug: 'delivery',
  titleKey: 'shipping',
  Component: DeliverySection,
}));
