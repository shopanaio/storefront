import { Button, ButtonProps, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ReactNode } from 'react';

interface SelectButtonProps extends Omit<ButtonProps, 'children' | 'icon'> {
  /**
   * Main text to display when value is selected
   */
  mainText?: string;
  /**
   * Secondary text to display below main text (optional)
   */
  secondaryText?: string;
  /**
   * Placeholder text when no value is selected
   */
  placeholder: string;
  /**
   * Whether a value is selected
   */
  hasValue: boolean;
  /**
   * Optional icon to display in the button
   */
  icon?: ReactNode;
  /**
   * If true, swap main and secondary text positions
   */
  invert?: boolean;
}

/**
 * Reusable select button component with two-level text layout
 */
export const SelectButton = ({
  mainText,
  secondaryText,
  placeholder,
  hasValue,
  icon,
  invert = false,
  className,
  ...buttonProps
}: SelectButtonProps) => {
  const { styles, cx } = useStyles();

  return (
    <Button
      color="default"
      variant="outlined"
      className={cx(styles.button, className)}
      icon={icon}
      {...buttonProps}
    >
      {hasValue ? (
        <Flex className={cx(styles.flex, invert && styles.invert)}>
          <Typography.Text className={styles.mainText}>
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
    </Button>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    button: css`
      display: flex;
      justify-content: start;
      padding: ${token.paddingXXS}px ${token.paddingLG}px ${token.paddingXXS}px
        ${token.paddingSM}px;
      min-height: 64px;
      height: 100%;
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
      max-width: 300px !important;
      line-height: 1;
      font-size: ${token.fontSize}px;
    `,
    secondaryText: css`
      font-size: ${token.fontSizeSM}px;
      line-height: 1;
    `,
  };
});
