/**
 * The light queries of fast data, batched: the cards of a listing and the variant of a product
 * page register their ids, and once per frame the batcher asks the gateway for those it has not
 * asked for in the last 30 s, sorted and cut by 100 (one set of ids, one URL, one entry of the
 * CDN's cache). Answers are written into the same normalized records the static snapshot came
 * in (`ProductVariant:<id>`), so components reading them with `useFragment` render the fresh
 * values. The viewer's loyalty goes as its own batch, with the session, once it is known.
 * Browser only: nothing runs on the server or before hydration.
 */
import type { ApolloClient, DocumentNode } from '@apollo/client';
import {
  SdkStorefrontPromotionsDocument,
  SdkViewerLoyaltyDocument,
  SdkVolatileCardsDocument,
  SdkVolatileVariantDocument,
} from '../../../graphql/apollo/generated/operations';
import { VIEWER_CONTEXT } from '../../../graphql/apollo/persisted';

/** Ids asked for less than this long ago are not asked for again. */
export const VOLATILE_TTL_MS = 30_000;

/** Ids in one request: about 6 KB of URL, well under the CDN's limit. */
export const VOLATILE_CHUNK = 100;

/** The longest delay `setTimeout` keeps. */
const MAX_DELAY_MS = 2_147_483_647;

/** The variables of the promotions every page shares (`useStorefrontPromotions()`). */
export const ALL_PROMOTIONS_VARIABLES = { kinds: null };

export interface VolatileBatcherOptions {
  /** Prices too: a static page of an image, updated with the image only. */
  withPrice: boolean;
  now?: () => number;
  /** Runs a flush at the end of the frame. */
  schedule?: (flush: () => void) => void;
  setTimer?: (run: () => void, delay: number) => unknown;
  clearTimer?: (timer: unknown) => void;
}

interface VariantRegistration {
  siblings: readonly string[];
  product?: string;
}

const sortedUnique = (ids: Iterable<string>) => [...new Set(ids)].sort();

function chunks<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

/** A counted set: an id stays while any component registered it. */
class Registry<T> {
  readonly entries = new Map<string, { count: number; value: T }>();

  add(id: string, value: T): () => void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.count += 1;
      entry.value = value;
    } else {
      this.entries.set(id, { count: 1, value });
    }
    let removed = false;
    return () => {
      if (removed) return;
      removed = true;
      const current = this.entries.get(id);
      if (!current) return;
      current.count -= 1;
      if (current.count <= 0) this.entries.delete(id);
    };
  }

  ids(): string[] {
    return [...this.entries.keys()];
  }
}

export class VolatileBatcher {
  private readonly cards = new Registry<string | undefined>();
  private readonly variants = new Registry<VariantRegistration>();
  /** When each id was last asked for, by query. */
  private readonly asked = {
    cards: new Map<string, number>(),
    variants: new Map<string, number>(),
    viewer: new Set<string>(),
  };
  private promotionsAsked = false;
  private scheduled = false;
  private viewer = false;
  private readonly timers = new Map<string, unknown>();
  private readonly now: () => number;
  private readonly schedule: (flush: () => void) => void;
  private readonly setTimer: (run: () => void, delay: number) => unknown;
  private readonly clearTimer: (timer: unknown) => void;

  constructor(
    private readonly client: ApolloClient,
    private readonly options: VolatileBatcherOptions
  ) {
    this.now = options.now ?? Date.now;
    this.schedule =
      options.schedule ??
      ((flush) =>
        typeof requestAnimationFrame === 'function'
          ? requestAnimationFrame(() => flush())
          : setTimeout(flush, 16));
    this.setTimer =
      options.setTimer ?? ((run, delay) => setTimeout(run, delay));
    this.clearTimer =
      options.clearTimer ??
      ((timer) => clearTimeout(timer as ReturnType<typeof setTimeout>));
  }

  /** A card of a listing shows `variant`: asked for with the next batch. */
  registerCard(variant: string, product?: string): () => void {
    const remove = this.cards.add(variant, product);
    this.request();
    return remove;
  }

  /** The page of a product shows `variant` whole and its siblings' availability. */
  registerVariant(
    variant: string,
    siblings: readonly string[],
    product?: string
  ): () => void {
    const remove = this.variants.add(variant, {
      siblings: sortedUnique(siblings.filter((id) => id !== variant)),
      product,
    });
    this.request();
    return () => {
      remove();
      if (!this.variants.entries.has(variant)) this.cancelTimer(variant);
    };
  }

