'use client';

import { useState } from 'react';
import { DefaultLegal, type LegalProps } from '@shopana/storefront-auth/ui';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { PolicyModal } from './PolicyModal';
import type { PolicyModalPolicy } from './PolicyModal';
import { PolicyLink } from './PolicyLink';

/**
 * The consent under the sign-in field in the checkout: the sign-in's own `DefaultLegal`, whose
 * privacy policy (from the disclosures) opens over the checkout, as in the notice under the
 * submit button. Without that policy in the disclosures it links `links.privacy`, as by
 * default.
 */
export const AuthConsent = (props: LegalProps) => {
  const { checkout } = useCheckoutData();
  const [policy, setPolicy] = useState<PolicyModalPolicy | null>(null);
  const privacy = checkout?.disclosures?.parts.find(
    (part): part is Extract<typeof part, { kind: 'policy' }> =>
      part.kind === 'policy' && part.policyType === 'PRIVACY_POLICY'
  );
  return (
    <>
      <DefaultLegal
        {...props}
        renderPrivacyLink={
          privacy
            ? (chunks) => (
                <PolicyLink policy={privacy} onOpen={setPolicy}>
                  {chunks}
                </PolicyLink>
              )
            : undefined
        }
      />
      <PolicyModal policy={policy} onClose={() => setPolicy(null)} />
    </>
  );
};
