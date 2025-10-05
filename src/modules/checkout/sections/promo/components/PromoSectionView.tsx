'use client';

import { useState, useEffect } from 'react';
import { Button, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';
import { TbTicket } from 'react-icons/tb';

/**
 * View component for the checkout promo section.
 *
 * Pure UI component that renders the promo code form and manages local input state.
 */
export interface PromoSectionViewProps {
  /** Initial promo code value (from applied promo codes) */
  initialCode: string;
  /** Label for the promo code input */
  label: string;
  /** Text for the apply button */
  applyText: string;
  /** Text for the remove button */
  removeText: string;
  /** Called when user applies promo code */
  onApply: (code: string) => void;
  /** Called when user removes promo code */
  onRemove: () => void;
}

export const PromoSectionView = ({
  initialCode,
  label,
  applyText,
  removeText,
  onApply,
  onRemove,
}: PromoSectionViewProps) => {
  const { styles } = useStyles();
  const [code, setCode] = useState(initialCode);
  const [isApplied, setIsApplied] = useState(Boolean(initialCode));

  // Sync local state when initialCode changes (e.g., after successful apply/remove)
  useEffect(() => {
    setCode(initialCode);
    setIsApplied(Boolean(initialCode));
  }, [initialCode]);

  const handleApply = () => {
    const trimmedCode = code.trim();
    if (trimmedCode) {
      onApply(trimmedCode);
      setIsApplied(true);
    }
  };

  const handleRemove = () => {
    setCode('');
    setIsApplied(false);
    onRemove();
  };

  return (
    <Flex vertical gap={8} className={styles.container}>
      <FloatingLabelInput
        label={label}
        value={code}
        prefix={<TbTicket size={20} />}
        onChange={(e) => setCode((e.target as HTMLInputElement).value)}
        disabled={isApplied}
        suffix={
          <Button
            disabled={!code.trim() || isApplied}
            onClick={(e) => {
              e.preventDefault();
              handleApply();
            }}
          >
            {applyText}
          </Button>
        }
      />
      {isApplied && code ? (
        <div>
          <Button type="link" onClick={handleRemove}>
            {removeText}
          </Button>
        </div>
      ) : null}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default PromoSectionView;
