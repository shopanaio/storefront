import { createCheckoutIdempotencyKey } from '@shopana/storefront-sdk/modules/cart/core/utils/idempotencyKey';
import type { MoneyInput } from '#checkout/graphql/operations';
import type {
  PaymentFlow,
  PlacementLocator,
  PlacementResult,
  PlacementStatus,
} from '#checkout/state/placement/types';

/**
 * Client journal of the current placement attempt (plan, section 2.6, decision 1.8).
 *
 * It keeps the idempotency key with its usage state so that a retry after a lost answer reuses
 * the key, and a finished or abandoned attempt never makes the key stick. The server stays the
 * source of truth: the journal only speeds up recovery in the same browser.
 *
 * - `created`: a key is issued, the request has not been sent.
 * - `sent`: the request was sent and no answer was recorded; retry with the same key.
 * - `resolved`: the API answered with a placement that is still in progress.
 * - `failed`: the payment failed; the next attempt takes a new key.
 *
 * Attempts are kept per checkout; an attempt past its TTL is dropped.
 */
export type AttemptState = 'created' | 'sent' | 'resolved' | 'failed';

export interface PlacementAttempt {
  checkoutId: string;
  idempotencyKey: string;
  /** Sent byte-for-byte equal between retries: it is part of the request hash. */
  returnUrl: string;
  /**
   * The total the buyer confirmed by pressing the button (BR-q2tm). It is part of the request
   * hash too; the API places nothing when the recalculated checkout pays another amount.
   */
  expectedTotal: MoneyInput;
  /**
   * The terms acceptance sent with the request: whether the buyer ticked the checkbox, and the
   * version of the disclosures shown (`null` without disclosures). Both are part of the request
   * hash.
   */
  termsAccepted: boolean;
  disclosuresVersion: string | null;
  resultRevision: string;
  paymentFlow: PaymentFlow | null;
  state: AttemptState;
  placementId: string | null;
  placementToken: string | null;
  orderId: string | null;
  lastStatus: PlacementStatus | null;
  createdAt: number;
  updatedAt: number;
}

export interface AttemptJournalStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  /** Enumeration, when the storage supports it: used to drop expired attempts of other checkouts. */
  readonly length?: number;
  key?(index: number): string | null;
}

/** Each checkout has its own record, so an attempt never removes the attempt of another checkout. */
export const ATTEMPT_JOURNAL_PREFIX = 'shopana:checkout:placement-attempt:';
export const ATTEMPT_TTL_MS = 24 * 60 * 60 * 1000;

export function attemptStorageKey(checkoutId: string): string {
  return `${ATTEMPT_JOURNAL_PREFIX}${checkoutId}`;
}

export interface BeginAttemptInput {
  checkoutId: string;
  resultRevision: string;
  paymentFlow: PaymentFlow | null;
  returnUrl: string;
  expectedTotal: MoneyInput;
  termsAccepted: boolean;
  disclosuresVersion: string | null;
}

export class AttemptJournal {
  /**
   * In-memory copy of the attempts. It is the journal when storage is missing or failing, so a
   * retry after a lost answer still reuses the key within the page session.
   */
  private readonly memory = new Map<string, PlacementAttempt>();
  private storageFailed = false;

  constructor(
    private readonly storage: AttemptJournalStorage | null,
    private readonly now: () => number = Date.now,
    private readonly createKey: () => string = createCheckoutIdempotencyKey
  ) {}

  /** Returns the attempt of `checkoutId`. An attempt past its TTL is removed. */
  read(checkoutId: string | null | undefined): PlacementAttempt | null {
    if (!checkoutId) return null;
    const attempt = this.readRaw(checkoutId);
    if (!attempt) return null;
    if (attempt.checkoutId !== checkoutId || this.isExpired(attempt)) {
      this.clear(checkoutId);
      return null;
    }
    return attempt;
  }

