'use client';

import { Flex, Input, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useForm, FormProvider } from 'react-hook-form';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';

/**
 * Comment section: optional order comment field.
 * Publishes valid with current comment value (may be empty string).
 */
export const CommentSection = () => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const methods = useForm<{ orderComment: string }>({
    defaultValues: { orderComment: '' },
    mode: 'onChange',
  });
  const { publishValid } = useSectionController('comment', { required: false });

  const value: string = methods.watch('orderComment') ?? '';

  const handleChange = (next: string) => {
    methods.setValue('orderComment', next);
    publishValid({ comment: next });
  };

  return (
    <FormProvider {...methods}>
      <Flex vertical gap={8} className={styles.container}>
        <Typography.Text className={styles.label} id="order-comment-label">
          {t('order-comment')}
        </Typography.Text>
        <Input.TextArea
          id="order-comment"
          aria-labelledby="order-comment-label"
          placeholder={t('order-comment-placeholder')}
          value={value}
          rows={6}
          maxLength={255}
          onChange={(e) => handleChange(e.target.value)}
        />
      </Flex>
    </FormProvider>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    margin-top: ${token.marginXS}px;
  `,
  label: css`
    color: ${token.colorTextSecondary};
  `,
}));

export default CommentSection;
