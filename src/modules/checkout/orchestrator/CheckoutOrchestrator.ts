/**
 * CheckoutOrchestrator: subscribes to checkoutBus events and routes them to CheckoutApi.
 * Emits operation lifecycle events for UI to reflect busy state.
 */
import { onCheckoutEvent, emitCheckoutEvent, CheckoutEvent } from '@src/modules/checkout/state/checkoutBus';
import type { CheckoutEvents } from '@src/modules/checkout/state/checkoutBus';
import type { SectionKey, InflightKey } from '@src/modules/checkout/state/checkoutBus';
import type { CheckoutApi } from '@src/modules/checkout/api/interface';
import type { ApiCreateOrderInput } from '@codegen/schema-client';
import { InflightManager } from '@src/modules/checkout/core/orchestrator/InflightManager';

function getSectionKeyFromInflightKey(key: InflightKey): SectionKey | undefined {
  if (key === 'identity') return 'contact';
  if (key === 'recipient') return 'recipient';
  if (key === 'address') return 'address';
  if (key === 'delivery') return 'delivery';
  if (key === 'payment') return 'payment';
  if (key === 'promo') return 'promo';
  if (key === 'note') return 'comment';
  return undefined;
}

function makeDeliveryKey(_groupId: string): InflightKey { return 'delivery'; }

function extractErrorInfo(error: unknown): { message?: string; code?: string } {
  const anyErr = error as { message?: unknown; code?: unknown } | null | undefined;
  const message = typeof anyErr?.message === 'string' ? anyErr?.message : undefined;
  const code = typeof anyErr?.code === 'string' ? anyErr?.code : undefined;
  return { message, code };
}

export class CheckoutOrchestrator {
  private inflight = new InflightManager<InflightKey>();
  private offFns: Array<() => void> = [];

  constructor(private readonly deps: { checkoutId: string; api: CheckoutApi }) {}