  /**
   * Returns the attempt to send for the current checkout snapshot.
   *
   * The key is reused while the previous request may still have been processed (`created`,
   * `sent`) and the snapshot did not change. A new key is issued after a payment failure, when
   * `resultRevision` or the terms acceptance changed before the payment started, or when there
   * is no attempt yet.
   */
  begin(input: BeginAttemptInput): PlacementAttempt {
    this.prune();
    const current = this.read(input.checkoutId);
    const reusable =
      current !== null &&
      (current.state === 'created' || current.state === 'sent') &&
      current.resultRevision === input.resultRevision &&
      current.termsAccepted === input.termsAccepted &&
      current.disclosuresVersion === input.disclosuresVersion;
    if (reusable) {
      return current;
    }
    const timestamp = this.now();
    const attempt: PlacementAttempt = {
      checkoutId: input.checkoutId,
      idempotencyKey: this.createKey(),
      returnUrl: input.returnUrl,
      expectedTotal: input.expectedTotal,
      termsAccepted: input.termsAccepted,
      disclosuresVersion: input.disclosuresVersion,
      resultRevision: input.resultRevision,
      paymentFlow: input.paymentFlow,
      state: 'created',
      placementId: null,
      placementToken: null,
      orderId: null,
      lastStatus: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.write(attempt);
    return attempt;
  }

  /** Issues a new key for the same snapshot, e.g. after `IDEMPOTENCY_KEY_PARAMETER_MISMATCH`. */
  rotate(attempt: PlacementAttempt): PlacementAttempt {
    const next: PlacementAttempt = {
      ...attempt,
      idempotencyKey: this.createKey(),
      state: 'created',
      placementId: null,
      placementToken: null,
      orderId: null,
      lastStatus: null,
      updatedAt: this.now(),
    };
    this.write(next);
    return next;
  }

  markSent(attempt: PlacementAttempt): PlacementAttempt {
    return this.update(attempt, { state: 'sent' });
  }

  /** Records a placement that is still in progress (redirect, pending payment). */
  markResolved(
    attempt: PlacementAttempt,
    result: PlacementResult
  ): PlacementAttempt {
    return this.update(attempt, {
      state: 'resolved',
      placementId: result.placementId ?? attempt.placementId,
      placementToken: result.placementToken ?? attempt.placementToken,
      orderId: result.orderId ?? attempt.orderId,
      lastStatus: result.status ?? attempt.lastStatus,
    });
  }

  /** The payment failed: keep the placement for reference, but never reuse the key. */
  markFailed(
    attempt: PlacementAttempt,
    result: PlacementResult | null
  ): PlacementAttempt {
    return this.update(attempt, {
      state: 'failed',
      placementId: result?.placementId ?? attempt.placementId,
      lastStatus: result?.status ?? attempt.lastStatus,
    });
  }

  /** Removes the attempt of `checkoutId`: its placement reached a final state or was rejected. */
  clear(checkoutId: string): void {
    this.memory.delete(checkoutId);
    try {
      this.storage?.removeItem(attemptStorageKey(checkoutId));
    } catch {
      // Storage may be unavailable (private mode, blocked site data).
      this.storageFailed = true;
    }
  }

  /** Drops expired attempts of every checkout, so abandoned records do not pile up. */
  private prune(): void {
    for (const attempt of [...this.memory.values()]) {
      if (this.isExpired(attempt)) this.memory.delete(attempt.checkoutId);
    }
    const storage = this.storage;
    if (!storage || this.storageFailed || typeof storage.key !== 'function')
      return;
    try {
      const keys: string[] = [];
      for (let index = 0; index < (storage.length ?? 0); index += 1) {
        const key = storage.key(index);
        if (key?.startsWith(ATTEMPT_JOURNAL_PREFIX)) keys.push(key);
      }
      for (const key of keys) {
        this.read(key.slice(ATTEMPT_JOURNAL_PREFIX.length));
      }
    } catch {
      this.storageFailed = true;
    }
  }

  private isExpired(attempt: PlacementAttempt): boolean {
    return this.now() - attempt.createdAt > ATTEMPT_TTL_MS;
  }

  private update(
    attempt: PlacementAttempt,
    patch: Partial<PlacementAttempt>
  ): PlacementAttempt {
    const next = { ...attempt, ...patch, updatedAt: this.now() };
    this.write(next);
    return next;
  }

  private write(attempt: PlacementAttempt): void {
    this.memory.set(attempt.checkoutId, attempt);
    try {
      this.storage?.setItem(
        attemptStorageKey(attempt.checkoutId),
        JSON.stringify(attempt)
      );
    } catch {
      // The memory copy keeps the attempt; only recovery after a reload is lost.
      this.storageFailed = true;
    }
  }

  private readRaw(checkoutId: string): PlacementAttempt | null {
    if (!this.storage || this.storageFailed) {
      return this.memory.get(checkoutId) ?? null;
    }
    let raw: string | null = null;
    try {
      raw = this.storage.getItem(attemptStorageKey(checkoutId));
    } catch {
      this.storageFailed = true;
      return this.memory.get(checkoutId) ?? null;
    }
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isPlacementAttempt(parsed)) return parsed;
    } catch {
      // Fall through: a malformed record is dropped.
    }
    this.clear(checkoutId);
    return null;
  }
}

export function attemptLocator(
  attempt: PlacementAttempt | null
): PlacementLocator | null {
  return attempt?.placementId
    ? {
        placementId: attempt.placementId,
        placementToken: attempt.placementToken,
      }
    : null;
}

function isPlacementAttempt(value: unknown): value is PlacementAttempt {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.checkoutId === 'string' &&
    typeof record.idempotencyKey === 'string' &&
    typeof record.returnUrl === 'string' &&
    isMoneyInput(record.expectedTotal) &&
    typeof record.termsAccepted === 'boolean' &&
    (record.disclosuresVersion === null ||
      typeof record.disclosuresVersion === 'string') &&
    typeof record.resultRevision === 'string' &&
    typeof record.state === 'string' &&
    typeof record.createdAt === 'number'
  );
}

function isMoneyInput(value: unknown): value is MoneyInput {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.amount === 'string' && typeof record.currencyCode === 'string'
  );
}

function browserStorage(): AttemptJournalStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

let sharedJournal: AttemptJournal | null = null;

/** One journal per page session, so its memory copy survives remounts of the checkout. */
export function createAttemptJournal(): AttemptJournal {
  sharedJournal ??= new AttemptJournal(browserStorage());
  return sharedJournal;
}
