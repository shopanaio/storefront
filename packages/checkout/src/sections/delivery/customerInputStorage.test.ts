import { beforeEach, describe, expect, it } from 'vitest';
import {
  addressScope,
  clearCustomerInputs,
  pruneCustomerInputs,
  readCustomerInputs,
  useCustomerInputStore,
} from './customerInputStorage';

const kyiv = {
  addressId: 'a1',
  countryCode: 'UA',
  address1: null,
  address2: null,
  postalCode: null,
  provinceCode: null,
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
    remember({ id: 'g1' }, addressScope(kyiv), 'h1', { input: { a: 1 }, synced: true });
    expect(readCustomerInputs({ id: 'g1' }, addressScope(kyiv))).toEqual({
      h1: { input: { a: 1 }, synced: true },
    });

    useCustomerInputStore.setState({ groups: {} });
    expect(readCustomerInputs({ id: 'g1' }, addressScope(kyiv))).toEqual({
      h1: { input: { a: 1 }, synced: true },
    });
  });

  it('drops inputs entered for another settlement or country', () => {
    remember({ id: 'g1' }, addressScope(kyiv), 'h1', { input: { a: 1 }, synced: true });
    expect(readCustomerInputs({ id: 'g1' }, addressScope(lviv))).toEqual({});
    expect(
      readCustomerInputs({ id: 'g1' }, addressScope({ ...kyiv, countryCode: 'PL' }))
    ).toEqual({});

    remember({ id: 'g1' }, addressScope(lviv), 'h2', { input: { b: 2 }, synced: true });
    expect(readCustomerInputs({ id: 'g1' }, addressScope(lviv))).toEqual({
      h2: { input: { b: 2 }, synced: true },
    });
  });

  it('marks an input saved only if it did not change after it was sent', () => {
    const scope = addressScope(kyiv);
    const { markSynced } = useCustomerInputStore.getState();
    remember({ id: 'g1' }, scope, 'h1', { input: { building: '1' }, synced: false });
    remember({ id: 'g1' }, scope, 'h1', { input: { building: '12' }, synced: false });

    markSynced({ id: 'g1' }, scope, 'h1', { building: '1' });
    expect(readCustomerInputs({ id: 'g1' }, scope).h1.synced).toBe(false);

    markSynced({ id: 'g1' }, scope, 'h1', { building: '12' });
    expect(readCustomerInputs({ id: 'g1' }, scope).h1.synced).toBe(true);
  });

  it('follows an input another tab saved', () => {
    const scope = addressScope(kyiv);
    remember({ id: 'g1' }, scope, 'h1', { input: { a: 1 }, synced: true });

    const other = JSON.stringify({ scope, inputs: { h1: { input: { a: 2 }, synced: true } } });
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'checkout-delivery-customer-input:g1',
        newValue: other,
      })
    );

    expect(readCustomerInputs({ id: 'g1' }, scope)).toEqual({
      h1: { input: { a: 2 }, synced: true },
    });
  });

  it('drops the inputs of groups the checkout no longer has', () => {
    remember({ id: 'g1' }, addressScope(kyiv), 'h1', { input: { a: 1 }, synced: true });
    remember({ id: 'g2' }, addressScope(kyiv), 'h2', { input: { b: 2 }, synced: true });

    pruneCustomerInputs(['g2']);

    expect(readCustomerInputs({ id: 'g1' }, addressScope(kyiv))).toEqual({});
    expect(readCustomerInputs({ id: 'g2' }, addressScope(kyiv))).toEqual({
      h2: { input: { b: 2 }, synced: true },
    });
    expect(
      window.localStorage.getItem('checkout-delivery-customer-input:g1')
    ).toBeNull();
  });

  it('keeps the inputs of groups another tab saved and drops abandoned ones', () => {
    const key = (id: string) => `checkout-delivery-customer-input:${id}`;
    const stored = (savedAt: number) =>
      JSON.stringify({ scope: addressScope(kyiv), inputs: {}, savedAt });
    window.localStorage.setItem(key('other-tab'), stored(Date.now()));
    window.localStorage.setItem(key('abandoned'), stored(Date.now() - 8 * 24 * 3600 * 1000));

    pruneCustomerInputs(['g3']);

    expect(window.localStorage.getItem(key('other-tab'))).not.toBeNull();
    expect(window.localStorage.getItem(key('abandoned'))).toBeNull();
  });

  it('removes every input once the order is accepted', () => {
    remember({ id: 'g1' }, addressScope(kyiv), 'h1', { input: { a: 1 }, synced: true });
    window.sessionStorage.setItem('checkout-delivery-customer-input:old', '{}');

    clearCustomerInputs();

    expect(readCustomerInputs({ id: 'g1' }, addressScope(kyiv))).toEqual({});
    expect(
      window.localStorage.getItem('checkout-delivery-customer-input:g1')
    ).toBeNull();
    expect(
      window.sessionStorage.getItem('checkout-delivery-customer-input:old')
    ).toBeNull();
  });

  it('keeps the inputs of a group whose id changed with its lines', () => {
    const scope = addressScope(kyiv);
    remember({ id: 'g1' }, scope, 'h1', { input: { a: 1 }, synced: false });
    const regrouped = { id: 'g2', replacesGroupIds: ['g1'] };

    expect(readCustomerInputs(regrouped, scope)).toEqual({
      h1: { input: { a: 1 }, synced: false },
    });

    remember(regrouped, scope, 'h2', { input: { b: 2 }, synced: false });
    useCustomerInputStore.setState({ groups: {} });
    expect(readCustomerInputs(regrouped, scope)).toEqual({
      h1: { input: { a: 1 }, synced: false },
      h2: { input: { b: 2 }, synced: false },
    });
  });
});
