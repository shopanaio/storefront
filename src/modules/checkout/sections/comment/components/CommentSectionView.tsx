'use client';

import { useState, useEffect } from 'react';
import { Button, Flex, Input, Typography } from 'antd';
import { createStyles } from 'antd-style';
import type { ReactNode } from 'react';

/**
 * View component for the checkout comment section.
 *
 * Pure UI component that renders an optional order comment field and manages
 * local state. Container provides initial value and change handler.
 */
export interface CommentSectionViewProps {
  /** Initial comment value (from checkout data) */
  initialComment: string;
  /** Label shown above the textarea */
  label: ReactNode;
  /** Placeholder for the textarea */
  placeholder: ReactNode;
  /** Button label for opening the comment field */
  addCommentText: ReactNode;
  /** Called when user changes textarea content */
  onChange: (value: string) => void;
}

export const CommentSectionView = ({
  initialComment,
  label,
  placeholder,
  addCommentText,
  onChange,
}: CommentSectionViewProps) => {
  const { styles } = useStyles();

  const [comment, setComment] = useState(initialComment);
  const [isOpen, setIsOpen] = useState(Boolean(initialComment));

  // Sync local state when initialComment changes (e.g., loaded from checkout data)
  useEffect(() => {
    setComment(initialComment);
    if (initialComment) {
      setIsOpen(true);
    }
  }, [initialComment]);

  const onToggle = () => setIsOpen((prev) => !prev);

  const handleChange = (value: string) => {
    setComment(value);
    onChange(value);
  };

  return (
    <Flex vertical gap={8} className={styles.container}>
      {isOpen ? (
        <div className={styles.fieldWrap}>
          <Typography.Text className={styles.label} id="order-comment-label">
            {label}
          </Typography.Text>
          <Input.TextArea
            id="order-comment"
            aria-labelledby="order-comment-label"
            placeholder={String(placeholder)}
            value={comment}
            rows={4}
            maxLength={255}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      ) : (
        <Button
          type="link"
          className={styles.toggle}
          onClick={onToggle}
          aria-expanded={false}
          aria-label={String(addCommentText)}
        >
          {addCommentText}
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

export default CommentSectionView;
