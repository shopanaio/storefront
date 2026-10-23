'use client';

import { Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { LegalProps } from '@shopana/storefront-auth/ui';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { PolicyModal } from './PolicyModal';
import type { PolicyModalPolicy } from './PolicyModal';
import { PolicyLink } from './TermsNotice';

/**
 * The consent under the sign-in field in the checkout, the same as the notice under the submit
 * button: the store's privacy policy (from the disclosures) opens over the checkout.
 */
export const AuthConsent = ({ className, style }: LegalProps) => {
  const t = useTranslations('Auth.common');
  const { checkout } = useCheckoutData();
  const [policy, setPolicy] = useState<PolicyModalPolicy | null>(null);
  const privacy = checkout?.disclosures?.parts.find(
    (part): part is Extract<typeof part, { kind: 'policy' }> =>
      part.kind === 'policy' && part.policyType === 'PRIVACY_POLICY'
  );
  return (
    <>
      <Typography.Text type="secondary" className={className} style={style}>
        {t.rich('legal', {
          privacy: (chunks) =>
            privacy ? (
              <PolicyLink policy={privacy} onOpen={setPolicy}>
                {chunks}
              </PolicyLink>
            ) : (
              chunks
            ),
        })}
      </Typography.Text>
      <PolicyModal policy={policy} onClose={() => setPolicy(null)} />
    </>
  );
};

/** What the checkout changes in the sign-in: its consent, linked like its own notice. */
export const CHECKOUT_AUTH_COMPONENTS = { Legal: AuthConsent };
