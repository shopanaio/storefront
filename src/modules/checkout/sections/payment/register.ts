import { registerSection } from '../registry';
import { PaymentSection } from './components/PaymentSection';

registerSection('payment', () => ({
  slug: 'payment',
  titleKey: 'payment',
  Component: PaymentSection,
}));
