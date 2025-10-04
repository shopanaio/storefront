'use client';

import { Button, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';
import { TbTicket } from 'react-icons/tb';

export function PromoForm({ code, label, applyText, removeText, onChange, onSubmit, onRemove }: {
  code: string;
  label: string;
  applyText: string;
  removeText: string;
  onChange: (next: string) => void;
  onSubmit: (code: string) => void;
  onRemove: (code: string) => void;
}) {
  const { styles } = useStyles();
  return (
    <Flex vertical gap={8} className={styles.container}>
      <FloatingLabelInput
        label={label}
        value={code}
        prefix={<TbTicket size={20} />}
        onChange={(e) => onChange((e.target as HTMLInputElement).value)}
        suffix={
          <Button
            disabled={!code}
            onClick={(e) => {
              e.preventDefault();
              onSubmit(code);
            }}
          >
            {applyText}
          </Button>
        }
      />
      {code ? (
        <div>
          <Button type="link" onClick={() => onRemove(code)}>{removeText}</Button>
        </div>
      ) : null}
    </Flex>
  );
}

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));
