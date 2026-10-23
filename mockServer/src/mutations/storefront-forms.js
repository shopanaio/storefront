import { gid } from '../fixture-helpers.js';

const userError = (code, message, field = null) => ({ code, message, field });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164 = /^\+[1-9]\d{7,14}$/;

/**
 * Buyer forms without delivery: the newsletter confirmation link is printed to the console
 * as a `[mock-marketing]` line and any token confirms; call-back requests are kept in memory.
 */
export const storefrontFormMutations = (store) => ({
  marketingSubscribe: (_, { input }) =>
    store.replay('marketingSubscribe', input.idempotencyKey, () => {
      const email = String(input.email ?? '').trim();
      if (!EMAIL.test(email))
        return {
          result: null,
          userErrors: [
            userError('INVALID_EMAIL', 'Enter a valid email address.', [
              'input',
              'email',
            ]),
          ],
        };
      const token = `mock-${store.next('marketingToken')}`;
      console.log(
        `[mock-marketing] confirm ${email}: /newsletter/confirm?token=${token}`
      );
      return { result: 'PENDING_CONFIRMATION', userErrors: [] };
    }),
  marketingSubscriptionConfirm: (_, { input }) =>
    String(input.token ?? '').trim()
      ? { result: 'SUBSCRIBED', userErrors: [] }
      : {
          result: null,
          userErrors: [
            userError('INVALID_TOKEN', 'The link is not valid.', [
              'input',
              'token',
            ]),
          ],
        },
  contactRequestCreate: (_, { input }) =>
    store.replay('contactRequestCreate', input.idempotencyKey, () => {
      if (!E164.test(String(input.phone ?? '')))
        return {
          contactRequest: null,
          userErrors: [
            userError('INVALID_PHONE', 'Enter a valid phone number.', [
              'input',
              'phone',
            ]),
          ],
        };
      if (input.disclosureVersion !== contactRequestDisclosureVersion)
        return {
          contactRequest: null,
          userErrors: [
            userError(
              'DISCLOSURES_CHANGED',
              'The privacy notice has changed.',
              ['input', 'disclosureVersion']
            ),
          ],
        };
      return {
        contactRequest: {
          id: gid('ContactRequest', `runtime-${store.next('contactRequest')}`),
          createdAt: store.now(),
        },
        userErrors: [],
      };
    }),
  customerMediaUpload: () => ({
    media: null,
    userErrors: [
      userError(
        'INTERNAL_ERROR',
        'Customer media uploads are not emulated by the mock server.'
      ),
    ],
  }),
});

export const contactRequestDisclosureVersion = 'mock-1';

/** The call-back form; null without a published privacy policy, as in the Contact Requests App. */
export const contactRequestForm = (store) => {
  const policy = store.state.storePolicies.find(
    ({ type }) => type === 'PRIVACY_POLICY'
  );
  if (!policy) return null;
  return {
    nameMaxLength: 100,
    messageMaxLength: 1000,
    disclosure: {
      version: contactRequestDisclosureVersion,
      text: 'We use your phone number only to call you back. See {privacyPolicy}.',
      policies: [
        {
          type: policy.type,
          title: policy.title,
          path: `/policies/${policy.handle}`,
        },
      ],
    },
  };
};
