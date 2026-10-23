import { describe, expect, it, vi } from 'vitest';
import {
  BannerPriority,
  collectBanners,
} from '#checkout/state/banners/banners';
import type {
  BannerHandlers,
  BannerInput,
} from '#checkout/state/banners/banners';
import { SectionId } from '#checkout/state/interface';
import type { Checkout } from '#checkout/types/entity';

/** The click a banner passes its action; the handlers do not read it. */
const click = {} as never;

const t = (key: string, values?: Record<string, string | number>) =>
  values ? `${key} ${JSON.stringify(values)}` : key;

const issue = (overrides: Partial<Checkout.Issue>): Checkout.Issue => ({
  code: 'SOME_CODE',
  message: 'English text from the API',
  severity: 'ERROR',
  effect: 'STOP',
  field: [],
  lineId: null,
  retryable: false,
  ...overrides,
});

const input = (overrides: Partial<BannerInput> = {}): BannerInput => ({
  renewal: 'idle',
  placement: { name: 'idle' },
  attempted: false,
  readiness: { canPlace: true, expired: false, blocking: [], notices: [] },
  missingSections: [],
  undeliverableCount: 0,
  saveErrors: [],
  notifications: [],
  dismissed: new Set(),
  loyalty: { redemption: null, selectedSource: null, reducedTo: null, busy: false },
  ...overrides,
});

const handlers = (): BannerHandlers => ({
  retryRenewal: vi.fn(),
  closeRenewal: vi.fn(),
  retryPlacement: vi.fn(),
  closePlacement: vi.fn(),
  closeSaveError: vi.fn(),
  goHome: vi.fn(),
  homePath: '/',
  openCart: vi.fn(),
  focusSection: vi.fn(),
  focusSummary: vi.fn(),
  focusTerms: vi.fn(),
  dismiss: vi.fn(),
  dropRedemption: vi.fn(),
  dropReward: vi.fn(),
  refreshLoyalty: vi.fn(),
  signIn: vi.fn(),
});

const collect = (overrides: Partial<BannerInput> = {}, h = handlers()) =>
  collectBanners(input(overrides), h, t);

