'use client';

import { useEffect, useState } from 'react';
import { Checkbox, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { CheckoutEvent, onCheckoutEvent } from '#checkout/state/checkoutBus';
import {
  isTermsAccepted,
  useTermsState,
  useTermsStore,
} from '#checkout/state/terms/termsStore';
import { TERMS_ANCHOR } from '#checkout/ui/focusAnchor';
import type { Checkout } from '#checkout/types/entity';
import { PolicyModal } from './PolicyModal';
import type { PolicyModalPolicy } from './PolicyModal';
import { PolicyLink } from './PolicyLink';

const { Text } = Typography;

/** The notice in reading order: text as is, policies as links that open the policy. */
const DisclosureParts = ({
  parts,
  onOpen,
}: {
  parts: Checkout.DisclosurePart[];
  onOpen: (policy: PolicyModalPolicy) => void;
}) => (
  <>
    {parts.map((part, index) =>
      part.kind === 'text' ? (
        <span key={index}>{part.text}</span>
      ) : (
        <PolicyLink key={index} policy={part} onOpen={onOpen}>
          {part.title}
        </PolicyLink>
      )
    )}
  </>
);

/**
 * The notice the buyer accepts by placing the order (NOTICE mode), under the submit button.
 * Nothing when the store links no published policy.
 */
export const TermsNotice = () => {
  const { checkout } = useCheckoutData();
  const [policy, setPolicy] = useState<PolicyModalPolicy | null>(null);
  const disclosures = checkout?.disclosures;
  if (!disclosures || disclosures.acceptanceMode !== 'NOTICE') return null;
  return (
    <>
      <Text type="secondary" id={TERMS_ANCHOR}>
        <DisclosureParts parts={disclosures.parts} onOpen={setPolicy} />
      </Text>
      <PolicyModal policy={policy} onClose={() => setPolicy(null)} />
    </>
  );
};

/**
 * The required checkbox labelled with the notice (CHECKBOX mode), next to the submit button.
 * It starts unticked for every checkout and every version of the disclosures; the tick stays
 * in the browser and goes with the order, where the server checks it again.
 */
export const TermsCheckbox = () => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const { checkout } = useCheckoutData();
  const { key, accepted, error } = useTermsState(checkout);
  const [policy, setPolicy] = useState<PolicyModalPolicy | null>(null);
  const setAccepted = useTermsStore((state) => state.setAccepted);
  const require = useTermsStore((state) => state.require);
  const disclosures = checkout?.disclosures;
  const shown = disclosures?.acceptanceMode === 'CHECKBOX' && key !== null;

  // A press of the button with the box unticked shows the error, also when other sections
  // stop the order first.
  useEffect(() => {
    if (!shown || !key) return;
    return onCheckoutEvent(CheckoutEvent.SubmitRequested, () => {
      if (!isTermsAccepted(checkout)) require(key);
    });
  }, [shown, key, checkout, require]);

  if (!shown || !disclosures || !key) return null;
  const errorId = `${TERMS_ANCHOR}-error`;
  return (
    <div id={TERMS_ANCHOR} className={styles.checkbox}>
      <Checkbox
        checked={accepted}
        onChange={(event) => setAccepted(key, event.target.checked)}
        aria-invalid={error}
        aria-describedby={error ? errorId : undefined}
      >
        <DisclosureParts parts={disclosures.parts} onOpen={setPolicy} />
      </Checkbox>
      {error ? (
        <Text type="danger" id={errorId} role="alert" className={styles.error}>
          {t('terms-required')}
        </Text>
      ) : null}
      {/* Outside the label: nothing in the policy ticks the box. */}
      <PolicyModal policy={policy} onClose={() => setPolicy(null)} />
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  checkbox: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXXS}px;
  `,
  error: css`
    padding-inline-start: ${token.controlInteractiveSize + token.paddingXS}px;
  `,
}));
