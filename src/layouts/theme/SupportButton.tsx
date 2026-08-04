import React from 'react';
import { useTranslations } from 'next-intl';
import { Phone } from 'lucide-react';
import { HeaderLinkButton } from './HeaderLinkButton';
import { mq } from '@src/ui-kit/Theme/breakpoints';
import { createStyles } from 'antd-style';
import clsx from 'clsx';
import { Divider } from 'antd';

type SupportButtonProps = {
  mobileBlock?: boolean;
  className?: string;
  iconSize?: number;
  iconColor?: string;
  phoneNumber?: string;
  showTextOnDesktop?: boolean;
  showDivider?: boolean;
};

export const SupportButton: React.FC<SupportButtonProps> = ({
  mobileBlock = true,
  className,
  iconSize = 24,
  iconColor = 'currentColor',
  phoneNumber = '+1 (999) 111-11-11',
  showTextOnDesktop = true,
  showDivider = true,
}) => {
  const t = useTranslations('Header');
  const { styles } = useStyles();

  return (
    <>
      <HeaderLinkButton
        icon={<Phone size={iconSize} color={iconColor} />}
        topText={t('customer-support')}
        bottomText={phoneNumber}
        mobileBlock={mobileBlock}
        className={clsx(styles.button, className)}
        showTextOnDesktop={showTextOnDesktop}
      />
      {showDivider && (
        <Divider
          orientation="vertical"
          style={{
            height: 32,
            marginInline: 4,
            borderColor: 'var(--header-search-border)',
          }}
        />
      )}
    </>
  );
};

const useStyles = createStyles(({ css }) => ({
  button: css`
    display: none;
    ${mq.xl} {
      display: flex;
    }

    & + * {
      display: none;
      ${mq.xl} {
        display: block;
      }
    }
  `,
}));
