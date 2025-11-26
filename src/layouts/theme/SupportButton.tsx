import React from 'react';
import { useTranslations } from 'next-intl';
import { TbPhone } from 'react-icons/tb';
import { HeaderLinkButton } from './HeaderLinkButton';
import { mq } from '@src/components/Theme/breakpoints';
import { createStyles } from 'antd-style';
import clsx from 'clsx';
import { Divider } from 'antd';

type SupportButtonProps = {
  mobileBlock?: boolean;
  className?: string;
  iconSize?: number;
};

export const SupportButton: React.FC<SupportButtonProps> = ({
  mobileBlock = true,
  className,
  iconSize = 24,
}) => {
  const t = useTranslations('Header');
  const { styles } = useStyles();

  return (
    <>
      <HeaderLinkButton
        icon={<TbPhone size={iconSize} />}
        topText={t('customer-support')}
        bottomText={'+1 (999) 111-11-11'}
        mobileBlock={mobileBlock}
        className={clsx(styles.button, className)}
      />
      <Divider
        orientation="vertical"
        style={{
          height: 32,
          marginInline: 4,
        }}
      />
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
