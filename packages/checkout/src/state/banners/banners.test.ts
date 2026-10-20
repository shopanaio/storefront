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
  ...overrides,
});

const handlers = (): BannerHandlers => ({
  retryRenewal: vi.fn(),
  closeRenewal: vi.fn(),
  retryPlacement: vi.fn(),
  closePlacement: vi.fn(),
  closeSaveError: vi.fn(),
  goHome: vi.fn(),
  openCart: vi.fn(),
  focusSection: vi.fn(),
  focusSummary: vi.fn(),
  dismiss: vi.fn(),
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
    banner.action?.onClick?.();
    expect(h.retryPlacement).toHaveBeenCalled();
  });

  it('an order placed elsewhere leaves the checkout through the home page', () => {
    const h = handlers();
    const [banner] = collect(
      { placement: { name: 'rejected', code: 'CHECKOUT_ALREADY_PLACED' } },
      h
    );

    expect(banner.priority).toBe(BannerPriority.Closed);
    banner.action?.onClick?.();
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
    banners[0].action?.onClick?.();
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
            code: 'LOYALTY_POINTS_REDUCED',
            effect: 'CONTINUE',
            severity: 'WARNING',
          }),
        ],
      },
    });

    expect(banners.map((banner) => banner.title)).toEqual([
      'issue-check-order',
      'issue-loyalty-points-reduced',
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
    banner.action?.onClick?.();
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
      code: 'LOYALTY_POINTS_REDUCED',
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
});
