'use client';

import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { VisuallyHidden } from '@shopana/storefront-ui';
import type { PasswordRulesProps } from '../AuthUIProvider';

/**
 * The rules of a new password under its field: a check or a cross by each once something is
 * typed, said in words to a screen reader too.
 */
export const DefaultPasswordRules = ({
  id,
  rules,
  className,
  style,
}: PasswordRulesProps) => {
  const t = useTranslations('Auth.common');
  const { styles, cx } = useStyles();
  return (
    <ul id={id} className={cx(styles.rules, className)} style={style}>
      {rules.map((rule) => (
        <li
          key={rule.key}
          className={cx(
            rule.state === 'passed' && styles.passed,
            rule.state === 'failed' && styles.failed
          )}
        >
          {rule.state === 'passed' ? <CheckOutlined aria-hidden /> : null}
          {rule.state === 'failed' ? <CloseOutlined aria-hidden /> : null}
          {rule.state === 'pending' ? null : (
            <VisuallyHidden>
              {rule.state === 'passed' ? t('rulePassed') : t('ruleFailed')}
            </VisuallyHidden>
          )}
          {rule.label}
        </li>
      ))}
    </ul>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  rules: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXXS}px;
    margin: ${token.marginXXS}px 0 0;
    padding: 0;
    list-style: none;
    font-size: ${token.fontSizeSM}px;
    line-height: ${token.lineHeightSM};
    color: ${token.colorTextSecondary};

    li {
      display: flex;
      align-items: center;
      gap: ${token.marginXS}px;
    }
  `,
  passed: css`
    color: ${token.colorSuccessText};
  `,
  failed: css`
    color: ${token.colorErrorText};
  `,
}));