  start(): void {
    const { checkoutId, api } = this.deps;

    // section valid
    const offSectionValid = onCheckoutEvent(CheckoutEvent.SectionValid, ({ sectionId, dto }) => {
      switch (sectionId) {
        case 'contact': {
          const payload = dto as { userPhone?: string } | null;
          if (!payload?.userPhone) return;
          const key: InflightKey = 'identity';
          this.inflight.schedule(key, () => {
            void this.inflight.runWithInflight(key, async () => {
              try {
                await api.updateCustomerIdentity({ checkoutId, phone: String(payload.userPhone) });
              } catch (error) {
                const { message, code } = extractErrorInfo(error);
                await emitCheckoutEvent(CheckoutEvent.OperationError, {
                  key,
                  sectionId: getSectionKeyFromInflightKey(key) as SectionKey,
                  message,
                  code,
                  error,
                });
              }
            }, {
              onStart: () => emitCheckoutEvent(CheckoutEvent.OperationStart, { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
              onEnd: () => emitCheckoutEvent(CheckoutEvent.OperationEnd, { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
            });
          });
          return;
        }
        case 'recipient': {
          const payload = dto as { self?: boolean; userPhone?: string } | null;
          if (!payload || payload.self === true || !payload.userPhone) return;
          const key: InflightKey = 'recipient';
          this.inflight.schedule(key, () => {
            void this.inflight.runWithInflight(key, async () => {
              try {
                await api.updateCustomerIdentity({ checkoutId, phone: String(payload.userPhone) });
              } catch (error) {
                const { message, code } = extractErrorInfo(error);
                await emitCheckoutEvent(CheckoutEvent.OperationError, {
                  key,
                  sectionId: getSectionKeyFromInflightKey(key) as SectionKey,
                  message,
                  code,
                  error,
                });
              }
            }, {
              onStart: () => emitCheckoutEvent(CheckoutEvent.OperationStart, { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
              onEnd: () => emitCheckoutEvent(CheckoutEvent.OperationEnd, { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
            });
          });
          return;
        }
        case 'address': {
          // Address stored locally for submit; no-op for now
          return;
        }
        case 'comment': {
          const payload = dto as { comment?: string } | null;
          const comment = payload?.comment ?? '';
          const key: InflightKey = 'note';
          this.inflight.schedule(key, () => {
            void this.inflight.runWithInflight(key, async () => {
              try {
                await api.updateCustomerNote({ checkoutId, note: comment });
              } catch (error) {
                const { message, code } = extractErrorInfo(error);
                await emitCheckoutEvent(CheckoutEvent.OperationError, {
                  key,
                  sectionId: getSectionKeyFromInflightKey(key) as SectionKey,
                  message,
                  code,
                  error,
                });
              }
            }, {
              onStart: () => emitCheckoutEvent(CheckoutEvent.OperationStart, { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
              onEnd: () => emitCheckoutEvent(CheckoutEvent.OperationEnd, { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
            });
          }, 250);
          return;
        }
        case 'promo': {
          const code = (dto as { code?: string } | null)?.code;
          if (!code) return;
          const key: InflightKey = 'promo';
          this.inflight.schedule(key, () => {
            void this.inflight.runWithInflight(key, async () => {
              try {
                await api.addPromoCode({ checkoutId, code });
              } catch (error) {
                const { message, code: errCode } = extractErrorInfo(error);
                await emitCheckoutEvent(CheckoutEvent.OperationError, {
                  key,
                  sectionId: getSectionKeyFromInflightKey(key) as SectionKey,
                  message,
                  code: errCode,
                  error,
                });
              }
            }, {
              onStart: () => emitCheckoutEvent(CheckoutEvent.OperationStart, { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
              onEnd: () => emitCheckoutEvent(CheckoutEvent.OperationEnd, { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
            });
          });
          return;
        }
        default:
          return;
      }
    });

    // payment selected
    const offPayment = onCheckoutEvent(CheckoutEvent.MethodPaymentSelected, ({ code }) => {
      if (!code) return;
      const key: InflightKey = 'payment';
      this.inflight.schedule(key, () => {
        void this.inflight.runWithInflight(key, async () => {
          try {
            await api.selectPaymentMethod({ checkoutId, method: { code, data: undefined } });
          } catch (error) {
            const { message, code: errCode } = extractErrorInfo(error);
            await emitCheckoutEvent(CheckoutEvent.OperationError, {
              key,
              sectionId: getSectionKeyFromInflightKey(key) as SectionKey,
              message,
              code: errCode,
              error,
            });
          }
        }, {
          onStart: () => emitCheckoutEvent(CheckoutEvent.OperationStart, { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
          onEnd: () => emitCheckoutEvent(CheckoutEvent.OperationEnd, { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
        });
      });
    });

    // delivery selected
    const offShipping = onCheckoutEvent(CheckoutEvent.MethodDeliverySelected, ({ groupId, code }) => {
      if (!groupId || !code) return;
      const key = makeDeliveryKey(groupId);
      this.inflight.schedule(key, () => {
        void this.inflight.runWithInflight(key, async () => {
          try {
            await api.selectDeliveryMethod({ checkoutId, deliveryGroupId: groupId, method: { code, data: undefined } });
          } catch (error) {
            const { message, code: errCode } = extractErrorInfo(error);
            await emitCheckoutEvent(CheckoutEvent.OperationError, {
              key,
              sectionId: getSectionKeyFromInflightKey(key) as SectionKey,
              message,
              code: errCode,
              error,
            });
          }
        }, {
          onStart: () => emitCheckoutEvent(CheckoutEvent.OperationStart, { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
          onEnd: () => emitCheckoutEvent(CheckoutEvent.OperationEnd, { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
        });
      });
    });

    // promo invalid → remove current code must be sent by section in future; kept for now
    const offPromoInvalid = onCheckoutEvent(CheckoutEvent.SectionInvalid, ({ sectionId, dto }) => {
      if (sectionId !== 'promo') return;
      const code = (dto as { code?: string } | null)?.code;
      if (!code) return;
      const key: InflightKey = 'promo';
      this.inflight.schedule(key, () => {
        void this.inflight.runWithInflight(key, async () => {
          try {
            await api.removePromoCode({ checkoutId, code });
          } catch (error) {
            const { message, code: errCode } = extractErrorInfo(error);
            await emitCheckoutEvent(CheckoutEvent.OperationError, {
              key,
              sectionId: getSectionKeyFromInflightKey(key) as SectionKey,
              message,
              code: errCode,
              error,
            });
          }
        }, {
          onStart: () => emitCheckoutEvent(CheckoutEvent.OperationStart, { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
          onEnd: () => emitCheckoutEvent(CheckoutEvent.OperationEnd, { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
        });
      });
    });

    // submit ready -> submit via repository if available
    const offSubmit = onCheckoutEvent(CheckoutEvent.SubmitReady, ({ payload }) => {
      if (!api.submitCheckout) return;
      const key: InflightKey = 'note'; // reuse a neutral key or introduce 'submit'
      this.inflight.schedule(key, () => {
        void this.inflight.runWithInflight(key, async () => {
          try {
            await (api.submitCheckout as (args: { checkoutId: string; payload: SubmitCheckoutDto }) => Promise<void>)({ checkoutId, payload: payload as SubmitCheckoutDto });
            // success
            const completedPayload: CheckoutEvents[CheckoutEvent.SubmitCompleted] = {};
            await emitCheckoutEvent(CheckoutEvent.SubmitCompleted, completedPayload);
          } catch (error) {
            const { message, code } = extractErrorInfo(error);
            await emitCheckoutEvent(CheckoutEvent.OperationError, { key, message, code, error });
          }
        }, {
          onStart: () => emitCheckoutEvent(CheckoutEvent.OperationStart, { key }),
          onEnd: () => {
            emitCheckoutEvent(CheckoutEvent.OperationEnd, { key }).catch(() => {});
          },
        });
      });
    });

    this.offFns.push(offSectionValid, offPayment, offShipping, offPromoInvalid, offSubmit);
  }

  stop(): void {
    for (const off of this.offFns.splice(0)) off();
    this.inflight.cancelAll();
  }
}