describe('collectBanners', () => {
  it('shows nothing for a checkout without problems', () => {
    expect(collect()).toEqual([]);
  });

  it('puts the most important message first: closed, placement, blocking, saves, changes', () => {
    const banners = collect({
      renewal: 'failed',
      placement: { name: 'payment-failed', failure: null },
      undeliverableCount: 1,
      saveErrors: [
        {
          key: 'note',
          message: 'Note not saved',
          sectionId: SectionId.Comment,
        },
      ],
      notifications: [
        {
          id: 'n1',
          code: 'OUT_OF_STOCK',
          severity: 'WARNING',
          isDismissed: false,
        },
      ],
    });

    expect(banners.map((banner) => banner.priority)).toEqual([
      BannerPriority.Closed,
      BannerPriority.Placement,
      BannerPriority.Blocking,
      BannerPriority.SaveError,
      BannerPriority.Change,
    ]);
    expect(banners[0]).toMatchObject({
      tone: 'critical',
      title: 'checkout-renew-failed',
    });
  });

  it('a failed payment is critical, cannot be closed and offers to try again', () => {
    const h = handlers();
    const [banner] = collect(
      { placement: { name: 'payment-failed', failure: null } },
      h
    );

    expect(banner).toMatchObject({
      tone: 'critical',
      title: 'payment-failed-title',
    });
    expect(banner.onDismiss).toBeUndefined();
    banner.action?.onClick?.(click);
    expect(h.retryPlacement).toHaveBeenCalled();
  });

  it('an order placed elsewhere leaves the checkout through the home page', () => {
    const h = handlers();
    const [banner] = collect(
      { placement: { name: 'rejected', code: 'CHECKOUT_ALREADY_PLACED' } },
      h
    );

    expect(banner.priority).toBe(BannerPriority.Closed);
    banner.action?.onClick?.(click);
    expect(h.goHome).toHaveBeenCalled();
  });

  it('blocking problems appear once the buyer pressed the button, as one message', () => {
    const blocking = [
      issue({ code: 'PAYMENT_METHOD_REQUIRED', field: ['payment'] }),
      issue({ code: 'APP_RULE', field: ['customerIdentity', 'email'] }),
    ];
    const readiness = {
      canPlace: false,
      expired: false,
      blocking,
      notices: [],
    };

    expect(
      collect({ readiness, missingSections: [SectionId.Delivery] })
    ).toEqual([]);

    const h = handlers();
    const banners = collect(
      { readiness, missingSections: [SectionId.Delivery], attempted: true },
      h
    );
    expect(banners).toHaveLength(1);
    expect(banners[0].title).toBe(
      `banner-fill-sections ${JSON.stringify({ sections: 'contact, delivery, payment' })}`
    );
    banners[0].action?.onClick?.(click);
    expect(h.focusSection).toHaveBeenCalledWith(SectionId.Contact);
  });

  it('a known issue of one section says what to do instead of naming the section', () => {
    const blocking = [
      issue({
        code: 'DELIVERY_OPTION_REQUIRED',
        field: ['deliveryGroups', '0'],
      }),
    ];
    const [banner] = collect({
      attempted: true,
      readiness: { canPlace: false, expired: false, blocking, notices: [] },
    });

    expect(banner).toMatchObject({
      tone: 'action',
      title: 'issue-delivery-option-required',
    });
  });

  it('never shows the English text of the API', () => {
    const banners = collect({
      attempted: true,
      readiness: {
        canPlace: false,
        expired: false,
        blocking: [issue({ code: 'APP_LINE_RULE', lineId: 'line-1' })],
        notices: [
          issue({
            code: 'LOYALTY_REDEMPTION_REDUCED',
            effect: 'CONTINUE',
            severity: 'WARNING',
          }),
        ],
      },
    });

    expect(banners.map((banner) => banner.title)).toEqual([
      'issue-check-order',
      'issue-loyalty-redemption-reduced',
    ]);
  });

  it('leaves warnings of promo codes to the promo field', () => {
    const notices = [
      issue({
        code: 'DISCOUNT_CODE_REJECTED_MINIMUM',
        effect: 'CONTINUE',
        field: ['cartIntent', 'discountCodes', '0'],
      }),
    ];

    expect(
      collect({
        readiness: { canPlace: true, expired: false, blocking: [], notices },
      })
    ).toEqual([]);
  });

  it('shows nothing of an expired checkout but its renewal', () => {
    const banners = collect({
      renewal: 'renewing',
      undeliverableCount: 2,
      readiness: {
        canPlace: false,
        expired: true,
        blocking: [issue({})],
        notices: [issue({ effect: 'CONTINUE' })],
      },
      attempted: true,
    });

    expect(banners.map((banner) => banner.id)).toEqual(['renewing']);
  });

  it('counts the lines whose stock changed in one message the buyer can close', () => {
    const h = handlers();
    const notifications: Checkout.Notification[] = [
      {
        id: 'n1',
        code: 'OUT_OF_STOCK',
        severity: 'WARNING',
        isDismissed: false,
      },
      {
        id: 'n2',
        code: 'NOT_ENOUGH_STOCK',
        severity: 'WARNING',
        isDismissed: false,
      },
      {
        id: 'n3',
        code: 'ITEM_UNAVAILABLE',
        severity: 'WARNING',
        isDismissed: true,
      },
    ];
    const [banner] = collect({ notifications }, h);

    expect(banner).toMatchObject({
      tone: 'warning',
      title: `banner-stock-changed ${JSON.stringify({ count: 2 })}`,
    });
    banner.onDismiss?.();
    expect(h.dismiss).toHaveBeenCalledWith(banner.id);
    expect(collect({ notifications, dismissed: new Set([banner.id]) })).toEqual(
      []
    );
  });

  it('a failed save stays until it succeeds and leads to its section', () => {
    const h = handlers();
    const [banner] = collect(
      {
        saveErrors: [
          {
            key: 'contact',
            message: 'Contact not saved',
            sectionId: SectionId.Contact,
          },
        ],
      },
      h
    );

    expect(banner).toMatchObject({
      tone: 'critical',
      title: 'Contact not saved',
    });
    expect(banner.onDismiss).toBeUndefined();
    banner.action?.onClick?.(click);
    expect(h.focusSection).toHaveBeenCalledWith(SectionId.Contact);
  });
  it('a rejected placement can be closed and gives way to what blocks the order', () => {
    const h = handlers();
    const banners = collect(
      {
        attempted: true,
        placement: { name: 'rejected', code: 'CHECKOUT_NOT_READY_FOR_PLACEMENT' },
        missingSections: [SectionId.Delivery],
      },
      h
    );

    expect(banners.map((banner) => banner.priority)).toEqual([
      BannerPriority.Blocking,
      BannerPriority.Rejected,
    ]);
    expect(banners[1]).toMatchObject({
      tone: 'warning',
      title: 'placement-error-generic',
    });
    banners[1].onDismiss?.();
    expect(h.closePlacement).toHaveBeenCalled();
  });

  it('a placement rejected because the checkout is closed stays until the buyer leaves', () => {
    const [banner] = collect({
      placement: { name: 'rejected', code: 'CHECKOUT_EXPIRED' },
    });

    expect(banner).toMatchObject({
      priority: BannerPriority.Closed,
      tone: 'critical',
    });
    expect(banner.onDismiss).toBeUndefined();
  });

  it('a failed removal can be closed, since nothing is left unsaved', () => {
    const h = handlers();
    const [banner] = collect(
      {
        saveErrors: [
          {
            key: 'remove-address',
            message: 'Address not removed',
            sectionId: SectionId.Address,
            closable: true,
          },
        ],
      },
      h
    );

    expect(banner.tone).toBe('warning');
    banner.onDismiss?.();
    expect(h.closeSaveError).toHaveBeenCalledWith('remove-address');
  });

  it('says once that lines cannot be delivered', () => {
    const banners = collect({
      attempted: true,
      undeliverableCount: 2,
      readiness: {
        canPlace: false,
        expired: false,
        blocking: [
          issue({
            code: 'DELIVERY_OPTIONS_UNAVAILABLE',
            field: ['deliveryGroups', '1'],
          }),
        ],
        notices: [],
      },
    });

    expect(banners.map((banner) => banner.id)).toEqual(['undeliverable']);
  });

  it('keeps a closed warning closed when another one goes', () => {
    const loyalty = issue({
      code: 'LOYALTY_REDEMPTION_REDUCED',
      effect: 'CONTINUE',
      severity: 'WARNING',
      field: ['loyaltyPoints'],
    });
    const other = issue({
      code: 'APP_WARNING',
      effect: 'CONTINUE',
      severity: 'WARNING',
      field: ['attributes'],
    });
    const readiness = (notices: Checkout.Issue[]) => ({
      canPlace: true,
      expired: false,
      blocking: [],
      notices,
    });
    const [, closed] = collect({ readiness: readiness([other, loyalty]) });

    expect(
      collect({
        readiness: readiness([loyalty]),
        dismissed: new Set([closed.id]),
      })
    ).toEqual([]);
  });

  describe('loyalty', () => {
    const redemption: Checkout.LoyaltyRedemption = {
      source: 'POINTS',
      requestedPoints: '900',
      requestedAmount: null,
      points: '350',
      availablePoints: '1240',
      availableAmount: { amount: 124, currencyCode: 'UAH' },
      discount: { amount: 35, currencyCode: 'UAH' },
      expiresAt: null,
    };
    const loyaltyInput = (
      notices: Checkout.Issue[],
      blocking: Checkout.Issue[] = [],
      loyalty: Partial<BannerInput['loyalty']> = {}
    ) =>
      input({
        readiness: { canPlace: blocking.length === 0, expired: false, blocking, notices },
        loyalty: {
          redemption: null,
          selectedSource: null,
          reducedTo: null,
          busy: false,
          ...loyalty,
        },
      });

    it('says what a reduced redemption became and leads to the block', () => {
      const h = handlers();
      const [banner] = collectBanners(
        loyaltyInput(
          [
            issue({
              code: 'LOYALTY_REDEMPTION_REDUCED',
              effect: 'CONTINUE',
              severity: 'WARNING',
              field: ['loyaltyRedemption', 'points'],
            }),
          ],
          [],
          { redemption, reducedTo: '350 points' }
        ),
        h,
        t
      );

      expect(banner).toMatchObject({
        priority: BannerPriority.Change,
        tone: 'warning',
        title: 'loyalty-banner-reduced {"amount":"350 points"}',
        action: { label: 'loyalty-banner-go' },
      });
      expect(banner.onDismiss).toBeDefined();
      banner.action?.onClick?.(click);
      expect(h.focusSection).toHaveBeenCalledWith(SectionId.Loyalty);
    });

    it('says the order is too small when the reduction dropped the redemption', () => {
      const [banner] = collectBanners(
        loyaltyInput([
          issue({
            code: 'LOYALTY_REDEMPTION_REDUCED',
            effect: 'CONTINUE',
            severity: 'WARNING',
            field: ['loyaltyRedemption', 'points'],
          }),
        ]),
        handlers(),
        t
      );

      expect(banner.title).toBe('loyalty-banner-order-too-small');
      expect(banner.action).toBeUndefined();
    });

    it('offers to send the selection again when the loyalty service did not answer', () => {
      const h = handlers();
      const [banner] = collectBanners(
        loyaltyInput([
          issue({
            code: 'CHECKOUT_LOYALTY_UNAVAILABLE',
            effect: 'CONTINUE',
            severity: 'WARNING',
            retryable: true,
            field: ['loyaltyRedemption'],
          }),
        ]),
        h,
        t
      );

      expect(banner.title).toBe('loyalty-banner-unavailable');
      banner.action?.onClick?.(click);
      expect(h.refreshLoyalty).toHaveBeenCalled();
    });

    it('blocks at once, before the buyer presses the button, with a way out', () => {
      const h = handlers();
      const banners = collectBanners(
        loyaltyInput(
          [],
          [issue({ code: 'NO_AVAILABLE_POINTS', field: ['loyaltyRedemption'] })],
          { selectedSource: 'POINTS', busy: true }
        ),
        h,
        t
      );

      expect(banners).toHaveLength(1);
      expect(banners[0]).toMatchObject({
        priority: BannerPriority.Blocking,
        tone: 'action',
        title: 'loyalty-banner-points-insufficient',
        action: { label: 'loyalty-banner-without-points', loading: true },
      });
      expect(banners[0].onDismiss).toBeUndefined();
      banners[0].action?.onClick?.(click);
      expect(h.dropRedemption).toHaveBeenCalled();
    });

    it('names store credit for a source chosen last as store credit', () => {
      const [banner] = collectBanners(
        loyaltyInput(
          [],
          [issue({ code: 'REQUEST_EXCEEDS_AVAILABLE_AMOUNT', field: ['loyaltyRedemption'] })],
          { selectedSource: 'STORE_CREDIT' }
        ),
        handlers(),
        t
      );

      expect(banner).toMatchObject({
        title: 'loyalty-banner-store-credit-failed',
        action: { label: 'loyalty-banner-without-store-credit' },
      });
    });

    it('tells a reward that does not work for this order from one that is gone', () => {
      const h = handlers();
      const banners = collectBanners(
        loyaltyInput(
          [],
          [
            issue({ code: 'REWARD_DISCOUNT_NOT_APPLIED', field: ['loyaltyRedemption'] }),
            issue({ code: 'ENTITLEMENT_NOT_AVAILABLE', field: ['loyaltyRedemption'] }),
          ]
        ),
        h,
        t
      );

      expect(banners.map((banner) => banner.title)).toEqual([
        'loyalty-banner-reward-inactive',
        'loyalty-banner-reward-unavailable',
      ]);
      banners[0].action?.onClick?.(click);
      expect(h.dropReward).toHaveBeenCalled();
    });

    it('asks a guest to sign in', () => {
      const h = handlers();
      const [banner] = collectBanners(
        loyaltyInput([], [issue({ code: 'CUSTOMER_REQUIRED', field: ['loyaltyRedemption'] })]),
        h,
        t
      );

      expect(banner.title).toBe('loyalty-banner-sign-in');
      banner.action?.onClick?.(click);
      expect(h.signIn).toHaveBeenCalled();
    });

    it('keeps loyalty out of the section summary after the button was pressed', () => {
      const banners = collect({
        attempted: true,
        readiness: {
          canPlace: false,
          expired: false,
          blocking: [issue({ code: 'BELOW_MINIMUM_REDEMPTION', field: ['loyaltyRedemption'] })],
          notices: [],
        },
      });

      expect(banners.map((banner) => banner.title)).toEqual([
        'loyalty-banner-points-below-minimum',
      ]);
    });

    it('offers to refresh after a rejected loyalty reservation', () => {
      const h = handlers();
      const [banner] = collect(
        { placement: { name: 'rejected', code: 'LOYALTY_INSUFFICIENT_AVAILABLE_POINTS' } },
        h
      );

      expect(banner).toMatchObject({
        priority: BannerPriority.Rejected,
        title: 'placement-error-loyalty',
        action: { label: 'loyalty-banner-refresh' },
      });
      banner.action?.onClick?.(click);
      expect(h.refreshLoyalty).toHaveBeenCalled();
    });
  });
});
