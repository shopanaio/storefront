'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { Button, Flex, Radio, Switch, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { OptionWave } from '#checkout/ui/OptionWave';
import { selectedDeclarations } from '#checkout/ui/selected';
import { useLocale, useTranslations } from 'next-intl';
import { TbAlertCircle } from 'react-icons/tb';
import type { model } from '@shopana/storefront-sdk';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import { FloatingLabelInput } from '@shopana/storefront-ui';
import { formatMoney } from '#checkout/ui/Money';
import type { Checkout } from '#checkout/types/entity';
import type { RedemptionRequest } from '../selection';
import { usePointsLabel } from '../format';
import {
  checkRedemptionInput,
  isAtMaximum,
  parseRedemptionInput,
  reachesMaximum,
  redemptionBounds,
  type AmountError,
} from '../bounds';

const NONE = 'NONE';

interface RedemptionPartProps {
  /** Sources the buyer can pay with, the selected one included. */
  options: Checkout.LoyaltySourceOption[];
  redemption: Checkout.LoyaltyRedemption | null;
  /** Source chosen but not applied: the checkout issue says why, in the banner. */
  failedSource: Checkout.LoyaltySource | null;
  /**
   * The order total fell below the program minimum: nothing is redeemed and no source can be
   * chosen until the order grows; the saved source applies again then.
   */
  orderTooSmall: boolean;
  currencyCode: string;
  /**
   * The balance is shown above, in the header of the account: the sources do not repeat it.
   * Without the header (an account no longer active) each source says its balance.
   */
  balanceShown: boolean;
}

/**
 * Paying a part of the order with points or store credit. One source: a switch; both: a choice
 * between them and "do not use". The maximum is applied first; the buyer may then enter an
 * amount, sent by the button or Enter. Totals change only with the answer of the checkout.
 */
export const RedemptionPart = ({
  options,
  redemption,
  failedSource,
  orderTooSmall,
  currencyCode,
  balanceShown,
}: RedemptionPartProps) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const { setLoyaltyRedemption } = useCheckoutApi();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const selected = orderTooSmall ? null : (redemption?.source ?? failedSource);
  const switchId = useId();
  // The amount field belongs to one source: another source starts without it.
  useEffect(() => {
    setEditing(false);
  }, [selected]);

  const choose = useCallback(
    async (request: RedemptionRequest | null) => {
      setBusy(true);
      try {
        await setLoyaltyRedemption(request);
        setEditing(false);
      } catch {
        // The banner reports the failure; the block shows the checkout as it is.
      } finally {
        setBusy(false);
      }
    },
    [setLoyaltyRedemption]
  );
  const chooseMaximum = (source: Checkout.LoyaltySource) =>
    choose(source === 'POINTS' ? { source, points: null } : { source, amount: null });

  const details = (option: Checkout.LoyaltySourceOption) => (
    <RedemptionDetails
      option={option}
      redemption={redemption?.source === option.source ? redemption : null}
      failed={failedSource === option.source && redemption?.source !== option.source}
      busy={busy}
      editing={editing}
      currencyCode={currencyCode}
      onEdit={() => setEditing(true)}
      onMaximum={() => void chooseMaximum(option.source)}
      onSubmit={(request) => choose(request)}
    />
  );

  if (options.length === 1) {
    const [option] = options;
    const on = selected === option.source;
    return (
      <Flex vertical gap={4} className={styles.root}>
        <Flex align="center" justify="space-between" gap={12}>
          <label htmlFor={switchId} className={styles.title}>
            {t(
              option.source === 'POINTS'
                ? 'loyalty-redeem-points'
                : 'loyalty-redeem-store-credit'
            )}
          </label>
          <Switch
            id={switchId}
            checked={on}
            loading={busy}
            disabled={orderTooSmall}
            onChange={(checked) =>
              void (checked ? chooseMaximum(option.source) : choose(null))
            }
          />
        </Flex>
        {on ? (
          details(option)
        ) : (
          <OptionSummary
            option={option}
            orderTooSmall={orderTooSmall}
            balanceShown={balanceShown}
          />
        )}
      </Flex>
    );
  }

  return (
    <Flex vertical gap={8} className={styles.root}>
      <Typography.Text className={styles.title}>{t('loyalty-source-title')}</Typography.Text>
      <Radio.Group
        value={selected ?? NONE}
        disabled={busy}
        onChange={(event) => {
          const value = event.target.value as Checkout.LoyaltySource | typeof NONE;
          void (value === NONE ? choose(null) : chooseMaximum(value));
        }}
        className={styles.radios}
      >
        {options.map((option) => {
          const on = selected === option.source;
          return (
            <OptionWave key={option.source} disabled={on || busy || orderTooSmall}>
              <div className={styles.option} data-selected={on || undefined}>
                <Radio
                  value={option.source}
                  disabled={orderTooSmall}
                  className={styles.radio}
                >
                  <Flex vertical>
                    <span>
                      {t(
                        option.source === 'POINTS'
                          ? 'loyalty-source-points'
                          : 'loyalty-source-store-credit'
                      )}
                    </span>
                    {on ? null : (
                      <OptionSummary
                        option={option}
                        orderTooSmall={orderTooSmall}
                        balanceShown={balanceShown}
                        short
                      />
                    )}
                  </Flex>
                </Radio>
                {on ? <div className={styles.optionBody}>{details(option)}</div> : null}
              </div>
            </OptionWave>
          );
        })}
        <OptionWave disabled={selected === null || busy}>
          <div className={styles.option} data-selected={selected === null || undefined}>
            <Radio value={NONE} className={styles.radio}>
              {t('loyalty-source-none')}
            </Radio>
          </div>
        </OptionWave>
      </Radio.Group>
    </Flex>
  );
};

