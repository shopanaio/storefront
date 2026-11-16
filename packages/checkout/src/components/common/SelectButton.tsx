import { Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { SelectCard } from '#checkout/ui/SelectCard';

interface SelectButtonProps {
  /** Main text to display when value is selected */
  mainText?: string;
  /** Secondary text to display below main text (optional) */
  secondaryText?: string;
  /** Placeholder text when no value is selected; also the name of the field */
  placeholder: string;
  /** Whether a value is selected */
  hasValue: boolean;
  /** Optional icon to display in the card */
  icon?: ReactNode;
  /** If true, swap main and secondary text positions */
  invert?: boolean;
  /** The secondary text on one line and lighter, such as the schedule of a branch. */
  subtle?: boolean;
  onClick: () => void;
  disabled?: boolean;
  /** What the buyer has not filled in, shown under the card. */
  error?: string;
  className?: string;
}

/**
 * A value picked from a list (a Nova Poshta branch, a street) as a card with two-level text and
 * the select or change action on the right, like the contact and the city.
 */
export const SelectButton = ({
  mainText,
  secondaryText,
  placeholder,
  hasValue,
  icon,
  invert = false,
  subtle = false,
  onClick,
  disabled,
  error,
  className,
}: SelectButtonProps) => {
  const t = useTranslations('Checkout');
  const { styles, cx } = useStyles();

  return (
    <SelectCard
      label={placeholder}
      labelShown={!hasValue}
      icon={icon}
      selected={hasValue}
      action={hasValue ? t('change') : t('select')}
      onClick={onClick}
      disabled={disabled}
      error={error}
      className={cx(styles.card, className)}
    >
      {hasValue ? (
        // The top line is the label of the card, the bottom one is smaller.
        <Flex className={styles.flex}>
          {invert && secondaryText ? (
            <Typography.Text className={styles.topText} type="secondary">
              {secondaryText}
            </Typography.Text>
          ) : null}
          <Typography.Text
            className={invert ? styles.secondaryText : styles.topText}
            ellipsis
          >
            {mainText}
          </Typography.Text>
          {!invert && secondaryText ? (
            <Typography.Text
              className={cx(styles.secondaryText, subtle && styles.subtle)}
              type={subtle ? undefined : 'secondary'}
              ellipsis={subtle}
            >
              {secondaryText}
            </Typography.Text>
          ) : null}
        </Flex>
      ) : (
        <Typography.Text type="secondary">{placeholder}</Typography.Text>
      )}
    </SelectCard>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    card: css`
      min-height: 56px;
    `,
    flex: css`
      flex-direction: column;
      align-items: start;
    `,
    topText: css`
      max-width: 100% !important;
      font-size: ${token.fontSize}px;
    `,
    secondaryText: css`
      max-width: 100% !important;
      font-size: ${token.fontSizeSM}px;
    `,
    subtle: css`
      max-width: 100% !important;
      color: ${token.colorTextTertiary};
    `,
  };
});
