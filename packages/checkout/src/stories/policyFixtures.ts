import type { StorePolicy } from '#checkout/hooks/useStorePolicy';
import type { Checkout } from '#checkout/types/entity';

/** Published store policies the mock API serves to the policy modal. */
export const storePolicies: StorePolicy[] = [
  {
    handle: 'terms-of-service',
    title: 'Terms of Service',
    path: '/policies/terms-of-service',
    html:
      '<p>These terms apply to every order placed in the store.</p>' +
      '<h2>Orders</h2>' +
      '<p>An order is accepted once we confirm it by email or SMS.</p>' +
      '<h2>Delivery</h2>' +
      '<ul><li>Nova Poshta branches and parcel lockers.</li><li>Courier to the door.</li></ul>' +
      '<p>Questions: <a href="mailto:hello@example.com">hello@example.com</a>.</p>',
  },
  {
    handle: 'privacy-policy',
    title: 'Privacy Policy',
    path: '/policies/privacy-policy',
    html:
      '<p>We use your name, phone and address only to deliver the order and to contact you about it.</p>' +
      '<p>We never sell personal data.</p>',
  },
];

const part = (policyType: string, handle: string): Checkout.DisclosurePart => {
  const policy = storePolicies.find((item) => item.handle === handle)!;
  return {
    kind: 'policy',
    policyType,
    handle: policy.handle,
    title: policy.title,
    path: policy.path,
  };
};

const parts: Checkout.DisclosurePart[] = [
  { kind: 'text', text: 'By placing your order, you agree to the ' },
  part('TERMS_OF_SERVICE', 'terms-of-service'),
  { kind: 'text', text: ' and acknowledge the ' },
  part('PRIVACY_POLICY', 'privacy-policy'),
  { kind: 'text', text: '.' },
];

/** The notice under the submit button: placing the order is the acceptance. */
export const noticeDisclosures: Checkout.Disclosures = {
  version: 'disclosures-notice-v1',
  acceptanceMode: 'NOTICE',
  parts,
};

/** The required checkbox labelled with the same notice. */
export const checkboxDisclosures: Checkout.Disclosures = {
  version: 'disclosures-checkbox-v1',
  acceptanceMode: 'CHECKBOX',
  parts,
};
