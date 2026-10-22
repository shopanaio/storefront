import { describe, expect, it } from 'vitest';
import { AttemptJournal } from '#checkout/state/placement/attemptJournal';
import type { AttemptJournalStorage } from '#checkout/state/placement/attemptJournal';
import {
  phaseForOutcome,
  recordOutcome,
} from '#checkout/state/placement/transitions';
import type { PlacementResult } from '#checkout/state/placement/types';

function memoryJournal() {
  const items = new Map<string, string>();
  const storage: AttemptJournalStorage = {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  };
  let keys = 0;
  return new AttemptJournal(
    storage,
    () => 1,
    () => `key-${++keys}`
  );
}

const result: PlacementResult = {
  placementId: 'placement-1',
  placementToken: null,
  placementState: 'PLACED',
  paymentFlow: null,
  checkoutId: 'checkout-1',
  resultRevision: 'rev-1',
  orderId: 'order-1',
  orderNumber: null,
  status: 'PAID',
  customerAction: null,
  paymentFailure: null,
  userErrors: [],
};

function begin(journal: AttemptJournal) {
  return journal.markSent(
    journal.begin({
      checkoutId: 'checkout-1',
      resultRevision: 'rev-1',
      paymentFlow: 'ONLINE',
      returnUrl: 'https://shop.example/checkout/return?checkout=checkout-1',
      expectedTotal: { amount: '1000', currencyCode: 'UAH' },
      termsAccepted: false,
      disclosuresVersion: null,
    })
  );
}

describe('phaseForOutcome', () => {
  it('follows a redirect on submit and offers it on recovery', () => {
    const outcome = { kind: 'redirect' as const, url: 'https://pay.example' };
    expect(phaseForOutcome(outcome, 'submit')).toEqual({
      name: 'redirecting',
      url: 'https://pay.example',
    });
    expect(phaseForOutcome(outcome, 'recover')).toEqual({
      name: 'payment-incomplete',
      url: 'https://pay.example',
    });
  });
});

describe('recordOutcome', () => {
  it('clears the attempt of an accepted order', () => {
    const journal = memoryJournal();
    recordOutcome(journal, begin(journal), result, {
      kind: 'accepted',
      orderId: 'order-1',
      orderNumber: null,
      status: 'PAID',
      paymentFlow: null,
    });
    expect(journal.read('checkout-1')).toBeNull();
  });

  it('keeps the key for a retryable rejection', () => {
    const journal = memoryJournal();
    recordOutcome(journal, begin(journal), result, {
      kind: 'rejected',
      code: 'CHECKOUT_PIPELINE_DEADLINE_EXCEEDED',
      retryable: true,
    });
    expect(journal.read('checkout-1')).toMatchObject({
      idempotencyKey: 'key-1',
      state: 'sent',
    });
  });

  it('clears the attempt of a final rejection', () => {
    const journal = memoryJournal();
    recordOutcome(journal, begin(journal), result, {
      kind: 'rejected',
      code: 'CHECKOUT_NOT_FOUND',
      retryable: false,
    });
    expect(journal.read('checkout-1')).toBeNull();
  });

  it('marks a failed payment so the retry takes a new key', () => {
    const journal = memoryJournal();
    recordOutcome(
      journal,
      begin(journal),
      { ...result, status: 'PAYMENT_FAILED' },
      {
        kind: 'payment-failed',
        failure: null,
      }
    );
    expect(journal.read('checkout-1')).toMatchObject({ state: 'failed' });
  });

  it('keeps a placement in progress for recovery', () => {
    const journal = memoryJournal();
    recordOutcome(
      journal,
      begin(journal),
      { ...result, status: 'REQUIRES_ACTION' },
      {
        kind: 'redirect',
        url: 'https://pay.example',
      }
    );
    expect(journal.read('checkout-1')).toMatchObject({
      state: 'resolved',
      placementId: 'placement-1',
    });
  });
});
