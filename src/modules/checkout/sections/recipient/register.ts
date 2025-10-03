import { registerSection } from '../registry';
import { RecipientSection } from './components/RecipientSection';

registerSection('recipient', () => ({
  slug: 'recipient',
  titleKey: 'recipient',
  Component: RecipientSection,
}));
