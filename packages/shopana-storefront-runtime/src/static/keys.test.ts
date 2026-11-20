import { describe, expect, it } from 'vitest';
import {
  staticDataKeyForPath,
  staticDataUrl,
  staticKeyForPath,
  staticShellKeyForPath,
} from './keys';

describe('static keys', () => {
  it('maps an address to the key of its HTML, the query string aside', () => {
    expect(staticKeyForPath('/')).toBe('index.html');
    expect(staticKeyForPath('/uk')).toBe('uk/index.html');
    expect(staticKeyForPath('/uk/products/x')).toBe('uk/products/x/index.html');
    expect(staticKeyForPath('/products/x/')).toBe('products/x/index.html');
    expect(staticKeyForPath('/products/%D1%84')).toBe(
      'products/%D1%84/index.html'
    );
  });

  it('has no key for files, runtime paths and paths that leave the root', () => {
    expect(staticKeyForPath('/favicon.ico')).toBeNull();
    expect(staticKeyForPath('/products/x.data')).toBeNull();
    expect(staticKeyForPath('/__env.js')).toBeNull();
    expect(staticKeyForPath('/__static/data/index.json')).toBeNull();
    expect(staticKeyForPath('/a/../b')).toBeNull();
    expect(staticKeyForPath('/a/%2F..')).toBeNull();
    expect(staticKeyForPath('/uk//products/x')).toBeNull();
    expect(staticKeyForPath('//products/x')).toBeNull();
    expect(staticKeyForPath('/products/x//')).toBeNull();
    expect(staticKeyForPath('products')).toBeNull();
  });

  it('keeps robots.txt and the sitemaps under their own names', () => {
    expect(staticKeyForPath('/robots.txt')).toBe('robots.txt');
    expect(staticKeyForPath('/sitemap.xml')).toBe('sitemap.xml');
    expect(staticKeyForPath('/sitemaps/products-1.xml')).toBe(
      'sitemaps/products-1.xml'
    );
  });

  it('maps an address to its data', () => {
    expect(staticDataKeyForPath('/')).toBe('__static/data/index.json');
    expect(staticDataKeyForPath('/uk/products/x')).toBe(
      '__static/data/uk/products/x.json'
    );
    expect(staticDataUrl('/uk')).toBe('/__static/data/uk.json');
    expect(staticDataUrl('/x.js')).toBeNull();
  });

  it('finds the shell of a page family behind the locale segment', () => {
    expect(staticShellKeyForPath('/products/x', ['uk'])).toBe(
      '__shell/products.html'
    );
    expect(staticShellKeyForPath('/uk/p/x', ['uk'])).toBe(
      '__shell/products.html'
    );
    expect(staticShellKeyForPath('/uk/c/x', ['uk'])).toBe(
      '__shell/collections.html'
    );
    expect(staticShellKeyForPath('/collections', ['uk'])).toBeNull();
    expect(staticShellKeyForPath('/cart', ['uk'])).toBeNull();
  });
});
