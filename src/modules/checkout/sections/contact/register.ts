import { registerSection } from '../registry';
import { ContactSection } from './components/ContactSection';

registerSection('contact', () => ({
  slug: 'contact',
  titleKey: 'contact',
  Component: ContactSection,
}));