/** Balance of a source that is not selected. */
const OptionSummary = ({
  option,
  orderTooSmall,
  balanceShown,
  short = false,
}: {
  option: Checkout.LoyaltySourceOption;
  orderTooSmall: boolean;
  balanceShown: boolean;
  short?: boolean;
}) => {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const { styles } = useStyles();
  const points = usePointsLabel();
  const balance =
    option.source === 'POINTS' && option.availablePoints !== null
      ? points(option.availablePoints)
      : formatMoney(locale, option.availableAmount);
  if (!orderTooSmall && balanceShown) return null;
  return (
    <Typography.Text type="secondary" className={styles.note}>
      {orderTooSmall
        ? t('loyalty-order-too-small')
        : short
          ? balance
          : t('loyalty-available', { balance })}
    </Typography.Text>
  );
};

interface RedemptionDetailsProps {
  option: Checkout.LoyaltySourceOption;
  /** The applied redemption of this source. */
  redemption: Checkout.LoyaltyRedemption | null;
  failed: boolean;
  busy: boolean;
  editing: boolean;
  currencyCode: string;
  onEdit: () => void;
  onMaximum: () => void;
  onSubmit: (request: RedemptionRequest) => Promise<void>;
}

const RedemptionDetails = ({
  option,
  redemption,
  failed,
  busy,
  editing,
  currencyCode,
  onEdit,
  onMaximum,
  onSubmit,
}: RedemptionDetailsProps) => {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const { styles } = useStyles();
  const points = usePointsLabel();
  const money = (amount: model.Money) => formatMoney(locale, amount);

  if (editing) {
    return (
      <AmountField
        option={option}
        redemption={redemption}
        currencyCode={currencyCode}
        busy={busy}
        onMaximum={onMaximum}
        onSubmit={onSubmit}
      />
    );
  }
  if (redemption) {
    const maximum = isAtMaximum(option, redemption);
    return (
      <>
        <span>
          {redemption.source === 'POINTS' && redemption.points !== null
            ? t('loyalty-redeemed-points', {
                points: points(redemption.points),
                amount: money(redemption.discount),
              })
            : t('loyalty-redeemed-amount', { amount: money(redemption.discount) })}
        </span>
        <Typography.Text type="secondary" className={styles.note}>
          {maximum ? `${t('loyalty-redeemed-maximum')} ` : null}
          <LinkButton onClick={onEdit} disabled={busy}>
            {t('loyalty-change-amount')}
          </LinkButton>
          {maximum ? null : (
            <>
              {' · '}
              <LinkButton onClick={onMaximum} disabled={busy}>
                {t('loyalty-use-maximum')}
              </LinkButton>
            </>
          )}
        </Typography.Text>
      </>
    );
  }
  if (busy) {
    return (
      <Typography.Text type="secondary" className={styles.note}>
        {t('loyalty-applying')}
      </Typography.Text>
    );
  }
  if (failed) {
    return (
      <Typography.Text type="danger" className={styles.note}>
        <Flex align="center" gap={6}>
          <TbAlertCircle size={14} aria-hidden="true" />
          {t(
            option.source === 'POINTS'
              ? 'loyalty-points-not-applied'
              : 'loyalty-store-credit-not-applied'
          )}
        </Flex>
      </Typography.Text>
    );
  }
  return null;
};

