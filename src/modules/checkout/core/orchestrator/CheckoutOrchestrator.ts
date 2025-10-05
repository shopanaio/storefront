/**
 * CheckoutOrchestrator: subscribes to checkoutBus events and routes them to CheckoutRepository.
 * Emits operation lifecycle events for UI to reflect busy state.
 */
import { onCheckoutEvent, emitCheckoutEvent } from '@src/modules/checkout/state/checkoutBus';
import type { CheckoutEvents } from '@src/modules/checkout/state/checkoutBus';
import type { SubmitCheckoutDto } from '@src/modules/checkout/core/contracts/dto';
import type { SectionKey, InflightKey } from '@src/modules/checkout/state/checkoutBus';
import type { CheckoutRepository } from '@src/modules/checkout/core/contracts/CheckoutRepository';
import { InflightManager } from '@src/modules/checkout/core/orchestrator/InflightManager';

function getSectionKeyFromInflightKey(key: InflightKey): SectionKey | undefined {
  if (key === 'identity') return 'contact';
  if (key === 'recipient') return 'recipient';
  if (key === 'address') return 'address';
  if (key === 'payment') return 'payment';
  if (key === 'promo') return 'promo';
  if (key === 'note') return 'comment';
  if (key.startsWith('shipping:')) return key as unknown as SectionKey;
  return undefined;
}

function makeShippingKey(groupId: string): InflightKey { return `shipping:${groupId}`; }

function extractErrorInfo(error: unknown): { message?: string; code?: string } {
  const anyErr = error as { message?: unknown; code?: unknown } | null | undefined;
  const message = typeof anyErr?.message === 'string' ? anyErr?.message : undefined;
  const code = typeof anyErr?.code === 'string' ? anyErr?.code : undefined;
  return { message, code };
}

export class CheckoutOrchestrator {
  private inflight = new InflightManager<InflightKey>();
  private offFns: Array<() => void> = [];

  constructor(private readonly deps: { checkoutId: string; repository: CheckoutRepository }) {}

