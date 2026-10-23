import { beforeEach, describe, expect, it } from 'vitest';
import {
  addressScope,
  clearCustomerInputs,
  pruneCustomerInputs,
  readCustomerInputs,
  sameInput,
  useCustomerInputStore,
} from './customerInputStorage';
import { methodKey } from './shipments';

/** A Nova Poshta method by its service code, and its key among the stored inputs. */
const np = (code: string) => ({ provider: 'nova-poshta', code });
const key = (code: string) => methodKey(np(code));

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
    useCustomerInputStore.setState({ groups: {} });
  });

  it('keeps inputs for the same address, also after a reload', () => {
    remember({ id: 'g1' }, addressScope(kyiv), np('h1'), {
      input: { a: 1 },
      synced: true,
    });
    expect(readCustomerInputs({ id: 'g1' }, addressScope(kyiv))).toEqual({
      [key('h1')]: { input: { a: 1 }, synced: true },
    });

    useCustomerInputStore.setState({ groups: {} });
    expect(readCustomerInputs({ id: 'g1' }, addressScope(kyiv))).toEqual({
      [key('h1')]: { input: { a: 1 }, synced: true },
    });
  });

  it('drops inputs entered for another settlement or country', () => {
    remember({ id: 'g1' }, addressScope(kyiv), np('h1'), {
      input: { a: 1 },
      synced: true,
    });
    expect(readCustomerInputs({ id: 'g1' }, addressScope(lviv))).toEqual({});
    expect(
      readCustomerInputs(
        { id: 'g1' },
        addressScope({ ...kyiv, countryCode: 'PL' })
      )
    ).toEqual({});

    remember({ id: 'g1' }, addressScope(lviv), np('h2'), {
      input: { b: 2 },
      synced: true,
    });
    expect(readCustomerInputs({ id: 'g1' }, addressScope(lviv))).toEqual({
      [key('h2')]: { input: { b: 2 }, synced: true },
    });
  });

  it('marks an input saved only if it did not change after it was sent', () => {
    const scope = addressScope(kyiv);
    const { markSynced } = useCustomerInputStore.getState();
    remember({ id: 'g1' }, scope, np('h1'), {
      input: { building: '1' },
      synced: false,
    });
    remember({ id: 'g1' }, scope, np('h1'), {
      input: { building: '12' },
      synced: false,
    });

    markSynced({ id: 'g1' }, scope, np('h1'), { building: '1' });
    expect(readCustomerInputs({ id: 'g1' }, scope)[key('h1')].synced).toBe(
      false
    );

    markSynced({ id: 'g1' }, scope, np('h1'), { building: '12' });
    expect(readCustomerInputs({ id: 'g1' }, scope)[key('h1')].synced).toBe(
      true
    );
  });

  it('follows an input another tab saved', () => {
    const scope = addressScope(kyiv);
    remember({ id: 'g1' }, scope, np('h1'), { input: { a: 1 }, synced: true });

    const other = JSON.stringify({
      scope,
      inputs: { [key('h1')]: { input: { a: 2 }, synced: true } },
    });
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'checkout-delivery-customer-input:g1',
        newValue: other,
      })
    );

    expect(readCustomerInputs({ id: 'g1' }, scope)).toEqual({
      [key('h1')]: { input: { a: 2 }, synced: true },
    });
  });

  it('drops the inputs of groups the checkout no longer has', () => {
    remember({ id: 'g1' }, addressScope(kyiv), np('h1'), {
      input: { a: 1 },
      synced: true,
    });
    remember({ id: 'g2' }, addressScope(kyiv), np('h2'), {
      input: { b: 2 },
      synced: true,
    });

    pruneCustomerInputs(['g2']);

    expect(readCustomerInputs({ id: 'g1' }, addressScope(kyiv))).toEqual({});
    expect(readCustomerInputs({ id: 'g2' }, addressScope(kyiv))).toEqual({
      [key('h2')]: { input: { b: 2 }, synced: true },
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
    window.localStorage.setItem(
      key('abandoned'),
      stored(Date.now() - 8 * 24 * 3600 * 1000)
    );

    pruneCustomerInputs(['g3']);

    expect(window.localStorage.getItem(key('other-tab'))).not.toBeNull();
    expect(window.localStorage.getItem(key('abandoned'))).toBeNull();
  });

  it('removes every input once the order is accepted', () => {
    remember({ id: 'g1' }, addressScope(kyiv), np('h1'), {
      input: { a: 1 },
      synced: true,
    });

    clearCustomerInputs();

    expect(readCustomerInputs({ id: 'g1' }, addressScope(kyiv))).toEqual({});
    expect(
      window.localStorage.getItem('checkout-delivery-customer-input:g1')
    ).toBeNull();
  });

  it('keeps the inputs of a group whose id changed with its lines', () => {
    const scope = addressScope(kyiv);
    remember({ id: 'g1' }, scope, np('h1'), { input: { a: 1 }, synced: false });
    const regrouped = { id: 'g2', replacesGroupIds: ['g1'] };

    expect(readCustomerInputs(regrouped, scope)).toEqual({
      [key('h1')]: { input: { a: 1 }, synced: false },
    });

    remember(regrouped, scope, np('h2'), { input: { b: 2 }, synced: false });
    useCustomerInputStore.setState({ groups: {} });
    expect(readCustomerInputs(regrouped, scope)).toEqual({
      [key('h1')]: { input: { a: 1 }, synced: false },
      [key('h2')]: { input: { b: 2 }, synced: false },
    });
  });

  it('SC-sf3h: keeps the input of a method whose option got a new handle in a new group', () => {
    const scope = addressScope(kyiv);
    remember({ id: 'g7' }, scope, np('warehouse-warehouse'), {
      input: { building: '1' },
      synced: false,
    });
    // The new group quotes the same method again: its option has another handle.
    const regrouped = { id: 'g8', replacesGroupIds: ['g7'] };
    expect(
      readCustomerInputs(regrouped, scope)[key('warehouse-warehouse')]
    ).toEqual({
      input: { building: '1' },
      synced: false,
    });
  });

  it('compares inputs as values, whatever the order of their keys', () => {
    expect(
      sameInput(
        { type: 'WAREHOUSE', settlementRef: 's', warehouseRef: 'w' },
        { warehouseRef: 'w', type: 'WAREHOUSE', settlementRef: 's' }
      )
    ).toBe(true);
    expect(sameInput({ a: { x: 1, y: 2 } }, { a: { y: 2, x: 1 } })).toBe(true);
    expect(sameInput({ a: 1 }, { a: 2 })).toBe(false);
    expect(sameInput([1, 2], [2, 1])).toBe(false);
  });
});
