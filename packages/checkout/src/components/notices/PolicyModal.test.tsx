import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { PolicyModal } from './PolicyModal';

const mocks = vi.hoisted(() => ({
  html: '',
}));
vi.mock('#checkout/hooks/useStorePolicy', () => ({
  useStorePolicy: (handle: string | null) => ({
    policy: handle
      ? {
          handle,
          title: 'Terms of service',
          path: '/policies/terms',
          html: mocks.html,
        }
      : null,
    loading: false,
  }),
}));

const messages = {
  Checkout: {
    'policy-load-error': 'The policy cannot be shown',
    'policy-open-page': 'Open the policy page',
  },
};

const renderPolicy = (html: string) => {
  mocks.html = html;
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <PolicyModal
        policy={{ handle: 'terms', title: 'Terms', path: '/policies/terms' }}
        onClose={() => {}}
      />
    </NextIntlClientProvider>
  );
};

describe('PolicyModal', () => {
  beforeAll(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  it('renders the policy text without scripts or event handlers', async () => {
    renderPolicy(
      '<p>Read <a href="/faq" onclick="steal()">the FAQ</a></p>' +
        '<img src="x" onerror="steal()" alt="Logo">' +
        '<script>steal()</script>' +
        '<a href="javascript:steal()">Unsafe link</a>'
    );

    expect(await screen.findByText('the FAQ')).toHaveAttribute('href', '/faq');
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('[onclick], [onerror]')).toBeNull();
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getByText('Unsafe link')).not.toHaveAttribute('href');
  });
});
