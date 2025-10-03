'use client';

import { Button, Flex, Input, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { TbPencil } from 'react-icons/tb';

export const RecipientComment = () => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const form = useFormContext();
  const [isOpen, setIsOpen] = useState(Boolean(form.watch('orderComment')));

  const value: string = form.watch('orderComment') ?? '';

  const onToggle = () => setIsOpen((prev) => !prev);

  return (
    <Flex vertical gap={8} className={styles.container}>
      {isOpen ? (
        <div className={styles.fieldWrap}>
          <Typography.Text className={styles.label}>
            {t('order-comment')}
          </Typography.Text>
          <Input.TextArea
            autoSize={{ minRows: 5, maxRows: 8 }}
            placeholder={t('order-comment-placeholder')}
            value={value}
            maxLength={255}
            onChange={(e) => form.setValue('orderComment', e.target.value)}
          />
        </div>
      ) : (
        <Button
          type="link"
          className={styles.toggle}
          onClick={onToggle}
          icon={<TbPencil size={18} />}
        >
          {t('add-comment')}
        </Button>
      )}
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    margin-top: ${token.marginXS}px;
  `,
  toggle: css`
    padding: 0;
    align-self: flex-start;
  `,
  fieldWrap: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXXS}px;
  `,
  label: css`
    color: ${token.colorTextSecondary};
  `,
}));

export default RecipientComment;