  start(): void {
    const { checkoutId, repository } = this.deps;

    // section valid
    const offSectionValid = onCheckoutEvent('section/valid', ({ sectionId, dto }) => {
      switch (sectionId) {
        case 'contact': {
          const payload = dto as { userPhone?: string } | null;
          if (!payload?.userPhone) return;
          const key: InflightKey = 'identity';
          this.inflight.schedule(key, () => {
            void this.inflight.runWithInflight(key, async () => {
              try {
                await repository.updateCustomerIdentity({ checkoutId, phone: String(payload.userPhone) });
              } catch (error) {
                const { message, code } = extractErrorInfo(error);
                await emitCheckoutEvent('operation/error', {
                  key,
                  sectionId: getSectionKeyFromInflightKey(key) as SectionKey,
                  message,
                  code,
                  error,
                });
              }
            }, {
              onStart: () => emitCheckoutEvent('operation/start', { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
              onEnd: () => emitCheckoutEvent('operation/end', { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
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
                await repository.updateCustomerIdentity({ checkoutId, phone: String(payload.userPhone) });
              } catch (error) {
                const { message, code } = extractErrorInfo(error);
                await emitCheckoutEvent('operation/error', {
                  key,
                  sectionId: getSectionKeyFromInflightKey(key) as SectionKey,
                  message,
                  code,
                  error,
                });
              }
            }, {
              onStart: () => emitCheckoutEvent('operation/start', { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
              onEnd: () => emitCheckoutEvent('operation/end', { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
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
                await repository.updateCustomerNote({ checkoutId, note: comment });
              } catch (error) {
                const { message, code } = extractErrorInfo(error);
                await emitCheckoutEvent('operation/error', {
                  key,
                  sectionId: getSectionKeyFromInflightKey(key) as SectionKey,
                  message,
                  code,
                  error,
                });
              }
            }, {
              onStart: () => emitCheckoutEvent('operation/start', { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
              onEnd: () => emitCheckoutEvent('operation/end', { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
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
                await repository.addPromoCode({ checkoutId, code });
              } catch (error) {
                const { message, code: errCode } = extractErrorInfo(error);
                await emitCheckoutEvent('operation/error', {
                  key,
                  sectionId: getSectionKeyFromInflightKey(key) as SectionKey,
                  message,
                  code: errCode,
                  error,
                });
              }
            }, {
              onStart: () => emitCheckoutEvent('operation/start', { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
              onEnd: () => emitCheckoutEvent('operation/end', { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
            });
          });
          return;
        }
        default:
          return;
      }
    });

    // payment selected
    const offPayment = onCheckoutEvent('method/payment-selected', ({ code }) => {
      if (!code) return;
      const key: InflightKey = 'payment';
      this.inflight.schedule(key, () => {
        void this.inflight.runWithInflight(key, async () => {
          try {
            await repository.selectPaymentMethod({ checkoutId, method: { code, data: undefined } });
          } catch (error) {
            const { message, code: errCode } = extractErrorInfo(error);
            await emitCheckoutEvent('operation/error', {
              key,
              sectionId: getSectionKeyFromInflightKey(key) as SectionKey,
              message,
              code: errCode,
              error,
            });
          }
        }, {
          onStart: () => emitCheckoutEvent('operation/start', { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
          onEnd: () => emitCheckoutEvent('operation/end', { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
        });
      });
    });

    // shipping selected
    const offShipping = onCheckoutEvent('method/shipping-selected', ({ groupId, code }) => {
      if (!groupId || !code) return;
      const key = makeShippingKey(groupId);
      this.inflight.schedule(key, () => {
        void this.inflight.runWithInflight(key, async () => {
          try {
            await repository.selectShippingMethod({ checkoutId, deliveryGroupId: groupId, method: { code, data: undefined } });
          } catch (error) {
            const { message, code: errCode } = extractErrorInfo(error);
            await emitCheckoutEvent('operation/error', {
              key,
              sectionId: getSectionKeyFromInflightKey(key) as SectionKey,
              message,
              code: errCode,
              error,
            });
          }
        }, {
          onStart: () => emitCheckoutEvent('operation/start', { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
          onEnd: () => emitCheckoutEvent('operation/end', { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
        });
      });
    });

    // promo invalid → remove current code must be sent by section in future; kept for now
    const offPromoInvalid = onCheckoutEvent('section/invalid', ({ sectionId, dto }) => {
      if (sectionId !== 'promo') return;
      const code = (dto as { code?: string } | null)?.code;
      if (!code) return;
      const key: InflightKey = 'promo';
      this.inflight.schedule(key, () => {
        void this.inflight.runWithInflight(key, async () => {
          try {
            await repository.removePromoCode({ checkoutId, code });
          } catch (error) {
            const { message, code: errCode } = extractErrorInfo(error);
            await emitCheckoutEvent('operation/error', {
              key,
              sectionId: getSectionKeyFromInflightKey(key) as SectionKey,
              message,
              code: errCode,
              error,
            });
          }
        }, {
          onStart: () => emitCheckoutEvent('operation/start', { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
          onEnd: () => emitCheckoutEvent('operation/end', { key, sectionId: getSectionKeyFromInflightKey(key) as SectionKey }),
        });
      });
    });

    // submit ready -> submit via repository if available
    const offSubmit = onCheckoutEvent('submit/ready', ({ payload }) => {
      if (!repository.submitCheckout) return;
      const key: InflightKey = 'note'; // reuse a neutral key or introduce 'submit'
      this.inflight.schedule(key, () => {
        void this.inflight.runWithInflight(key, async () => {
          try {
            await (repository.submitCheckout as (args: { checkoutId: string; payload: SubmitCheckoutDto }) => Promise<void>)({ checkoutId, payload: payload as SubmitCheckoutDto });
            // success
            const completedPayload: CheckoutEvents['submit/completed'] = {};
            await emitCheckoutEvent('submit/completed', completedPayload);
          } catch (error) {
            const { message, code } = extractErrorInfo(error);
            await emitCheckoutEvent('operation/error', { key, message, code, error });
          }
        }, {
          onStart: () => emitCheckoutEvent('operation/start', { key }),
          onEnd: () => {
            emitCheckoutEvent('operation/end', { key }).catch(() => {});
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
