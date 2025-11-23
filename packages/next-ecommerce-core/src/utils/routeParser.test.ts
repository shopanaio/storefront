import { describe, expect, it } from 'vitest';

import { parseRoute } from './routeParser';

describe('parseRoute', () => {
  it('parses home route', () => {
    const result = parseRoute([]);

    expect(result.pageType).toBe('home');
    expect(result.params).toEqual({});
  });

  it('parses product route', () => {
    const result = parseRoute(['products', 'my-product']);

    expect(result.pageType).toBe('product');
    expect(result.params).toEqual({ handle: 'my-product' });
  });

  it('parses collection route', () => {
    const result = parseRoute(['collections', 'summer']);

    expect(result.pageType).toBe('collection');
    expect(result.params).toEqual({ handle: 'summer' });
  });

  it('parses page route', () => {
    const result = parseRoute(['pages', 'about']);

    expect(result.pageType).toBe('page');
    expect(result.params).toEqual({ handle: 'about' });
  });

  it('parses cart route', () => {
    const result = parseRoute(['cart']);

    expect(result.pageType).toBe('cart');
    expect(result.params).toEqual({});
  });

  it('parses search route', () => {
    const result = parseRoute(['search']);

    expect(result.pageType).toBe('search');
    expect(result.params).toEqual({});
  });

  it('parses blogs list route', () => {
    const result = parseRoute(['blogs']);

    expect(result.pageType).toBe('blog');
    expect(result.params).toEqual({});
  });

  it('parses article route', () => {
    const result = parseRoute(['blogs', 'deep-dive']);

    expect(result.pageType).toBe('article');
    expect(result.params).toEqual({ handle: 'deep-dive' });
  });

  it('parses collections list route', () => {
    const result = parseRoute(['collections']);

    expect(result.pageType).toBe('list-collections');
    expect(result.params).toEqual({});
  });

  it('returns 404 for unknown routes', () => {
    const result = parseRoute(['unknown', 'path']);

    expect(result.pageType).toBe('404');
    expect(result.params).toEqual({});
  });

  it('handles undefined slug as home', () => {
    const result = parseRoute(undefined);

    expect(result.pageType).toBe('home');
    expect(result.params).toEqual({});
  });
});