const AmountField = ({
  option,
  redemption,
  currencyCode,
  busy,
  onMaximum,
  onSubmit,
}: {
  option: Checkout.LoyaltySourceOption;
  redemption: Checkout.LoyaltyRedemption | null;
  currencyCode: string;
  busy: boolean;
  onMaximum: () => void;
  onSubmit: (request: RedemptionRequest) => Promise<void>;
}) => {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const { styles } = useStyles();
  const points = usePointsLabel();
  const bounds = redemptionBounds(option, redemption);
  // The field starts with what is applied now: the amount the buyer chose, or the maximum.
  const applied = redemption
    ? option.source === 'POINTS'
      ? (redemption.points ?? '')
      : String(redemption.discount.amount)
    : '';
  const [draft, setDraft] = useState(applied);
  const [error, setError] = useState<AmountError | null>(null);
  const label = (value: string) =>
    option.source === 'POINTS'
      ? points(value)
      : formatMoney(locale, { amount: Number(value), currencyCode });

  const submit = () => {
    const value = parseRedemptionInput(option.source, draft);
    if (busy) return;
    // An amount over the most allowed is not an error: the most allowed is applied instead.
    if (value !== null && reachesMaximum(option.source, value, bounds)) {
      setError(null);
      onMaximum();
      return;
    }
    const problem = checkRedemptionInput(option.source, value, bounds);
    setError(problem);
    if (problem || value === null) return;
    void onSubmit(
      option.source === 'POINTS'
        ? { source: 'POINTS', points: value }
        : { source: 'STORE_CREDIT', amount: value }
    );
  };

  const errorText = !error
    ? undefined
    : error.code === 'too-large'
      ? t('loyalty-amount-too-large', { max: label(error.max) })
      : error.code === 'too-small'
        ? t('loyalty-amount-too-small', { min: label(error.min) })
        : t('loyalty-amount-invalid');

  return (
    <Flex vertical gap={8} className={styles.amount}>
      <FloatingLabelInput
        label={t(
          option.source === 'POINTS' ? 'loyalty-amount-points' : 'loyalty-amount-money'
        )}
        value={draft}
        inputMode={option.source === 'POINTS' ? 'numeric' : 'decimal'}
        error={errorText}
        onChange={(event) => {
          setDraft((event.target as HTMLInputElement).value);
          setError(null);
        }}
        onPressEnter={(event) => {
          event.preventDefault();
          submit();
        }}
        suffix={
          <Button
            disabled={!draft.trim()}
            loading={busy}
            onClick={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            {t('apply')}
          </Button>
        }
      />
      <Typography.Text type="secondary" className={styles.note}>
        {bounds.max !== null
          ? `${t('loyalty-amount-range', { min: label(bounds.min), max: label(bounds.max) })} `
          : null}
        <LinkButton onClick={onMaximum} disabled={busy}>
          {t('loyalty-use-maximum')}
        </LinkButton>
      </Typography.Text>
    </Flex>
  );
};

const LinkButton = ({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: string;
}) => {
  const { styles } = useStyles();
  return (
    <button type="button" className={styles.link} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  root: css`
    padding: ${token.paddingSM}px ${token.padding}px;
    border-top: 1px solid ${token.colorBorder};
  `,
  title: css`
    font-weight: 500;
  `,
  amount: css`
    /* Apart from the title above: the field is a step of its own. */
    margin-top: ${token.marginXS}px;
  `,
  note: css`
    font-size: ${token.fontSizeSM}px;
    line-height: ${token.lineHeightSM};
  `,
  radios: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  option: css`
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};

    &[data-selected] {
      ${selectedDeclarations(token)}
    }
  `,
  radio: css`
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 48px;
    padding: 6px ${token.padding}px;
    box-sizing: border-box;
  `,
  optionBody: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
    /* The radio group sets no font of its own for what is not a radio. */
    font-size: ${token.fontSize}px;
    line-height: ${token.lineHeight};
    padding: 0 ${token.padding}px ${token.paddingSM}px 44px;
  `,
  link: css`
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: ${token.colorPrimary};
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;

    &:disabled {
      cursor: default;
      opacity: 0.65;
    }
  `,
}));
