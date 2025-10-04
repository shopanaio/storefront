'use client';

import { Button, Flex, Input, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { TbPencil } from 'react-icons/tb';

export const RecipientComment = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const [isOpen, setIsOpen] = useState(Boolean(value));

  const onToggle = () => setIsOpen((prev) => !prev);

  return (
    <Flex vertical gap={8} className={styles.container}>
      {isOpen ? (
        <div className={styles.fieldWrap}>
          <Typography.Text className={styles.label} id="order-comment-label">
            {t('order-comment')}
          </Typography.Text>
          <Input.TextArea
            id="order-comment"
            aria-labelledby="order-comment-label"
            placeholder={t('order-comment-placeholder')}
            value={value}
            rows={4}
            maxLength={255}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : (
        <Button
          type="link"
          className={styles.toggle}
          onClick={onToggle}
          icon={<TbPencil size={18} />}
          aria-expanded={false}
          aria-label={t('add-comment')}
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
