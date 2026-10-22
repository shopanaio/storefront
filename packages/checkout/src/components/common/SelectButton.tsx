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
  onClick: () => void;
  disabled?: boolean;
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
  onClick,
  disabled,
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
      className={cx(styles.card, className)}
    >
      {hasValue ? (
        <Flex className={cx(styles.flex, invert && styles.invert)}>
          <Typography.Text className={styles.mainText} ellipsis>
            {mainText}
          </Typography.Text>
          {secondaryText && (
            <Typography.Text className={styles.secondaryText} type="secondary">
              {secondaryText}
            </Typography.Text>
          )}
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
      gap: ${token.marginXXS}px;
    `,
    invert: css`
      flex-direction: column-reverse;
    `,
    mainText: css`
      max-width: 100% !important;
      line-height: 1;
      font-size: ${token.fontSize}px;
    `,
    secondaryText: css`
      font-size: ${token.fontSizeSM}px;
      line-height: 1;
    `,
  };
});
