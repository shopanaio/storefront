import { describe, expect, it } from 'vitest';

import { parseRoute, buildPath } from './routeParser';

describe('parseRoute', () => {
  describe('basic routes', () => {
    it('parses home route', () => {
      const result = parseRoute('/');

      expect(result.pageType).toBe('home');
      expect(result.params).toEqual({});
    });

    it('parses product route', () => {
      const result = parseRoute('/products/my-product');

      expect(result.pageType).toBe('product');
      expect(result.params).toEqual({ handle: 'my-product' });
    });

    it('parses short product route', () => {
      const result = parseRoute('/p/my-product');

      expect(result.pageType).toBe('product');
      expect(result.params).toEqual({ handle: 'my-product' });
    });

    it('parses collection route', () => {
      const result = parseRoute('/collections/summer');

      expect(result.pageType).toBe('collection');
      expect(result.params).toEqual({ handle: 'summer' });
    });

    it('parses short collection route', () => {
      const result = parseRoute('/c/summer');

      expect(result.pageType).toBe('collection');
      expect(result.params).toEqual({ handle: 'summer' });
    });

    it('parses page route', () => {
      const result = parseRoute('/pages/about');

      expect(result.pageType).toBe('page');
      expect(result.params).toEqual({ handle: 'about' });
    });

    it('parses cart route', () => {
      const result = parseRoute('/cart');

      expect(result.pageType).toBe('cart');
      expect(result.params).toEqual({});
    });

    it('parses search route', () => {
      const result = parseRoute('/search');

      expect(result.pageType).toBe('search');
      expect(result.params).toEqual({});
    });

    it('parses blogs list route', () => {
      const result = parseRoute('/blogs');

      expect(result.pageType).toBe('blog');
      expect(result.params).toEqual({});
    });

    it('parses blog route', () => {
      const result = parseRoute('/blogs/news');

      expect(result.pageType).toBe('blog');
      expect(result.params).toEqual({ blog: 'news' });
    });

    it('parses category route', () => {
      const result = parseRoute('/categories/dogs');

      expect(result.pageType).toBe('category');
      expect(result.params).toEqual({ handle: 'dogs' });
    });

    it('parses article with blog handle', () => {
      const result = parseRoute('/blogs/news/my-article');

      expect(result.pageType).toBe('article');
      expect(result.params).toEqual({ blog: 'news', handle: 'my-article' });
    });

    it('parses collections list route', () => {
      const result = parseRoute('/collections');

      expect(result.pageType).toBe('list-collections');
      expect(result.params).toEqual({});
    });

    it('parses vendor route', () => {
      const result = parseRoute('/vendors/acana');

      expect(result.pageType).toBe('vendor');
      expect(result.params).toEqual({ handle: 'acana' });
    });
  });

  describe('locale segments', () => {
    it('does not treat a short first segment as a locale', () => {
      expect(parseRoute('/faq').pageType).toBe('404');
      expect(parseRoute('/uk/products/tea').pageType).toBe('404');
    });
  });

  describe('404 handling', () => {
    it('returns 404 for unknown routes', () => {
      const result = parseRoute('/unknown/path');

      expect(result.pageType).toBe('404');
      expect(result.params).toEqual({});
    });

    it('returns 404 for deeply nested paths', () => {
      const result = parseRoute('/products/some/deep/path');

      expect(result.pageType).toBe('404');
      expect(result.params).toEqual({});
    });

    it('returns 404 for products without handle', () => {
      const result = parseRoute('/products');

      expect(result.pageType).toBe('404');
      expect(result.params).toEqual({});
    });
  });

  describe('special characters', () => {
    it('handles product with dashes', () => {
      const result = parseRoute('/products/product-with-dashes');

      expect(result.pageType).toBe('product');
      expect(result.params).toEqual({ handle: 'product-with-dashes' });
    });

    it('handles collection with numbers', () => {
      const result = parseRoute('/collections/collection-2024');

      expect(result.pageType).toBe('collection');
      expect(result.params).toEqual({ handle: 'collection-2024' });
    });

    it('decodes URL-encoded characters', () => {
      const result = parseRoute('/products/%D1%82%D0%B5%D1%81%D1%82');

      expect(result.pageType).toBe('product');
      expect(result.params).toEqual({ handle: 'тест' });
    });
  });

  describe('searchParams', () => {
    it('has searchParams undefined by default', () => {
      const result = parseRoute('/products/test');

      expect(result.searchParams).toBeUndefined();
    });
  });
});

describe('buildPath', () => {
  it('builds home path', () => {
    expect(buildPath('home')).toBe('/');
  });

  it('builds product path', () => {
    expect(buildPath('product', { handle: 'my-product' })).toBe(
      '/products/my-product'
    );
  });

  it('builds collection path', () => {
    expect(buildPath('collection', { handle: 'summer' })).toBe(
      '/collections/summer'
    );
  });

  it('builds page path', () => {
    expect(buildPath('page', { handle: 'about' })).toBe('/pages/about');
  });

  it('builds cart path', () => {
    expect(buildPath('cart')).toBe('/cart');
  });

  it('builds search path', () => {
    expect(buildPath('search')).toBe('/search');
  });

  it('builds module paths', () => {
    expect(buildPath('policy', { handle: 'privacy' })).toBe(
      '/policies/privacy'
    );
    expect(buildPath('account')).toBe('/account');
    expect(buildPath('account', { path: 'orders/42' })).toBe(
      '/account/orders/42'
    );
  });

  it('encodes special characters', () => {
    expect(buildPath('product', { handle: 'тест' })).toBe(
      '/products/%D1%82%D0%B5%D1%81%D1%82'
    );
  });
});
