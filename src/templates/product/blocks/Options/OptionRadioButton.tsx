"use client";

import { OptionCard } from "@src/ui-kit/OptionCard";

interface OptionRadioButtonProps {
  selected: boolean;
  disabled?: boolean;
  onClick?: () => void;
  showRadio?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Universal button for Radio / Select type options.
 * Shows text and, if needed, radio indicator on the right.
 */
export const OptionRadioButton = ({
  selected,
  disabled,
  onClick,
  showRadio,
  className,
  children,
}: OptionRadioButtonProps) => {
  return (
    <OptionCard
      className={className}
      selected={selected}
      disabled={disabled}
      onClick={onClick}
      control={showRadio ? "radio" : undefined}
      size="large"
    >
      {children}
    </OptionCard>
  );
};
