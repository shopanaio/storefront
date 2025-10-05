import { registerSection } from '../registry';
import { AddressSection } from './components/AddressSection';

/**
 * Registers the address section with the checkout section registry.
 */
registerSection('address', () => ({
  slug: 'address',
  titleKey: 'address',
  Component: AddressSection,
}));
