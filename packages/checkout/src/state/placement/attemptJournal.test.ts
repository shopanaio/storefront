import type { AttemptJournalStorage } from '#checkout/state/placement/attemptJournal';
import {
  ATTEMPT_TTL_MS,
  AttemptJournal,
  attemptStorageKey,
} from '#checkout/state/placement/attemptJournal';
import type { PlacementResult } from '#checkout/state/placement/types';
import { beforeEach, describe, expect, it } from 'vitest';

class MemoryStorage implements AttemptJournalStorage {
  items = new Map<string, string>();
  getItem(key: string) {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.items.set(key, value);
  }
  removeItem(key: string) {
    this.items.delete(key);
  }
  get length() {
    return this.items.size;
  }
  key(index: number) {
    return [...this.items.keys()][index] ?? null;
  }
}

const KEY_1 = attemptStorageKey('checkout-1');

const input = {
  checkoutId: 'checkout-1',
  resultRevision: 'rev-1',
  paymentFlow: 'ONLINE' as const,
  returnUrl: 'https://shop.example/uk/checkout/return?checkout=checkout-1',
  expectedTotal: { amount: '1000', currencyCode: 'UAH' as const },
  termsAccepted: false,
  disclosuresVersion: null,
};

const placement: PlacementResult = {
  placementId: 'placement-1',
  placementToken: null,
  placementState: 'PLACED',
  paymentFlow: null,
  checkoutId: 'checkout-1',
  resultRevision: 'rev-1',
  orderId: 'order-1',
  orderNumber: null,
  status: 'REQUIRES_ACTION',
  customerAction: null,
  paymentFailure: null,
  userErrors: [],
};

describe('AttemptJournal', () => {
  let storage: MemoryStorage;
  let now: number;
  let keys: number;
  let journal: AttemptJournal;

  beforeEach(() => {
    storage = new MemoryStorage();
    now = 1_000_000;
    keys = 0;
    journal = new AttemptJournal(
      storage,
      () => now,
      () => `key-${++keys}`
    );
  });

  it('persists the attempt in storage', () => {
    const attempt = journal.begin(input);
    expect(attempt).toMatchObject({
      idempotencyKey: 'key-1',
      state: 'created',
    });
    expect(JSON.parse(storage.getItem(KEY_1)!)).toMatchObject({
      checkoutId: 'checkout-1',
      idempotencyKey: 'key-1',
    });
  });

  it('reuses the key and return URL of an unanswered request', () => {
    journal.markSent(journal.begin(input));
    const retry = journal.begin({
      ...input,
      returnUrl: 'https://other.example/',
    });
    expect(retry).toMatchObject({
      idempotencyKey: 'key-1',
      state: 'sent',
      returnUrl: input.returnUrl,
    });
  });

  it('BR-q2tm: resends the total the buyer confirmed with the key', () => {
    journal.markSent(journal.begin(input));
    const retry = journal.begin({
      ...input,
      expectedTotal: { amount: '1200', currencyCode: 'UAH' },
    });
    expect(retry).toMatchObject({
      idempotencyKey: 'key-1',
      expectedTotal: input.expectedTotal,
    });
  });

  it('drops a stored attempt without the confirmed total', () => {
    const { expectedTotal: _expectedTotal, ...legacy } = journal.markSent(
      journal.begin(input)
    );
    storage.setItem(KEY_1, JSON.stringify(legacy));
    expect(
      new AttemptJournal(storage, () => now).read('checkout-1')
    ).toBeNull();
  });

  it('issues a new key when the snapshot changed before payment', () => {
    journal.markSent(journal.begin(input));
    expect(
      journal.begin({ ...input, resultRevision: 'rev-2' }).idempotencyKey
    ).toBe('key-2');
  });

  it('issues a new key after a failed payment', () => {
    const attempt = journal.markSent(journal.begin(input));
    journal.markFailed(attempt, { ...placement, status: 'PAYMENT_FAILED' });
    expect(journal.begin(input).idempotencyKey).toBe('key-2');
  });

  it('rotates the key for the same snapshot', () => {
    const attempt = journal.markSent(journal.begin(input));
    expect(journal.rotate(attempt)).toMatchObject({
      idempotencyKey: 'key-2',
      state: 'created',
      returnUrl: input.returnUrl,
    });
  });

  it('records a placement in progress', () => {
    const attempt = journal.markSent(journal.begin(input));
    journal.markResolved(attempt, placement);
    expect(journal.read('checkout-1')).toMatchObject({
      state: 'resolved',
      placementId: 'placement-1',
      orderId: 'order-1',
      lastStatus: 'REQUIRES_ACTION',
    });
  });

  it('keeps the attempts of different checkouts apart', () => {
    journal.markSent(journal.begin(input));
    journal.begin({ ...input, checkoutId: 'checkout-2' });
    expect(journal.read('checkout-2')).toMatchObject({
      idempotencyKey: 'key-2',
    });
    expect(journal.read('checkout-1')).toMatchObject({
      idempotencyKey: 'key-1',
      state: 'sent',
    });
    journal.clear('checkout-2');
    expect(journal.read('checkout-1')).not.toBeNull();
  });

  it('drops expired attempts of other checkouts when an attempt begins', () => {
    journal.begin(input);
    now += ATTEMPT_TTL_MS + 1;
    journal.begin({ ...input, checkoutId: 'checkout-2' });
    expect(storage.getItem(KEY_1)).toBeNull();
    expect(storage.getItem(attemptStorageKey('checkout-2'))).not.toBeNull();
  });

  it('drops the attempt after its TTL', () => {
    journal.begin(input);
    now += ATTEMPT_TTL_MS + 1;
    expect(journal.read('checkout-1')).toBeNull();
    expect(storage.getItem(KEY_1)).toBeNull();
  });

  it('drops a malformed record', () => {
    storage.setItem(KEY_1, '{"checkoutId":1}');
    expect(journal.read('checkout-1')).toBeNull();
    expect(storage.getItem(KEY_1)).toBeNull();
  });

  it('keeps the attempt in memory without storage', () => {
    const memoryless = new AttemptJournal(
      null,
      () => now,
      () => `key-${++keys}`
    );
    memoryless.markSent(memoryless.begin(input));
    expect(memoryless.begin(input)).toMatchObject({
      idempotencyKey: 'key-1',
      state: 'sent',
    });
    memoryless.clear('checkout-1');
    expect(memoryless.read('checkout-1')).toBeNull();
  });

  it('falls back to memory when storage fails', () => {
    const failing: AttemptJournalStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    const fallback = new AttemptJournal(
      failing,
      () => now,
      () => `key-${++keys}`
    );
    const attempt = fallback.markSent(fallback.begin(input));
    fallback.markResolved(attempt, placement);
    expect(fallback.read('checkout-1')).toMatchObject({
      idempotencyKey: 'key-1',
      state: 'resolved',
      placementId: 'placement-1',
    });
  });
});