  /**
   * The viewer is known (signed in) or a guest: the viewer's loyalty of every id shown is
   * asked for again whenever it changes, and for every id registered while signed in.
   */
  setViewer(signedIn: boolean): void {
    const changed = signedIn !== this.viewer;
    this.viewer = signedIn;
    if (!changed) return;
    this.asked.viewer.clear();
    void this.askViewer(this.viewerIds(), true);
  }

  /** Asks again for ids (all when none are given) whatever their age: a cart said no stock. */
  refresh(ids?: readonly string[]): void {
    for (const map of [this.asked.cards, this.asked.variants]) {
      if (!ids) map.clear();
      else for (const id of ids) map.delete(id);
    }
    this.request();
  }

  /** The page is shown again: ids older than the TTL are asked for again. */
  visible(): void {
    this.request();
  }

  dispose(): void {
    for (const timer of this.timers.values()) this.clearTimer(timer);
    this.timers.clear();
  }

  private request(): void {
    if (this.scheduled) return;
    this.scheduled = true;
    this.schedule(() => {
      this.scheduled = false;
      void this.flush();
    });
  }

  private due(map: Map<string, number>, id: string): boolean {
    const at = map.get(id);
    return at === undefined || this.now() - at >= VOLATILE_TTL_MS;
  }

  private viewerIds(): string[] {
    const ids: string[] = [];
    for (const [id, { value }] of this.cards.entries) {
      ids.push(id);
      if (value) ids.push(value);
    }
    for (const [id, { value }] of this.variants.entries) {
      ids.push(id);
      if (value.product) ids.push(value.product);
    }
    return sortedUnique(ids);
  }

  private query(
    query: DocumentNode,
    variables: Record<string, unknown>,
    context?: Record<string, unknown>
  ) {
    return this.client
      .query({ query, variables, fetchPolicy: 'network-only', context })
      .catch(() => null);
  }

  /** One batch: the cards and the variants due, the promotions once, the viewer's ids. */
  async flush(): Promise<void> {
    const now = this.now();
    const { withPrice } = this.options;
    const work: Array<Promise<unknown>> = [];

    const cards = this.cards
      .ids()
      .filter(
        (id) => !this.variants.entries.has(id) && this.due(this.asked.cards, id)
      )
      .sort();
    for (const ids of chunks(cards, VOLATILE_CHUNK)) {
      for (const id of ids) this.asked.cards.set(id, now);
      work.push(this.query(SdkVolatileCardsDocument, { ids, withPrice }));
    }

    for (const [id, { value }] of this.variants.entries) {
      if (!this.due(this.asked.variants, id)) continue;
      this.asked.variants.set(id, now);
      work.push(
        this.query(SdkVolatileVariantDocument, {
          id,
          siblings: value.siblings.slice(0, VOLATILE_CHUNK),
          withPrice,
        }).then((result) => this.watchValidUntil(id, result?.data))
      );
    }

    if (
      this.variants.entries.size > 0 &&
      !this.promotionsAsked &&
      !this.client.readQuery({
        query: SdkStorefrontPromotionsDocument,
        variables: ALL_PROMOTIONS_VARIABLES,
      })
    ) {
      this.promotionsAsked = true;
      work.push(
        this.query(SdkStorefrontPromotionsDocument, ALL_PROMOTIONS_VARIABLES)
      );
    }

    if (this.viewer) work.push(this.askViewer(this.viewerIds(), false));
    await Promise.all(work);
  }

  /** The viewer's loyalty of `ids` not asked for since the viewer changed. */
  private async askViewer(ids: readonly string[], all: boolean): Promise<void> {
    const due = all ? [...ids] : ids.filter((id) => !this.asked.viewer.has(id));
    if (due.length === 0) return;
    for (const id of due) this.asked.viewer.add(id);
    await Promise.all(
      chunks(due, VOLATILE_CHUNK).map((chunk) =>
        this.query(
          SdkViewerLoyaltyDocument,
          { ids: chunk },
          { [VIEWER_CONTEXT]: true }
        )
      )
    );
  }

  /** The promotions of a variant change at their `validUntil`: asked for again then. */
  private watchValidUntil(id: string, data: unknown): void {
    const variant = (
      data as
        | { variant?: { promotions?: { validUntil?: string | null } } }
        | undefined
    )?.variant;
    const validUntil = variant?.promotions?.validUntil;
    this.cancelTimer(id);
    if (!validUntil) return;
    const time = Date.parse(validUntil);
    if (!Number.isFinite(time)) return;
    const delay = Math.min(Math.max(time - this.now(), 0), MAX_DELAY_MS);
    this.timers.set(
      id,
      this.setTimer(() => {
        this.timers.delete(id);
        if (this.variants.entries.has(id)) this.refresh([id]);
      }, delay)
    );
  }

  private cancelTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) this.clearTimer(timer);
    this.timers.delete(id);
  }
}
