import { beforeEach, describe, expect, it } from 'vitest';
import {
  addressScope,
  readCustomerInputs,
  useCustomerInputStore,
} from './customerInputStorage';

const kyiv = {
  addressId: 'a1',
  countryCode: 'UA',
  city: 'Київ',
  data: { settlementRef: 'kyiv' },
};
const lviv = { ...kyiv, city: 'Львів', data: { settlementRef: 'lviv' } };

const remember = useCustomerInputStore.getState().remember;

describe('customer input storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    useCustomerInputStore.setState({ groups: {} });
  });

  it('keeps inputs for the same address, also after a reload', () => {
    remember('g1', addressScope(kyiv), 'h1', { input: { a: 1 }, synced: true });
    expect(readCustomerInputs('g1', addressScope(kyiv))).toEqual({
      h1: { input: { a: 1 }, synced: true },
    });

    useCustomerInputStore.setState({ groups: {} });
    expect(readCustomerInputs('g1', addressScope(kyiv))).toEqual({
      h1: { input: { a: 1 }, synced: true },
    });
  });

  it('drops inputs entered for another settlement or country', () => {
    remember('g1', addressScope(kyiv), 'h1', { input: { a: 1 }, synced: true });
    expect(readCustomerInputs('g1', addressScope(lviv))).toEqual({});
    expect(
      readCustomerInputs('g1', addressScope({ ...kyiv, countryCode: 'PL' }))
    ).toEqual({});

    remember('g1', addressScope(lviv), 'h2', { input: { b: 2 }, synced: true });
    expect(readCustomerInputs('g1', addressScope(lviv))).toEqual({
      h2: { input: { b: 2 }, synced: true },
    });
  });

  it('marks an input saved only if it did not change after it was sent', () => {
    const scope = addressScope(kyiv);
    const { markSynced } = useCustomerInputStore.getState();
    remember('g1', scope, 'h1', { input: { building: '1' }, synced: false });
    remember('g1', scope, 'h1', { input: { building: '12' }, synced: false });

    markSynced('g1', scope, 'h1', { building: '1' });
    expect(readCustomerInputs('g1', scope).h1.synced).toBe(false);

    markSynced('g1', scope, 'h1', { building: '12' });
    expect(readCustomerInputs('g1', scope).h1.synced).toBe(true);
  });

  it('follows an input another tab saved', () => {
    const scope = addressScope(kyiv);
    remember('g1', scope, 'h1', { input: { a: 1 }, synced: true });

    const other = JSON.stringify({ scope, inputs: { h1: { input: { a: 2 }, synced: true } } });
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'checkout-delivery-customer-input:g1',
        newValue: other,
      })
    );

    expect(readCustomerInputs('g1', scope)).toEqual({
      h1: { input: { a: 2 }, synced: true },
    });
  });
});
