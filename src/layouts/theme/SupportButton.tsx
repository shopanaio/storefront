import React from 'react';
import { useTranslations } from 'next-intl';
import { Phone } from 'lucide-react';
import { HeaderLinkButton } from './HeaderLinkButton';
import { mq } from '@src/ui-kit/Theme/breakpoints';
import { createStyles } from 'antd-style';
import clsx from 'clsx';
import type { HeaderTextBreakpoint } from './HeaderSection.types';

type SupportButtonProps = {
  className?: string;
  iconSize?: number;
  iconColor?: string;
  phoneNumber?: string;
  href?: string;
  showTextFrom?: HeaderTextBreakpoint;
};

export const SupportButton: React.FC<SupportButtonProps> = ({
  className,
  iconSize = 24,
  iconColor = 'currentColor',
  phoneNumber = '+1 (999) 111-11-11',
  href = 'tel:+19991111111',
  showTextFrom = 'xl',
}) => {
  const t = useTranslations('Header');
  const { styles } = useStyles();

  return (
    <HeaderLinkButton
      icon={<Phone size={iconSize} color={iconColor} />}
      topText={t('customer-support')}
      bottomText={phoneNumber}
      href={href}
      className={clsx(styles.button, className)}
      showTextFrom={showTextFrom}
    />
  );
};

const useStyles = createStyles(({ css }) => ({
  button: css`
    display: none;

    ${mq.xl} {
      display: flex;
    }
  `,
}));
