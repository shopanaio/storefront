import { renderToStaticMarkup } from 'react-dom/server';
import { createRuntimeLayout } from '@shopana/storefront/next/layout';
import { registerCheckoutModule } from './register';

const request = vi.hoisted(() => ({ pathname: '/checkout' }));
vi.mock('@shopana/storefront/next/headers', () => ({
  getRequestContext: async () => request,
}));

describe('checkout route layout', () => {
  beforeAll(() => {
    registerCheckoutModule({
      loader: async () => ({ default: () => null }),
      returnLoader: async () => ({ default: () => null }),
    });
  });

  it.each([
    '/checkout',
    '/checkout/return',
    '/uk/checkout',
    '/uk/checkout/return',
  ])('renders %s in its own full-page layout', async (pathname) => {
    request.pathname = pathname;
    const loadLayout = vi.fn();
    const { Layout } = createRuntimeLayout({ loadLayout });
    const element = await Layout({
      children: <div>Checkout content</div>,
      params: Promise.resolve({ locale: 'uk' }),
    });
    const html = renderToStaticMarkup(element);
    expect(html).toContain('<main style="width:100%;min-height:100dvh">');
    expect(html).toContain('Checkout content');
    expect(loadLayout).not.toHaveBeenCalled();
  });

  it('keeps the storefront layout for catalog pages', async () => {
    request.pathname = '/';
    function StorefrontLayout({ children }: { children: React.ReactNode }) {
      return <div data-testid="storefront">{children}</div>;
    }
    const loadLayout = vi.fn(async () => StorefrontLayout);
    const { Layout } = createRuntimeLayout({ loadLayout });
    const element = await Layout({
      children: <div>Catalog</div>,
      params: Promise.resolve({ locale: 'en' }),
    });
    expect(renderToStaticMarkup(element)).toContain('data-testid="storefront"');
    expect(loadLayout).toHaveBeenCalledOnce();
  });
});
