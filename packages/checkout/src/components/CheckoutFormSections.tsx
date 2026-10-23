'use client';

import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { mq } from '@shopana/storefront-ui';
import { SectionRenderer } from '#checkout/infra/SectionRenderer';
import { CheckoutSection } from '#checkout/components/common/CheckoutSection';
import { SectionId } from '#checkout/state/interface';
import { useCheckoutTheme } from '#checkout/theme';
import { CHECKOUT_FORM_ID, sectionAnchor } from '#checkout/ui/focusAnchor';
import { CheckoutAuth } from './CheckoutAuth';
import { AccountDataNotice } from './AccountDataNotice';
import { CheckoutActions } from './submit/CheckoutActions';
import { SectionIssues } from './notices/SectionIssues';

export interface CheckoutFormSectionsProps {
  onSubmit: (e: React.FormEvent) => void;
  /** Below lg the order comment goes to the summary, over the totals. */
  stacked: boolean;
}

/**
 * The form of the checkout in the left column: contact, delivery with its recipient, payment,
 * the order comment beside the summary and, on desktop, the actions. With customer accounts
 * (`theme.customerAccountsEnabled`) "Log in" is next to the contact title.
 */
export const CheckoutFormSections = ({
  onSubmit,
  stacked,
}: CheckoutFormSectionsProps) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const { customerAccountsEnabled, slots } = useCheckoutTheme();
  const { afterContact: AfterContact, beforeActions: BeforeActions } = slots;
  return (
    <form id={CHECKOUT_FORM_ID} className={styles.form} onSubmit={onSubmit}>
      <CheckoutSection
        id={sectionAnchor(SectionId.Contact)}
        title={t('contact')}
        // "Log in" is taller than the title and already leaves room under it.
        titleGap={6}
        headerAction={
          customerAccountsEnabled ? (
            <CheckoutAuth className={styles.logInButton} />
          ) : undefined
        }
      >
        <SectionRenderer slug={SectionId.Contact} />
        {customerAccountsEnabled ? <AccountDataNotice /> : null}
        <SectionIssues sections={[SectionId.Contact]} />
      </CheckoutSection>

      {AfterContact ? <AfterContact /> : null}

      <CheckoutSection
        id={sectionAnchor(SectionId.Delivery)}
        title={t('delivery')}
      >
        <SectionRenderer slug={SectionId.Address} />
        <SectionRenderer slug={SectionId.Delivery} />
        <SectionIssues sections={[SectionId.Address, SectionId.Delivery]} />
        {/* Part of the delivery block: who receives it, a little apart from the methods. */}
        <div className={styles.recipient}>
          <CheckoutSection id={sectionAnchor(SectionId.Recipient)}>
            <SectionRenderer slug={SectionId.Recipient} />
            <SectionIssues sections={[SectionId.Recipient]} />
          </CheckoutSection>
        </div>
      </CheckoutSection>

      <CheckoutSection
        id={sectionAnchor(SectionId.Payment)}
        title={t('payment')}
      >
        <SectionRenderer slug={SectionId.Payment} />
        <SectionIssues sections={[SectionId.Payment]} />
      </CheckoutSection>

      {stacked ? null : <CommentSection />}

      <div className={styles.actions}>
        {BeforeActions ? <BeforeActions /> : null}
        <CheckoutActions />
      </div>
    </form>
  );
};

/** The order comment: in the form column on desktop, in the summary on a phone. */
export const CommentSection = () => (
  <CheckoutSection id={sectionAnchor(SectionId.Comment)}>
    <SectionRenderer slug={SectionId.Comment} />
    <SectionIssues sections={[SectionId.Comment]} />
  </CheckoutSection>
);

const useStyles = createStyles(({ css, token }) => ({
  // The sections are the blocks of the column, spaced by it.
  form: css`
    display: contents;
  `,
  // On desktop the actions sit right in the form column, so their panel can be sticky in it.
  actions: css`
    display: none;
    ${mq.lg} {
      display: contents;
    }
  `,
  recipient: css`
    margin-top: ${token.marginXS}px;
  `,
  logInButton: css`
    padding: 0;
  `,
}));
