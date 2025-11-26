import { Button, Flex, Popover, Radio } from "antd";
import React, { useState } from "react";

export interface SortOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SortPopoverProps<T> {
  options: SortOption<T>[];
  value: T;
  onChange: (value: T) => void;
  loading?: boolean;
  buttonClassName?: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  buttonStyle?: React.CSSProperties;
}

export function SortPopover<T extends string | number = string>({
  options,
  value,
  onChange,
  loading,
  buttonClassName,
  title,
  icon,
  buttonStyle,
}: SortPopoverProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      placement="bottom"
      title={title}
      trigger="click"
      open={open}
      onOpenChange={() => setOpen((prev) => !prev)}
      content={
        <Flex vertical gap={8}>
          {options.map((option) => (
            <Flex
              key={option.value}
              align="center"
              gap={8}
              onClick={() => {
                if (!option.disabled) {
                  onChange(option.value);
                  setOpen(false);
                }
              }}
              style={{
                cursor: option.disabled ? "not-allowed" : "pointer",
                background: value === option.value ? "transparent" : undefined,
              }}
            >
              <Radio checked={value === option.value} disabled={option.disabled} />
              {option.label}
            </Flex>
          ))}
        </Flex>
      }
    >
      <Button
        type="text"
        className={buttonClassName}
        loading={loading}
        icon={icon}
        style={buttonStyle}
      >
        {options.find((option) => option.value === value)?.label}
      </Button>
    </Popover>
  );
}
